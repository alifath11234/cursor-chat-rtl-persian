/* === CURSOR-CHAT-RTL-JS active === */
/* v1.1.0 - ALI FATHNEJAT (fork of yechielby/cursor-chat-rtl-extension)
   ⇄  = RTL for Persian/Arabic/Hebrew chat text
   </> = RTL for code blocks & Monaco inside agent chat only */
(function() {
    var BTN_ID = 'cursor-rtl-toggle-btn';
    var CODE_BTN_ID = 'cursor-rtl-code-toggle-btn';
    var BODY_CLASS = 'cursor-chat-rtl';
    var BODY_CLASS_CODE = 'cursor-chat-rtl-code';
    var STORAGE_KEY = 'cursor-chat-rtl-active';
    var STORAGE_KEY_CODE = 'cursor-chat-rtl-code-active';
    var MARK_ATTR = 'data-cursor-rtl';
    var MARK_CODE_ATTR = 'data-cursor-rtl-code';
    var LOG = '[Cursor RTL v1.1.0]';

    var TOOLBAR_SELECTORS = [
        '.editor-actions .monaco-action-bar > ul.actions-container[aria-label="Editor actions"]',
        '.auxiliary-bar-title-hide-toolbar .monaco-action-bar > ul.actions-container[role="toolbar"]',
        '.monaco-action-bar > ul.actions-container[role="toolbar"]'
    ];

    var NEW_CHAT_COMMAND_IDS = [
        'composer.createNewComposerTab',
        'auxiliaryBar.newAgentMenu',
        'composer.newAgentChat'
    ];

    var TEXT_TAGS = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, th, td';
    var LIST_TAGS = 'ul, ol';

    /* Chat scope — code toggle never leaves agent chat */
    var CHAT_SCOPE = '.composer-rendered-message, .composer-human-message';

    var CODE_BLOCK_SELECTORS = [
        '.composer-rendered-message pre',
        '.composer-rendered-message .markdown-lexical-editor-code-block',
        '.composer-rendered-message .composer-code-block-container',
        '.composer-rendered-message .markdown-code-outer-container',
        '.composer-rendered-message .cursor-code-block-content',
        '.composer-rendered-message .composer-message-codeblock',
        '.composer-rendered-message .monaco-editor'
    ].join(', ');

    /* Exclude from text scanner */
    var EXCLUDE = [
        '.monaco-editor',
        '.ProseMirror',
        '.plan-editor',
        '.ui-plan-editor',
        'code',
        'pre',
        '.xterm',
        '.markdown-lexical-editor-code-block',
        '.composer-code-block-container',
        '.markdown-code-outer-container',
        '.cursor-code-block-content',
        '.composer-message-codeblock',
        '.composer-diff-block',
        '.composer-terminal-output',
        '.interactive-result-code-block'
    ].join(', ');

    var RTL_CHARS = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u077F\u0780-\u07BF\u08A0-\u08FF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFE]/;

    function isRtlActive() {
        return document.body && document.body.classList.contains(BODY_CLASS);
    }

    function isCodeRtlActive() {
        return document.body && document.body.classList.contains(BODY_CLASS_CODE);
    }

    function isExcluded(el) {
        return !el || !el.closest || !!el.closest(EXCLUDE);
    }

    function inChatScope(el) {
        return el && el.closest && !!el.closest(CHAT_SCOPE);
    }

    function hasRtlText(text) {
        return RTL_CHARS.test(text || '');
    }

    function mark(el, dir) {
        if (el.getAttribute('dir') !== dir) el.setAttribute('dir', dir);
        if (!el.hasAttribute(MARK_ATTR)) el.setAttribute(MARK_ATTR, 'true');
    }

    function unmark(el) {
        el.removeAttribute('dir');
        el.removeAttribute(MARK_ATTR);
    }

    function markCode(el) {
        el.setAttribute('dir', 'rtl');
        el.setAttribute(MARK_CODE_ATTR, 'true');
    }

    function unmarkCode(el) {
        el.removeAttribute('dir');
        el.removeAttribute(MARK_CODE_ATTR);
    }

    function clearAllManaged() {
        var managed = document.querySelectorAll('[' + MARK_ATTR + ']');
        for (var i = 0; i < managed.length; i++) unmark(managed[i]);
    }

    function clearAllCodeManaged() {
        var managed = document.querySelectorAll('[' + MARK_CODE_ATTR + ']');
        for (var i = 0; i < managed.length; i++) unmarkCode(managed[i]);
    }

    function scanText() {
        if (!isRtlActive()) return;

        var nodes = document.querySelectorAll(TEXT_TAGS);
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            if (hasRtlText(el.textContent)) {
                if (isExcluded(el)) continue;
                mark(el, 'rtl');
            } else if (el.hasAttribute(MARK_ATTR)) {
                unmark(el);
            }
        }

        var lists = document.querySelectorAll(LIST_TAGS);
        for (var j = 0; j < lists.length; j++) {
            var list = lists[j];
            var items = list.querySelectorAll(':scope > li');
            if (items.length === 0) continue;
            var rtlItems = 0;
            for (var k = 0; k < items.length; k++) {
                if (hasRtlText(items[k].textContent)) rtlItems++;
            }
            if (rtlItems * 2 > items.length) {
                if (isExcluded(list)) continue;
                mark(list, 'rtl');
            } else if (list.hasAttribute(MARK_ATTR)) {
                unmark(list);
            }
        }
    }

    function scanCode() {
        if (!isCodeRtlActive()) return;

        var blocks = document.querySelectorAll(CODE_BLOCK_SELECTORS);
        for (var i = 0; i < blocks.length; i++) {
            var el = blocks[i];
            if (!inChatScope(el)) continue;
            markCode(el);
        }
    }

    function scan() {
        scanText();
        scanCode();
    }

    function applyBodyClassesFromStorage() {
        if (!document.body) return;
        if (localStorage.getItem(STORAGE_KEY) === 'true') {
            document.body.classList.add(BODY_CLASS);
        }
        if (localStorage.getItem(STORAGE_KEY_CODE) === 'true') {
            document.body.classList.add(BODY_CLASS_CODE);
        }
    }

    function findNewChatButton() {
        for (var t = 0; t < TOOLBAR_SELECTORS.length; t++) {
            var containers = document.querySelectorAll(TOOLBAR_SELECTORS[t]);
            for (var c = 0; c < containers.length; c++) {
                for (var i = 0; i < NEW_CHAT_COMMAND_IDS.length; i++) {
                    var li = containers[c].querySelector('li.action-item[data-command-id="' + NEW_CHAT_COMMAND_IDS[i] + '"]');
                    if (li) return li;
                }
            }
        }
        return null;
    }

    function createToolbarButton(id, label, title, activeClass, isActive, onClick) {
        var btn = document.createElement('a');
        btn.id = id;
        btn.className = 'action-label' + (label ? ' ' + label : '');
        btn.title = title;
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
        if (isActive()) btn.classList.add(activeClass);
        btn.addEventListener('click', onClick);
        return btn;
    }

    function tryInsertButtons() {
        var firstLi = findNewChatButton();
        if (!firstLi) return;

        /* ⇄ RTL text toggle */
        if (!document.getElementById(BTN_ID)) {
            var rtlLi = document.createElement('li');
            rtlLi.className = 'action-item';
            rtlLi.setAttribute('role', 'presentation');

            var rtlBtn = createToolbarButton(
                BTN_ID, '', 'Toggle RTL for chat text (Persian/Arabic/Hebrew)',
                'cursor-rtl-active', isRtlActive,
                function(e) {
                    e.preventDefault();
                    var on = document.body.classList.toggle(BODY_CLASS);
                    rtlBtn.classList.toggle('cursor-rtl-active', on);
                    localStorage.setItem(STORAGE_KEY, on ? 'true' : 'false');
                    console.log(LOG, 'text RTL:', on ? 'ON' : 'OFF');
                    if (on) scanText(); else clearAllManaged();
                }
            );
            rtlBtn.textContent = '\u21C4';

            rtlLi.appendChild(rtlBtn);
            firstLi.insertAdjacentElement('afterend', rtlLi);
            firstLi = rtlLi;
            console.log(LOG, 'text toggle inserted');
        } else {
            firstLi = document.getElementById(BTN_ID).closest('li.action-item') || firstLi;
        }

        /* </> Code/Monaco RTL toggle (chat only) */
        if (!document.getElementById(CODE_BTN_ID)) {
            var codeLi = document.createElement('li');
            codeLi.className = 'action-item';
            codeLi.setAttribute('role', 'presentation');

            var codeBtn = createToolbarButton(
                CODE_BTN_ID, 'codicon codicon-code',
                'Toggle RTL for code blocks & Monaco in agent chat',
                'cursor-rtl-code-active', isCodeRtlActive,
                function(e) {
                    e.preventDefault();
                    var on = document.body.classList.toggle(BODY_CLASS_CODE);
                    codeBtn.classList.toggle('cursor-rtl-code-active', on);
                    localStorage.setItem(STORAGE_KEY_CODE, on ? 'true' : 'false');
                    console.log(LOG, 'code RTL:', on ? 'ON' : 'OFF');
                    if (on) scanCode(); else clearAllCodeManaged();
                }
            );

            codeLi.appendChild(codeBtn);
            firstLi.insertAdjacentElement('afterend', codeLi);
            console.log(LOG, 'code toggle inserted');
        }
    }

    var scanTimer = null;
    function scheduleScan() {
        if (scanTimer) return;
        scanTimer = setTimeout(function() {
            scanTimer = null;
            tryInsertButtons();
            scan();
        }, 100);
    }

    var observedRoots = (typeof WeakSet === 'function') ? new WeakSet() : null;

    function attachObserver(root) {
        if (!root) return;
        if (observedRoots) {
            if (observedRoots.has(root)) return;
            observedRoots.add(root);
        }
        new MutationObserver(scheduleScan).observe(root, {
            childList: true, subtree: true, characterData: true
        });
    }

    function discoverShadowRoots() {
        var all = document.querySelectorAll('*');
        for (var i = 0; i < all.length; i++) {
            if (all[i].shadowRoot) attachObserver(all[i].shadowRoot);
        }
    }

    function start() {
        console.log(LOG, 'started — by ALI FATHNEJAT');
        applyBodyClassesFromStorage();
        tryInsertButtons();
        scan();
        attachObserver(document.body);
        discoverShadowRoots();
        setInterval(discoverShadowRoots, 5000);
    }

    if (document.readyState !== 'loading') start();
    else document.addEventListener('DOMContentLoaded', start);
})();
