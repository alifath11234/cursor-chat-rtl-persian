# Cursor Chat RTL — Persian

**RTL support for Cursor IDE Agent chat** — Persian, Arabic, and Hebrew.

| | |
|---|---|
| **Author** | [ALI FATHNEJAT](https://github.com/alifath) (`alifath`) |
| **License** | MIT |
| **Cursor only** | Patches Cursor workbench files — not VS Code |

---

## Credits

This project is a fork and significant rewrite of **[cursor-chat-rtl-extension](https://github.com/yechielby/cursor-chat-rtl-extension)** by **[Yechiel Bar-Yehuda](https://github.com/yechielby)** (v0.1.6).

Thank you Yechiel for the original workbench-patching architecture, the ⇄ toolbar toggle, and the auto-reapply logic after Cursor updates. This fork extends that foundation with:

- Content-based RTL detection (works across all Cursor chat layouts)
- Support for new Agent DOM (`markdown-lexical-editor-container`)
- A separate **code RTL toggle** for Monaco/code blocks inside chat
- Persian-first documentation and maintenance

---

## Features

### ⇄ Text RTL toggle
Automatically detects Persian, Arabic, and Hebrew text in agent chat and aligns it right-to-left. English text stays left-aligned. Works in:

- Sidebar agent panel
- Chat editor tab (`chat-editor-group`)
- Agents Window

### `</>` Code RTL toggle
Optional RTL for **code blocks and Monaco editors inside agent chat only** — useful when agent writes Persian comments or mixed-language snippets. Does **not** affect your open file editor.

Both toggles persist across sessions via `localStorage`.

---

## Installation

### Option A — VSIX (recommended)

1. Download `cursor-chat-rtl-persian-1.1.0.vsix` from [Releases](https://github.com/alifath/cursor-chat-rtl-persian/releases)
2. Cursor → Extensions (`Ctrl+Shift+X`) → `...` menu → **Install from VSIX...**
3. `Ctrl+Shift+P` → **Cursor RTL Persian: Activate**
4. Fully quit and reopen Cursor (File → Exit)
5. Click **⇄** in the chat toolbar to enable text RTL

### Option B — Manual patch (no extension)

1. Close Cursor completely
2. Run `APPLY-RTL-PERSIAN.bat` as Administrator
3. Reopen Cursor and toggle **⇄**

---

## Commands

| Command | Description |
|---------|-------------|
| `Cursor RTL Persian: Activate` | Patch `workbench.html`, install CSS/JS |
| `Cursor RTL Persian: Deactivate` | Restore original workbench files |
| `Cursor RTL Persian: Re-apply After Cursor Update` | Re-copy CSS/JS after Cursor upgrade |
| `Cursor RTL Persian: Check Status` | Show patch status in Output panel |
| `Cursor RTL Persian: Toggle` | Enable/disable via status bar |

---

## After Cursor updates

Cursor updates overwrite `workbench.html`. Run:

```
Ctrl+Shift+P → Cursor RTL Persian: Re-apply After Cursor Update
```

Then fully restart Cursor.

---

## Development

```bash
npm install
npm run build        # compile extension.ts → dist/extension.js
npm run package      # create .vsix (requires Node.js + vsce)

# Or without Node.js:
powershell -ExecutionPolicy Bypass -File scripts/build-vsix.ps1
```

### Project structure

```
cursor-chat-rtl-persian/
├── resources/
│   ├── cursor-chat-rtl.css   ← injected into Cursor workbench
│   └── cursor-chat-rtl.js    ← injected into Cursor workbench
├── src/                      ← TypeScript extension source
├── dist/extension.js         ← extension entry (reads resources/)
├── scripts/
│   ├── build-vsix.ps1
│   └── apply-patch.ps1
└── APPLY-RTL-PERSIAN.bat
```

Edit `resources/*.css` and `resources/*.js` for RTL logic, then re-apply.

---

## Marketplace listing (Open VSX / VS Code)

```
Name:        Cursor Chat RTL — Persian
Publisher:   alifath
ID:          alifath.cursor-chat-rtl-persian
Category:    Other
Tags:        persian, farsi, rtl, cursor, arabic, hebrew, agent-chat
```

> **Note:** This extension patches Cursor's own application files. It requires Administrator privileges on first activation on Windows. It is designed for **Cursor IDE only**.

---

## License

MIT — see [LICENSE](LICENSE).  
Original work © Yechiel Bar-Yehuda. Modifications © ALI FATHNEJAT.
