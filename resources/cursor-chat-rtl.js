/* === CURSOR-CHAT-RTL-JS active === */
/* v1.2.11 - RTL for Agents Window answered question card (data-testid) (CSS-only) */
(function() {
    var BTN_CLASS = 'cursor-rtl-toggle-btn';
    var CODE_BTN_CLASS = 'cursor-rtl-code-toggle-btn';
    var PLAN_BTN_CLASS = 'cursor-rtl-plan-toggle-btn';
    var BTN_MARK = 'data-cursor-rtl-btn';
    var GLASS_BAR_ID = 'cursor-rtl-glass-bar';
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
    var LOG = '[Cursor RTL v1.2.11]';
    var RLM = '\u200F';
    var LTR_LEAD = /^[\s]*[A-Za-z@#]/;

    var TOOLBAR_SELECTORS = [
        '.editor-actions .monaco-action-bar > ul.actions-container[aria-label="Editor actions"]',
        '.auxiliary-bar-title-hide-toolbar .monaco-action-bar > ul.actions-container[role="toolbar"]',
        '.auxiliary-bar-title--agent-mode .title-actions .monaco-action-bar > ul.actions-container',
        '.part.auxiliarybar .title-actions .monaco-action-bar > ul.actions-container',
        '.monaco-action-bar > ul.actions-container[role="toolbar"]',
        '.monaco-action-bar > ul.actions-container[aria-label="Editor actions"]'
    ];

    /* Agents Window = Glass conversation header — NOT agents list sidebar */
    var AGENT_ACTION_HOSTS = [
        '.glass-agent-conversation-tiling__header-actions-persistent',
        '.glass-agent-conversation-tiling__header-actions',
        '.glass-agent-conversation-tiling__header',
        '.composer-sticky-title__actions',
        '.auxiliary-bar-title--agent-mode .title-actions'
    ];

    var GLASS_FALLBACK_HOSTS = [
        '.glass-agent-conversation-tiling__header',
        '.glass-agent-conversation-tiling__header-main',
        '[data-component="glass-titlebar"]',
        '.agent-conversation-composer__solid',
        '.composer-sticky-title'
    ];

    var WRONG_BUTTON_HOSTS = [
        '.agent-sidebar-header-actions',
        '.agent-tab-actions',
        '.agent-sidebar-header',
        '.agent-sidebar-header-top-row'
    ];

    var NEW_CHAT_COMMAND_IDS = [
        'composer.createNewComposerTab',
        'auxiliaryBar.newAgentMenu',
        'composer.newAgentChat',
        'composer.createNew',
        'workbench.action.backgroundComposer.createNewComposerTab'
    ];

    var CONTAINER_SELECTORS = [
        '.composer-rendered-message .markdown-lexical-editor-container',
        '.composer-rendered-message .markdown-section',
        '.composer-rendered-message .markdown-root',
        '.composer-human-message .markdown-lexical-editor-container',
        '.agent-conversation-tiling__tile .markdown-lexical-editor-container',
        '.agent-conversation-tiling__tile .markdown-section',
        '.agent-conversations .markdown-lexical-editor-container',
        '.agent-conversations .markdown-section'
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

    /* Agent chat scopes — classic composer + Glass Agents Window */
    var CHAT_SCOPE = [
        '.composer-rendered-message',
        '.composer-human-message',
        '.composer-human-message-container',
        '.agent-conversations',
        '.agent-conversation-tiling',
        '.agent-conversation-tiling__tile',
        '.glass-agent-conversation-tiling',
        '.glass-agent-conversation-tiling__tile',
        '.agent-conversation-composer__solid'
    ].join(', ');

    var IDE_CTA_SELECTOR = '[data-component="open-editor-window-cta"]';

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
        '.interactive-result-code-block',
        /* never touch MD file editor / preview */
        '.editor-instance',
        '.monaco-mouse-cursor-text',
        '.webview',
        '.webview-editor',
        '.notebook-editor',
        '.markdown-preview',
        '.file-tab-markdown-preview',
        '[data-mode-id="markdown"]',
        '.editor-group-container .editor-container'
    ].join(', ');

    var PREVIEW_EXCLUDE = [
        '.webview',
        '.webview-editor',
        '.notebook-editor',
        '.markdown-preview'
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

    function inAgentConversation(el) {
        return !!(el && el.closest && el.closest(CHAT_SCOPE));
    }

    function isFileEditorOrPreview(el) {
        if (!el || !el.closest) return false;
        if (inAgentConversation(el) || el.closest(PLAN_SCOPE)) return false;
        /* MD file Preview / webview — do not JS-mutate (CSS-only) */
        if (el.closest(PREVIEW_EXCLUDE)) return true;
        /* Monaco source editor outside chat */
        if (el.closest('.monaco-editor') && !inAgentConversation(el)) return true;
        /* Editor group file tabs outside agent conversation */
        if (el.closest('.editor-group-container') && !inAgentConversation(el)) return true;
        return false;
    }

    function inChatScope(el) {
        return inAgentConversation(el);
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

    function stripRlmFromEl(el) {
        if (!el) return;
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        var node;
        while ((node = walker.nextNode())) {
            if (node.textContent && node.textContent.indexOf(RLM) !== -1) {
                node.textContent = node.textContent.replace(/\u200F+/g, '');
            }
        }
        el.removeAttribute(RLM_ATTR);
    }

    function unmark(el) {
        if (el.hasAttribute(RLM_ATTR)) stripRlmFromEl(el);
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
        if (el.hasAttribute(RLM_ATTR)) stripRlmFromEl(el);
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
            if (isFileEditorOrPreview(el)) {
                if (el.hasAttribute(MARK_ATTR)) unmark(el);
                continue;
            }
            /* ONLY chat messages + inputs — never whole workbench / MD preview */
            if (!inChatScope(el) && !isInputElement(el)) {
                if (el.hasAttribute(MARK_ATTR)) unmark(el);
                continue;
            }
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
            if (isFileEditorOrPreview(list) || (!inChatScope(list) && !isInputElement(list))) {
                if (list.hasAttribute(MARK_ATTR)) unmark(list);
                continue;
            }
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

    /* Plan RTL is CSS-first. Avoid DOM dir mutation on scroll — it causes jump/drift. */
    function scanPlan() {
        if (!isPlanRtlActive()) return;
        var roots = document.querySelectorAll(PLAN_SCOPE);
        for (var r = 0; r < roots.length; r++) {
            var root = roots[r];
            if (!root.hasAttribute(MARK_PLAN_ATTR)) markPlan(root);
        }
    }

    function scan() {
        scanText();
        scanCode();
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

    function syncButtonStates() {
        var textOn = isRtlActive();
        var codeOn = isCodeRtlActive();
        var planOn = isPlanRtlActive();
        var texts = document.querySelectorAll('.' + BTN_CLASS);
        for (var i = 0; i < texts.length; i++) texts[i].classList.toggle('cursor-rtl-active', textOn);
        var codes = document.querySelectorAll('.' + CODE_BTN_CLASS);
        for (var j = 0; j < codes.length; j++) codes[j].classList.toggle('cursor-rtl-code-active', codeOn);
        var plans = document.querySelectorAll('.' + PLAN_BTN_CLASS);
        for (var k = 0; k < plans.length; k++) plans[k].classList.toggle('cursor-rtl-plan-active', planOn);
    }

    function hostHasButtons(host) {
        return !!(host && host.querySelector && host.querySelector('[' + BTN_MARK + ']'));
    }

    function findMonacoAnchors() {
        var anchors = [];
        var seen = [];

        function push(li) {
            if (!li) return;
            for (var s = 0; s < seen.length; s++) if (seen[s] === li) return;
            var ul = li.closest('ul.actions-container') || li.parentElement;
            if (hostHasButtons(ul)) return;
            seen.push(li);
            anchors.push({ mode: 'after', el: li });
        }

        for (var t = 0; t < TOOLBAR_SELECTORS.length; t++) {
            var containers = document.querySelectorAll(TOOLBAR_SELECTORS[t]);
            for (var c = 0; c < containers.length; c++) {
                for (var i = 0; i < NEW_CHAT_COMMAND_IDS.length; i++) {
                    var items = containers[c].querySelectorAll('li.action-item[data-command-id="' + NEW_CHAT_COMMAND_IDS[i] + '"]');
                    for (var n = 0; n < items.length; n++) push(items[n]);
                }
            }
        }

        for (var j = 0; j < NEW_CHAT_COMMAND_IDS.length; j++) {
            var all = document.querySelectorAll('li.action-item[data-command-id="' + NEW_CHAT_COMMAND_IDS[j] + '"]');
            for (var a = 0; a < all.length; a++) push(all[a]);
        }

        return anchors;
    }

    function removeWrongHostButtons() {
        for (var i = 0; i < WRONG_BUTTON_HOSTS.length; i++) {
            var hosts = document.querySelectorAll(WRONG_BUTTON_HOSTS[i]);
            for (var h = 0; h < hosts.length; h++) {
                var marked = hosts[h].querySelectorAll('[' + BTN_MARK + ']');
                for (var m = 0; m < marked.length; m++) {
                    var node = marked[m];
                    var li = node.closest ? node.closest('li.action-item') : null;
                    if (li && li.hasAttribute(BTN_MARK)) li.parentNode && li.parentNode.removeChild(li);
                    else if (node.parentNode) node.parentNode.removeChild(node);
                }
            }
        }
    }

    function findAgentHosts() {
        var hosts = [];
        var seen = [];
        for (var i = 0; i < AGENT_ACTION_HOSTS.length; i++) {
            var nodes = document.querySelectorAll(AGENT_ACTION_HOSTS[i]);
            for (var n = 0; n < nodes.length; n++) {
                var el = nodes[n];
                /* skip nested title-actions that already have monaco ul — use monaco path instead */
                if (el.classList && el.classList.contains('title-actions') &&
                    el.querySelector('ul.actions-container')) continue;
                var dup = false;
                for (var s = 0; s < seen.length; s++) if (seen[s] === el) { dup = true; break; }
                if (dup || hostHasButtons(el)) continue;
                seen.push(el);
                hosts.push({ mode: 'append', el: el });
            }
        }
        return hosts;
    }

    function createToolbarButton(btnClass, extraClass, title, activeClass, isActive, onClick) {
        var btn = document.createElement('a');
        btn.className = 'action-label ' + btnClass + (extraClass ? ' ' + extraClass : '');
        btn.setAttribute(BTN_MARK, 'true');
        btn.title = title;
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
        btn.setAttribute('aria-label', title);
        btn.style.webkitAppRegion = 'no-drag';
        btn.style.appRegion = 'no-drag';
        btn.style.pointerEvents = 'auto';
        if (isActive()) btn.classList.add(activeClass);
        btn.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();
        }, true);
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            onClick(e);
        }, true);
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onClick(e);
            }
        });
        return btn;
    }

    function wrapMonacoLi(btn) {
        var li = document.createElement('li');
        li.className = 'action-item';
        li.setAttribute('role', 'presentation');
        li.setAttribute(BTN_MARK, 'true');
        li.appendChild(btn);
        return li;
    }

    function onToggleText(e) {
        e.preventDefault();
        e.stopPropagation();
        var on = document.body.classList.toggle(BODY_CLASS);
        localStorage.setItem(STORAGE_KEY, on ? 'true' : 'false');
        syncButtonStates();
        console.log(LOG, 'text RTL:', on ? 'ON' : 'OFF');
        if (on) scanText(); else clearAllManaged();
    }

    function onToggleCode(e) {
        e.preventDefault();
        e.stopPropagation();
        var on = document.body.classList.toggle(BODY_CLASS_CODE);
        localStorage.setItem(STORAGE_KEY_CODE, on ? 'true' : 'false');
        syncButtonStates();
        console.log(LOG, 'code RTL:', on ? 'ON' : 'OFF');
        if (on) scanCode(); else clearAllCodeManaged();
    }

    function onTogglePlan(e) {
        e.preventDefault();
        e.stopPropagation();
        var on = document.body.classList.toggle(BODY_CLASS_PLAN);
        localStorage.setItem(STORAGE_KEY_PLAN, on ? 'true' : 'false');
        syncButtonStates();
        console.log(LOG, 'plan RTL:', on ? 'ON' : 'OFF');
        if (on) scanPlan(); else clearAllPlanManaged();
    }

    function buildButtonSet(asMonacoLi) {
        var rtlBtn = createToolbarButton(
            BTN_CLASS, '',
            'Toggle RTL for chat text (Persian/Arabic/Hebrew)',
            'cursor-rtl-active', isRtlActive, onToggleText
        );
        rtlBtn.textContent = '\u21C4';

        var codeBtn = createToolbarButton(
            CODE_BTN_CLASS, 'codicon codicon-code',
            'Toggle RTL for code blocks & Monaco in agent chat',
            'cursor-rtl-code-active', isCodeRtlActive, onToggleCode
        );

        var planBtn = createToolbarButton(
            PLAN_BTN_CLASS, 'cursor-rtl-plan-letter',
            'Toggle RTL for Plan / MD page',
            'cursor-rtl-plan-active', isPlanRtlActive, onTogglePlan
        );
        planBtn.textContent = 'P';

        if (!asMonacoLi) {
            var frag = document.createDocumentFragment();
            frag.appendChild(rtlBtn);
            frag.appendChild(codeBtn);
            frag.appendChild(planBtn);
            return frag;
        }

        var wrap = document.createDocumentFragment();
        wrap.appendChild(wrapMonacoLi(rtlBtn));
        wrap.appendChild(wrapMonacoLi(codeBtn));
        wrap.appendChild(wrapMonacoLi(planBtn));
        return wrap;
    }

    function insertIntoAnchor(anchor) {
        if (!anchor || !anchor.el) return;
        if (anchor.mode === 'after') {
            var ul = anchor.el.closest('ul.actions-container') || anchor.el.parentElement;
            if (hostHasButtons(ul)) return;
            var set = buildButtonSet(true);
            var nodes = [];
            while (set.firstChild) nodes.push(set.removeChild(set.firstChild));
            var ref = anchor.el;
            for (var i = 0; i < nodes.length; i++) {
                ref.insertAdjacentElement('afterend', nodes[i]);
                ref = nodes[i];
            }
            return;
        }
        if (anchor.mode === 'append') {
            if (hostHasButtons(anchor.el)) return;
            anchor.el.appendChild(buildButtonSet(false));
        }
    }

    function isGlassWindow() {
        if (document.querySelector('[data-component="glass-titlebar"]')) return true;
        if (document.querySelector('.glass-agent-conversation-tiling__header')) return true;
        if (document.querySelector('.agent-conversation-composer__solid')) return true;
        var wb = document.querySelector('.monaco-workbench');
        if (wb && /\bglass/i.test(wb.className)) return true;
        return false;
    }

    function createGlassBar() {
        var bar = document.createElement('div');
        bar.id = GLASS_BAR_ID;
        bar.setAttribute(BTN_MARK, 'true');
        bar.setAttribute('role', 'toolbar');
        bar.setAttribute('aria-label', 'Cursor RTL toggles');
        bar.style.webkitAppRegion = 'no-drag';
        bar.style.appRegion = 'no-drag';
        bar.style.pointerEvents = 'auto';
        bar.appendChild(buildButtonSet(false));
        return bar;
    }

    function ensureGlassFallbackBar() {
        var ideBtn = document.querySelector(IDE_CTA_SELECTOR);
        var bar = document.getElementById(GLASS_BAR_ID);

        /* Prefer: place RTL toggles immediately before the IDE button */
        if (ideBtn && ideBtn.parentElement) {
            if (!bar) bar = createGlassBar();
            bar.classList.remove('cursor-rtl-glass-bar--floating');
            bar.classList.add('cursor-rtl-glass-bar--beside-ide');
            if (bar.parentElement !== ideBtn.parentElement || bar.nextSibling !== ideBtn) {
                ideBtn.parentElement.insertBefore(bar, ideBtn);
                console.log(LOG, 'RTL bar placed beside IDE button');
            }
            return;
        }

        if (!isGlassWindow()) {
            if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
            return;
        }

        /* Fallback floating only if IDE CTA not in DOM yet */
        if (!bar) {
            bar = createGlassBar();
            bar.classList.add('cursor-rtl-glass-bar--floating');
            document.body.appendChild(bar);
            console.log(LOG, 'Glass floating bar (IDE CTA not found yet)');
        } else if (!document.body.contains(bar) && !bar.classList.contains('cursor-rtl-glass-bar--beside-ide')) {
            bar.classList.add('cursor-rtl-glass-bar--floating');
            document.body.appendChild(bar);
        }
    }
    function tryInsertButtons() {
        removeWrongHostButtons();
        var anchors = findMonacoAnchors().concat(findAgentHosts());
        for (var i = 0; i < anchors.length; i++) insertIntoAnchor(anchors[i]);
        ensureGlassFallbackBar();
        syncButtonStates();
    }

    function anyRtlOn() {
        return isRtlActive() || isCodeRtlActive() || isPlanRtlActive();
    }

    var scanTimer = null;
    function scheduleScan() {
        if (scanTimer) return;
        scanTimer = setTimeout(function() {
            scanTimer = null;
            tryInsertButtons();
            if (anyRtlOn()) {
                scan();
                if (isPlanRtlActive()) scanPlan();
            }
        }, 250);
    }

    var observedRoots = (typeof WeakSet === 'function') ? new WeakSet() : null;

    function attachObserver(root) {
        if (!root) return;
        if (observedRoots) {
            if (observedRoots.has(root)) return;
            observedRoots.add(root);
        }
        /* childList only — characterData caused scroll thrash even with toggles OFF */
        new MutationObserver(scheduleScan).observe(root, {
            childList: true, subtree: true
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
        removeWrongHostButtons();
        tryInsertButtons();
        if (anyRtlOn()) {
            scan();
            if (isPlanRtlActive()) scanPlan();
        } else {
            clearAllManaged();
            clearAllCodeManaged();
            clearAllPlanManaged();
        }
        /* purge any RTL marks that leaked into MD preview / editors */
        var leaked = document.querySelectorAll('.editor-group-container [' + MARK_ATTR + '], .monaco-editor [' + MARK_ATTR + '], .webview [' + MARK_ATTR + ']');
        for (var li = 0; li < leaked.length; li++) unmark(leaked[li]);
        attachObserver(document.body);
        discoverShadowRoots();
        setInterval(discoverShadowRoots, 8000);
        setInterval(function() {
            removeWrongHostButtons();
            tryInsertButtons();
        }, 2000);
    }

    if (document.readyState !== 'loading') start();
    else document.addEventListener('DOMContentLoaded', start);
})();