import * as vscode from 'vscode';
import { findCursorInstallations } from './finder.js';
import { getStatus } from './injector.js';

let statusBarItem: vscode.StatusBarItem;

export function createStatusBarItem(): vscode.StatusBarItem {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 97);
    statusBarItem.command = 'cursor-rtl-persian.toggle';
    statusBarItem.show();
    return statusBarItem;
}

export async function updateStatusBar(): Promise<void> {
    if (!statusBarItem) return;

    const installations = await findCursorInstallations();

    if (installations.length === 0) {
        statusBarItem.text = '$(globe) RTL Persian: N/A';
        statusBarItem.tooltip = 'Cursor IDE not found on this machine';
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

export function disposeStatusBar(): void {
    statusBarItem?.dispose();
}
