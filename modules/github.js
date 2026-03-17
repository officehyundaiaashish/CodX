    // ── COMMIT MODAL — custom inline, no browser dialogs ──
    function _showCommitModal() {
        // Remove any existing
        const existing = document.getElementById('commit-modal-overlay');
        if(existing) existing.remove();

        const fileName = ghCurrentFile ? ghCurrentFile.split('/').pop() : '';
        const repoName = ghCurrentRepo ? ghCurrentRepo.split('/').pop() : '';

        const overlay = document.createElement('div');
        overlay.id = 'commit-modal-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:600;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s ease;';

        overlay.innerHTML = `
        <div id="commit-modal-box" style="background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:20px;padding:20px;width:88%;max-width:380px;font-family:'Poppins',sans-serif;transform:scale(0.92) translateY(10px);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);position:relative;">
            <!-- Header -->
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:32px;height:32px;border-radius:9px;background:var(--accent-dim);border:1px solid rgba(16,185,129,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <span class="material-icons-round" style="color:var(--accent);font-size:17px;">upload</span>
                    </div>
                    <div>
                        <div style="font-weight:700;font-size:13px;color:var(--text-color);">Commit to GitHub</div>
                        <div style="font-size:10px;color:var(--accent);font-weight:600;margin-top:1px;">${repoName}</div>
                    </div>
                </div>
                <button onclick="document.getElementById('commit-modal-overlay').remove()" style="background:rgba(128,128,128,0.1);border:none;border-radius:8px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-color);opacity:0.6;flex-shrink:0;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <!-- File info -->
            <div style="background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:10px 12px;margin-bottom:12px;">
                <div style="font-size:9px;font-weight:700;color:var(--text-color);opacity:0.45;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Committing</div>
                <div style="display:flex;align-items:center;gap:7px;">
                    <span class="material-icons-round" style="font-size:16px;color:var(--accent);">insert_drive_file</span>
                    <span id="commit-file-label" style="font-size:12px;font-weight:700;color:var(--text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${fileName || 'No file selected'}</span>
                </div>
            </div>
            <!-- Commit message -->
            <div style="font-size:9px;font-weight:700;color:var(--text-color);opacity:0.45;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Commit Message</div>
            <input id="commit-msg-input" type="text" autocomplete="off" autocorrect="off" spellcheck="false" value="Update ${fileName}" placeholder="Commit message" style="width:100%;padding:10px 12px;border-radius:10px;background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);color:var(--text-color);font-family:'Poppins',sans-serif;font-size:12px;margin-bottom:12px;outline:none;user-select:text;-webkit-user-select:text;transition:border-color 0.15s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--glass-border)'">
            <!-- Action row -->
            <div style="display:flex;gap:7px;">
                <button onclick="_commitAnotherFile()" style="flex:1;padding:10px 8px;border-radius:10px;border:1px solid var(--glass-border);background:rgba(128,128,128,0.08);color:var(--text-color);font-family:'Poppins',sans-serif;font-size:11px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:background 0.15s;" onmouseenter="this.style.background='var(--accent-dim)'" onmouseleave="this.style.background='rgba(128,128,128,0.08)'">
                    <span class="material-icons-round" style="font-size:15px;pointer-events:none;">swap_horiz</span>Change File
                </button>
                <button onclick="_doCommit()" style="flex:1.4;padding:10px 8px;border-radius:10px;border:none;background:linear-gradient(135deg,#10b981,#059669);color:white;font-family:'Poppins',sans-serif;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;">
                    <span class="material-icons-round" style="font-size:15px;pointer-events:none;">upload</span>Commit
                </button>
            </div>
        </div>`;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            document.getElementById('commit-modal-box').style.transform = 'scale(1) translateY(0)';
        });
    }

    function _commitAnotherFile() {
        // Close commit modal, open GitSync to let user pick a different file
        const overlay = document.getElementById('commit-modal-overlay');
        if(overlay) overlay.remove();
        openGithubModal();
    }

    function _showCommitToast(msg) {
        // Remove any existing
        const old = document.getElementById('commit-success-toast');
        if (old) old.remove();

        const el = document.createElement('div');
        el.id = 'commit-success-toast';
        el.style.cssText = [
            'position:fixed',
            'left:50%',
            'top:50%',
            'transform:translate(-50%,-50%) scale(0.82)',
            'background:var(--glass-bg)',
            'border:1px solid rgba(16,185,129,0.4)',
            'border-radius:20px',
            'padding:22px 28px',
            'z-index:99999',
            'display:flex',
            'flex-direction:column',
            'align-items:center',
            'gap:10px',
            'text-align:center',
            'font-family:Poppins,sans-serif',
            'box-shadow:0 8px 28px rgba(0,0,0,0.12)',
            'opacity:0',
            'pointer-events:none',
            'min-width:220px',
            'max-width:80vw',
            'transition:opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'
        ].join(';');

        el.innerHTML = `
            <div style="width:44px;height:44px;border-radius:50%;background:rgba(16,185,129,0.15);border:2px solid #10b981;display:flex;align-items:center;justify-content:center;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size:15px;font-weight:700;color:var(--text-color);">Committed</div>
            <div style="font-size:11px;color:var(--text-color);opacity:0.55;line-height:1.5;">${msg}</div>
`;

        document.body.appendChild(el);

        // Animate in
        requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translate(-50%,-50%) scale(1)';
        });

        // Dismiss after 2s — fade + scale down smoothly
        setTimeout(() => {
            el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            el.style.opacity = '0';
            el.style.transform = 'translate(-50%,-50%) scale(0.92)';
            setTimeout(() => el.remove(), 420);
        }, 2000);
    }

        async function _doCommit() {
        const msg = document.getElementById('commit-msg-input')?.value?.trim();
        if(!msg) return;
        if(!ghCurrentFile) { cdAlert('Commit', 'No file selected.', 'warn'); return; }

        // Show animated gear spinner overlay inside the modal box
        const box = document.getElementById('commit-modal-box');
        const spinner = document.createElement('div');
        spinner.id = 'commit-spinner';
        spinner.style.cssText = 'position:absolute;inset:0;border-radius:20px;background:var(--glass-bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;z-index:10;';
        spinner.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="animation:commitSpin 2.4s linear infinite;color:var(--accent);">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="var(--accent)" opacity="0.9"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="var(--accent-dim)"/>
            </svg>
            <div style="font-size:12px;font-weight:700;color:var(--accent);font-family:'Poppins',sans-serif;">Committing...</div>
            <div style="font-size:10px;color:var(--text-color);opacity:0.5;font-family:'Poppins',sans-serif;max-width:200px;text-align:center;">${ghCurrentFile.split('/').pop()}</div>`;
        if(box) { box.style.position = 'relative'; box.appendChild(spinner); }

        try {
            let latestSha;
            try { let fd = await ghApi(`/repos/${ghCurrentRepo}/contents/${ghCurrentFile}`); latestSha = fd.sha; }
            catch(e) { latestSha = ghCurrentSha; }
            const res = await ghApi(`/repos/${ghCurrentRepo}/contents/${ghCurrentFile}`, 'PUT', {
                message: msg, content: encodeB64(editor.getValue()), sha: latestSha
            });
            ghCurrentSha = res.content.sha;
            _ghTree = [];
            const overlay = document.getElementById('commit-modal-overlay');
            if(overlay) { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 200); }
            closeGithubModal();
            _showCommitToast(`"${ghCurrentFile.split('/').pop()}" pushed to ${ghCurrentRepo.split('/').pop()}`);
            if(document.getElementById('gh-repo-select')?._value) fetchGhFiles();
        } catch(e) {
            const sp = document.getElementById('commit-spinner');
            if(sp) sp.remove();
            let err = e.message || 'Commit failed.';
            try { const j = JSON.parse(err); if(j.message) err = j.message; } catch(_){}
            cdAlert('Commit Failed', err, 'error');
        }
    }

    async function commitGhFile() {
        if(!ghCurrentFile) {
            // No file chosen — open GitSync tree first
            openGithubModal();
            cdAlert('Select File', 'Pick a file from the tree, then click Commit.', 'info');
            return;
        }
        _showCommitModal();
    }

    // ── Undo last commit for selected file ──
    async function undoLastCommit() {
        if (!ghCurrentRepo || !ghCurrentFile) {
            cdAlert('Undo Commit', 'Please select a file first.', 'warn');
            return;
        }
        const histBox = document.getElementById('gh-commit-history');
        if (!histBox) return;

        // Toggle — if already open, close it
        if (histBox.style.display !== 'none') {
            histBox.style.display = 'none';
            return;
        }

        const fname = ghCurrentFile.split('/').pop();
        histBox.style.display = 'block';
        histBox.innerHTML = `<div style="padding:10px 12px;font-size:11px;color:var(--accent);font-family:'Poppins',sans-serif;display:flex;align-items:center;gap:6px;">
            <span class="material-icons-round" style="font-size:14px;animation:commitSpin 0.8s linear infinite;">refresh</span>Loading commits...
        </div>`;

        try {
            const commits = await ghApi(`/repos/${ghCurrentRepo}/commits?path=${encodeURIComponent(ghCurrentFile)}&per_page=10`);
            if (!commits || commits.length === 0) {
                histBox.innerHTML = `<div style="padding:10px 12px;font-size:11px;opacity:0.5;font-family:'Poppins',sans-serif;">No commits found for this file.</div>`;
                return;
            }

            const header = `<div style="padding:6px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;opacity:0.4;font-family:'Poppins',sans-serif;border-bottom:1px solid var(--glass-border);position:sticky;top:0;background:var(--glass-bg);">
                Last ${commits.length} commits — tap to restore
            </div>`;

            const rows = commits.map((c, i) => {
                const msg   = (c.commit.message || '').split('\n')[0].slice(0, 38);
                const d     = new Date(c.commit.author.date);
                const date  = d.toLocaleDateString('en-GB', { day:'2-digit', month:'short' });
                const time  = d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12: true });
                const sha7  = c.sha.slice(0, 7);
                const isCurrent = i === 0;
                return `<div onclick="${isCurrent ? '' : `_restoreCommit('${c.sha}','${fname.replace(/'/g,"\\'")}',this)`}"
                    style="padding:6px 10px;border-bottom:1px solid var(--glass-border);cursor:${isCurrent ? 'default' : 'pointer'};
                    display:flex;align-items:center;gap:6px;transition:background 0.15s;
                    ${isCurrent ? 'opacity:0.4;' : ''}"
                    ${isCurrent ? '' : 'onmouseenter="this.style.background=\'var(--accent-dim)\'" onmouseleave="this.style.background=\'\'"'}>
                    <span style="font-family:'Courier New',monospace;font-size:9px;color:var(--accent);flex-shrink:0;">${sha7}</span>
                    <span style="font-size:10px;font-family:'Poppins',sans-serif;color:var(--text-color);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${msg || '(no message)'}</span>
                    <span style="font-size:9px;opacity:0.4;font-family:'Poppins',sans-serif;flex-shrink:0;text-align:right;line-height:1.3;">${date}<br>${time}</span>
                    ${isCurrent ? '<span style="font-size:8px;background:var(--accent-dim);color:var(--accent);border-radius:3px;padding:1px 4px;flex-shrink:0;font-family:Poppins,sans-serif;font-weight:700;">now</span>' : ''}
                </div>`;
            }).join('');

            histBox.innerHTML = header + rows + `<div onclick="document.getElementById('gh-commit-history').style.display='none'" style="padding:7px 10px;display:flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;border-top:1px solid var(--glass-border);position:sticky;bottom:0;background:var(--glass-bg);transition:background 0.15s;" onmouseenter="this.style.background='rgba(239,68,68,0.08)'" onmouseleave="this.style.background='var(--glass-bg)'">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" style="pointer-events:none;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <span style="font-size:10px;color:#ef4444;font-family:'Poppins',sans-serif;font-weight:600;pointer-events:none;">Cancel</span>
            </div>`;
        } catch(e) {
            let err = e.message || 'Failed to load commits.';
            try { const j = JSON.parse(err); if (j.message) err = j.message; } catch(_) {}
            histBox.innerHTML = `<div style="padding:10px 12px;font-size:11px;color:#f87171;font-family:'Poppins',sans-serif;">${err}</div>`;
        }
    }

    async function _restoreCommit(sha, fname, rowEl) {
        // Highlight selected row
        rowEl.style.background = 'var(--accent-dim)';
        rowEl.style.pointerEvents = 'none';
        rowEl.innerHTML += `<div style="font-size:10px;color:var(--accent);font-family:'Poppins',sans-serif;margin-top:3px;display:flex;align-items:center;gap:4px;">
            <span class="material-icons-round" style="font-size:12px;animation:commitSpin 0.8s linear infinite;">refresh</span>Restoring...
        </div>`;
        try {
            const prevFile = await ghApi(`/repos/${ghCurrentRepo}/contents/${ghCurrentFile}?ref=${sha}`);
            const prevContent = decodeB64(prevFile.content);
            const curTab = fileTabs.find(t => t.id === activeTabId);
            if (curTab) curTab.content = prevContent;
            editor.setValue(prevContent, -1);
            // Hide history box
            const histBox = document.getElementById('gh-commit-history');
            if (histBox) histBox.style.display = 'none';
            closeGithubModal();
            showToast(`"${fname}" restored to ${sha.slice(0,7)}`, 'undo');
        } catch(e) {
            let err = e.message || 'Restore failed.';
            try { const j = JSON.parse(err); if (j.message) err = j.message; } catch(_) {}
            cdAlert('Restore Failed', err, 'error');
        }
    }

    // LOAD ENTIRE REPO
    async function loadGhRepo() {
        if(!ghCurrentRepo) return;
        const repoShortName = ghCurrentRepo.split('/').pop();
        cdPrompt('Project Name', 'Name this project:', repoShortName, async (projectName) => {
            if(projectName === null) return;
            projectName = (projectName || repoShortName).trim();
            closeGithubModal();
            _showRepoProgress('Fetching repository tree...', 0, 1);
            try {
                let repoData = await ghApi(`/repos/${ghCurrentRepo}`);
                let branch = repoData.default_branch;
                let treeData = await ghApi(`/repos/${ghCurrentRepo}/git/trees/${branch}?recursive=1`);
                const textExts = new Set(['html','htm','css','js','ts','jsx','tsx','json','md','txt','xml','php','py','sh','yaml','yml','svg','vue','svelte','env','gitignore','lock','toml','ini','cfg','conf']);
                let files = treeData.tree.filter(f => {
                    if(f.type !== 'blob') return false;
                    if(f.size > 500000) return false;
                    const ext = f.path.split('.').pop().toLowerCase();
                    return textExts.has(ext) || !f.path.includes('.');
                });
                if(files.length === 0) { _hideRepoProgress(); cdAlert('Load Repo', 'No text files found.', 'warn'); return; }
                if(files.length > 30) {
                    _hideRepoProgress();
                    await new Promise(resolve => { cdConfirm('Large Repo', `${files.length} files. Load all?`, 'Load All', 'Cancel', (ok) => { if(!ok){files=[];}resolve(); }); });
                    if(files.length === 0) return;
                    _showRepoProgress('Loading files...', 0, files.length);
                }
                const BATCH = 6; let loaded = 0, failed = 0, firstTab = true;
                for(let i = 0; i < files.length; i += BATCH) {
                    const batch = files.slice(i, i + BATCH);
                    await Promise.all(batch.map(async (f) => {
                        try {
                            let fileData = await ghApi(`/repos/${ghCurrentRepo}/contents/${f.path}`);
                            let content = decodeB64(fileData.content);
                            let name = f.path.split('/').pop();
                            openFileInTab(name, content, !firstTab); firstTab = false; loaded++;
                            _showRepoProgress(`Loading "${f.path.split('/').pop()}"...`, loaded, files.length);
                        } catch(e) { failed++; }
                    }));
                }
                let projects = await CodXStore.get('codx_projects', {});
                projects[projectName] = { repo: ghCurrentRepo, loadedAt: Date.now(), fileCount: loaded };
                await CodXStore.set('codx_projects', projects);
                _hideRepoProgress();
                _showPerfBadge(`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polyline points="20 6 9 17 4 12"/></svg> "${projectName}" — ${loaded} files loaded`);
                if(failed > 0) cdAlert('Load Repo', `${loaded} loaded, ${failed} failed.`, 'info');
            } catch(e) { _hideRepoProgress(); cdAlert('Load Repo', 'Failed to load repository.', 'error'); }
        });
    }

    // ===== CUSTOM DIALOG ENGINE =====
    let _cdResolve = null;
    function _showDialog(icon, title, msg, inputDef, buttons) {
        const _cdOverlay = document.getElementById('custom-dialog-overlay');
        document.getElementById('custom-dialog-icon').innerHTML = icon;
        document.getElementById('custom-dialog-title').textContent = title;
        document.getElementById('custom-dialog-msg').textContent = msg;
        const inp = document.getElementById('custom-dialog-input');
        if(inputDef !== null) { inp.style.display = 'block'; inp.value = inputDef; inp.style.userSelect='text'; inp.style.webkitUserSelect='text'; setTimeout(()=>{inp.focus();inp.select();},120); }
        else { inp.style.display = 'none'; }
        const btnsEl = document.getElementById('custom-dialog-btns');
        btnsEl.innerHTML = '';
        buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.className = 'cdlg-btn ' + (b.cls||'secondary');
            btn.textContent = b.label;
            btn.onclick = () => { _hideDialog(); const r = _cdResolve; _cdResolve = null; if(r) r(b.value); };
            btnsEl.appendChild(btn);
        });
        _cdOverlay.classList.add('active');
    }
    function _hideDialog() { document.getElementById('custom-dialog-overlay').classList.remove('active'); }
    function cdAlert(title, msg, type) {
        const icons = { success:'<span class="material-icons-round" style="color:#10b981">check_circle</span>', error:'<span class="material-icons-round" style="color:#ef4444">error</span>', warn:'<span class="material-icons-round" style="color:#f59e0b">warning</span>', info:'<span class="material-icons-round" style="color:var(--accent)">info</span>' };
        return new Promise(r => { _cdResolve = r; _showDialog(icons[type]||icons.info, title, msg, null, [{label:'OK',cls:'primary',value:true}]); });
    }
    function cdConfirm(title, msg, okLabel, cancelLabel, cb) {
        _cdResolve = cb;
        _showDialog('<span class="material-icons-round" style="color:var(--accent)">help_outline</span>', title, msg, null, [
            {label:cancelLabel||'Cancel', cls:'secondary', value:false},
            {label:okLabel||'OK', cls:'primary', value:true}
        ]);
    }
    function cdPrompt(title, msg, defaultVal, cb) {
        _cdResolve = (v) => cb(v === false ? null : document.getElementById('custom-dialog-input').value);
        _showDialog('<span class="material-icons-round" style="color:var(--accent)">edit</span>', title, msg, defaultVal||'', [
            {label:'Cancel', cls:'secondary', value:false},
            {label:'OK', cls:'primary', value:true}
        ]);
    }

    // ===== GITHUB CUSTOM SELECT RENDERER =====
    function renderGhCustomSelect(id, items, placeholder, onChange) {
        // Find parent container
        const oldEl = document.getElementById(id);
        const parent = oldEl ? oldEl.closest('.gh-select-wrap') || oldEl.parentElement : null;
        if(!parent) return;
        parent.innerHTML = '';
        parent.className = 'gh-custom-select gh-select-wrap';

        const trigger = document.createElement('div');
        trigger.className = 'gh-custom-trigger';
        trigger.innerHTML = `<span class="gh-trigger-text">${placeholder}</span><span class="material-icons-round">expand_more</span>`;

        const list = document.createElement('div');
        list.className = 'gh-custom-list';

        items.forEach(item => {
            if(!item.value) return;
            const opt = document.createElement('div');
            opt.className = 'gh-custom-option';
            opt.innerHTML = `<span class="material-icons-round">${item.icon||'insert_drive_file'}</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${item.label}</span>`;
            opt.onclick = (e) => {
                e.stopPropagation();
                trigger.querySelector('.gh-trigger-text').textContent = item.label;
                trigger.querySelector('.gh-trigger-text').classList.add('selected');
                trigger.classList.remove('open'); list.classList.remove('open');
                hidden._value = item.value;
                if(onChange) onChange(item.value);
            };
            list.appendChild(opt);
        });

        const hidden = document.createElement('span');
        hidden.id = id; hidden._value = '';

        trigger.onclick = (e) => {
            e.stopPropagation();
            const isOpen = list.classList.contains('open');
            document.querySelectorAll('.gh-custom-list.open').forEach(l => { l.classList.remove('open'); if(l.previousElementSibling) l.previousElementSibling.classList.remove('open'); });
            if (!isOpen) { trigger.classList.add('open'); list.classList.add('open'); }
        };

        parent.appendChild(trigger); parent.appendChild(list); parent.appendChild(hidden);
    }

    // Single global listener to close all custom selects on outside click
    document.addEventListener('click', () => {
        document.querySelectorAll('.gh-custom-list.open').forEach(l => { l.classList.remove('open'); if(l.previousElementSibling) l.previousElementSibling.classList.remove('open'); });
    });

    // Init GitHub selects when modal opens (called from openGithubModal -> checkGhLogin -> fetchGhRepos)
    // The select wrappers in HTML will be used as containers