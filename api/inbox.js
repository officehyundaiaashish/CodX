const Imap = require('imap');
const { simpleParser } = require('mailparser');

const IMAP_HOST = 'imap.rediffmail.com';
const IMAP_PORT = 993;

function fetchInbox(email, password, limit) {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email, password,
      host: IMAP_HOST, port: IMAP_PORT,
      tls: true, tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000, connTimeout: 15000
    });
    imap.once('error', err => reject(new Error('IMAP: ' + err.message)));
    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) { imap.end(); return reject(new Error('Cannot open INBOX: ' + err.message)); }
        const total = box.messages.total;
        if (total === 0) { imap.end(); return resolve([]); }
        const start = Math.max(1, total - limit + 1);
        const f = imap.seq.fetch(start + ':' + total, {
          bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT'],
          markSeen: false
        });
        const mails = [], pending = [];
        f.on('message', (msg, seqno) => {
          const mail = { id: 'msg_' + seqno, seqno, unread: false };
          let hBuf = '', tBuf = '';
          msg.on('body', (stream, info) => {
            let buf = '';
            stream.on('data', c => buf += c.toString('utf8'));
            stream.once('end', () => { if (info.which.startsWith('HEADER')) hBuf = buf; else tBuf += buf; });
          });
          msg.once('attributes', a => { mail.unread = !a.flags.includes('\\Seen'); });
          msg.once('end', () => {
            const p = simpleParser(hBuf + '\r\n\r\n' + tBuf).then(parsed => {
              mail.from    = parsed.from?.text || '';
              mail.subject = parsed.subject    || '(no subject)';
              mail.date    = parsed.date       || new Date();
              mail.time    = formatTime(mail.date);
              mail.replyTo = parsed.from?.value?.[0]?.address || '';
              mail.body    = parsed.text || (parsed.html||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
              mails.push(mail);
            }).catch(() => mails.push({ ...mail, from:'?', subject:'(parse error)', body:'', time:'?' }));
            pending.push(p);
          });
        });
        f.once('error', err => { imap.end(); reject(new Error('Fetch: ' + err.message)); });
        f.once('end', () => Promise.all(pending).then(() => {
          imap.end();
          resolve(mails.sort((a, b) => new Date(b.date) - new Date(a.date)));
        }));
      });
    });
    imap.connect();
  });
}

function formatTime(date) {
  try {
    const d = new Date(date), now = new Date(), mins = Math.floor((now - d) / 60000);
    if (mins < 1)     return 'Just now';
    if (mins < 60)    return mins + 'm ago';
    if (mins < 1440)  return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    if (mins < 2880)  return 'Yesterday';
    if (mins < 10080) return d.toLocaleDateString([], { weekday:'short' });
    return d.toLocaleDateString([], { day:'numeric', month:'short' });
  } catch { return ''; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, pass, limit } = req.body || {};
  if (!email || !pass) return res.status(400).json({ error: 'email and pass required' });
  try {
    const mails = await fetchInbox(email, pass, parseInt(limit) || 40);
    res.status(200).json(mails);
  } catch (err) {
    const msg = err.message.includes('AUTHENTICATIONFAILED') || err.message.includes('Invalid credentials')
      ? 'Wrong email or password. Enable IMAP in RediffMail settings first.'
      : err.message;
    res.status(401).json({ error: msg });
  }
};
