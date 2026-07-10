/**
 * Cursor Chat RTL — modifies the **Cursor IDE** install (workbench.html under the Cursor app).
 * Does not patch VS Code. Finder only discovers Cursor paths.
 */
import * as vscode from 'vscode';
import { findCursorInstallations } from './finder.js';
import { addRtl, removeRtl, getStatus, reinjectAssets, isFullyInstalled, setExtensionResourceDir } from './injector.js';
import type { RtlMode } from './types.js';
import { createStatusBarItem, updateStatusBar, disposeStatusBar } from './statusBar.js';

const STATE_MODE_KEY = 'cursorRtlPersian.mode';
const STATE_VERSION_KEY = 'cursorRtlPersian.version';

let outputChannel: vscode.OutputChannel;
let globalState: vscode.Memento;
let currentVersion: string;

function getOutputChannel(): vscode.OutputChannel {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('Cursor RTL Persian');
    }
    return outputChannel;
}

async function saveMode(mode: RtlMode): Promise<void> {
    await globalState.update(STATE_MODE_KEY, mode);
}

function getSavedMode(): RtlMode {
    return globalState.get<RtlMode>(STATE_MODE_KEY, 'inactive');
}

/**
 * Workbench HTML/CSS/JS live on disk under the Cursor app — the whole IDE must often be restarted,
 * not only the window, for those files to load reliably.
 */
async function promptRestartIfChanged(changed: boolean): Promise<void> {
    if (!changed) return;
    await updateStatusBar();
    const action = await vscode.window.showInformationMessage(
        'Cursor RTL Persian: Changes will take effect after restarting Cursor.',
        'Quit Now',
        'Later',
    );
    if (action === 'Quit Now') {
        await vscode.commands.executeCommand('workbench.action.quit');
    }
}

async function handleActivate(): Promise<void> {
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
        const alreadyInstalled = statuses.some(s => s.isInstalled);
        if (alreadyInstalled) {
            await saveMode('active');
            vscode.window.showInformationMessage('Cursor RTL Persian is already active.');
        } else {
            vscode.window.showWarningMessage('Cursor RTL Persian: Activation failed. Check Output for details.');
        }
    }
}

async function handleRemove(): Promise<void> {
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
        const statuses = await getStatus(installations);
        const stillInstalled = statuses.some(s => s.isInstalled);
        if (!stillInstalled) {
            await saveMode('inactive');
            vscode.window.showInformationMessage('Cursor RTL Persian is already inactive.');
        } else {
            vscode.window.showWarningMessage('Cursor RTL Persian: Deactivation failed. Check Output for details.');
        }
    }
}

async function handleStatus(): Promise<void> {
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
    channel.appendLine(`Found ${installations.length} Cursor installation(s):\n`);

    for (const s of statuses) {
        channel.appendLine(`  ${s.installation.ideName}`);
        channel.appendLine(`    RTL: ${s.isInstalled ? 'INSTALLED' : 'Not installed'}  (mode: ${s.mode})`);
        channel.appendLine(`    workbench.html backup: ${s.htmlBackupExists ? 'yes' : 'no'}`);
        channel.appendLine(`    product.json backup: ${s.productBackupExists ? 'yes' : 'no'}`);
        channel.appendLine(`    workbench dir: ${s.installation.workbenchDir}`);
        for (const e of s.installation.entries) {
            channel.appendLine(`      • ${e.workbenchHtmlPath}`);
        }
        channel.appendLine('');
    }

    channel.show(true);
    await updateStatusBar();
}

async function saveVersion(): Promise<void> {
    await globalState.update(STATE_VERSION_KEY, currentVersion);
}

async function silentInject(): Promise<boolean> {
    const installations = await findCursorInstallations();
    let anyChanged = false;
    for (const inst of installations) {
        const result = await addRtl(inst);
        if (result.changed) anyChanged = true;
    }
    return anyChanged;
}

async function silentReinjectVersion(): Promise<boolean> {
    const installations = await findCursorInstallations();
    let anyChanged = false;
    for (const inst of installations) {
        const installed = await isFullyInstalled(inst);
        if (!installed) {
            const result = await addRtl(inst);
            if (result.changed) anyChanged = true;
        } else {
            const result = await reinjectAssets(inst);
            if (result.changed) anyChanged = true;
        }
    }
    return anyChanged;
}

/**
 * Keep RTL injected after Cursor updates and refresh assets on extension upgrade.
 */
async function autoReactivate(): Promise<void> {
    const savedVersion = globalState.get<string>(STATE_VERSION_KEY);
    const savedMode = getSavedMode();

    if (!savedVersion) {
        await saveVersion();
        await handleActivate();
        return;
    }

    if (savedMode !== 'active') {
        if (savedVersion !== currentVersion) {
            await saveVersion();
        }
        return;
    }

    if (savedVersion !== currentVersion) {
        await saveVersion();
        await promptRestartIfChanged(await silentReinjectVersion());
        return;
    }

    const installations = await findCursorInstallations();
    if (installations.length === 0) return;

    let needsFull = false;
    for (const inst of installations) {
        if (!(await isFullyInstalled(inst))) {
            needsFull = true;
            break;
        }
    }

    if (needsFull) {
        await promptRestartIfChanged(await silentInject());
    }
}

async function handleToggle(): Promise<void> {
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
            'Cancel',
        );
        if (answer === 'Turn Off') {
            await vscode.commands.executeCommand('cursor-rtl-persian.remove');
        }
    } else {
        const answer = await vscode.window.showInformationMessage(
            'Cursor RTL Persian is inactive. Do you want to turn it on?',
            'Turn On',
            'Cancel',
        );
        if (answer === 'Turn On') {
            await vscode.commands.executeCommand('cursor-rtl-persian.add');
        }
    }
}

export function activate(context: vscode.ExtensionContext): void {
    globalState = context.globalState;
    currentVersion = context.extension.packageJSON.version ?? '0.0.0';
    setExtensionResourceDir(context.extension.extensionPath);

    const explained = globalState.get<boolean>('cursorRtlPersian.usageExplained');
    if (!explained) {
        void globalState.update('cursorRtlPersian.usageExplained', true);
        const ch = getOutputChannel();
        ch.appendLine('Cursor RTL Persian — what this does');
        ch.appendLine('This extension patches Cursor\u2019s own workbench files on disk (workbench.html + CSS/JS).');
        ch.appendLine('Includes fix for Agent messages (markdown-lexical-editor-container) in new Cursor versions.');
        ch.appendLine('');
        ch.appendLine('Steps: Command Palette (Ctrl+Shift+P) \u2192 "Cursor RTL Persian: Activate" \u2192 fully quit Cursor and reopen.');
        ch.appendLine('Then open Output \u2192 "Cursor RTL Persian" if a command fails (e.g. permission denied).');
        ch.appendLine('');
    }

    const statusBar = createStatusBarItem();
    context.subscriptions.push(statusBar);

    context.subscriptions.push(
        vscode.commands.registerCommand('cursor-rtl-persian.add', handleActivate),
        vscode.commands.registerCommand('cursor-rtl-persian.remove', handleRemove),
        vscode.commands.registerCommand('cursor-rtl-persian.status', handleStatus),
        vscode.commands.registerCommand('cursor-rtl-persian.reapply', async () => {
            await promptRestartIfChanged(await silentReinjectVersion());
        }),
        vscode.commands.registerCommand('cursor-rtl-persian.toggle', handleToggle),
    );

    autoReactivate().catch(err => console.error('Cursor RTL auto-reactivate failed:', err));
    updateStatusBar().catch(err => console.error('Cursor RTL status bar update failed:', err));
}

export function deactivate(): void {
    disposeStatusBar();
    outputChannel?.dispose();
}
