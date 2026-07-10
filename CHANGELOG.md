# Changelog

All notable changes to **Cursor Chat RTL — Persian** are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.1.0] — 2026-07-10

### Added
- **Code RTL toggle** (`</>` codicon button) next to the ⇄ text toggle
  - Applies RTL to code blocks and Monaco editors **inside agent chat only**
  - Does not affect the main file editor or Plan files
  - State persisted in `localStorage` (`cursor-chat-rtl-code-active`)
- Project rebranded under **ALI FATHNEJAT** (`alifath` publisher)
- Full README, CHANGELOG, and marketplace metadata for GitHub / Open VSX

### Credits
- Built on [yechielby/cursor-chat-rtl-extension](https://github.com/yechielby/cursor-chat-rtl-extension) — thank you Yechiel Bar-Yehuda for the original workbench-patching approach and ⇄ toggle concept.

---

## [1.0.5] — 2026-07-10

### Fixed
- **Content-based direction detection** — scans `p`, `li`, headings for Persian/Arabic/Hebrew characters instead of relying on fragile CSS class names
- Works in sidebar chat, editor-tab chat (`chat-editor-group`), and Agents Window
- Excludes Monaco file editor, Plan/ProseMirror, terminals, and diff blocks from text scanner

---

## [1.0.4] — 2026-07-10

### Changed
- Scoped selectors to `.composer-rendered-message` and `.composer-human-message` only

### Fixed
- Prevented accidental RTL on file editor (too narrow — fixed in 1.0.5)

---

## [1.0.3] — 2026-07-10

### Fixed
- VSIX build: BOM-free `package.json`, forward-slash zip entries (fixes "not a JSON file" install error)
- Per-element RTL/LTR detection instead of forcing all elements RTL (fixes mixed-language layout breakage)

---

## [1.0.2] — 2026-07-10

### Added
- Custom extension package (`cursor-chat-rtl-persian`) forked from yechielby v0.1.6
- Support for `.markdown-lexical-editor-container` (new Cursor Agent DOM)

---

## [1.0.1] — 2026-07-10

### Added
- Initial Persian fork with expanded CSS selectors and MutationObserver scanner

---

## Upstream reference

| Version | Source |
|---------|--------|
| 0.1.6 | [yechielby/cursor-chat-rtl-extension](https://github.com/yechielby/cursor-chat-rtl-extension) — original ⇄ toggle + workbench patch |

[1.1.0]: https://github.com/alifath/cursor-chat-rtl-persian/compare/v1.0.5...v1.1.0
[1.0.5]: https://github.com/alifath/cursor-chat-rtl-persian/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/alifath/cursor-chat-rtl-persian/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/alifath/cursor-chat-rtl-persian/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/alifath/cursor-chat-rtl-persian/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/alifath/cursor-chat-rtl-persian/releases/tag/v1.0.1
