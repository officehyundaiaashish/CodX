
    // Use dynamic viewport height to avoid Chrome bottom bar clipping
    // GitHub modal refs — declared early so closeGithubModal() never hits TDZ
    const ghModal = document.getElementById('github-modal');
    const ghOverlay = document.getElementById('gh-overlay');
    // Force clean closed state on init
    if (ghModal)   { ghModal.classList.remove('active'); }
    if (ghOverlay) { ghOverlay.classList.remove('active'); ghOverlay.style.display = 'none'; }
    // Declared early — used in visualViewport resize handler before full init
    var _inlineChatOpen = false;
    // Declared early — used before their definition blocks to prevent TDZ crash
    let _forcePlainText = true;
    let _animationsDisabled = false;
    let _chatIsFullscreen = false;
    let _pythonMode = false;
    let _inlineChatModeOn = true;
    let _chatCodeAccessOn = false;
    const findModal = document.getElementById('find-modal');
    // Declared early — used in saved-settings restore blocks before their definition
    let _lastZoomSize = 10;
    let _inPreview = false;
    let _navHidden = false;

    function _setBodyHeight() {
        if (_inPreview) return; // preview handles its own sizing via CSS
        document.body.style.height = window.innerHeight + 'px';
    }
    _setBodyHeight();

    // ── Restore saved theme ──
    (function() {
        const savedTheme = localStorage.getItem('codx_theme');
        if (savedTheme === 'light') {
            document.body.className = 'light-theme no-select';
            const icon = document.getElementById('theme-icon');
            if (icon) icon.innerText = 'dark_mode';
            document.getElementById('theme-color-meta').content = '#f0f2f5';
            // Editor theme restored after editor init below
        }
    })();

    // ── Restore saved font size ──
    (function() {
        const savedSize = parseInt(localStorage.getItem('codx_fontsize'));
        if (savedSize && savedSize >= 10 && savedSize <= 40) {
            _lastZoomSize = savedSize;
            initialFontSize = savedSize;
            // Applied after editor is initialized
        }
    })();

    // When chat panel is open and keyboard appears:
    // Keyboard handler for chat panel
    // interactive-widget=resizes-visual: keyboard overlaps fixed elements,
    // layout viewport unchanged. Panel at bottom:0 is already correct.
    // Only fullscreen mode needs adjustment (panel fills screen top-to-bottom).
    function _handleChatKeyboard() {
        if (_inPreview) return; // never touch layout while preview is active
        if (!_inlineChatOpen) { _setBodyHeight(); return; }
        const vv = window.visualViewport;
        if (!vv) return;
        const panel = document.getElementById('inline-chat-panel');
        if (!panel) return;

        if (_chatIsFullscreen) {
            const kbHeight = Math.max(0, window.innerHeight - vv.offsetTop - vv.height);
            const hh = parseInt(getComputedStyle(document.documentElement)
                .getPropertyValue('--header-h')) || 48;
            if (kbHeight > 50) {
                // Keyboard open — pin panel below header, shrink to visible area only
                panel.style.top    = hh + 'px';
                panel.style.height = (window.innerHeight - kbHeight - hh) + 'px';
                panel.style.bottom = '';
            } else {
                // Keyboard closed — restore fullscreen
                panel.style.height = '';
                panel.style.top    = '';
                panel.style.bottom = '';
            }
        } else {
            // Non-fullscreen chat: keyboard appears — keep editor visible above chat panel
            const kbHeight = Math.max(0, window.innerHeight - vv.offsetTop - vv.height);
            const kbOpen   = kbHeight > 50;
            const hdrH     = (document.getElementById('header') || {}).offsetHeight || 0;
            const tabH     = (document.getElementById('file-tabs-bar') || {}).offsetHeight || 0;
            const chatPanel = document.getElementById('inline-chat-panel');
            const chatH    = (chatPanel && chatPanel.classList.contains('chat-open')) ? (chatPanel.offsetHeight || 0) : 0;

            if (kbOpen) {
                // Lock body height
                document.body.style.height = window.innerHeight + 'px';
                // Calculate available height for editor area
                const availH = window.innerHeight - kbHeight;
                // Make sure editor-wrapper fills the space above chat panel
                const mc = document.getElementById('editor-wrapper');
                if (mc) {
                    mc.style.height = Math.max(60, availH - hdrH - tabH - chatH) + 'px';
                    mc.style.minHeight = '60px';
                    mc.style.background = 'var(--editor-bg)';
                }
                document.documentElement.style.setProperty('--chat-hdr-h', hdrH + 'px');
                document.body.classList.add('chat-kb-open');
            } else {
                // Keyboard closed — restore
                document.body.style.height = window.innerHeight + 'px';
                const mc = document.getElementById('editor-wrapper');
                if (mc) {
                    mc.style.height = '';
                    mc.style.minHeight = '';
                    mc.style.background = '';
                }
                document.body.classList.remove('chat-kb-open');
            }
        }
    }

    window.visualViewport && window.visualViewport.addEventListener('resize', _handleChatKeyboard);
    window.addEventListener('resize', _handleChatKeyboard);
    function _positionFindModal() {
        const vv = window.visualViewport;
        if (!vv || !findModal.classList.contains('active')) return;
        const modalH = findModal.offsetHeight || 260;
        // visibleBottom = top of keyboard in fixed coords
        const visibleBottom = vv.offsetTop + vv.height;
        // Place modal so bottom edge is 6px above keyboard
        const topPos = visibleBottom - modalH - 6;
        findModal.style.top = Math.max(vv.offsetTop + 4, topPos) + 'px';
        findModal.style.bottom = 'auto';
    }

    window.visualViewport && window.visualViewport.addEventListener('resize', () => {
        _positionFindModal();
        const vv = window.visualViewport;
        const kbHeight = Math.max(0, window.innerHeight - vv.offsetTop - vv.height);
        let activeModal = document.querySelector('.modal.active:not(#github-modal):not(#find-modal)');
        if (activeModal) {
            activeModal.style.bottom = kbHeight > 10 ? (kbHeight + 10) + 'px' : '20px';
        }
        // Chat panel keyboard handling done via CSS (interactive-widget=resizes-visual in meta viewport)
    });

    // --- PWA & SERVICE WORKER ---
    // ROOT CAUSE FIX: Chrome blocks SW from blob: URLs AND rejects SVG/data-URI icons for PWA install.
    // Fix 1: Generate real PNG icons via canvas (required by Chrome PWA criteria).
    // Fix 2: SW must be registered from same origin — use blob: URL only as last resort with workaround.
    function _makePwaIconPng(size) {
        const c = document.createElement('canvas'); c.width = size; c.height = size;
        const ctx = c.getContext('2d');
        // Full green background (for maskable/adaptive icons)
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, 0, size, size);
        // Rounded rect (slightly inset for safe zone padding)
        const pad = size * 0.08;
        const r = size * 0.18;
        const x = pad, y = pad, w = size - pad*2, h = size - pad*2;
        ctx.beginPath(); ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fillStyle = '#059669'; ctx.fill();
        ctx.fillStyle = 'white'; ctx.font = `bold ${size*0.36}px monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('</>', size / 2, size * 0.53);
        return c.toDataURL('image/png');
    }
    const _icon192 = _makePwaIconPng(192);
    const _icon512 = _makePwaIconPng(512);

    const manifestData = {
        "name": "CodX Editor", "short_name": "CodX",
        "start_url": "./", "display": "standalone",
        "background_color": "#10b981", "theme_color": "#10b981",
        "icons": [
            {"src": _icon192, "sizes": "192x192", "type": "image/png"},
            {"src": _icon512, "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}
        ]
    };
    const manifestBlob = new Blob([JSON.stringify(manifestData)], {type: 'application/manifest+json'});
    document.getElementById('manifest-link').href = URL.createObjectURL(manifestBlob);

    // SW Fix: blob: URLs are blocked by Chrome for SW registration.
    // Solution: encode SW as a base64 data URI — Chrome allows data: SW registration on some builds.
    // More reliable: inject SW via <script> tag with a workaround object URL scoped correctly.
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
        const swCode = [
            "/* CodX SW v2 */",
            "self.addEventListener('install',e=>{self.skipWaiting();});",
            "self.addEventListener('activate',e=>{e.waitUntil(clients.claim());});",
            "self.addEventListener('fetch',e=>{",
            "  if(e.request.method!=='GET')return;",
            "  e.respondWith(fetch(e.request).catch(()=>new Response('<h2>CodX is offline</h2>',{headers:{'Content-Type':'text/html'}})));",
            "});"
        ].join('\n');
        try {
            const swBlob = new Blob([swCode], {type: 'application/javascript'});
            const swUrl = URL.createObjectURL(swBlob);
            navigator.serviceWorker.register(swUrl, {scope: './'}).catch(() => {});
        } catch(e) {}
    }

    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault(); deferredPrompt = e; installBtn.style.display = 'flex';
    });
    window.addEventListener('appinstalled', () => {
        installBtn.style.display = 'none'; deferredPrompt = null;
    });

    //  CodXStore — ALL user data saved to local device
    //  EXCEPT: gh_token, agent_config (stay in localStorage for quick access)
    //  Everything else persists via IndexedDB (local device only, never sent anywhere)
    const CodXStore = (() => {
        const DB_NAME = 'CodXData', DB_VER = 1, STORE = 'userdata';
        let _db = null;

        function _open() {
            return new Promise((resolve, reject) => {
                if (_db) { resolve(_db); return; }
                const req = indexedDB.open(DB_NAME, DB_VER);
                req.onupgradeneeded = e => {
                    e.target.result.createObjectStore(STORE);
                };
                req.onsuccess = e => { _db = e.target.result; resolve(_db); };
                req.onerror = () => reject(req.error);
            });
        }

        async function set(key, value) {
            try {
                const db = await _open();
                return new Promise((res, rej) => {
                    const tx = db.transaction(STORE, 'readwrite');
                    tx.objectStore(STORE).put(value, key);
                    tx.oncomplete = () => res(true);
                    tx.onerror = () => rej(tx.error);
                });
            } catch(e) {
                // Fallback to localStorage
                try { localStorage.setItem('codx_idb_' + key, JSON.stringify(value)); return true; } catch(ee) { return false; }
            }
        }

        async function get(key, defaultVal = null) {
            try {
                const db = await _open();
                return new Promise((res) => {
                    const tx = db.transaction(STORE, 'readonly');
                    const req = tx.objectStore(STORE).get(key);
                    req.onsuccess = () => res(req.result !== undefined ? req.result : defaultVal);
                    req.onerror = () => res(defaultVal);
                });
            } catch(e) {
                try {
                    const v = localStorage.getItem('codx_idb_' + key);
                    return v !== null ? JSON.parse(v) : defaultVal;
                } catch(ee) { return defaultVal; }
            }
        }

        async function remove(key) {
            try {
                const db = await _open();
                return new Promise((res) => {
                    const tx = db.transaction(STORE, 'readwrite');
                    tx.objectStore(STORE).delete(key);
                    tx.oncomplete = () => res(true);
                    tx.onerror = () => res(false);
                });
            } catch(e) {
                localStorage.removeItem('codx_idb_' + key); return true;
            }
        }

        return { set, get, remove };
    })();

    //  EDITOR — GAME ENGINE VIEWPORT APPROACH
    //  Rule: Only render what's visible. Everything
    //  else is culled — exactly like a game world.
    var editor = ace.edit("editor");

    // ── STEP 1: Kill every expensive feature upfront ──
    editor.setOptions({
        fontSize: "10px",
        showLineNumbers: true,
        showGutter: true,
        wrap: false,
        displayIndentGuides: false,
        showPrintMargin: false,
        useWorker: false,
        animatedScroll: false,
        tooltipFollowsMouse: false,
        highlightActiveLine: false,
        showFoldWidgets: false,
        highlightGutterLine: false,
        fadeFoldWidgets: false,
        showInvisibles: false,
        useSoftTabs: true,
        tabSize: 2,
        fixedWidthGutter: true,
        scrollPastEnd: false,
        copyWithEmptySelection: false,
        mergeUndoDeltas: "always",
        behavioursEnabled: false,
        wrapBehavioursEnabled: false,
    });

    // Autocomplete is off by default in ACE when ext-language_tools is not loaded.

    // ── STEP 2: Renderer deep-tuning ──
    editor.renderer.setScrollMargin(0, 0, 0, 0);
    editor.renderer.setPadding(6);
    // Clamp horizontal scroll so it never goes past content width
    try {
        const _origScrollLeft = editor.renderer.$updateScrollLeft
            || editor.renderer.updateScrollLeft;
        editor.session.on('changeScrollLeft', () => {
            const maxL = Math.max(0, (editor.renderer.layerConfig?.width || 0)
                - editor.renderer.$size.scrollerWidth + 20);
            if (editor.session.getScrollLeft() > maxL) {
                editor.session.setScrollLeft(maxL);
            }
        });
    } catch(e){}
    try { editor.renderer.$printMarginLayer.element.style.display = 'none'; } catch(e){}
    // Disable cursor blink — causes repaint every 530ms
    try { editor.renderer.$cursorLayer.setBlinking(false); } catch(e){}
    // Force hardware-accelerated scroller
    try { editor.renderer.scroller.style.transform = 'translateZ(0)'; } catch(e){}
    try { editor.renderer.content.style.transform = 'translateZ(0)'; } catch(e){}
    // Prevent ACE from stealing passive touch events
    try {
        const s = editor.renderer.scroller;
        s.addEventListener('touchstart', ()=>{}, {passive:true});
        s.addEventListener('touchmove', ()=>{}, {passive:true});
    } catch(e){}
    // Kill cursor layer animation entirely
    try { 
        const cl = editor.renderer.$cursorLayer;
        if(cl && cl.element) cl.element.style.transition = 'none';
    } catch(e){}

    // ── STEP 3: Theme + saved settings ──
    (function() {
        const savedTheme = localStorage.getItem('codx_theme');
        if (savedTheme === 'light') {
            editor.setTheme("ace/theme/textmate");
        } else {
            editor.setTheme("ace/theme/tomorrow_night_eighties");
        }
        const savedSize = parseInt(localStorage.getItem('codx_fontsize'));
        if (savedSize && savedSize >= 10 && savedSize <= 40) {
            editor.setOptions({ fontSize: savedSize + 'px' });
            _lastZoomSize = savedSize;
        } else if (window.innerWidth >= 768) {
            editor.setOptions({ fontSize: '16px' });
            _lastZoomSize = 16;
        }
        // Restore no-animations setting
        if (localStorage.getItem('codx_no_anim')) {
            const s = document.createElement('style');
            s.id = 'no-anim-style';
            s.textContent = '*, *::before, *::after { animation-duration: 0.001ms !important; animation-delay: 0ms !important; transition-duration: 0.001ms !important; transition-delay: 0ms !important; }';
            document.head.appendChild(s);
            _animationsDisabled = true;
            const btn = document.getElementById('no-anim-btn');
            if (btn) { btn.style.color = 'var(--accent)'; btn.style.background = 'var(--accent-dim)'; }
        }
        // Plain text ON by default — only disable if user explicitly turned it off
        if (localStorage.getItem('codx_plain_text') === '0') {
            _forcePlainText = false;
        } else {
            _forcePlainText = true;
            editor.session.setMode('ace/mode/text');
            const btn = document.getElementById('plain-text-btn');
            if (btn) { btn.style.color = 'var(--accent)'; btn.style.background = 'var(--accent-dim)'; }
        }
    })();

    // ── STEP 4: Smart syntax mode ──
    // Large files (>200KB) → plain text. Syntax tokenizer is the #1 hang cause.
    const _modeMap = {
        html:'html', htm:'html', js:'javascript', ts:'typescript',
        css:'css', json:'json', md:'markdown', py:'python',
        txt:'text', xml:'xml', php:'php', jsx:'jsx', tsx:'tsx',
        vue:'html', svelte:'html', sh:'sh', yaml:'yaml', yml:'yaml',
    };
    function _setEditorMode(filename, content) {
        // If user has forced plain text, never change the mode
        if (_forcePlainText) return;
        const ext = (filename||'').split('.').pop().toLowerCase();
        const size = (content||editor.getValue()).length;
        const lines = editor.session.getLength();
        // >200KB or >1000 lines → auto plain text (performance)
        if (size > 200000 || lines > 1000) {
            editor.session.setMode('ace/mode/text');
            _showPerfBadge('Plain text mode (large file)');
            return;
        }
        const mode = _modeMap[ext] || 'text';
        const cur = (editor.session.getMode().$id || '');
        if (!cur.endsWith(mode)) editor.session.setMode('ace/mode/' + mode);
    }


    function _showPerfBadge(msg) {
        // Always center screen — not related to nav or modals
        let toast = document.getElementById('action-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'action-toast';
            toast.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);background:var(--glass-bg);border:1px solid var(--glass-border);color:var(--text-color);padding:8px 16px;border-radius:20px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px;z-index:99999;opacity:0;transition:opacity 0.25s ease,transform 0.25s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 4px 14px rgba(0,0,0,0.10);pointer-events:none;white-space:nowrap;max-width:88vw;overflow:hidden;text-overflow:ellipsis;';
            document.body.appendChild(toast);
        }
        // Force center
        toast.style.top = '50%';
        toast.style.bottom = 'auto';
        toast.style.transform = 'translateX(-50%) translateY(-50%)';

        const iconSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
        const isSuccess = msg.includes('✓') || msg.toLowerCase().includes('loaded');
        const checkSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>';
        const usedSvg = isSuccess ? checkSvg : iconSvg;

        // Strip any existing SVG from msg
        const cleanMsg = msg.replace(/<svg[^>]*>.*?<\/svg>\s*/gs, '').replace(/[⚡✓]\s*/g, '').trim();
        toast.innerHTML = `${usedSvg} ${cleanMsg}`;
        toast.style.opacity = '1';
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => { toast.style.opacity = '0'; }, 2800);
    }

    // ── STEP 5: Fast value setter — freeze renderer during large loads ──
    function _setEditorValueFast(content) {
        if(!content && content !== '') return;
        const big = content.length > 80000;
        if(big) {
            editor.renderer.freeze();
            editor.session.setMode('ace/mode/text');
            editor.setValue(content, -1);
            requestAnimationFrame(() => {
                editor.renderer.unfreeze();
                editor.renderer.updateFull(true);
                // Only restore syntax if user hasn't forced plain text
                if (!_forcePlainText) _setEditorMode(currentFileName, content);
                _updateEditorPlaceholder();
            });
        } else {
            editor.setValue(content, -1);
            requestAnimationFrame(_updateEditorPlaceholder);
        }
    }


    // ── STEP 7: Font size — keep direct reference for zoom handler ──
    const _origSetFontSize = editor.setFontSize.bind(editor);
    // editor.setFontSize is NOT overridden — zoom handler calls _origSetFontSize directly

    // ── STEP 8: Change event → debounced (not every keystroke) ──
    let _changeDebounce = null;
    let scrollTimeout;
    const jumpers = document.getElementById('jumpers');

    function checkScrollable() {
        try {
            const s = editor.renderer.layerConfig.maxHeight > editor.renderer.$size.scrollerHeight;
            jumpers.style.display = s ? 'flex' : 'none';
            return s;
        } catch(e) { return false; }
    }
    editor.session.on("changeScrollTop", function() {
        if(!checkScrollable()) return;
        jumpers.classList.add('visible');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => jumpers.classList.remove('visible'), 2000);
    });
    function saveSession() {
        if (typeof fileTabs !== 'undefined' && fileTabs.length > 0) {
            let cur = fileTabs.find(t => t.id === activeTabId);
            if(cur) cur.content = editor.getValue();
            const key = _pythonMode ? 'codx_session_py' : 'codx_session_html';
            localStorage.setItem(key, JSON.stringify({tabs: fileTabs, active: activeTabId, counter: tabIdCounter}));
        }
    }
    window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveSession(); });
    window.addEventListener('pagehide', saveSession);

    editor.session.on("change", function() {
        requestAnimationFrame(_updateEditorPlaceholder);
        if(_changeDebounce) return;
        _changeDebounce = setTimeout(() => { checkScrollable(); saveSession(); _changeDebounce = null; }, 250);
    });

    // ── Editor placeholder ──
    function _updateEditorPlaceholder() {
        const ph    = document.getElementById('editor-placeholder');
        const icon  = document.getElementById('ep-icon');
        const title = document.getElementById('ep-title');
        const sub   = document.getElementById('ep-sub');
        if (!ph) return;

        const val = editor.getValue();
        const lines = editor.session.getLength();
        const isEmpty = val.trim().length === 0 && lines <= 1;
        const shouldShow = isEmpty && !_inPreview;
        ph.classList.toggle('visible', shouldShow);

        // Only update content when showing — avoids unnecessary DOM work
        if (!shouldShow) return;
        if (_pythonMode) {
            if (icon)  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h5a3 3 0 0 1 3 3v3H9a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h1"/><path d="M18 20h-5a3 3 0 0 1-3-3v-3h5a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3h-1"/><circle cx="8.5" cy="6.5" r="1" fill="var(--accent)" stroke="none"/><circle cx="15.5" cy="17.5" r="1" fill="var(--accent)" stroke="none"/></svg>';
            if (title) title.textContent = 'Start coding in Python';
            if (sub)   sub.innerHTML    = 'Pyodide · CPython 3.12 · hit <b style="opacity:0.5;font-weight:700">Preview</b> to run';
        } else {
            if (icon)  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>';
            if (title) title.textContent = 'Start coding in HTML';
            if (sub)   sub.innerHTML    = 'Write your markup · hit <b style="opacity:0.5;font-weight:700">Preview</b> to render';
        }
    }
    // Run once on load — delayed so Ace editor is fully initialized
    setTimeout(_updateEditorPlaceholder, 300);

    // ── CODE INDEX — lightweight client-side map of the file ──
    // Builds silently on every edit. Used to give AI a map before sending full code.
    // (code index removed — full code is sent directly to AI)

    // ── STEP 9: Initial content ──
    // Example code removed. Content is loaded later by the session manager.

    function customFastScroll(direction) {
        let startPos = editor.renderer.getScrollTop();
        let distance = direction === 'up' ? -800 : 800;
        let maxScroll = editor.renderer.layerConfig.maxHeight - editor.renderer.$size.scrollerHeight;
        let endPos = Math.max(0, Math.min(maxScroll, startPos + distance));
        let duration = 250; 
        let startTime = null;
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            let timeElapsed = currentTime - startTime;
            let progress = Math.min(timeElapsed / duration, 1);
            let ease = 1 - Math.pow(1 - progress, 3);
            editor.renderer.scrollToY(startPos + ((endPos - startPos) * ease));
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        requestAnimationFrame(animation);
    }

    async function pasteClipboard() { try { const text = await navigator.clipboard.readText(); if(text) { editor.insert(text); showToast('Pasted', 'content_paste'); } } catch (err) { /* fallback silent */ } }
    async function copyClipboard() { try { const text = editor.getSelectedText(); if(text) { await navigator.clipboard.writeText(text); showToast('Copied', 'content_copy'); } else { cdAlert('Copy', 'Double-tap text to select it first.', 'info'); } } catch (err) { cdAlert('Copy', 'Copy failed.', 'error'); } }
    async function cutClipboard() { try { const text = editor.getSelectedText(); if(text) { await navigator.clipboard.writeText(text); editor.insert(''); showToast('Cut', 'content_cut'); } else { cdAlert('Cut', 'Double-tap text to select it first.', 'info'); } } catch (err) { cdAlert('Cut', 'Cut failed.', 'error'); } }
    function deleteSelection() { const text = editor.getSelectedText(); if(text) { editor.insert(''); showToast('Deleted', 'delete'); } else { cdAlert('Delete', 'Double-tap text to select it first.', 'info'); } }

    function showToast(msg, iconName) {
        let toast = document.getElementById('action-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'action-toast';
            toast.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);background:var(--glass-bg);border:1px solid var(--glass-border);color:var(--text-color);padding:8px 16px;border-radius:20px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px;z-index:99999;opacity:0;transition:opacity 0.25s ease,transform 0.25s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 4px 12px rgba(0,0,0,0.2);pointer-events:none;white-space:nowrap;max-width:88vw;overflow:hidden;text-overflow:ellipsis;';
            document.body.appendChild(toast);
        }

        const chatPanel   = document.getElementById('inline-chat-panel');
        const commitModal = document.getElementById('commit-modal-overlay');
        const anyModal    = document.querySelector('.modal.active, #github-modal.active, #agent-modal.active, #custom-dialog-overlay.active, #new-project-overlay.active');
        const panel       = document.getElementById('bottom-panel');

        // Reset all position props cleanly each call
        toast.style.top    = 'auto';
        toast.style.bottom = 'auto';
        toast.style.transform = 'translateX(-50%)';

        if (commitModal) {
            // Commit modal open → center vertically
            toast.style.top = '50%';
            toast.style.transform = 'translateX(-50%) translateY(-50%)';
        } else if (anyModal) {
            // Modal open → just below header with 16px gap
            const hh = (document.getElementById('header') || {}).offsetHeight || 48;
            toast.style.top = (hh + 16) + 'px';
        } else if (_chatIsFullscreen) {
            // Chat fullscreen → dead center of screen
            toast.style.top = '50%';
            toast.style.transform = 'translateX(-50%) translateY(-50%)';
        } else if (_inlineChatOpen && chatPanel && chatPanel.classList.contains('chat-open')) {
            // Chat panel open → 20px above chat panel top edge
            const chatTop = chatPanel.getBoundingClientRect().top;
            toast.style.bottom = (window.innerHeight - chatTop + 20) + 'px';
        } else if (!_navHidden && !_inPreview && panel && panel.style.transform !== 'translateY(100%)') {
            // Nav visible → 20px above nav panel
            toast.style.bottom = (panel.offsetHeight + 20) + 'px';
        } else {
            // Preview mode or nav hidden → center screen
            toast.style.top = '50%';
            toast.style.transform = 'translateX(-50%) translateY(-50%)';
        }

        toast.innerHTML = `<span class="material-icons-round" style="font-size:16px;color:var(--accent);flex-shrink:0;">${iconName}</span> ${msg}`;
        toast.style.opacity = '1';
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
    }

    const editorWrapper = document.getElementById('editor');
    let initialDistance = null, initialFontSize = 10;
    let _zoomFrame = null;
    editorWrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
            initialFontSize = parseInt(editor.getOption("fontSize"));
            _lastZoomSize = initialFontSize;
        }
    }, {passive: true});
    editorWrapper.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialDistance) {
            e.preventDefault();
            const d = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
            let s = Math.round(initialFontSize * d / initialDistance);
            s = Math.max(10, Math.min(40, s));
            if (s !== _lastZoomSize) {
                _lastZoomSize = s;
                // Single rAF — schedule once, skip if already pending
                if (!_zoomFrame) {
                    _zoomFrame = requestAnimationFrame(() => {
                        _origSetFontSize(_lastZoomSize + "px");
                        _zoomFrame = null;
                    });
                }
            }
        }
    }, {passive: false});
    editorWrapper.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialDistance = null;
            _zoomFrame = null;
            // Save font size after pinch zoom completes
            if (_lastZoomSize !== 10) {
                localStorage.setItem('codx_fontsize', _lastZoomSize);
            }
        }
    }, {passive: true});

    const bottomPanel = document.getElementById('bottom-panel');

    // _inPreview declared early at top
    let _navMini = true; // Set to true so it starts collapsed by default

    // Initialize the UI state on load
    document.addEventListener('DOMContentLoaded', () => {
        const bottomPanel = document.getElementById('bottom-panel');
        if (bottomPanel) {
            bottomPanel.classList.add('nav-mini');
            const icon = document.getElementById('nav-toggle-icon');
            if (icon) icon.style.transform = 'rotate(180deg)';
        }
    });

    // ── NAV TOGGLE: full ↔ mini (single cursor row) ──
    function toggleNavSize() {
        _navMini = !_navMini;
        const bottomPanel = document.getElementById('bottom-panel');
        const icon = document.getElementById('nav-toggle-icon');

        bottomPanel.classList.toggle('nav-mini', _navMini);

        // Smooth arrow rotation
        if (icon) {
            icon.style.transform = _navMini ? 'rotate(180deg)' : 'rotate(0deg)';
        }

        // Editor resize after animation completes
        setTimeout(() => editor.resize(), 400);
    }

    // ── NAV COMPLETELY HIDE/SHOW ──
    // _navHidden declared early at top
    function toggleNavVisibility() {
        _navHidden = !_navHidden;
        const outer = document.getElementById('bottom-outer');
        const inner = document.getElementById('bottom-panel');
        const icon = document.getElementById('nav-hide-icon');
        const t = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
        const isDesktop = window.innerWidth >= 768;
        if (_navHidden) {
            if(outer) { outer.style.transition = t; outer.style.transform = 'translateY(100%)'; }
            if(inner) { inner.style.transition = t; inner.style.transform = isDesktop ? 'translateX(-100%)' : 'translateY(100%)'; }
            if(icon)  { icon.style.opacity = '0.4'; icon.style.transform = 'scale(0.85)'; }
            if(isDesktop) document.querySelector('.app-layout').style.paddingLeft = '0';
        } else {
            if(outer) { outer.style.transition = t; outer.style.transform = ''; }
            if(inner) { inner.style.transition = t; inner.style.transform = ''; }
            if(icon)  { icon.style.opacity = '1'; icon.style.transform = 'scale(1)'; }
            if(isDesktop) document.querySelector('.app-layout').style.paddingLeft = '';
        }
        setTimeout(() => editor.resize(), 380);
    }

    // Legacy stubs — kept so existing calls dont break
    function _expandNav()          {}

    // Dynamic Theme Color Updater
    function toggleTheme() {
        let isDark = document.body.classList.contains('dark-theme');
        document.body.className = isDark ? 'light-theme no-select' : 'dark-theme no-select';
        editor.setTheme(isDark ? "ace/theme/textmate" : "ace/theme/tomorrow_night_eighties");
        const iconName = isDark ? 'dark_mode' : 'light_mode';
        document.getElementById('theme-icon').innerText = iconName;
        const tbIcon = document.getElementById('theme-icon-tb');
        if (tbIcon) tbIcon.innerText = iconName;
        document.getElementById('theme-color-meta').content = isDark ? '#f0f2f5' : '#0a0a0c';
        localStorage.setItem('codx_theme', isDark ? 'light' : 'dark');
    }

    let _previewBlobUrl = null;
    function dismissPreviewWelcome() {
        const pw = document.getElementById('preview-welcome');
        if(pw) pw.style.display = 'none';
    }

    function _refreshPreview() {
        let code = editor.getValue();
        // Inject viewport meta if missing
        if(!code.includes('viewport')) {
            code = code.replace('<head>', '<head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">');
        }
        // Inject base CSS reset only if user has no body/html styling
        const hasBodyStyle = /body\s*\{|html\s*\{|margin\s*:|padding\s*:/.test(code);
        if(!hasBodyStyle && code.includes('<head>')) {
            const resetCSS = '<style>*{box-sizing:border-box;}body{margin:0;padding:0;}</style>';
            code = code.replace('<head>', '<head>' + resetCSS);
        }
        // Use Blob URL instead of srcdoc — gives iframe a real origin so
        // internet requests, CDN scripts, fetch/XHR, APIs all work
        if(_previewBlobUrl) { URL.revokeObjectURL(_previewBlobUrl); }
        const blob = new Blob([code], { type: 'text/html' });
        _previewBlobUrl = URL.createObjectURL(blob);
        document.getElementById('preview').src = _previewBlobUrl;
    }

    function switchTab(tabName, fromBtn) {
        const edEl    = document.getElementById('editor');
        const prvEl   = document.getElementById('preview');
        const outerEl = document.getElementById('bottom-outer');
        const innerEl = document.getElementById('bottom-panel');

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        if(fromBtn) fromBtn.classList.add('active');
        else if(event && event.currentTarget) event.currentTarget.classList.add('active');
        else {
            const tgt = document.getElementById(tabName === 'preview' ? 'tab-preview' : 'tab-code');
            if(tgt) tgt.classList.add('active');
        }

        // Always keep header visible
        const header = document.getElementById('header');
        header.style.display = '';
        header.style.opacity = '1';
        header.style.visibility = 'visible';

        if(tabName === 'preview') {
            _inPreview = true;
            prvEl.classList.add('active-pane');
            edEl.style.opacity = '0';
            edEl.style.pointerEvents = 'none';
            jumpers.style.display = 'none';
            const isDesktop = window.innerWidth >= 768;
            if (!isDesktop) {
                const t = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
                if(outerEl) { outerEl.style.transition = t; outerEl.style.transform = 'translateY(100%)'; }
                if(innerEl) { innerEl.style.transition = t; innerEl.style.transform = 'translateY(100%)'; }
            }
            // Force hide chat panel in preview — it's fixed positioned and would overlay preview
            const chatPanel = document.getElementById('inline-chat-panel');
            if (chatPanel) { chatPanel.style.transform = 'translateY(100%)'; chatPanel.style.pointerEvents = 'none'; }
            document.getElementById('find-modal').classList.remove('active');
            closeGithubModal();
            _refreshPreview();
        } else {
            _inPreview = false;
            prvEl.classList.remove('active-pane');
            edEl.style.opacity = '1';
            edEl.style.pointerEvents = 'auto';
            // Restore nav panel if user hasn't hidden it
            if(!_navHidden) {
                const t = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
                if(outerEl) { outerEl.style.transition = t; outerEl.style.transform = ''; }
                if(innerEl) { innerEl.style.transition = t; innerEl.style.transform = ''; }
            }
            // Restore chat panel if it was open
            const chatPanel = document.getElementById('inline-chat-panel');
            if (chatPanel && _inlineChatOpen) {
                chatPanel.style.transform = '';
                chatPanel.style.pointerEvents = 'auto';
            }
            checkScrollable();
            editor.blur();
        }
    }

    // --- MULTI-TAB SYSTEM ---
    let _savedSession = null;
    try { _savedSession = JSON.parse(localStorage.getItem('codx_session_html')); } catch(e) {}
    // Fallback: migrate old unified session key to html session
    if (!_savedSession) { try { _savedSession = JSON.parse(localStorage.getItem('codx_session')); } catch(e) {} }
    
    let fileTabs = _savedSession && _savedSession.tabs ? _savedSession.tabs : [{ id: 1, name: 'index.html', content: '' }];
    let activeTabId = _savedSession && _savedSession.active ? _savedSession.active : 1;
    let tabIdCounter = _savedSession && _savedSession.counter ? _savedSession.counter : 2;

    let initialTab = fileTabs.find(t => t.id === activeTabId) || fileTabs[0];
    _setEditorValueFast(initialTab.content);
    _setEditorMode(initialTab.name, initialTab.content);

    function renderFileTabs() {
        if (typeof saveSession === 'function') saveSession();
        const bar = document.getElementById('file-tabs-bar');
        bar.innerHTML = '';
        fileTabs.forEach(tab => {
            const el = document.createElement('div');
            el.className = 'file-tab' + (tab.id === activeTabId ? ' active' : '');
            el.innerHTML = `<span style="pointer-events:none">${tab.name}</span><span class="material-icons-round ft-close" onclick="closeFileTab(${tab.id},event)">close</span>`;
            el.onclick = (e) => { if(!e.target.classList.contains('ft-close')) switchFileTab(tab.id); };
            bar.appendChild(el);
        });
    }

    function switchFileTab(id) {
        let cur = fileTabs.find(t => t.id === activeTabId);
        if(cur) cur.content = editor.getValue();
        activeTabId = id;
        let tab = fileTabs.find(t => t.id === id);
        if(tab) {
            _setEditorValueFast(tab.content);
            if (_pythonMode && !_forcePlainText) {
                editor.session.setMode('ace/mode/python');
            } else {
                _setEditorMode(tab.name, tab.content);
            }
            currentFileName = tab.name;
        }
        renderFileTabs();
        if(_inPreview) { _refreshPreview(); }
    }

    function closeFileTab(id, e) {
        e.stopPropagation();
        const tab = fileTabs.find(t => t.id === id);
        const name = tab ? tab.name : 'this file';
        cdConfirm('Close Tab', `Close "${name}"? Unsaved changes will be lost.`, 'Close', 'Cancel', (ok) => {
            if(!ok) return;
            let idx = fileTabs.findIndex(t => t.id === id);
            fileTabs.splice(idx, 1);
            if(fileTabs.length === 0) {
                const blankName = _pythonMode ? 'main.py' : 'index.html';
                const blank = { id: tabIdCounter++, name: blankName, content: '' };
                fileTabs.push(blank);
                activeTabId = blank.id;
                _setEditorValueFast(blank.content);
                _pythonMode ? editor.session.setMode('ace/mode/python') : _setEditorMode(blank.name, blank.content);
                currentFileName = blank.name;
            } else if(activeTabId === id) {
                let newTab = fileTabs[Math.max(0, idx - 1)];
                activeTabId = newTab.id;
                _setEditorValueFast(newTab.content);
                _setEditorMode(newTab.name, newTab.content);
                currentFileName = newTab.name;
            }
            renderFileTabs();
        });
    }

    function openFileInTab(name, content, forceNew) {
        let cur = fileTabs.find(t => t.id === activeTabId);
        if(cur) cur.content = editor.getValue();
        if(forceNew) {
            let newTab = { id: tabIdCounter++, name, content };
            fileTabs.push(newTab); activeTabId = newTab.id;
        } else {
            let cur2 = fileTabs.find(t => t.id === activeTabId);
            if(cur2) { cur2.name = name; cur2.content = content; }
        }
        _setEditorValueFast(content);
        if (_pythonMode && !_forcePlainText) {
            editor.session.setMode('ace/mode/python');
        } else {
            _setEditorMode(name, content);
        }
        currentFileName = name;
        renderFileTabs();
    }

    renderFileTabs();
    let currentFileName = "index.html";
    function loadFile(event) {
        const file = event.target.files[0]; if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();

        // Mode-based file format enforcement
        if (_pythonMode && ext !== 'py') {
            cdAlert('Python Mode', `Only .py files can be opened in Python mode.\n"${file.name}" is not allowed.`, 'warn');
            event.target.value = '';
            return;
        }
        const _webExts = ['html','htm','css','js','ts','jsx','tsx','json','md','txt','xml','svg'];
        if (!_pythonMode && !_webExts.includes(ext)) {
            cdAlert('HTML Mode', `"${file.name}" is not a supported web file.\nSupported: ${_webExts.join(', ')}`, 'warn');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            const content = e.target.result;
            const name = file.name;
            if(fileTabs.length > 0) {
                _showDialog(
                    '<span class="material-icons-round" style="color:var(--accent)">folder_open</span>',
                    'Open File',
                    `Open "${name}"`,
                    null,
                    [
                        { label: 'Cancel',       cls: 'secondary', value: 'cancel'  },
                        { label: 'Current Tab',  cls: 'secondary', value: 'current' },
                        { label: 'New Tab',      cls: 'primary',   value: 'new'     },
                    ]
                );
                _cdResolve = (choice) => {
                    if (!choice || choice === 'cancel') return;
                    openFileInTab(name, content, choice === 'new');
                };
            } else {
                openFileInTab(name, content, false);
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    }
    async function saveFile() {
        const code = editor.getValue();
        if (window.showSaveFilePicker) { try { const handle = await window.showSaveFilePicker({ suggestedName: currentFileName }); const writable = await handle.createWritable(); await writable.write(code); await writable.close(); return; } catch (err) {} }
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' })); a.download = currentFileName; a.click();
    }
    // ── Nav hide/restore for modals (find, agent) ──

    // Replace field: strip leading/trailing whitespace and prevent extra newlines on paste
    document.getElementById('replace-input').addEventListener('paste', function(e) {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        const cleaned = pasted.replace(/^\s+|\s+$/g, '').replace(/\r\n|\r/g, '\n');
        const start = this.selectionStart, end = this.selectionEnd;
        this.value = this.value.slice(0, start) + cleaned + this.value.slice(end);
        this.selectionStart = this.selectionEnd = start + cleaned.length;
    });
    function _fmToggle(type, btn) {
        btn.classList.toggle('on');
        if (type === 'case')  document.getElementById('find-case').checked  = btn.classList.contains('on');
        if (type === 'regex') document.getElementById('find-regex').checked = btn.classList.contains('on');
    }

    function toggleFindReplace() { 
        closeGithubModal(); 
        const isActive = !findModal.classList.contains('active');
        if (isActive) {
            findModal.classList.add('active');
            requestAnimationFrame(() => { 
                const fi = document.getElementById('find-input');
                fi.focus(); 
                fi.setSelectionRange(fi.value.length, fi.value.length);
                _positionFindModal();
                setTimeout(_positionFindModal, 400);
            });
        } else {
            findModal.classList.remove('active');
            findModal.style.top = '';
            findModal.style.bottom = '';
        }
    }
    function findText(showErrorAlert = true) { 
        let searchStr = document.getElementById('find-input').value.trim(); if (!searchStr) return;
        let caseSensitive = document.getElementById('find-case').checked;
        let useRegex = document.getElementById('find-regex').checked;
        editor.find(searchStr, { wrap: true, caseSensitive: caseSensitive, wholeWord: false, regExp: useRegex });
        requestAnimationFrame(function() {
            let match = editor.getSelectionRange();
            if (match.isEmpty() && showErrorAlert) { showToast('No exact match found.', 'error_outline'); editor.clearSelection(); }
            else if (!match.isEmpty()) { editor.renderer.scrollSelectionIntoView(match.start, match.end); editor.centerSelection(); editor.focus(); }
        });
    }
    function replaceText() { 
        let replaceStr = document.getElementById('replace-input').value.trim(); let match = editor.getSelectionRange();
        if(!match.isEmpty()) { 
            let start = match.start;
            editor.replace(replaceStr); 
            editor.selection.setSelectionRange({start: start, end: editor.getCursorPosition()});
        } else { 
            cdAlert('Replace', "Click 'Find Next' first.", 'info'); 
        }
    }
    function clearFind() { document.getElementById('find-input').value = ''; document.getElementById('replace-input').value = ''; editor.clearSelection(); }

    // --- GITHUB MANAGER ---
    let ghCurrentRepo = localStorage.getItem('gh_last_repo') || "", ghCurrentFile = localStorage.getItem('gh_last_file') || "", ghCurrentSha = "";

    function _ghUpdateHeaderStatus() {
        const el = document.getElementById('gh-header-status');
        if (!el) return;
        el.textContent = ghCurrentRepo ? ghCurrentRepo.split('/').pop() : 'Connected';
    }

    function openGithubModal() {
        findModal.classList.remove('active');
        ghOverlay.style.display = 'block';
        ghOverlay.classList.add('active');
        ghModal.classList.add('active');
        checkGhLogin();
    }
    function closeGithubModal() {
        ghModal.classList.remove('active');
        // Immediately remove display — no transition delay, no invisible intercepts
        ghOverlay.classList.remove('active');
        ghOverlay.style.display = 'none';
        const hist = document.getElementById('gh-commit-history');
        if (hist) hist.style.display = 'none';
    }

    let _ghReposLoaded = false;
    let _ghTree = [];         // full flat tree from GitHub
    let _ghCurrentPath = '';  // current folder path being browsed
    let _ghSelectedItem = null; // selected file/folder item

    function checkGhLogin() {
        let token = localStorage.getItem('gh_token');
        let loginSec = document.getElementById('gh-login-section');
        let repoSec = document.getElementById('gh-repo-section');
        const statusEl = document.getElementById('gh-header-status');
        if(token) {
            loginSec.style.display = 'none'; repoSec.style.display = 'block'; repoSec.className = 'gh-section-anim';
            if(statusEl) statusEl.textContent = ghCurrentRepo ? ghCurrentRepo.split('/').pop() : 'Connected';
            if(!_ghReposLoaded) { _ghReposLoaded = true; fetchGhRepos(); }
        } else {
            loginSec.style.display = 'block'; repoSec.style.display = 'none';
            if(statusEl) statusEl.textContent = 'Not connected';
            _ghReposLoaded = false;
        }
    }

    function saveGhToken() { let tk = document.getElementById('gh-token').value.trim(); if(tk) { localStorage.setItem('gh_token', tk); checkGhLogin(); } }
    function ghLogout() { 
        cdConfirm('Logout', 'Disconnect GitHub and remove your token from this device?', 'Logout', 'Cancel', (ok) => {
            if (ok) { 
                localStorage.removeItem('gh_token'); 
                localStorage.removeItem('gh_last_repo');
                localStorage.removeItem('gh_last_file');
                ghCurrentRepo = ''; ghCurrentFile = ''; ghCurrentSha = '';
                _ghReposLoaded = false; 
                checkGhLogin(); 
            }
        });
    }

    async function ghApi(endpoint, method='GET', body=null) {
        let token = localStorage.getItem('gh_token');
        let opts = { method, headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' }};
        if(body) opts.body = JSON.stringify(body);
        let res = await fetch(`https://api.github.com${endpoint}`, opts);
        if(!res.ok) throw new Error(await res.text()); return res.json();
    }

    function encodeB64(str) { return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) { return String.fromCharCode('0x' + p1); })); }
    function decodeB64(str) { return decodeURIComponent(atob(str).split('').map(function(c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join('')); }

    async function fetchGhRepos() {
        try {
            let repos = await ghApi('/user/repos?sort=updated&per_page=100');
            const lastRepo = localStorage.getItem('gh_last_repo') || '';
            renderGhCustomSelect('gh-repo-select', repos.map(r => ({ value: r.full_name, label: r.name, icon: 'folder' })), lastRepo ? (lastRepo.split('/').pop()) : 'Select Repository...', (val) => {
                document.getElementById('gh-repo-select')._value = val;
                ghCurrentRepo = val;
                localStorage.setItem('gh_last_repo', val);
                _ghUpdateHeaderStatus();
                _ghTree = []; _ghCurrentPath = ''; _ghSelectedItem = null;
                fetchGhFiles();
            });
            // Auto-restore last repo — set _value only, fetchGhFiles already called via onChange above
            if (lastRepo) {
                const el = document.getElementById('gh-repo-select');
                if (el) { el._value = lastRepo; ghCurrentRepo = lastRepo; _ghUpdateHeaderStatus(); fetchGhFiles(); }
            }
        } catch(e) { cdAlert('GitHub', 'Failed to load repos. Check your token.', 'error'); _ghReposLoaded = false; }
    }

    // Refresh button — clears local tree cache and forces a fresh fetch from GitHub
    async function _ghForceRefresh() {
        if(!ghCurrentRepo) { cdAlert('Refresh', 'Select a repository first.', 'info'); return; }
        const btn = document.querySelector('#github-modal button[onclick="_ghForceRefresh()"]');
        if(btn) { const icon = btn.querySelector('.material-icons-round'); if(icon) { icon.style.animation = 'spin 0.6s linear'; setTimeout(()=>{ icon.style.animation=''; }, 700); } }
        _ghTree = [];
        _ghCurrentPath = '';
        _ghSelectedItem = null;
        _ghDisableFileActions();
        await fetchGhFiles();
    }

    async function fetchGhFiles() {
        const _repoEl = document.getElementById('gh-repo-select');
        ghCurrentRepo = (_repoEl ? _repoEl._value : '') || ghCurrentRepo || '';
        if(!ghCurrentRepo) return;
        localStorage.setItem('gh_last_repo', ghCurrentRepo);
        _ghUpdateHeaderStatus();
        const tree = document.getElementById('gh-file-tree');
        const breadcrumb = document.getElementById('gh-breadcrumb');
        const createBar = document.getElementById('gh-create-bar');
        tree.style.display = 'block';
        tree.innerHTML = '<div class="gh-tree-loading">Loading repository...</div>';
        breadcrumb.style.display = 'flex';
        createBar.style.display = 'grid';
        const b = document.getElementById('gh-load-repo-btn'); if(b){ b.disabled = false; b.style.opacity='1'; }
        _ghSelectedItem = null;
        _ghDisableFileActions();
        try {
            let repoData = await ghApi(`/repos/${ghCurrentRepo}`);
            let branch = repoData.default_branch;
            let treeData = await ghApi(`/repos/${ghCurrentRepo}/git/trees/${branch}?recursive=1`);
            _ghTree = treeData.tree;
            _ghCurrentPath = '';
            _ghRenderTree();
        } catch(e) { tree.innerHTML = '<div class="gh-tree-loading">Failed to load files.</div>'; }
    }

    function _ghRenderTree() {
        const tree = document.getElementById('gh-file-tree');
        const breadcrumb = document.getElementById('gh-breadcrumb');

        // Breadcrumb
        breadcrumb.innerHTML = '';
        const parts = _ghCurrentPath ? _ghCurrentPath.split('/') : [];
        const rootCrumb = document.createElement('span');
        rootCrumb.className = 'gh-crumb';
        rootCrumb.textContent = ghCurrentRepo.split('/').pop();
        rootCrumb.onclick = () => { _ghCurrentPath = ''; _ghSelectedItem = null; _ghDisableFileActions(); _ghRenderTree(); };
        breadcrumb.appendChild(rootCrumb);
        parts.forEach((part, i) => {
            const sep = document.createElement('span'); sep.className = 'gh-crumb-sep'; sep.textContent = '/';
            breadcrumb.appendChild(sep);
            const crumb = document.createElement('span'); crumb.className = 'gh-crumb'; crumb.textContent = part;
            const pathUpTo = parts.slice(0, i+1).join('/');
            crumb.onclick = () => { _ghCurrentPath = pathUpTo; _ghSelectedItem = null; _ghDisableFileActions(); _ghRenderTree(); };
            breadcrumb.appendChild(crumb);
        });

        // Filter items at current path level
        const prefix = _ghCurrentPath ? _ghCurrentPath + '/' : '';
        const seen = new Set();
        const items = [];

        _ghTree.forEach(node => {
            if(!node.path.startsWith(prefix)) return;
            const rel = node.path.slice(prefix.length);
            if(!rel) return;
            const firstSeg = rel.split('/')[0];
            if(seen.has(firstSeg)) return;
            seen.add(firstSeg);
            const isDir = rel.includes('/') || node.type === 'tree';
            items.push({ name: firstSeg, path: prefix + firstSeg, type: isDir ? 'tree' : 'blob', sha: node.sha });
        });

        // Sort: folders first
        items.sort((a,b) => { if(a.type === b.type) return a.name.localeCompare(b.name); return a.type === 'tree' ? -1 : 1; });

        tree.innerHTML = '';
        if(items.length === 0) { tree.innerHTML = '<div class="gh-tree-loading">Empty folder</div>'; return; }

        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'gh-tree-item';
            const icon = item.type === 'tree' ? 'folder' : _ghFileIcon(item.name);
            row.innerHTML = `
                <span class="material-icons-round gh-item-icon">${icon}</span>
                <span class="gh-item-name">${item.name}</span>
                <div class="gh-item-actions">
                    ${item.type === 'blob' ? `<button class="gh-item-action-btn" title="Open" onclick="event.stopPropagation();_ghQuickOpen('${item.path}')"><span class="material-icons-round">edit</span></button>` : ''}
                    ${item.type === 'blob' ? `<button class="gh-item-action-btn" title="Download" onclick="event.stopPropagation();_ghQuickDownload('${item.path}','${item.name}')"><span class="material-icons-round">download</span></button>` : ''}
                    <button class="gh-item-action-btn" title="Rename" onclick="event.stopPropagation();_ghSelectItem(this.closest('.gh-tree-item'),'${item.path}','${item.name}','${item.type}','${item.sha||''}');renameGhFile()"><span class="material-icons-round">drive_file_rename_outline</span></button>
                    <button class="gh-item-action-btn" title="Delete" style="color:#ef4444" onclick="event.stopPropagation();_ghSelectItem(this.closest('.gh-tree-item'),'${item.path}','${item.name}','${item.type}','${item.sha||''}');deleteGhFile()"><span class="material-icons-round">delete</span></button>
                </div>
            `;
            row.onclick = () => {
                if(item.type === 'tree') {
                    _ghCurrentPath = item.path; _ghSelectedItem = null; _ghDisableFileActions(); _ghRenderTree();
                } else {
                    _ghSelectItem(row, item.path, item.name, item.type, item.sha || '');
                }
            };
            tree.appendChild(row);
        });
    }

    function _ghFileIcon(name) {
        const ext = name.split('.').pop().toLowerCase();
        const map = { html:'html',htm:'html',js:'javascript',ts:'code',css:'palette',json:'data_object',md:'description',py:'code',txt:'article',svg:'image',png:'image',jpg:'image',gif:'image' };
        return map[ext] ? 'insert_drive_file' : 'insert_drive_file';
    }

    function _ghSelectItem(rowEl, path, name, type, sha) {
        document.querySelectorAll('.gh-tree-item.selected').forEach(r => r.classList.remove('selected'));
        rowEl.classList.add('selected');
        _ghSelectedItem = { path, name, type, sha };
        ghCurrentFile = path;
        if (type === 'blob') localStorage.setItem('gh_last_file', path);
        // Enable Load Selected only for files not folders
        const loadBtn = document.getElementById('gh-load-btn');
        if(loadBtn) { loadBtn.disabled = type !== 'blob'; loadBtn.style.opacity = type === 'blob' ? '1' : '0.35'; }
        // Enable commit button and notify user when a file is selected
        if (type === 'blob') {
            const commitBtn = document.getElementById('gh-commit-btn');
            if (commitBtn) commitBtn.disabled = false;
            const undoBtn = document.getElementById('gh-undo-btn');
            if (undoBtn) undoBtn.disabled = false;
            showToast(`"${name}" selected — tap Commit to push`, 'cloud_upload');
        }
    }

    function _ghDisableFileActions() {
        const el = document.getElementById('gh-load-btn');
        if(el) el.disabled = true;
    }


    function _ghDownloadRepo() {
        if (!ghCurrentRepo) { cdAlert('Download', 'Select a repository first.', 'warn'); return; }
        const token = localStorage.getItem('gh_token');
        const repoName = ghCurrentRepo.split('/').pop();
        // GitHub API: download ZIP archive of default branch
        const url = `https://api.github.com/repos/${ghCurrentRepo}/zipball`;
        // Create a temporary anchor with auth header via fetch → blob
        cdConfirm('Download Repo', `Download "${repoName}" as ZIP?`, 'Download', 'Cancel', async (ok) => {
            if (!ok) return;
            showToast('Downloading...', 'download');
            try {
                const resp = await fetch(url, {
                    headers: token ? { 'Authorization': `token ${token}` } : {}
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const blob = await resp.blob();
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${repoName}.zip`;
                a.click();
                URL.revokeObjectURL(a.href);
                showToast(`"${repoName}.zip" downloaded`, 'download_done');
            } catch(e) {
                cdAlert('Download Failed', e.message || 'Could not download repository.', 'error');
            }
        });
    }

    function _ghRenameRepo() {
        if (!ghCurrentRepo) { cdAlert('Rename Repo', 'No repository selected.', 'warn'); return; }
        const currentName = ghCurrentRepo.split('/').pop();
        cdPrompt('Rename Repository', `Enter new name for "${currentName}":`, currentName, async (newName) => {
            if (!newName || newName === currentName) return;
            try {
                await ghApi(`/repos/${ghCurrentRepo}`, 'PATCH', { name: newName });
                const owner = ghCurrentRepo.split('/')[0];
                ghCurrentRepo = `${owner}/${newName}`;
                localStorage.setItem('gh_last_repo', ghCurrentRepo);
                _ghUpdateHeaderStatus();
                _ghReposLoaded = false;
                fetchGhRepos();
                cdAlert('Renamed', `Repository renamed to "${newName}"`, 'success');
            } catch(e) {
                cdAlert('Rename Failed', 'Could not rename. Check permissions.', 'error');
            }
        });
    }

    async function _ghQuickOpen(path) {
        try {
            let fileData = await ghApi(`/repos/${ghCurrentRepo}/contents/${path}`);
            ghCurrentSha = fileData.sha; ghCurrentFile = path;
            localStorage.setItem('gh_last_file', path);
            let name = path.split('/').pop();
            let content = decodeB64(fileData.content);
            closeGithubModal();
            cdConfirm('Open File', `Open "${name}" in a new tab?`, 'New Tab', 'Current Tab', (useNew) => {
                openFileInTab(name, content, useNew);
                document.getElementById('gh-commit-btn').disabled = false;
                const undoBtn = document.getElementById('gh-undo-btn');
                if (undoBtn) undoBtn.disabled = false;
            });
        } catch(e) { cdAlert('GitHub', 'Failed to open file.', 'error'); }
    }

    async function _ghQuickDownload(path, name) {
        try {
            let fileData = await ghApi(`/repos/${ghCurrentRepo}/contents/${path}`);
            let content = decodeB64(fileData.content);
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([content], {type:'text/plain'}));
            a.download = name; a.click();
        } catch(e) { cdAlert('GitHub', 'Failed to download.', 'error'); }
    }

    async function loadGhFile() {
        if(!_ghSelectedItem || _ghSelectedItem.type !== 'blob') return;
        await _ghQuickOpen(_ghSelectedItem.path);
    }

    async function renameGhFile() {
        if(!_ghSelectedItem) return;
        const item = _ghSelectedItem;
        cdPrompt('Rename', `New name for "${item.name}":`, item.name, async (newName) => {
            if(!newName || newName === item.name) return;
            const newPath = item.path.replace(/[^/]+$/, newName);
            try {
                if(item.type === 'blob') {
                    // Get file content first
                    let fileData = await ghApi(`/repos/${ghCurrentRepo}/contents/${item.path}`);
                    let content = fileData.content.replace(/\n/g,'');
                    // Create at new path
                    await ghApi(`/repos/${ghCurrentRepo}/contents/${newPath}`, 'PUT', { message: `Rename ${item.name} to ${newName}`, content, sha: undefined });
                    // Delete old
                    await ghApi(`/repos/${ghCurrentRepo}/contents/${item.path}`, 'DELETE', { message: `Remove old ${item.name}`, sha: fileData.sha });
                    cdAlert('Renamed', `"${item.name}" → "${newName}"`, 'success');
                } else {
                    cdAlert('Rename Folder', 'GitHub does not support direct folder rename. Please rename files individually.', 'info');
                }
                _ghTree = []; await fetchGhFiles();
            } catch(e) { cdAlert('Rename Failed', 'Could not rename. Check permissions.', 'error'); }
        });
    }

    async function deleteGhFile() {
        if(!_ghSelectedItem) return;
        const item = _ghSelectedItem;
        cdConfirm('Delete', `Delete "${item.name}" permanently from GitHub?`, 'Delete', 'Cancel', async (ok) => {
            if(!ok) return;
            try {
                if(item.type === 'blob') {
                    let fileData = await ghApi(`/repos/${ghCurrentRepo}/contents/${item.path}`);
                    await ghApi(`/repos/${ghCurrentRepo}/contents/${item.path}`, 'DELETE', { message: `Delete ${item.name}`, sha: fileData.sha });
                    cdAlert('Deleted', `"${item.name}" deleted.`, 'success');
                } else {
                    // Delete all files in folder
                    const folderFiles = _ghTree.filter(n => n.type === 'blob' && n.path.startsWith(item.path + '/'));
                    for(const f of folderFiles) {
                        let fd = await ghApi(`/repos/${ghCurrentRepo}/contents/${f.path}`);
                        await ghApi(`/repos/${ghCurrentRepo}/contents/${f.path}`, 'DELETE', { message: `Delete ${f.path}`, sha: fd.sha });
                    }
                    cdAlert('Deleted', `Folder "${item.name}" deleted.`, 'success');
                }
                _ghSelectedItem = null; _ghDisableFileActions();
                _ghTree = []; await fetchGhFiles();
            } catch(e) { cdAlert('Delete Failed', 'Could not delete. Check permissions.', 'error'); }
        });
    }

    async function createGhFile() {
        if(!ghCurrentRepo) return;
        cdPrompt('New File', 'File name (e.g. index.html):', 'newfile.html', async (name) => {
            if(!name) return;
            const path = _ghCurrentPath ? `${_ghCurrentPath}/${name}` : name;
            try {
                const blankContent = encodeB64(_getBlankContentForFile(name));
                await ghApi(`/repos/${ghCurrentRepo}/contents/${path}`, 'PUT', { message: `Create ${name}`, content: blankContent });
                cdAlert('Created', `"${name}" created.`, 'success');
                _ghTree = []; await fetchGhFiles();
            } catch(e) { cdAlert('Failed', 'Could not create file.', 'error'); }
        });
    }

    async function createGhFolder() {
        if(!ghCurrentRepo) return;
        cdPrompt('New Folder', 'Folder name:', 'new-folder', async (name) => {
            if(!name) return;
            const path = _ghCurrentPath ? `${_ghCurrentPath}/${name}/.gitkeep` : `${name}/.gitkeep`;
            try {
                await ghApi(`/repos/${ghCurrentRepo}/contents/${path}`, 'PUT', { message: `Create folder ${name}`, content: btoa('') });
                cdAlert('Created', `Folder "${name}" created.`, 'success');
                _ghTree = []; await fetchGhFiles();
            } catch(e) { cdAlert('Failed', 'Could not create folder.', 'error'); }
        });
    }

    function uploadGhFile() {
        if(!ghCurrentRepo) { cdAlert('Upload', 'Select a repository first.', 'info'); return; }
        const inp = document.getElementById('gh-upload-input');
        if(!inp) return;
        inp.value = '';
        inp.click();
    }

    document.getElementById('gh-upload-input').addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if(!files.length) return;
        e.target.value = '';

        // 20MB limit per file
        const tooBig = files.filter(f => f.size > 20 * 1024 * 1024);
        if(tooBig.length) {
            cdAlert('Too Large', `${tooBig.map(f=>f.name).join(', ')} exceeds 20MB limit.`, 'warn');
            return;
        }

        let uploaded = 0, failed = 0;
        showToast(`Uploading ${files.length} file${files.length>1?'s':''}...`, 'upload_file');

        for(const file of files) {
            const filePath = _ghCurrentPath ? `${_ghCurrentPath}/${file.name}` : file.name;
            try {
                // Read as base64
                const b64 = await new Promise((res, rej) => {
                    const r = new FileReader();
                    r.onload = ev => res(ev.target.result.split(',')[1]);
                    r.onerror = () => rej(new Error('Read failed'));
                    r.readAsDataURL(file);
                });

                // Check if file already exists (to get sha for update)
                let sha;
                try {
                    const existing = await ghApi(`/repos/${ghCurrentRepo}/contents/${filePath}`);
                    sha = existing.sha;
                } catch(_) { sha = undefined; }

                const body = { message: sha ? `Update ${file.name}` : `Upload ${file.name}`, content: b64 };
                if(sha) body.sha = sha;
                await ghApi(`/repos/${ghCurrentRepo}/contents/${filePath}`, 'PUT', body);
                uploaded++;
            } catch(err) {
                failed++;
            }
        }

        _ghTree = []; await fetchGhFiles();
        if(failed === 0) {
            cdAlert('Uploaded', `${uploaded} file${uploaded>1?'s':''} uploaded successfully.`, 'success');
        } else {
            cdAlert('Partial Upload', `${uploaded} uploaded, ${failed} failed. Check permissions.`, 'warn');
        }
    });