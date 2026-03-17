# CodX — Module Function Reference

> Har function kaun si file mein hai — quick reference

---

## ⚙️ `modules/core.js`
**Core — Editor, Tabs, Files, Theme, Toolbar**

| Function | Line | Kya karta hai |
|----------|------|---------------|
| `_setBodyHeight()` | 24 | Body height set karta hai viewport ke hisab se |
| `_handleChatKeyboard()` | 57 | Keyboard open/close par chat + editor layout fix karta hai |
| `_positionFindModal()` | 119 | Find modal ko keyboard ke upar position karta hai |
| `_makePwaIconPng()` | 146 | PWA icon PNG generate karta hai canvas se |
| `_open()` | 219 | — |
| `set()` | 231 | — |
| `get()` | 246 | — |
| `remove()` | 263 | — |
| `_setEditorMode()` | 391 | Editor ka syntax mode set karta hai (HTML/JS/Python etc) |
| `_showPerfBadge()` | 409 | Performance badge dikhata hai |
| `_setEditorValueFast()` | 437 | Editor mein content fast set karta hai |
| `checkScrollable()` | 467 | Scroll jumpers show/hide karta hai |
| `saveSession()` | 480 | Current editor content localStorage mein save karta hai |
| `_updateEditorPlaceholder()` | 498 | Editor placeholder show/hide karta hai |
| `customFastScroll()` | 533 | Editor mein fast scroll karta hai |
| `animation()` | 540 | — |
| `pasteClipboard()` | 551 | Clipboard se paste karta hai |
| `copyClipboard()` | 552 | Selected text copy karta hai |
| `cutClipboard()` | 553 | Selected text cut karta hai |
| `deleteSelection()` | 554 | Selected text delete karta hai |
| `showToast()` | 556 | Bottom toast notification dikhata hai |
| `toggleNavSize()` | 661 | Toolbar mini/full toggle karta hai |
| `toggleNavVisibility()` | 679 | Toolbar hide/show karta hai |
| `_expandNav()` | 701 | Nav expand karta hai |
| `toggleTheme()` | 704 | Dark/Light theme switch karta hai |
| `dismissPreviewWelcome()` | 717 | Preview welcome screen dismiss karta hai |
| `_refreshPreview()` | 722 | Preview iframe refresh karta hai |
| `switchTab()` | 742 | Code/Preview tab switch karta hai |
| `renderFileTabs()` | 816 | File tabs bar render karta hai |
| `switchFileTab()` | 829 | File tab switch karta hai |
| `closeFileTab()` | 847 | File tab close karta hai |
| `openFileInTab()` | 874 | File ko naye tab mein kholta hai |
| `loadFile()` | 896 | Local file load karta hai |
| `saveFile()` | 940 | File save karta hai (local/GitHub) |
| `_fmToggle()` | 956 | Find modal case/regex chip toggle karta hai |
| `toggleFindReplace()` | 962 | Find & Replace modal open/close karta hai |
| `findText()` | 980 | Text dhundhta hai editor mein |
| `replaceText()` | 991 | Text replace karta hai editor mein |
| `clearFind()` | 1001 | Find fields clear karta hai |
| `_ghUpdateHeaderStatus()` | 1006 | GitHub header status text update karta hai |
| `openGithubModal()` | 1012 | GitHub modal kholta hai |
| `closeGithubModal()` | 1019 | GitHub modal band karta hai |
| `checkGhLogin()` | 1033 | GitHub login status check karta hai |
| `saveGhToken()` | 1049 | GitHub token save karta hai |
| `ghLogout()` | 1050 | GitHub logout karta hai |
| `ghApi()` | 1063 | GitHub API call karta hai |
| `encodeB64()` | 1071 | String ko Base64 encode karta hai |
| `decodeB64()` | 1072 | Base64 string decode karta hai |
| `fetchGhRepos()` | 1074 | GitHub repositories fetch karta hai |
| `_ghForceRefresh()` | 1095 | GitHub file tree force refresh karta hai |
| `fetchGhFiles()` | 1106 | GitHub repo files fetch karta hai |
| `_ghRenderTree()` | 1132 | File tree render karta hai |
| `_ghFileIcon()` | 1200 | File type ke hisab se icon return karta hai |
| `_ghSelectItem()` | 1206 | File tree item select karta hai |
| `_ghDisableFileActions()` | 1225 | File action buttons disable karta hai |
| `_ghDownloadRepo()` | 1231 | Poora repo ZIP download karta hai |
| `_ghRenameRepo()` | 1259 | Repository rename karta hai |
| `_ghQuickOpen()` | 1279 | File quickly editor mein kholta hai |
| `_ghQuickDownload()` | 1296 | File quickly download karta hai |
| `loadGhFile()` | 1306 | GitHub file editor mein load karta hai |
| `renameGhFile()` | 1311 | GitHub file rename karta hai |
| `deleteGhFile()` | 1335 | GitHub file delete karta hai |
| `createGhFile()` | 1360 | GitHub mein naya file banata hai |
| `createGhFolder()` | 1374 | GitHub mein naya folder banata hai |
| `uploadGhFile()` | 1387 | Local file GitHub pe upload karta hai |

---

## 🐙 `modules/github.js`
**GitHub — Sync, Commit, File Tree**

| Function | Line | Kya karta hai |
|----------|------|---------------|
| `_showCommitModal()` | 2 | Commit modal dikhata hai |
| `_commitAnotherFile()` | 60 | Aur ek file commit karta hai |
| `_showCommitToast()` | 67 | Commit success toast dikhata hai |
| `_doCommit()` | 123 | — |
| `commitGhFile()` | 165 | File GitHub pe commit karta hai |
| `undoLastCommit()` | 176 | Last commit undo karta hai |
| `_restoreCommit()` | 237 | Purana commit restore karta hai |
| `loadGhRepo()` | 263 | Poora GitHub repo load karta hai |
| `_showDialog()` | 314 | Custom dialog box dikhata hai |
| `_hideDialog()` | 333 | Custom dialog band karta hai |
| `cdAlert()` | 334 | Alert dialog dikhata hai |
| `cdConfirm()` | 338 | Confirm dialog dikhata hai |
| `cdPrompt()` | 345 | Input prompt dialog dikhata hai |
| `renderGhCustomSelect()` | 354 | Custom dropdown select render karta hai |

---

## 🤖 `modules/agent.js`
**Agent — AI Providers, Models, Apply Edits**

| Function | Line | Kya karta hai |
|----------|------|---------------|
| `_saveAgentList()` | 26 | Agent list localStorage mein save karta hai |
| `_activeAgent()` | 31 | Active agent config return karta hai |
| `_detectProviderFromKey()` | 76 | API key se provider detect karta hai (Gemini/Groq/OpenRouter/NVIDIA etc) |
| `agentKeyPreview()` | 150 | Key type karne par model list dikhata hai |
| `_buildErrorCard()` | 208 | Error card HTML banata hai |
| `connectAgent()` | 241 | Agent connect karta hai API key se |
| `_renderConnectedAgents()` | 277 | Connected agents list render karta hai |
| `_removeAgent()` | 312 | Agent remove karta hai list se |
| `_updateAgentBarLabel()` | 325 | Agent bar label update karta hai |
| `_cmDetectProvider()` | 333 | Custom model dialog mein provider detect karta hai |
| `_cmKeyPreview()` | 345 | Custom model key preview dikhata hai |
| `openCustomModelDialog()` | 354 | Custom model dialog kholta hai |
| `closeCustomModelDialog()` | 376 | Custom model dialog band karta hai |
| `connectCustomModel()` | 387 | Custom model connect karta hai |
| `openAgentModal()` | 429 | Agent setup modal kholta hai |
| `closeAgentModal()` | 436 | Agent setup modal band karta hai |
| `disconnectAgent()` | 441 | Sab agents remove karta hai |
| `agentSelectFile()` | 455 | Agent ke liye file select karta hai |
| `_updateAgentFileSelector()` | 459 | Agent file selector update karta hai |
| `openAgentBar()` | 476 | Agent bar open karta hai |
| `_addAgentNavTab()` | 488 | Agent nav tab add karta hai |
| `_removeAgentNavTab()` | 500 | Agent nav tab remove karta hai |
| `_pingAgentModel()` | 505 | Agent connection status check karta hai |
| `closeAgentBar()` | 513 | Agent bar band karta hai |
| `_callAgentAPI()` | 528 | AI API call karta hai (sab providers support) |
| `_safeExtractJSON()` | 628 | JSON safely extract karta hai AI response se |
| `_runThreeStepAgent()` | 645 | 3-step agent engine chalata hai (analyse → plan → apply) |
| `_renderCard()` | 709 | — |
| `_extractBlock()` | 805 | — |
| `sendAgentPrompt()` | 920 | Agent ko prompt bhejta hai |
| `_showSplitFileReview()` | 1053 | Split file review card dikhata hai |
| `_showAgentDiffReview()` | 1134 | Diff review card dikhata hai |
| `_acceptPendingEdits()` | 1189 | Pending AI edits accept karta hai |
| `_cancelPendingEdits()` | 1217 | Pending AI edits cancel karta hai |
| `_showAgentUndoToast()` | 1229 | Agent undo toast dikhata hai |
| `_agentUndo()` | 1248 | Agent edit undo karta hai |
| `dismissWelcome()` | 1263 | Welcome screen dismiss karta hai |
| `editorUndo()` | 1271 | Editor undo karta hai |
| `editorRedo()` | 1272 | Editor redo karta hai |
| `closeAllTabs()` | 1277 | Sab file tabs close karta hai |
| `saveFileToRepo()` | 1299 | File GitHub repo mein save karta hai |
| `openNewProjectModal()` | 1322 | New project modal kholta hai |
| `closeNewProjectModal()` | 1333 | New project modal band karta hai |
| `npSwitchTab()` | 1336 | New project modal tab switch karta hai |
| `npSelectSave()` | 1347 | Save destination select karta hai |
| `npSelectVis()` | 1354 | Repo visibility select karta hai |
| `_npLoadReposForSelect()` | 1359 | Repos load karta hai new project modal mein |
| `createNewProject()` | 1373 | Naya project create karta hai |
| `_getBlankContentForFile()` | 1414 | File type ke hisab se blank content deta hai |
| `createGithubRepo()` | 1426 | Naya GitHub repo create karta hai |
| `_showRepoCreatedLink()` | 1455 | Repo created success dialog dikhata hai |
| `_showRepoProgress()` | 1491 | Repo load progress bar dikhata hai |
| `_hideRepoProgress()` | 1498 | Repo load progress bar hide karta hai |

---

## 💬 `modules/chat.js`
**Chat — Inline Chat, Canvas, Diff, Python**

| Function | Line | Kya karta hai |
|----------|------|---------------|
| `_autoChatName()` | 8 | Chat session ka auto naam banata hai |
| `closeChatPanel()` | 15 | Chat panel band karta hai |
| `renameChatSession()` | 21 | Chat session rename karta hai |
| `_updateChatFileSelector()` | 30 | Chat file selector update karta hai |
| `_chatTime()` | 47 | Current time string return karta hai |
| `_chatScrollBottom()` | 52 | Chat messages bottom pe scroll karta hai |
| `_appendChatMsg()` | 58 | Chat mein message add karta hai |
| `_showChatTyping()` | 112 | Typing indicator dikhata hai |
| `_hideChatTyping()` | 126 | Typing indicator hide karta hai |
| `_buildFixCard()` | 132 | Fix/Apply card banata hai chat mein |
| `_buildSplitCard()` | 176 | Split file card banata hai chat mein |
| `_applyChatFix()` | 217 | Chat se code fix apply karta hai editor mein |
| `_searchCodeSections()` | 281 | Code mein relevant sections dhundhta hai |
| `sendChatMessage()` | 350 | Chat message bhejta hai AI ko |
| `_buildHistoryForAPI()` | 568 | API ke liye chat history banata hai |
| `_inlineClearHistory()` | 586 | Inline chat history clear karta hai |
| `toggleInlineChat()` | 589 | Inline chat panel open/close karta hai |
| `openInlineChat()` | 597 | Inline chat panel kholta hai |
| `_inlineClearChatUI()` | 641 | Inline chat UI clear karta hai |
| `closeInlineChat()` | 658 | Inline chat band karta hai |
| `_inlineChatScroll()` | 697 | Inline chat scroll bottom karta hai |
| `_renderMsgHTML()` | 704 | Message text ko HTML mein render karta hai (markdown support) |
| `_canvasApplyReplace()` | 783 | Code canvas se replacement apply karta hai |
| `_canvasRetryMatch()` | 847 | Code canvas match retry karta hai |
| `_canvasDecodeCode()` | 858 | Canvas code decode karta hai |
| `_canvasCopy()` | 863 | Canvas code copy karta hai |
| `_canvasOpenInEditor()` | 875 | Canvas code editor mein kholta hai |
| `_inlineAppendMsg()` | 883 | Inline chat mein message add karta hai |
| `_inlineShowTyping()` | 949 | Inline typing indicator dikhata hai |
| `_inlineLogActivity()` | 1010 | Inline activity log update karta hai |
| `_inlineUpdateTypingStatus()` | 1030 | Inline typing status update karta hai |
| `_inlineHideTyping()` | 1039 | Inline typing indicator hide karta hai |
| `_tryParseJSON()` | 1091 | JSON parse karne ki koshish karta hai |
| `sendInlineChat()` | 1133 | Inline chat message bhejta hai AI ko |
| `_geminiWarnInChat()` | 1391 | Gemini rate limit warning dikhata hai |
| `_geminiShowCountdown()` | 1413 | Gemini countdown timer dikhata hai |
| `_buildInlineReorganizeCard()` | 1462 | Reorganize card banata hai full diff ke saath |
| `_applyInlineReorganize()` | 1500 | Inline reorganize apply karta hai |
| `_buildDiffHTML()` | 1529 | Diff HTML banata hai old vs new lines |
| `_clearEditorDiffMarkers()` | 1569 | Editor diff markers remove karta hai |
| `_showEditorDiffMarkers()` | 1581 | Editor mein diff highlights dikhata hai |
| `_buildInlineEditCard()` | 1640 | Inline edit card banata hai |
| `_applyInlineEdits()` | 1699 | Inline edits editor mein apply karta hai |
| `_showApplyError()` | 1947 | Apply error card dikhata hai |
| `_agentUndoLast()` | 1966 | Last agent edit undo karta hai |
| `_inlineReportNotWorking()` | 1993 | Not working feedback bhejta hai AI ko |
| `_inlineConfirmWorking()` | 2060 | Working confirmation deta hai AI ko |
| `_applyInlineSplit()` | 2070 | Inline split files apply karta hai |
| `_applyInlineNewFile()` | 2081 | Inline new file apply karta hai |
| `_buildConfirmCard()` | 2092 | Confirm/decline card banata hai |
| `_inlinePopulateModels()` | 2144 | Model dropdown populate karta hai |
| `_inlineToggleModelDropdown()` | 2154 | Model dropdown toggle karta hai |
| `_inlineCloseModelDropdown()` | 2174 | Model dropdown band karta hai |
| `_inlineRenderModelDropdown()` | 2186 | Model dropdown render karta hai |
| `_inlineSwitchModel()` | 2255 | Active model switch karta hai |
| `_inlinePopulateTabs()` | 2269 | File tabs dropdown populate karta hai |
| `_inlineToggleFileDropdown()` | 2274 | File dropdown toggle karta hai |
| `_inlineCloseFileDropdown()` | 2297 | File dropdown band karta hai |
| `_inlineRenderFileDropdown()` | 2311 | File dropdown render karta hai |
| `_inlineTriggerAttach()` | 2402 | File attachment trigger karta hai |
| `_inlineClearAttach()` | 2437 | Attachment clear karta hai |
| `_showChatModeToast()` | 2454 | Chat mode toast dikhata hai |
| `_toggleChatMode()` | 2546 | Chat/Edit mode toggle karta hai |
| `_toggleChatCodeAccess()` | 2573 | Code access toggle karta hai |
| `_toggleChatFullscreen()` | 2586 | Chat fullscreen toggle karta hai (header+tabs ke neeche) |
| `toggleAnimations()` | 2606 | CSS animations on/off karta hai |
| `desktopZoomIn()` | 2630 | Desktop editor zoom in karta hai |
| `desktopZoomOut()` | 2639 | Desktop editor zoom out karta hai |
| `togglePlainTextMode()` | 2648 | Plain text / formatted mode toggle karta hai |
| `_toggleLangMode()` | 2679 | HTML/Python language toggle karta hai |
| `_setLangMode()` | 2684 | Language mode set karta hai |
| `_pyShowOutputPanel()` | 2790 | Python output panel dikhata hai |
| `_pyEnsureLoaded()` | 2798 | Pyodide runtime load karta hai (lazy) |
| `_pyRunCode()` | 2840 | Python code run karta hai Pyodide se |
| `_pyAppendLine()` | 2923 | Python output mein line add karta hai |

---

## 📁 File Structure

```
codx/
├── index.html          ← Sirf HTML skeleton + imports
├── api/
│   └── nvidia.js       ← NVIDIA NIM CORS proxy
└── modules/
    ├── styles.css      ← Poora CSS (themes, layouts, animations)
    ├── core.js         ← Editor, tabs, files, theme, keyboard
    ├── github.js       ← GitHub sync, commit, file tree
    ├── agent.js        ← AI agent, providers, models, dialogs
    └── chat.js         ← Inline chat, canvas, diff, Python runner
```

## 🔧 Future Update Guide

| Kya update karna hai | Kaun si file |
|----------------------|-------------|
| UI theme / colors / animations | `modules/styles.css` |
| Editor behavior, tabs, file save | `modules/core.js` |
| GitHub sync, commit, file tree | `modules/github.js` |
| AI models, providers, agent edits | `modules/agent.js` |
| Chat UI, diff, Python runner | `modules/chat.js` |
| HTML structure (modals, buttons) | `index.html` |
| NVIDIA API proxy | `api/nvidia.js` |
