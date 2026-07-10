/**
 * CSS/JS injected into the **Cursor IDE** workbench (via extension injector), not a separate Cursor product.
 */
/** Injected workbench asset names */
export const HTML_LINK_MARKER = 'cursor-chat-rtl.css';
export const CSS_FILENAME = 'cursor-chat-rtl.css';
export const JS_FILENAME = 'cursor-chat-rtl.js';

/** Mode marker inside CSS (for status / upgrades) */
export const RTL_MODE_ACTIVE_MARKER = '/* RTL-MODE: active */';
export const RTL_VERSION_MARKER = '/* RTL-VERSION: 1.0.0-persian */';

const BODY_CLASS = 'cursor-chat-rtl';
const BTN_ID = 'cursor-rtl-toggle-btn';

/** Toggle button + active state */
const BUTTON_CSS = `
/* ==========================================
   Toggle ⇄ — next to New Chat (+)
   ========================================== */

#${BTN_ID} {
    font-size: 14px !important;
    font-weight: bold !important;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    color: var(--vscode-foreground);
    opacity: 0.5;
    transition: opacity 0.2s, background 0.2s;
    flex-shrink: 0;
    display: flex !important;
    align-items: center;
    justify-content: center;
    text-decoration: none !important;
}

#${BTN_ID}:hover {
    opacity: 1;
}

#${BTN_ID}.cursor-rtl-active {
    opacity: 1;
    background: var(--vscode-button-background, rgba(128, 128, 128, 0.3));
}
`;

/**
 * Legacy / VS Code–style chat panes (`.chat-markdown-part`, interactive input).
 * @param p - selector prefix including trailing space (e.g. "body.cursor-chat-rtl ")
 */
function rtlLegacyMarkdown(p: string): string {
    return `
/* --- TEXT: RTL (legacy chat) --- */

${p}.chat-markdown-part.rendered-markdown {
    direction: rtl !important;
    unicode-bidi: plaintext !important;
}

${p}.chat-markdown-part.rendered-markdown p,
${p}.chat-markdown-part.rendered-markdown ul,
${p}.chat-markdown-part.rendered-markdown ol,
${p}.chat-markdown-part.rendered-markdown li,
${p}.chat-markdown-part.rendered-markdown h1,
${p}.chat-markdown-part.rendered-markdown h2,
${p}.chat-markdown-part.rendered-markdown h3,
${p}.chat-markdown-part.rendered-markdown h4,
${p}.chat-markdown-part.rendered-markdown blockquote {
    text-align: right !important;
    unicode-bidi: embed !important;
}

${p}.chat-markdown-part.rendered-markdown a {
    unicode-bidi: plaintext !important;
}

${p}.interactive-input-editor .view-lines {
    direction: rtl !important;
    text-align: right !important;
}
`;
}

/** Shared block/inline RTL rules for composer agent markdown containers. */
function rtlComposerTextBlocks(p: string, container: string): string {
    return `
${p}${container} {
    direction: rtl !important;
    unicode-bidi: plaintext !important;
}

${p}${container} :is(p, ul, ol, li, h1, h2, h3, h4, h5, h6, blockquote, div) {
    text-align: right !important;
    unicode-bidi: plaintext !important;
}

${p}${container} a {
    unicode-bidi: plaintext !important;
}
`;
}

/**
 * Cursor Composer / Agent pane — legacy `.markdown-root` and new Lexical DOM
 * (`.markdown-lexical-editor-container`, `.markdown-section`).
 * @param p - selector prefix including trailing space
 */
function rtlComposerMarkdown(p: string): string {
    const agentContainers = [
        '.composer-rendered-message .markdown-root',
        '.composer-rendered-message .markdown-lexical-editor-container',
        '.composer-rendered-message .markdown-section',
        '.composer-rendered-message .markdown-lexical-editor-container .markdown-section',
    ];

    const agentCss = agentContainers.map(c => rtlComposerTextBlocks(p, c)).join('\n');

    return `
/* --- TEXT: RTL (Cursor Composer / Agent) --- */

${agentCss}

${p}.composer-rendered-message [dir="ltr"]:not(.monaco-editor):not(.markdown-lexical-editor-code-block):not(.composer-code-block-container *) {
    direction: rtl !important;
    unicode-bidi: plaintext !important;
    text-align: right !important;
}

${p}.composer-human-message-container .composer-human-message,
${p}.composer-human-message .aislash-editor-input-readonly,
${p}.composer-human-message .aislash-editor-input {
    direction: rtl !important;
    unicode-bidi: plaintext !important;
}

${p}.composer-human-message-container .aislash-editor-input-readonly,
${p}.composer-human-message .aislash-editor-input-readonly p,
${p}.composer-human-message .aislash-editor-input p {
    text-align: right !important;
    unicode-bidi: plaintext !important;
}

${p}.ui-prompt-input-editor__input,
${p}.ui-prompt-input-tiptap-readonly__content,
${p}.ui-prompt-input-editor__input > p,
${p}.ui-prompt-input-tiptap-readonly__content > p {
    unicode-bidi: plaintext !important;
    text-align: start !important;
}

${p}.markdown-lexical-editor-container ul,
${p}.markdown-lexical-editor-container ol,
${p}.markdown-section ul,
${p}.markdown-section ol {
    padding-inline-start: 20px !important;
    padding-inline-end: 0 !important;
}
`;
}

/**
 * @param p - selector prefix including trailing space
 */
function ltrOverrides(p: string): string {
    return `
/* --- MUST STAY LTR --- */

${p}.interactive-result-code-block {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left !important;
}

${p}.interactive-result-editor {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left !important;
}

${p}pre,
${p}code {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left !important;
}

${p}.chat-markdown-part.rendered-markdown table,
${p}.composer-rendered-message .markdown-root table,
${p}.composer-rendered-message .markdown-lexical-editor-container table,
${p}.composer-rendered-message .markdown-section table {
    direction: rtl !important;
}

${p}.chat-markdown-part.rendered-markdown table th,
${p}.chat-markdown-part.rendered-markdown table td,
${p}.composer-rendered-message .markdown-root table th,
${p}.composer-rendered-message .markdown-root table td,
${p}.composer-rendered-message .markdown-lexical-editor-container table th,
${p}.composer-rendered-message .markdown-lexical-editor-container table td,
${p}.composer-rendered-message .markdown-section table th,
${p}.composer-rendered-message .markdown-section table td {
    text-align: right !important;
    unicode-bidi: plaintext !important;
}

${p}.chat-thinking-box {
    direction: ltr !important;
}

${p}.chat-used-context {
    direction: ltr !important;
}

${p}.chat-attached-context,
${p}.chat-attached-context-attachment {
    direction: ltr !important;
}

${p}.interactive-item-container .header {
    direction: ltr !important;
}

${p}.chat-footer-toolbar {
    direction: ltr !important;
}

${p}.interactive-result-code-block-toolbar {
    direction: ltr !important;
}

${p}.interactive-result-vulns {
    direction: ltr !important;
}

${p}.interactive-input-and-execute-toolbar {
    direction: ltr !important;
}

${p}.interactive-input-and-side-toolbar {
    direction: ltr !important;
}

${p}.checkpoint-container,
${p}.checkpoint-restore-container {
    direction: ltr !important;
}

${p}.request-hover {
    direction: ltr !important;
}

/* Composer: code blocks, tools, terminals stay LTR */
${p}.composer-code-block-container,
${p}.composer-diff-block,
${p}.composer-tool-former-message,
${p}.composer-terminal-output,
${p}.composer-tool-call-container,
${p}.ui-step-group-header,
${p}.markdown-lexical-editor-code-block,
${p}.markdown-code-outer-container,
${p}.cursor-code-block-content {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left !important;
}

${p}.composer-rendered-message .monaco-editor,
${p}.composer-message-codeblock {
    direction: ltr !important;
    unicode-bidi: isolate !important;
}
`;
}

/** The CSS injected for active mode (toggle ⇄ + body class) */
export const RTL_CSS = `/* === CURSOR-CHAT-RTL-START === */
${RTL_MODE_ACTIVE_MARKER}
${RTL_VERSION_MARKER}
${BUTTON_CSS}

${rtlLegacyMarkdown(`body.${BODY_CLASS} `)}
${rtlComposerMarkdown(`body.${BODY_CLASS} `)}
${ltrOverrides(`body.${BODY_CLASS} `)}
/* === CURSOR-CHAT-RTL-END === */
`;

/** Toggle + localStorage JS + agent message DOM scanner for streaming content */
export const RTL_JS = `/* === CURSOR-CHAT-RTL-JS active === */
(function() {
    var BTN_ID = '${BTN_ID}';
    var BODY_CLASS = '${BODY_CLASS}';
    var STORAGE_KEY = 'cursor-chat-rtl-active';

    var CHAT_PANEL_SELECTOR = '#workbench\\\\.parts\\\\.auxiliarybar';

    var TOOLBAR_SELECTORS = [
        '.editor-actions .monaco-action-bar > ul.actions-container[aria-label="Editor actions"]',
        '.auxiliary-bar-title-hide-toolbar .monaco-action-bar > ul.actions-container[role="toolbar"]'
    ];

    var NEW_CHAT_COMMAND_IDS = [
        'composer.createNewComposerTab',
        'auxiliaryBar.newAgentMenu'
    ];

    var AGENT_ROOT_SELECTORS = [
        '.composer-rendered-message .markdown-lexical-editor-container',
        '.composer-rendered-message .markdown-section',
        '.composer-rendered-message .markdown-root'
    ];

    var AGENT_TEXT_SELECTORS = [
        '.composer-rendered-message .markdown-lexical-editor-container p',
        '.composer-rendered-message .markdown-lexical-editor-container li',
        '.composer-rendered-message .markdown-lexical-editor-container h1',
        '.composer-rendered-message .markdown-lexical-editor-container h2',
        '.composer-rendered-message .markdown-lexical-editor-container h3',
        '.composer-rendered-message .markdown-lexical-editor-container h4',
        '.composer-rendered-message .markdown-lexical-editor-container blockquote',
        '.composer-rendered-message .markdown-section p',
        '.composer-rendered-message .markdown-section li',
        '.composer-rendered-message .markdown-root p',
        '.composer-rendered-message .markdown-root li'
    ];

    var CODE_EXCLUDE = 'code, pre, .monaco-editor, .markdown-lexical-editor-code-block, .composer-code-block-container, .markdown-code-outer-container';

    function isRtlActive() {
        return document.body && document.body.classList.contains(BODY_CLASS);
    }

    function applyBodyClassFromStorage() {
        if (!document.body) return;
        if (localStorage.getItem(STORAGE_KEY) === 'true') {
            document.body.classList.add(BODY_CLASS);
        }
    }

    function isExcluded(el) {
        return el && el.closest && !!el.closest(CODE_EXCLUDE);
    }

    function applyAgentRtl() {
        if (!isRtlActive()) return;

        for (var i = 0; i < AGENT_ROOT_SELECTORS.length; i++) {
            var roots = document.querySelectorAll(AGENT_ROOT_SELECTORS[i]);
            for (var j = 0; j < roots.length; j++) {
                var root = roots[j];
                if (isExcluded(root)) continue;
                root.setAttribute('dir', 'rtl');
            }
        }

        for (var k = 0; k < AGENT_TEXT_SELECTORS.length; k++) {
            var nodes = document.querySelectorAll(AGENT_TEXT_SELECTORS[k]);
            for (var m = 0; m < nodes.length; m++) {
                var node = nodes[m];
                if (isExcluded(node)) continue;
                node.setAttribute('dir', 'rtl');
            }
        }
    }

    function findChatPanel() {
        return document.querySelector(CHAT_PANEL_SELECTOR);
    }

    function findToolbar(panel) {
        for (var i = 0; i < TOOLBAR_SELECTORS.length; i++) {
            var c = panel.querySelector(TOOLBAR_SELECTORS[i]);
            if (c) return c;
        }
        return null;
    }

    function findNewChatButton(container) {
        for (var i = 0; i < NEW_CHAT_COMMAND_IDS.length; i++) {
            var li = container.querySelector('li.action-item[data-command-id="' + NEW_CHAT_COMMAND_IDS[i] + '"]');
            if (li) return li;
        }
        return null;
    }

    function tryInsertButton() {
        if (document.getElementById(BTN_ID)) return;

        var panel = findChatPanel();
        if (!panel) return;

        var container = findToolbar(panel);
        if (!container) return;

        var firstLi = findNewChatButton(container);
        if (!firstLi) return;

        var li = document.createElement('li');
        li.className = 'action-item';
        li.setAttribute('role', 'presentation');

        var btn = document.createElement('a');
        btn.id = BTN_ID;
        btn.className = 'action-label';
        btn.textContent = '\\u21C4';
        btn.title = 'Toggle RTL for Cursor Chat';
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');

        if (isRtlActive()) {
            btn.classList.add('cursor-rtl-active');
        }

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            var isActive = document.body.classList.toggle(BODY_CLASS);
            btn.classList.toggle('cursor-rtl-active', isActive);
            localStorage.setItem(STORAGE_KEY, isActive ? 'true' : 'false');
            if (isActive) {
                applyAgentRtl();
            }
        });

        li.appendChild(btn);
        firstLi.insertAdjacentElement('afterend', li);
    }

    var scanTimer = null;
    function scheduleAgentRtlScan() {
        if (!isRtlActive()) return;
        if (scanTimer) return;
        scanTimer = setTimeout(function() {
            scanTimer = null;
            applyAgentRtl();
        }, 50);
    }

    function attachObserver(root) {
        if (!root) return;
        var observer = new MutationObserver(function() {
            tryInsertButton();
            scheduleAgentRtlScan();
        });
        observer.observe(root, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function start() {
        applyBodyClassFromStorage();
        tryInsertButton();
        applyAgentRtl();
        attachObserver(document.body);

        var all = document.querySelectorAll('*');
        for (var i = 0; i < all.length; i++) {
            if (all[i].shadowRoot) {
                attachObserver(all[i].shadowRoot);
            }
        }
    }

    if (document.readyState !== 'loading') {
        start();
    } else {
        document.addEventListener('DOMContentLoaded', start);
    }
})();
`;
