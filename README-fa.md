# Cursor Chat RTL — Persian

**پشتیبانی RTL برای چت Agent در Cursor** — فارسی، عربی، عبری

| | |
|---|---|
| **توسعه‌دهنده** | [ALI FATHNEJAT](https://github.com/alifath) |
| **مجوز** | MIT |
| **فقط Cursor** | فایل‌های workbench کرسر را patch می‌کند |

---

## قدردانی

این پروژه fork و بازنویسی گسترده‌ای از افزونه **[cursor-chat-rtl-extension](https://github.com/yechielby/cursor-chat-rtl-extension)** اثر **[Yechiel Bar-Yehuda](https://github.com/yechielby)** (نسخه 0.1.6) است.

از Yechiel بابت معماری patch کردن workbench، دکمه ⇄ و منطق re-apply بعد از آپدیت کرسر سپاسگزاریم.

---

## قابلیت‌ها

### دکمه ⇄ — RTL متن چت
متن‌های فارسی/عربی/عبری در چت Agent را خودکار راست‌چین می‌کند. متن انگلیسی چپ‌چین می‌ماند.

### دکمه `</>` — RTL بلوک کد و Monaco
فقط داخل **چت Agent** — برای وقتی که ایجنت کامنت فارسی یا snippet ترکیبی می‌نویسد. ادیتور فایل اصلی تحت تأثیر قرار نمی‌گیرد.

---

## نصب

1. فایل `cursor-chat-rtl-persian-1.1.0.vsix` را از [Releases](https://github.com/alifath/cursor-chat-rtl-persian/releases) دانلود کنید
2. Extensions → `...` → **Install from VSIX...**
3. `Ctrl+Shift+P` → **Cursor RTL Persian: Activate**
4. Cursor را کامل ببندید و باز کنید
5. دکمه **⇄** را در toolbar چت فعال کنید

### پچ دستی (بدون افزونه)
`APPLY-RTL-PERSIAN.bat` را با Run as administrator اجرا کنید.

---

## بعد از آپدیت Cursor

```
Ctrl+Shift+P → Cursor RTL Persian: Re-apply After Cursor Update
```

سپس Cursor را کامل restart کنید.

---

## توسعه

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build-vsix.ps1
```

فایل‌های اصلی RTL در `resources/` هستند.

---

تغییرات: [CHANGELOG.md](CHANGELOG.md)
