(function(){
var s=document.createElement("style");
s.textContent=`        /* Full-screen chat overlay */
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
`;
document.head.appendChild(s);
})();

(function(){
var d=document.createElement("div");
d.innerHTML=`<!-- New Project Modal -->
<div id="new-project-overlay" onclick="if(event.target===this)closeNewProjectModal()">
    <div id="new-project-modal" class="no-select">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:8px;">
                <span class="material-icons-round" style="color:var(--accent);font-size:20px;">add_circle</span>
                <span style="font-weight:700;font-size:15px;color:var(--text-color);">New Project</span>
            </div>
            <span class="material-icons-round" onclick="closeNewProjectModal()" style="opacity:0.5;cursor:pointer;font-size:20px;pointer-events:auto;">close</span>
        </div>
        <div class="np-tab-bar">
            <div class="np-tab active" id="np-tab-blank" onclick="npSwitchTab('blank')">Blank File</div>
            <div class="np-tab" id="np-tab-repo" onclick="npSwitchTab('repo')">New GitHub Repo</div>
        </div>
        <!-- Blank File Pane -->
        <div class="np-pane active" id="np-pane-blank">
            <div class="np-section-label">File Name</div>
            <input type="text" id="np-filename" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Filename" value="index.html">
            <div class="np-section-label">Save To</div>
            <div class="np-save-options">
                <div class="np-save-opt selected" id="np-save-local" onclick="npSelectSave('local')">
                    <span class="material-icons-round">phone_android</span>
                    <span>Local Device</span>
                </div>
                <div class="np-save-opt" id="np-save-github" onclick="npSelectSave('github')">
                    <span class="material-icons-round">cloud_upload</span>
                    <span>GitHub Repo</span>
                </div>
            </div>
            <div id="np-github-repo-wrap" style="display:none;">
                <div class="np-section-label">Select Repo</div>
                <div class="gh-select-wrap" id="np-repo-select-wrap">
                    <select id="np-gh-repo-select"><option value="">Select Repository...</option></select>
                </div>
            </div>
            <div style="display:flex;gap:8px;margin-top:14px;">
                <button class="modal-btn secondary" onclick="closeNewProjectModal()" style="flex:1;">Cancel</button>
                <button class="modal-btn" onclick="createNewProject()" style="flex:2;display:flex;align-items:center;justify-content:center;gap:6px;">
                    <span class="material-icons-round" style="font-size:16px;pointer-events:none;">rocket_launch</span> Create & Open
                </button>
            </div>
        </div>
        <!-- New GitHub Repo Pane -->
        <div class="np-pane" id="np-pane-repo">
            <div id="np-repo-login-warn" style="display:none;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:11px;color:#ef4444;font-weight:600;">
                &#9888; Please connect GitHub first via GitSync &#8594; Login
            </div>
            <div class="np-section-label">Repository Name</div>
            <input type="text" id="np-repo-name" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Repository name">
            <div class="np-section-label">Description (optional)</div>
            <input type="text" id="np-repo-desc" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Description">
            <div class="np-section-label">Visibility</div>
            <div class="np-repo-visibility">
                <div class="np-vis-opt selected" id="np-vis-public" onclick="npSelectVis('public')">
                    <span class="material-icons-round">public</span>
                    <span>Public</span>
                </div>
                <div class="np-vis-opt" id="np-vis-private" onclick="npSelectVis('private')">
                    <span class="material-icons-round">lock</span>
                    <span>Private</span>
                </div>
            </div>
            <div class="np-section-label">Options</div>
            <label style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:8px;cursor:pointer;user-select:none;">
                <input type="checkbox" id="np-repo-readme" checked style="accent-color:var(--accent);width:14px;height:14px;"> Add README.md
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:8px;cursor:pointer;user-select:none;">
                <input type="checkbox" id="np-repo-gitignore" style="accent-color:var(--accent);width:14px;height:14px;"> Add .gitignore (Node)
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:8px;cursor:pointer;user-select:none;">
                <input type="checkbox" id="np-repo-license" style="accent-color:var(--accent);width:14px;height:14px;"> Add MIT License
            </label>
            <label id="np-deploy-wrap" style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:14px;cursor:pointer;user-select:none;background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:9px 11px;">
                <input type="checkbox" id="np-repo-deploy" style="accent-color:var(--accent);width:14px;height:14px;">
                <span style="display:flex;align-items:center;gap:6px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    <span style="color:var(--accent);font-weight:700;">Deploy to GitHub Pages</span>
                    <span style="opacity:0.5;font-size:10px;">(free hosting)</span>
                </span>
            </label>
            <div style="display:flex;gap:8px;">
                <button class="modal-btn secondary" onclick="closeNewProjectModal()" style="flex:1;">Cancel</button>
                <button class="modal-btn" onclick="createGithubRepo()" style="flex:2;display:flex;align-items:center;justify-content:center;gap:6px;">
                    <span class="material-icons-round" style="font-size:16px;pointer-events:none;">cloud</span> Create Repo
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Custom Dialog (replaces all browser confirm/alert/prompt) -->
<div id="custom-dialog-overlay">
    <div id="custom-dialog-box">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <div id="custom-dialog-icon" style="flex-shrink:0;"></div>
            <div id="custom-dialog-title" style="flex:1;"></div>
            <button onclick="_hideDialog()" style="background:none;border:none;cursor:pointer;color:var(--text-color);opacity:0.4;padding:2px;display:flex;align-items:center;flex-shrink:0;transition:opacity 0.15s;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0.4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="pointer-events:none;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div id="custom-dialog-msg"></div>
        <input type="text" id="custom-dialog-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" style="display:none;">
        <div id="custom-dialog-btns"></div>
    </div>
</div>

<!-- Agent Setup Modal -->
<div id="agent-overlay" onclick="closeAgentModal()"></div>
<div id="agent-modal" class="no-select">

    <!-- Header -->
    <div id="agent-modal-header">
        <div id="agent-modal-avatar">
            <span class="material-icons-round">smart_toy</span>
        </div>
        <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:14px;color:var(--text-color);line-height:1.2;">AI Agents</div>
            <div id="agent-modal-sub" style="font-size:10px;color:var(--accent);font-weight:600;margin-top:1px;">No agent connected</div>
        </div>
        <button onclick="closeAgentModal()" style="background:rgba(128,128,128,0.1);border:none;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-color);opacity:0.5;transition:opacity 0.15s;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    </div>

    <div id="agent-modal-body">

        <!-- Connected agents list — scrollable, compact -->
        <div id="agent-connected-section" style="display:none;margin-bottom:12px;">
            <div style="font-size:9px;font-weight:700;color:var(--text-color);opacity:0.35;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">Connected</div>
            <div id="agent-list-container" style="max-height:160px;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;gap:3px;"></div>
            <div style="display:flex;gap:7px;margin-top:8px;">
                <button onclick="closeAgentModal();openAgentBar();" style="flex:1.6;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;border-radius:11px;border:none;background:var(--accent);color:white;font-family:'Poppins',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:opacity 0.15s;" ontouchstart="this.style.opacity='0.8'" ontouchend="this.style.opacity='1'">
                    <span class="material-icons-round" style="font-size:15px;pointer-events:none;">chat</span>Open Chat
                </button>
                <button onclick="disconnectAgent()" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:9px;border-radius:11px;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.07);color:#ef4444;font-family:'Poppins',sans-serif;font-size:11px;font-weight:600;cursor:pointer;" ontouchstart="this.style.opacity='0.7'" ontouchend="this.style.opacity='1'">
                    <span class="material-icons-round" style="font-size:14px;pointer-events:none;">delete_sweep</span>Remove All
                </button>
            </div>
            <div style="height:1px;background:var(--glass-border);margin:12px 0 10px;"></div>
        </div>

        <!-- Add agent -->
        <div id="agent-setup-section">
            <div style="font-size:9px;font-weight:700;color:var(--text-color);opacity:0.35;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">Add Agent</div>

            <!-- API Key input -->
            <input type="text" id="agent-api-key" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                placeholder="API Key" oninput="agentKeyPreview(this.value)">

            <!-- Animated scrollable model list -->
            <div id="agent-model-list">
                <div style="font-size:9px;font-weight:700;color:var(--accent);font-family:'Poppins',sans-serif;margin-bottom:4px;padding:0 2px;" id="agent-model-list-label">Select model to connect</div>
                <div id="agent-model-list-inner"></div>
            </div>

            <div id="agent-detect-badge" style="display:none;margin-bottom:8px;">
                <span id="agent-detect-text"></span>
            </div>

            <div style="display:flex;gap:7px;margin-top:8px;">
                <button onclick="connectAgent()" style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:10px;border-radius:11px;border:none;background:var(--accent);color:white;font-family:'Poppins',sans-serif;font-size:13px;font-weight:700;cursor:pointer;" ontouchstart="this.style.opacity='0.8'" ontouchend="this.style.opacity='1'">
                    <span class="material-icons-round" style="font-size:16px;pointer-events:none;">add_circle</span>Connect
                </button>
                <button onclick="openCustomModelDialog()" style="display:flex;align-items:center;justify-content:center;gap:5px;padding:10px 13px;border-radius:11px;border:1.5px solid var(--glass-border);background:rgba(128,128,128,0.08);color:var(--text-color);font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.15s;flex-shrink:0;" ontouchstart="this.style.background='var(--accent-dim)'" ontouchend="this.style.background='rgba(128,128,128,0.08)'">
                    <span class="material-icons-round" style="font-size:15px;pointer-events:none;">tune</span>
                </button>
            </div>
        </div>

    </div>
</div>

<!-- Custom Model Dialog -->
<div id="custom-model-overlay" onclick="if(event.target===this)closeCustomModelDialog()" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:300;display:none;opacity:0;align-items:center;justify-content:center;transition:opacity 0.2s;"></div>
<div id="custom-model-dialog" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.9);z-index:301;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:20px;padding:18px;width:88%;max-width:360px;font-family:'Poppins',sans-serif;opacity:0;pointer-events:none;transition:opacity 0.2s,transform 0.25s cubic-bezier(0.34,1.2,0.64,1);">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
        <div style="width:32px;height:32px;border-radius:10px;background:var(--accent-dim);border:1px solid rgba(16,185,129,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span class="material-icons-round" style="color:var(--accent);font-size:16px;pointer-events:none;">tune</span>
        </div>
        <div style="flex:1;">
            <div style="font-weight:700;font-size:13px;color:var(--text-color);line-height:1.2;">Custom Model</div>
            <div id="cm-detect-label" style="font-size:10px;color:var(--accent);font-weight:600;margin-top:1px;min-height:13px;"></div>
        </div>
        <button onclick="closeCustomModelDialog()" style="background:rgba(128,128,128,0.1);border:none;border-radius:8px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-color);opacity:0.45;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    </div>
    <input id="cm-api-key" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="API Key" oninput="_cmKeyPreview(this.value)" style="width:100%;padding:10px 12px;border-radius:11px;background:rgba(0,0,0,0.18);border:1.5px solid var(--glass-border);color:var(--text-color);font-family:'Courier New',monospace;font-size:13px;margin-bottom:8px;outline:none;user-select:text;-webkit-user-select:text;transition:border-color 0.18s,box-shadow 0.18s;" onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'" onblur="this.style.borderColor='var(--glass-border)';this.style.boxShadow='none'">
    <input id="cm-model" type="text" autocomplete="off" spellcheck="false" placeholder="Model ID" style="width:100%;padding:10px 12px;border-radius:11px;background:rgba(0,0,0,0.18);border:1.5px solid var(--glass-border);color:var(--text-color);font-family:'Courier New',monospace;font-size:13px;margin-bottom:8px;outline:none;user-select:text;-webkit-user-select:text;transition:border-color 0.18s,box-shadow 0.18s;" onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'" onblur="this.style.borderColor='var(--glass-border)';this.style.boxShadow='none'">
    <input id="cm-name" type="text" autocomplete="off" spellcheck="false" placeholder="Name (optional)" style="width:100%;padding:10px 12px;border-radius:11px;background:rgba(0,0,0,0.18);border:1.5px solid var(--glass-border);color:var(--text-color);font-family:'Poppins',sans-serif;font-size:12px;margin-bottom:8px;outline:none;user-select:text;-webkit-user-select:text;transition:border-color 0.18s,box-shadow 0.18s;" onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px var(--accent-dim)'" onblur="this.style.borderColor='var(--glass-border)';this.style.boxShadow='none'">
    <div id="cm-proxy-wrap" style="display:none;margin-bottom:14px;">
        <div style="font-size:9px;font-weight:700;color:#76b900;font-family:'Poppins',sans-serif;margin-bottom:5px;display:flex;align-items:center;gap:5px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#76b900" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>NVIDIA PROXY URL (required)</div>
        <input id="cm-proxy-url" type="text" autocomplete="off" spellcheck="false" placeholder="https://your-proxy.vercel.app/api/nvidia" style="width:100%;padding:10px 12px;border-radius:11px;background:rgba(118,185,0,0.07);border:1.5px solid rgba(118,185,0,0.35);color:var(--text-color);font-family:'Courier New',monospace;font-size:11px;outline:none;user-select:text;-webkit-user-select:text;transition:border-color 0.18s,box-shadow 0.18s;" onfocus="this.style.borderColor='#76b900';this.style.boxShadow='0 0 0 3px rgba(118,185,0,0.15)'" onblur="this.style.borderColor='rgba(118,185,0,0.35)';this.style.boxShadow='none'">
        <div style="font-size:9px;color:var(--text-color);opacity:0.45;margin-top:4px;font-family:'Poppins',sans-serif;">Deploy free proxy from the ZIP — see README inside</div>
    </div>
    <div style="display:flex;gap:7px;">
        <button onclick="closeCustomModelDialog()" style="flex:1;padding:10px;border-radius:11px;border:1px solid var(--glass-border);background:rgba(128,128,128,0.08);color:var(--text-color);font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;cursor:pointer;">Cancel</button>
        <button onclick="connectCustomModel()" style="flex:1.5;padding:10px;border-radius:11px;border:none;background:var(--accent);color:white;font-family:'Poppins',sans-serif;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
            <span class="material-icons-round" style="font-size:15px;pointer-events:none;">add_circle</span>Add
        </button>
    </div>
</div>`;
while(d.firstChild){document.body.appendChild(d.firstChild);}
})();

    // ===== AGENT SYSTEM =====
    // ── MULTI-AGENT SYSTEM ──
    // agentList = array of connected agents, activeAgentIdx = which one is active
    let agentList = [];
    let activeAgentIdx = 0;
    let agentAttachment = null;
    let _agentPendingEdits = [];
    let _agentOriginalCode = '';
    let _agentUndoStack = [];
    const AGENT_UNDO_LIMIT = 20;

    // Backwards compat: load old single agent_config OR new agent_list
    (function() {
        try {
            const list = localStorage.getItem('agent_list');
            if(list) { agentList = JSON.parse(list); }
            else {
                const old = localStorage.getItem('agent_config');
                if(old) { agentList = [JSON.parse(old)]; _saveAgentList(); }
            }
            activeAgentIdx = parseInt(localStorage.getItem('agent_active_idx') || '0') || 0;
            if(activeAgentIdx >= agentList.length) activeAgentIdx = 0;
        } catch(e){}
    })();

    function _saveAgentList() {
        localStorage.setItem('agent_list', JSON.stringify(agentList));
        localStorage.setItem('agent_active_idx', String(activeAgentIdx));
    }

    function _activeAgent() {
        return agentList[activeAgentIdx] || null;
    }

    // Legacy compat shim
    Object.defineProperty(window, 'agentConfig', { get: () => _activeAgent(), set: () => {} });

    document.getElementById('agent-file-input').addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        if (file.size > 20 * 1024 * 1024) { showToast('File too large (max 20MB)', 'error_outline'); e.target.value = ''; return; }
        const isBinary = /\.(png|jpg|jpeg|gif|webp|bmp|ico|svg|pdf|zip|rar|7z|tar|gz|exe|bin|wasm|ttf|otf|woff|woff2|mp3|mp4|wav|ogg|avi|mov|mkv)$/i.test(file.name);
        const r = new FileReader();
        if (isBinary) {
            r.onload = ev => {
                const sizeKB = (file.size / 1024).toFixed(1);
                agentAttachment = { name: file.name, content: `[Binary file: ${file.name}, size: ${sizeKB}KB, type: ${file.type || 'unknown'}]` };
                document.getElementById('agent-attach-btn').style.background = 'var(--accent-dim)';
                document.getElementById('agent-attach-btn').style.color = 'var(--accent)';
            };
            r.readAsArrayBuffer(file);
        } else {
            r.onload = ev => {
                agentAttachment = { name: file.name, content: ev.target.result };
                document.getElementById('agent-attach-btn').style.background = 'var(--accent-dim)';
                document.getElementById('agent-attach-btn').style.color = 'var(--accent)';
            };
            r.readAsText(file);
        }
        e.target.value = '';
    });

    document.getElementById('agent-prompt').addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
    document.getElementById('agent-prompt').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && window.innerWidth >= 768) {
            if (e.shiftKey) { return; } // Shift+Enter = newline, do nothing
            e.preventDefault();
            sendAgentPrompt();
        }
    });

    // ── API KEY AUTO-DETECT ──
    // Returns array of model entries for a given key
    function _detectProviderFromKey(key) {
        key = (key || '').trim();
        const GEM = 'https://generativelanguage.googleapis.com/v1beta/models/';
        const OR  = 'https://openrouter.ai/api/v1/chat/completions';
        const GRQ = 'https://api.groq.com/openai/v1/chat/completions';
        const NIM = window._nvidiaProxyUrl || 'https://codx-ashy.vercel.app/api/nvidia';

        if (/^nvapi-[A-Za-z0-9_-]{20,}/.test(key)) return [
            // NVIDIA FREE MODELS
            { provider:'nvidia', providerName:'Llama 3.1 Nemotron 70B', tag:'FREE', tagColor:'#76b900', url: NIM, model:'nvidia/llama-3.1-nemotron-70b-instruct' },
            { provider:'nvidia', providerName:'Mistral NeMo 12B',        tag:'FREE', tagColor:'#76b900', url: NIM, model:'mistralai/mistral-nemo-12b-instruct'      },
            { provider:'nvidia', providerName:'Kimi K2 Instruct',       tag:'FREE', tagColor:'#76b900', url: NIM, model:'moonshotai/kimi-k2-instruct'               },
            { provider:'nvidia', providerName:'Kimi K2 Thinking',       tag:'THINK',tagColor:'#76b900', url: NIM, model:'moonshotai/kimi-k2-thinking'               },
            { provider:'nvidia', providerName:'GLM-4.7',                tag:'FREE', tagColor:'#76b900', url: NIM, model:'z-ai/glm4.7'                               },
            { provider:'nvidia', providerName:'Llama 4 Maverick',       tag:'FREE', tagColor:'#76b900', url: NIM, model:'meta/llama-4-maverick-17b-128e-instruct'   },
            { provider:'nvidia', providerName:'Llama 3.3 70B',          tag:'FREE', tagColor:'#76b900', url: NIM, model:'meta/llama-3.3-70b-instruct'               },
            { provider:'nvidia', providerName:'Llama Nemotron Super',   tag:'FREE', tagColor:'#76b900', url: NIM, model:'nvidia/llama-3.3-nemotron-super-49b-v1'    },
            { provider:'nvidia', providerName:'Phi-4 Mini',             tag:'FAST', tagColor:'#76b900', url: NIM, model:'microsoft/phi-4-mini-instruct'              },
            { provider:'nvidia', providerName:'Gemma 3 27B',            tag:'FREE', tagColor:'#76b900', url: NIM, model:'google/gemma-3-27b-it'                     },
        ];

        if (/^AIza[A-Za-z0-9_-]{20,}/.test(key)) return [
            { provider:'gemini', providerName:'Gemini 2.5 Flash',      tag:'FREE', tagColor:'#10b981', url: GEM+'gemini-2.5-flash:generateContent',      model:'gemini-2.5-flash'      },
            { provider:'gemini', providerName:'Gemini 2.5 Flash-Lite', tag:'FREE', tagColor:'#10b981', url: GEM+'gemini-2.5-flash-lite:generateContent', model:'gemini-2.5-flash-lite' },
        ];

        if (/^gsk_[A-Za-z0-9]{20,}/.test(key)) return [
            // FREE
            { provider:'groq', providerName:'Llama 3.3 70B',         tag:'FREE', tagColor:'#f59e0b', url: GRQ, model:'llama-3.3-70b-versatile'         },
            { provider:'groq', providerName:'Llama 3.1 70B',         tag:'FREE', tagColor:'#f59e0b', url: GRQ, model:'llama-3.1-70b-versatile'         },
            // FAST
            { provider:'groq', providerName:'Llama 3.1 8B',          tag:'FAST', tagColor:'#f59e0b', url: GRQ, model:'llama-3.1-8b-instant'            },
        ];

        if (/^sk-or-/i.test(key)) return [
            // AUTO
            { provider:'openrouter', providerName:'Auto Free',                   tag:'AUTO', tagColor:'#6b7280', url: OR, model:'openrouter/free'                                },
            // FREE
            { provider:'openrouter', providerName:'Gemma3 27B (Free)',           tag:'FREE', tagColor:'#10b981', url: OR, model:'google/gemma-3-27b-it:free'                    },
            { provider:'openrouter', providerName:'GLM 4.5 Air (Free)',          tag:'FREE', tagColor:'#10b981', url: OR, model:'z-ai/glm-4.5-air:free'                         },
            { provider:'openrouter', providerName:'Nemotron 3 Super 120B',       tag:'FREE', tagColor:'#76b900', url: OR, model:'nvidia/nemotron-3-super-120b-a12b:free'         },
            { provider:'openrouter', providerName:'Nemotron 3 Nano 30B',         tag:'FREE', tagColor:'#76b900', url: OR, model:'nvidia/nemotron-3-nano-30b-a3b:free'            },
            // THINK
            { provider:'openrouter', providerName:'Nemotron Nano 9B V2',         tag:'THINK',tagColor:'#76b900', url: OR, model:'nvidia/nemotron-nano-9b-v2:free'                },
            { provider:'openrouter', providerName:'Liquid LFM Thinking',         tag:'THINK',tagColor:'#8b5cf6', url: OR, model:'liquid/lfm-2.5-1.2b-thinking:free'             },
        ];

        if (/^sk-ant-[A-Za-z0-9]{10,}/.test(key)) return [
            { provider:'anthropic', providerName:'Claude 3.5 Sonnet',  tag:'BEST',  tagColor:'#f59e0b', url:'https://api.anthropic.com/v1/messages', model:'claude-3-5-sonnet-20241022' },
            { provider:'anthropic', providerName:'Claude 3.5 Haiku',   tag:'FAST',  tagColor:'#10b981', url:'https://api.anthropic.com/v1/messages', model:'claude-3-5-haiku-20241022'  },
            { provider:'anthropic', providerName:'Claude 3 Haiku',     tag:'CHEAP', tagColor:'#6b7280', url:'https://api.anthropic.com/v1/messages', model:'claude-3-haiku-20240307'    },
            { provider:'anthropic', providerName:'Claude 3 Opus',      tag:'PRO',   tagColor:'#8b5cf6', url:'https://api.anthropic.com/v1/messages', model:'claude-3-opus-20240229'     },
        ];

        if (/^sk-[a-f0-9]{32}$/.test(key)) return [
            { provider:'deepseek', providerName:'DeepSeek Chat',   tag:'CODE', tagColor:'#3b82f6', url:'https://api.deepseek.com/chat/completions', model:'deepseek-chat'   },
            { provider:'deepseek', providerName:'DeepSeek Coder',  tag:'CODE', tagColor:'#3b82f6', url:'https://api.deepseek.com/chat/completions', model:'deepseek-coder'  },
            { provider:'deepseek', providerName:'DeepSeek Reasoner',tag:'THINK',tagColor:'#8b5cf6', url:'https://api.deepseek.com/chat/completions', model:'deepseek-reasoner' },
        ];

        if (/^sk-[A-Za-z0-9]{20,}/.test(key)) return [
            { provider:'openai', providerName:'GPT-4o',          tag:'BEST', tagColor:'#f59e0b', url:'https://api.openai.com/v1/chat/completions', model:'gpt-4o'           },
            { provider:'openai', providerName:'GPT-4o mini',     tag:'FAST', tagColor:'#10b981', url:'https://api.openai.com/v1/chat/completions', model:'gpt-4o-mini'      },
            { provider:'openai', providerName:'GPT-4 Turbo',     tag:'PRO',  tagColor:'#8b5cf6', url:'https://api.openai.com/v1/chat/completions', model:'gpt-4-turbo'      },
            { provider:'openai', providerName:'o4-mini',         tag:'THINK',tagColor:'#8b5cf6', url:'https://api.openai.com/v1/chat/completions', model:'o4-mini'          },
            { provider:'openai', providerName:'o3-mini',         tag:'THINK',tagColor:'#8b5cf6', url:'https://api.openai.com/v1/chat/completions', model:'o3-mini'          },
        ];

        return null;
    }

    // Selected model indices in the list (multi-select Set)
    let _agentSelectedModelIdxs = new Set();

    function agentKeyPreview(val) {
        val = (val || '').trim();
        const list   = document.getElementById('agent-model-list');
        const inner  = document.getElementById('agent-model-list-inner');
        const label  = document.getElementById('agent-model-list-label');
        if (!list || !inner) return;

        const models = _detectProviderFromKey(val);
        if (!models || (Array.isArray(models) && models.length === 0)) {
            list.classList.remove('open');
            inner.innerHTML = '';
            return;
        }

        const arr = Array.isArray(models) ? models : [models];
        _agentSelectedModelIdxs = new Set(arr.map((_, i) => i)); // all selected by default

        inner.innerHTML = '';
        arr.forEach((m, i) => {
            const row = document.createElement('div');
            row.className = 'am-model-row selected';
            row.style.animationDelay = (i * 35) + 'ms';
            row.innerHTML = `
                <div class="am-model-dot"></div>
                <span class="am-model-name">${m.providerName}</span>
                <span class="am-model-tag" style="color:${m.tagColor};background:${m.tagColor}22;">${m.tag||''}</span>
            `;
            row.onclick = () => {
                if (_agentSelectedModelIdxs.has(i)) {
                    _agentSelectedModelIdxs.delete(i);
                    row.classList.remove('selected');
                } else {
                    _agentSelectedModelIdxs.add(i);
                    row.classList.add('selected');
                }
            };
            inner.appendChild(row);
        });

        const providerName = arr[0].provider.charAt(0).toUpperCase() + arr[0].provider.slice(1);
        if (label) label.textContent = providerName + ' — select models';
        list.classList.add('open');
    }



    // ── Shared error card builder ──
    // SVG icons for each error type
    const _ERR_SVGS = {
        quota:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        block:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
        provider: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        timeout:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><line x1="2" y1="2" x2="22" y2="22"/></svg>',
        key:      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
        network:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
        generic:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    };

    function _buildErrorCard(msg) {
        let svgKey, title, hint;
        if (/quota|rate.?limit|limit.*0|exceeded/i.test(msg)) {
            svgKey = 'quota'; title = 'Quota Exceeded';
            hint = 'Free tier limit reached. Wait a bit or switch to another model.';
        } else if (/no endpoints|endpoint.*found|guardrail|data policy/i.test(msg)) {
            svgKey = 'block'; title = 'No Endpoints Available';
            hint = 'This model has no available providers right now. Try a different model.';
        } else if (/provider.*error|provider returned/i.test(msg)) {
            svgKey = 'provider'; title = 'Provider Error';
            hint = 'The model provider returned an error. Try again or switch model.';
        } else if (/timeout|abort|timed out/i.test(msg)) {
            svgKey = 'timeout'; title = 'Request Timed Out';
            hint = 'Model took too long. Try a shorter prompt or a faster model.';
        } else if (/401|403|invalid.*key|api.?key/i.test(msg)) {
            svgKey = 'key'; title = 'Invalid API Key';
            hint = 'Reconnect your agent with a valid API key.';
        } else if (/network|fetch|failed to fetch/i.test(msg)) {
            svgKey = 'network'; title = 'Network Error';
            hint = 'Check your internet connection and try again.';
        } else {
            svgKey = 'generic'; title = 'Agent Error';
            hint = msg.slice(0, 120) + (msg.length > 120 ? '…' : '');
        }
        const el = document.createElement('div');
        el.style.cssText = 'display:flex;align-items:flex-start;gap:10px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:10px 13px;margin:2px 0;';
        el.innerHTML = `<span style="flex-shrink:0;margin-top:1px;">${_ERR_SVGS[svgKey]}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-size:12px;font-weight:700;color:#ef4444;font-family:Poppins,sans-serif;">${title}</div>
                <div style="font-size:11px;color:var(--text-color);opacity:0.65;margin-top:3px;font-family:Poppins,sans-serif;line-height:1.4;">${hint}</div>
            </div>`;
        return el;
    }
    function connectAgent() {
        const keyInp = document.getElementById('agent-api-key');
        const key = keyInp.value.trim();
        if (!key) { cdAlert('Agent', 'Paste your API key first.', 'warn'); return; }
        const d = _detectProviderFromKey(key);
        if (!d) {
            cdAlert('Agent', 'Key format not recognised.\nSupported: Gemini (AIza…), Groq (gsk_…), OpenRouter (sk-or-…), OpenAI (sk-…), Anthropic (sk-ant-…), DeepSeek', 'warn');
            return;
        }
        const arr = Array.isArray(d) ? d : [d];
        const selectedIdxs = _agentSelectedModelIdxs.size > 0 ? _agentSelectedModelIdxs : new Set([0]);
        let lastEntry = null;
        selectedIdxs.forEach(i => {
            const entry = arr[i] || arr[0];
            const exists = agentList.findIndex(a => a.model === entry.model);
            if (exists !== -1) {
                agentList[exists] = { ...entry, key };
            } else {
                agentList.push({ ...entry, key });
            }
            lastEntry = entry;
        });
        activeAgentIdx = agentList.findIndex(a => a.model === lastEntry.model);
        _saveAgentList();
        keyInp.value = '';
        const list = document.getElementById('agent-model-list');
        const inner = document.getElementById('agent-model-list-inner');
        if (list) list.classList.remove('open');
        if (inner) inner.innerHTML = '';
        _agentSelectedModelIdxs = new Set();
        document.getElementById('agent-detect-badge').style.display = 'none';
        _renderConnectedAgents();
        const count = selectedIdxs.size;
        showToast(count > 1 ? `${count} models connected` : `${lastEntry.providerName} connected`, 'check_circle');
    }

    function _renderConnectedAgents() {
        const section = document.getElementById('agent-connected-section');
        const setup = document.getElementById('agent-setup-section');
        const sub = document.getElementById('agent-modal-sub');
        if(agentList.length === 0) {
            setup.style.display = 'block';
            section.style.display = 'none';
            if(sub) sub.textContent = 'No agent connected';
            return;
        }
        setup.style.display = 'block';
        section.style.display = 'block';
        if(sub) sub.textContent = agentList.length + ' agent' + (agentList.length>1?'s':'') + ' connected';
        const list = document.getElementById('agent-list-container');
        list.innerHTML = '';

        agentList.forEach((ag, i) => {
            const isActive = i === activeAgentIdx;
            const row = document.createElement('div');
            row.className = 'am-agent-row' + (isActive ? ' active' : '');
            const tagHtml = ag.tag ? `<span style="font-size:8px;font-weight:700;padding:2px 5px;border-radius:4px;flex-shrink:0;font-family:'Poppins',sans-serif;color:${ag.tagColor||'var(--accent)'};background:${ag.tagColor||'var(--accent)'}22;">${ag.tag}</span>` : '';
            row.innerHTML = `
                <div class="am-agent-dot"></div>
                <div class="am-agent-name">${ag.providerName}</div>
                ${tagHtml}
                ${isActive ? '<span class="material-icons-round" style="font-size:14px;color:var(--accent);flex-shrink:0;pointer-events:none;">check_circle</span>' : ''}
                <button class="am-agent-del" onclick="event.stopPropagation();_removeAgent(${i})" title="Remove">
                    <span class="material-icons-round">delete</span>
                </button>
            `;
            row.onclick = () => { activeAgentIdx = i; _saveAgentList(); _renderConnectedAgents(); };
            list.appendChild(row);
        });
    }

    function _removeAgent(i) {
        const ag = agentList[i];
        cdConfirm('Remove Agent', `Remove "${ag ? ag.providerName : 'this agent'}"?`, 'Remove', 'Cancel', (ok) => {
            if(!ok) return;
            agentList.splice(i, 1);
            if(activeAgentIdx >= agentList.length) activeAgentIdx = Math.max(0, agentList.length - 1);
            _saveAgentList();
            _renderConnectedAgents();
            if(agentList.length === 0) closeAgentBar();
            else _updateAgentBarLabel();
        });
    }

    function _updateAgentBarLabel() {
        const ag = _activeAgent();
        if(!ag) return;
        document.getElementById('agent-bar-label').textContent = ag.providerName;
        _pingAgentModel();
    }

    // ── Custom Model Dialog ──
    function _cmDetectProvider(key) {
        key = (key || '').trim();
        if (/^nvapi-[A-Za-z0-9_-]{20,}/.test(key))  return { provider:'nvidia',    label:'NVIDIA NIM' };
        if (/^AIza[A-Za-z0-9_-]{20,}/.test(key))   return { provider:'gemini',    label:'Gemini' };
        if (/^gsk_[A-Za-z0-9]{20,}/.test(key))      return { provider:'groq',      label:'Groq' };
        if (/^sk-or-/i.test(key))                    return { provider:'openrouter', label:'OpenRouter' };
        if (/^sk-ant-[A-Za-z0-9]{10,}/.test(key))   return { provider:'anthropic', label:'Anthropic' };
        if (/^sk-[a-f0-9]{32}$/.test(key))           return { provider:'deepseek',  label:'DeepSeek' };
        if (/^sk-[A-Za-z0-9]{20,}/.test(key))        return { provider:'openai',    label:'OpenAI' };
        return null;
    }

    function _cmKeyPreview(val) {
        const d = _cmDetectProvider(val);
        const lbl = document.getElementById('cm-detect-label');
        if (lbl) lbl.textContent = d ? d.label + ' detected' : (val.length > 3 ? 'Unknown — will use OpenAI-compatible' : '');
        // Show/hide proxy URL field for NVIDIA keys
        const proxyWrap = document.getElementById('cm-proxy-wrap');
        if (proxyWrap) proxyWrap.style.display = (d && d.provider === 'nvidia') ? 'block' : 'none';
    }

    function openCustomModelDialog() {
        const overlay = document.getElementById('custom-model-overlay');
        const dialog  = document.getElementById('custom-model-dialog');
        if (!overlay || !dialog) return;
        overlay.style.display = 'flex';
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            dialog.style.opacity  = '1';
            dialog.style.pointerEvents = 'auto';
            dialog.style.transform = 'translate(-50%,-50%) scale(1)';
        });
        document.getElementById('cm-api-key').value = '';
        document.getElementById('cm-model').value   = '';
        document.getElementById('cm-name').value    = '';
        const proxyInp = document.getElementById('cm-proxy-url');
        if (proxyInp) proxyInp.value = '';
        const proxyWrap = document.getElementById('cm-proxy-wrap');
        if (proxyWrap) proxyWrap.style.display = 'none';
        const lbl = document.getElementById('cm-detect-label');
        if (lbl) lbl.textContent = '';
    }

    function closeCustomModelDialog() {
        const overlay = document.getElementById('custom-model-overlay');
        const dialog  = document.getElementById('custom-model-dialog');
        if (!overlay || !dialog) return;
        overlay.style.opacity = '0';
        dialog.style.opacity  = '0';
        dialog.style.transform = 'translate(-50%,-50%) scale(0.9)';
        dialog.style.pointerEvents = 'none';
        setTimeout(() => { overlay.style.display = 'none'; }, 220);
    }

    function connectCustomModel() {
        const key   = document.getElementById('cm-api-key').value.trim();
        const model = document.getElementById('cm-model').value.trim();
        const name  = document.getElementById('cm-name').value.trim();
        const proxyUrl = (document.getElementById('cm-proxy-url')?.value || '').trim();
        if (!key)   { cdAlert('Custom Model', 'API key is required.', 'warn'); return; }
        if (!model) { cdAlert('Custom Model', 'Model ID is required.', 'warn'); return; }

        const detected    = _cmDetectProvider(key);
        const provider    = detected ? detected.provider : 'openai';
        const displayName = name || model;

        // For NVIDIA — require proxy URL
        if (provider === 'nvidia' && !proxyUrl) {
            cdAlert('NVIDIA Proxy Required', 'Please enter your deployed proxy URL. See the README in the proxy ZIP for setup instructions.', 'warn');
            return;
        }
        if (provider === 'nvidia' && proxyUrl) {
            window._nvidiaProxyUrl = proxyUrl;
            try { localStorage.setItem('nvidia_proxy_url', proxyUrl); } catch(e) {}
        }

        let url;
        if (provider === 'gemini') {
            url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        } else if (provider === 'groq')       url = 'https://api.groq.com/openai/v1/chat/completions';
        else if (provider === 'openrouter')   url = 'https://openrouter.ai/api/v1/chat/completions';
        else if (provider === 'anthropic')    url = 'https://api.anthropic.com/v1/messages';
        else if (provider === 'deepseek')     url = 'https://api.deepseek.com/chat/completions';
        else if (provider === 'nvidia')       url = proxyUrl;
        else                                  url = 'https://api.openai.com/v1/chat/completions';

        const entry  = { provider, providerName: displayName, url, model, key, label: displayName };
        const exists = agentList.findIndex(a => a.model === model && a.provider === provider);
        if (exists !== -1) { agentList[exists] = entry; }
        else { agentList.push(entry); activeAgentIdx = agentList.length - 1; }
        _saveAgentList();
        closeCustomModelDialog();
        _renderConnectedAgents();
        cdAlert('Agent', `"${displayName}" added.`, 'success');
    }

    function openAgentModal() {
        closeGithubModal();
        document.getElementById('agent-overlay').classList.add('active');
        document.getElementById('agent-modal').classList.add('active');
        _renderConnectedAgents();
    }

    function closeAgentModal() {
        document.getElementById('agent-overlay').classList.remove('active');
        document.getElementById('agent-modal').classList.remove('active');
    }

    function disconnectAgent() {
        cdConfirm('Remove All Agents', 'Remove all connected agents?', 'Remove All', 'Cancel', (ok) => {
            if(!ok) return;
            agentList = []; activeAgentIdx = 0;
            localStorage.removeItem('agent_list');
            localStorage.removeItem('agent_active_idx');
            localStorage.removeItem('agent_config');
            closeAgentModal(); closeAgentBar();
            _renderConnectedAgents();
        });
    }

    let _agentTargetTabId = null; // which tab agent works on

    function agentSelectFile(tabId) {
        _agentTargetTabId = parseInt(tabId) || null;
    }

    function _updateAgentFileSelector() {
        const sel = document.getElementById('agent-file-select');
        const wrap = document.getElementById('agent-file-selector');
        if(!sel || !wrap) return;
        if(fileTabs.length <= 1) { wrap.style.display = 'none'; _agentTargetTabId = null; return; }
        wrap.style.display = 'block';
        sel.innerHTML = '';
        fileTabs.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.name;
            if(t.id === activeTabId) opt.selected = true;
            sel.appendChild(opt);
        });
        _agentTargetTabId = activeTabId;
    }

    function openAgentBar() {
        closeAgentModal();
        if(!_activeAgent()) { openAgentModal(); return; }
        const bar = document.getElementById('agent-bar');
        bar.classList.add('visible');
        _updateAgentBarLabel();
        _updateAgentFileSelector();
        _expandNav();
        _addAgentNavTab();
        setTimeout(() => document.getElementById('agent-prompt').focus(), 250);
    }

    function _addAgentNavTab() {
        const bar = document.getElementById('file-tabs-bar');
        if(document.getElementById('agent-nav-tab')) return; // already added
        const tab = document.createElement('div');
        tab.id = 'agent-nav-tab';
        tab.className = 'file-tab';
        tab.style.cssText = 'color:var(--accent);border-bottom-color:var(--accent);opacity:1;gap:4px;';
        tab.innerHTML = `<span class="material-icons-round" style="font-size:14px;pointer-events:none">smart_toy</span><span style="pointer-events:none">${_activeAgent()?.providerName||'AI'}</span><span id="agent-nav-status" style="width:7px;height:7px;border-radius:50%;background:#6b7280;display:inline-block;margin-left:2px;flex-shrink:0;" title="Checking..."></span><span class="material-icons-round ft-close" onclick="closeAgentBar();_removeAgentNavTab();" style="font-size:13px;opacity:0.5;pointer-events:auto;">close</span>`;
        tab.onclick = (e) => { if(!e.target.classList.contains('ft-close')) openAgentBar(); };
        bar.appendChild(tab);
    }

    function _removeAgentNavTab() {
        const t = document.getElementById('agent-nav-tab');
        if(t) t.remove();
    }

    async function _pingAgentModel() {
        const dot = document.getElementById('agent-nav-status');
        const barDot = document.querySelector('.agent-status-dot');
        // Key already validated by connectAgent() — if we got here, it's connected
        // Just show green immediately; no need to burn tokens on a test call
        if(dot) { dot.style.background = '#10b981'; dot.title = 'Connected · ' + (_activeAgent()?.providerName||'AI' || ''); }
        if(barDot) barDot.style.background = '#10b981';
    }
    function closeAgentBar() {
        if (_agentPendingEdits && _agentPendingEdits.length > 0) {
            cdConfirm('Close Agent', 'Discard pending AI edits and close?', 'Discard & Close', 'Cancel', (ok) => {
                if (ok) {
                    _cancelPendingEdits(true);
                    document.getElementById('agent-bar').classList.remove('visible');
                    _removeAgentNavTab();
                }
            });
            return;
        }
        document.getElementById('agent-bar').classList.remove('visible');
        _removeAgentNavTab();
    }

    async function _callAgentAPI(systemPrompt, userMsg, conversationHistory = [], externalController = null) {
        const cfg = _activeAgent();
        const controller = externalController || new AbortController();
        const timeoutId = externalController ? null : setTimeout(() => controller.abort(), 600000);


        // Build messages array: history + current user message
        const messages = [
            ...conversationHistory,
            { role: 'user', content: userMsg }
        ];

        try {
            let res, d, text;

            // Per-provider max_tokens — free models have tight output limits
            const _maxTok = {
                groq: 8000, gemini: 8192, openai: 8000,
                anthropic: 8000, openrouter: 8000, deepseek: 8000, nvidia: 8000
            }[cfg.provider] ?? 8000;

            if (cfg.provider === 'anthropic') {
                res = await fetch(cfg.url, {
                    method: 'POST', signal: controller.signal,
                    headers: { 'Content-Type': 'application/json', 'x-api-key': cfg.key, 'anthropic-version': '2023-06-01' },
                    body: JSON.stringify({ model: cfg.model, max_tokens: _maxTok, system: systemPrompt, messages })
                });
                d = await res.json();
                if (!res.ok) throw new Error(d.error?.message || `HTTP ${res.status}`);
                const textBlock = (d.content || []).find(b => b.type === 'text');
                if (!textBlock?.text) throw new Error('Anthropic returned no text. Try again.');
                return textBlock.text.trim();

            } else if (cfg.provider === 'gemini') {
                // Gemini: history roles must be 'user' or 'model' (not 'assistant')
                // System prompt injected into first user message
                const geminiHistory = conversationHistory.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));
                // Fix: Gemini cannot have consecutive same-role messages — merge if needed
                const mergedHistory = [];
                geminiHistory.forEach(msg => {
                    const last = mergedHistory[mergedHistory.length - 1];
                    if (last && last.role === msg.role) {
                        last.parts[0].text += '\n' + msg.parts[0].text;
                    } else {
                        mergedHistory.push({ role: msg.role, parts: [{ text: msg.parts[0].text }] });
                    }
                });
                const contents = [
                    ...mergedHistory,
                    { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userMsg }] }
                ];
                res = await fetch(cfg.url + '?key=' + cfg.key, {
                    method: 'POST', signal: controller.signal,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: _maxTok, temperature: 0.1 } })
                });
                d = await res.json();
                if (!res.ok) throw new Error(d.error?.message || d.error?.status || `HTTP ${res.status}`);
                if (!d.candidates?.[0]) throw new Error('Gemini returned no candidates. Prompt may have been blocked.');
                text = d.candidates[0].content?.parts?.[0]?.text;
                if (!text) throw new Error('Gemini response empty. Try again.');
                return text.trim();

            } else {
                // OpenAI-compatible: OpenAI, Groq, OpenRouter, DeepSeek
                const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key };
                if (cfg.provider === 'openrouter') { headers['HTTP-Referer'] = 'https://codx.app'; headers['X-Title'] = 'CodX'; }
                res = await fetch(cfg.url, {
                    method: 'POST', signal: controller.signal,
                    headers,
                    body: JSON.stringify({
                        model: cfg.model,
                        max_tokens: _maxTok,
                        temperature: 0.1,
                        messages: [{ role: 'system', content: systemPrompt }, ...messages]
                    })
                });
                d = await res.json();
                if (!res.ok) throw new Error(d.error?.message || `HTTP ${res.status}`);
                text = d.choices?.[0]?.message?.content;
                if (!text) throw new Error('Model returned empty response. Try again.');
                // Store meta for badge display in inline chat
                window._lastCallMeta = {
                    model: d.model || cfg.model || '',
                    reasoning_tokens: d.usage?.completion_tokens_details?.reasoning_tokens || 0
                };
                return text.trim();
            }
        } catch (e) {
            if (e.name === 'AbortError') throw new Error('__USER_ABORTED__');
            throw e;
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
        }
    }

    // ── Shared: safe JSON array extractor ──
    function _safeExtractJSON(raw) {
        if (!raw) return null;
        raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
        let start = raw.indexOf('[');
        if (start === -1) return null;
        let depth = 0, end = -1;
        for (let i = start; i < raw.length; i++) {
            if (raw[i] === '[') depth++;
            else if (raw[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
        }
        if (end === -1) return null;
        try { return JSON.parse(raw.slice(start, end + 1)); }
        catch (e) { return null; }
    }

    // 3-STEP AGENT ENGINE
    // User controls every step — Reject = full stop
    async function _runThreeStepAgent({ code, userRequest, attachCtx, appendMsg, showTyping, hideTyping, scrollBottom, onApply }) {

        // STEP 1+2 MERGED: Analyse code AND identify problem blocks
        // One call — AI gets full picture, returns analysis + blocks
        showTyping('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Analysing code and planning fixes...');

        const mergedPrompt = `You are a professional software engineering agent.

TASK: Read the full code and the user request carefully.

Do two things in one response:

PART 1 — ANALYSIS (plain text, 3-5 sentences):
- What the user wants
- What is wrong or what needs to change
- Which parts of the code are affected and why

PART 2 — BLOCKS (JSON array):
Identify every block that needs to be changed. A block = one complete function, CSS rule, or logical section.

For each block return:
[{
  "num": 1,
  "problem": "exactly what is wrong in this block",
  "what_to_do": "exactly what the new block must do differently",
  "location": "function name or CSS selector",
  "block_start": "copy the EXACT first 15+ characters of this block verbatim from the code"
}]

Rules:
- block_start must be copy-paste exact from the code — it is used to find the block.
- what_to_do must be specific enough that AI can rewrite the block without seeing anything else.
- Only list blocks that actually need changing.
- Return PART 1 as plain text, then write exactly: BLOCKS: then the JSON array.`;

        const mergedMsg = `Code:\n\`\`\`\n${code}\n\`\`\`${attachCtx}\n\nUser request: ${userRequest}`;

        let analysis = '';
        let planItems = [];

        try {
            const raw = await _callAgentAPI(mergedPrompt, mergedMsg);
            hideTyping();

            // Split at BLOCKS:
            const blocksIdx = raw.indexOf('BLOCKS:');
            if (blocksIdx !== -1) {
                analysis = raw.slice(0, blocksIdx).trim();
                const jsonPart = raw.slice(blocksIdx + 7).trim();
                planItems = _safeExtractJSON(jsonPart) || [];
            } else {
                analysis = raw.trim();
            }

            if (!analysis) throw new Error('No analysis returned. Try again.');

        } catch(e) {
            hideTyping();
            appendMsg('agent', '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ' + (e.message || 'Analysis failed.'));
            return;
        }

        // ── Show merged Analysis + Plan card — Accept / Refine / Reject ──
        const result = await new Promise(resolve => {
            function _renderCard(currentAnalysis, currentPlan, refined) {
                const planHTML = currentPlan.length > 0
                    ? currentPlan.map(p =>
                        '<div class="agent-plan-item">' +
                            '<div class="agent-plan-num">' + p.num + '.</div>' +
                            '<div>' +
                                '<strong>' + (p.problem||'Fix') + '</strong>' +
                                '<br><span style="opacity:0.6;font-size:10px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + p.location + '</span>' +
                                '<br><span style="opacity:0.55;font-size:10px;">→ ' + (p.what_to_do||'') + '</span>' +
                            '</div>' +
                        '</div>'
                    ).join('')
                    : '<div style="opacity:0.5;font-size:11px;padding:4px 0;">No code changes needed.</div>';

                const card = document.createElement('div');
                card.className = 'agent-step-card';
                card.innerHTML =
                    '<div class="agent-step-header">' +
                        '<div class="agent-step-num">1</div>' +
                        '<div class="agent-step-label">Analysis + Plan' + (refined ? ' (Refined)' : '') +
                            (currentPlan.length ? ' — ' + currentPlan.length + ' fix' + (currentPlan.length>1?'es':'') : '') +
                        '</div>' +
                    '</div>' +
                    '<div class="agent-step-body">' +
                        '<div style="font-size:11px;line-height:1.6;margin-bottom:' + (currentPlan.length?'10px':'0') + ';">' +
                            currentAnalysis.replace(/\n/g,'<br>') +
                        '</div>' +
                        (currentPlan.length ? planHTML : '') +
                    '</div>' +
                    '<div class="agent-step-actions" id="sp-actions">' +
                        '<button class="agent-step-accept" id="sp-accept">' +
                            '<span class="material-icons-round">check</span> Looks right' +
                        '</button>' +
                        '<button class="agent-step-refine-btn" id="sp-refine"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Refine</button>' +
                        '<button class="agent-step-reject" id="sp-reject">Reject</button>' +
                    '</div>';

                appendMsg('agent', '', card);
                scrollBottom();

                document.getElementById('sp-accept').onclick = () => {
                    document.getElementById('sp-actions').outerHTML = '<div class="agent-step-done"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polyline points="20 6 9 17 4 12"/></svg> Plan accepted</div>';
                    resolve({ accepted: true, analysis: currentAnalysis, plan: currentPlan });
                };

                document.getElementById('sp-reject').onclick = () => {
                    document.getElementById('sp-actions').outerHTML = '<div class="agent-step-done" style="color:#ef4444;opacity:0.7;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Rejected — process stopped</div>';
                    resolve({ accepted: false });
                };

                document.getElementById('sp-refine').onclick = () => {
                    document.getElementById('sp-actions').outerHTML =
                        '<div class="agent-step-refine-area" id="sp-refine-area">' +
                            '<textarea class="agent-step-refine-input" id="sp-refine-input" placeholder="Describe the change..." rows="2"></textarea>' +
                            '<button class="agent-step-refine-send" id="sp-refine-send"><span class="material-icons-round">send</span></button>' +
                        '</div>';
                    const inp = document.getElementById('sp-refine-input');
                    inp.focus();
                    document.getElementById('sp-refine-send').onclick = async () => {
                        const fb = inp.value.trim();
                        if (!fb) return;
                        document.getElementById('sp-refine-area').outerHTML = '<div class="agent-step-done" style="opacity:0.5;">↻ Re-analysing with your feedback...</div>';
                        showTyping('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Re-analysing...');
                        try {
                            const rePrompt = mergedPrompt + '\n\nUser feedback on previous analysis: ' + fb + '\nRevise both the analysis and the block plan accordingly.';
                            const reRaw = await _callAgentAPI(rePrompt, mergedMsg);
                            hideTyping();
                            let newAnalysis = reRaw.trim(), newPlan = [];
                            const bi = reRaw.indexOf('BLOCKS:');
                            if (bi !== -1) {
                                newAnalysis = reRaw.slice(0, bi).trim();
                                newPlan = _safeExtractJSON(reRaw.slice(bi + 7)) || [];
                            }
                            _renderCard(newAnalysis, newPlan, true);
                        } catch(e) {
                            hideTyping();
                            resolve({ accepted: false });
                        }
                    };
                };
            }
            _renderCard(analysis, planItems, false);
        });

        if (!result.accepted) throw new Error('__REJECTED__');
        analysis  = result.analysis;
        planItems = result.plan;

        if (!planItems.length) {
            appendMsg('agent', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polyline points="20 6 9 17 4 12"/></svg> No code changes needed — analysis complete.');
            return;
        }

        // STEP 2: EXECUTE — per block, AI knows full context

        // Extract the full block from code using block_start as anchor
        function _extractBlock(fullCode, blockStart) {
            if (!blockStart) return null;
            const idx = fullCode.indexOf(blockStart);
            if (idx === -1) return null;
            // Walk back to start of line
            let begin = idx;
            while (begin > 0 && fullCode[begin-1] !== '\n') begin--;
            // Walk forward counting braces
            let depth = 0, end = begin, hasBrace = false;
            for (let i = begin; i < fullCode.length; i++) {
                if (fullCode[i] === '{') { depth++; hasBrace = true; }
                else if (fullCode[i] === '}') {
                    depth--;
                    if (hasBrace && depth === 0) { end = i + 1; break; }
                }
            }
            if (!hasBrace) {
                // No braces — take 30 lines
                const lines = fullCode.slice(begin).split('\n').slice(0, 30).join('\n');
                end = begin + lines.length;
            }
            const block = fullCode.slice(begin, end).trim();
            return block.length > 5 ? block : null;
        }

        for (let i = 0; i < planItems.length; i++) {
            const p = planItems[i];
            const fixLabel = p.problem || ('Fix ' + (i+1));

            const oldBlock = _extractBlock(code, p.block_start);
            if (!oldBlock || !code.includes(oldBlock)) {
                appendMsg('agent', '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Fix ' + (i+1) + ' (' + (p.location||'') + '): Block not found in code — skipping.');
                continue;
            }

            showTyping('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Fix ' + (i+1) + ' of ' + planItems.length + ' — rewriting ' + (p.location||'block') + '...');

            // Give AI FULL context — it must know everything about this fix
            const execPrompt =
                'You are a surgical code editor executing one specific fix.\n\n' +
                '=== FULL CONTEXT ===\n' +
                'User request: ' + userRequest + '\n\n' +
                'Analysis of the problem:\n' + analysis + '\n\n' +
                'All planned fixes:\n' +
                planItems.map(x => x.num + '. ' + x.problem + ' in ' + x.location + ' → ' + x.what_to_do).join('\n') + '\n\n' +
                '=== YOUR SPECIFIC FIX ===\n' +
                'Fix number: ' + (i+1) + ' of ' + planItems.length + '\n' +
                'Problem in this block: ' + fixLabel + '\n' +
                'What the new block must do: ' + (p.what_to_do||'Fix the problem') + '\n' +
                'Location: ' + (p.location||'') + '\n\n' +
                'Rules:\n' +
                '- Rewrite ONLY this block to fix the stated problem.\n' +
                '- Keep all variable names, event listeners, IDs, and structure intact.\n' +
                '- Do NOT add extra features. Do NOT change unrelated lines.\n' +
                '- No silly mistakes. Minimal change, maximum stability.\n' +
                '- Return ONLY the corrected block. No explanation. No markdown. No backticks.';

            const execMsg = 'Block to fix:\n```\n' + oldBlock + '\n```';

            try {
                let newBlock = await _callAgentAPI(execPrompt, execMsg);
                hideTyping();
                newBlock = newBlock.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();

                if (!newBlock || newBlock === oldBlock.trim()) {
                    appendMsg('agent', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Fix ' + (i+1) + ' (' + (p.location||'') + '): No change needed.');
                    continue;
                }

                // Show old vs new — user applies or skips
                await new Promise(resolve => {
                    const uid = 'fix' + i + '_' + Date.now();
                    const esc = s => (s||'').slice(0,180).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                    const card = document.createElement('div');
                    card.className = 'agent-step-card';
                    card.innerHTML =
                        '<div class="agent-step-header">' +
                            '<div class="agent-step-num">' + (i+1) + '</div>' +
                            '<div class="agent-step-label">Fix ' + (i+1) + ' of ' + planItems.length + ' — ' + (p.location||'') + '</div>' +
                        '</div>' +
                        '<div class="agent-step-body">' +
                            '<div style="font-size:11px;font-weight:700;margin-bottom:8px;">' + fixLabel + '</div>' +
                            '<div style="font-size:10px;opacity:0.6;margin-bottom:8px;">→ ' + (p.what_to_do||'') + '</div>' +
                            '<div class="chat-fix-preview">' +
                                '<div class="chat-fix-side remove"><div class="chat-fix-side-label">OLD</div><div class="chat-fix-code">' + esc(oldBlock) + (oldBlock.length>180?'...':'') + '</div></div>' +
                                '<div class="chat-fix-side insert"><div class="chat-fix-side-label">NEW</div><div class="chat-fix-code">' + esc(newBlock) + (newBlock.length>180?'...':'') + '</div></div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="agent-step-actions" id="' + uid + '-act">' +
                            '<button class="agent-step-accept" id="' + uid + '-ok"><span class="material-icons-round">check</span> Apply</button>' +
                            '<button class="agent-step-reject" id="' + uid + '-skip">Skip</button>' +
                        '</div>';
                    appendMsg('agent', '', card);
                    scrollBottom();
                    document.getElementById(uid+'-ok').onclick = () => {
                        document.getElementById(uid+'-act').outerHTML = '<div class="agent-step-done"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polyline points="20 6 9 17 4 12"/></svg> Applied</div>';
                        onApply([{ find: oldBlock, replace: newBlock, reason: fixLabel }]);
                        resolve();
                    };
                    document.getElementById(uid+'-skip').onclick = () => {
                        document.getElementById(uid+'-act').outerHTML = '<div class="agent-step-done" style="color:#ef4444;opacity:0.7;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Skipped</div>';
                        resolve();
                    };
                });

            } catch(e) {
                hideTyping();
                if (e.message === '__REJECTED__') throw e;
                appendMsg('agent', '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Fix ' + (i+1) + ': ' + (e.message||'Failed') + ' — skipping.');
            }
        }

        hideTyping();
    }

    async function sendAgentPrompt() {
        if(!_activeAgent()) { openAgentModal(); return; }
        const promptEl  = document.getElementById('agent-prompt');
        const attachBtn = document.getElementById('agent-attach-btn');
        const userRequest = promptEl.value.trim();
        if(!userRequest) return;
        if(_agentPendingEdits.length > 0) { cdAlert('Agent', 'Please accept or reject the current edits first.', 'warn'); return; }

        const thinking = document.getElementById('agent-thinking');
        const sendBtn = document.getElementById('agent-send-btn');
        thinking.classList.add('visible'); sendBtn.disabled = true;

        // Use selected file from agent file selector if set
        let _agentWorkTab = null;
        if(_agentTargetTabId) {
            _agentWorkTab = fileTabs.find(t => t.id === _agentTargetTabId);
        }
        if(!_agentWorkTab) _agentWorkTab = fileTabs.find(t => t.id === activeTabId);
        // Save current editor content to active tab first
        const curTab = fileTabs.find(t => t.id === activeTabId);
        if(curTab) curTab.content = editor.getValue();
        const code = _agentWorkTab ? _agentWorkTab.content : editor.getValue();
        _agentOriginalCode = code;

        // Detect split intent
        const splitKeywords = /\b(split|divide|separate|extract|break\s*up|break\s*into|multiple\s*files?|alag|vibhajit|tod|tod\s*do|file\s*mein|files\s*mein|parts?)\b/i;
        const isSplitIntent = splitKeywords.test(userRequest);

        let contextFiles = '';
        fileTabs.forEach(t => {
            if (t.id !== (_agentWorkTab ? _agentWorkTab.id : activeTabId)) {
                contextFiles += `\n--- Context File: ${t.name} ---\n\`\`\`\n${t.content.slice(0, 4000)}\n\`\`\`\n`;
            }
        });

        let attachCtx = agentAttachment ? `\n\nAttached file (${agentAttachment.name}):\n${agentAttachment.content.slice(0,3000)}` : '';
        attachCtx = contextFiles + attachCtx; // Feed all open tabs to the AI

        try {
            if(isSplitIntent) {
                // SPLIT MODE — agent returns multiple files
                const splitSystemPrompt = `You are CodX AI Agent. The user wants to split their code into multiple separate files.

Analyse the code and split it logically into separate files (e.g. HTML, CSS, JS — or by component/module).

Return ONLY a JSON array of file objects. Each object:
{"filename": "name.ext", "content": "full file content here", "reason": "brief reason"}

Rules:
- filename must have a correct extension (.html, .css, .js, .json, etc.)
- content must be the COMPLETE file content — nothing truncated
- Split by type/concern: CSS into .css, JS into .js, HTML into .html, etc.
- Link them correctly (e.g. <link rel="stylesheet"> in HTML, <script src="..."> in HTML)
- Only perform what the user requested. No silly mistakes. Minimal output, maximum quality.
- Return ONLY the JSON array. No markdown, no backticks, no explanation outside the array.`;

                const userMsg = `Code to split:\n\`\`\`\n${code}\n\`\`\`${attachCtx}\n\nRequest: ${userRequest}\n\nRules: Only do what's requested. Senior-level quality. Minimal output, max stability. No comments in code.`;

                let raw = await _callAgentAPI(splitSystemPrompt, userMsg);
                const files = _safeExtractJSON(raw);
                if (!files || !files.length) throw new Error('Agent could not split the code. Try again.');

                if(!Array.isArray(files) || files.length === 0) {
                    cdAlert('Agent', 'Agent could not split the code. Try a more specific request.', 'warn');
                } else {
                    _showSplitFileReview(files);
                }
            } else {
                // EDIT MODE — 3-step: Analyse → Plan → Execute
                const thinking = document.getElementById('agent-thinking');

                try {
                    await _runThreeStepAgent({
                        code, userRequest, attachCtx,
                        appendMsg: (role, text, card) => {
                            // Show result in agent bar area — reuse cdAlert for simple msgs
                            if (!card && text) { cdAlert('Agent', text, (text.startsWith('<svg') || text.includes('warning') || text.includes('error')) ? 'warn' : 'info'); return; }
                            if (card) {
                                // Show card in a floating panel above agent bar
                                const existing = document.getElementById('agent-step-panel');
                                if (existing) existing.remove();
                                const panel = document.createElement('div');
                                panel.id = 'agent-step-panel';
                                panel.style.cssText = 'position:fixed;left:0;right:0;bottom:' + (document.getElementById('bottom-panel').offsetHeight + 8) + 'px;z-index:42;padding:0 10px;max-height:55vh;overflow-y:auto;';
                                panel.appendChild(card);
                                document.body.appendChild(panel);
                            }
                        },
                        showTyping: (msg) => { if (thinking) { thinking.classList.add('visible'); } },
                        hideTyping: () => { if (thinking) thinking.classList.remove('visible'); },
                        scrollBottom: () => {},
                        onApply: (valid) => {
                            const existing = document.getElementById('agent-step-panel');
                            if (existing) existing.remove();
                            _agentPendingEdits = valid;
                            _showAgentDiffReview(valid, 0);
                        }
                    });
                } catch(e) {
                    if (thinking) thinking.classList.remove('visible');
                    if (e.message !== '__REJECTED__') cdAlert('Agent', e.message || 'Something went wrong.', 'warn');
                }
            }

            // Clear input
            promptEl.value = '';
            promptEl.style.height = 'auto';
            agentAttachment = null;
            attachBtn.style.background = '';
            attachBtn.style.color = '';
        } catch(err) {
            const raw = err.message || 'Something went wrong.';
            const bar = document.getElementById('agent-bar');
            const oldErr = document.getElementById('agent-inline-error');
            if(oldErr) oldErr.remove();
            const errEl = _buildErrorCard(raw);
            errEl.id = 'agent-inline-error';
            errEl.style.margin = '4px 10px';
            const closeBtn = document.createElement('span');
            closeBtn.className = 'material-icons-round';
            closeBtn.style.cssText = 'font-size:15px;color:#ef4444;opacity:0.5;cursor:pointer;flex-shrink:0;align-self:flex-start;';
            closeBtn.textContent = 'close';
            closeBtn.onclick = () => errEl.remove();
            errEl.appendChild(closeBtn);
            const inputRow = document.getElementById('agent-compact-row');
            bar.insertBefore(errEl, inputRow);
            setTimeout(() => { if(errEl.parentElement) errEl.remove(); }, 12000);
        } finally {
            thinking.classList.remove('visible'); sendBtn.disabled = false;
        }
    }

    // Show split file review panel — each file with open-in-tab + download
    function _showSplitFileReview(files) {
        const bar = document.getElementById('agent-bar');
        const oldReview = document.getElementById('agent-diff-review');
        if(oldReview) oldReview.remove();

        const review = document.createElement('div');
        review.id = 'agent-diff-review';
        review.style.cssText = 'background:rgba(0,0,0,0.2);border-radius:10px;padding:10px;font-family:Poppins,sans-serif;max-height:260px;overflow-y:auto;';

        const header = document.createElement('div');
        header.style.cssText = 'font-size:11px;font-weight:600;color:var(--accent);margin-bottom:8px;display:flex;align-items:center;gap:6px;';
        header.innerHTML = `<span class="material-icons-round" style="font-size:14px;">folder_open</span> ${files.length} files ready`;
        review.appendChild(header);

        files.forEach((file) => {
            const extIcon = { html:'code', css:'palette', js:'javascript', json:'data_object', md:'description' };
            const ext = file.filename.split('.').pop().toLowerCase();
            const icon = extIcon[ext] || 'insert_drive_file';

            const card = document.createElement('div');
            card.style.cssText = 'background:rgba(0,0,0,0.18);border:1px solid var(--glass-border);border-radius:8px;padding:8px 10px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;gap:8px;';

            const info = document.createElement('div');
            info.style.cssText = 'display:flex;align-items:center;gap:7px;flex:1;min-width:0;';
            info.innerHTML = `<span class="material-icons-round" style="font-size:16px;color:var(--accent);flex-shrink:0">${icon}</span><div style="min-width:0"><div style="font-size:12px;font-weight:600;color:var(--text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${file.filename}</div><div style="font-size:10px;opacity:0.5;margin-top:1px">${file.reason||''}</div></div>`;

            const btns = document.createElement('div');
            btns.style.cssText = 'display:flex;gap:6px;flex-shrink:0;';

            // Open in tab button
            const tabBtn = document.createElement('button');
            tabBtn.style.cssText = 'background:var(--accent-dim);border:none;border-radius:6px;padding:5px 7px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.15s;';
            tabBtn.innerHTML = `<span class="material-icons-round" style="font-size:14px;color:var(--accent);pointer-events:none">tab</span>`;
            tabBtn.title = 'Open in new tab';
            tabBtn.onclick = () => {
                openFileInTab(file.filename, file.content, true);
                tabBtn.style.background = 'var(--accent)';
                tabBtn.querySelector('span').style.color = 'white';
            };

            // Download button
            const dlBtn = document.createElement('button');
            dlBtn.style.cssText = 'background:rgba(128,128,128,0.12);border:none;border-radius:6px;padding:5px 7px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.15s;';
            dlBtn.innerHTML = `<span class="material-icons-round" style="font-size:14px;color:var(--text-color);pointer-events:none">download</span>`;
            dlBtn.title = 'Download file';
            dlBtn.onclick = () => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([file.content], { type: 'text/plain' }));
                a.download = file.filename; a.click();
            };

            btns.appendChild(tabBtn); btns.appendChild(dlBtn);
            card.appendChild(info); card.appendChild(btns);
            review.appendChild(card);
        });

        // Open All + Dismiss buttons
        const actions = document.createElement('div');
        actions.style.cssText = 'display:flex;gap:8px;margin-top:8px;';

        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'modal-btn secondary'; dismissBtn.style.cssText = 'flex:1;padding:9px;font-size:12px;border-radius:8px;';
        dismissBtn.textContent = 'Dismiss';
        dismissBtn.onclick = () => { review.remove(); };

        const openAllBtn = document.createElement('button');
        openAllBtn.className = 'modal-btn'; openAllBtn.style.cssText = 'flex:1;padding:9px;font-size:12px;border-radius:8px;';
        openAllBtn.textContent = 'Open All Tabs';
        openAllBtn.onclick = () => {
            files.forEach(f => openFileInTab(f.filename, f.content, true));
            review.remove();
        };

        actions.appendChild(dismissBtn); actions.appendChild(openAllBtn);
        review.appendChild(actions);

        const inputRow = document.getElementById('agent-compact-row');
        bar.insertBefore(review, inputRow);
    }

    // Show accept/reject diff review inside agent bar
    function _showAgentDiffReview(edits, skipped) {
        const bar = document.getElementById('agent-bar');
        // Remove old review if any
        const oldReview = document.getElementById('agent-diff-review');
        if(oldReview) oldReview.remove();

        const review = document.createElement('div');
        review.id = 'agent-diff-review';
        review.style.cssText = 'background:rgba(0,0,0,0.2);border-radius:10px;padding:10px;font-family:Poppins,sans-serif;';

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
        header.innerHTML = `<span style="font-size:11px;font-weight:600;color:var(--accent)">${edits.length} edit${edits.length>1?'s':''} ready${skipped>0?' ('+skipped+' skipped)':''}</span>`;
        review.appendChild(header);

        edits.forEach((edit, i) => {
            const card = document.createElement('div');
            card.style.cssText = 'background:rgba(0,0,0,0.15);border:1px solid var(--glass-border);border-radius:8px;padding:8px;margin-bottom:6px;font-size:11px;';
            const reason = edit.reason || 'Edit';
            const findPreview = edit.find.slice(0,60).replace(/\n/g,'↵') + (edit.find.length>60?'…':'');
            const replacePreview = edit.replace.slice(0,60).replace(/\n/g,'↵') + (edit.replace.length>60?'…':'');
            card.innerHTML = `
                <div style="font-weight:600;color:var(--text-color);margin-bottom:6px;opacity:0.9;font-size:11px;">${reason}</div>
                <div style="display:flex;gap:6px;">
                    <div style="flex:1;min-width:0;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:6px;padding:5px 7px;">
                        <div style="font-size:9px;color:#ef4444;font-weight:700;margin-bottom:3px;letter-spacing:0.4px;">REMOVE</div>
                        <div style="color:#ef4444;font-family:monospace;font-size:10px;opacity:0.9;word-break:break-all;">${findPreview}</div>
                    </div>
                    <div style="flex:1;min-width:0;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:6px;padding:5px 7px;">
                        <div style="font-size:9px;color:#10b981;font-weight:700;margin-bottom:3px;letter-spacing:0.4px;">INSERT</div>
                        <div style="color:#10b981;font-family:monospace;font-size:10px;opacity:0.9;word-break:break-all;">${replacePreview}</div>
                    </div>
                </div>
            `;
            review.appendChild(card);
        });

        const actions = document.createElement('div');
        actions.style.cssText = 'display:flex;gap:8px;margin-top:8px;';
        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'modal-btn secondary'; rejectBtn.style.cssText = 'flex:1;padding:9px;font-size:12px;border-radius:8px;';
        rejectBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;pointer-events:none;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Reject All';
        rejectBtn.onclick = _cancelPendingEdits;
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'modal-btn'; acceptBtn.style.cssText = 'flex:1;padding:9px;font-size:12px;border-radius:8px;';
        acceptBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polyline points="20 6 9 17 4 12"/></svg> Accept All';
        acceptBtn.onclick = _acceptPendingEdits;
        actions.appendChild(rejectBtn); actions.appendChild(acceptBtn);
        review.appendChild(actions);

        // Insert before input row
        const inputRow = document.getElementById('agent-compact-row');
        bar.insertBefore(review, inputRow);
    }

    function _acceptPendingEdits() {
        if(_agentPendingEdits.length === 0) return;
        _agentUndoStack.push(editor.getValue());
        if(_agentUndoStack.length > 5) _agentUndoStack.shift();

        // Apply edits to the agent's target tab
        const targetId = _agentTargetTabId || activeTabId;
        const targetTab = fileTabs.find(t => t.id === targetId);
        let code = targetTab ? targetTab.content : editor.getValue();
        let applied = 0;
        _agentPendingEdits.forEach(edit => {
            if(code.includes(edit.find)) { code = code.split(edit.find).join(edit.replace); applied++; }
        });
        // Switch to that tab and apply
        if(targetTab) {
            targetTab.content = code;
            if(targetId !== activeTabId) switchFileTab(targetId);
        }
        _setEditorValueFast(code);
        const cur = fileTabs.find(t => t.id === activeTabId);
        if(cur) cur.content = code;

        _agentPendingEdits = [];
        const rev = document.getElementById('agent-diff-review');
        if(rev) rev.remove();
        _showAgentUndoToast(applied);
    }

    function _cancelPendingEdits(skipConfirm) {
        if (skipConfirm !== true && _agentPendingEdits && _agentPendingEdits.length > 0) {
            cdConfirm('Reject Edits', 'Are you sure you want to discard these AI edits?', 'Reject All', 'Cancel', (ok) => {
                if (ok) { _agentPendingEdits = []; const rev = document.getElementById('agent-diff-review'); if(rev) rev.remove(); }
            });
            return;
        }
        _agentPendingEdits = [];
        const rev = document.getElementById('agent-diff-review');
        if(rev) rev.remove();
    }

    function _showAgentUndoToast(count) {
        const bar = document.getElementById('agent-bar');
        const old = document.getElementById('agent-undo-toast');
        if(old) old.remove();
        const toast = document.createElement('div');
        toast.id = 'agent-undo-toast';
        toast.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:var(--accent-dim);border:1px solid var(--accent);border-radius:8px;padding:8px 12px;font-size:11px;font-family:Poppins,sans-serif;';
        toast.innerHTML = `<span style="color:var(--accent);font-weight:600"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;pointer-events:none;"><polyline points="20 6 9 17 4 12"/></svg> Applied ${count} edit${count>1?'s':''}</span>`;
        const undoBtn = document.createElement('span');
        undoBtn.textContent = 'Undo';
        undoBtn.style.cssText = 'color:var(--accent);font-weight:600;cursor:pointer;text-decoration:underline;margin-left:10px;';
        undoBtn.onclick = _agentUndo;
        toast.appendChild(undoBtn);
        const inputRow = document.getElementById('agent-compact-row');
        bar.insertBefore(toast, inputRow);
        // Auto-remove after 5s
        setTimeout(() => { if(toast.parentElement) toast.remove(); }, 5000);
    }

    function _agentUndo() {
        if(_agentUndoStack.length === 0) { cdAlert('Undo', 'Nothing to undo.', 'info'); return; }
        const prev = _agentUndoStack.pop();
        _setEditorValueFast(prev);
        const cur = fileTabs.find(t => t.id === activeTabId);
        if(cur) cur.content = prev;
        const toast = document.getElementById('agent-undo-toast');
        if(toast) toast.remove();
    }

        // ===== WELCOME SCREEN (first-launch only) =====
    (async function() {
        // Welcome screen bypassed. App defaults straight to the blank editor.
        await CodXStore.set('codx_welcomed', '1');
    })();
    async function dismissWelcome() {
        const ws = document.getElementById('welcome-screen');
        ws.classList.add('hiding');
        setTimeout(() => { ws.classList.add('hidden'); }, 650);
        await CodXStore.set('codx_welcomed', '1');
    }

    // ===== UNLIMITED UNDO / REDO (no limit) =====
    function editorUndo() { editor.undo(); }
    function editorRedo() { editor.redo(); }
    // Remove ACE's default undo limit
    try { editor.session.getUndoManager().$maxRev = Infinity; } catch(e) {}

    // ===== CLOSE ALL TABS =====
    function closeAllTabs() {
        if (fileTabs.length <= 1) { cdAlert('Close All', 'Only one tab is open.', 'info'); return; }
        cdConfirm('Close All Tabs', `Close all ${fileTabs.length} tabs and start fresh?`, 'Close All', 'Cancel', (ok) => {
            if (!ok) return;
            const blankName = _pythonMode ? 'main.py' : 'index.html';
            fileTabs = [{ id: 1, name: blankName, content: '' }];
            activeTabId = 1;
            tabIdCounter = 2;
            _setEditorValueFast('');
            if (_pythonMode && !_forcePlainText) editor.session.setMode('ace/mode/python');
            else _setEditorMode(blankName, '');
            currentFileName = blankName;
            renderFileTabs();
        });
    }

    // ===== PREVIEW AUTO-REFRESH when switching to Preview tab =====
    // Already handled in switchTab — preview src is always refreshed when switching to preview.
    // Adding: switching to any non-preview tab while in preview also refreshes when switching back.
    // (This is already the existing behavior — preview reloads on every switch to Preview.)

    // ===== SAVE FILE + OPTIONAL GITHUB COMMIT =====
    async function saveFileToRepo() {
        const token = localStorage.getItem('gh_token');
        if (!token) { cdAlert('Commit', 'Please connect GitHub first via GitSync.', 'warn'); return; }
        if (!ghCurrentRepo) {
            // No repo selected — open GitSync so user can pick one
            openGithubModal();
            cdAlert('GitSync', 'Select a repository and open a file, then click Commit.', 'info');
            return;
        }
        if (!ghCurrentFile) {
            openGithubModal();
            cdAlert('GitSync', 'Open a file from the tree first, then commit.', 'info');
            return;
        }
        // Has everything — go straight to commit with warning
        commitGhFile();
    }

    // ===== NEW PROJECT MODAL =====
    let _npSaveDest = 'local';
    let _npRepoVis = 'public';
    let _npCurrentTab = 'blank';

    function openNewProjectModal() {
        document.getElementById('new-project-overlay').classList.add('active');
        // Set default filename based on current language mode
        const fnInput = document.getElementById('np-filename');
        if (fnInput) fnInput.value = _pythonMode ? 'main.py' : 'index.html';
        // Check GitHub login
        const token = localStorage.getItem('gh_token');
        const warn = document.getElementById('np-repo-login-warn');
        if (warn) warn.style.display = token ? 'none' : 'block';
        if (token) { _npLoadReposForSelect(); }
    }
    function closeNewProjectModal() {
        document.getElementById('new-project-overlay').classList.remove('active');
    }
    function npSwitchTab(tab) {
        _npCurrentTab = tab;
        document.getElementById('np-tab-blank').classList.toggle('active', tab === 'blank');
        document.getElementById('np-tab-repo').classList.toggle('active', tab === 'repo');
        document.getElementById('np-pane-blank').classList.toggle('active', tab === 'blank');
        document.getElementById('np-pane-repo').classList.toggle('active', tab === 'repo');
        // Show login warn in repo tab
        const token = localStorage.getItem('gh_token');
        const warn = document.getElementById('np-repo-login-warn');
        if (warn) warn.style.display = (!token && tab === 'repo') ? 'block' : 'none';
    }
    function npSelectSave(dest) {
        _npSaveDest = dest;
        document.getElementById('np-save-local').classList.toggle('selected', dest === 'local');
        document.getElementById('np-save-github').classList.toggle('selected', dest === 'github');
        document.getElementById('np-github-repo-wrap').style.display = dest === 'github' ? 'block' : 'none';
        if (dest === 'github') { _npLoadReposForSelect(); }
    }
    function npSelectVis(vis) {
        _npRepoVis = vis;
        document.getElementById('np-vis-public').classList.toggle('selected', vis === 'public');
        document.getElementById('np-vis-private').classList.toggle('selected', vis === 'private');
    }
    async function _npLoadReposForSelect() {
        const token = localStorage.getItem('gh_token');
        if (!token) return;
        try {
            const repos = await ghApi('/user/repos?sort=updated&per_page=100');
            const sel = document.getElementById('np-gh-repo-select');
            sel.innerHTML = '<option value="">Select Repository...</option>';
            repos.forEach(r => {
                const o = document.createElement('option');
                o.value = r.full_name; o.textContent = r.name;
                sel.appendChild(o);
            });
        } catch(e) {}
    }
    async function createNewProject() {
        const fname = (document.getElementById('np-filename').value || '').trim();
        if (!fname) { cdAlert('New Project', 'Please enter a file name.', 'warn'); return; }
        const ext = fname.split('.').pop().toLowerCase();
        const _webExts = ['html','htm','css','js','ts','jsx','tsx','json','md','txt','xml','svg'];
        if (_pythonMode && ext !== 'py') {
            cdAlert('Python Mode', 'Only .py files allowed in Python mode.', 'warn'); return;
        }
        if (!_pythonMode && !_webExts.includes(ext)) {
            cdAlert('HTML Mode', `".${ext}" is not a supported web file type.`, 'warn'); return;
        }
        const blankContent = _getBlankContentForFile(fname);
        closeNewProjectModal();
        // Ask user: new tab or current tab
        cdConfirm('Open In', 'Open "' + fname + '" in a new tab or replace current tab?', 'New Tab', 'Current Tab', (useNew) => {
            openFileInTab(fname, blankContent, useNew);
            // Switch to Code tab to start editing
            switchTab('editor', document.getElementById('tab-code'));
        });
        if (_npSaveDest === 'github') {
            const repoSel = document.getElementById('np-gh-repo-select');
            const repo = repoSel ? repoSel.value : '';
            if (!repo) { cdAlert('New Project', 'File opened in editor. Select a GitHub repo in GitSync to commit when ready.', 'info'); return; }
            cdConfirm('Upload to GitHub', `Upload "${fname}" to ${repo}?`, 'Upload', 'Later', async (ok) => {
                if (!ok) return;
                cdPrompt('Commit Message', 'Initial commit message:', `Add ${fname}`, async (msg) => {
                    if (msg === null) return;
                    try {
                        const contentB64 = encodeB64(blankContent);
                        await ghApi(`/repos/${repo}/contents/${fname}`, 'PUT', {
                            message: msg, content: contentB64
                        });
                        ghCurrentRepo = repo; ghCurrentFile = fname;
                        const updated = await ghApi(`/repos/${repo}/contents/${fname}`);
                        ghCurrentSha = updated.sha;
                        cdAlert('Uploaded', `"${fname}" created in ${repo}`, 'success');
                    } catch (e) { cdAlert('Upload Failed', e.message, 'error'); }
                });
            });
        }
    }
    function _getBlankContentForFile(fname) {
        const ext = fname.split('.').pop().toLowerCase();
        if (ext === 'html' || ext === 'htm') return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${fname.replace(/\.[^.]+$/,'')}</title>\n</head>\n<body>\n\n</body>\n</html>`;
        if (ext === 'css') return `/* ${fname} */\n\n* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n`;
        if (ext === 'js')   return `// ${fname}\n\n`;
        if (ext === 'json') return `{\n  \n}\n`;
        if (ext === 'md')   return `# ${fname.replace(/\.[^.]+$/,'')}\n\n`;
        if (ext === 'py')   return `# ${fname}\n\n`;
        return '';
    }

    // ===== CREATE GITHUB REPO =====
    async function createGithubRepo() {
        const token = localStorage.getItem('gh_token');
        if (!token) { cdAlert('GitHub', 'Please connect GitHub first via GitSync.', 'warn'); return; }
        const name = (document.getElementById('np-repo-name').value || '').trim();
        if (!name) { cdAlert('Create Repo', 'Please enter a repository name.', 'warn'); return; }
        if (!/^[a-zA-Z0-9_.-]+$/.test(name)) { cdAlert('Create Repo', 'Repo name can only contain letters, numbers, hyphens, underscores, and dots.', 'warn'); return; }
        const desc = (document.getElementById('np-repo-desc').value || '').trim();
        const isPrivate = _npRepoVis === 'private';
        const addReadme = document.getElementById('np-repo-readme').checked;
        const addGitignore = document.getElementById('np-repo-gitignore').checked;
        const addLicense = document.getElementById('np-repo-license').checked;
        const deployPages = document.getElementById('np-repo-deploy')?.checked || false;
        // GitHub Pages requires public repo
        if (deployPages && isPrivate) {
            cdAlert('GitHub Pages', 'GitHub Pages free tier requires a Public repo. Please switch to Public or uncheck Deploy.', 'warn'); return;
        }
        try {
            const payload = { name, description: desc, private: isPrivate, auto_init: true };
            if (addGitignore) payload.gitignore_template = 'Node';
            if (addLicense) payload.license_template = 'mit';
            const result = await ghApi('/user/repos', 'POST', payload);
            closeNewProjectModal();
            _ghReposLoaded = false;
            const repoUrl  = result.html_url;
            const fullName = result.full_name;
            let pagesUrl = null;
            // Enable GitHub Pages if checkbox ticked
            if (deployPages) {
                try {
                    await ghApi('/repos/' + fullName + '/pages', 'POST', {
                        source: { branch: 'main', path: '/' }
                    });
                    pagesUrl = 'https://' + fullName.split('/')[0] + '.github.io/' + name;
                } catch(pe) {
                    // Pages might already exist or take time — still show link
                    pagesUrl = 'https://' + fullName.split('/')[0] + '.github.io/' + name;
                }
            }
            _showRepoCreatedLink(fullName, repoUrl, pagesUrl);
        } catch (e) {
            let msg = e.message || 'Failed to create repo.';
            try { const j = JSON.parse(msg); msg = j.message || msg; } catch(ee) {}
            cdAlert('Create Repo Failed', msg, 'error');
        }
    }

    // ===== REPO CREATED LINK DIALOG =====
    function _showRepoCreatedLink(fullName, htmlUrl, pagesUrl) {
        const _cdOverlay = document.getElementById('custom-dialog-overlay');
        document.getElementById('custom-dialog-icon').innerHTML = '<span class="material-icons-round" style="color:#10b981">check_circle</span>';
        document.getElementById('custom-dialog-title').textContent = pagesUrl ? 'Repo Created & Deployed!' : 'Repo Created!';
        document.getElementById('custom-dialog-msg').innerHTML = pagesUrl
            ? '<div style="font-size:12px;line-height:1.8;">' +
              '<div style="margin-bottom:6px;">&#128279; <b>GitHub Repo:</b><br>' +
              '<span style="font-size:11px;color:var(--accent);word-break:break-all;">' + htmlUrl + '</span></div>' +
              '<div>&#128640; <b>Live Site:</b><br>' +
              '<span style="font-size:11px;color:var(--accent);word-break:break-all;">' + pagesUrl + '</span></div>' +
              '<div style="margin-top:6px;font-size:10px;opacity:0.5;">Live site may take 1-2 min to go live.</div>' +
              '</div>'
            : '"' + fullName + '" is live on GitHub.';
        const inp = document.getElementById('custom-dialog-input');
        inp.style.display = 'none';
        const btnsEl = document.getElementById('custom-dialog-btns');
        btnsEl.innerHTML = '';
        // Copy repo link button
        const copyRepoBtn = document.createElement('button');
        copyRepoBtn.className = 'cdlg-btn secondary';
        copyRepoBtn.textContent = 'Copy Repo';
        copyRepoBtn.onclick = () => {
            navigator.clipboard.writeText(htmlUrl).catch(() => {});
            copyRepoBtn.textContent = 'Copied!';
            setTimeout(() => { copyRepoBtn.textContent = 'Copy Repo'; }, 2000);
        };
        btnsEl.appendChild(copyRepoBtn);
        // Copy deploy link button (if pages)
        if (pagesUrl) {
            const copyPagesBtn = document.createElement('button');
            copyPagesBtn.className = 'cdlg-btn primary';
            copyPagesBtn.textContent = 'Copy Live Link';
            copyPagesBtn.onclick = () => {
                navigator.clipboard.writeText(pagesUrl).catch(() => {});
                copyPagesBtn.textContent = 'Copied!';
                setTimeout(() => { copyPagesBtn.textContent = 'Copy Live Link'; }, 2000);
            };
            btnsEl.appendChild(copyPagesBtn);
        } else {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'cdlg-btn primary';
            copyBtn.textContent = 'Copy Link';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(htmlUrl).catch(() => {});
                copyBtn.textContent = 'Copied!';
                setTimeout(() => { copyBtn.textContent = 'Copy Link'; }, 2000);
            };
            btnsEl.appendChild(copyBtn);
        }
        const closeBtn = document.createElement('button');
        closeBtn.className = 'cdlg-btn secondary';
        closeBtn.textContent = 'Done';
        closeBtn.onclick = () => {
            inp.style.display = 'none';
            document.getElementById('custom-dialog-overlay').classList.remove('active');
        };
        btnsEl.appendChild(closeBtn);
        _cdOverlay.classList.add('active');
    }
    function _showRepoProgress(sub, filled, total) {
        const overlay = document.getElementById('repo-progress-overlay');
        overlay.classList.add('visible');
        document.getElementById('repo-progress-sub').textContent = sub;
        document.getElementById('repo-progress-fill').style.width = (total > 0 ? Math.round(filled / total * 100) : 0) + '%';
        document.getElementById('repo-progress-count').textContent = `${filled} / ${total}`;
    }
    function _hideRepoProgress() {
        document.getElementById('repo-progress-overlay').classList.remove('visible');
    }

    // ===== NAV BAR RESTORE FIX =====
    // After closing Find/Replace or other modals, ensure restore button and bottom panel state is consistent
    // Patch toggleFindReplace to ensure header/nav never disappears
    window._ensureNavVisible = function() {}; // nav always visible now
    // ── Desktop keyboard shortcuts ──
    document.addEventListener('keydown', (e) => {
        const ctrl = e.ctrlKey || e.metaKey;
        const tag  = (document.activeElement || {}).tagName;
        const inInput = tag === 'INPUT' || tag === 'TEXTAREA';

        // ── Escape — close topmost open modal/panel (priority order) ──
        if (e.key === 'Escape') {
            // custom dialog
            if (document.getElementById('custom-dialog-overlay')?.classList.contains('active')) {
                _hideDialog(); return;
            }
            // new project modal
            if (document.getElementById('new-project-overlay')?.classList.contains('active')) {
                closeNewProjectModal(); return;
            }
            // github modal
            if (document.getElementById('github-modal')?.classList.contains('active')) {
                closeGithubModal(); return;
            }
            // agent modal
            if (document.getElementById('agent-modal')?.classList.contains('active')) {
                closeAgentModal(); return;
            }
            // find modal
            if (findModal && findModal.classList.contains('active')) {
                findModal.classList.remove('active');
                findModal.style.top = ''; findModal.style.bottom = '';
                editor.focus(); return;
            }
            // inline chat panel
            if (_inlineChatOpen) {
                closeInlineChat(); return;
            }
        }

        // ── Enter — confirm primary button in custom dialog ──
        if (e.key === 'Enter' && !inInput) {
            const overlay = document.getElementById('custom-dialog-overlay');
            if (overlay?.classList.contains('active')) {
                const primary = overlay.querySelector('.cdlg-btn.primary');
                if (primary) { e.preventDefault(); primary.click(); return; }
            }
        }

        // Desktop-only shortcuts (skip if user is typing in an input)
        if (!ctrl) return;

        // Ctrl+S — Save
        if (e.key === 's' || e.key === 'S') {
            e.preventDefault(); saveFile(); return;
        }
        // Ctrl+F — Find & Replace
        if (e.key === 'f' || e.key === 'F') {
            e.preventDefault(); toggleFindReplace(); return;
        }
        // Ctrl+G — GitHub modal
        if (e.key === 'g' || e.key === 'G') {
            e.preventDefault();
            const ghOpen = document.getElementById('github-modal')?.classList.contains('active');
            if (ghOpen) closeGithubModal(); else openGithubModal();
            return;
        }
        // Ctrl+` — Toggle AI Chat
        if (e.key === '`') {
            e.preventDefault(); toggleInlineChat(); return;
        }
        // Ctrl+Shift+N — New project
        if ((e.key === 'n' || e.key === 'N') && e.shiftKey) {
            e.preventDefault(); openNewProjectModal(); return;
        }
        // Ctrl+Z / Ctrl+Shift+Z — Undo/Redo (Ace handles these natively,
        // but ensure they work even when focus is outside editor)
        if ((e.key === 'z' || e.key === 'Z') && !inInput) {
            if (e.shiftKey) { e.preventDefault(); editorRedo(); }
            else            { e.preventDefault(); editorUndo(); }
            return;
        }
    });

    // ── Tab focus trap — keeps Tab/Shift+Tab inside open modals ──
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const modalSel = '#custom-dialog-overlay.active #custom-dialog-box, ' +
                         '#new-project-overlay.active #new-project-modal, ' +
                         '#github-modal.active, #agent-modal.active';
        const openModal = document.querySelector(modalSel);
        if (!openModal) return;
        const focusable = Array.from(openModal.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(el => el.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
    });
    // Intercept any APK download errors and save a log file
    window._apkInstallLog = [];
    window._logApkEvent = function(type, msg) {
        window._apkInstallLog.push(`[${new Date().toISOString()}] [${type}] ${msg}`);
    };
    window._downloadApkLog = function() {
        if (window._apkInstallLog.length === 0) {
            window._apkInstallLog.push('[INFO] No APK install events recorded yet.');
        }
        const logContent = `CodX APK Install Log\nGenerated: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n` + window._apkInstallLog.join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([logContent], { type: 'text/plain' }));
        a.download = `codx-install-log-${Date.now()}.txt`;
        a.click();
    };
    // Hook install button to log events
    installBtn.addEventListener('click', async () => {
        window._logApkEvent('INFO', 'User clicked install / PWA prompt');
        if (deferredPrompt) {
            try {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                window._logApkEvent('RESULT', `User choice: ${outcome}`);
                if (outcome === 'accepted') {
                    installBtn.style.display = 'none'; deferredPrompt = null;
                    window._logApkEvent('SUCCESS', 'PWA installed successfully');
                } else {
                    window._logApkEvent('DISMISSED', 'User dismissed the install prompt');
                }
            } catch (err) {
                window._logApkEvent('ERROR', err.message || String(err));
                window._downloadApkLog();
            }
        } else {
            window._logApkEvent('WARN', 'No deferred prompt available — PWA criteria may not be met');
            window._downloadApkLog();
        }
    }, true);
    window.addEventListener('beforeinstallprompt', () => { window._logApkEvent('INFO', 'beforeinstallprompt fired — PWA installable'); });
    window.addEventListener('appinstalled', () => { window._logApkEvent('SUCCESS', 'appinstalled event fired'); });