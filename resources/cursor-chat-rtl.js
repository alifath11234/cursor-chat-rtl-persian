/* === CURSOR-CHAT-RTL-JS active === */
/* v1.2.3 - fix plan crash: no infinite observer loop, CSS-first for plan */
(function() {
    var BTN_ID = 'cursor-rtl-toggle-btn';
    var CODE_BTN_ID = 'cursor-rtl-code-toggle-btn';
    var PLAN_BTN_ID = 'cursor-rtl-plan-toggle-btn';
    var BODY_CLASS = 'cursor-chat-rtl';
    var BODY_CLASS_CODE = 'cursor-chat-rtl-code';
    var BODY_CLASS_PLAN = 'cursor-chat-rtl-plan';
    var STORAGE_KEY = 'cursor-chat-rtl-active';
    var STORAGE_KEY_CODE = 'cursor-chat-rtl-code-active';
    var STORAGE_KEY_PLAN = 'cursor-chat-rtl-plan-active';
    var MARK_ATTR = 'data-cursor-rtl';
    var MARK_CODE_ATTR = 'data-cursor-rtl-code';
    var MARK_PLAN_ATTR = 'data-cursor-rtl-plan';
    var RLM_ATTR = 'data-cursor-rtl-rlm';
    var LOG = '[Cursor RTL v1.2.3]';
    var RLM = '\u200F';
    var LTR_LEAD = /^[\s]*[A-Za-z@#]/;

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

    var CONTAINER_SELECTORS = [
        '.composer-rendered-message .markdown-lexical-editor-container',
        '.composer-rendered-message .markdown-section',
        '.composer-rendered-message .markdown-root'
    ];

    var TEXT_TAGS = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, th, td, div';
    var LIST_TAGS = 'ul, ol';
    var INPUT_SELECTORS = [
        '.aislash-editor-input',
        '.aislash-editor-input-readonly',
        '.ui-prompt-input-editor__input',
        '.ui-prompt-input-tiptap-readonly__content',
        '.composer-bar-input .ProseMirror',
        '.composer-input-container [contenteditable="true"]'
    ].join(', ');

    var INPUT_ROOT = '.full-input-box, .composer-bar-input, .composer-input-container';

    var CHAT_SCOPE = '.composer-rendered-message, .composer-human-message';

    var PLAN_SCOPE = '.plan-editor, .ui-plan-editor, .composer-plan-container';
    var PLAN_CONTAINER_SELECTORS = [
        '.plan-editor__richtext',
        '.plan-editor__richtext-content',
        '.ui-plan-editor',
        '.composer-plan-markdown-container',
        '.composer-create-plan-markdown',
        '.composer-plan-content'
    ];
    var PLAN_MARKDOWN_SELECTORS = [
        '.markdown-lexical-editor-container',
        '.markdown-section',
        '.markdown-root'
    ];
    var PLAN_TEXT_TAGS = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, th, td, div';
    var PLAN_UI_EXCLUDE = [
        '.plan-build-button',
        '.plan-breadcrumb-controls',
        '.plan-breadcrumb-mode-dropdown',
        '.plan-execution-action-button',
        '.plan-execution-message-container',
        '.plan-todos-section__phase-action',
        '.plan-todo__remove',
        '.plan-todo__assignment',
        '.composer-plan-buttons',
        '.composer-plan-header',
        '.composer-plan-title-container',
        '.composer-plan-agents-list',
        '.composer-plan-collapse-button-container',
        '.composer-plan-expand-button-container',
        '.ui-plan-tab-header',
        '.ui-plan__todos-phase',
        '.ui-plan__todo-row',
        '.ui-plan__references-list',
        '.ui-plan-tray'
    ].join(', ');

    var CODE_BLOCK_SELECTORS = [
        '.composer-rendered-message pre',
        '.composer-rendered-message .markdown-lexical-editor-code-block',
        '.composer-rendered-message .composer-code-block-container',
        '.composer-rendered-message .markdown-code-outer-container',
        '.composer-rendered-message .cursor-code-block-content',
        '.composer-rendered-message .composer-message-codeblock',
        '.composer-rendered-message .monaco-editor'
    ].join(', ');

    var EXCLUDE = [
        '.monaco-editor',
        '.plan-editor',
        '.ui-plan-editor',
        '.composer-plan-container',
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

    function isPlanRtlActive() {
        return document.body && document.body.classList.contains(BODY_CLASS_PLAN);
    }

    function isExcluded(el) {
        return !el || !el.closest || !!el.closest(EXCLUDE);
    }

    function inChatScope(el) {
        return el && el.closest && !!el.closest(CHAT_SCOPE);
    }

    function inPlanScope(el) {
        return el && el.closest && !!el.closest(PLAN_SCOPE);
    }

    function isPlanUiElement(el) {
        return el && el.closest && !!el.closest(PLAN_UI_EXCLUDE);
    }

    function inMarkdownContainer(el) {
        if (!el || !el.closest) return false;
        for (var i = 0; i < CONTAINER_SELECTORS.length; i++) {
            if (el.closest(CONTAINER_SELECTORS[i].replace('.composer-rendered-message ', ''))) return true;
        }
        return !!el.closest('.markdown-lexical-editor-container, .markdown-section, .markdown-root');
    }

    function isInputElement(el) {
        return el && el.closest && !!el.closest(INPUT_ROOT);
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
        el.removeAttribute(RLM_ATTR);
    }

    function markCode(el) {
        el.setAttribute('dir', 'rtl');
        el.setAttribute(MARK_CODE_ATTR, 'true');
    }

    function unmarkCode(el) {
        el.removeAttribute('dir');
        el.removeAttribute(MARK_CODE_ATTR);
    }

    function markPlan(el) {
        el.setAttribute('dir', 'rtl');
        el.setAttribute(MARK_PLAN_ATTR, 'true');
    }

    function unmarkPlan(el) {
        el.removeAttribute('dir');
        el.removeAttribute(MARK_PLAN_ATTR);
        el.removeAttribute(RLM_ATTR);
    }

    function firstTextNode(el) {
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        return walker.nextNode();
    }

    function prependRlm(el) {
        if (!el || el.getAttribute(RLM_ATTR) === 'true') return;
        if (el.isContentEditable || isInputElement(el)) return;
        var text = (el.textContent || '').replace(/^\u200F+/, '');
        if (!hasRtlText(text) || !LTR_LEAD.test(text)) return;
        var node = firstTextNode(el);
        if (!node) return;
        if (node.textContent.charAt(0) !== RLM) {
            node.textContent = RLM + node.textContent;
        }
        el.setAttribute(RLM_ATTR, 'true');
    }

    function prependRlmPlan(el) {
        if (!el || el.getAttribute(RLM_ATTR) === 'true') return;
        if (isPlanUiElement(el)) return;
        var text = (el.textContent || '').replace(/^\u200F+/, '');
        if (!hasRtlText(text) || !LTR_LEAD.test(text)) return;
        var node = firstTextNode(el);
        if (!node) return;
        if (node.textContent.charAt(0) !== RLM) {
            node.textContent = RLM + node.textContent;
        }
        el.setAttribute(RLM_ATTR, 'true');
    }

    function fixInputDirection(el) {
        if (!el || !isRtlActive()) return;
        mark(el, 'rtl');
        var inner = el.querySelectorAll('p, [dir]');
        for (var i = 0; i < inner.length; i++) {
            if (isInputElement(inner[i]) || el.contains(inner[i])) {
                inner[i].setAttribute('dir', 'rtl');
            }
        }
    }

    function clearAllManaged() {
        var managed = document.querySelectorAll('[' + MARK_ATTR + ']');
        for (var i = 0; i < managed.length; i++) unmark(managed[i]);
    }

    function clearAllCodeManaged() {
        var managed = document.querySelectorAll('[' + MARK_CODE_ATTR + ']');
        for (var i = 0; i < managed.length; i++) unmarkCode(managed[i]);
    }

    function clearAllPlanManaged() {
        var managed = document.querySelectorAll('[' + MARK_PLAN_ATTR + ']');
        for (var i = 0; i < managed.length; i++) unmarkPlan(managed[i]);
    }

    function scanContainers() {
        if (!isRtlActive()) return;
        for (var i = 0; i < CONTAINER_SELECTORS.length; i++) {
            var containers = document.querySelectorAll(CONTAINER_SELECTORS[i]);
            for (var j = 0; j < containers.length; j++) {
                var c = containers[j];
                if (hasRtlText(c.textContent)) {
                    mark(c, 'rtl');
                    prependRlm(c);
                }
            }
        }
    }

    function scanInputs() {
        if (!isRtlActive()) return;
        var inputs = document.querySelectorAll(INPUT_SELECTORS);
        for (var i = 0; i < inputs.length; i++) {
            fixInputDirection(inputs[i]);
        }
    }

    function scanText() {
        if (!isRtlActive()) return;

        scanContainers();

        var nodes = document.querySelectorAll(TEXT_TAGS);
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            if (!hasRtlText(el.textContent)) {
                if (el.hasAttribute(MARK_ATTR) && !inMarkdownContainer(el)) unmark(el);
                continue;
            }
            if (isExcluded(el)) continue;
            if (el.tagName === 'DIV' && !inMarkdownContainer(el) && !el.closest(INPUT_SELECTORS)) continue;
            mark(el, 'rtl');
            prependRlm(el);
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

        scanInputs();
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

    function shouldSkipPlanEl(el) {
        if (!el || el.nodeType !== 1) return true;
        if (isPlanUiElement(el)) return true;
        var tag = el.tagName;
        if (tag === 'CODE' || tag === 'PRE') return true;
        if (el.closest('code, pre, .monaco-editor')) return true;
        return false;
    }

    var planEnforceLock = false;
    var planDirObservers = (typeof WeakMap === 'function') ? new WeakMap() : null;
    var planScrollCaptureBound = false;
    var planScanTimer = null;

    function fixPlanLtrInRoot(root) {
        if (!root || planEnforceLock || !isPlanRtlActive()) return;
        planEnforceLock = true;
        try {
            markPlan(root);
            var ltr = root.querySelectorAll('[dir="ltr"]');
            for (var i = 0; i < ltr.length; i++) {
                var el = ltr[i];
                if (shouldSkipPlanEl(el)) continue;
                if (el.getAttribute('dir') !== 'ltr') continue;
                el.setAttribute('dir', 'rtl');
                el.setAttribute(MARK_PLAN_ATTR, 'true');
            }
        } finally {
            planEnforceLock = false;
        }
    }

    function scanPlan() {
        if (!isPlanRtlActive() || planEnforceLock) return;
        var roots = document.querySelectorAll(PLAN_SCOPE);
        for (var r = 0; r < roots.length; r++) {
            attachPlanDirObserver(roots[r]);
            fixPlanLtrInRoot(roots[r]);
        }
    }

    function attachPlanDirObserver(root) {
        if (!root || !isPlanRtlActive()) return;
        if (planDirObservers && planDirObservers.has(root)) return;

        var obs = new MutationObserver(function(mutations) {
            if (!isPlanRtlActive() || planEnforceLock) return;
            var needFix = false;
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.type === 'attributes' && m.attributeName === 'dir') {
                    if (m.target.getAttribute && m.target.getAttribute('dir') === 'ltr') {
                        needFix = true;
                    }
                } else if (m.type === 'childList' && m.addedNodes.length) {
                    needFix = true;
                }
            }
            if (needFix) schedulePlanScan();
        });

        obs.observe(root, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['dir']
        });

        if (planDirObservers) planDirObservers.set(root, obs);
    }

    function schedulePlanScan() {
        if (!isPlanRtlActive()) return;
        if (planScanTimer) return;
        planScanTimer = setTimeout(function() {
            planScanTimer = null;
            scanPlan();
        }, 150);
    }

    function bindPlanScrollCapture() {
        if (planScrollCaptureBound) return;
        planScrollCaptureBound = true;
        document.addEventListener('scroll', function(e) {
            if (!isPlanRtlActive() || planEnforceLock) return;
            if (!inPlanScope(e.target)) return;
            schedulePlanScan();
        }, true);
    }

    function bindPlanWatchers() {
        bindPlanScrollCapture();
    }

    function stopPlanWatchers() {
        if (planScanTimer) {
            clearTimeout(planScanTimer);
            planScanTimer = null;
        }
    }

    function scan() {
        scanText();
        scanCode();
        if (isPlanRtlActive()) schedulePlanScan();
    }

    function bindInputHandlers() {
        document.addEventListener('focusin', function(e) {
            if (!isRtlActive()) return;
            var t = e.target;
            if (t && t.matches && t.matches(INPUT_SELECTORS)) {
                fixInputDirection(t);
            }
        }, true);
        document.addEventListener('input', function(e) {
            if (!isRtlActive()) return;
            var t = e.target;
            if (t && t.matches && t.matches(INPUT_SELECTORS)) {
                fixInputDirection(t);
            }
        }, true);
    }

    function applyBodyClassesFromStorage() {
        if (!document.body) return;
        if (localStorage.getItem(STORAGE_KEY) === 'true') {
            document.body.classList.add(BODY_CLASS);
        }
        if (localStorage.getItem(STORAGE_KEY_CODE) === 'true') {
            document.body.classList.add(BODY_CLASS_CODE);
        }
        if (localStorage.getItem(STORAGE_KEY_PLAN) === 'true') {
            document.body.classList.add(BODY_CLASS_PLAN);
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
        } else {
            firstLi = document.getElementById(BTN_ID).closest('li.action-item') || firstLi;
        }

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
            firstLi = codeLi;
        } else {
            firstLi = document.getElementById(CODE_BTN_ID).closest('li.action-item') || firstLi;
        }

        if (!document.getElementById(PLAN_BTN_ID)) {
            var planLi = document.createElement('li');
            planLi.className = 'action-item';
            planLi.setAttribute('role', 'presentation');
            var planBtn = createToolbarButton(
                PLAN_BTN_ID, 'codicon codicon-checklist',
                'Toggle RTL for Plan details page',
                'cursor-rtl-plan-active', isPlanRtlActive,
                function(e) {
                    e.preventDefault();
                    var on = document.body.classList.toggle(BODY_CLASS_PLAN);
                    planBtn.classList.toggle('cursor-rtl-plan-active', on);
                    localStorage.setItem(STORAGE_KEY_PLAN, on ? 'true' : 'false');
                    console.log(LOG, 'plan RTL:', on ? 'ON' : 'OFF');
                    if (on) {
                        bindPlanWatchers();
                        scanPlan();
                    } else {
                        stopPlanWatchers();
                        clearAllPlanManaged();
                    }
                }
            );
            planLi.appendChild(planBtn);
            firstLi.insertAdjacentElement('afterend', planLi);
            if (isPlanRtlActive()) bindPlanWatchers();
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
        bindInputHandlers();
        if (isPlanRtlActive()) bindPlanWatchers();
        tryInsertButtons();
        scan();
        attachObserver(document.body);
        discoverShadowRoots();
        setInterval(discoverShadowRoots, 5000);
    }

    if (document.readyState !== 'loading') start();
    else document.addEventListener('DOMContentLoaded', start);
})();
