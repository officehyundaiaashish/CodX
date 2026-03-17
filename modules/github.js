(function(){
const _s=document.createElement("style");
_s.textContent="/* GitHub modal — full screen sheet */\n        #github-modal {\n            position: fixed;\n            top: 50%; left: 50%;\n            transform: translate(-50%, -50%) scale(0.88);\n            bottom: auto !important;\n            width: 88%;\n            max-width: 380px;\n            max-height: 82vh;\n            overflow-y: auto;\n            background: var(--glass-bg);\n            border: 1px solid var(--glass-border);\n            border-radius: 20px;\n            padding: 14px;\n            z-index: 110;\n            box-shadow: 0 4px 20px rgba(0,0,0,0.10);\n            opacity: 0;\n            pointer-events: none;\n            transition: opacity 0.2s ease, transform 0.2s ease;\n        }\n        #github-modal::-webkit-scrollbar { display: none; }\n        #github-modal.active {\n            opacity: 1;\n            pointer-events: auto;\n            transform: translate(-50%, -50%) scale(1);\n        }\n        #gh-overlay {\n            position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 105;\n            display: none; opacity: 0; transition: opacity 0.2s ease;\n        }\n        #gh-overlay.active { display: block; opacity: 1; }\n        #github-modal { pointer-events: none; }\n        #github-modal.active { pointer-events: auto; }\n        .gh-select-wrap { position: relative; margin-bottom: 8px; }\n        .gh-select-wrap select {\n            width: 100%; padding: 11px 36px 11px 12px; border-radius: 10px;\n            background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border);\n            color: var(--text-color); font-family: 'Poppins', sans-serif; font-size: 13px;\n            appearance: none; -webkit-appearance: none; cursor: pointer;\n            transition: border-color 0.15s;\n        }\n        .gh-select-wrap select:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); outline: none; }\n        #github-modal input { font-family: 'Poppins', sans-serif; border-radius: 10px; padding: 11px 12px; transition: border-color 0.15s; }\n        #github-modal input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); outline: none; }\n\n        /* GitHub file tree */\n        #gh-file-tree { margin-top: 8px; max-height: 260px; overflow-y: auto; border-radius: 10px; background: rgba(0,0,0,0.15); border: 1px solid var(--glass-border); }\n        #gh-file-tree::-webkit-scrollbar { display: none; }\n        .gh-tree-item {\n            display: flex; align-items: center; gap: 8px; padding: 9px 12px;\n            border-bottom: 1px solid var(--glass-border); cursor: pointer;\n            transition: background 0.15s; position: relative;\n        }\n        .gh-tree-item:last-child { border-bottom: none; }\n        .gh-tree-item:active { background: var(--accent-dim); }\n        .gh-tree-item.selected { background: var(--accent-dim); }\n        .gh-tree-item .gh-item-icon { font-size: 16px; color: var(--accent); flex-shrink: 0; }\n        .gh-tree-item .gh-item-name { flex: 1; font-size: 12px; font-weight: 600; color: var(--text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n        .gh-tree-item .gh-item-actions { display: flex; gap: 4px; opacity: 0; pointer-events: none; transition: opacity 0.15s; flex-shrink: 0; }\n        .gh-tree-item:hover .gh-item-actions, .gh-tree-item.selected .gh-item-actions { opacity: 1; pointer-events: auto; }\n        .gh-item-action-btn { width: 26px; height: 26px; border-radius: 6px; border: none; background: rgba(128,128,128,0.15); color: var(--text-color); display: flex; align-items: center; justify-content: center; cursor: pointer; }\n        .gh-item-action-btn:active { background: var(--accent-dim); color: var(--accent); transform: scale(0.9); }\n        .gh-item-action-btn .material-icons-round { font-size: 14px; pointer-events: none; }\n        .gh-breadcrumb { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; padding: 6px 10px; background: rgba(0,0,0,0.15); border-radius: 8px; }\n        .gh-crumb { font-size: 11px; font-weight: 600; color: var(--accent); cursor: pointer; }\n        .gh-crumb-sep { font-size: 11px; opacity: 0.3; }\n        .gh-tree-loading { text-align: center; padding: 20px; font-size: 11px; opacity: 0.5; }\n\n        \n/* File Tabs Bar */\n        .file-tabs-bar { flex-shrink: 0; display: flex; flex-wrap: nowrap; overflow-x: auto; background: var(--glass-bg); border-bottom: 1px solid var(--glass-border); padding: 0 6px; gap: 2px; }\n        .file-tabs-bar::-webkit-scrollbar { display: none; }\n\n        /* Chat open: keep header + tabbar pinned so keyboard can't push them */\n        body.chat-kb-open .app-header {\n            position: fixed !important;\n            top: 0; left: 0; right: 0;\n            z-index: 50;\n        }\n        body.chat-kb-open .file-tabs-bar {\n            position: fixed !important;\n            top: var(--chat-hdr-h, 48px);\n            left: 0; right: 0;\n            z-index: 49;\n        }\n        /* Prevent editor area going black when keyboard opens */\n        body.chat-kb-open #editor-wrapper {\n            background: var(--editor-bg) !important;\n        }\n        body.chat-kb-open #editor {\n            background: var(--editor-bg) !important;\n        }\n        .file-tab { display: flex; align-items: center; gap: 5px; padding: 6px 12px 6px 12px; font-size: 11px; font-weight: 600; color: var(--text-color); opacity: 0.55; border-bottom: 2px solid transparent; white-space: nowrap; cursor: pointer; flex-shrink: 0; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }\n        .file-tab.active { opacity: 1; border-bottom-color: var(--accent); color: var(--accent); }\n        .file-tab .ft-close { font-size: 13px; opacity: 0.4; margin-left: 2px; line-height: 1; transition: opacity 0.15s; pointer-events: auto; }\n        .file-tab .ft-close:active { opacity: 1; }\n\n        \n/* ===== WELCOME SCREEN ===== */\n        #welcome-screen {\n            position: fixed; inset: 0; z-index: 1000;\n            background: linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0a0a0c 100%);\n            display: flex; flex-direction: column; align-items: center; justify-content: center;\n            padding: 30px;\n            transition: opacity 0.25s ease, transform 0.25s ease;\n        }\n        #welcome-screen.hiding { opacity: 0; transform: scale(1.04); pointer-events: none; }\n        #welcome-screen.hidden { display: none; }\n        .welcome-card {\n            background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 28px;\n            padding: 36px 28px 28px; width: 100%; max-width: 360px;\n            box-shadow: none;\n            animation: welcomeCardIn 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;\n            text-align: center;\n        }\n        @keyframes welcomeCardIn {\n            from { opacity: 0; transform: translateY(40px) scale(0.92); }\n            to { opacity: 1; transform: translateY(0) scale(1); }\n        }\n        .welcome-logo {\n            width: 72px; height: 72px; border-radius: 20px; background: #10b981;\n            display: flex; align-items: center; justify-content: center;\n            margin: 0 auto 20px; font-size: 28px; font-weight: 900; color: white;\n            font-family: monospace; box-shadow: none;\n            animation: welcomeLogoPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.4s both;\n        }\n        @keyframes welcomeLogoPop { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }\n        .welcome-title {\n            font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.5px;\n            margin-bottom: 8px;\n            animation: welcomeFadeUp 0.5s ease 0.55s both;\n        }\n        .welcome-sub {\n            font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 28px;\n            animation: welcomeFadeUp 0.5s ease 0.65s both;\n        }\n        @keyframes welcomeFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }\n        .welcome-features {\n            display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px;\n            animation: welcomeFadeUp 0.5s ease 0.75s both;\n        }\n        .welcome-feature {\n            display: flex; align-items: center; gap: 10px;\n            background: rgba(255,255,255,0.06); border-radius: 12px; padding: 10px 14px;\n            border: 1px solid rgba(255,255,255,0.08); text-align: left;\n        }\n        .welcome-feature .material-icons-round { color: #10b981; font-size: 18px; flex-shrink:0; }\n        .welcome-feature span:last-child { font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 600; }\n        .welcome-start-btn {\n            width: 100%; padding: 15px; border: none; border-radius: 16px;\n            background: linear-gradient(135deg, #10b981, #059669);\n            color: white; font-size: 15px; font-weight: 700; font-family: 'Poppins', sans-serif;\n            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;\n            box-shadow: none;\n            transition: transform 0.2s, box-shadow 0.2s;\n            animation: welcomeFadeUp 0.5s ease 0.85s both;\n        }\n        .welcome-start-btn:active { transform: scale(0.97); box-shadow: none; }\n        .welcome-start-btn .material-icons-round { font-size: 20px; }\n\n        \n/* ===== REPO LOAD PROGRESS BAR ===== */\n        #repo-progress-overlay {\n            position: fixed; inset: 0; z-index: 600; background: rgba(0,0,0,0.7);\n            display: none; flex-direction: column;\n            align-items: center; justify-content: center; gap: 20px;\n        }\n        #repo-progress-overlay.visible { display: flex; }\n        .repo-progress-card {\n            background: var(--glass-bg); border: 1px solid var(--glass-border);\n            border-radius: 20px; padding: 28px 24px; width: 85%; max-width: 320px;\n            box-shadow: none;\n            animation: welcomeCardIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;\n        }\n        .repo-progress-title { font-size: 14px; font-weight: 700; color: var(--text-color); margin-bottom: 6px; }\n        .repo-progress-sub { font-size: 11px; color: var(--text-color); opacity: 0.5; margin-bottom: 18px; }\n        .repo-progress-bar-track {\n            height: 6px; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; margin-bottom: 10px;\n        }\n        .repo-progress-bar-fill {\n            height: 100%; background: linear-gradient(90deg, #10b981, #34d399);\n            border-radius: 10px; width: 0%; transition: width 0.3s ease;\n            box-shadow: none;\n        }\n        .repo-progress-count { font-size: 11px; color: var(--accent); font-weight: 600; text-align:right; }\n\n        \n/* ===== NEW PROJECT MODAL ===== */\n        #new-project-overlay {\n            position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 300; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;\n            display: flex; align-items: center; justify-content: center;\n        }\n        #new-project-overlay.active { opacity: 1; pointer-events: auto; }\n        #new-project-modal {\n            background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 20px;\n            padding: 22px 20px; width: 88%; max-width: 400px;\n            box-shadow: 0 4px 20px rgba(0,0,0,0.10);\n            transform: scale(0.9) translateY(10px); transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);\n            font-family: 'Poppins', sans-serif; max-height: 90vh; overflow-y: auto;\n        }\n        #new-project-overlay.active #new-project-modal { transform: scale(1) translateY(0); }\n        #new-project-modal input, #new-project-modal select, #new-project-modal textarea {\n            width: 100%; padding: 11px 12px; border-radius: 10px; background: rgba(0,0,0,0.25);\n            border: 1px solid var(--glass-border); color: var(--text-color);\n            font-family: 'Poppins', sans-serif; font-size: 13px; margin-bottom: 10px;\n            transition: border-color 0.15s;\n        }\n        #new-project-modal input:focus, #new-project-modal select:focus, #new-project-modal textarea:focus {\n            border-color: var(--accent); outline: none; box-shadow: 0 0 0 2px var(--accent-dim);\n        }\n        .np-section-label { font-size: 10px; font-weight: 700; color: var(--accent); text-transform: uppercase;\n            letter-spacing: 0.8px; margin-bottom: 8px; margin-top: 14px; opacity: 0.9; }\n        .np-save-options { display: flex; gap: 8px; margin-bottom: 10px; }\n        .np-save-opt {\n            flex: 1; padding: 12px 8px; border: 1.5px solid var(--glass-border); border-radius: 12px;\n            background: rgba(0,0,0,0.15); cursor: pointer; text-align: center; transition: all 0.2s;\n            font-family: 'Poppins', sans-serif;\n        }\n        .np-save-opt.selected { border-color: var(--accent); background: var(--accent-dim); }\n        .np-save-opt .material-icons-round { font-size: 22px; color: var(--accent); display: block; margin-bottom: 4px; }\n        .np-save-opt span:last-child { font-size: 10px; font-weight: 600; color: var(--text-color); }\n        .np-tab-bar { display: flex; background: rgba(0,0,0,0.2); border-radius: 10px; padding: 3px; margin-bottom: 14px; }\n        .np-tab { flex: 1; padding: 7px; text-align: center; font-size: 11px; font-weight: 600;\n            border-radius: 8px; cursor: pointer; color: var(--text-color); opacity: 0.5; transition: all 0.2s; }\n        .np-tab.active { background: var(--accent); color: white; opacity: 1; }\n        .np-pane { display: none; }\n        .np-pane.active { display: block; }\n        .np-repo-visibility { display: flex; gap: 8px; margin-bottom: 10px; }\n        .np-vis-opt {\n            flex: 1; padding: 10px 8px; border: 1.5px solid var(--glass-border); border-radius: 10px;\n            background: rgba(0,0,0,0.15); cursor: pointer; text-align: center;\n            font-family: 'Poppins', sans-serif; transition: all 0.2s;\n        }\n        .np-vis-opt.selected { border-color: var(--accent); background: var(--accent-dim); }\n        .np-vis-opt .material-icons-round { font-size: 18px; color: var(--accent); display: block; margin-bottom: 3px; }\n        .np-vis-opt span:last-child { font-size: 10px; font-weight: 600; color: var(--text-color); }\n\n        \n        /* ──────────────────────── Custom Dialog ──────────────────────── */\n#custom-dialog-overlay {\n            position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 500; opacity: 0; pointer-events: none; transition: opacity 0.25s ease;\n            display: flex; align-items: center; justify-content: center;\n        }\n        #custom-dialog-overlay.active { opacity: 1; pointer-events: auto; }\n        #custom-dialog-box {\n            background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 18px;\n            padding: 22px 20px 16px; width: 82%; max-width: 340px; box-shadow: 0 4px 20px rgba(0,0,0,0.10);\n            transform: scale(0.9) translateY(10px); transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);\n            font-family: 'Poppins', sans-serif;\n        }\n        #custom-dialog-overlay.active #custom-dialog-box { transform: scale(1) translateY(0); }\n        #custom-dialog-icon { font-size: 28px; margin-bottom: 10px; }\n        #custom-dialog-title { font-size: 15px; font-weight: 600; color: var(--text-color); margin-bottom: 6px; }\n        #custom-dialog-msg { font-size: 12px; color: var(--text-color); opacity: 0.65; margin-bottom: 14px; line-height: 1.5; }\n        #custom-dialog-input { width: 100%; padding: 10px 12px; border-radius: 10px; background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border); color: var(--text-color); font-family: 'Poppins', sans-serif; font-size: 13px; margin-bottom: 12px; user-select: text; -webkit-user-select: text; }\n        #custom-dialog-input:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 2px var(--accent-dim); }\n        #custom-dialog-btns { display: flex; gap: 8px; }\n        .cdlg-btn { flex: 1; padding: 11px; border: none; border-radius: 10px; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: transform 0.15s, opacity 0.15s; }\n        .cdlg-btn:active { transform: scale(0.96); opacity: 0.85; }\n        .cdlg-btn.primary { background: var(--accent); color: #fff; }\n        .cdlg-btn.danger { background: #ef4444; color: #fff; }\n        .cdlg-btn.secondary { background: rgba(128,128,128,0.18); color: var(--text-color); }\n\n        \n/* ===== CUSTOM GITHUB DROPDOWNS ===== */\n        .gh-custom-select { position: relative; margin-bottom: 10px; }\n        .gh-custom-trigger {\n            width: 100%; padding: 11px 36px 11px 12px; border-radius: 10px;\n            background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border);\n            color: var(--text-color); font-family: 'Poppins', sans-serif; font-size: 13px;\n            cursor: pointer; display: flex; align-items: center; justify-content: space-between;\n             user-select: none;\n        }\n        .gh-custom-trigger.open { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }\n        .gh-custom-trigger .gh-trigger-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: 0.7; }\n        .gh-custom-trigger .gh-trigger-text.selected { opacity: 1; color: var(--text-color); }\n        .gh-custom-trigger .material-icons-round { font-size: 18px; color: var(--accent); transition: transform 0.2s; flex-shrink: 0; }\n        .gh-custom-trigger.open .material-icons-round { transform: rotate(180deg); }\n        .gh-custom-list {\n            position: absolute; left: 0; right: 0; top: calc(100% + 4px);\n            background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px;\n            box-shadow: none; z-index: 200; max-height: 200px; overflow-y: auto;\n            opacity: 0; transform: translateY(-6px) scale(0.97); pointer-events: none;\n            transition: opacity 0.2s ease, transform 0.2s ease;\n        }\n        .gh-custom-list::-webkit-scrollbar { display: none; }\n        .gh-custom-list.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }\n        .gh-custom-option {\n            padding: 11px 14px; font-family: 'Poppins', sans-serif; font-size: 12px;\n            color: var(--text-color); cursor: pointer; \n            display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--glass-border);\n        }\n        .gh-custom-option:last-child { border-bottom: none; }\n        .gh-custom-option:active, .gh-custom-option.selected { background: var(--accent-dim); color: var(--accent); }\n        .gh-custom-option .material-icons-round { font-size: 15px; opacity: 0.6; }\n\n        \n/* ===== AGENT MODAL ===== */\n        #agent-overlay {\n            position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;\n        }\n        #agent-overlay.active { opacity: 1; pointer-events: auto; }\n        #agent-modal {\n            position: fixed; top: 50%; left: 50%;\n            transform: translate(-50%, -50%) scale(0.88);\n            width: 88%; max-width: 380px;\n            background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 24px; padding: 0;\n            z-index: 210; box-shadow: 0 8px 32px rgba(0,0,0,0.18);\n            opacity: 0; pointer-events: none;\n            transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.34,1.2,0.64,1);\n            font-family: 'Poppins', sans-serif;\n            overflow: hidden;\n        }\n        #agent-modal.active { opacity: 1; pointer-events: auto; transform: translate(-50%, -50%) scale(1); }\n\n        /* Modal header strip */\n        #agent-modal-header {\n            display: flex; align-items: center; gap: 10px;\n            padding: 16px 18px 14px;\n            border-bottom: 1px solid var(--glass-border);\n        }\n        #agent-modal-avatar {\n            width: 36px; height: 36px; border-radius: 12px;\n            background: linear-gradient(135deg, #10b981, #059669);\n            display: flex; align-items: center; justify-content: center; flex-shrink: 0;\n        }\n        #agent-modal-avatar .material-icons-round { font-size: 18px; color: white; }\n\n        /* Scrollable body */\n        #agent-modal-body { padding: 16px 18px; overflow-y: auto; max-height: 72vh; }\n        #agent-modal-body::-webkit-scrollbar { display: none; }\n\n        /* Connected agent pill */\n        .am-agent-row {\n            display: flex; align-items: center; gap: 10px;\n            padding: 10px 12px; border-radius: 12px;\n            border: 1.5px solid var(--glass-border);\n            background: transparent; cursor: pointer;\n            transition: border-color 0.18s, background 0.18s, transform 0.12s;\n            margin-bottom: 6px;\n        }\n        .am-agent-row.active { border-color: var(--accent); background: var(--accent-dim); }\n        .am-agent-row:active { transform: scale(0.98); }\n        .am-agent-dot { width: 8px; height: 8px; border-radius: 50%; background: #6b7280; flex-shrink: 0; transition: background 0.3s; }\n        .am-agent-row.active .am-agent-dot { background: #10b981; }\n        .am-agent-name { flex: 1; font-size: 12px; font-weight: 700; color: var(--text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n        .am-agent-del { background: none; border: none; cursor: pointer; padding: 4px; opacity: 0.3; color: var(--text-color); border-radius: 6px; transition: opacity 0.15s, color 0.15s; display: flex; align-items: center; }\n        .am-agent-del:active { opacity: 1; color: #ef4444; }\n        .am-agent-del .material-icons-round { font-size: 15px; pointer-events: none; }\n\n        /* Key input */\n        #agent-api-key {\n            width: 100%; padding: 11px 13px; border-radius: 12px;\n            background: rgba(0,0,0,0.18); border: 1.5px solid var(--glass-border);\n            color: var(--text-color); font-family: 'Poppins', sans-serif;\n            font-size: 12px; margin-bottom: 8px;\n            user-select: text; -webkit-user-select: text;\n            transition: border-color 0.18s, box-shadow 0.18s; outline: none;\n        }\n        #agent-api-key:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }\n\n        /* Provider quick-links */\n        .am-provider-row {\n            display: flex; align-items: center; gap: 10px;\n            padding: 9px 12px; border-radius: 10px;\n            border: 1px solid var(--glass-border);\n            background: rgba(0,0,0,0.1); cursor: pointer;\n            text-decoration: none; transition: background 0.15s, border-color 0.15s;\n            margin-bottom: 5px;\n        }\n        .am-provider-row:active { background: var(--accent-dim); border-color: var(--accent); }\n        .am-provider-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }\n        .am-provider-name { font-size: 12px; font-weight: 700; color: var(--text-color); }\n        .am-provider-tag { font-size: 9px; font-weight: 600; padding: 1px 6px; border-radius: 5px; margin-left: 5px; }\n\n        .agent-provider-grid { display: none; }\n        .agent-provider-btn { display: none; }\n\n        /* Animated provider selection list */\n        #agent-model-list {\n            max-height: 0;\n            overflow: hidden;\n            transition: max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease;\n            opacity: 0;\n        }\n        #agent-model-list.open {\n            max-height: 280px;\n            opacity: 1;\n        }\n        #agent-model-list-inner {\n            max-height: 260px;\n            overflow-y: auto;\n            -webkit-overflow-scrolling: touch;\n            display: flex;\n            flex-direction: column;\n            gap: 3px;\n            padding: 4px 0 6px;\n        }\n        #agent-model-list-inner::-webkit-scrollbar { display: none; }\n        .am-model-row {\n            display: flex; align-items: center; gap: 9px;\n            padding: 8px 10px;\n            border-radius: 10px;\n            border: 1.5px solid var(--glass-border);\n            background: transparent;\n            cursor: pointer;\n            transition: border-color 0.15s, background 0.15s, transform 0.12s;\n            animation: amRowIn 0.2s ease both;\n        }\n        @keyframes amRowIn {\n            from { opacity:0; transform:translateY(6px); }\n            to   { opacity:1; transform:translateY(0); }\n        }\n        .am-model-row:active { transform: scale(0.97); }\n        .am-model-row:hover, .am-model-row.selected { border-color: var(--accent); background: var(--accent-dim); }\n        .am-model-dot { width:15px; height:15px; border-radius:4px; border:1.5px solid var(--glass-border); background:transparent; flex-shrink:0; transition:background 0.15s,border-color 0.15s; display:flex; align-items:center; justify-content:center; }\n        .am-model-row.selected .am-model-dot { background:var(--accent); border-color:var(--accent); }\n        .am-model-dot::after { content:''; display:none; width:4px; height:7px; border:2px solid white; border-top:none; border-left:none; transform:rotate(45deg) translate(0px,-1px); }\n        .am-model-row.selected .am-model-dot::after { display:block; }\n        .am-model-name { flex:1; font-size:11px; font-weight:700; color:var(--text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-family:'Poppins',sans-serif; }\n        .am-model-tag { font-size:8px; font-weight:700; padding:2px 6px; border-radius:5px; flex-shrink:0; font-family:'Poppins',sans-serif; }\n\n        \n/* ===== AGENT BAR — compact strip inside nav panel ===== */\n        #agent-bar {\n            display: none; flex-direction: column; gap: 0;\n            border-bottom: 1px solid var(--glass-border);\n            background: var(--glass-bg);\n        }\n        #agent-bar.visible { display: flex; }\n        #agent-compact-row {\n            display: flex; align-items: center; gap: 6px;\n            padding: 6px 10px;\n        }\n        .agent-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #6b7280; flex-shrink: 0; transition: background 0.3s; }\n        #agent-prompt {\n            flex: 1; padding: 7px 10px; border-radius: 10px;\n            background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border);\n            color: var(--text-color); font-family: 'Poppins', sans-serif; font-size: 12px;\n            resize: none; height: 34px; max-height: 90px; overflow-y: auto; line-height: 1.4;\n            user-select: text; -webkit-user-select: text;\n            transition: border-color 0.2s;\n        }\n        #agent-prompt:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 2px var(--accent-dim); }\n        #agent-attach-btn, #agent-send-btn {\n            width: 34px; height: 34px; border-radius: 10px; border: none; flex-shrink: 0;\n            display: flex; align-items: center; justify-content: center; cursor: pointer;\n            transition: transform 0.15s, opacity 0.15s;\n        }\n        #agent-attach-btn:active, #agent-send-btn:active { transform: scale(0.9); }\n        #agent-attach-btn { background: rgba(128,128,128,0.12); color: var(--text-color); }\n        #agent-send-btn { background: var(--accent); color: white; }\n        #agent-send-btn .material-icons-round, #agent-attach-btn .material-icons-round { font-size: 16px; pointer-events: none; }\n        #agent-bar-label { font-size: 10px; font-weight: 700; color: var(--accent); white-space: nowrap; max-width: 70px; overflow: hidden; text-overflow: ellipsis; }\n        #agent-close-btn { font-size: 16px; opacity: 0.4; cursor: pointer; pointer-events: auto; flex-shrink: 0; }\n        #agent-thinking {\n            display: none; align-items: center; gap: 6px; font-size: 10px; color: var(--accent); font-weight: 600;\n            padding: 0 10px 5px;\n        }\n        #agent-thinking.visible { display: flex; }\n        .agent-dots span { display: inline-block; width: 4px; height: 4px; border-radius: 50%; background: var(--accent); margin-right: 2px; animation: agentBounce 0.8s infinite; }\n        .agent-dots span:nth-child(2) { animation-delay: 0.2s; }\n        .agent-dots span:nth-child(3) { animation-delay: 0.4s; }\n        @keyframes agentBounce { 0%,80%,100%{ transform:translateY(0); opacity:0.6; } 40%{ transform:translateY(-4px); opacity:1; } } @keyframes activityFadeIn { from { opacity:0; transform:translateY(3px); } to { opacity:0.7; transform:translateY(0); } }\n        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }\n        @keyframes commitSpin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }\n        #agent-file-selector { padding: 0 10px 5px; }\n        #agent-file-select {\n            width:100%; padding:5px 8px; border-radius:7px;\n            background:rgba(0,0,0,0.25); border:1px solid var(--glass-border);\n            color:var(--text-color); font-family:Poppins,sans-serif; font-size:10px;\n            font-weight:600; appearance:none; -webkit-appearance:none; cursor:pointer;\n        }\n    \n";
document.head.appendChild(_s);
})();

(function(){
const _d=document.createElement("div");
_d.innerHTML='<div id="gh-overlay" onclick="closeGithubModal()"></div>\n\n<div class="no-select" id="github-modal">\n    <!-- Header -->\n    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">\n        <div style="display:flex;align-items:center;gap:9px;">\n            <div style="width:34px;height:34px;border-radius:10px;background:var(--accent-dim);border:1px solid rgba(16,185,129,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;">\n                <span class="material-icons-round" style="color:var(--accent);font-size:18px;">cloud_sync</span>\n            </div>\n            <div>\n                <div style="font-weight:700;font-size:14px;color:var(--text-color);font-family:\'Poppins\',sans-serif;">GitSync</div>\n                <div id="gh-header-status" style="font-size:10px;color:var(--accent);font-weight:600;font-family:\'Poppins\',sans-serif;">Not connected</div>\n            </div>\n        </div>\n        <button onclick="closeGithubModal()" style="background:rgba(128,128,128,0.1);border:none;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-color);opacity:0.6;transition:opacity 0.15s;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0.6">\n            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>\n        </button>\n    </div>\n\n    <!-- LOGIN SECTION -->\n    <div id="gh-login-section">\n        <div style="background:var(--accent-dim);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:12px;margin-bottom:12px;font-size:11px;line-height:1.7;color:var(--text-color);font-family:\'Poppins\',sans-serif;">\n            <div style="font-weight:700;color:var(--accent);margin-bottom:3px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> GitHub Personal Access Token</div>\n            <div style="opacity:0.7;">Generate at github.com → Settings → Developer settings → Personal access tokens</div>\n        </div>\n        <input type="text" id="gh-token" placeholder="Personal access token" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" inputmode="text" style="user-select:text;-webkit-user-select:text;margin-bottom:10px;">\n        <button class="modal-btn" onclick="saveGhToken()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;">\n            <span class="material-icons-round" style="font-size:16px;pointer-events:none;">login</span>Connect GitHub\n        </button>\n    </div>\n\n    <!-- CONNECTED SECTION -->\n    <div id="gh-repo-section" style="display:none;" class="gh-section-anim">\n\n        <!-- Connected status bar -->\n        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:8px 12px;margin-bottom:12px;">\n            <div style="display:flex;align-items:center;gap:7px;">\n                <div style="width:7px;height:7px;border-radius:50%;background:#10b981;flex-shrink:0;"></div>\n                <span style="font-size:11px;font-weight:700;color:var(--accent);font-family:\'Poppins\',sans-serif;">Connected</span>\n            </div>\n            <button onclick="ghLogout()" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:10px;font-weight:600;color:var(--text-color);opacity:0.45;font-family:\'Poppins\',sans-serif;padding:0;transition:opacity 0.15s;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0.45">\n                <span class="material-icons-round" style="font-size:13px;">logout</span>Logout\n            </button>\n        </div>\n\n        <!-- Repo selector row -->\n        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">\n            <div style="font-size:9px;font-weight:700;color:var(--text-color);opacity:0.4;text-transform:uppercase;letter-spacing:0.6px;font-family:\'Poppins\',sans-serif;">Repository</div>\n            <div style="display:flex;align-items:center;gap:2px;">\n                <button onclick="_ghDownloadRepo()" title="Download repository as ZIP" style="background:none;border:none;cursor:pointer;padding:3px;opacity:0.45;color:var(--text-color);display:flex;align-items:center;transition:opacity 0.15s;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0.45">\n                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>\n                </button>\n                <button onclick="_ghRenameRepo()" title="Rename repository" style="background:none;border:none;cursor:pointer;padding:3px;opacity:0.45;color:var(--text-color);display:flex;align-items:center;transition:opacity 0.15s;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0.45">\n                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>\n                </button>\n            </div>\n        </div>\n        <div style="display:flex;gap:7px;margin-bottom:10px;">\n            <div class="gh-select-wrap" style="flex:1;margin-bottom:0;">\n                <select id="gh-repo-select" onchange="fetchGhFiles()">\n                    <option value="">Select Repository...</option>\n                </select>\n            </div>\n            <button onclick="_ghForceRefresh()" title="Refresh — fetch latest from GitHub" style="width:38px;height:38px;border-radius:10px;border:1px solid var(--glass-border);background:rgba(128,128,128,0.08);color:var(--text-color);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background 0.15s;" onmouseenter="this.style.background=\'var(--accent-dim)\'" onmouseleave="this.style.background=\'rgba(128,128,128,0.08)\'">\n                <span class="material-icons-round" style="font-size:17px;pointer-events:none;">refresh</span>\n            </button>\n        </div>\n\n        <!-- Breadcrumb path -->\n        <div class="gh-breadcrumb" id="gh-breadcrumb" style="display:none;"></div>\n\n        <!-- File tree -->\n        <div id="gh-file-tree" style="display:none;">\n            <div class="gh-tree-loading">Loading files...</div>\n        </div>\n\n        <!-- Divider -->\n        <div style="height:1px;background:var(--glass-border);margin:12px 0;"></div>\n\n        <!-- CREATE section -->\n        <div style="font-size:9px;font-weight:700;color:var(--text-color);opacity:0.4;text-transform:uppercase;letter-spacing:0.7px;font-family:\'Poppins\',sans-serif;margin-bottom:7px;">Create &amp; Upload</div>\n        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px;" id="gh-create-bar">\n            <button onclick="createGhFile()" id="gh-new-file-btn" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:9px 4px;border-radius:10px;border:1px solid rgba(16,185,129,0.25);background:var(--accent-dim);color:var(--accent);font-family:\'Poppins\',sans-serif;font-size:9px;font-weight:600;cursor:pointer;transition:opacity 0.15s,transform 0.15s;" ontouchstart="this.style.opacity=\'0.75\';this.style.transform=\'scale(0.95)\'" ontouchend="this.style.opacity=\'1\';this.style.transform=\'scale(1)\'">\n                <span class="material-icons-round" style="font-size:17px;pointer-events:none;">add_circle</span>New File\n            </button>\n            <button onclick="createGhFolder()" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:9px 4px;border-radius:10px;border:1px solid rgba(16,185,129,0.25);background:var(--accent-dim);color:var(--accent);font-family:\'Poppins\',sans-serif;font-size:9px;font-weight:600;cursor:pointer;transition:opacity 0.15s,transform 0.15s;" ontouchstart="this.style.opacity=\'0.75\';this.style.transform=\'scale(0.95)\'" ontouchend="this.style.opacity=\'1\';this.style.transform=\'scale(1)\'">\n                <span class="material-icons-round" style="font-size:17px;pointer-events:none;">create_new_folder</span>New Folder\n            </button>\n            <button onclick="uploadGhFile()" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:9px 4px;border-radius:10px;border:1px solid rgba(16,185,129,0.25);background:var(--accent-dim);color:var(--accent);font-family:\'Poppins\',sans-serif;font-size:9px;font-weight:600;cursor:pointer;transition:opacity 0.15s,transform 0.15s;" ontouchstart="this.style.opacity=\'0.75\';this.style.transform=\'scale(0.95)\'" ontouchend="this.style.opacity=\'1\';this.style.transform=\'scale(1)\'">\n                <span class="material-icons-round" style="font-size:17px;pointer-events:none;">upload_file</span>Upload\n            </button>\n        </div>\n\n        <!-- OPEN section -->\n        <div style="font-size:9px;font-weight:700;color:var(--text-color);opacity:0.4;text-transform:uppercase;letter-spacing:0.7px;font-family:\'Poppins\',sans-serif;margin-bottom:7px;">Open</div>\n        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">\n            <button id="gh-load-btn" onclick="loadGhFile()" disabled style="display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:10px;border:none;background:var(--accent);color:white;font-family:\'Poppins\',sans-serif;font-size:11px;font-weight:600;cursor:pointer;transition:opacity 0.15s,transform 0.15s;opacity:0.35;" ontouchstart="if(!this.disabled){this.style.opacity=\'0.75\';this.style.transform=\'scale(0.95)\'}" ontouchend="if(!this.disabled){this.style.opacity=\'1\';this.style.transform=\'scale(1)\'}">\n                <span class="material-icons-round" style="font-size:15px;pointer-events:none;">file_open</span>Load File\n            </button>\n            <button id="gh-load-repo-btn" onclick="loadGhRepo()" disabled style="display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:10px;border:none;background:var(--accent);color:white;font-family:\'Poppins\',sans-serif;font-size:11px;font-weight:600;cursor:pointer;transition:opacity 0.15s,transform 0.15s;opacity:0.35;" ontouchstart="if(!this.disabled){this.style.opacity=\'0.75\';this.style.transform=\'scale(0.95)\'}" ontouchend="if(!this.disabled){this.style.opacity=\'1\';this.style.transform=\'scale(1)\'}">\n                <span class="material-icons-round" style="font-size:15px;pointer-events:none;">folder_zip</span>Load All\n            </button>\n        </div>\n\n        <!-- SYNC section -->\n        <div style="font-size:9px;font-weight:700;color:var(--text-color);opacity:0.4;text-transform:uppercase;letter-spacing:0.7px;font-family:\'Poppins\',sans-serif;margin-bottom:7px;">Sync</div>\n        <div style="display:flex;gap:6px;">\n            <button class="modal-btn" id="gh-commit-btn" onclick="commitGhFile()" disabled style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;padding:11px;background:linear-gradient(135deg,#10b981,#059669);">\n                <span class="material-icons-round" style="font-size:16px;pointer-events:none;">upload</span>Commit\n            </button>\n            <button class="modal-btn" id="gh-undo-btn" onclick="undoLastCommit()" disabled style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;padding:11px;background:linear-gradient(135deg,#10b981,#059669);">\n                <span class="material-icons-round" style="font-size:16px;pointer-events:none;">history</span>Undo\n            </button>\n        </div>\n        <!-- Commit history dropdown (shown when Undo clicked) -->\n        <div id="gh-commit-history" style="display:none;margin-top:8px;border-radius:12px;border:1px solid var(--glass-border);overflow:hidden;background:var(--glass-bg);max-height:180px;overflow-y:auto;"></div>\n    </div>\n</div>\n\n<input type="file" id="gh-upload-input" style="display:none;" multiple>\n<input type="file" id="agent-file-input" style="display:none;">\n<input type="file" id="inline-chat-file-input" style="display:none;">';
document.body.appendChild(_d);
})();

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