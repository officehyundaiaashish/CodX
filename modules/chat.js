    // ── Chat state ──
    let _chatHistory = [];          // { role, text, time, edits, files, msgId }
    let _chatSessionName = 'New Chat';
    let _chatMsgCounter = 0;
    let _chatPendingEditsMap = {};  // msgId → edits array (for per-message apply)

    // ── Auto-generate session name from first user message ──
    function _autoChatName(text) {
        const words = text.trim().split(/\s+/).slice(0, 5).join(' ');
        return words.length > 32 ? words.slice(0, 32) + '…' : words;
    }

    // ── Close the chat panel ──
    function closeChatPanel() {
        document.getElementById('agent-chat-overlay').classList.remove('active');
        document.getElementById('agent-chat-panel').classList.remove('active');
    }

    // ── Rename the session ──
    function renameChatSession() {
        cdPrompt('Rename Chat', 'Give this chat a name:', _chatSessionName, (name) => {
            if (!name) return;
            _chatSessionName = name.trim();
            document.getElementById('chat-session-label').textContent = _chatSessionName;
        });
    }

    // ── Update file selector inside chat panel ──
    function _updateChatFileSelector() {
        const wrap = document.getElementById('agent-chat-file-selector');
        const sel  = document.getElementById('agent-chat-file-select');
        if (!wrap || !sel) return;
        if (fileTabs.length <= 1) { wrap.style.display = 'none'; return; }
        wrap.style.display = 'block';
        sel.innerHTML = '';
        fileTabs.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id; opt.textContent = t.name;
            if (t.id === activeTabId) opt.selected = true;
            sel.appendChild(opt);
        });
        _agentTargetTabId = activeTabId;
    }

    // ── Format timestamp ──
    function _chatTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // ── Scroll messages to bottom ──
    function _chatScrollBottom() {
        const box = document.getElementById('agent-chat-messages');
        if (box) requestAnimationFrame(() => { box.scrollTop = box.scrollHeight; });
    }

    // ── Append a message bubble ──
    function _appendChatMsg(role, text, time, extraEl) {
        const box = document.getElementById('agent-chat-messages');
        const empty = document.getElementById('chat-empty-state');
        if (empty) empty.remove();

        const wrap = document.createElement('div');
        wrap.className = 'chat-msg ' + role;

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        // Preserve embedded SVG icons while escaping other HTML
        const _svgFrags = [];
        const _safeText = text
            .replace(/<svg[\s\S]*?<\/svg>/g, (m) => { _svgFrags.push(m); return '\x00SVG' + (_svgFrags.length - 1) + '\x00'; })
            .replace(/\n/g, '<br>')
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/&lt;br&gt;/g,'<br>')
            .replace(/\x00SVG(\d+)\x00/g, (_, i) => _svgFrags[+i] || '');
        bubble.innerHTML = _safeText;

        // Footer: timestamp + copy button
        const footer = document.createElement('div');
        footer.className = 'chat-msg-footer';

        const ts = document.createElement('div');
        ts.className = 'chat-time';
        ts.textContent = time || _chatTime();

        const copyBtn = document.createElement('button');
        copyBtn.className = 'chat-copy-btn';
        copyBtn.innerHTML = '<span class="material-icons-round">content_copy</span>';
        copyBtn.title = 'Copy';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<span class="material-icons-round">check</span>';
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = '<span class="material-icons-round">content_copy</span>';
                }, 1500);
            });
        };

        footer.appendChild(ts);
        footer.appendChild(copyBtn);
        wrap.appendChild(bubble);
        if (extraEl) bubble.appendChild(extraEl);
        wrap.appendChild(footer);
        box.appendChild(wrap);
        _chatScrollBottom();
        return bubble;
    }

    // ── Show typing indicator ──
    function _showChatTyping() {
        const box = document.getElementById('agent-chat-messages');
        const empty = document.getElementById('chat-empty-state');
        if (empty) empty.remove();
        const wrap = document.createElement('div');
        wrap.className = 'chat-msg agent';
        wrap.id = 'chat-typing-indicator';
        const bubble = document.createElement('div');
        bubble.className = 'chat-typing-bubble';
        bubble.innerHTML = '<span></span><span></span><span></span>';
        wrap.appendChild(bubble);
        box.appendChild(wrap);
        _chatScrollBottom();
    }
    function _hideChatTyping() {
        const t = document.getElementById('chat-typing-indicator');
        if (t) t.remove();
    }

    // ── Build fix card (one edit) with Apply button ──
    function _buildFixCard(edits, msgId) {
        const card = document.createElement('div');
        card.className = 'chat-fix-card';

        const title = document.createElement('div');
        title.className = 'chat-fix-title';
        title.textContent = edits.length + ' fix' + (edits.length > 1 ? 'es' : '') + ' ready';
        card.appendChild(title);

        edits.forEach((edit, i) => {
            const reason = document.createElement('div');
            reason.className = 'chat-fix-reason';
            reason.textContent = edit.reason || 'Code edit';
            card.appendChild(reason);

            if (i < 3) { // Show max 3 previews to keep it compact
                const preview = document.createElement('div');
                preview.className = 'chat-fix-preview';
                const fp = edit.find.slice(0, 50).replace(/\n/g, '↵') + (edit.find.length > 50 ? '…' : '');
                const rp = edit.replace.slice(0, 50).replace(/\n/g, '↵') + (edit.replace.length > 50 ? '…' : '');
                preview.innerHTML = `
                    <div class="chat-fix-side remove">
                        <div class="chat-fix-side-label">REMOVE</div>
                        <div class="chat-fix-code">${fp}</div>
                    </div>
                    <div class="chat-fix-side insert">
                        <div class="chat-fix-side-label">INSERT</div>
                        <div class="chat-fix-code">${rp}</div>
                    </div>`;
                card.appendChild(preview);
            }
        });

        // Apply button
        const applyBtn = document.createElement('button');
        applyBtn.className = 'chat-apply-btn';
        applyBtn.id = 'chat-apply-' + msgId;
        applyBtn.innerHTML = '<span class="material-icons-round">check_circle</span> Apply Fix';
        applyBtn.onclick = () => _applyChatFix(msgId, applyBtn);
        card.appendChild(applyBtn);
        return card;
    }

    // ── Build split files card ──
    function _buildSplitCard(files, msgId) {
        const card = document.createElement('div');
        card.className = 'chat-split-card';
        const title = document.createElement('div');
        title.className = 'chat-fix-title';
        title.textContent = files.length + ' files ready';
        card.appendChild(title);

        files.forEach(f => {
            const row = document.createElement('div');
            row.className = 'chat-split-file-row';
            const name = document.createElement('div');
            name.className = 'chat-split-file-name';
            name.textContent = f.filename;
            const openBtn = document.createElement('button');
            openBtn.className = 'chat-split-mini-btn';
            openBtn.textContent = 'Open';
            openBtn.onclick = () => {
                openFileInTab(f.filename, f.content, true);
                openBtn.innerHTML = '&#10003;';
                openBtn.style.background = 'var(--accent)';
                openBtn.style.color = 'white';
            };
            row.appendChild(name); row.appendChild(openBtn);
            card.appendChild(row);
        });

        const openAllBtn = document.createElement('button');
        openAllBtn.className = 'chat-apply-btn';
        openAllBtn.style.marginTop = '8px';
        openAllBtn.innerHTML = '<span class="material-icons-round">tab</span> Open All Tabs';
        openAllBtn.onclick = () => {
            files.forEach(f => openFileInTab(f.filename, f.content, true));
            openAllBtn.className = 'chat-apply-btn applied';
            openAllBtn.innerHTML = '<span class="material-icons-round">check</span> All Opened';
        };
        card.appendChild(openAllBtn);
        return card;
    }

    // ── Apply fix for a specific message ──
    function _applyChatFix(msgId, btn) {
        const edits = _chatPendingEditsMap[msgId];
        if (!edits || edits.length === 0) return;

        _agentUndoStack.push(editor.getValue());
        if (_agentUndoStack.length > 5) _agentUndoStack.shift();

        const targetId  = _agentTargetTabId || activeTabId;
        const targetTab = fileTabs.find(t => t.id === targetId);
        let code = targetTab ? targetTab.content : editor.getValue();
        let applied = 0;
        edits.forEach(edit => {
            if (code.includes(edit.find)) { code = code.split(edit.find).join(edit.replace); applied++; }
        });
        if (targetTab) {
            targetTab.content = code;
            if (targetId !== activeTabId) switchFileTab(targetId);
        }
        _setEditorValueFast(code);
        const cur = fileTabs.find(t => t.id === activeTabId);
        if (cur) cur.content = code;

        // Mark button as applied
        btn.className = 'chat-apply-btn applied';
        btn.innerHTML = '<span class="material-icons-round">check</span> Applied (' + applied + ' edit' + (applied > 1 ? 's' : '') + ')';

        // Remove from pending map so it can't be applied twice
        delete _chatPendingEditsMap[msgId];

        // Add undo toast in chat
        const undoWrap = document.createElement('div');
        undoWrap.style.cssText = 'margin-top:6px;display:flex;gap:6px;align-items:center;';
        undoWrap.innerHTML = '<span style="font-size:10px;color:var(--accent);font-weight:600"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polyline points="20 6 9 17 4 12"/></svg> Applied to editor</span>';
        const undoSpan = document.createElement('span');
        undoSpan.textContent = 'Undo';
        undoSpan.style.cssText = 'font-size:10px;color:var(--accent);font-weight:700;cursor:pointer;text-decoration:underline;';
        undoSpan.onclick = () => { _agentUndo(); undoWrap.remove(); };
        undoWrap.appendChild(undoSpan);
        btn.parentElement.appendChild(undoWrap);
        _chatScrollBottom();
    }

    // ── Auto resize textarea + Enter key — wrapped in setTimeout(0) ──
    // agent-chat-textarea is injected after this script tag, so we defer by one tick
    setTimeout(function() {
        const chatTA = document.getElementById('agent-chat-textarea');
        if (!chatTA) return;
        chatTA.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });
        chatTA.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.stopPropagation(); }
            if (e.key === 'Enter' && window.innerWidth >= 768) {
                if (e.shiftKey) { return; }
                e.preventDefault();
                sendChatMessage();
            }
        });
    }, 0);

    // ── STEP 1: SEARCH — scan code for relevant sections (like grep) ──
    // Splits code into numbered lines, extracts sections matching user keywords,
    // returns a short summary shown as first agent bubble before analyse/edit.
    async function _searchCodeSections(code, userRequest, filename) {
        const lines = code.split('\n');
        const totalLines = lines.length;

        // Extract keywords from user request — same way grep keywords work
        const stopWords = new Set(['the','and','for','are','was','but','not','you',
            'all','can','has','him','his','how','its','may','new','now','see','too',
            'use','karo','karna','mein','hai','hain','yeh','voh','aur','iska','uska',
            'kuch','mere','teri','mera','kar','kya','bhi','woh','isko','usse','isse']);
        const words = userRequest
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.has(w));

        // Scan every line — collect line numbers that match any keyword (like grep -n)
        const matchedLineNums = [];
        lines.forEach((line, idx) => {
            const lower = line.toLowerCase();
            if (words.some(w => lower.includes(w))) {
                matchedLineNums.push(idx + 1);
            }
        });

        // Group consecutive matches into sections (like grep context -A2 -B2)
        const sections = [];
        let i = 0;
        while (i < matchedLineNums.length) {
            const startLine = matchedLineNums[i];
            let endLine = startLine;
            // Merge lines within 4 of each other into one section
            while (i + 1 < matchedLineNums.length && matchedLineNums[i+1] - matchedLineNums[i] <= 4) {
                i++;
                endLine = matchedLineNums[i];
            }
            // Add ±2 lines of context around the match
            const fromIdx = Math.max(0, startLine - 3);
            const toIdx   = Math.min(totalLines - 1, endLine + 1);
            const snippet = lines
                .slice(fromIdx, toIdx + 1)
                .map((l, si) => `L${fromIdx + si + 1}: ${l.trim().slice(0, 72)}`)
                .join('\n');
            sections.push({ from: fromIdx + 1, to: toIdx + 1, snippet });
            i++;
        }

        // Build summary bubble text
        let summary = '';
        if (sections.length === 0) {
            summary = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Searched "${filename}" (${totalLines} lines) — no direct matches for your keywords.\nWill analyse the full file now.`;
        } else {
            const label = sections.length === 1 ? 'section' : 'sections';
            summary = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Searched "${filename}" (${totalLines} lines) — found ${sections.length} relevant ${label}:\n`;
            sections.slice(0, 3).forEach((s, idx) => {
                const previewLines = s.snippet.split('\n').slice(0, 3).map(l => '  ' + l).join('\n');
                const hasMore = s.snippet.split('\n').length > 3 ? '\n  ...' : '';
                summary += `\n<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> Lines ${s.from}–${s.to}:\n${previewLines}${hasMore}\n`;
            });
            if (sections.length > 3) {
                summary += `\n...and ${sections.length - 3} more section(s) found.`;
            }
        }

        // Return summary + raw sections (sections passed into agent context for better accuracy)
        return { summary, sections };
    }

    // ── Main send function ──
    // ── Main send function ──
    async function sendChatMessage() {
        if (!_activeAgent()) { openAgentModal(); return; }
        const textarea   = document.getElementById('agent-chat-textarea');
        const userRequest = textarea.value.trim();
        if (!userRequest) return;

        // Auto-name session from first message
        if (_chatSessionName === 'New Chat') {
            _chatSessionName = _autoChatName(userRequest);
            document.getElementById('chat-session-label').textContent = _chatSessionName;
        }

        // Append user bubble
        const userTime = _chatTime();
        _appendChatMsg('user', userRequest, userTime);
        _chatHistory.push({ role: 'user', text: userRequest, time: userTime });

        // Clear input
        textarea.value = '';
        textarea.style.height = 'auto';

        // Disable send
        const sendBtn = document.getElementById('agent-chat-send-btn');
        sendBtn.disabled = true;

        // Show typing
        _showChatTyping();

        // Get current code
        let _agentWorkTab = null;
        const chatFileSel = document.getElementById('agent-chat-file-select');
        if (chatFileSel && chatFileSel.value) _agentTargetTabId = parseInt(chatFileSel.value) || activeTabId;
        if (_agentTargetTabId) _agentWorkTab = fileTabs.find(t => t.id === _agentTargetTabId);
        if (!_agentWorkTab) _agentWorkTab = fileTabs.find(t => t.id === activeTabId);
        const curTab = fileTabs.find(t => t.id === activeTabId);
        if (curTab) curTab.content = editor.getValue();
        const code = _agentWorkTab ? _agentWorkTab.content : editor.getValue();

        // Detect intents
        const splitKeywords = /\b(split|divide|separate|extract|break\s*up|break\s*into|multiple\s*files?|alag|vibhajit|tod|tod\s*do|file\s*mein|files\s*mein|parts?)\b/i;
        const chatKeywords  = /\b(explain|what|why|how|problem|issue|error|bug|help|bata|kya|kyon|samjhao|dekho|check|analyse|analyze|review|tell me|isko|isme|kaise|kyun|kab|kuch|sahi|galat|thik|dik|dikkat|problem|solution|suggest|better|improve|optimise|optimize)\b/i;
        const isSplitIntent = splitKeywords.test(userRequest);
        const isChatIntent  = chatKeywords.test(userRequest) && !isSplitIntent;

        // Build context from other tabs
        let contextFiles = '';
        fileTabs.forEach(t => {
            if (t.id !== (_agentWorkTab ? _agentWorkTab.id : activeTabId)) {
                contextFiles += `\n--- Context File: ${t.name} ---\n\`\`\`\n${t.content.slice(0,3000)}\n\`\`\`\n`;
            }
        });
        let attachCtx = agentAttachment ? `\n\nAttached file (${agentAttachment.name}):\n${agentAttachment.content.slice(0,2000)}` : '';
        attachCtx = contextFiles + attachCtx;
        // searchSections populated after STEP 1 — used to focus agent on right parts
        let _searchSections = [];

        // Clear attachment after use
        agentAttachment = null;
        document.getElementById('agent-chat-attach-btn').style.background = '';

        try {
            let agentText = '';
            let extraEl   = null;
            const msgId   = ++_chatMsgCounter;

            // ── STEP 1: SEARCH ──
            // Exactly like grep — scan code, find line numbers + relevant sections
            // Show searching bubble first, then replace with found sections summary
            const searchResult = await _searchCodeSections(code, userRequest, _agentWorkTab ? _agentWorkTab.name : 'untitled');
            _searchSections = searchResult.sections;
            _hideChatTyping();
            _appendChatMsg('agent', searchResult.summary, _chatTime());
            _chatScrollBottom();
            // Brief pause so user sees search result before analyse step
            await new Promise(r => setTimeout(r, 320));
            _showChatTyping();

            if (isChatIntent) {
                // ── CHAT MODE: explain / diagnose ──
                const systemPrompt = `You are a professional software engineering agent designed to analyse and edit code with precision.

GENERAL RULES:
1. The COMPLETE code is always provided to you. Read and analyse every line before making any change. Never assume — the answer is always in the code.
2. Never guess — identify the root cause first.
3. Only perform the task requested. Do not add extra features.
4. Avoid silly mistakes. Maintain professional coding standards.
5. Keep code clean, organised, and readable.
6. Preserve original structure unless modification is required.
7. Ensure changes do not break other parts. If they do, fix those impacts too.
8. Keep modifications minimal, maximum stability, lowest complexity.

PROCESS:
STEP 1 – Understand the request: what, which file/section, bug fix or improvement.
STEP 2 – Load and analyse full code: structure, related components, problem areas.
STEP 3 – Find root cause: never modify without identifying the exact reason.
STEP 4 – Plan minimal fix: decide which block to change, avoid touching unrelated code.
STEP 5 – Apply edit: precise corrected code, no full rewrites.
STEP 6 – Verify: no syntax errors, no broken structure, change fully implemented.

You are talking to the developer directly in a chat interface.
Keep responses SHORT, clear, and conversational. Match the user's language (English or Hindi/Hinglish).
Diagnose problems clearly — explain root cause and exact fix in 2-3 sentences max.
Do NOT return JSON. Just talk naturally.`;
                const foundCtx = _searchSections.length > 0
                    ? '\n\nRELEVANT SECTIONS FOUND BY SEARCH:\n' + _searchSections.slice(0,5).map(s => s.snippet).join('\n---\n')
                    : '';
                const userMsg = `My code (${_agentWorkTab ? _agentWorkTab.name : 'untitled'}):\n\`\`\`\n${code}\n\`\`\`${attachCtx}${foundCtx}\n\nUser says: ${userRequest}\n\nRules: Analyse full code before changing. Senior-level quality. Only do what's requested. Don't touch unrelated code. Respect existing UI/structure/animations. Ensure no other part breaks. Minimal change, max stability, lowest complexity. No comments in code.`;
                agentText = await _callAgentAPI(systemPrompt, userMsg);

            } else if (isSplitIntent) {
                // ── SPLIT MODE ──
                const splitSystemPrompt = `You are CodX AI Agent. The user wants to split their code into multiple separate files.
Analyse the code and split it logically. Return ONLY a JSON array:
[{"filename":"name.ext","content":"full content","reason":"brief reason"}]
Only perform what the user requested. No silly mistakes. Minimal output, maximum quality.
No markdown, no backticks, no explanation outside the array.`;
                const userMsg = `Code to split:\n\`\`\`\n${code}\n\`\`\`${attachCtx}\n\nRequest: ${userRequest}\n\nRules: Only do what's requested. Senior-level quality. Minimal output, max stability. No comments in code.`;
                let raw = await _callAgentAPI(splitSystemPrompt, userMsg);
                const files = _safeExtractJSON(raw);
                if (!files || !files.length) throw new Error('Agent could not split the code. Try again.');
                agentText = `I've split your code into ${files.length} files. Open each one below:`;
                extraEl = _buildSplitCard(files, msgId);

            } else {
                // ── EDIT MODE: 3-step Analyse → Plan → Execute ──
                _hideChatTyping();

                await _runThreeStepAgent({
                    code, userRequest,
                    attachCtx: attachCtx || '',
                    appendMsg: (role, text, card) => {
                        const bubble = _appendChatMsg(role, text || '', _chatTime(), card || null);
                    },
                    showTyping: (msg) => {
                        _hideChatTyping();
                        const box = document.getElementById('agent-chat-messages');
                        const wrap = document.createElement('div');
                        wrap.className = 'chat-msg agent';
                        wrap.id = 'chat-step-typing';
                        wrap.innerHTML = `<div class="chat-bubble" style="font-size:11px;opacity:0.7;">${msg}</div>`;
                        box.appendChild(wrap);
                        _chatScrollBottom();
                    },
                    hideTyping: () => {
                        const t = document.getElementById('chat-step-typing');
                        if (t) t.remove();
                    },
                    scrollBottom: _chatScrollBottom,
                    onApply: (valid) => {
                        const msgIdLocal = ++_chatMsgCounter;
                        _chatPendingEditsMap[msgIdLocal] = valid;
                        const card = _buildFixCard(valid, msgIdLocal);
                        _appendChatMsg('agent', `Ready to apply ${valid.length} change${valid.length>1?'s':''}.`, _chatTime(), card);
                        _chatScrollBottom();
                    }
                }).catch(e => {
                    const t = document.getElementById('chat-step-typing');
                    if (t) t.remove();
                    if (e.message !== '__REJECTED__') {
                        _appendChatMsg('agent', '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ' + (e.message || 'Something went wrong.'), _chatTime());
                    }
                });

                _chatHistory.push({ role: 'agent', text: agentText || '', time: _chatTime(), msgId });
                sendBtn.disabled = false;
                return;
            }

            _hideChatTyping();
            const agentTime = _chatTime();
            _appendChatMsg('agent', agentText, agentTime, extraEl);
            _chatHistory.push({ role: 'agent', text: agentText, time: agentTime, msgId });

        } catch (err) {
            _hideChatTyping();
            const raw = err.message || 'Something went wrong.';
            const errEl = _buildErrorCard(raw);
            const wrap = document.createElement('div');
            wrap.className = 'chat-msg agent';
            wrap.appendChild(errEl);
            const box = document.getElementById('chat-messages');
            if (box) { box.appendChild(wrap); box.scrollTop = box.scrollHeight; }
        } finally {
            sendBtn.disabled = false;
        }
    }

    // ── Override openAgentBar to open inline chat instead ──
    openAgentBar = function() {
        openInlineChat();
    };

    // ── Keep openAgentModal working (for settings) ──
    // No change needed — openAgentModal still opens the agent config modal

    // ── Sync agent name whenever agent changes ──
    const _origUpdateAgentBarLabel = _updateAgentBarLabel;
    _updateAgentBarLabel = function() {
        _origUpdateAgentBarLabel();
        const ag = _activeAgent();
        if (ag) {
            const nameEl = document.getElementById('chat-agent-name');
            if (nameEl) nameEl.textContent = ag.providerName;
        }
    };

    // Editor upar (50%), chat neeche (50%) — seedha split screen

    // _inlineChatOpen declared at script top (var) to avoid TDZ in visualViewport handler

    // ── Conversation history for inline chat ──
    // Each entry: {role: 'user'|'assistant', content: string}
    // Special entries use role 'user' with content starting with [APPLIED] or [CONFIRMED] or [REJECTED]
    let _inlineChatHistory = [];
    const _HISTORY_MAX_TURNS = 6; // keep last 6 exchanges (12 messages) — less quota pressure

    // ── Build history for API call ──
    // Strips old code blocks from older turns but keeps ALL events: applied changes, feedback, rejections
    function _buildHistoryForAPI() {
        if (!_inlineChatHistory.length) return [];

        // Keep last N turns
        const history = _inlineChatHistory.slice(-(_HISTORY_MAX_TURNS * 2));

        // Strip ALL code blocks from history — current message already has fresh code
        // Only keep: user requests, AI explanations, applied/created/rejected summaries
        const codeBlockRx = /```[\s\S]{100,}```/g;
        return history.map(msg => {
            if (msg.role === 'user') {
                return { ...msg, content: msg.content.replace(codeBlockRx, '[code — see current message]').replace(/── FULL CODE[\s\S]*?```\n```/g, '').replace(/── CONTEXT ──[\s\S]*?── USER REQUEST ──\n/, '') };
            }
            return msg;
        });
    }

    // Clear history when chat is closed
    function _inlineClearHistory() { _inlineChatHistory = []; }

    // ── Open / close toggle ──
    function toggleInlineChat() {
        if (_inlineChatOpen) {
            closeInlineChat();
        } else {
            openInlineChat();
        }
    }

    function openInlineChat() {
        if (!_activeAgent()) { openAgentModal(); return; }
        _inlineChatOpen = true;

        const chatPanel = document.getElementById('inline-chat-panel');
        const aiBtn     = document.getElementById('ai-agent-btn');

        // Reset any stale inline styles
        chatPanel.style.bottom = '';
        chatPanel.style.height = '';
        chatPanel.style.top = '';
        chatPanel.style.transform = '';

        chatPanel.classList.add('chat-open');
        if (aiBtn) aiBtn.classList.add('chat-active');

        const inner = document.getElementById('bottom-panel');
        if(inner) { inner.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)'; inner.style.transform = 'translateY(100%)'; }

        const ag = _activeAgent();
        if (ag) document.getElementById('inline-chat-name').textContent = ag.providerName;

        // Sync chat mode button to current state (default ON)
        const modeBtn  = document.getElementById('inline-chat-mode-btn');
        const modeIcon = document.getElementById('chat-mode-icon');
        const ta2      = document.getElementById('inline-chat-textarea');
        if (_inlineChatModeOn) {
            if (modeBtn)  { modeBtn.classList.add('mode-on'); modeBtn.style.background = ''; modeBtn.style.color = ''; }
            if (modeIcon) { modeIcon.setAttribute('stroke', 'white'); modeIcon.setAttribute('fill', 'rgba(255,255,255,0.15)'); }
            if (ta2)      ta2.placeholder = 'Chat only — no edits...';
            const accessBtn = document.getElementById('chat-code-access-btn');
            if (accessBtn) accessBtn.style.display = 'flex';
        }

        _inlinePopulateModels();
        _inlinePopulateTabs();

        setTimeout(() => {
            const ta = document.getElementById('inline-chat-textarea');
            if (ta) ta.focus();
        }, 150);
    }

    // ── Clear conversation UI + memory ──
    function _inlineClearChatUI() {
        _inlineClearHistory();
        const box = document.getElementById('inline-chat-messages');
        if (!box) return;
        box.innerHTML = `<div id="inline-chat-empty">
            <span class="material-icons-round">chat</span>
            <p>Ask me about your code.<br>I can explain, fix &amp; apply changes.</p>
            <p style="font-size:9px;opacity:0.55;margin-top:6px;line-height:1.7;">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Chat mode &nbsp;·&nbsp;
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit mode — toggle via buttons below
            </p>
        </div>`;
        showToast('Conversation cleared', 'delete_sweep');
    }

    function closeInlineChat() {
        _inlineChatOpen = false;
        _inlineClearHistory();
        const chatPanel = document.getElementById('inline-chat-panel');
        const aiBtn     = document.getElementById('ai-agent-btn');
        chatPanel.classList.remove('chat-open');
        // Reset panel position completely
        chatPanel.style.bottom = '0';
        chatPanel.style.height = '';
        chatPanel.style.transform = '';
        if (aiBtn) aiBtn.classList.remove('chat-active');
        // Restore body height + main-container
        document.body.classList.remove('chat-kb-open');
        const _mc = document.getElementById('editor-wrapper');
        if (_mc) _mc.style.maxHeight = '';
        _setBodyHeight();
        const inner = document.getElementById('bottom-panel');
        if(inner && !_navHidden && !_inPreview) { inner.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)'; inner.style.transform = ''; }
    }

    // ── Auto resize textarea ──
    setTimeout(function() {
        const ta = document.getElementById('inline-chat-textarea');
        if (!ta) return;
        ta.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 80) + 'px';
        });
        ta.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.stopPropagation(); }
            if (e.key === 'Enter' && window.innerWidth >= 768) {
                if (e.shiftKey) { return; }
                e.preventDefault();
                sendInlineChat();
            }
        });
    }, 0);

    // ── Scroll messages to bottom ──
    function _inlineChatScroll() {
        const box = document.getElementById('inline-chat-messages');
        if (box) requestAnimationFrame(() => { box.scrollTop = box.scrollHeight; });
    }

    // ── Append message bubble ──
    // ── Markdown → HTML renderer with code canvas ──
    function _renderMsgHTML(text) {
        if (!text) return '';
        const parts = [];
        // Split on fenced code blocks ```lang\n...\n```
        const codeRx = /```([^\n`]*)\n([\s\S]*?)```/g;
        let last = 0, m;
        while ((m = codeRx.exec(text)) !== null) {
            if (m.index > last) parts.push({ type: 'text', content: text.slice(last, m.index) });
            parts.push({ type: 'code', lang: (m[1] || '').trim() || 'code', content: m[2] });
            last = m.index + m[0].length;
        }
        if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });

        return parts.map((p, idx) => {
            if (p.type === 'code') {
                const id = 'cc_' + Math.random().toString(36).slice(2, 8);

                // Strip line numbers from canvas content (e.g. "42| code" → "code")
                const strippedContent = p.content.replace(/^\d+\| ?/gm, '');
                const escaped = strippedContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                const b64 = btoa(unescape(encodeURIComponent(strippedContent)));

                // Detect OLD / NEW block labels
                const langLower = p.lang.toLowerCase();
                const isOld = /old|original|before|current/.test(langLower);
                const isNew = /new|updated|after|replace/.test(langLower);

                // Find previous CODE part (skip any text parts in between)
                let prevCodePart = null;
                for (let i = idx - 1; i >= 0; i--) {
                    if (parts[i].type === 'code') { prevCodePart = parts[i]; break; }
                    if (parts[i].type === 'text' && parts[i].content.trim().length > 30) break;
                }
                const prevIsOld = prevCodePart && /old|original|before|current/.test(prevCodePart.lang.toLowerCase());

                const applyBtn = (isNew && prevIsOld)
                    ? `<button class="code-canvas-btn" onclick="_canvasApplyReplace(this)" data-old="${btoa(unescape(encodeURIComponent(prevCodePart.content.replace(/^\d+\| ?/gm,''))))}" data-new="${b64}" data-b64="1" style="background:var(--accent);color:white;">
                        <span class="material-icons-round">auto_fix_high</span>Apply
                       </button>`
                    : '';

                const labelStyle = isOld ? 'color:#f87171;' : isNew ? 'color:#4ade80;' : '';

                return `<div class="code-canvas">
                    <div class="code-canvas-header">
                        <span class="code-canvas-lang" style="${labelStyle}">${p.lang}</span>
                        <button class="code-canvas-btn" onclick="_canvasOpenInEditor(this)" data-code="${b64}" data-lang="${p.lang}" data-b64="1">
                            <span class="material-icons-round">open_in_new</span>Open
                        </button>
                        <button class="code-canvas-btn" id="${id}" onclick="_canvasCopy(this)" data-code="${b64}" data-b64="1">
                            <span class="material-icons-round">content_copy</span>Copy
                        </button>
                        ${applyBtn}
                    </div>
                    <div class="code-canvas-body">${escaped}</div>
                </div>`;
            }
            // Text: render inline markdown — preserve embedded SVGs, escape everything else
            // Step 1: extract SVG fragments, replace with placeholders
            const svgFragments = [];
            let raw = p.content.replace(/<svg[\s\S]*?<\/svg>/g, (match) => {
                svgFragments.push(match);
                return '\x00SVG' + (svgFragments.length - 1) + '\x00';
            });
            // Step 2: HTML-escape the non-SVG text
            let html = raw
                .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                .replace(/\*\*(.+?)\*\*/g, '<span class="chat-md-bold">$1</span>')
                .replace(/`([^`]+)`/g, '<span class="chat-inline-code">$1</span>')
                .replace(/^(\d+)\.\s+(.+)$/gm, '<div class="chat-md-li" style="padding-left:18px;"><span style="position:absolute;left:0;color:var(--accent);font-weight:700;">$1.</span>$2</div>')
                .replace(/^[-*]\s+(.+)$/gm, '<div class="chat-md-li">$1</div>')
                .replace(/\n/g, '<br>');
            // Step 3: restore SVG fragments
            html = html.replace(/\x00SVG(\d+)\x00/g, (_, i) => svgFragments[+i] || '');
            return html;
        }).join('');
    }

    // ── Apply old→new block replacement ──
    function _canvasApplyReplace(btn) {
        let oldCode = decodeURIComponent(escape(atob(btn.dataset.old || '')));
        let newCode = decodeURIComponent(escape(atob(btn.dataset.new || '')));
        const current = editor.getValue();

        // Strategy 1: exact match
        let matched = current.includes(oldCode);
        let matchedOld = oldCode;

        // Strategy 2: trim leading/trailing blank lines from old block
        if (!matched) {
            const trimmed = oldCode.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
            if (trimmed !== oldCode && current.includes(trimmed)) {
                matched = true;
                matchedOld = trimmed;
            }
        }

        // Strategy 3: normalize indentation — find block ignoring leading spaces per line
        if (!matched) {
            const oldLines = oldCode.split('\n');
            // Find minimum indent of old block
            const minIndent = oldLines
                .filter(l => l.trim().length > 0)
                .reduce((min, l) => Math.min(min, l.match(/^(\s*)/)[1].length), Infinity);
            if (minIndent > 0 && isFinite(minIndent)) {
                const stripped = oldLines.map(l => l.slice(minIndent)).join('\n').replace(/^\s*\n/, '').replace(/\n\s*$/, '');
                // Search current for same block with any indent
                const escapedStripped = stripped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const flexRx = new RegExp('[ \\t]*' + escapedStripped.replace(/\n/g, '\\n[ \\t]*'), '');
                const m = current.match(flexRx);
                if (m) { matched = true; matchedOld = m[0]; }
            }
        }

        if (matched) {
            // Preserve indentation: detect leading indent of matched block and apply to newCode
            const leadingIndent = (matchedOld.match(/^([ \t]*)/) || ['', ''])[1];
            const indentedNew = leadingIndent
                ? newCode.split('\n').map((l, i) => i === 0 ? l : leadingIndent + l).join('\n')
                : newCode;

            const updated = current.replace(matchedOld, indentedNew);
            const curTab = fileTabs.find(t => t.id === activeTabId);
            if (curTab) curTab.content = updated;
            editor.setValue(updated, -1);
            showToast('Applied ✓', 'auto_fix_high');
            btn.innerHTML = '<span class="material-icons-round">check</span>Applied';
            btn.style.background = '#16a34a';
            btn.onclick = null;
        } else {
            btn.innerHTML = '<span class="material-icons-round">search_off</span>No Match';
            btn.style.background = '#dc2626';
            btn.onclick = null;
            const retryBtn = document.createElement('button');
            retryBtn.className = 'code-canvas-btn';
            retryBtn.style.cssText = 'background:rgba(245,158,11,0.2);color:#f59e0b;margin-left:4px;';
            retryBtn.innerHTML = '<span class="material-icons-round">replay</span>Retry AI';
            retryBtn.onclick = () => _canvasRetryMatch(oldCode, newCode, retryBtn);
            btn.parentNode.insertBefore(retryBtn, btn.nextSibling);
        }
    }

    // ── Retry: send old block back to AI asking for correction ──
    function _canvasRetryMatch(oldCode, newCode, btn) {
        btn.innerHTML = '<span class="material-icons-round">hourglass_empty</span>Asking AI...';
        btn.onclick = null;
        const ta = document.getElementById('inline-chat-textarea');
        if (!ta) return;
        const currentCode = editor.getValue();
        const numbered = currentCode.split('\n').map((l,i) => `${i+1}| ${l}`).join('\n');
        ta.value = `The OLD BLOCK you gave me doesn't match anything in my current code.\n\nOLD BLOCK you sent:\n\`\`\`\n${oldCode}\n\`\`\`\n\nMy CURRENT CODE (with line numbers):\n\`\`\`\n${numbered}\n\`\`\`\n\nPlease find the correct matching block in my current code and send the correct OLD BLOCK and NEW BLOCK again.`;
        sendInlineChat();
    }

    function _canvasDecodeCode(btn) {
        if (btn.dataset.b64) return decodeURIComponent(escape(atob(btn.dataset.code || '')));
        return decodeURIComponent(btn.dataset.code || '');
    }

    function _canvasCopy(btn) {
        const code = _canvasDecodeCode(btn);
        navigator.clipboard.writeText(code).then(() => {
            btn.classList.add('copied');
            btn.innerHTML = '<span class="material-icons-round">check</span>Copied';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = '<span class="material-icons-round">content_copy</span>Copy';
            }, 1800);
        });
    }

    function _canvasOpenInEditor(btn) {
        const code = _canvasDecodeCode(btn);
        const lang = btn.dataset.lang || '';
        const ext = { javascript:'js', js:'js', typescript:'ts', python:'py', html:'html', css:'css', json:'json', bash:'sh', shell:'sh' }[lang.toLowerCase()] || 'txt';
        openFileInTab('snippet.' + ext, code, true);
        showToast('Opened in editor', 'open_in_new');
    }

    function _inlineAppendMsg(role, text, extraEl) {
        const box = document.getElementById('inline-chat-messages');
        const empty = document.getElementById('inline-chat-empty');
        if (empty) empty.remove();

        const wrap = document.createElement('div');
        wrap.className = 'chat-msg ' + role;

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';

        if (role === 'agent' && text) {
            bubble.innerHTML = _renderMsgHTML(text);
        } else if (text) {
            bubble.innerHTML = text
                .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                .replace(/\n/g, '<br>');
        }

        // Footer: timestamp + copy button
        const footer = document.createElement('div');
        footer.className = 'chat-msg-footer';

        const ts = document.createElement('div');
        ts.className = 'chat-time';
        ts.textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

        // Model badge — only for agent messages when meta is available
        if (role === 'agent' && window._lastCallMeta?.model) {
            const meta = window._lastCallMeta;
            const shortModel = meta.model.split('/').pop(); // e.g. "qwen3-235b-a22b"
            const isThinking = meta.reasoning_tokens > 0;
            const badge = document.createElement('div');
            badge.style.cssText = 'font-size:9px;font-weight:600;color:var(--accent);opacity:0.75;font-family:Poppins,sans-serif;display:flex;align-items:center;gap:3px;';
            badge.innerHTML = (isThinking ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="14" x2="22" y2="14"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="14" x2="4" y2="14"/></svg> ' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> ') + shortModel + (isThinking ? ' · ' + meta.reasoning_tokens + ' think tokens' : '');
            footer.appendChild(badge);
        }

        const copyBtn = document.createElement('button');
        copyBtn.className = 'chat-copy-btn';
        copyBtn.innerHTML = '<span class="material-icons-round">content_copy</span>';
        copyBtn.title = 'Copy';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<span class="material-icons-round">check</span>';
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = '<span class="material-icons-round">content_copy</span>';
                }, 1500);
            });
        };

        footer.appendChild(ts);
        footer.appendChild(copyBtn);
        wrap.appendChild(bubble);
        if (extraEl) bubble.appendChild(extraEl);
        wrap.appendChild(footer);
        box.appendChild(wrap);
        _inlineChatScroll();
        return bubble;
    }

    // ── Typing indicator + live activity log ──
    let _statusTimer = null;

    function _inlineShowTyping() {
        const box = document.getElementById('inline-chat-messages');
        const empty = document.getElementById('inline-chat-empty');
        if (empty) empty.remove();
        const existing = document.getElementById('inline-typing');
        if (existing) existing.remove();

        const wrap = document.createElement('div');
        wrap.className = 'chat-msg agent';
        wrap.id = 'inline-typing';

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.style.cssText = 'padding:0;overflow:hidden;min-width:220px;max-width:100%;';

        // Header: icon + status text + dots
        const hdr = document.createElement('div');
        hdr.id = 'ipt-header';
        hdr.style.cssText = 'display:flex;align-items:center;gap:7px;padding:8px 11px;';

        const icon = document.createElement('span');
        icon.id = 'inline-status-icon';
        icon.style.cssText = 'font-size:13px;flex-shrink:0;';
        icon.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

        const txt = document.createElement('span');
        txt.id = 'inline-status-text';
        txt.style.cssText = 'font-size:10px;font-weight:700;font-family:Poppins,sans-serif;color:var(--accent);flex:1;';
        txt.textContent = 'Generating...';

        const dots = document.createElement('div');
        dots.id = 'ipt-dots';
        dots.style.cssText = 'display:flex;gap:3px;flex-shrink:0;';
        for (let i = 0; i < 3; i++) {
            const d = document.createElement('span');
            d.style.cssText = 'width:4px;height:4px;border-radius:50%;background:var(--accent);animation:agentBounce 0.8s ' + (i*0.2) + 's infinite;display:inline-block;';
            dots.appendChild(d);
        }

        hdr.appendChild(icon);
        hdr.appendChild(txt);
        hdr.appendChild(dots);

        // Live activity log — always visible, taller
        const log = document.createElement('div');
        log.id = 'ipt-log';
        log.style.cssText = 'border-top:1px solid var(--glass-border);max-height:110px;overflow-y:auto;padding:5px 11px 6px;display:flex;flex-direction:column;gap:2px;';

        bubble.appendChild(hdr);
        bubble.appendChild(log);
        wrap.appendChild(bubble);
        box.appendChild(wrap);
        // First log line — immediately visible
        const _initLine = document.createElement('div');
        _initLine.style.cssText = 'font-size:9px;font-family:"Courier New",monospace;color:var(--accent);opacity:0.55;';
        _initLine.textContent = '› Building prompt...';
        log.appendChild(_initLine);
        _inlineChatScroll();
    }

    // Push a timestamped line to the live activity log
    function _inlineLogActivity(text) {
        const log = document.getElementById('ipt-log');
        if (!log) return;
        const now = new Date();
        const ts = now.getSeconds().toString().padStart(2,'0') + '.' + Math.floor(now.getMilliseconds()/100);
        const line = document.createElement('div');
        line.style.cssText = 'font-size:9px;font-family:"Courier New",monospace;color:var(--text-color);opacity:0.75;display:flex;gap:5px;line-height:1.4;';
        const tsEl = document.createElement('span');
        tsEl.style.cssText = 'color:var(--accent);opacity:0.45;flex-shrink:0;';
        tsEl.textContent = ':' + ts;
        const msgEl = document.createElement('span');
        msgEl.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        msgEl.textContent = text;
        line.appendChild(tsEl);
        line.appendChild(msgEl);
        log.appendChild(line);
        log.scrollTop = log.scrollHeight;
        _inlineChatScroll();
    }

    function _inlineUpdateTypingStatus(icon, text, promptChars) {
        const iconEl = document.getElementById('inline-status-icon');
        const textEl = document.getElementById('inline-status-text');
        if (!textEl) return;
        if (iconEl) iconEl.innerHTML = icon;
        textEl.textContent = text + (promptChars != null ? '  ' + (promptChars/1024).toFixed(1) + 'k' : '');
        _inlineLogActivity(text + (promptChars != null ? ' (' + (promptChars/1024).toFixed(1) + 'k)' : ''));
    }

    function _inlineHideTyping() {
        clearInterval(_statusTimer);
        _statusTimer = null;
        // Fully remove typing indicator — prevents content overlap
        const wrap = document.getElementById('inline-typing');
        if (wrap) wrap.remove();
    }

    //  NEW AGENT WORKFLOW — Single API call, AI decides
    //  No regex intent detection — AI handles everything

    const _AGENT_SYSTEM_PROMPT = `You are CodX Assistant, an expert AI coding assistant built into the CodX editor. If the user asks your name, you are "CodX Assistant".
You receive code with LINE NUMBERS like "42| code here".
Full chat history is included every call — use it to understand context of what has been done before.

YOUR JOB: Fulfil exactly what the user asks. Nothing more, nothing less. The user's request is the source of truth.

QUALITY STANDARD:
- Every UI you build must be modern, well-designed, and polished — clean layouts, smooth animations, good typography
- Use SVG icons (inline) — never rely on external icon libraries
- Code must be clean, well-organised, and professional
- Fully functional — no placeholders, no "TODO", no incomplete sections

DECIDE THE RESPONSE TYPE YOURSELF based on what the user wants:

─── EXPLAIN (question / review / chat / greetings) ───
Reply in plain text. Same language as user (English/Hindi/Hinglish).

─── EDIT (fix / change / add / remove / improve in existing code) ───
Return ONLY this JSON, nothing else:
{"type":"edit","explanation":"what changed","edits":[{"line_start":N,"line_end":N,"replace":"new code here"}]}
Use exact line numbers shown. replace = complete replacement lines.

─── NEW FILE (create a new file from scratch) ───
Return ONLY this JSON, nothing else:
{"type":"new_file","explanation":"what it does","filename":"name.ext","content":"complete file content"}

─── SPLIT (break one file into multiple files) ───
Return ONLY this JSON, nothing else:
{"type":"split","explanation":"what was split","files":[{"filename":"name.ext","content":"complete file content","reason":"why"}]}

─── REORGANIZE (restructure / reorder the whole file) ───
Return ONLY this JSON with COMPLETE file content:
{"type":"reorganize","explanation":"what changed","content":"entire file content here"}

STRICT FORMAT RULES:
- Return ONLY JSON for edit/new_file/split/reorganize — no markdown fences, no text outside JSON
- Never truncate — write every single line completely
- Never hallucinate line numbers — only use line numbers visible in the provided code
- In JSON strings: escape " as \\" and newlines as \\n`;

    // ── Robust JSON parser — shared across all agent response handlers ──
    function _tryParseJSON(str) {
        if (!str) return null;
        // Quick guard — if no "type" key, this is not an agent JSON response
        if (!str.includes('"type"')) return null;

        // Strategy 1: strip markdown fences then parse whole string
        let clean = str.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        try { const p = JSON.parse(clean); if (p && p.type) return p; } catch(_) {}

        // Strategy 2: extract outermost { } block using brace matching
        const start = str.indexOf('{');
        if (start !== -1) {
            let depth = 0, end = -1;
            for (let i = start; i < str.length; i++) {
                if (str[i] === '{') depth++;
                else if (str[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
            }
            if (end !== -1) {
                try { const p = JSON.parse(str.slice(start, end + 1)); if (p && p.type) return p; } catch(_) {}
            }
        }

        // Strategy 3: only fix trailing commas — no other replacements (they corrupt HTML/CSS content)
        try {
            const s3 = str.indexOf('{');
            if (s3 !== -1) {
                let d3 = 0, e3 = -1;
                for (let i = s3; i < str.length; i++) {
                    if (str[i] === '{') d3++;
                    else if (str[i] === '}') { d3--; if (d3 === 0) { e3 = i; break; } }
                }
                if (e3 !== -1) {
                    const fixed = str.slice(s3, e3 + 1).replace(/,(\s*[}\]])/g, '$1');
                    const p = JSON.parse(fixed);
                    if (p && p.type) return p;
                }
            }
        } catch(_) {}

        return null;
    }

    async function sendInlineChat() {
        if (!_activeAgent()) {
            const box = document.getElementById('inline-chat-messages');
            if (box && !document.getElementById('inline-no-agent-banner')) {
                const banner = document.createElement('div');
                banner.id = 'inline-no-agent-banner';
                banner.style.cssText = 'margin:12px;padding:14px;border-radius:14px;background:var(--accent-dim);border:1px solid rgba(16,185,129,0.3);display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;';
                banner.innerHTML = `<span class="material-icons-round" style="font-size:28px;color:var(--accent);">smart_toy</span>
                    <div style="font-size:12px;font-weight:700;color:var(--text-color);font-family:'Poppins',sans-serif;">No Agent Connected</div>
                    <div style="font-size:11px;color:var(--text-color);opacity:0.6;font-family:'Poppins',sans-serif;line-height:1.5;">Connect a free AI agent to start chatting.<br>Groq is free &amp; super fast.</div>
                    <button onclick="openAgentModal();document.getElementById('inline-no-agent-banner')?.remove();" style="background:var(--accent);color:white;border:none;border-radius:10px;padding:9px 20px;font-size:12px;font-weight:700;font-family:'Poppins',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;">
                        <span class="material-icons-round" style="font-size:15px;pointer-events:none;">add_circle</span>Add Agent
                    </button>`;
                box.appendChild(banner);
                _inlineChatScroll();
            }
            return;
        }

        const ta = document.getElementById('inline-chat-textarea');
        const userRequest = ta.value.trim();
        if (!userRequest) return;

        _inlineAppendMsg('user', userRequest);
        requestAnimationFrame(() => { ta.value = ''; ta.style.height = 'auto'; });

        const sendBtn = document.getElementById('inline-chat-send-btn');

        // ── Switch to STOP button — batch both changes in one rAF to prevent flicker ──
        const _inlineAbortCtrl = new AbortController();
        requestAnimationFrame(() => {
            sendBtn.innerHTML = '<span class="material-icons-round">stop</span>';
            sendBtn.style.background = '#ef4444';
        });
        sendBtn.onclick = () => {
            _inlineAbortCtrl.abort();
            sendBtn.onclick = sendInlineChat; // restore immediately so button is never dead
            requestAnimationFrame(() => {
                sendBtn.innerHTML = '<span class="material-icons-round">send</span>';
                sendBtn.style.background = '';
            });
        };

        _inlineShowTyping();
        // Double rAF: first commits DOM paint, second runs after browser has actually rendered
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        // ── Target file ──
        const _isNewFileMode = _inlineSelectedTabId === 'new';
        if (!_isNewFileMode && _inlineSelectedTabId) _agentTargetTabId = _inlineSelectedTabId;
        const targetTab = _isNewFileMode ? null : (fileTabs.find(t => t.id === (_agentTargetTabId || activeTabId)) || fileTabs.find(t => t.id === activeTabId));
        const curTab = fileTabs.find(t => t.id === activeTabId);
        if (curTab) curTab.content = editor.getValue();
        const code = (!_isNewFileMode && targetTab && (!_inlineChatModeOn || _chatCodeAccessOn)) ? targetTab.content : '';
        const filename = (!_isNewFileMode && targetTab) ? targetTab.name : '';

        // ── Code with line numbers (no truncation — all providers support large context) ──
        const _provider = _activeAgent()?.provider || '';
        let numberedCode = code ? code.split('\n').map((l,i) => `${i+1}| ${l}`).join('\n') : '';
        _inlineLogActivity('Code: ' + (numberedCode.length/1024).toFixed(1) + 'k (' + code.split('\n').length + ' lines)');

        // ── Context files (user explicitly ticked) ──
        let otherFilesCtx = '';
        if (_inlineContextTabIds && _inlineContextTabIds.size > 0) {
            _inlineContextTabIds.forEach(tid => {
                if (tid === (targetTab ? targetTab.id : activeTabId)) return;
                const t = fileTabs.find(f => f.id === tid);
                if (!t || !t.content?.trim()) return;
                otherFilesCtx += `\n\n── CONTEXT FILE: ${t.name} ──\n\`\`\`\n${t.content}\n\`\`\``;
            });
        }

        // ── Attachment ──
        const attachCtx = _inlineAttachment ? `\n\n── ATTACHED FILE (${_inlineAttachment.name}) ──\n${_inlineAttachment.content.slice(0,2000)}` : '';
        _inlineClearAttach();

        // ── Session events ──
        const sessionEvents = _inlineChatHistory
            .filter(m => m.content.startsWith('[APPLIED') || m.content.startsWith('[CREATED') || m.content.startsWith('[SPLIT') || m.content.startsWith('[REORGANIZED') || m.content.startsWith('[USER CONFIRMED') || m.content.startsWith('[USER DECLINED'))
            .map(m => m.content).join('\n');
        const sessionBlock = sessionEvents ? `\n\n── SESSION EVENTS ──\n${sessionEvents}` : '';

        // ── Final message to AI ──
        const codeBlock = (!_isNewFileMode && numberedCode) ? `\n\n── FULL CODE (with line numbers) ──\n\`\`\`\n${numberedCode}\n\`\`\`` : '';
        const userMsg = `── CONTEXT ──${sessionBlock}${codeBlock}${otherFilesCtx}${attachCtx}\n\n── USER REQUEST ──\n${userRequest}`;

        // ── Show prompt info in live log ──
        const historyForAPI = _buildHistoryForAPI();
        if (!_isNewFileMode && targetTab) _inlineLogActivity('Target: ' + targetTab.name);
        if (historyForAPI.length > 0)     _inlineLogActivity('History: ' + historyForAPI.length + ' msgs');
        _inlineLogActivity('Prompt ready: ' + (userMsg.length/1024).toFixed(1) + 'k chars');
        _inlineUpdateTypingStatus('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>', 'Generating...', userMsg.length);

        try {
            _inlineLogActivity('Calling ' + (_activeAgent()?.providerName || 'AI') + '...');
            // ── Mode context prefix ──
            const _modeCtx = _pythonMode
                ? `\nCURRENT MODE: Python (Pyodide v0.26.2 — CPython 3.12 in browser via WebAssembly).
PYODIDE RULES — follow strictly or code will break:
1. NEVER use input() — no stdin in browser.
2. NEVER use requests, urllib, httpx — no direct network calls (CORS blocked). Use js.fetch if HTTP needed.
3. NEVER use tkinter, pygame, wx, PyQt — no GUI libraries.
4. NEVER write files with open('file','w') to filesystem — browser sandbox, use in-memory only.
5. NEVER use plt.show() — use plt.savefig(buf, format='png') + base64 to display images.
6. stdlib is fully available: math, json, re, datetime, random, itertools, collections, functools, os.path etc.
7. numpy, pandas, scipy ARE available (auto-loaded). Always write pure Pyodide-compatible code.
8. All code runs in a single execution context — print() output appears in the Preview panel.
9. Only write .py files. Never generate HTML/CSS/JS.`
                : `\nCURRENT MODE: HTML/Web. Write HTML, CSS, JavaScript as needed.`;
            // ── Chat Mode: use a pure-conversation system prompt ──
            const activeSystemPrompt = _inlineChatModeOn
                ? `You are CodX Assistant, an AI coding assistant built into the CodX editor.
If the user asks your name, you are "CodX Assistant".${_modeCtx}
Rules:
1. NEVER return JSON. NEVER return edit/new_file/split/reorganize JSON objects.
2. Only respond in plain conversational text.
3. If you need to show code, wrap it in fenced code blocks (triple backticks with language tag) — these render as Canvas cards the user can copy.
4. When showing code changes, use this exact format:
   - First write in plain text: "Lines X–Y" (where the change is)
   - Then the OLD block: \`\`\`old\n<exact code, NO line numbers>\n\`\`\`
   - Then the NEW block: \`\`\`new\n<replacement code, NO line numbers>\n\`\`\`
   - Line numbers go in the chat text ONLY, never inside the code blocks.
   - The app will show an Apply button on the NEW block to auto-replace.
5. Keep responses clear, helpful, and to the point. Match the user's language (English or Hindi/Hinglish).`
                : _AGENT_SYSTEM_PROMPT + _modeCtx;
            const raw = await _callAgentAPI(activeSystemPrompt, userMsg, historyForAPI, _inlineAbortCtrl);
            _inlineLogActivity('Response: ' + (raw.length/1024).toFixed(1) + 'k received');
            _inlineHideTyping();

            if (!raw?.trim()) {
                _inlineAppendMsg('agent', '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Empty response. Try again or switch model.');
                return;
            }

            // Save to history
            _inlineChatHistory.push({ role: 'user', content: userMsg });
            _inlineChatHistory.push({ role: 'assistant', content: raw });

            const parsed = _tryParseJSON(raw);

            // ── CHAT MODE OVERRIDE: no edits, just show text + code canvas ──
            if (_inlineChatModeOn) {
                _inlineAppendMsg('agent', raw.trim());
                return;
            }

            // ── Plain text / explanation ──
            if (!parsed || !parsed.type) {
                _inlineAppendMsg('agent', raw.trim());

            // ── Edit ──
            } else if (parsed.type === 'edit') {
                if (!Array.isArray(parsed.edits) || parsed.edits.length === 0) {
                    _inlineAppendMsg('agent', parsed.explanation || 'No changes needed.');
                } else {
                    if (parsed.explanation?.trim()) _inlineAppendMsg('agent', parsed.explanation.trim());
                    _inlineAppendMsg('agent', '', _buildInlineEditCard(parsed.edits, targetTab));
                }

            // ── New file ──
            } else if (parsed.type === 'new_file') {
                const fname = parsed.filename || 'new-file.html';
                const content = parsed.content || '';
                if (parsed.explanation?.trim()) _inlineAppendMsg('agent', parsed.explanation.trim());
                _inlineAppendMsg('agent', '', _buildConfirmCard({
                    type: 'new_file', icon: 'add_circle',
                    title: `New file: ${fname}`,
                    lines: [content.split('\n').length + ' lines'],
                    onApply: () => {
                        _agentUndoStack.push({ type: 'new_file', filename: fname });
                        if (_agentUndoStack.length > 5) _agentUndoStack.shift();
                        openFileInTab(fname, content, true);
                        _inlineChatHistory.push({ role: 'assistant', content: `[CREATED FILE: ${fname}]` });
                        _inlineSelectedTabId = activeTabId; _agentTargetTabId = activeTabId;
                        _inlineRenderFileDropdown();
                        showToast(`${fname} created`, 'add_circle');
                    }
                }));

            // ── Split ──
            } else if (parsed.type === 'split') {
                const files = parsed.files || [];
                if (!files.length) {
                    _inlineAppendMsg('agent', '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> AI returned no files. Try again.');
                } else {
                    if (parsed.explanation?.trim()) _inlineAppendMsg('agent', parsed.explanation.trim());
                    _inlineAppendMsg('agent', '', _buildConfirmCard({
                        type: 'split', icon: 'call_split',
                        title: `Split into ${files.length} file${files.length>1?'s':''}`,
                        lines: files.map(f => f.filename + (f.reason ? ' — ' + f.reason : '')),
                        onApply: () => {
                            files.forEach(f => openFileInTab(f.filename, f.content || '', true));
                            _inlineChatHistory.push({ role: 'assistant', content: `[SPLIT INTO ${files.length} FILES: ${files.map(f=>f.filename).join(', ')}]` });
                            showToast(`${files.length} files created`, 'call_split');
                        }
                    }));
                }

            // ── Reorganize ──
            } else if (parsed.type === 'reorganize') {
                if (!parsed.content) {
                    _inlineAppendMsg('agent', '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> AI returned empty content. Try again.');
                } else {
                    const rTab = targetTab;
                    const oldContent = rTab ? rTab.content : editor.getValue();
                    const newContent = parsed.content;
                    if (parsed.explanation?.trim()) _inlineAppendMsg('agent', parsed.explanation.trim());
                    _inlineAppendMsg('agent', '', _buildConfirmCard({
                        type: 'reorganize', icon: 'reorder',
                        title: `Reorganized — ${newContent.split('\n').length} lines`,
                        lines: [`${oldContent.split('\n').length} → ${newContent.split('\n').length} lines`],
                        onApply: () => {
                            const cleaned = newContent.split('\n').map(l=>l.replace(/\s+$/,'')).join('\n').replace(/\n{3,}/g,'\n\n').trimEnd();
                            _agentUndoStack.push({ type: 'edit_content', tab: rTab, content: oldContent });
                            if (_agentUndoStack.length > 5) _agentUndoStack.shift();
                            if (rTab) rTab.content = cleaned;
                            if (!rTab || rTab.id === activeTabId) editor.setValue(cleaned, -1);
                            else { switchFileTab(rTab.id); editor.setValue(cleaned, -1); }
                            _inlineChatHistory.push({ role: 'assistant', content: `[REORGANIZED FILE — ${cleaned.split('\n').length} lines]` });
                            showToast('File reorganized', 'reorder');
                        }
                    }));
                }

            // ── Unknown type — show as text ──
            } else {
                _inlineAppendMsg('agent', parsed.explanation || raw.trim());
            }

        } catch(err) {
            _inlineHideTyping();
            const msg = err.message || '';
            if (msg === '__RATE_LIMIT_SHOWN__') return;
            if (msg === '__USER_ABORTED__') {
                _inlineAppendMsg('agent', '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="display:inline;vertical-align:middle;pointer-events:none;"><rect x="4" y="4" width="16" height="16" rx="2"/></svg> Stopped.');
                return;
            }
            const errEl = _buildErrorCard(msg);
            const wrap = document.createElement('div');
            wrap.className = 'chat-msg agent';
            wrap.appendChild(errEl);
            const box = document.getElementById('inline-chat-messages');
            if (box) { box.appendChild(wrap); _inlineChatScroll(); }
        } finally {
            // Restore onclick immediately — never leave button dead
            sendBtn.disabled = false;
            sendBtn.onclick = sendInlineChat;
            // Visuals batched in rAF to prevent flash
            requestAnimationFrame(() => {
                sendBtn.innerHTML = '<span class="material-icons-round">send</span>';
                sendBtn.style.background = '';
            });
            _inlineChatScroll();
        }
    }

    // ── Gemini rate limit warning — shown in chat as compact bar ──
    function _geminiWarnInChat(model, type, used, limit) {
        const warnId = 'gemini-warn-' + model.replace(/\./g,'_') + '-' + type;
        if (document.getElementById(warnId)) return; // already shown
        const shortModel = model.replace('gemini-2.5-','').replace('flash-lite','Lite').replace('flash','Flash').replace('pro','Pro');
        const label = type === 'rpm' ? `${used}/${limit} req/min` : `${used}/${limit} req/day`;
        const pct = Math.round(used/limit*100);
        const warn = document.createElement('div');
        warn.id = warnId;
        warn.className = 'chat-msg agent';
        warn.innerHTML = `<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:7px 11px;display:flex;align-items:center;gap:8px;max-width:100%;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div style="flex:1;min-width:0;">
                <div style="font-size:10px;font-weight:700;color:#f59e0b;font-family:Poppins,sans-serif;">${shortModel} — ${pct}% ${type === 'rpm' ? 'minute' : 'daily'} quota used</div>
                <div style="height:3px;background:rgba(245,158,11,0.15);border-radius:2px;margin-top:4px;"><div style="height:100%;width:${pct}%;background:#f59e0b;border-radius:2px;transition:width 0.3s;"></div></div>
                <div style="font-size:9px;color:var(--text-color);opacity:0.5;margin-top:3px;font-family:Poppins,sans-serif;">${label} — consider switching model soon</div>
            </div>
        </div>`;
        const box = document.getElementById('inline-chat-messages');
        if (box) { box.appendChild(warn); _inlineChatScroll(); }
    }

    // ── Gemini hard limit hit — countdown timer in chat ──
    function _geminiShowCountdown(model, type, waitSec, limit) {
        _inlineHideTyping();
        const shortModel = model.replace('gemini-2.5-','').replace('flash-lite','Flash-Lite').replace('flash','Flash').replace('pro','Pro');
        const wrap = document.createElement('div');
        wrap.className = 'chat-msg agent';
        const bubble = document.createElement('div');
        bubble.style.cssText = 'background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:10px;padding:10px 13px;max-width:100%;';

        if (type === 'rpd' || waitSec === null) {
            bubble.innerHTML = `<div style="display:flex;align-items:center;gap:8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div>
                    <div style="font-size:11px;font-weight:700;color:#ef4444;font-family:Poppins,sans-serif;">Gemini ${shortModel} — Daily limit reached (${limit}/day)</div>
                    <div style="font-size:10px;color:var(--text-color);opacity:0.6;font-family:Poppins,sans-serif;margin-top:2px;">Resets at midnight Pacific time. Switch to another model.</div>
                </div>
            </div>`;
            wrap.appendChild(bubble);
        } else {
            // RPM countdown
            bubble.innerHTML = `<div style="display:flex;align-items:center;gap:8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div style="flex:1;">
                    <div style="font-size:11px;font-weight:700;color:#ef4444;font-family:Poppins,sans-serif;">Gemini ${shortModel} — Rate limit (${limit} req/min)</div>
                    <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                        <div style="font-size:10px;color:var(--text-color);opacity:0.6;font-family:Poppins,sans-serif;">Auto-retry in</div>
                        <div id="gemini-countdown-${Date.now()}" style="font-size:13px;font-weight:700;color:#ef4444;font-family:'Courier New',monospace;min-width:28px;">${waitSec}s</div>
                    </div>
                </div>
            </div>`;
            wrap.appendChild(bubble);
            // Start countdown
            const cdEl = bubble.querySelector('[id^="gemini-countdown"]');
            let remaining = waitSec;
            const iv = setInterval(() => {
                remaining--;
                if (cdEl) cdEl.textContent = remaining + 's';
                if (remaining <= 0) {
                    clearInterval(iv);
                    if (cdEl) cdEl.closest('.chat-msg')?.remove();
                }
            }, 1000);
        }

        const box = document.getElementById('inline-chat-messages');
        if (box) { box.appendChild(wrap); _inlineChatScroll(); }
    }

    // ── Build Reorganize card with full file diff ──
    function _buildInlineReorganizeCard(newContent, targetTab) {
        const card = document.createElement('div');
        card.style.cssText = 'border:1px solid var(--glass-border);border-radius:12px;overflow:hidden;margin-top:4px;max-width:100%;';

        const oldContent = targetTab ? targetTab.content : editor.getValue();
        const oldLines = oldContent.split('\n');
        const newLines = (newContent || '').split('\n');

        // Count changed lines for summary
        const oldSet = new Set(oldLines);
        const newSet = new Set(newLines);
        const moved = newLines.filter(l => oldSet.has(l)).length;
        const added = newLines.filter(l => !oldSet.has(l)).length;
        const removed = oldLines.filter(l => !newSet.has(l)).length;

        // Build compact diff — show first 40 lines of diff
        const { html } = _buildDiffHTML(oldLines.slice(0, 60), newLines.slice(0, 60));
        const tabId = targetTab ? targetTab.id : 'null';
        const contentJson = JSON.stringify(newContent).replace(/"/g, '&quot;');

        card.innerHTML = `
            <div style="background:rgba(16,185,129,0.08);padding:9px 12px;border-bottom:1px solid var(--glass-border);display:flex;align-items:center;gap:8px;">
                <span class="material-icons-round" style="font-size:15px;color:var(--accent);">reorder</span>
                <span style="font-size:11px;font-weight:700;color:var(--accent);font-family:'Poppins',sans-serif;flex:1;">Reorganized file — ${newLines.length} lines</span>
                <span style="font-size:9px;font-weight:600;font-family:'Poppins',sans-serif;color:var(--text-color);opacity:0.45;">
                    <span style="color:#ef4444;">-${removed}</span> &nbsp;<span style="color:#10b981;">+${added}</span>
                </span>
            </div>
            <div style="max-height:200px;overflow-y:auto;background:rgba(0,0,0,0.15);">${html}<div style="padding:4px 8px;font-size:9px;opacity:0.4;font-family:'Courier New',monospace;">... preview shows first 60 lines</div></div>
            <div style="padding:8px 12px;display:flex;gap:7px;border-top:1px solid var(--glass-border);">
                <button onclick="_applyInlineReorganize(this, ${contentJson}, ${tabId})" style="flex:1;padding:8px;border-radius:9px;border:none;background:var(--accent);color:white;font-size:11px;font-weight:700;font-family:'Poppins',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;">
                    <span class="material-icons-round" style="font-size:14px;pointer-events:none;">check</span>Apply Reorganize
                </button>
                <button onclick="this.closest('div').parentElement.remove()" style="padding:8px 14px;border-radius:9px;border:1px solid var(--glass-border);background:none;color:var(--text-color);font-size:11px;font-weight:600;font-family:'Poppins',sans-serif;cursor:pointer;opacity:0.6;">Cancel</button>
            </div>`;
        return card;
    }

    function _applyInlineReorganize(btn, newContent, tabId) {
        if (!newContent) return;
        const snapTab = fileTabs.find(t => t.id === (tabId || activeTabId)) || fileTabs.find(t => t.id === activeTabId);
        const original = snapTab ? snapTab.content : editor.getValue();
        // Clean: trailing whitespace per line, max 2 blank lines, no trailing newlines
        const cleaned = newContent
            .split('\n').map(l => l.replace(/\s+$/, '')).join('\n')
            .replace(/\n{3,}/g, '\n\n').trimEnd();
        // Save undo snapshot
        _agentUndoStack.push({ type: 'edit_content', tab: snapTab, content: original });
        if (_agentUndoStack.length > 5) _agentUndoStack.shift();
        if (snapTab) snapTab.content = cleaned;
        if (!tabId || tabId === activeTabId) {
            editor.setValue(cleaned, -1);
        } else {
            switchFileTab(tabId);
            editor.setValue(cleaned, -1);
        }
        const undoCount = _agentUndoStack.length;
        btn.closest('div').parentElement.innerHTML = `<div style="padding:8px 12px;display:flex;align-items:center;gap:8px;background:rgba(16,185,129,0.08);border-radius:12px;">
            <span class="material-icons-round" style="font-size:15px;color:var(--accent);">check_circle</span>
            <span style="font-size:11px;font-weight:700;color:var(--accent);font-family:'Poppins',sans-serif;flex:1;">Reorganized successfully</span>
            <button onclick="_agentUndoLast(this)" style="background:rgba(128,128,128,0.12);border:1px solid var(--glass-border);border-radius:8px;padding:4px 10px;font-size:10px;font-weight:700;font-family:'Poppins',sans-serif;color:var(--text-color);cursor:pointer;display:flex;align-items:center;gap:4px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"><path d="M3 7v6h6"/><path d="M3 13C5.5 6.5 13 4 18 8s5 10 1 14"/></svg>
                Undo (${undoCount})
            </button>
        </div>`;
        showToast('File reorganized', 'reorder');
    }
    function _buildDiffHTML(oldLines, newLines) {
        // Simple line-level diff using LCS approach
        const escHtml = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        let html = '';
        let i = 0, j = 0;
        const m = oldLines.length, n = newLines.length;

        // Build LCS table
        const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
        for (let r = 1; r <= m; r++)
            for (let c = 1; c <= n; c++)
                dp[r][c] = oldLines[r-1] === newLines[c-1] ? dp[r-1][c-1]+1 : Math.max(dp[r-1][c], dp[r][c-1]);

        // Trace back
        const ops = [];
        let r = m, c = n;
        while (r > 0 || c > 0) {
            if (r > 0 && c > 0 && oldLines[r-1] === newLines[c-1]) { ops.unshift({t:'=', l:oldLines[r-1]}); r--; c--; }
            else if (c > 0 && (r === 0 || dp[r][c-1] >= dp[r-1][c])) { ops.unshift({t:'+', l:newLines[c-1]}); c--; }
            else { ops.unshift({t:'-', l:oldLines[r-1]}); r--; }
        }

        let hasChanges = false;
        ops.forEach(op => {
            if (op.t === '=') {
                html += `<div style="padding:1px 8px;font-family:'Courier New',monospace;font-size:10px;color:var(--text-color);opacity:0.45;white-space:pre-wrap;word-break:break-all;overflow-wrap:break-word;"> ${escHtml(op.l)}</div>`;
            } else if (op.t === '-') {
                hasChanges = true;
                html += `<div style="padding:1px 8px;font-family:'Courier New',monospace;font-size:10px;color:#ef4444;background:rgba(239,68,68,0.1);white-space:pre-wrap;word-break:break-all;overflow-wrap:break-word;">-${escHtml(op.l)}</div>`;
            } else {
                hasChanges = true;
                html += `<div style="padding:1px 8px;font-family:'Courier New',monospace;font-size:10px;color:#10b981;background:rgba(16,185,129,0.1);white-space:pre-wrap;word-break:break-all;overflow-wrap:break-word;">+${escHtml(op.l)}</div>`;
            }
        });
        return { html, hasChanges };
    }

    // ── Editor diff markers — store IDs so we can remove them later ──
    let _editorDiffMarkers = [];

    function _clearEditorDiffMarkers() {
        const session = editor.getSession();
        _editorDiffMarkers.forEach(id => session.removeMarker(id));
        _editorDiffMarkers = [];
        // Clear gutter decorations
        const lines = session.getLength();
        for (let i = 0; i < lines; i++) {
            session.removeGutterDecoration(i, 'ace-diff-remove');
            session.removeGutterDecoration(i, 'ace-diff-add');
        }
    }

    function _showEditorDiffMarkers(edits, targetTab) {
        _clearEditorDiffMarkers();
        const AceRange = ace.require('ace/range').Range;
        const session = editor.getSession();
        const currentCode = (targetTab ? targetTab.content : editor.getValue()).split('\n');

        // If target tab is not active — switch to it so user sees highlights
        if (targetTab && targetTab.id !== activeTabId) switchFileTab(targetTab.id);

        (edits || []).forEach(edit => {
            if (edit.line_start != null) {
                const s = Math.max(0, (edit.line_start || 1) - 1);
                const e = Math.min(currentCode.length - 1, (edit.line_end || edit.line_start || 1) - 1);

                // Red: lines being removed (old lines)
                for (let row = s; row <= e; row++) {
                    const mid = _editorDiffMarkers.push(
                        session.addMarker(new AceRange(row, 0, row, Infinity), 'ace-diff-remove-line', 'fullLine', false)
                    );
                    session.addGutterDecoration(row, 'ace-diff-remove');
                }

                // Green: show where new lines will land (highlight line after removed block)
                const insertRow = Math.min(e + 1, currentCode.length - 1);
                const newLineCount = (edit.replace || '').split('\n').length;
                // Mark insertion point — one marker at the boundary
                _editorDiffMarkers.push(
                    session.addMarker(new AceRange(insertRow, 0, insertRow, Infinity), 'ace-diff-add-line', 'fullLine', false)
                );
                session.addGutterDecoration(insertRow, 'ace-diff-add');

            } else if (edit.find) {
                // find-based: search for the string in code and highlight it red
                const full = currentCode.join('\n');
                const idx = full.indexOf(edit.find);
                if (idx !== -1) {
                    const before = full.slice(0, idx);
                    const startRow = before.split('\n').length - 1;
                    const endRow = startRow + edit.find.split('\n').length - 1;
                    for (let row = startRow; row <= endRow; row++) {
                        _editorDiffMarkers.push(
                            session.addMarker(new AceRange(row, 0, row, Infinity), 'ace-diff-remove-line', 'fullLine', false)
                        );
                        session.addGutterDecoration(row, 'ace-diff-remove');
                    }
                    _editorDiffMarkers.push(
                        session.addMarker(new AceRange(endRow + 1, 0, endRow + 1, Infinity), 'ace-diff-add-line', 'fullLine', false)
                    );
                    session.addGutterDecoration(endRow + 1, 'ace-diff-add');
                }
            }
        });

        // Scroll editor to first changed line
        if (edits && edits[0] && edits[0].line_start != null) {
            editor.scrollToLine(Math.max(0, edits[0].line_start - 3), true, true);
        }
    }

    function _buildInlineEditCard(edits, targetTab) {
        const card = document.createElement('div');
        card.style.cssText = 'border:1px solid var(--glass-border);border-radius:12px;overflow:hidden;margin-top:4px;max-width:100%;';
        const count = edits ? edits.length : 0;

        // ── Show live diff highlights in the editor immediately ──
        _showEditorDiffMarkers(edits, targetTab);

        // Build diff preview for each edit
        const currentCode = (targetTab ? targetTab.content : editor.getValue()).split('\n');
        let diffHTML = '';

        (edits || []).forEach((edit, idx) => {
            let oldLines = [], newLines = [];

            if (edit.line_start != null) {
                const s = Math.max(0, (edit.line_start || 1) - 1);
                const e = Math.min(currentCode.length - 1, (edit.line_end || edit.line_start || 1) - 1);
                const ctxBefore = currentCode.slice(Math.max(0, s-2), s);
                const ctxAfter  = currentCode.slice(e+1, Math.min(currentCode.length, e+3));
                oldLines = [...ctxBefore, ...currentCode.slice(s, e+1), ...ctxAfter];
                newLines = [...ctxBefore, ...(edit.replace || '').split('\n'), ...ctxAfter];
            } else if (edit.find) {
                oldLines = edit.find.split('\n');
                newLines = (edit.replace || '').split('\n');
            }

            const { html, hasChanges } = _buildDiffHTML(oldLines, newLines);
            if (hasChanges) {
                if (count > 1) diffHTML += `<div style="font-size:9px;font-weight:700;color:var(--text-color);opacity:0.4;padding:4px 8px 2px;font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:0.4px;">Edit ${idx+1}</div>`;
                diffHTML += html;
                if (idx < count - 1) diffHTML += `<div style="height:1px;background:var(--glass-border);margin:2px 0;"></div>`;
            }
        });

        const editsJson = JSON.stringify(edits).replace(/"/g,'&quot;');
        const tabId = targetTab ? targetTab.id : 'null';

        card.innerHTML = `
            <div style="background:rgba(16,185,129,0.08);padding:9px 12px;border-bottom:1px solid var(--glass-border);display:flex;align-items:center;gap:8px;">
                <span class="material-icons-round" style="font-size:15px;color:var(--accent);">difference</span>
                <span style="font-size:11px;font-weight:700;color:var(--accent);font-family:'Poppins',sans-serif;flex:1;">${count} edit${count!==1?'s':''} — review changes</span>
                <span style="font-size:9px;font-weight:600;font-family:'Poppins',sans-serif;color:var(--text-color);opacity:0.45;display:flex;align-items:center;gap:3px;">
                    <span style="color:#ef4444;">●</span> removed &nbsp;
                    <span style="color:#10b981;">●</span> added
                </span>
            </div>
            <div style="max-height:180px;overflow-y:auto;overflow-x:hidden;background:rgba(0,0,0,0.15);">${diffHTML || '<div style="padding:10px 12px;font-size:11px;opacity:0.5;font-family:Poppins,sans-serif;">No preview available</div>'}</div>
            <div style="padding:8px 12px;display:flex;gap:7px;border-top:1px solid var(--glass-border);">
                <button onclick="_clearEditorDiffMarkers();_applyInlineEdits(this, ${editsJson}, ${tabId})" style="flex:1;padding:8px;border-radius:9px;border:none;background:var(--accent);color:white;font-size:11px;font-weight:700;font-family:'Poppins',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;">
                    <span class="material-icons-round" style="font-size:14px;pointer-events:none;">check</span>Apply
                </button>
                <button onclick="_clearEditorDiffMarkers();this.closest('div').parentElement.remove()" style="padding:8px 14px;border-radius:9px;border:1px solid var(--glass-border);background:none;color:var(--text-color);font-size:11px;font-weight:600;font-family:'Poppins',sans-serif;cursor:pointer;opacity:0.6;">
                    Cancel
                </button>
            </div>`;
        return card;
    }

    function _applyInlineEdits(btn, edits, tabId) {
        if (!edits || !edits.length) {
            _showApplyError(btn, 'No edits provided by AI. Try asking again.');
            return;
        }

        const snapTab = fileTabs.find(t => t.id === (tabId || activeTabId)) || fileTabs.find(t => t.id === activeTabId);
        if (!snapTab && !editor) {
            _showApplyError(btn, 'Target file not found. Please select the correct file and retry.');
            return;
        }
        const original = snapTab ? snapTab.content : editor.getValue();

        const lines = original.split('\n');
        let applied = 0;
        const failedEdits = [];
        const failReasons = [];

        // Sort edits bottom-to-top so line numbers stay valid after each replacement
        const sorted = [...edits].sort((a, b) => (b.line_start || 0) - (a.line_start || 0));

        sorted.forEach(edit => {
            // ── Line-based edit ──
            if (edit.line_start != null) {
                const s = Math.max(0, (edit.line_start || 1) - 1);
                const e = Math.min(lines.length - 1, (edit.line_end || edit.line_start || 1) - 1);
                // Validate line range
                if (s > lines.length - 1) {
                    failedEdits.push(edit);
                    failReasons.push(`Line ${edit.line_start} is out of range (file has ${lines.length} lines)`);
                    return;
                }
                const newLines = (edit.replace || '').split('\n').map(l =>
                    l.replace(/\t/g, '  ')      // all tabs → 2 spaces
                     .replace(/\s+$/, '')        // trailing whitespace per line
                );
                lines.splice(s, e - s + 1, ...newLines);
                applied++;

            } else if (edit.find != null) {
                // ── Fallback: find-based with whitespace normalization ──
                const fullContent = lines.join('\n');
                if (fullContent.includes(edit.find)) {
                    const updated = fullContent.replace(edit.find, edit.replace || '');
                    lines.splice(0, lines.length, ...updated.split('\n'));
                    applied++;
                } else {
                    // Whitespace-tolerant regex fallback
                    const escaped = edit.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
                    try {
                        const rx = new RegExp(escaped);
                        if (rx.test(fullContent)) {
                            const updated = fullContent.replace(rx, edit.replace || '');
                            lines.splice(0, lines.length, ...updated.split('\n'));
                            applied++;
                        } else {
                            failedEdits.push(edit);
                            failReasons.push(`Text not found: "${(edit.find||'').slice(0,50)}..."`);
                        }
                    } catch(regexErr) {
                        failedEdits.push(edit);
                        failReasons.push(`Regex error: ${regexErr.message}`);
                    }
                }
            } else {
                failedEdits.push(edit);
                failReasons.push('Edit has no line_start and no find — AI returned incomplete edit');
            }
        });

        // ── If NOTHING applied at all — abort, don't touch the file ──
        if (applied === 0 && failedEdits.length > 0) {
            _showApplyError(btn,
                `Nothing could be applied (${failedEdits.length} edit${failedEdits.length!==1?'s':''} failed):\n` +
                failReasons.map((r,i) => `• Edit ${i+1}: ${r}`).join('\n') +
                '\n\nTry rephrasing your request or switching to a smarter model.'
            );
            return;
        }

        // Save undo snapshot ONLY if at least something applied
        _agentUndoStack.push({ type: 'edit_content', tab: snapTab, content: original });
        if (_agentUndoStack.length > 5) _agentUndoStack.shift();

        // Clean up: collapse 3+ blank lines → max 2, remove trailing whitespace per line
        const cleaned = lines
            .map(l => l.replace(/\s+$/, ''))
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')
            .trimEnd();

        // ── Write back to the correct tab ──
        if (snapTab) snapTab.content = cleaned;

        if (!tabId || tabId === activeTabId) {
            editor.setValue(cleaned, -1);
        } else {
            switchFileTab(tabId);
            editor.setValue(cleaned, -1);
        }

        const cardParent = btn.closest('div').parentElement;

        if (failedEdits.length > 0) {
            // Some applied, some failed — show partial result + reasons + retry
            const reasonHTML = failReasons.map((r,i) =>
                `<div style="font-size:10px;font-family:'Poppins',sans-serif;color:#f59e0b;padding:2px 0;">• Edit ${i+1}: ${r}</div>`
            ).join('');

            cardParent.innerHTML = `<div style="border:1px solid rgba(245,158,11,0.3);border-radius:12px;overflow:hidden;">
                <div style="padding:9px 12px;display:flex;align-items:center;gap:7px;background:rgba(245,158,11,0.08);">
                    <span class="material-icons-round" style="font-size:15px;color:#f59e0b;animation:commitSpin 1s linear infinite;">refresh</span>
                    <span style="font-size:11px;font-weight:700;color:#f59e0b;font-family:'Poppins',sans-serif;">${applied} applied · Retrying ${failedEdits.length} failed...</span>
                </div>
                <div style="padding:6px 12px 8px;">${reasonHTML}</div>
            </div>`;

            const allLines = cleaned.split('\n');

            // For each failed edit, extract only ±25 lines context around expected location
            const targetedContext = failedEdits.map((e, i) => {
                let contextLines = '';
                if (e.line_start != null) {
                    // Line-based: grab ±25 lines around expected location
                    const center = Math.max(0, (e.line_start || 1) - 1);
                    const from = Math.max(0, center - 25);
                    const to   = Math.min(allLines.length - 1, center + 25);
                    contextLines = allLines.slice(from, to + 1)
                        .map((l, idx) => `${from + idx + 1}| ${l}`).join('\n');
                } else if (e.find) {
                    // String-based: find nearest match by normalized search
                    const norm = s => s.replace(/\s+/g,' ').trim().slice(0,40);
                    const needle = norm(e.find);
                    let bestLine = -1, bestScore = 0;
                    allLines.forEach((l, idx) => {
                        const score = norm(l).includes(needle.slice(0,20)) ? 1 : 0;
                        if (score > bestScore) { bestScore = score; bestLine = idx; }
                    });
                    const from = Math.max(0, bestLine - 25);
                    const to   = Math.min(allLines.length - 1, (bestLine < 0 ? 25 : bestLine) + 25);
                    contextLines = allLines.slice(from, to + 1)
                        .map((l, idx) => `${from + idx + 1}| ${l}`).join('\n');
                }

                return `## Failed Edit ${i+1}
Original intent: "${e.find ? e.find.slice(0,80) : `lines ${e.line_start}-${e.line_end}`}"
Replacement needed: "${(e.replace||'').slice(0,80)}"

Surrounding code context (line numbers shown):
\`\`\`
${contextLines}
\`\`\``;
            }).join('\n\n---\n\n');

            const retrySystemPrompt = `You are a code edit assistant. The following edits FAILED because the target location could not be found.

For each failed edit, the surrounding code context is provided with line numbers.
Find the CORRECT line range in the provided context and return updated edits.

Return ONLY valid JSON:
{
  "type": "edit",
  "explanation": "Corrected location for failed edits",
  "edits": [
    { "line_start": N, "line_end": N, "replace": "exact replacement" }
  ]
}

Use only line numbers visible in the context. Be precise.`;

            _callAgentAPI(retrySystemPrompt, targetedContext).then(raw => {
                try {
                    const parsed = _tryParseJSON(raw);
                    if (!parsed) throw new Error('No JSON');
                    if (parsed.type === 'edit' && parsed.edits?.length) {
                        cardParent.innerHTML = '';
                        const retryCard = _buildInlineEditCard(parsed.edits, snapTab);
                        cardParent.appendChild(retryCard);
                        _inlineAppendMsg('agent', `↩ ${failedEdits.length} block${failedEdits.length>1?'s':''} relocated — review and apply:`);
                    } else {
                        throw new Error('no edits');
                    }
                } catch(parseErr) {
                    cardParent.innerHTML = `<div style="border:1px solid rgba(239,68,68,0.3);border-radius:12px;overflow:hidden;">
                        <div style="padding:9px 12px;display:flex;align-items:center;gap:7px;background:rgba(239,68,68,0.08);">
                            <span class="material-icons-round" style="font-size:15px;color:#ef4444;">error</span>
                            <span style="font-size:11px;font-weight:700;color:#ef4444;font-family:'Poppins',sans-serif;flex:1;">${applied} applied · ${failedEdits.length} block${failedEdits.length!==1?'s':''} could not be relocated</span>
                        </div>
                        <div style="padding:6px 12px 10px;">
                            <div style="font-size:10px;color:var(--text-color);opacity:0.6;font-family:'Poppins',sans-serif;margin-bottom:6px;">Reason: AI retry returned invalid response</div>
                            ${failReasons.map((r,i) => `<div style="font-size:10px;color:#ef4444;font-family:'Poppins',sans-serif;padding:1px 0;">• ${r}</div>`).join('')}
                            <div style="font-size:10px;color:var(--text-color);opacity:0.45;font-family:'Poppins',sans-serif;margin-top:6px;">Try rephrasing your request or use a smarter model (Gemini/OpenAI).</div>
                        </div>
                    </div>`;
                }
            }).catch(netErr => {
                cardParent.innerHTML = `<div style="border:1px solid rgba(239,68,68,0.3);border-radius:12px;overflow:hidden;">
                    <div style="padding:9px 12px;display:flex;align-items:center;gap:7px;background:rgba(239,68,68,0.08);">
                        <span class="material-icons-round" style="font-size:15px;color:#ef4444;">wifi_off</span>
                        <span style="font-size:11px;font-weight:700;color:#ef4444;font-family:'Poppins',sans-serif;flex:1;">Retry failed — network error</span>
                    </div>
                    <div style="padding:6px 12px 10px;font-size:10px;color:var(--text-color);opacity:0.55;font-family:'Poppins',sans-serif;">
                        ${(netErr?.message||'Connection issue').slice(0,100)}<br>
                        Check your internet and try again.
                    </div>
                </div>`;
            });

        } else {
            // All applied — show success + undo + feedback buttons
            const undoCount = _agentUndoStack.length;

            // Human-readable summary for history so AI knows what was done
            const editSummary = (edits||[]).map((e, i) => {
                const loc = e.line_start != null ? `lines ${e.line_start}-${e.line_end}` : `"${(e.find||'').slice(0,40)}"`;
                return `Edit ${i+1}: replaced ${loc} with: "${(e.replace||'').slice(0,60).replace(/\n/g,' ')}"`;
            }).join('\n');

            cardParent.innerHTML = `<div style="border:1px solid var(--glass-border);border-radius:12px;overflow:hidden;">
                <div style="padding:8px 12px;display:flex;align-items:center;gap:8px;background:rgba(16,185,129,0.08);">
                    <span class="material-icons-round" style="font-size:15px;color:var(--accent);">check_circle</span>
                    <span style="font-size:11px;font-weight:700;color:var(--accent);font-family:'Poppins',sans-serif;flex:1;">${applied} edit${applied!==1?'s':''} applied <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polyline points="20 6 9 17 4 12"/></svg></span>
                    <button onclick="_agentUndoLast(this)" title="Undo" style="background:rgba(128,128,128,0.12);border:1px solid var(--glass-border);border-radius:8px;padding:4px 10px;font-size:10px;font-weight:700;font-family:'Poppins',sans-serif;color:var(--text-color);cursor:pointer;display:flex;align-items:center;gap:4px;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"><path d="M3 7v6h6"/><path d="M3 13C5.5 6.5 13 4 18 8s5 10 1 14"/></svg>
                        Undo (${undoCount})
                    </button>
                </div>
                <div style="padding:8px 12px;border-top:1px solid var(--glass-border);display:flex;gap:7px;">
                    <button onclick="_inlineReportNotWorking(this)" style="flex:1;padding:7px;border-radius:9px;border:1px solid rgba(239,68,68,0.35);background:rgba(239,68,68,0.07);color:#ef4444;font-size:11px;font-weight:700;font-family:'Poppins',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;">
                        <span class="material-icons-round" style="font-size:14px;pointer-events:none;">thumb_down</span>Didn't work
                    </button>
                    <button onclick="_inlineConfirmWorking(this)" style="flex:1;padding:7px;border-radius:9px;border:1px solid rgba(16,185,129,0.35);background:rgba(16,185,129,0.07);color:var(--accent);font-size:11px;font-weight:700;font-family:'Poppins',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;">
                        <span class="material-icons-round" style="font-size:14px;pointer-events:none;">thumb_up</span>Looks good
                    </button>
                </div>
            </div>`;

            // Push applied summary to chat history so AI has full context next turn
            _inlineChatHistory.push({
                role: 'assistant',
                content: `[APPLIED ${applied} edit${applied!==1?'s':''}]\n${editSummary}`
            });

            showToast(`${applied} edit${applied!==1?'s':''} applied`, 'check_circle');
        }
    }

    // ── Show apply error in card — clear markers too ──
    function _showApplyError(btn, message) {
        _clearEditorDiffMarkers();
        const cardParent = btn.closest('div').parentElement;
        const lines = message.split('\n');
        const title = lines[0];
        const details = lines.slice(1).filter(Boolean);
        cardParent.innerHTML = `<div style="border:1px solid rgba(239,68,68,0.3);border-radius:12px;overflow:hidden;">
            <div style="padding:9px 12px;display:flex;align-items:center;gap:7px;background:rgba(239,68,68,0.08);">
                <span class="material-icons-round" style="font-size:15px;color:#ef4444;">error_outline</span>
                <span style="font-size:11px;font-weight:700;color:#ef4444;font-family:'Poppins',sans-serif;flex:1;">${title}</span>
            </div>
            ${details.length ? `<div style="padding:8px 12px 10px;">
                ${details.map(d => `<div style="font-size:10px;color:var(--text-color);opacity:0.7;font-family:'Poppins',sans-serif;padding:2px 0;line-height:1.5;">${d}</div>`).join('')}
            </div>` : ''}
        </div>`;
        _inlineChatHistory.push({ role: 'assistant', content: `[APPLY FAILED] ${title}` });
    }

    // ── Undo last agent edit — restores most recent snapshot ──
    function _agentUndoLast(btn) {
        if (_agentUndoStack.length === 0) { showToast('Nothing to undo', 'info'); return; }
        const prev = _agentUndoStack.pop();
        // prev can be: string (old content) or { type, tab, content } or { type:'new_file', filename }
        if (typeof prev === 'string') {
            const curTab = fileTabs.find(t => t.id === activeTabId);
            if (curTab) curTab.content = prev;
            editor.setValue(prev, -1);
        } else if (prev && prev.type === 'edit_content') {
            const t = prev.tab || fileTabs.find(t => t.id === activeTabId);
            if (t) t.content = prev.content;
            if (!prev.tab || prev.tab.id === activeTabId) editor.setValue(prev.content, -1);
            else { switchFileTab(prev.tab.id); editor.setValue(prev.content, -1); }
        } else if (prev && prev.type === 'new_file') {
            // Undo new_file = close that tab
            const tabToClose = fileTabs.find(t => t.name === prev.filename);
            if (tabToClose) closeFileTab(tabToClose.id);
        }
        if (btn) {
            const remaining = _agentUndoStack.length;
            btn.textContent = remaining > 0 ? `Undo (${remaining} left)` : 'Undone';
            if (remaining === 0) btn.style.opacity = '0.35';
        }
        showToast('Undone', 'undo');
    }

    // ── "Didn't work" — re-send full current code + full history to AI for re-analysis ──
    function _inlineReportNotWorking(btn) {
        const card = btn.closest('div').parentElement;
        card.innerHTML = `<div style="padding:9px 12px;display:flex;align-items:center;gap:7px;background:rgba(245,158,11,0.08);border-radius:12px;border:1px solid rgba(245,158,11,0.25);">
            <span class="material-icons-round" style="font-size:15px;color:#f59e0b;animation:commitSpin 1s linear infinite;">refresh</span>
            <span style="font-size:11px;font-weight:700;color:#f59e0b;font-family:'Poppins',sans-serif;">Re-analysing with full context...</span>
        </div>`;

        // Get current (post-apply) code
        const targetTab = fileTabs.find(t => t.id === ((_agentTargetTabId) || activeTabId)) || fileTabs.find(t => t.id === activeTabId);
        const curTab = fileTabs.find(t => t.id === activeTabId);
        if (curTab) curTab.content = editor.getValue();
        const code = targetTab ? targetTab.content : editor.getValue();
        const filename = targetTab ? targetTab.name : 'untitled';

        const _provider = _activeAgent()?.provider || '';
        const _MAX_CHARS = { groq: 60000, gemini: Infinity, openai: Infinity, anthropic: Infinity, openrouter: 80000, deepseek: 80000 }[_provider] ?? 80000;
        let numberedCode = code.split('\n').map((l, i) => `${i+1}| ${l}`).join('\n');
        if (numberedCode.length > _MAX_CHARS) {
            const lines = numberedCode.split('\n');
            const headLines = Math.floor(_MAX_CHARS * 0.65 / 80);
            const tailLines = Math.floor(_MAX_CHARS * 0.30 / 80);
            const skipped = lines.length - headLines - tailLines;
            numberedCode = lines.slice(0, headLines).join('\n') + `\n\n// <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> [${skipped} lines omitted]\n\n` + lines.slice(-tailLines).join('\n');
        }

        // Collect session events for context
        const sessionEvents2 = _inlineChatHistory
            .filter(m => m.content.startsWith('[APPLIED') || m.content.startsWith('[CONFIRMED') || m.content.startsWith('[REJECTED') || m.content.startsWith('[USER CONFIRMED'))
            .map(m => m.content).join('\n');
        const sessionSummaryBlock2 = sessionEvents2 ? `\n\n── SESSION EVENTS ──\n${sessionEvents2}` : '';

        // Build re-analysis message — full current code + all context
        const reAnalyseMsg = `── CURRENT FILE: ${filename} ──${sessionSummaryBlock2}\n\n── FULL CODE (current state, after previous fix was applied) ──\n\`\`\`\n${numberedCode}\n\`\`\`\n\n── USER REPORT ──\nThe previous fix was applied but the issue is STILL present. Analyse the current code above carefully — it already includes the previous changes. Identify what is still wrong and provide a corrected fix.`;

        // Include full chat history so AI sees the full conversation context
        const historyForAPI = _buildHistoryForAPI();

        _callAgentAPI(_AGENT_SYSTEM_PROMPT, reAnalyseMsg, historyForAPI).then(raw => {
            // Save to history
            _inlineChatHistory.push({ role: 'user', content: reAnalyseMsg });
            _inlineChatHistory.push({ role: 'assistant', content: raw });

            let parsed = null;
            const pR = _tryParseJSON(raw); if (pR) parsed = pR;

            card.innerHTML = '';

            if (!parsed || !parsed.type) {
                _inlineAppendMsg('agent', raw.trim());
            } else if (parsed.type === 'edit') {
                _inlineAppendMsg('agent', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg> ' + (parsed.explanation || 'Revised fix — review and apply:'));
                const newCard = _buildInlineEditCard(parsed.edits, targetTab);
                _inlineAppendMsg('agent', '', newCard);
            } else if (parsed.type === 'reorganize') {
                _inlineAppendMsg('agent', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg> ' + (parsed.explanation || 'Revised reorganize:'));
                const newCard = _buildInlineReorganizeCard(parsed.content, targetTab);
                _inlineAppendMsg('agent', '', newCard);
            } else {
                _inlineAppendMsg('agent', raw.trim());
            }
            _inlineChatScroll();
        }).catch(err => {
            card.innerHTML = `<div style="padding:9px 12px;font-size:11px;color:#ef4444;font-family:'Poppins',sans-serif;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Re-analysis failed: ${(err.message||'').slice(0,80)}</div>`;
        });
    }

    // ── "Looks good" — dismiss card, add positive confirmation to history ──
    function _inlineConfirmWorking(btn) {
        btn.closest('div').parentElement.innerHTML = `<div style="padding:8px 12px;display:flex;align-items:center;gap:7px;background:rgba(16,185,129,0.06);border-radius:12px;border:1px solid rgba(16,185,129,0.2);">
            <span class="material-icons-round" style="font-size:15px;color:var(--accent);">verified</span>
            <span style="font-size:11px;font-weight:600;color:var(--accent);font-family:'Poppins',sans-serif;">Fix confirmed <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polyline points="20 6 9 17 4 12"/></svg></span>
        </div>`;
        _inlineChatHistory.push({ role: 'user', content: '[USER CONFIRMED: the fix worked correctly]' });
        showToast('Fix confirmed!', 'verified');
    }

    function _applyInlineSplit(btn, files) {
        if (!files || !files.length) return;
        files.forEach(f => openFileInTab(f.filename, f.content, true));
        btn.closest('div').parentElement.innerHTML = `<div style="padding:9px 12px;display:flex;align-items:center;gap:7px;background:rgba(16,185,129,0.08);border-radius:12px;">
            <span class="material-icons-round" style="font-size:15px;color:var(--accent);">check_circle</span>
            <span style="font-size:11px;font-weight:700;color:var(--accent);font-family:'Poppins',sans-serif;">${files.length} files created</span>
        </div>`;
        showToast(`${files.length} files created`, 'call_split');
    }

    function _applyInlineNewFile(btn, filename, content) {
        openFileInTab(filename, content, true);
        btn.closest('div').parentElement.innerHTML = `<div style="padding:9px 12px;display:flex;align-items:center;gap:7px;background:rgba(16,185,129,0.08);border-radius:12px;">
            <span class="material-icons-round" style="font-size:15px;color:var(--accent);">check_circle</span>
            <span style="font-size:11px;font-weight:700;color:var(--accent);font-family:'Poppins',sans-serif;">${filename} created</span>
        </div>`;
        showToast(`${filename} created`, 'add_circle');
    }

    // ── Universal Apply/Decline confirm card ──
    // Used for new_file, split, reorganize — all go through here
    function _buildConfirmCard({ type, icon, title, lines, onApply }) {
        const card = document.createElement('div');
        card.style.cssText = 'border:1px solid var(--glass-border);border-radius:12px;overflow:hidden;margin-top:4px;';

        const linesHTML = (lines||[]).map(l =>
            `<div style="font-size:10px;font-family:'Poppins',sans-serif;color:var(--text-color);opacity:0.7;padding:2px 0;display:flex;align-items:center;gap:6px;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                ${l}
            </div>`
        ).join('');

        card.innerHTML = `
            <div style="background:rgba(16,185,129,0.08);padding:9px 12px;border-bottom:1px solid var(--glass-border);display:flex;align-items:center;gap:8px;">
                <span class="material-icons-round" style="font-size:15px;color:var(--accent);pointer-events:none;">${icon}</span>
                <span style="font-size:11px;font-weight:700;color:var(--accent);font-family:'Poppins',sans-serif;flex:1;">${title}</span>
            </div>
            ${linesHTML ? `<div style="padding:8px 12px 4px;">${linesHTML}</div>` : ''}
            <div style="padding:8px 12px;display:flex;gap:7px;" id="confirm-card-actions-${Date.now()}">
                <button class="confirm-apply-btn" style="flex:1;padding:9px;border-radius:9px;border:none;background:var(--accent);color:white;font-size:11px;font-weight:700;font-family:'Poppins',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:opacity 0.15s,transform 0.15s;">
                    <span class="material-icons-round" style="font-size:14px;pointer-events:none;">check</span>Apply
                </button>
                <button class="confirm-decline-btn" style="padding:9px 16px;border-radius:9px;border:1px solid var(--glass-border);background:none;color:var(--text-color);font-size:11px;font-weight:600;font-family:'Poppins',sans-serif;cursor:pointer;opacity:0.6;transition:opacity 0.15s;">
                    Decline
                </button>
            </div>`;

        const applyBtn = card.querySelector('.confirm-apply-btn');
        const declineBtn = card.querySelector('.confirm-decline-btn');
        const actRow = card.querySelector('[id^="confirm-card-actions"]');

        applyBtn.onclick = () => {
            onApply();
            actRow.outerHTML = `<div style="padding:8px 12px;display:flex;align-items:center;gap:7px;background:rgba(16,185,129,0.06);">
                <span class="material-icons-round" style="font-size:14px;color:var(--accent);">check_circle</span>
                <span style="font-size:11px;font-weight:700;color:var(--accent);font-family:'Poppins',sans-serif;flex:1;">Applied <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polyline points="20 6 9 17 4 12"/></svg></span>
                <button onclick="_agentUndoLast(this)" style="background:rgba(128,128,128,0.12);border:1px solid var(--glass-border);border-radius:8px;padding:3px 10px;font-size:10px;font-weight:700;font-family:'Poppins',sans-serif;color:var(--text-color);cursor:pointer;display:flex;align-items:center;gap:4px;">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="pointer-events:none;"><path d="M3 7v6h6"/><path d="M3 13C5.5 6.5 13 4 18 8s5 10 1 14"/></svg>
                    Undo
                </button>
            </div>`;
        };
        declineBtn.onclick = () => {
            actRow.outerHTML = `<div style="padding:8px 12px;display:flex;align-items:center;gap:7px;background:rgba(239,68,68,0.05);">
                <span class="material-icons-round" style="font-size:14px;color:#ef4444;opacity:0.7;">cancel</span>
                <span style="font-size:11px;font-weight:600;color:var(--text-color);font-family:'Poppins',sans-serif;opacity:0.5;">Declined</span>
            </div>`;
            _inlineChatHistory.push({ role: 'user', content: '[USER DECLINED the suggested change]' });
        };
        return card;
    }

    // ── Inline chat: populate model dropdown ──
    function _inlinePopulateModels() {
        const activeAg = _activeAgent();
        const modelLabel = document.getElementById('inline-model-label');
        if (modelLabel) modelLabel.textContent = activeAg ? activeAg.providerName : 'Select Model';
        // Remove no-agent banner if showing
        if (activeAg) { const b = document.getElementById('inline-no-agent-banner'); if(b) b.remove(); }
    }

    let _modelDropdownCloseHandler = null;

function _inlineToggleModelDropdown() {
    const dd = document.getElementById('inline-model-dropdown');
    const chevron = document.getElementById('inline-model-chevron');
    if (!dd) return;

    // Ensure dropdown has proper positioning for visibility
    if (!dd.style.position) {
        dd.style.position = 'absolute';
        dd.style.top = '100%';
        dd.style.left = '0';
        dd.style.right = '0';
        dd.style.zIndex = '1000';
        dd.style.background = 'var(--glass-bg)';
        dd.style.border = '1px solid var(--glass-border)';
        dd.style.borderRadius = '12px';
        dd.style.boxShadow = '0 4px 20px rgba(0,0,0,0.10)';
        dd.style.maxHeight = '300px';
        dd.style.overflowY = 'auto';
        dd.style.marginTop = '4px';
    }

    const isOpen = dd.style.display === 'block';
    if (isOpen) {
        _inlineCloseModelDropdown();
    } else {
        _inlineRenderModelDropdown();
        dd.style.display = 'block';
        if(chevron) chevron.style.transform = 'rotate(180deg)';

        // Remove any orphan listener before adding new one
        if(_modelDropdownCloseHandler) {
            document.removeEventListener('click', _modelDropdownCloseHandler);
        }

        // Create handler that checks for clicks outside dropdown
        _modelDropdownCloseHandler = (e) => {
            // Don't close if clicking inside the dropdown
            if (dd.contains(e.target)) return;
            _inlineCloseModelDropdown();
        };

        setTimeout(() => document.addEventListener('click', _modelDropdownCloseHandler, { once: true }), 50);
    }
}

    function _inlineCloseModelDropdown() {
        const dd = document.getElementById('inline-model-dropdown');
        const chevron = document.getElementById('inline-model-chevron');
        if(dd) dd.style.display = 'none';
        if(chevron) chevron.style.transform = 'rotate(0deg)';
        // Remove pending close handler so it never fires as orphan
        if(_modelDropdownCloseHandler) {
            document.removeEventListener('click', _modelDropdownCloseHandler);
            _modelDropdownCloseHandler = null;
        }
    }

    function _inlineRenderModelDropdown() {
        const dd = document.getElementById('inline-model-dropdown');
        if (!dd) return;
        dd.innerHTML = '';
        if (agentList.length === 0) {
            dd.innerHTML = `<div style="padding:12px;font-size:11px;color:var(--text-color);opacity:0.5;font-family:'Poppins',sans-serif;text-align:center;">No agents connected</div>
            <div style="padding:0 10px 10px;"><button onclick="_inlineCloseModelDropdown();openAgentModal();" style="width:100%;padding:8px;border-radius:8px;border:none;background:var(--accent);color:white;font-size:11px;font-weight:600;font-family:'Poppins',sans-serif;cursor:pointer;">Add Agent</button></div>`;
            return;
        }
        // Group agents by category
        const _catOrder = ['Coding','Reasoning','General','Nvidia','Auto'];
        const _catColors = { Coding:'#10b981', Reasoning:'#8b5cf6', General:'#3b82f6', Nvidia:'#f59e0b', Auto:'#6b7280' };
        const _catIcons = {
            Coding:    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
            Reasoning: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
            General:   '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>',
            Nvidia:    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
            Auto:      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        };
        // Group by category — non-openrouter agents go under their provider name
        const groups = {};
        agentList.forEach((ag, i) => {
            const cat = ag.category || ag.provider || 'Other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push({ ag, i });
        });
        // Render in order
        const orderedCats = [..._catOrder.filter(c => groups[c]), ...Object.keys(groups).filter(c => !_catOrder.includes(c))];
        orderedCats.forEach(cat => {
            // Category header
            const color = _catColors[cat] || 'var(--accent)';
            const iconSvg = _catIcons[cat] || _catIcons.General;
            const hdr = document.createElement('div');
            hdr.style.cssText = `display:flex;align-items:center;gap:5px;padding:6px 14px 4px;margin-top:2px;`;
            hdr.innerHTML = `<span style="color:${color};display:flex;align-items:center;">${iconSvg.replace('stroke="currentColor"','stroke="'+color+'"')}</span><span style="font-size:9px;font-weight:700;color:${color};font-family:Poppins,sans-serif;letter-spacing:0.05em;text-transform:uppercase;">${cat}</span>`;
            dd.appendChild(hdr);
            // Models in this category
            groups[cat].forEach(({ ag, i }) => {
                const isSelected = i === activeAgentIdx;
                const row = document.createElement('div');
                row.style.cssText = `display:flex;align-items:center;gap:10px;padding:8px 14px 8px 24px;cursor:pointer;border-bottom:1px solid var(--glass-border);background:${isSelected ? 'var(--accent-dim)' : 'transparent'};transition:background 0.15s;`;
                row.innerHTML = `
                    <span style="flex:1;font-size:12px;font-weight:600;color:${isSelected ? 'var(--accent)' : 'var(--text-color)'};font-family:'Poppins',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none;">${ag.providerName}</span>
                    ${ag.tag ? `<span style="font-size:8px;font-weight:700;padding:2px 5px;border-radius:4px;flex-shrink:0;font-family:'Poppins',sans-serif;color:${ag.tagColor||'var(--accent)'};background:${ag.tagColor||'var(--accent)'}22;pointer-events:none;">${ag.tag}</span>` : ''}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" style="pointer-events:none;opacity:${isSelected ? '1' : '0'};flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>`;
                row.ontouchstart = () => { row.style.background = 'var(--accent-dim)'; };
                row.onclick = (e) => {
                    e.stopPropagation();
                    _inlineSwitchModel(i);
                    _inlineCloseModelDropdown();
                };
                dd.appendChild(row);
            });
        });
        // Divider + Settings
        const divider = document.createElement('div');
        divider.style.cssText = 'height:1px;background:var(--glass-border);margin:0;';
        dd.appendChild(divider);
        const settings = document.createElement('div');
        settings.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:background 0.15s;';
        settings.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-color)" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;pointer-events:none;opacity:0.5;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            <span style="font-size:12px;font-weight:600;color:var(--text-color);opacity:0.6;font-family:'Poppins',sans-serif;pointer-events:none;">Agent Settings</span>`;
        settings.ontouchstart = () => { settings.style.background = 'rgba(128,128,128,0.08)'; };
        settings.onclick = (e) => { e.stopPropagation(); _inlineCloseModelDropdown(); openAgentModal(); };
        dd.appendChild(settings);
    }

    // ── Inline chat: switch active model from dropdown ──
    function _inlineSwitchModel(idx) {
        activeAgentIdx = parseInt(idx) || 0;
        _saveAgentList();
        const ag = _activeAgent();
        if (ag) {
            document.getElementById('inline-chat-name').textContent = ag.providerName;
            const ml = document.getElementById('inline-model-label');
            if (ml) ml.textContent = ag.providerName;
        }
    }

    // ── Inline chat: custom file selector dropdown ──
    let _inlineSelectedTabId = null;

    function _inlinePopulateTabs() {
        _inlineSelectedTabId = activeTabId;
        _inlineRenderFileDropdown();
    }

    function _inlineToggleFileDropdown(e) {
        if (e) e.stopPropagation();
        const dd = document.getElementById('inline-file-dropdown');
        const chevron = document.getElementById('inline-file-chevron');
        const trigger = document.getElementById('inline-file-trigger');
        if (!dd) return;
        const isOpen = dd.style.display === 'block';
        if (isOpen) {
            dd.style.display = 'none';
            if(chevron) chevron.style.transform = 'rotate(0deg)';
            if(trigger) { trigger.style.borderColor = 'var(--glass-border)'; trigger.style.background = 'rgba(128,128,128,0.1)'; }
        } else {
            _inlineRenderFileDropdown();
            dd.style.display = 'block';
            if(chevron) chevron.style.transform = 'rotate(180deg)';
            if(trigger) { trigger.style.borderColor = 'var(--accent)'; trigger.style.background = 'var(--accent-dim)'; }
            // Close on outside tap
            setTimeout(() => {
                document.addEventListener('click', _inlineCloseFileDropdown, { once: true });
            }, 50);
        }
    }

    function _inlineCloseFileDropdown(e) {
        // If click was on the trigger button itself, let _inlineToggleFileDropdown handle it
        const trigger = document.getElementById('inline-file-trigger');
        if (e && trigger && trigger.contains(e.target)) return;
        const dd = document.getElementById('inline-file-dropdown');
        const chevron = document.getElementById('inline-file-chevron');
        if(dd) dd.style.display = 'none';
        if(chevron) chevron.style.transform = 'rotate(0deg)';
        if(trigger) { trigger.style.borderColor = 'var(--glass-border)'; trigger.style.background = 'rgba(128,128,128,0.1)'; }
    }

    // ── Context tab IDs — files user has explicitly ticked as context ──
    let _inlineContextTabIds = new Set();

    function _inlineRenderFileDropdown() {
        const dd = document.getElementById('inline-file-dropdown');
        const label = document.getElementById('inline-file-label');
  if (!dd) return;
  dd.innerHTML = '';
  dd.style.maxHeight = '300px';
  dd.style.overflowY = 'auto';

        // ── Section header ──
        const header = document.createElement('div');
        header.style.cssText = 'padding:6px 12px 4px;font-size:9px;font-weight:700;color:var(--text-color);opacity:0.4;text-transform:uppercase;letter-spacing:0.6px;border-bottom:1px solid var(--glass-border);';
        header.textContent = 'Target File';
        dd.appendChild(header);

        // ── "New File" option ──
        const isNewSelected = _inlineSelectedTabId === 'new';
        const newRow = document.createElement('div');
        newRow.style.cssText = `display:flex;align-items:center;gap:8px;padding:9px 12px;cursor:pointer;border-bottom:1px solid var(--glass-border);transition:background 0.15s;background:${isNewSelected ? 'rgba(16,185,129,0.12)' : 'transparent'};`;
        newRow.innerHTML = `
            <span class="material-icons-round" style="font-size:14px;color:var(--accent);pointer-events:none;">add_circle</span>
            <span style="flex:1;font-size:11px;font-weight:700;color:var(--accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> New File</span>
            <span class="material-icons-round" style="font-size:14px;color:var(--accent);pointer-events:none;opacity:${isNewSelected ? '1' : '0'};">radio_button_checked</span>`;
        newRow.ontouchstart = () => newRow.style.background = 'rgba(16,185,129,0.12)';
        newRow.onclick = (e) => {
            e.stopPropagation();
            _inlineSelectedTabId = 'new';
            _agentTargetTabId = null;
            if(label) label.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> New File';
            _inlineCloseFileDropdown();
            _inlineRenderFileDropdown();
        };
        dd.appendChild(newRow);

        // ── Existing file tabs — tap = set as target, long context icon = toggle context ──
        fileTabs.forEach(t => {
            const isTarget = t.id === _inlineSelectedTabId;
            const isCtx = _inlineContextTabIds.has(t.id) && !isTarget;
            const row = document.createElement('div');
            row.style.cssText = `display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--glass-border);transition:background 0.15s;background:${isTarget ? 'var(--accent-dim)' : isCtx ? 'rgba(16,185,129,0.05)' : 'transparent'};`;
            row.innerHTML = `
                <span class="material-icons-round" style="font-size:14px;color:${isTarget ? 'var(--accent)' : 'var(--text-color)'};opacity:${isTarget ? '1' : '0.45'};pointer-events:none;">insert_drive_file</span>
                <span style="flex:1;font-size:11px;font-weight:600;color:var(--text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none;">${t.name}</span>
                <span title="Add as context" style="display:flex;align-items:center;padding:3px 5px;border-radius:5px;cursor:pointer;pointer-events:auto;background:${isCtx ? 'var(--accent-dim)' : 'transparent'};" id="ctx-btn-${t.id}">
                    <span class="material-icons-round" style="font-size:13px;color:${isCtx ? 'var(--accent)' : 'var(--text-color)'};opacity:${isCtx ? '1' : '0.3'};pointer-events:none;">library_books</span>
                </span>
                <span class="material-icons-round" style="font-size:14px;color:var(--accent);pointer-events:none;opacity:${isTarget ? '1' : '0'};">radio_button_checked</span>`;

            // Tap row = set as target file
            row.ontouchstart = () => { if(!event?.target?.closest('[id^="ctx-btn"]')) row.style.background = 'var(--accent-dim)'; };
            row.onclick = (e) => {
                e.stopPropagation();
                if (e.target.closest(`[id="ctx-btn-${t.id}"]`)) {
                    // Toggle context
                    if (_inlineContextTabIds.has(t.id)) _inlineContextTabIds.delete(t.id);
                    else _inlineContextTabIds.add(t.id);
                    _inlineRenderFileDropdown();
                    return;
                }
                // Set as target
                _inlineSelectedTabId = t.id;
                _agentTargetTabId = t.id;
                _inlineContextTabIds.delete(t.id); // target can't also be context
                if(label) label.textContent = t.name;
                _inlineCloseFileDropdown();
                _inlineRenderFileDropdown();
            };
            dd.appendChild(row);
        });

        // ── Context legend ──
        const legend = document.createElement('div');
        const ctxCount = _inlineContextTabIds.size;
        legend.style.cssText = 'padding:6px 12px;font-size:9px;color:var(--text-color);opacity:0.4;font-family:Poppins,sans-serif;border-top:1px solid var(--glass-border);';
        legend.innerHTML = ctxCount > 0
            ? `<span style="color:var(--accent);opacity:0.8;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> ${ctxCount} context file${ctxCount>1?'s':''} added</span> &nbsp;— tap <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> to set target, tap <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> to toggle context`
            : `Tap row = set target &nbsp;|&nbsp; Tap <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> = add as context`;
        dd.appendChild(legend);

        // Update label
        if (label) {
            if (_inlineSelectedTabId === 'new') {
                label.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> New File';
            } else {
                const activeTab = fileTabs.find(t => t.id === _inlineSelectedTabId) || fileTabs.find(t => t.id === activeTabId);
                const ctxTxt = ctxCount > 0 ? ` +${ctxCount}ctx` : '';
                if (activeTab) label.textContent = activeTab.name + ctxTxt;
            }
        }
    }

    // ── Inline chat: attachment handling ──
    let _inlineAttachment = null;

    function _inlineTriggerAttach() {
        const inp = document.getElementById('inline-chat-file-input');
        if (!inp) return;
        inp.click();
    }

    // Dedicated listener for inline chat file input — no conflict with agent-file-input
    document.getElementById('inline-chat-file-input').addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        if (file.size > 20 * 1024 * 1024) { showToast('File too large (max 20MB)', 'error_outline'); e.target.value = ''; return; }
        const isBinary = /\.(png|jpg|jpeg|gif|webp|bmp|ico|svg|pdf|zip|rar|7z|tar|gz|exe|bin|wasm|ttf|otf|woff|woff2|mp3|mp4|wav|ogg|avi|mov|mkv)$/i.test(file.name);
        const r = new FileReader();
        if (isBinary) {
            r.onload = ev => {
                const sizeKB = (file.size / 1024).toFixed(1);
                _inlineAttachment = { name: file.name, content: `[Binary file: ${file.name}, size: ${sizeKB}KB, type: ${file.type || 'unknown'}]` };
                const bar  = document.getElementById('inline-attach-bar');
                const name = document.getElementById('inline-attach-name');
                if (bar)  bar.style.display = 'flex';
                if (name) name.textContent = file.name;
            };
            r.readAsArrayBuffer(file);
        } else {
            r.onload = ev => {
                _inlineAttachment = { name: file.name, content: ev.target.result };
                const bar  = document.getElementById('inline-attach-bar');
                const name = document.getElementById('inline-attach-name');
                if (bar)  bar.style.display = 'flex';
                if (name) name.textContent = file.name;
            };
            r.readAsText(file);
        }
        e.target.value = '';
    });

    function _inlineClearAttach() {
        _inlineAttachment = null;
        const bar = document.getElementById('inline-attach-bar');
        if (bar) bar.style.display = 'none';
    }

    // ── Chat Mode ──
    // When enabled: AI only chats (explains/analyses), never edits.
    // All code in response goes to canvas. No apply/edit cards shown.
    // _inlineChatModeOn declared early at top (default: true)
    // When Chat Mode is ON, user can additionally grant AI read-access to target file code.
    // Default OFF — AI gets empty code in chat mode unless user explicitly enables this.
    // _chatCodeAccessOn declared early at top (default: false)

    // Chat mode switch toast — centered, animated icon swap
    function _showChatModeToast(isChatMode) {
        let t = document.getElementById('chat-mode-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'chat-mode-toast';
            t.style.cssText = [
                'position:fixed',
                'left:50%',
                'top:50%',
                'transform:translate(-50%,-50%) scale(0.85)',
                'background:var(--glass-bg)',
                'border:1px solid var(--glass-border)',
                'color:var(--text-color)',
                'padding:14px 24px',
                'border-radius:20px',
                'font-size:13px',
                'font-weight:700',
                'font-family:Poppins,sans-serif',
                'display:flex',
                'align-items:center',
                'gap:10px',
                'z-index:99999',
                'opacity:0',
                'pointer-events:none',
                'white-space:nowrap',
                'box-shadow:0 4px 20px rgba(0,0,0,0.10)',
                'transition:opacity 0.22s ease, transform 0.28s cubic-bezier(0.34,1.56,0.64,1)'
            ].join(';');
            document.body.appendChild(t);
        }

        // Animated swap: icon flips out, new one flips in
        const iconWrap = document.createElement('span');
        iconWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;flex-shrink:0;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);';

        if (isChatMode) {
            iconWrap.style.background = 'rgba(16,185,129,0.18)';
            iconWrap.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
            t.style.borderColor = 'rgba(16,185,129,0.35)';
        } else {
            iconWrap.style.background = 'rgba(245,158,11,0.18)';
            iconWrap.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
            t.style.borderColor = 'rgba(245,158,11,0.35)';
        }

        const label = document.createElement('span');
        label.textContent = isChatMode ? 'Chat Mode ON' : 'Edit Mode ON';
        label.style.color = isChatMode ? '#10b981' : '#f59e0b';

        t.innerHTML = '';
        t.appendChild(iconWrap);
        t.appendChild(label);

        // Position: above chat panel in normal mode, center in fullscreen
        const chatPanel = document.getElementById('inline-chat-panel');
        if (_chatIsFullscreen || !chatPanel || !chatPanel.classList.contains('chat-open')) {
            // Fullscreen or chat not open — center screen
            t.style.top    = '50%';
            t.style.bottom = 'auto';
            t.style.transform = 'translate(-50%,-50%) scale(0.85)';
        } else {
            // Normal chat open — 16px above chat panel
            const chatTop = chatPanel.getBoundingClientRect().top;
            t.style.top    = 'auto';
            t.style.bottom = (window.innerHeight - chatTop + 16) + 'px';
            t.style.transform = 'translateX(-50%) scale(0.85)';
        }

        // Animate in
        clearTimeout(t._timer);
        requestAnimationFrame(() => {
            t.style.opacity = '1';
            if (_chatIsFullscreen || !chatPanel || !chatPanel.classList.contains('chat-open')) {
                t.style.transform = 'translate(-50%,-50%) scale(1)';
            } else {
                t.style.transform = 'translateX(-50%) scale(1)';
            }
        });

        // Animate icon: small bounce
        setTimeout(() => { iconWrap.style.transform = 'scale(1.2) rotate(8deg)'; }, 60);
        setTimeout(() => { iconWrap.style.transform = 'scale(1) rotate(0deg)'; }, 200);

        // Animate out after 1.8s
        t._timer = setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = t.style.bottom !== 'auto'
                ? 'translateX(-50%) scale(0.9)'
                : 'translate(-50%,-50%) scale(0.9)';
        }, 1800);
    }

        function _toggleChatMode() {
        _inlineChatModeOn = !_inlineChatModeOn;
        const btn  = document.getElementById('inline-chat-mode-btn');
        const icon = document.getElementById('chat-mode-icon');
        const ta   = document.getElementById('inline-chat-textarea');
        const accessBtn = document.getElementById('chat-code-access-btn');

        if (_inlineChatModeOn) {
            if (btn)  { btn.classList.add('mode-on'); btn.style.background = ''; btn.style.color = ''; }
            if (icon) { icon.setAttribute('stroke', 'white'); icon.setAttribute('fill', 'rgba(255,255,255,0.15)'); }
            if (ta)   ta.placeholder = 'Chat only — no edits...';
            // Show code access toggle button
            if (accessBtn) accessBtn.style.display = 'flex';
        } else {
            if (btn)  { btn.classList.remove('mode-on'); btn.style.background = 'rgba(128,128,128,0.12)'; btn.style.color = 'var(--text-color)'; }
            if (icon) { icon.setAttribute('stroke', 'currentColor'); icon.setAttribute('fill', 'none'); }
            if (ta)   ta.placeholder = 'Ask agent...';
            // Hide code access button and reset its state
            if (accessBtn) { accessBtn.style.display = 'none'; accessBtn.classList.remove('access-on'); }
            _chatCodeAccessOn = false;
        }

        // Show centered mode-switch toast
        _showChatModeToast(_inlineChatModeOn);
    }

    // ── Chat Code Access toggle — only visible when Chat Mode is ON ──
    function _toggleChatCodeAccess() {
        _chatCodeAccessOn = !_chatCodeAccessOn;
        const btn = document.getElementById('chat-code-access-btn');
        if (_chatCodeAccessOn) {
            if (btn) btn.classList.add('access-on');
            showToast('Code Access ON', 'code');
        } else {
            if (btn) btn.classList.remove('access-on');
            showToast('Code Access OFF', 'code_off');
        }
    }

    // ── Inline chat: fullscreen toggle ──
    function _toggleChatFullscreen() {
        _chatIsFullscreen = !_chatIsFullscreen;
        const panel   = document.getElementById('inline-chat-panel');
        const icon    = document.getElementById('fs-icon');
        const header  = document.getElementById('header');
        const tabsBar = document.getElementById('file-tabs-bar');
        const hh      = (header  ? header.offsetHeight  : 48)
                      + (tabsBar ? tabsBar.offsetHeight : 32);
        if (_chatIsFullscreen) {
            document.documentElement.style.setProperty('--header-h',      (header ? header.offsetHeight : 48) + 'px');
            document.documentElement.style.setProperty('--header-full-h', hh + 'px');
            panel.classList.add('chat-fullscreen');
            if (icon) icon.innerHTML = '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>';
        } else {
            panel.classList.remove('chat-fullscreen');
            if (icon) icon.innerHTML = '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>';
        }
    }

    // ── Toggle all CSS animations OFF/ON ──
    function toggleAnimations() {
        _animationsDisabled = !_animationsDisabled;
        const btn = document.getElementById('no-anim-btn');
        if (_animationsDisabled) {
            // Inject style to kill all animations/transitions
            let s = document.getElementById('no-anim-style');
            if (!s) {
                s = document.createElement('style');
                s.id = 'no-anim-style';
                s.textContent = '*, *::before, *::after { animation-duration: 0.001ms !important; animation-delay: 0ms !important; transition-duration: 0.001ms !important; transition-delay: 0ms !important; }';
                document.head.appendChild(s);
            }
            if (btn) { btn.style.color = 'var(--accent)'; btn.style.background = 'var(--accent-dim)'; }
            showToast('Animations OFF', 'motion_photos_off');
            localStorage.setItem('codx_no_anim', '1');
        } else {
            const s = document.getElementById('no-anim-style');
            if (s) s.remove();
            if (btn) { btn.style.color = ''; btn.style.background = ''; }
            showToast('Animations ON', 'motion_photos_on');
            localStorage.removeItem('codx_no_anim');
        }
    }

    function desktopZoomIn() {
        let size = parseInt(editor.getOption('fontSize')) || 14;
        size = Math.min(size + 1, 40);
        editor.setOptions({ fontSize: size + 'px' });
        _lastZoomSize = size;
        localStorage.setItem('codx_fontsize', size);
        showToast('Font ' + size + 'px', 'zoom_in');
    }

    function desktopZoomOut() {
        let size = parseInt(editor.getOption('fontSize')) || 14;
        size = Math.max(size - 1, 10);
        editor.setOptions({ fontSize: size + 'px' });
        _lastZoomSize = size;
        localStorage.setItem('codx_fontsize', size);
        showToast('Font ' + size + 'px', 'zoom_out');
    }

    function togglePlainTextMode() {
        _forcePlainText = !_forcePlainText;
        const btn = document.getElementById('plain-text-btn');
        if (_forcePlainText) {
            editor.session.setMode('ace/mode/text');
            if (btn) { btn.style.color = 'var(--accent)'; btn.style.background = 'var(--accent-dim)'; }
            showToast('Plain Text ON', 'text_fields');
            localStorage.removeItem('codx_plain_text'); // default state, no need to store
        } else {
            // Restore correct syntax mode
            if (_pythonMode) {
                editor.session.setMode('ace/mode/python');
            } else {
                _setEditorMode(currentFileName, editor.getValue());
            }
            if (btn) { btn.style.color = ''; btn.style.background = ''; }
            showToast('Syntax ON', 'code');
            localStorage.setItem('codx_plain_text', '0'); // user explicitly disabled
        }
    }

    // ══════════════════════════════════════════════════════
    //  PYTHON MODE — Pyodide-powered in-browser Python runner
    // ══════════════════════════════════════════════════════

    // _pythonMode declared early at top to prevent TDZ
    let _pyodide    = null;    // Pyodide instance (lazy loaded)
    let _pyLoading  = false;   // loading in progress

    // ── Toggle language (chip button) ──
    function _toggleLangMode() {
        _setLangMode(_pythonMode ? 'html' : 'python');
    }

    // ── Switch language mode ──
    function _setLangMode(lang) {
        const newIsPython = (lang === 'python');
        if (newIsPython === _pythonMode) return; // no change

        // ── Save current mode's session ──
        saveSession();

        // ── Load target mode's session ──
        const loadKey = newIsPython ? 'codx_session_py' : 'codx_session_html';
        let sess = null;
        try { sess = JSON.parse(localStorage.getItem(loadKey)); } catch(e) {}

        _pythonMode = newIsPython;

        if (sess && sess.tabs && sess.tabs.length > 0) {
            // Filter out tabs with wrong extension for this mode
            const pyExts  = ['py'];
            const htmlExts = ['html','htm','css','js','ts','jsx','tsx','json','md','txt','xml','svg'];
            const allowedExts = _pythonMode ? pyExts : htmlExts;
            const filtered = sess.tabs.filter(t => {
                const ext = (t.name || '').split('.').pop().toLowerCase();
                return allowedExts.includes(ext);
            });
            fileTabs     = filtered.length > 0 ? filtered : null;
            activeTabId  = sess.active;
            tabIdCounter = sess.counter || (Math.max(...sess.tabs.map(t => t.id)) + 1);
            // If active tab was filtered out, pick first remaining
            if (fileTabs && !fileTabs.find(t => t.id === activeTabId)) {
                activeTabId = fileTabs[0].id;
            }
        }

        if (!fileTabs || fileTabs.length === 0) {
            // Fresh session for this mode
            const blankName = _pythonMode ? 'main.py' : 'index.html';
            fileTabs    = [{ id: ++tabIdCounter, name: blankName, content: '' }];
            activeTabId = fileTabs[0].id;
        }

        const activeTab = fileTabs.find(t => t.id === activeTabId) || fileTabs[0];
        activeTabId = activeTab.id;
        currentFileName = activeTab.name;
        _setEditorValueFast(activeTab.content);

        const chipLabel  = document.getElementById('lang-chip-label');
        const iconHtml   = document.getElementById('lang-icon-html');
        const iconPy     = document.getElementById('lang-icon-py');

        if (_pythonMode) {
            if (iconHtml)  iconHtml.style.display  = 'none';
            if (iconPy)    iconPy.style.display    = 'block';
            if (chipLabel) chipLabel.textContent   = 'Python';
            if (!_forcePlainText) editor.session.setMode('ace/mode/python');
            showToast('Python Mode', 'code');
        } else {
            if (iconHtml)  iconHtml.style.display  = 'block';
            if (iconPy)    iconPy.style.display    = 'none';
            if (chipLabel) chipLabel.textContent   = 'HTML';
            if (!_forcePlainText) _setEditorMode(currentFileName, editor.getValue());
            const po = document.getElementById('python-output');
            if (po) { po.style.visibility = 'hidden'; po.style.opacity = '0'; }
            showToast('HTML Mode', 'html');
        }

        renderFileTabs();
        _updateEditorPlaceholder();
        // Update file input accept for current mode
        const fi = document.getElementById('file-input');
        if (fi) fi.accept = _pythonMode ? '.py' : '.html,.htm,.css,.js,.ts,.jsx,.tsx,.json,.md,.txt,.xml,.svg';
    }

    // ── Override switchTab to handle Python preview ──
    const _origSwitchTab = switchTab;
    switchTab = function(tabName, fromBtn) {
        if (tabName === 'preview' && _pythonMode) {
            // Python mode — show output panel, not HTML iframe
            _pyShowOutputPanel();
            _pyRunCode();
            // Update tab UI manually
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            const tgt = document.getElementById('tab-preview');
            if (tgt) tgt.classList.add('active');
            // Hide toolbar (same as HTML preview)
            const outerEl = document.getElementById('bottom-outer');
            const innerEl = document.getElementById('bottom-panel');
            const isDesktop = window.innerWidth >= 768;
            const t2 = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
            if (!isDesktop) {
                if (outerEl) { outerEl.style.transition = t2; outerEl.style.transform = 'translateY(100%)'; }
                if (innerEl) { innerEl.style.transition = t2; innerEl.style.transform = 'translateY(100%)'; }
            }
            _inPreview = true;
            document.getElementById('editor').style.opacity = '0';
            document.getElementById('editor').style.pointerEvents = 'none';
            document.getElementById('jumpers').style.display = 'none';
            return;
        }
        // Going back to editor from python output
        if (tabName === 'editor' && _pythonMode) {
            const po = document.getElementById('python-output');
            if (po) { po.style.visibility = 'hidden'; po.style.opacity = '0'; }
        }
        _origSwitchTab(tabName, fromBtn);
    };

    // ── Show python output panel ──
    function _pyShowOutputPanel() {
        const iframe = document.getElementById('preview');
        const po     = document.getElementById('python-output');
        if (iframe) iframe.classList.remove('active-pane');
        if (po) { po.style.visibility = 'visible'; po.style.opacity = '1'; }
    }

    // ── Load Pyodide (lazy, once) ──
    async function _pyEnsureLoaded() {
        if (_pyodide) return _pyodide;
        if (_pyLoading) {
            // Wait until loaded
            await new Promise(r => {
                const check = setInterval(() => { if (_pyodide || !_pyLoading) { clearInterval(check); r(); } }, 100);
            });
            return _pyodide;
        }
        _pyLoading = true;
        const loadEl  = document.getElementById('py-loading');
        const loadMsg = document.getElementById('py-loading-msg');
        if (loadEl) loadEl.style.display = 'flex';
        if (loadMsg) loadMsg.textContent = 'Loading Python runtime...';

        try {
            // Load Pyodide script dynamically
            if (!window.loadPyodide) {
                await new Promise((res, rej) => {
                    const s = document.createElement('script');
                    s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
                    s.onload = res;
                    s.onerror = () => rej(new Error('Failed to load Pyodide script'));
                    document.head.appendChild(s);
                });
            }
            if (loadMsg) loadMsg.textContent = 'Initialising Python...';
            _pyodide = await loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'
            });
            if (loadEl) loadEl.style.display = 'none';
        } catch (err) {
            _pyLoading = false;
            if (loadEl) loadEl.style.display = 'none';
            throw err;
        }
        _pyLoading = false;
        return _pyodide;
    }

    // ── Run Python code ──
    let _pyRunning = false;
    async function _pyRunCode() {
        if (_pyRunning) return; // prevent concurrent runs
        const body    = document.getElementById('py-out-body');
        const loadEl  = document.getElementById('py-loading');
        const timeEl  = document.getElementById('py-run-time');
        if (!body) return;

        _pyRunning = true;
        body.innerHTML = '';  // clear output every single run
        const code = editor.getValue();
        if (!code.trim()) {
            _pyAppendLine('# No code to run', 'dim'); return;
        }

        const t0 = Date.now();

        // Show loading if Pyodide not yet loaded
        let py;
        try {
            if (!_pyodide) {
                if (loadEl) loadEl.style.display = 'flex';
            }
            py = await _pyEnsureLoaded();
        } catch (err) {
            _pyAppendLine('⚠ Could not load Python runtime.', 'error');
            _pyAppendLine(err.message, 'error');
            _pyRunning = false;
            return;
        }

        if (loadEl) loadEl.style.display = 'none';

        // Redirect stdout/stderr — always fresh StringIO, never reuse
        py.runPython(`
import sys, io
_codx_stdout = io.StringIO()
_codx_stderr = io.StringIO()
sys.stdout = _codx_stdout
sys.stderr = _codx_stderr
`);

        let outText = '', errText = '';
        try {
            await py.runPythonAsync(code);
        } catch (err) {
            errText = err.message || String(err);
        }

        try {
            outText = py.runPython('_codx_stdout.getvalue()');
            errText = errText || py.runPython('_codx_stderr.getvalue()');
        } catch(e) {}

        // Restore stdout/stderr — use original references saved before redirect
        try {
            py.runPython(`
import sys, io
sys.stdout = sys.__stdout__ if hasattr(sys, '__stdout__') and sys.__stdout__ is not None else io.StringIO()
sys.stderr = sys.__stderr__ if hasattr(sys, '__stderr__') and sys.__stderr__ is not None else io.StringIO()
_codx_stdout = None
_codx_stderr = None
`);
        } catch(e) {}

        const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
        if (timeEl) timeEl.textContent = elapsed + 's';

        if (outText) {
            outText.split('\n').forEach(line => _pyAppendLine(line, 'out'));
        }
        if (errText) {
            errText.trim().split('\n').forEach(line => _pyAppendLine(line, 'error'));
        }
        if (!outText && !errText) {
            _pyAppendLine('# Finished with no output', 'dim');
        }

        // Scroll to bottom
        body.scrollTop = body.scrollHeight;
        _pyRunning = false;
    }

    // ── Append a line to output ──
    function _pyAppendLine(text, type) {
        const body = document.getElementById('py-out-body');
        if (!body) return;
        const line = document.createElement('div');
        const base = 'display:block;white-space:pre;overflow:hidden;text-overflow:ellipsis;max-width:100%;min-height:1em;';
        line.style.cssText = base + (type === 'error'
            ? 'color:#f87171;'
            : type === 'dim'
            ? 'color:rgba(255,255,255,0.3);font-style:italic;'
            : 'color:#e0e0e0;');
        line.textContent = text;
        body.appendChild(line);
    }