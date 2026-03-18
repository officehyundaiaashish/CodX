

        /* ──────────────────────── Variables & Themes ──────────────────────── */

        :root {
            --bg-color: #0a0a0c;
            --editor-bg: #141417;
            --text-color: #e0e0e0;
            --glass-bg: #141419;
            --glass-border: rgba(255, 255, 255, 0.08);
            --accent: #10b981; 
            --accent-dim: rgba(16, 185, 129, 0.15);
            --panel-round: 24px;
            --transition: opacity 0.15s;
        }

        body.light-theme {
            --bg-color: #f0f2f5;
            --editor-bg: #ffffff;
            --text-color: #1c1e21;
            --glass-bg: #f8f9fb;
            --glass-border: rgba(0, 0, 0, 0.05);
            --accent: #059669;
            --accent-dim: rgba(5, 150, 105, 0.1);
        }

        /* Anti-Google Search & Global UI Font */

        
/* ── PERF: GPU compositing hints for scroll containers ── */
        #editor, #preview {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: none;
        }
        .cursor-nav, .toolbar-rows, .file-tabs-bar, .gh-custom-list, .agent-provider-grid {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
        }
        /* Touch-action: tells browser which touches to handle natively — zero delay */
        .bottom-area, .toolbar-rows, .cursor-nav { touch-action: pan-x pan-y; }
        #editor { touch-action: pan-x pan-y pinch-zoom; }
        /* Promote scrollable layers to own GPU composite layer */
        .file-tabs-bar { transform: translateZ(0); }
        /* Prevent text selection flicker during touch */
        .toolbar-btn, .icon-btn, .tab, .file-tab { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        /* Remove 300ms tap delay on all interactive elements */
        button, a, [onclick] { touch-action: manipulation; }
        * { box-sizing: border-box; margin: 0; padding: 0; outline: none; }
        .no-select { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }

        body, html { width: 100vw; position: fixed; overflow: hidden; font-family: 'Poppins', sans-serif; background-color: var(--bg-color); color: var(--text-color); height: 100%; overscroll-behavior: none; -webkit-text-size-adjust: none; }
        .app-layout { display: flex; flex-direction: column; height: 100%; width: 100%; }

        /* ── GPU PERF: Reduce backdrop-filter cost on mobile ── */
        
        /* ──────────────────────── Header & Tabs ──────────────────────── */

        .app-header { flex-shrink: 0; background: var(--glass-bg); border-bottom: 1px solid var(--glass-border); padding: 4px 10px; display: flex; align-items: center; justify-content: space-between; z-index: 50; box-shadow: 0 2px 12px rgba(0,0,0,0.10); }
        /* Tabs pill with snake border animation */
        .tabs {
            display: flex;
            padding: 2px;
            border-radius: 20px;
            background: rgba(0,0,0,0.2);
            position: relative;
        }
        body.light-theme .tabs { background: rgba(0,0,0,0.05); }

        /* Snake = thin conic border + inner mask to hollow it out */
        .tabs::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: 21px;
            padding: 1px;
            background: conic-gradient(
                from var(--pill-snake, 0deg),
                transparent 0deg,
                transparent 300deg,
                rgba(16,185,129,0.2) 320deg,
                rgba(16,185,129,0.7) 340deg,
                #10b981 352deg,
                rgba(52,211,153,0.3) 357deg,
                transparent 360deg
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            animation: pillSnake 3.5s linear infinite;
            pointer-events: none;
        }

        @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        @keyframes pillSnake {
            from { --pill-snake: 0deg; }
            to   { --pill-snake: 360deg; }
        }
        @property --pill-snake {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
        }
        .tab { padding: 4px 14px; border-radius: 18px; font-weight: 600; font-size: 12px; color: var(--text-color); opacity: 0.7; transition: opacity 0.15s, transform 0.15s; cursor: pointer; }
        .tab.active { background: var(--accent); color: white; opacity: 1; }
        
        .main-container { flex-grow: 1; position: relative; background-color: var(--editor-bg); overflow: hidden; }

        /* FASTEST MONOSPACE FOR EDITOR ONLY */
        #editor { position: absolute; top: 0; right: 0; bottom: 0; left: 0; font-size: 14px; font-family: 'Courier New', Courier, monospace !important; z-index: 10; contain: size layout; }
        #preview { position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%; border: none; background: white; visibility: hidden; opacity: 0; z-index: 20; transform: translateZ(0); }
        #preview.active-pane { visibility: visible; opacity: 1; }

        .ace_mobile-menu, .ace_tooltip, .ace_callout { display: none !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; }
        .ace_selection { background: rgba(16, 185, 129, 0.35) !important; }
        .ace_selected-word { background: rgba(16, 185, 129, 0.3) !important; border: 1px solid rgba(16, 185, 129, 0.6) !important; border-radius: 2px; }

        .scroll-jumpers { position: absolute; right: 10px; top: 38%; transform: translateY(-50%); display: none; flex-direction: column; gap: 15px; z-index: 35; opacity: 0; transition: opacity 0.3s; }
        .scroll-jumpers.visible { opacity: 1; }
        .jumper-btn { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; color: var(--accent); box-shadow: none; opacity: 0.5; transition: opacity 0.15s, transform 0.15s; cursor: pointer; }
        .jumper-btn:active { transform: scale(0.9); opacity: 1; }

        /* will-change: transform → own GPU layer, no repaint on slide */
        

        /* ──────────────────────── Toolbar & Cursor Nav ──────────────────────── */
.cursor-nav { touch-action: pan-x pan-y; }
        #editor { touch-action: pan-x pan-y pinch-zoom; }
        /* Promote scrollable layers to own GPU composite layer */
        .file-tabs-bar { transform: translateZ(0); }
        .main-container { flex-grow: 1; position: relative; background-color: var(--editor-bg); overflow: hidden; }

        /* FASTEST MONOSPACE FOR EDITOR ONLY */
        #editor { position: absolute; top: 0; right: 0; bottom: 0; left: 0; font-size: 14px; font-family: 'Courier New', Courier, monospace !important; z-index: 10; contain: size layout; }
        #preview { position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%; border: none; background: white; visibility: hidden; opacity: 0; z-index: 20; transform: translateZ(0); }
        #preview.active-pane { visibility: visible; opacity: 1; }

        .ace_mobile-menu, .ace_tooltip, .ace_callout { display: none !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; }
        .ace_selection { background: rgba(16, 185, 129, 0.35) !important; }
        .ace_selected-word { background: rgba(16, 185, 129, 0.3) !important; border: 1px solid rgba(16, 185, 129, 0.6) !important; border-radius: 2px; }

        .scroll-jumpers { position: absolute; right: 10px; top: 38%; transform: translateY(-50%); display: none; flex-direction: column; gap: 15px; z-index: 35; opacity: 0; transition: opacity 0.3s; }
        .scroll-jumpers.visible { opacity: 1; }
        .jumper-btn { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; color: var(--accent); box-shadow: none; opacity: 0.5; transition: opacity 0.15s, transform 0.15s; cursor: pointer; }
        .jumper-btn:active { transform: scale(0.9); opacity: 1; }

        /* Nav panel */
        .bottom-wrapper { position: absolute; bottom: 0; left: 0; right: 0; z-index: 40; }
        .bottom-wrapper.nav-mini #agent-bar { display: none; }

        /* bottom-area — green border stays always */
        .bottom-area {
            background: var(--glass-bg);
            border-top: 2px solid var(--accent);
            border-radius: var(--panel-round) var(--panel-round) 0 0;
            padding-top: 10px;
            padding-bottom: max(env(safe-area-inset-bottom), 12px);
            box-shadow: 0 -2px 12px rgba(0,0,0,0.10);
        }

        .drag-handle-area { width: 100%; height: 0; display: flex; justify-content: center; align-items: center; }
        .drag-pill { width: 30px; height: 4px; background: var(--text-color); opacity: 0.25; border-radius: 10px; }

        /* Nav toggle pill */
        #nav-toggle-btn {
            will-change: transform;
            transition: transform 0.18s ease;
        }
        #nav-toggle-btn:active { transform: scale(0.88); }

        /* Cursor nav row */
        .cursor-nav { display: flex; overflow-x: auto; padding: 4px 8px 6px 8px; gap: 5px; }
        .cursor-nav::-webkit-scrollbar { display: none; }
        .icon-btn { background: rgba(128,128,128,0.08); border: none; border-radius: 10px; min-width: 40px; height: 38px; display: flex; align-items: center; justify-content: center; color: var(--text-color); flex-shrink: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .icon-btn:active { background: var(--accent-dim); color: var(--accent); transform: scale(0.9); }
        .icon-btn .material-icons-round { font-size: 18px; pointer-events: none; }

        /* ── Toolbar animation ── */
        /* Wrap clips height — separate from animated content to avoid layout recalc */
        .toolbar-rows-wrap {
            overflow: hidden;
            max-height: 220px;
            transition: max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bottom-wrapper.nav-mini .toolbar-rows-wrap {
            max-height: 0;
        }

        /* Content: GPU-only opacity+transform — zero repaint */
        .toolbar-rows {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 4px 6px 8px 6px;
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.25s ease, transform 0.25s ease;
            will-change: opacity, transform;
        }
        .bottom-wrapper.nav-mini .toolbar-rows {
            opacity: 0;
            transform: translateY(6px);
            pointer-events: none;
        }

        .toolbar-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; width: 100%; }

        /* Toolbar buttons */
        .toolbar-btn {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            background: none; border: none; color: var(--text-color); opacity: 0.8;
            font-size: 8px; font-weight: 600; gap: 1px; width: 100%;
            padding: 6px 0; cursor: pointer; border-radius: 8px;
            -webkit-tap-highlight-color: transparent;
        }
        .toolbar-btn .material-icons-round { font-size: 19px; pointer-events: none; }
        .toolbar-btn:active { background: var(--accent-dim); color: var(--accent); opacity: 1; transform: scale(0.9); }

        
        /* restore-btn removed */

        
/* Shared Modal CSS */
        .modal { 
            position: fixed; left: 5%; width: 90%; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--panel-round); padding: 15px; z-index: 100; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.10); transition: opacity 0.15s, transform 0.15s;
            bottom: -150%; opacity: 0; pointer-events: none; transform: scale(0.96);
        }
        .modal.active { bottom: 20px; opacity: 1; pointer-events: auto; transform: scale(1); }
        /* Find modal — redesigned card */
        #find-modal {
            left: 50% !important;
            width: 92%;
            max-width: 420px;
            bottom: auto !important;
            transform: translateX(-50%) translateY(12px) scale(0.96);
            border-radius: 20px;
            padding: 0;
            overflow: hidden;
            border: 1px solid var(--glass-border);
            box-shadow: 0 8px 32px rgba(0,0,0,0.22);
            transition: opacity 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.34,1.2,0.64,1);
        }
        #find-modal.active {
            opacity: 1; pointer-events: auto;
            transform: translateX(-50%) translateY(0) scale(1);
        }
        /* Animated search icon */
        @keyframes fm-scan {
            0%   { stroke-dashoffset: 62; opacity: 0.4; }
            50%  { stroke-dashoffset: 0;  opacity: 1; }
            100% { stroke-dashoffset: 62; opacity: 0.4; }
        }
        @keyframes fm-pulse {
            0%,100% { transform: scale(1);   opacity: 0.7; }
            50%      { transform: scale(1.18); opacity: 1;   }
        }
        #fm-scan-circle { stroke-dasharray: 62; stroke-dashoffset: 62; }
        #find-modal.active #fm-scan-circle { animation: fm-scan 2s ease-in-out infinite; }
        #find-modal.active #fm-lens-dot    { animation: fm-pulse 2s ease-in-out infinite; }

        /* Find/Replace field — monospace, editor-style */
        #find-modal .fm-field {
            width: 100%;
            padding: 8px 10px;
            border-radius: 8px;
            background: rgba(0,0,0,0.25);
            border: 1.5px solid var(--glass-border);
            color: var(--text-color);
            font-family: 'Poppins', sans-serif;
            font-size: 13px;
            resize: none;
            outline: none;
            user-select: text;
            -webkit-user-select: text;
            transition: border-color 0.15s, box-shadow 0.15s;
            line-height: 1.55;
        }
        #find-modal .fm-field:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 2px var(--accent-dim);
        }
        body.light-theme #find-modal .fm-field { background: rgba(0,0,0,0.06); }

        /* Toggle chips */
        .fm-chip {
            display: flex; align-items: center; gap: 4px;
            padding: 4px 9px; border-radius: 8px;
            border: 1.5px solid var(--glass-border);
            background: transparent;
            color: var(--text-color); opacity: 0.6;
            font-family: 'Poppins', sans-serif; font-size: 10px; font-weight: 700;
            cursor: pointer; transition: all 0.15s; user-select: none;
        }
        .fm-chip.on { border-color: var(--accent); background: var(--accent-dim); color: var(--accent); opacity: 1; }
        
        .modal textarea, .modal input, .modal select { width: 100%; padding: 10px; margin-bottom: 8px; border-radius: 8px; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); color: var(--text-color); font-family: 'Courier New', Courier, monospace; font-size: 13px; }
        .modal-actions { display: flex; gap: 8px; }
        .modal-btn { padding: 10px; border: none; border-radius: 8px; background: var(--accent); color: white; font-weight: 600; font-family: 'Poppins', sans-serif; font-size: 13px; cursor: pointer; transition: opacity 0.2s, transform 0.15s; }
        .modal-btn:active { opacity: 0.8; transform: scale(0.97); }
        .modal-btn.secondary { background: rgba(128,128,128,0.2); color: var(--text-color); }

        
/* Find modal checkbox styles */
        .find-options { display: flex; gap: 12px; margin-bottom: 8px; }
        .find-check-label { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: var(--text-color); opacity: 0.8; cursor: pointer; user-select: none; }
        .find-check-label input[type="checkbox"] { accent-color: var(--accent); width: 14px; height: 14px; cursor: pointer; }

        
/* GitHub modal — full screen sheet */
        #github-modal {
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%) scale(0.88);
            bottom: auto !important;
            width: 88%;
            max-width: 380px;
            max-height: 82vh;
            overflow-y: auto;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 14px;
            z-index: 110;
            box-shadow: 0 4px 20px rgba(0,0,0,0.10);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
        #github-modal::-webkit-scrollbar { display: none; }
        #github-modal.active {
            opacity: 1;
            pointer-events: auto;
            transform: translate(-50%, -50%) scale(1);
        }
        #gh-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 105;
            display: none; opacity: 0; transition: opacity 0.2s ease;
        }
        #gh-overlay.active { display: block; opacity: 1; }
        #github-modal { pointer-events: none; }
        #github-modal.active { pointer-events: auto; }
        .gh-select-wrap { position: relative; margin-bottom: 8px; }
        .gh-select-wrap select {
            width: 100%; padding: 11px 36px 11px 12px; border-radius: 10px;
            background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border);
            color: var(--text-color); font-family: 'Poppins', sans-serif; font-size: 13px;
            appearance: none; -webkit-appearance: none; cursor: pointer;
            transition: border-color 0.15s;
        }
        .gh-select-wrap select:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); outline: none; }
        #github-modal input { font-family: 'Poppins', sans-serif; border-radius: 10px; padding: 11px 12px; transition: border-color 0.15s; }
        #github-modal input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); outline: none; }

        /* GitHub file tree */
        #gh-file-tree { margin-top: 8px; max-height: 260px; overflow-y: auto; border-radius: 10px; background: rgba(0,0,0,0.15); border: 1px solid var(--glass-border); }
        #gh-file-tree::-webkit-scrollbar { display: none; }
        .gh-tree-item {
            display: flex; align-items: center; gap: 8px; padding: 9px 12px;
            border-bottom: 1px solid var(--glass-border); cursor: pointer;
            transition: background 0.15s; position: relative;
        }
        .gh-tree-item:last-child { border-bottom: none; }
        .gh-tree-item:active { background: var(--accent-dim); }
        .gh-tree-item.selected { background: var(--accent-dim); }
        .gh-tree-item .gh-item-icon { font-size: 16px; color: var(--accent); flex-shrink: 0; }
        .gh-tree-item .gh-item-name { flex: 1; font-size: 12px; font-weight: 600; color: var(--text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .gh-tree-item .gh-item-actions { display: flex; gap: 4px; opacity: 0; pointer-events: none; transition: opacity 0.15s; flex-shrink: 0; }
        .gh-tree-item:hover .gh-item-actions, .gh-tree-item.selected .gh-item-actions { opacity: 1; pointer-events: auto; }
        .gh-item-action-btn { width: 26px; height: 26px; border-radius: 6px; border: none; background: rgba(128,128,128,0.15); color: var(--text-color); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .gh-item-action-btn:active { background: var(--accent-dim); color: var(--accent); transform: scale(0.9); }
        .gh-item-action-btn .material-icons-round { font-size: 14px; pointer-events: none; }
        .gh-breadcrumb { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; padding: 6px 10px; background: rgba(0,0,0,0.15); border-radius: 8px; }
        .gh-crumb { font-size: 11px; font-weight: 600; color: var(--accent); cursor: pointer; }
        .gh-crumb-sep { font-size: 11px; opacity: 0.3; }
        .gh-tree-loading { text-align: center; padding: 20px; font-size: 11px; opacity: 0.5; }

        
/* File Tabs Bar */
        .file-tabs-bar { flex-shrink: 0; display: flex; flex-wrap: nowrap; overflow-x: auto; background: var(--glass-bg); border-bottom: 1px solid var(--glass-border); padding: 0 6px; gap: 2px; }
        .file-tabs-bar::-webkit-scrollbar { display: none; }

        /* Chat open: keep header + tabbar pinned so keyboard can't push them */
        body.chat-kb-open .app-header {
            position: fixed !important;
            top: 0; left: 0; right: 0;
            z-index: 50;
        }
        body.chat-kb-open .file-tabs-bar {
            position: fixed !important;
            top: var(--chat-hdr-h, 48px);
            left: 0; right: 0;
            z-index: 49;
        }
        /* Prevent editor area going black when keyboard opens */
        body.chat-kb-open #editor-wrapper {
            background: var(--editor-bg) !important;
        }
        body.chat-kb-open #editor {
            background: var(--editor-bg) !important;
        }
        .file-tab { display: flex; align-items: center; gap: 5px; padding: 6px 12px 6px 12px; font-size: 11px; font-weight: 600; color: var(--text-color); opacity: 0.55; border-bottom: 2px solid transparent; white-space: nowrap; cursor: pointer; flex-shrink: 0; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .file-tab.active { opacity: 1; border-bottom-color: var(--accent); color: var(--accent); }
        .file-tab .ft-close { font-size: 13px; opacity: 0.4; margin-left: 2px; line-height: 1; transition: opacity 0.15s; pointer-events: auto; }
        .file-tab .ft-close:active { opacity: 1; }

        
/* ===== WELCOME SCREEN ===== */
        #welcome-screen {
            position: fixed; inset: 0; z-index: 1000;
            background: linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0a0a0c 100%);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 30px;
            transition: opacity 0.25s ease, transform 0.25s ease;
        }
        #welcome-screen.hiding { opacity: 0; transform: scale(1.04); pointer-events: none; }
        #welcome-screen.hidden { display: none; }
        .welcome-card {
            background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 28px;
            padding: 36px 28px 28px; width: 100%; max-width: 360px;
            box-shadow: none;
            animation: welcomeCardIn 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;
            text-align: center;
        }
        @keyframes welcomeCardIn {
            from { opacity: 0; transform: translateY(40px) scale(0.92); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .welcome-logo {
            width: 72px; height: 72px; border-radius: 20px; background: #10b981;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 20px; font-size: 28px; font-weight: 900; color: white;
            font-family: monospace; box-shadow: none;
            animation: welcomeLogoPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.4s both;
        }
        @keyframes welcomeLogoPop { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
        .welcome-title {
            font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.5px;
            margin-bottom: 8px;
            animation: welcomeFadeUp 0.5s ease 0.55s both;
        }
        .welcome-sub {
            font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 28px;
            animation: welcomeFadeUp 0.5s ease 0.65s both;
        }
        @keyframes welcomeFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .welcome-features {
            display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px;
            animation: welcomeFadeUp 0.5s ease 0.75s both;
        }
        .welcome-feature {
            display: flex; align-items: center; gap: 10px;
            background: rgba(255,255,255,0.06); border-radius: 12px; padding: 10px 14px;
            border: 1px solid rgba(255,255,255,0.08); text-align: left;
        }
        .welcome-feature .material-icons-round { color: #10b981; font-size: 18px; flex-shrink:0; }
        .welcome-feature span:last-child { font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 600; }
        .welcome-start-btn {
            width: 100%; padding: 15px; border: none; border-radius: 16px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white; font-size: 15px; font-weight: 700; font-family: 'Poppins', sans-serif;
            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
            box-shadow: none;
            transition: transform 0.2s, box-shadow 0.2s;
            animation: welcomeFadeUp 0.5s ease 0.85s both;
        }
        .welcome-start-btn:active { transform: scale(0.97); box-shadow: none; }
        .welcome-start-btn .material-icons-round { font-size: 20px; }

        
/* ===== REPO LOAD PROGRESS BAR ===== */
        #repo-progress-overlay {
            position: fixed; inset: 0; z-index: 600; background: rgba(0,0,0,0.7);
            display: none; flex-direction: column;
            align-items: center; justify-content: center; gap: 20px;
        }
        #repo-progress-overlay.visible { display: flex; }
        .repo-progress-card {
            background: var(--glass-bg); border: 1px solid var(--glass-border);
            border-radius: 20px; padding: 28px 24px; width: 85%; max-width: 320px;
            box-shadow: none;
            animation: welcomeCardIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .repo-progress-title { font-size: 14px; font-weight: 700; color: var(--text-color); margin-bottom: 6px; }
        .repo-progress-sub { font-size: 11px; color: var(--text-color); opacity: 0.5; margin-bottom: 18px; }
        .repo-progress-bar-track {
            height: 6px; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; margin-bottom: 10px;
        }
        .repo-progress-bar-fill {
            height: 100%; background: linear-gradient(90deg, #10b981, #34d399);
            border-radius: 10px; width: 0%; transition: width 0.3s ease;
            box-shadow: none;
        }
        .repo-progress-count { font-size: 11px; color: var(--accent); font-weight: 600; text-align:right; }

        
/* ===== NEW PROJECT MODAL ===== */
        #new-project-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 300; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
            display: flex; align-items: center; justify-content: center;
        }
        #new-project-overlay.active { opacity: 1; pointer-events: auto; }
        #new-project-modal {
            background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 20px;
            padding: 22px 20px; width: 88%; max-width: 400px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.10);
            transform: scale(0.9) translateY(10px); transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
            font-family: 'Poppins', sans-serif; max-height: 90vh; overflow-y: auto;
        }
        #new-project-overlay.active #new-project-modal { transform: scale(1) translateY(0); }
        #new-project-modal input, #new-project-modal select, #new-project-modal textarea {
            width: 100%; padding: 11px 12px; border-radius: 10px; background: rgba(0,0,0,0.25);
            border: 1px solid var(--glass-border); color: var(--text-color);
            font-family: 'Poppins', sans-serif; font-size: 13px; margin-bottom: 10px;
            transition: border-color 0.15s;
        }
        #new-project-modal input:focus, #new-project-modal select:focus, #new-project-modal textarea:focus {
            border-color: var(--accent); outline: none; box-shadow: 0 0 0 2px var(--accent-dim);
        }
        .np-section-label { font-size: 10px; font-weight: 700; color: var(--accent); text-transform: uppercase;
            letter-spacing: 0.8px; margin-bottom: 8px; margin-top: 14px; opacity: 0.9; }
        .np-save-options { display: flex; gap: 8px; margin-bottom: 10px; }
        .np-save-opt {
            flex: 1; padding: 12px 8px; border: 1.5px solid var(--glass-border); border-radius: 12px;
            background: rgba(0,0,0,0.15); cursor: pointer; text-align: center; transition: all 0.2s;
            font-family: 'Poppins', sans-serif;
        }
        .np-save-opt.selected { border-color: var(--accent); background: var(--accent-dim); }
        .np-save-opt .material-icons-round { font-size: 22px; color: var(--accent); display: block; margin-bottom: 4px; }
        .np-save-opt span:last-child { font-size: 10px; font-weight: 600; color: var(--text-color); }
        .np-tab-bar { display: flex; background: rgba(0,0,0,0.2); border-radius: 10px; padding: 3px; margin-bottom: 14px; }
        .np-tab { flex: 1; padding: 7px; text-align: center; font-size: 11px; font-weight: 600;
            border-radius: 8px; cursor: pointer; color: var(--text-color); opacity: 0.5; transition: all 0.2s; }
        .np-tab.active { background: var(--accent); color: white; opacity: 1; }
        .np-pane { display: none; }
        .np-pane.active { display: block; }
        .np-repo-visibility { display: flex; gap: 8px; margin-bottom: 10px; }
        .np-vis-opt {
            flex: 1; padding: 10px 8px; border: 1.5px solid var(--glass-border); border-radius: 10px;
            background: rgba(0,0,0,0.15); cursor: pointer; text-align: center;
            font-family: 'Poppins', sans-serif; transition: all 0.2s;
        }
        .np-vis-opt.selected { border-color: var(--accent); background: var(--accent-dim); }
        .np-vis-opt .material-icons-round { font-size: 18px; color: var(--accent); display: block; margin-bottom: 3px; }
        .np-vis-opt span:last-child { font-size: 10px; font-weight: 600; color: var(--text-color); }

        
        /* ──────────────────────── Custom Dialog ──────────────────────── */
#custom-dialog-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 500; opacity: 0; pointer-events: none; transition: opacity 0.25s ease;
            display: flex; align-items: center; justify-content: center;
        }
        #custom-dialog-overlay.active { opacity: 1; pointer-events: auto; }
        #custom-dialog-box {
            background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 18px;
            padding: 22px 20px 16px; width: 82%; max-width: 340px; box-shadow: 0 4px 20px rgba(0,0,0,0.10);
            transform: scale(0.9) translateY(10px); transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
            font-family: 'Poppins', sans-serif;
        }
        #custom-dialog-overlay.active #custom-dialog-box { transform: scale(1) translateY(0); }
        #custom-dialog-icon { font-size: 28px; margin-bottom: 10px; }
        #custom-dialog-title { font-size: 15px; font-weight: 600; color: var(--text-color); margin-bottom: 6px; }
        #custom-dialog-msg { font-size: 12px; color: var(--text-color); opacity: 0.65; margin-bottom: 14px; line-height: 1.5; }
        #custom-dialog-input { width: 100%; padding: 10px 12px; border-radius: 10px; background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border); color: var(--text-color); font-family: 'Poppins', sans-serif; font-size: 13px; margin-bottom: 12px; user-select: text; -webkit-user-select: text; }
        #custom-dialog-input:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 2px var(--accent-dim); }
        #custom-dialog-btns { display: flex; gap: 8px; }
        .cdlg-btn { flex: 1; padding: 11px; border: none; border-radius: 10px; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: transform 0.15s, opacity 0.15s; }
        .cdlg-btn:active { transform: scale(0.96); opacity: 0.85; }
        .cdlg-btn.primary { background: var(--accent); color: #fff; }
        .cdlg-btn.danger { background: #ef4444; color: #fff; }
        .cdlg-btn.secondary { background: rgba(128,128,128,0.18); color: var(--text-color); }

        
/* ===== CUSTOM GITHUB DROPDOWNS ===== */
        .gh-custom-select { position: relative; margin-bottom: 10px; }
        .gh-custom-trigger {
            width: 100%; padding: 11px 36px 11px 12px; border-radius: 10px;
            background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border);
            color: var(--text-color); font-family: 'Poppins', sans-serif; font-size: 13px;
            cursor: pointer; display: flex; align-items: center; justify-content: space-between;
             user-select: none;
        }
        .gh-custom-trigger.open { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
        .gh-custom-trigger .gh-trigger-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: 0.7; }
        .gh-custom-trigger .gh-trigger-text.selected { opacity: 1; color: var(--text-color); }
        .gh-custom-trigger .material-icons-round { font-size: 18px; color: var(--accent); transition: transform 0.2s; flex-shrink: 0; }
        .gh-custom-trigger.open .material-icons-round { transform: rotate(180deg); }
        .gh-custom-list {
            position: absolute; left: 0; right: 0; top: calc(100% + 4px);
            background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px;
            box-shadow: none; z-index: 200; max-height: 200px; overflow-y: auto;
            opacity: 0; transform: translateY(-6px) scale(0.97); pointer-events: none;
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .gh-custom-list::-webkit-scrollbar { display: none; }
        .gh-custom-list.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
        .gh-custom-option {
            padding: 11px 14px; font-family: 'Poppins', sans-serif; font-size: 12px;
            color: var(--text-color); cursor: pointer; 
            display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--glass-border);
        }
        .gh-custom-option:last-child { border-bottom: none; }
        .gh-custom-option:active, .gh-custom-option.selected { background: var(--accent-dim); color: var(--accent); }
        .gh-custom-option .material-icons-round { font-size: 15px; opacity: 0.6; }

        
/* ===== AGENT MODAL ===== */
        #agent-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        }
        #agent-overlay.active { opacity: 1; pointer-events: auto; }
        #agent-modal {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%) scale(0.88);
            width: 88%; max-width: 380px;
            background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 24px; padding: 0;
            z-index: 210; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
            opacity: 0; pointer-events: none;
            transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.34,1.2,0.64,1);
            font-family: 'Poppins', sans-serif;
            overflow: hidden;
        }
        #agent-modal.active { opacity: 1; pointer-events: auto; transform: translate(-50%, -50%) scale(1); }

        /* Modal header strip */
        #agent-modal-header {
            display: flex; align-items: center; gap: 10px;
            padding: 16px 18px 14px;
            border-bottom: 1px solid var(--glass-border);
        }
        #agent-modal-avatar {
            width: 36px; height: 36px; border-radius: 12px;
            background: linear-gradient(135deg, #10b981, #059669);
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        #agent-modal-avatar .material-icons-round { font-size: 18px; color: white; }

        /* Scrollable body */
        #agent-modal-body { padding: 16px 18px; overflow-y: auto; max-height: 72vh; }
        #agent-modal-body::-webkit-scrollbar { display: none; }

        /* Connected agent pill */
        .am-agent-row {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border-radius: 12px;
            border: 1.5px solid var(--glass-border);
            background: transparent; cursor: pointer;
            transition: border-color 0.18s, background 0.18s, transform 0.12s;
            margin-bottom: 6px;
        }
        .am-agent-row.active { border-color: var(--accent); background: var(--accent-dim); }
        .am-agent-row:active { transform: scale(0.98); }
        .am-agent-dot { width: 8px; height: 8px; border-radius: 50%; background: #6b7280; flex-shrink: 0; transition: background 0.3s; }
        .am-agent-row.active .am-agent-dot { background: #10b981; }
        .am-agent-name { flex: 1; font-size: 12px; font-weight: 700; color: var(--text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .am-agent-del { background: none; border: none; cursor: pointer; padding: 4px; opacity: 0.3; color: var(--text-color); border-radius: 6px; transition: opacity 0.15s, color 0.15s; display: flex; align-items: center; }
        .am-agent-del:active { opacity: 1; color: #ef4444; }
        .am-agent-del .material-icons-round { font-size: 15px; pointer-events: none; }

        /* Key input */
        #agent-api-key {
            width: 100%; padding: 11px 13px; border-radius: 12px;
            background: rgba(0,0,0,0.18); border: 1.5px solid var(--glass-border);
            color: var(--text-color); font-family: 'Poppins', sans-serif;
            font-size: 12px; margin-bottom: 8px;
            user-select: text; -webkit-user-select: text;
            transition: border-color 0.18s, box-shadow 0.18s; outline: none;
        }
        #agent-api-key:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }

        /* Provider quick-links */
        .am-provider-row {
            display: flex; align-items: center; gap: 10px;
            padding: 9px 12px; border-radius: 10px;
            border: 1px solid var(--glass-border);
            background: rgba(0,0,0,0.1); cursor: pointer;
            text-decoration: none; transition: background 0.15s, border-color 0.15s;
            margin-bottom: 5px;
        }
        .am-provider-row:active { background: var(--accent-dim); border-color: var(--accent); }
        .am-provider-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .am-provider-name { font-size: 12px; font-weight: 700; color: var(--text-color); }
        .am-provider-tag { font-size: 9px; font-weight: 600; padding: 1px 6px; border-radius: 5px; margin-left: 5px; }

        .agent-provider-grid { display: none; }
        .agent-provider-btn { display: none; }

        /* Animated provider selection list */
        #agent-model-list {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease;
            opacity: 0;
        }
        #agent-model-list.open {
            max-height: 280px;
            opacity: 1;
        }
        #agent-model-list-inner {
            max-height: 260px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            display: flex;
            flex-direction: column;
            gap: 3px;
            padding: 4px 0 6px;
        }
        #agent-model-list-inner::-webkit-scrollbar { display: none; }
        .am-model-row {
            display: flex; align-items: center; gap: 9px;
            padding: 8px 10px;
            border-radius: 10px;
            border: 1.5px solid var(--glass-border);
            background: transparent;
            cursor: pointer;
            transition: border-color 0.15s, background 0.15s, transform 0.12s;
            animation: amRowIn 0.2s ease both;
        }
        @keyframes amRowIn {
            from { opacity:0; transform:translateY(6px); }
            to   { opacity:1; transform:translateY(0); }
        }
        .am-model-row:active { transform: scale(0.97); }
        .am-model-row:hover, .am-model-row.selected { border-color: var(--accent); background: var(--accent-dim); }
        .am-model-dot { width:15px; height:15px; border-radius:4px; border:1.5px solid var(--glass-border); background:transparent; flex-shrink:0; transition:background 0.15s,border-color 0.15s; display:flex; align-items:center; justify-content:center; }
        .am-model-row.selected .am-model-dot { background:var(--accent); border-color:var(--accent); }
        .am-model-dot::after { content:''; display:none; width:4px; height:7px; border:2px solid white; border-top:none; border-left:none; transform:rotate(45deg) translate(0px,-1px); }
        .am-model-row.selected .am-model-dot::after { display:block; }
        .am-model-name { flex:1; font-size:11px; font-weight:700; color:var(--text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-family:'Poppins',sans-serif; }
        .am-model-tag { font-size:8px; font-weight:700; padding:2px 6px; border-radius:5px; flex-shrink:0; font-family:'Poppins',sans-serif; }

        
/* ===== AGENT BAR — compact strip inside nav panel ===== */
        #agent-bar {
            display: none; flex-direction: column; gap: 0;
            border-bottom: 1px solid var(--glass-border);
            background: var(--glass-bg);
        }
        #agent-bar.visible { display: flex; }
        #agent-compact-row {
            display: flex; align-items: center; gap: 6px;
            padding: 6px 10px;
        }
        .agent-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #6b7280; flex-shrink: 0; transition: background 0.3s; }
        #agent-prompt {
            flex: 1; padding: 7px 10px; border-radius: 10px;
            background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border);
            color: var(--text-color); font-family: 'Poppins', sans-serif; font-size: 12px;
            resize: none; height: 34px; max-height: 90px; overflow-y: auto; line-height: 1.4;
            user-select: text; -webkit-user-select: text;
            transition: border-color 0.2s;
        }
        #agent-prompt:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 2px var(--accent-dim); }
        #agent-attach-btn, #agent-send-btn {
            width: 34px; height: 34px; border-radius: 10px; border: none; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; cursor: pointer;
            transition: transform 0.15s, opacity 0.15s;
        }
        #agent-attach-btn:active, #agent-send-btn:active { transform: scale(0.9); }
        #agent-attach-btn { background: rgba(128,128,128,0.12); color: var(--text-color); }
        #agent-send-btn { background: var(--accent); color: white; }
        #agent-send-btn .material-icons-round, #agent-attach-btn .material-icons-round { font-size: 16px; pointer-events: none; }
        #agent-bar-label { font-size: 10px; font-weight: 700; color: var(--accent); white-space: nowrap; max-width: 70px; overflow: hidden; text-overflow: ellipsis; }
        #agent-close-btn { font-size: 16px; opacity: 0.4; cursor: pointer; pointer-events: auto; flex-shrink: 0; }
        #agent-thinking {
            display: none; align-items: center; gap: 6px; font-size: 10px; color: var(--accent); font-weight: 600;
            padding: 0 10px 5px;
        }
        #agent-thinking.visible { display: flex; }
        .agent-dots span { display: inline-block; width: 4px; height: 4px; border-radius: 50%; background: var(--accent); margin-right: 2px; animation: agentBounce 0.8s infinite; }
        .agent-dots span:nth-child(2) { animation-delay: 0.2s; }
        .agent-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes agentBounce { 0%,80%,100%{ transform:translateY(0); opacity:0.6; } 40%{ transform:translateY(-4px); opacity:1; } } @keyframes activityFadeIn { from { opacity:0; transform:translateY(3px); } to { opacity:0.7; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes commitSpin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        #agent-file-selector { padding: 0 10px 5px; }
        #agent-file-select {
            width:100%; padding:5px 8px; border-radius:7px;
            background:rgba(0,0,0,0.25); border:1px solid var(--glass-border);
            color:var(--text-color); font-family:Poppins,sans-serif; font-size:10px;
            font-weight:600; appearance:none; -webkit-appearance:none; cursor:pointer;
        }
    

        /* Full-screen chat overlay */
        #agent-chat-overlay {
            position: fixed; inset: 0; z-index: 400;
            background: rgba(0,0,0,0.6);
            opacity: 0; pointer-events: none;
            transition: opacity 0.25s ease;
        }
        #agent-chat-overlay.active { opacity: 1; pointer-events: auto; }

        /* Chat panel — slides up like WhatsApp */
        #agent-chat-panel {
            position: fixed; left: 0; right: 0; bottom: 0;
            height: 88vh; max-height: 88vh;
            background: var(--glass-bg);
            border-radius: 22px 22px 0 0;
            border-top: 1px solid var(--glass-border);
            z-index: 410;
            display: flex; flex-direction: column;
            transform: translateY(100%);
            transition: transform 0.32s cubic-bezier(0.34,1.2,0.64,1);
            font-family: 'Poppins', sans-serif;
        }
        #agent-chat-panel.active { transform: translateY(0); }

        /* Chat header bar */
        #agent-chat-header {
            display: flex; align-items: center; gap: 10px;
            padding: 14px 16px 10px;
            border-bottom: 1px solid var(--glass-border);
            flex-shrink: 0;
        }
        .chat-header-avatar {
            width: 36px; height: 36px; border-radius: 50%;
            background: linear-gradient(135deg,#10b981,#059669);
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .chat-header-avatar .material-icons-round { font-size: 18px; color: white; }
        .chat-header-info { flex: 1; min-width: 0; }
        .chat-header-name {
            font-size: 14px; font-weight: 700; color: var(--text-color);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .chat-header-status {
            font-size: 10px; color: var(--accent); font-weight: 600; margin-top: 1px;
        }
        #chat-session-name-btn {
            background: none; border: none; cursor: pointer;
            color: var(--text-color); opacity: 0.4;
            display: flex; align-items: center;
            padding: 4px; border-radius: 6px; transition: opacity 0.15s;
        }
        #chat-session-name-btn:active { opacity: 1; }
        #chat-session-name-btn .material-icons-round { font-size: 17px; pointer-events: none; }
        #chat-close-btn {
            background: none; border: none; cursor: pointer;
            color: var(--text-color); opacity: 0.45;
            display: flex; align-items: center;
            padding: 4px; border-radius: 6px;
        }
        #chat-close-btn .material-icons-round { font-size: 20px; pointer-events: none; }

        /* Session name pill */
        #chat-session-label {
            font-size: 10px; font-weight: 700; color: var(--accent);
            background: var(--accent-dim); border: 1px solid var(--accent);
            border-radius: 20px; padding: 2px 9px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            max-width: 120px; cursor: pointer;
        }

        /* Messages scroll area */
        #agent-chat-messages {
            flex: 1; overflow-y: auto; padding: 12px 14px;
            display: flex; flex-direction: column; gap: 10px;
        }
        #agent-chat-messages::-webkit-scrollbar { display: none; }

        /* Individual message bubbles */
        .chat-msg { display: flex; flex-direction: column; max-width: 85%; min-width: 0; }
        .chat-msg.user { align-self: flex-end; align-items: flex-end; }
        .chat-msg.agent { align-self: flex-start; align-items: flex-start; width: 100%; max-width: 100%; }

        .chat-bubble {
            padding: 9px 13px; border-radius: 16px;
            font-size: 12px; line-height: 1.55; word-break: break-word;
            min-width: 0; overflow: hidden; max-width: 100%; box-sizing: border-box;
        }
        .chat-msg.user .chat-bubble {
            background: var(--accent); color: white;
            border-bottom-right-radius: 4px;
        }
        .chat-msg.agent .chat-bubble {
            background: rgba(255,255,255,0.06);
            border: 1px solid var(--glass-border);
            color: var(--text-color);
            border-bottom-left-radius: 4px;
        }
        body.light-theme .chat-msg.agent .chat-bubble {
            background: rgba(0,0,0,0.04);
        }
        .chat-time {
            font-size: 9px; opacity: 0.4; margin-top: 3px; font-weight: 600;
        }
        .chat-msg-footer {
            display: flex; align-items: center; gap: 6px; margin-top: 3px;
        }
        .chat-copy-btn {
            background: none; border: none; cursor: pointer;
            color: var(--text-color); opacity: 0; padding: 2px 5px;
            border-radius: 6px; display: flex; align-items: center; gap: 3px;
            font-size: 9px; font-weight: 600; font-family: 'Poppins', sans-serif;
            transition: opacity 0.15s, background 0.15s;
            -webkit-tap-highlight-color: transparent;
        }
        .chat-copy-btn .material-icons-round { font-size: 12px; pointer-events: none; }
        .chat-msg:hover .chat-copy-btn,
        .chat-msg:active .chat-copy-btn { opacity: 0.6; }
        .chat-copy-btn:active { opacity: 1 !important; background: var(--accent-dim); color: var(--accent); }
        .chat-copy-btn.copied { opacity: 1 !important; color: var(--accent); }

        /* ── Code Canvas (Gemini-style) ── */
        .code-canvas {
            margin: 8px 0 4px;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--glass-border);
            background: #0d0d10;
            font-family: 'Courier New', Courier, monospace;
            max-width: 100%;
            min-width: 0;
            width: 100%;
            box-sizing: border-box;
        }
        body.light-theme .code-canvas { background: #1e1e2e; }
        .code-canvas-header {
            display: flex; align-items: center; gap: 7px;
            padding: 6px 10px;
            background: rgba(255,255,255,0.04);
            border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .code-canvas-lang {
            font-size: 9px; font-weight: 700; font-family: 'Poppins', sans-serif;
            color: var(--accent); text-transform: uppercase; letter-spacing: 0.7px; flex: 1;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .code-canvas-btn {
            background: rgba(255,255,255,0.07); border: none; border-radius: 6px;
            padding: 3px 7px; font-size: 9px; font-weight: 700;
            font-family: 'Poppins', sans-serif; color: rgba(255,255,255,0.7);
            cursor: pointer; display: flex; align-items: center; gap: 3px;
            transition: background 0.15s, color 0.15s; flex-shrink: 0;
            -webkit-tap-highlight-color: transparent;
        }
        .code-canvas-btn:active { background: var(--accent-dim); color: var(--accent); }
        .code-canvas-btn .material-icons-round { font-size: 11px; pointer-events: none; }
        .code-canvas-btn.copied { color: var(--accent); }
        .code-canvas-body {
            padding: 10px 12px;
            overflow-x: auto;
            overflow-y: auto;
            font-size: 11px;
            line-height: 1.55;
            color: #e0e0e0;
            white-space: pre;
            max-height: 260px;
            -webkit-overflow-scrolling: touch;
        }
        /* inline code */
        .chat-inline-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            background: rgba(16,185,129,0.12);
            color: var(--accent);
            padding: 1px 5px;
            border-radius: 4px;
        }
        /* chat markdown */
        .chat-md-bold { font-weight: 700; }
        .chat-md-li { padding-left: 14px; position: relative; }
        .chat-md-li::before { content: '•'; position: absolute; left: 3px; color: var(--accent); }
        .agent-step-card {
            margin-top: 8px;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--glass-border);
        }
        .agent-step-header {
            display: flex; align-items: center; gap: 8px;
            padding: 9px 12px;
            background: rgba(16,185,129,0.08);
            border-bottom: 1px solid var(--glass-border);
        }
        .agent-step-num {
            width: 20px; height: 20px; border-radius: 50%;
            background: var(--accent); color: white;
            font-size: 10px; font-weight: 700;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .agent-step-label {
            font-size: 10px; font-weight: 700; color: var(--accent);
            text-transform: uppercase; letter-spacing: 0.5px; flex: 1;
        }
        .agent-step-body {
            padding: 10px 12px;
            font-size: 12px; line-height: 1.6;
            color: var(--text-color); opacity: 0.9;
            background: rgba(0,0,0,0.12);
        }
        .agent-step-actions {
            display: flex; gap: 8px;
            padding: 9px 12px;
            background: rgba(0,0,0,0.10);
            border-top: 1px solid var(--glass-border);
        }
        .agent-step-accept {
            flex: 1; padding: 8px; border: none; border-radius: 8px;
            background: var(--accent); color: white;
            font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700;
            cursor: pointer; display: flex; align-items: center;
            justify-content: center; gap: 5px;
            transition: opacity 0.15s, transform 0.15s;
        }
        .agent-step-accept:active { opacity: 0.85; transform: scale(0.97); }
        .agent-step-accept .material-icons-round { font-size: 14px; pointer-events: none; }
        .agent-step-reject {
            padding: 8px 14px; border: 1px solid var(--glass-border); border-radius: 8px;
            background: none; color: var(--text-color); opacity: 0.6;
            font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700;
            cursor: pointer; transition: opacity 0.15s, background 0.15s;
        }
        .agent-step-reject:active { background: rgba(239,68,68,0.1); color: #ef4444; opacity: 1; }
        .agent-step-refine-btn {
            padding: 8px 12px; border: 1px solid var(--accent); border-radius: 8px;
            background: none; color: var(--accent);
            font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700;
            cursor: pointer; transition: background 0.15s, opacity 0.15s;
            white-space: nowrap;
        }
        .agent-step-refine-btn:active { background: var(--accent-dim); }
        .agent-step-refine-area {
            padding: 8px 12px;
            border-top: 1px solid var(--glass-border);
            background: rgba(0,0,0,0.1);
            display: flex; gap: 8px; align-items: flex-end;
        }
        .agent-step-refine-input {
            flex: 1; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
            border-radius: 8px; color: var(--text-color); font-family: 'Poppins', sans-serif;
            font-size: 12px; padding: 7px 10px; resize: none; outline: none;
            line-height: 1.4; min-height: 34px; max-height: 80px;
        }
        .agent-step-refine-input:focus { border-color: var(--accent); }
        .agent-step-refine-send {
            width: 32px; height: 32px; border-radius: 8px; border: none; flex-shrink: 0;
            background: var(--accent); color: white; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: opacity 0.15s, transform 0.15s;
        }
        .agent-step-refine-send:active { opacity: 0.8; transform: scale(0.9); }
        .agent-step-refine-send .material-icons-round { font-size: 16px; pointer-events: none; }
        .agent-step-done {
            font-size: 10px; font-weight: 700; color: var(--text-color);
            opacity: 0.4; padding: 9px 12px;
            background: rgba(0,0,0,0.10);
            border-top: 1px solid var(--glass-border);
            text-align: center;
        }
        .agent-plan-item {
            display: flex; gap: 8px; align-items: flex-start;
            padding: 6px 0; border-bottom: 1px solid var(--glass-border);
            font-size: 11px; line-height: 1.5;
        }
        .agent-plan-item:last-child { border-bottom: none; }
        .agent-plan-num {
            font-size: 10px; font-weight: 700; color: var(--accent);
            min-width: 18px; margin-top: 1px;
        }

        /* Typing indicator bubble */
        .chat-typing-bubble {
            display: flex; align-items: center; gap: 4px;
            padding: 10px 14px; border-radius: 16px; border-bottom-left-radius: 4px;
            background: rgba(255,255,255,0.06); border: 1px solid var(--glass-border);
            width: fit-content;
        }
        .chat-typing-bubble span {
            width: 5px; height: 5px; border-radius: 50%;
            background: var(--accent); display: inline-block;
            animation: agentBounce 0.8s infinite;
        }
        .chat-typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
        .chat-typing-bubble span:nth-child(3) { animation-delay: 0.4s; }

        /* Fix / Apply card inside chat bubble */
        .chat-fix-card {
            margin-top: 8px;
            background: rgba(16,185,129,0.07);
            border: 1px solid rgba(16,185,129,0.25);
            border-radius: 10px; padding: 9px 11px;
        }
        .chat-fix-title {
            font-size: 10px; font-weight: 700; color: var(--accent);
            text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
        }
        .chat-fix-reason {
            font-size: 11px; color: var(--text-color); opacity: 0.8;
            margin-bottom: 8px; line-height: 1.5;
        }
        .chat-fix-preview {
            display: flex; gap: 5px; margin-bottom: 8px;
        }
        .chat-fix-side {
            flex: 1; border-radius: 6px; padding: 5px 7px; min-width: 0;
        }
        .chat-fix-side.remove {
            background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
        }
        .chat-fix-side.insert {
            background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);
        }
        .chat-fix-side-label {
            font-size: 8px; font-weight: 700; letter-spacing: 0.4px; margin-bottom: 3px;
        }
        .chat-fix-side.remove .chat-fix-side-label { color: #ef4444; }
        .chat-fix-side.insert .chat-fix-side-label { color: #10b981; }
        .chat-fix-code {
            font-family: monospace; font-size: 10px;
            word-break: break-all; opacity: 0.9;
        }
        .chat-fix-side.remove .chat-fix-code { color: #ef4444; }
        .chat-fix-side.insert .chat-fix-code { color: #10b981; }
        .chat-apply-btn {
            width: 100%; padding: 8px; border: none; border-radius: 8px;
            background: var(--accent); color: white;
            font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700;
            cursor: pointer; display: flex; align-items: center;
            justify-content: center; gap: 6px;
            transition: opacity 0.15s, transform 0.15s;
        }
        .chat-apply-btn:active { opacity: 0.85; transform: scale(0.97); }
        .chat-apply-btn.applied {
            background: rgba(128,128,128,0.2); color: var(--text-color); cursor: default;
        }
        .chat-apply-btn .material-icons-round { font-size: 15px; pointer-events: none; }

        /* Split file card */
        .chat-split-card {
            margin-top: 8px;
            background: rgba(16,185,129,0.06);
            border: 1px solid rgba(16,185,129,0.2);
            border-radius: 10px; padding: 9px 11px;
        }
        .chat-split-file-row {
            display: flex; align-items: center; gap: 8px;
            padding: 6px 0; border-bottom: 1px solid var(--glass-border);
        }
        .chat-split-file-row:last-of-type { border-bottom: none; }
        .chat-split-file-name {
            flex: 1; font-size: 12px; font-weight: 600;
            color: var(--text-color); overflow: hidden;
            text-overflow: ellipsis; white-space: nowrap;
        }
        .chat-split-mini-btn {
            background: var(--accent-dim); border: none; border-radius: 6px;
            padding: 4px 7px; cursor: pointer; font-size: 10px;
            font-family: 'Poppins', sans-serif; font-weight: 700;
            color: var(--accent); transition: transform 0.15s;
        }
        .chat-split-mini-btn:active { transform: scale(0.92); }

        /* Chat input row */
        #agent-chat-input-row {
            display: flex; align-items: flex-end; gap: 8px;
            padding: 10px 14px;
            padding-bottom: max(env(safe-area-inset-bottom), 14px);
            border-top: 1px solid var(--glass-border);
            flex-shrink: 0;
        }
        #agent-chat-file-selector {
            padding: 0 14px 6px; display: none;
            flex-shrink: 0;
        }
        #agent-chat-file-select {
            width: 100%; padding: 5px 8px; border-radius: 7px;
            background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border);
            color: var(--text-color); font-family: Poppins,sans-serif;
            font-size: 10px; font-weight: 600;
            appearance: none; -webkit-appearance: none; cursor: pointer;
        }
        #agent-chat-textarea {
            flex: 1; padding: 9px 12px; border-radius: 20px;
            background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
            color: var(--text-color); font-family: 'Poppins', sans-serif;
            font-size: 13px; resize: none; min-height: 38px;
            max-height: 100px; overflow-y: auto; line-height: 1.4;
            user-select: text; -webkit-user-select: text;
            transition: border-color 0.2s;
        }
        #agent-chat-textarea:focus {
            border-color: var(--accent); outline: none;
            box-shadow: 0 0 0 2px var(--accent-dim);
        }
        #agent-chat-attach-btn, #agent-chat-send-btn {
            width: 38px; height: 38px; border-radius: 50%; border: none;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; flex-shrink: 0;
            transition: transform 0.15s, opacity 0.15s;
        }
        #agent-chat-attach-btn:active, #agent-chat-send-btn:active { transform: scale(0.88); }
        #agent-chat-attach-btn { background: rgba(128,128,128,0.12); color: var(--text-color); }
        #agent-chat-send-btn { background: var(--accent); color: white; }
        #agent-chat-attach-btn .material-icons-round,
        #agent-chat-send-btn .material-icons-round { font-size: 17px; pointer-events: none; }

        /* Empty chat state */
        #chat-empty-state {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            gap: 10px; opacity: 0.45; pointer-events: none;
            padding: 20px;
        }
        #chat-empty-state .material-icons-round { font-size: 38px; color: var(--accent); }
        #chat-empty-state p {
            font-size: 12px; text-align: center; line-height: 1.6;
            color: var(--text-color);
        }



        /* When chat is open, main-container splits into two halves */
        .main-container.chat-split {
            display: flex;
            flex-direction: column;
        }

        /* Editor half — top 50% */
        .main-container.chat-split #editor {
            position: relative;
            top: auto; right: auto; bottom: auto; left: auto;
            flex: 1;
            min-height: 0;
            border-bottom: 2px solid var(--accent);
        }

        /* Chat half — bottom 50% */
        #inline-chat-panel {
            position: fixed;
            left: 0; right: 0;
            bottom: 0;
            z-index: 41;
            height: 45vh;
            display: flex;
            flex-direction: column;
            background: var(--glass-bg);
            border-top: 2px solid var(--accent);
            border-radius: var(--panel-round) var(--panel-round) 0 0;
            box-shadow: 0 -3px 16px rgba(0,0,0,0.10);
            overflow: hidden;
            transform: translateY(100%);
            transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
            pointer-events: none;
            will-change: transform;
        }
        #inline-chat-panel.chat-open {
            transform: translateY(0);
            pointer-events: auto;
        }

        /* Chat header — compact strip */
        #inline-chat-header {
            display: flex;
            align-items: center;
            pointer-events: auto;
            gap: 8px;
            padding: 7px 12px;
            border-bottom: 1px solid var(--glass-border);
            flex-shrink: 0;
        }
        .inline-chat-avatar {
            width: 26px; height: 26px; border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #059669);
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .inline-chat-avatar .material-icons-round { font-size: 14px; color: white; }
        #inline-chat-name {
            font-size: 12px; font-weight: 700;
            color: var(--text-color); flex: 1;
        }
        #inline-chat-status {
            font-size: 10px; color: var(--accent); font-weight: 600;
        }
        #inline-chat-close {
            background: none; border: none; cursor: pointer;
            color: var(--text-color); opacity: 0.4;
            display: flex; align-items: center; padding: 2px;
        }
        #inline-chat-close .material-icons-round { font-size: 18px; pointer-events: none; }
        /* Fullscreen toggle */
        #inline-chat-fullscreen {
            background: rgba(128,128,128,0.1); border: none; border-radius: 8px;
            width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: var(--text-color); opacity: 0.55; flex-shrink: 0;
            transition: opacity 0.15s;
        }
        #inline-chat-fullscreen:active { opacity: 1; background: var(--accent-dim); }
        #inline-chat-panel.chat-fullscreen {
            top: var(--header-full-h, 80px) !important;
            height: calc(100svh - var(--header-full-h, 80px)) !important;
            border-radius: 0 !important;
            padding-top: 0;
            max-height: calc(100svh - var(--header-full-h, 80px)) !important;
        }

        /* Chat mode button — animated glow ring when ON */
        #inline-chat-mode-btn { position: relative; transition: background 0.25s, color 0.25s, box-shadow 0.25s; }
        #inline-chat-mode-btn.mode-on { background: var(--accent) !important; color: white !important; animation: chatModePulse 2s ease-out infinite; }
        @keyframes chatModePulse { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); } 60% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
        #inline-chat-mode-btn.mode-on svg { filter: drop-shadow(0 0 3px rgba(255,255,255,0.4)); }
        #chat-code-access-btn { display: none; position: relative; transition: background 0.25s, color 0.25s, box-shadow 0.25s; }
        #chat-code-access-btn.access-on { background: rgba(245,158,11,0.18) !important; color: #f59e0b !important; border: 1.5px solid rgba(245,158,11,0.4) !important; }
        #chat-code-access-btn.access-on svg { stroke: #f59e0b; }

        /* Toast anchored above chat panel */
        #chat-panel-toast { position:fixed; left:50%; transform:translateX(-50%) translateY(8px); bottom:46vh; background:var(--glass-bg); border:1px solid var(--glass-border); color:var(--text-color); padding:7px 14px; border-radius:20px; font-size:11px; font-weight:700; font-family:'Poppins',sans-serif; display:flex; align-items:center; gap:7px; z-index:9999; opacity:0; pointer-events:none; white-space:nowrap; box-shadow:0 -3px 12px rgba(0,0,0,0.25); transition:opacity 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        #chat-panel-toast.show { opacity:1; }
        #chat-panel-toast:not([style*="top"]).show { transform:translateX(-50%) translateY(0); }
        #chat-panel-toast .cpt-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }

        /* Messages area */
        #inline-chat-messages {
            flex: 1; overflow-y: auto;
            padding: 10px 12px;
            display: flex; flex-direction: column;
            gap: 8px;
            overscroll-behavior: contain;
        }
        #inline-chat-messages::-webkit-scrollbar { display: none; }

        /* Reuse existing chat bubble styles */
        #inline-chat-messages .chat-msg { max-width: 88%; min-width: 0; }
        #inline-chat-messages .chat-msg.agent { max-width: 100%; width: 100%; }

        /* Input row */
        #inline-chat-input-row {
            display: flex; align-items: flex-end; gap: 6px;
            padding: 8px 10px;
            padding-bottom: max(env(safe-area-inset-bottom), 10px);
            border-top: 1px solid var(--glass-border);
            flex-shrink: 0;
        }
        #inline-chat-textarea {
            flex: 1; padding: 8px 11px; border-radius: 18px;
            background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
            color: var(--text-color); font-family: 'Poppins', sans-serif;
            font-size: 12px; resize: none; min-height: 34px;
            max-height: 80px; overflow-y: auto; line-height: 1.4;
            user-select: text; -webkit-user-select: text;
            transition: border-color 0.2s;
        }
        #inline-chat-textarea:focus {
            border-color: var(--accent); outline: none;
            box-shadow: 0 0 0 2px var(--accent-dim);
        }
        #inline-chat-send-btn {
            width: 34px; height: 34px; border-radius: 50%; border: none;
            background: var(--accent); color: white;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; flex-shrink: 0;
            transition: transform 0.15s, background 0.2s;
        }
        #inline-chat-send-btn:active { transform: scale(0.88); }
        #inline-chat-send-btn .material-icons-round { font-size: 16px; pointer-events: none; }
        .prompt-preview-card { background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2); border-radius: 10px; margin: 4px 0; overflow: hidden; font-family: 'Poppins', sans-serif; }
        .prompt-preview-header { display: flex; align-items: center; gap: 6px; padding: 7px 10px; cursor: pointer; user-select: none; }
        .prompt-preview-header:active { background: rgba(16,185,129,0.08); }
        .prompt-preview-title { font-size: 10px; font-weight: 700; color: var(--accent); flex: 1; }
        .prompt-preview-size { font-size: 9px; color: var(--accent); opacity: 0.6; }
        .prompt-preview-chevron { font-size: 14px; color: var(--accent); opacity: 0.7; transition: transform 0.2s; pointer-events: none; }
        .prompt-preview-body { display: none; padding: 0 10px 8px; }
        .prompt-preview-body.open { display: block; }
        .prompt-preview-row { display: flex; gap: 6px; align-items: flex-start; padding: 3px 0; border-bottom: 1px solid rgba(16,185,129,0.08); font-size: 10px; }
        .prompt-preview-row:last-child { border-bottom: none; }
        .prompt-preview-label { color: var(--accent); font-weight: 700; opacity: 0.7; min-width: 70px; flex-shrink: 0; }
        .prompt-preview-val { color: var(--text-color); opacity: 0.8; word-break: break-word; line-height: 1.4; }

        /* Empty state inside inline chat */
        #inline-chat-empty {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            flex: 1; opacity: 0.4; padding: 16px; text-align: center;
            pointer-events: none;
        }
        #inline-chat-empty .material-icons-round { font-size: 28px; color: var(--accent); margin-bottom: 6px; }
        #inline-chat-empty p { font-size: 11px; color: var(--text-color); line-height: 1.6; }

        /* ── Ace Editor Diff Markers (agent preview) ── */
        .ace-diff-remove-line {
            position: absolute;
            background: rgba(239, 68, 68, 0.18);
            border-left: 3px solid #ef4444;
            z-index: 4;
        }
        .ace-diff-add-line {
            position: absolute;
            background: rgba(16, 185, 129, 0.15);
            border-left: 3px solid #10b981;
            z-index: 4;
        }
        .ace_gutter-cell.ace-diff-remove {
            background: rgba(239, 68, 68, 0.25);
            color: #ef4444 !important;
        }
        .ace_gutter-cell.ace-diff-add {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981 !important;
        }

        /* AI Agent button — glowing when chat open */
        .toolbar-btn.chat-active {
            background: var(--accent-dim) !important;
            color: var(--accent) !important;
            opacity: 1 !important;
        }

        /* ══════════════════════════════════════════
           DESKTOP LAYOUT  ≥ 768px
           bottom-panel becomes a left sidebar
        ══════════════════════════════════════════ */
        @media (min-width: 768px) {

            /* Sidebar fixed on left */
            #bottom-panel {
                position: fixed !important;
                left: 0; top: 0; bottom: 0;
                width: 220px;
                height: 100% !important;
                transform: none !important;
                transition: transform 0.3s cubic-bezier(0.4,0,0.2,1) !important;
                z-index: 40;
                display: flex !important;
                flex-direction: column;
                overflow-y: auto;
                overflow-x: hidden;
            }
            #bottom-panel::-webkit-scrollbar { display: none; }

            /* When hidden — slide left */
            #bottom-panel.nav-hidden-desktop {
                transform: translateX(-100%) !important;
            }

            /* bottom-area fills full height in sidebar */
            #bottom-panel .bottom-area {
                flex: 1;
                border-top: none !important;
                border-right: 1px solid var(--glass-border);
                border-radius: 0 !important;
                padding-top: 12px;
                padding-bottom: 12px;
                box-shadow: 2px 0 12px rgba(0,0,0,0.08);
                display: flex;
                flex-direction: column;
                overflow-y: auto;
                overflow-x: hidden;
            }
            #bottom-panel .bottom-area::-webkit-scrollbar { display: none; }

            /* Nav toggle pill — hide on desktop */
            #nav-toggle-btn { display: none !important; }

            /* Cursor nav row — useless on desktop (keyboard exists) */
            .cursor-nav { display: none !important; }

            /* Toolbar rows — vertical flow, full width */
            .toolbar-rows-wrap {
                max-height: none !important;
                overflow: visible !important;
                flex: 1;
            }
            .toolbar-rows {
                flex-direction: column;
                gap: 2px;
                padding: 0 10px 10px 10px;
                opacity: 1 !important;
                transform: none !important;
                pointer-events: auto !important;
            }
            .bottom-wrapper.nav-mini .toolbar-rows {
                opacity: 1 !important;
                transform: none !important;
                pointer-events: auto !important;
            }
            .bottom-wrapper.nav-mini .toolbar-rows-wrap {
                max-height: none !important;
            }

            /* Toolbar rows — single column full width */
            .toolbar-row {
                grid-template-columns: 1fr;
                gap: 1px;
            }

            /* Desktop toolbar buttons — horizontal icon+label, comfortable */
            .toolbar-btn {
                flex-direction: row !important;
                justify-content: flex-start !important;
                gap: 10px;
                padding: 9px 12px !important;
                border-radius: 9px !important;
                font-size: 13px !important;
                opacity: 0.75;
                width: 100%;
            }
            .toolbar-btn:hover { background: rgba(128,128,128,0.1); opacity: 1; }
            .toolbar-btn .material-icons-round { font-size: 18px !important; flex-shrink: 0; }

            /* Section label dividers between groups */
            .toolbar-row::before {
                display: none;
            }

            /* Last misc row — also single column */
            #bottom-panel .bottom-area > div[style*="justify-content: center"] {
                display: flex !important;
                flex-direction: column !important;
                gap: 1px;
                padding: 0 10px;
                margin-top: 4px;
            }
            #bottom-panel .bottom-area > div[style*="justify-content: center"] .toolbar-btn {
                width: 100% !important;
            }

            /* Show section labels only on desktop */
            .dt-section-label { display: block !important; }

            /* Tools row — override inline styles for desktop */
            #bottom-panel .toolbar-rows > div[style*="justify-content: center"] {
                flex-direction: column !important;
                width: 100% !important;
                margin-top: 0 !important;
                padding: 0 10px !important;
            }
            #bottom-panel .toolbar-rows > div[style*="justify-content: center"] .toolbar-btn {
                width: 100% !important;
            }

            /* Sidebar section header labels */
            .dt-section-label {
                font-size: 9px;
                font-weight: 700;
                color: var(--text-color);
                opacity: 0.35;
                text-transform: uppercase;
                letter-spacing: 0.7px;
                padding: 12px 12px 4px;
            }

            /* Push editor + header right to make room for sidebar */
            .app-layout {
                padding-left: 220px;
            }

            /* Inline chat panel — account for sidebar */
            #inline-chat-panel {
                left: 220px !important;
            }

            /* Find modal — account for sidebar */
            #find-modal {
                left: calc(220px + 2%) !important;
                width: calc(96% - 220px) !important;
            }

            /* Editor default font size — larger on desktop */
            #editor { font-size: 16px !important; }

            /* Desktop zoom buttons — header */
            #header-zoom-in-btn, #header-zoom-out-btn { display: flex !important; }

            /* Desktop zoom buttons — sidebar (hide, moved to header) */
            #desktop-zoom-btns { display: none !important; }

            /* Nav hide button in header — on desktop toggles sidebar */
            /* (JS already calls toggleNavVisibility which uses translateY,
                we override that with CSS transform for desktop) */
        }

        /* ── Editor placeholder overlay — centered, shown when editor is empty ── */
        #editor-placeholder {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            z-index: 15;
            opacity: 0;
            transition: opacity 0.2s ease;
            text-align: center;
            padding: 20px;
            background: transparent;
        }
        #editor-placeholder.visible { opacity: 1; }
        #editor-placeholder .ep-icon {
            width: 44px; height: 44px;
            border-radius: 14px;
            background: var(--accent-dim);
            border: 1px solid rgba(16,185,129,0.25);
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 12px;
        }
        #editor-placeholder .ep-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-color);
            opacity: 0.45;
            font-family: 'Poppins', sans-serif;
            margin-bottom: 5px;
        }
        #editor-placeholder .ep-sub {
            font-size: 10px;
            color: var(--text-color);
            opacity: 0.25;
            font-family: 'Poppins', sans-serif;
            line-height: 1.7;
        }

        /* ──────────────────────── Chat History Panel ──────────────────────── */

        #chat-history-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.55);
            z-index: 9999;
            opacity: 0; pointer-events: none;
            transition: opacity 0.22s ease;
        }
        #chat-history-overlay.active { opacity: 1; pointer-events: auto; }
        #chat-history-panel {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            max-height: 80vh;
            background: var(--glass-bg);
            border-radius: 22px 22px 0 0;
            border-top: 2px solid var(--accent);
            z-index: 10000;
            display: flex; flex-direction: column;
            transform: translateY(100%);
            transition: transform 0.3s cubic-bezier(0.34,1.2,0.64,1);
            overflow: hidden;
        }
        #chat-history-panel.active { transform: translateY(0); }
        .chp-header {
            display: flex; align-items: center; gap: 10px;
            padding: 14px 16px 10px;
            border-bottom: 1px solid var(--glass-border);
            flex-shrink: 0;
        }
        .chp-title {
            flex: 1; font-size: 13px; font-weight: 700;
            color: var(--text-color); font-family: 'Poppins', sans-serif;
        }
        .chp-close-btn {
            background: rgba(128,128,128,0.1); border: none;
            border-radius: 8px; width: 28px; height: 28px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: var(--text-color); opacity: 0.6;
            flex-shrink: 0; -webkit-tap-highlight-color: transparent;
        }
        .chp-close-btn:active { opacity: 1; }
        .chp-body {
            flex: 1; overflow-y: auto;
            padding: 8px 12px 32px;
            -webkit-overflow-scrolling: touch;
        }
        .chp-body::-webkit-scrollbar { display: none; }
        .chp-date-label {
            font-size: 9px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.7px; color: var(--text-color); opacity: 0.35;
            padding: 10px 4px 4px; font-family: 'Poppins', sans-serif;
        }
        .chp-session-row {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border-radius: 12px;
            border: 1px solid var(--glass-border);
            margin-bottom: 6px; cursor: pointer;
            background: rgba(128,128,128,0.04);
            transition: background 0.15s;
            animation: chpFadeIn 0.2s ease both;
            -webkit-tap-highlight-color: transparent;
            position: relative;
        }
        @keyframes chpFadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .chp-session-row:active { background: var(--accent-dim); }
        .chp-session-icon {
            width: 30px; height: 30px; border-radius: 9px;
            background: var(--accent-dim);
            border: 1px solid rgba(16,185,129,0.2);
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .chp-session-info { flex: 1; min-width: 0; }
        .chp-session-name {
            font-size: 12px; font-weight: 600; color: var(--text-color);
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            font-family: 'Poppins', sans-serif;
        }
        .chp-session-meta {
            font-size: 10px; color: var(--text-color); opacity: 0.45;
            display: flex; gap: 5px; align-items: center;
            font-family: 'Poppins', sans-serif; margin-top: 2px;
        }
        .chp-del-btn {
            background: none; border: none; padding: 5px;
            cursor: pointer; color: var(--text-color); opacity: 0.25;
            border-radius: 6px; display: flex; align-items: center;
            justify-content: center; flex-shrink: 0;
            -webkit-tap-highlight-color: transparent;
            transition: opacity 0.15s;
        }
        .chp-del-btn:active { opacity: 1; color: #ef4444; }
        .chp-del-btn .material-icons-round { font-size: 16px; pointer-events: none; }
        .chp-empty {
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; padding: 48px 20px; gap: 12px;
            text-align: center;
        }
        .chp-empty .material-icons-round { font-size: 40px; color: var(--accent); opacity: 0.5; }
        .chp-empty p {
            font-size: 12px; color: var(--text-color); opacity: 0.5;
            font-family: 'Poppins', sans-serif; line-height: 1.6;
        }
        .chp-confirm-del {
            display: flex; align-items: center; gap: 7px;
            padding: 7px 13px 9px;
            border-top: 1px solid rgba(239,68,68,0.2);
        }
        @media (min-width: 768px) {
            #chat-history-panel {
                left: auto; right: 24px; bottom: 24px;
                width: 340px; max-height: 70vh;
                border-radius: 18px;
                border: 1px solid var(--glass-border);
                transform: scale(0.92) translateY(10px);
                opacity: 0;
                transition: transform 0.25s cubic-bezier(0.34,1.2,0.64,1), opacity 0.2s ease;
            }
            #chat-history-panel.active {
                transform: scale(1) translateY(0); opacity: 1;
            }
        }


        
    