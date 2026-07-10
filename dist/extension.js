'use strict';

const vscode = require('vscode');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

const HTML_LINK_MARKER = 'cursor-chat-rtl.css';
const CSS_FILENAME = 'cursor-chat-rtl.css';
const JS_FILENAME = 'cursor-chat-rtl.js';
const RTL_MODE_ACTIVE_MARKER = '/* RTL-MODE: active */';
const STATE_MODE_KEY = 'cursorRtlPersian.mode';
const STATE_VERSION_KEY = 'cursorRtlPersian.version';

const ELECTRON_DIRS = ['electron-sandbox', 'electron-browser'];
const CHECKSUM_KEYS = {
    'electron-sandbox': 'vs/code/electron-sandbox/workbench/workbench.html',
    'electron-browser': 'vs/code/electron-browser/workbench/workbench.html',
};

let outputChannel;
let globalState;
let currentVersion;
let statusBarItem;
let extensionPath;

async function exists(p) {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

async function findCursorInstallations() {
    const resourcesApp = vscode.env.appRoot;
    const productJsonPath = path.join(resourcesApp, 'product.json');
    if (!(await exists(productJsonPath))) return [];

    const workbenchDir = path.join(resourcesApp, 'out', 'vs', 'workbench');
    if (!(await exists(workbenchDir))) return [];

    const entries = [];
    for (const electronDir of ELECTRON_DIRS) {
        const workbenchHtmlPath = path.join(
            resourcesApp, 'out', 'vs', 'code', electronDir, 'workbench', 'workbench.html'
        );
        if (!(await exists(workbenchHtmlPath))) continue;
        const checksumKey = CHECKSUM_KEYS[electronDir];
        if (!checksumKey) continue;
        entries.push({ workbenchHtmlPath, checksumKey });
    }

    if (entries.length === 0) return [];
    return [{ ideName: 'Cursor', workbenchDir, productJsonPath, entries }];
}

async function loadRtlAssets() {
    const cssPath = path.join(extensionPath, 'resources', CSS_FILENAME);
    const jsPath = path.join(extensionPath, 'resources', JS_FILENAME);
    const [css, js] = await Promise.all([
        fs.readFile(cssPath, 'utf-8'),
        fs.readFile(jsPath, 'utf-8'),
    ]);
    return { css, js };
}

async function isWritable(dir) {
    try {
        await fs.access(dir, fsSync.constants.W_OK);
        return true;
    } catch {
        return false;
    }
}

async function htmlHasMarker(htmlPath) {
    try {
        const content = await fs.readFile(htmlPath, 'utf-8');
        return content.includes(HTML_LINK_MARKER);
    } catch {
        return false;
    }
}

async function isFullyInstalled(installation) {
    for (const e of installation.entries) {
        if (!(await htmlHasMarker(e.workbenchHtmlPath))) return false;
    }
    return installation.entries.length > 0;
}

async function writeAssets(installation, messages) {
    const { css, js } = await loadRtlAssets();
    const cssPath = path.join(installation.workbenchDir, CSS_FILENAME);
    const jsPath = path.join(installation.workbenchDir, JS_FILENAME);
    await fs.writeFile(cssPath, css, 'utf-8');
    await fs.writeFile(jsPath, js, 'utf-8');
    messages.push(`  CSS/JS: Written to ${installation.workbenchDir}`);
}

async function removeChecksum(installation, checksumKey, messages) {
    try {
        const content = await fs.readFile(installation.productJsonPath, 'utf-8');
        const product = JSON.parse(content);
        if (product.checksums && product.checksums[checksumKey]) {
            const backupPath = installation.productJsonPath + '.bak';
            if (!(await exists(backupPath))) {
                await fs.copyFile(installation.productJsonPath, backupPath);
                messages.push('  product.json: Backup created');
            }
            delete product.checksums[checksumKey];
            await fs.writeFile(installation.productJsonPath, JSON.stringify(product, null, '\t'), 'utf-8');
            messages.push(`  product.json: Removed checksum for ${checksumKey}`);
        } else {
            messages.push(`  product.json: Checksum already removed or not found (${checksumKey})`);
        }
    } catch (e) {
        if (e.code === 'EPERM' || e.code === 'EACCES') {
            messages.push(`  product.json: Permission denied: ${installation.productJsonPath}`);
            messages.push('       Try running Cursor as Administrator');
        } else {
            messages.push(`  product.json: Error: ${e.message}`);
        }
    }
}

async function injectIntoWorkbenchHtml(entry, installation, messages) {
    try {
        const htmlBackupPath = entry.workbenchHtmlPath + '.bak';
        const backupExisted = await exists(htmlBackupPath);
        await fs.copyFile(entry.workbenchHtmlPath, htmlBackupPath);
        messages.push(`  workbench.html: Backup ${backupExisted ? 'updated' : 'created'} (${path.basename(path.dirname(entry.workbenchHtmlPath))})`);

        let html = await fs.readFile(entry.workbenchHtmlPath, 'utf-8');
        const cssLinkPattern = /<link[^>]*workbench\.desktop\.main\.css[^>]*>/;
        const cssLinkMatch = html.match(cssLinkPattern);

        if (cssLinkMatch) {
            const insertPos = cssLinkMatch.index + cssLinkMatch[0].length;
            const cssLink = `\n\t<!-- Cursor Chat RTL Support -->\n\t<link rel="stylesheet" href="../../../workbench/${CSS_FILENAME}">`;
            html = html.substring(0, insertPos) + cssLink + html.substring(insertPos);
        } else {
            const headClose = html.indexOf('</head>');
            if (headClose === -1) {
                messages.push(`  workbench.html: No insertion point in ${entry.workbenchHtmlPath}`);
                return false;
            }
            const cssLink = `\t<!-- Cursor Chat RTL Support -->\n\t<link rel="stylesheet" href="../../../workbench/${CSS_FILENAME}">\n`;
            html = html.substring(0, headClose) + cssLink + html.substring(headClose);
        }

        const htmlClose = html.lastIndexOf('</html>');
        if (htmlClose !== -1) {
            const scriptTag = `\t<!-- Cursor Chat RTL Support -->\n\t<script src="../../../workbench/${JS_FILENAME}"></script>\n`;
            html = html.substring(0, htmlClose) + scriptTag + html.substring(htmlClose);
        }

        await fs.writeFile(entry.workbenchHtmlPath, html, 'utf-8');
        messages.push(`  workbench.html: RTL tags injected (${path.basename(path.dirname(entry.workbenchHtmlPath))})`);
        await removeChecksum(installation, entry.checksumKey, messages);
        return true;
    } catch (e) {
        if (e.code === 'EPERM' || e.code === 'EACCES') {
            messages.push(`  Permission denied: ${entry.workbenchHtmlPath}`);
            messages.push('  Try running Cursor as Administrator once to apply RTL.');
        } else {
            messages.push(`  Error: ${e.message}`);
        }
        return false;
    }
}

async function addRtl(installation) {
    const messages = [];
    let changed = false;

    if (!(await isWritable(installation.workbenchDir))) {
        messages.push(`  Skipped: ${installation.workbenchDir}`);
        messages.push('       Directory not writable — try running Cursor as Administrator');
        return { messages, changed: false };
    }

    const allMarked = await isFullyInstalled(installation);
    if (allMarked) {
        try {
            await writeAssets(installation, messages);
            changed = true;
        } catch (e) {
            messages.push(`  Error updating CSS/JS: ${e.message}`);
        }
        messages.push('  RTL already installed — CSS/JS updated');
        return { messages, changed };
    }

    try {
        await writeAssets(installation, messages);
        changed = true;
    } catch (e) {
        messages.push(`  Error writing CSS/JS: ${e.message}`);
        return { messages, changed: false };
    }

    for (const entry of installation.entries) {
        if (await htmlHasMarker(entry.workbenchHtmlPath)) {
            messages.push(`  workbench.html: Already has RTL link (${path.basename(path.dirname(entry.workbenchHtmlPath))})`);
            continue;
        }
        if (await injectIntoWorkbenchHtml(entry, installation, messages)) {
            changed = true;
        }
    }

    return { messages, changed };
}

async function removeRtl(installation) {
    const messages = [];
    let changed = false;

    if (!(await isWritable(installation.workbenchDir))) {
        messages.push(`  Skipped: ${installation.workbenchDir}`);
        messages.push('       Directory not writable — try running Cursor as Administrator');
        return { messages, changed: false };
    }

    const anyMarker = (await Promise.all(
        installation.entries.map(e => htmlHasMarker(e.workbenchHtmlPath))
    )).some(Boolean);

    if (!anyMarker) {
        messages.push(`  RTL not installed in ${installation.ideName}`);
        return { messages, changed };
    }

    for (const entry of installation.entries) {
        if (!(await htmlHasMarker(entry.workbenchHtmlPath))) continue;
        const htmlBackupPath = entry.workbenchHtmlPath + '.bak';
        if (await exists(htmlBackupPath)) {
            try {
                await fs.copyFile(htmlBackupPath, entry.workbenchHtmlPath);
                await fs.unlink(htmlBackupPath);
                messages.push(`  workbench.html: Restored from backup (${path.basename(path.dirname(entry.workbenchHtmlPath))})`);
                changed = true;
            } catch (e) {
                messages.push(`  workbench.html: Backup restore failed: ${e.message}`);
            }
        } else {
            try {
                let html = await fs.readFile(entry.workbenchHtmlPath, 'utf-8');
                html = html.replace(/\n?\t?<!-- Cursor Chat RTL Support -->\n\t<link[^>]*cursor-chat-rtl\.css[^>]*>/g, '');
                html = html.replace(/\n?\t?<!-- Cursor Chat RTL Support -->\n\t<script[^>]*cursor-chat-rtl\.js[^>]*><\/script>\n?/g, '');
                await fs.writeFile(entry.workbenchHtmlPath, html, 'utf-8');
                messages.push(`  workbench.html: RTL tags removed manually (${path.basename(path.dirname(entry.workbenchHtmlPath))})`);
                changed = true;
            } catch (e) {
                messages.push(`  workbench.html: Error removing RTL: ${e.message}`);
            }
        }
    }

    const cssPath = path.join(installation.workbenchDir, CSS_FILENAME);
    const jsPath = path.join(installation.workbenchDir, JS_FILENAME);
    for (const filePath of [cssPath, jsPath]) {
        if (await exists(filePath)) {
            try {
                await fs.unlink(filePath);
                messages.push(`  Deleted: ${path.basename(filePath)}`);
                changed = true;
            } catch (e) {
                messages.push(`  Error deleting ${path.basename(filePath)}: ${e.message}`);
            }
        }
    }

    return { messages, changed };
}

async function getStatus(installations) {
    const statuses = [];
    for (const inst of installations) {
        const htmlOk = await isFullyInstalled(inst);
        statuses.push({
            installation: inst,
            isInstalled: htmlOk,
            mode: htmlOk ? 'active' : 'inactive',
        });
    }
    return statuses;
}

function getOutputChannel() {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('Cursor RTL Persian');
    }
    return outputChannel;
}

async function saveMode(mode) {
    await globalState.update(STATE_MODE_KEY, mode);
}

function getSavedMode() {
    return globalState.get(STATE_MODE_KEY, 'inactive');
}

async function promptRestartIfChanged(changed) {
    if (!changed) return;
    await updateStatusBar();
    const action = await vscode.window.showInformationMessage(
        'Cursor RTL Persian: Changes will take effect after restarting Cursor.',
        'Quit Now',
        'Later'
    );
    if (action === 'Quit Now') {
        await vscode.commands.executeCommand('workbench.action.quit');
    }
}

async function handleActivate() {
    const installations = await findCursorInstallations();
    if (installations.length === 0) {
        vscode.window.showWarningMessage('Cursor IDE not found on this machine.');
        return;
    }

    const channel = getOutputChannel();
    channel.clear();
    channel.appendLine('Activating Cursor RTL Persian...\n');

    let anyChanged = false;
    for (const inst of installations) {
        channel.appendLine(`[${inst.ideName}]`);
        const result = await addRtl(inst);
        result.messages.forEach(m => channel.appendLine(m));
        channel.appendLine('');
        if (result.changed) anyChanged = true;
    }

    channel.show(true);

    if (anyChanged) {
        await saveMode('active');
        await promptRestartIfChanged(true);
    } else {
        const statuses = await getStatus(installations);
        if (statuses.some(s => s.isInstalled)) {
            await saveMode('active');
            vscode.window.showInformationMessage('Cursor RTL Persian is already active.');
        } else {
            vscode.window.showWarningMessage('Cursor RTL Persian: Activation failed. Check Output for details.');
        }
    }
}

async function handleRemove() {
    const installations = await findCursorInstallations();
    if (installations.length === 0) {
        vscode.window.showWarningMessage('Cursor IDE not found on this machine.');
        return;
    }

    const channel = getOutputChannel();
    channel.clear();
    channel.appendLine('Deactivating Cursor RTL Persian...\n');

    let anyChanged = false;
    for (const inst of installations) {
        channel.appendLine(`[${inst.ideName}]`);
        const result = await removeRtl(inst);
        result.messages.forEach(m => channel.appendLine(m));
        channel.appendLine('');
        if (result.changed) anyChanged = true;
    }

    channel.show(true);

    if (anyChanged) {
        await saveMode('inactive');
        await promptRestartIfChanged(true);
    } else {
        await saveMode('inactive');
        vscode.window.showInformationMessage('Cursor RTL Persian is already inactive.');
    }
}

async function handleStatus() {
    const installations = await findCursorInstallations();
    if (installations.length === 0) {
        vscode.window.showWarningMessage('Cursor IDE not found on this machine.');
        return;
    }

    const statuses = await getStatus(installations);
    const channel = getOutputChannel();
    channel.clear();
    channel.appendLine(`IDE: ${vscode.env.appName}`);
    channel.appendLine(`Saved mode: ${getSavedMode()}`);
    channel.appendLine(`Extension: ${currentVersion}`);
    channel.appendLine(`Found ${installations.length} Cursor installation(s):\n`);

    for (const s of statuses) {
        channel.appendLine(`  ${s.installation.ideName}`);
        channel.appendLine(`    RTL: ${s.isInstalled ? 'INSTALLED' : 'Not installed'}  (mode: ${s.mode})`);
        channel.appendLine(`    workbench dir: ${s.installation.workbenchDir}`);
        for (const e of s.installation.entries) {
            channel.appendLine(`      • ${e.workbenchHtmlPath}`);
        }
        channel.appendLine('');
    }

    channel.show(true);
    await updateStatusBar();
}

async function handleReapply() {
    const installations = await findCursorInstallations();
    if (installations.length === 0) {
        vscode.window.showWarningMessage('Cursor IDE not found on this machine.');
        return;
    }

    let anyChanged = false;
    for (const inst of installations) {
        if (await isFullyInstalled(inst)) {
            const result = await addRtl(inst);
            if (result.changed) anyChanged = true;
        } else {
            const result = await addRtl(inst);
            if (result.changed) anyChanged = true;
        }
    }

    if (anyChanged) {
        await promptRestartIfChanged(true);
    } else {
        vscode.window.showInformationMessage('Cursor RTL Persian: CSS/JS already up to date.');
    }
}

async function handleToggle() {
    const installations = await findCursorInstallations();
    if (installations.length === 0) {
        vscode.window.showWarningMessage('Cursor IDE not found on this machine.');
        return;
    }

    const statuses = await getStatus(installations);
    const isOn = statuses.some(s => s.isInstalled);

    if (isOn) {
        const answer = await vscode.window.showInformationMessage(
            'Cursor RTL Persian is active. Do you want to turn it off?',
            'Turn Off',
            'Cancel'
        );
        if (answer === 'Turn Off') {
            await handleRemove();
        }
    } else {
        const answer = await vscode.window.showInformationMessage(
            'Cursor RTL Persian is inactive. Do you want to turn it on?',
            'Turn On',
            'Cancel'
        );
        if (answer === 'Turn On') {
            await handleActivate();
        }
    }
}

function createStatusBarItem() {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 97);
    statusBarItem.command = 'cursor-rtl-persian.toggle';
    statusBarItem.show();
    return statusBarItem;
}

async function updateStatusBar() {
    if (!statusBarItem) return;

    const installations = await findCursorInstallations();
    if (installations.length === 0) {
        statusBarItem.text = '$(globe) RTL Persian: N/A';
        statusBarItem.tooltip = 'Cursor IDE not found';
        return;
    }

    const statuses = await getStatus(installations);
    const anyInstalled = statuses.some(s => s.isInstalled);

    if (anyInstalled) {
        statusBarItem.text = '$(globe) RTL Persian: On';
        statusBarItem.tooltip = 'Cursor RTL Persian is active. Click to toggle.';
    } else {
        statusBarItem.text = '$(globe) RTL Persian: Off';
        statusBarItem.tooltip = 'Cursor RTL Persian is inactive. Click to toggle.';
    }
}

async function autoReactivate() {
    const savedVersion = globalState.get(STATE_VERSION_KEY);
    const savedMode = getSavedMode();

    if (!savedVersion) {
        await globalState.update(STATE_VERSION_KEY, currentVersion);
        return;
    }

    if (savedMode !== 'active') {
        if (savedVersion !== currentVersion) {
            await globalState.update(STATE_VERSION_KEY, currentVersion);
        }
        return;
    }

    if (savedVersion !== currentVersion) {
        await globalState.update(STATE_VERSION_KEY, currentVersion);
        await handleReapply();
        return;
    }

    const installations = await findCursorInstallations();
    for (const inst of installations) {
        if (!(await isFullyInstalled(inst))) {
            await handleActivate();
            return;
        }
    }
}

function activate(context) {
    globalState = context.globalState;
    currentVersion = context.extension.packageJSON.version ?? '1.0.0';
    extensionPath = context.extension.extensionPath;

    const explained = globalState.get('cursorRtlPersian.usageExplained');
    if (!explained) {
        void globalState.update('cursorRtlPersian.usageExplained', true);
        const ch = getOutputChannel();
        ch.appendLine('Cursor RTL Persian — what this does');
        ch.appendLine('Patches Cursor workbench files (workbench.html + CSS/JS).');
        ch.appendLine('Includes fix for Agent messages (markdown-lexical-editor-container).');
        ch.appendLine('');
        ch.appendLine('Steps: Ctrl+Shift+P → "Cursor RTL Persian: Activate" → fully quit Cursor and reopen.');
        ch.appendLine('');
    }

    context.subscriptions.push(createStatusBarItem());
    context.subscriptions.push(
        vscode.commands.registerCommand('cursor-rtl-persian.add', handleActivate),
        vscode.commands.registerCommand('cursor-rtl-persian.remove', handleRemove),
        vscode.commands.registerCommand('cursor-rtl-persian.status', handleStatus),
        vscode.commands.registerCommand('cursor-rtl-persian.reapply', handleReapply),
        vscode.commands.registerCommand('cursor-rtl-persian.toggle', handleToggle),
    );

    autoReactivate().catch(err => console.error('Cursor RTL Persian auto-reactivate failed:', err));
    updateStatusBar().catch(err => console.error('Cursor RTL Persian status bar failed:', err));
}

function deactivate() {
    statusBarItem?.dispose();
    outputChannel?.dispose();
}

module.exports = { activate, deactivate };
