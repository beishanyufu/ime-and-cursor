import * as vscode from 'vscode';
import { exec } from 'child_process';
import { resolve } from 'path';

function getSwitcherLocation() {
	let location = vscode.workspace.getConfiguration("imeandcursor").get<string>("switcherLocation");
	return location ? location : resolve(__dirname, '..', 'switcher', 'im-select.exe');
}
function getCursorStyleEnglish() {
	return vscode.workspace.getConfiguration("imeandcursor").get<string>("cursorStyle.English");
}
function getCursorStyleChinese() {
	return vscode.workspace.getConfiguration("imeandcursor").get<string>("cursorStyle.Chinese");
}
function getCursorColorEnglish() {
	return vscode.workspace.getConfiguration("imeandcursor").get<string>("cursorColor.English");
}
function getCursorColorChinese() {
	return vscode.workspace.getConfiguration("imeandcursor").get<string>("cursorColor.Chinese");
}

function execCmd(cmd: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		exec(cmd, (err, stdout, stderr) => {
			if (err) {
				reject(err);
			} else {
				resolve(stdout);
			}
		});
	});
}

async function switchIM() {
	try {
		await execCmd(getSwitcherLocation() + " {im}");
	} catch (e) {
		vscode.window.showErrorMessage(`切换输入法时发生错误 ${e}`);
	}
}

async function setCursor() {
	try {
		// 获取当前输入法
		let imKey = await execCmd(getSwitcherLocation());
		switch (imKey.trim()) {
			case "1033":
				vscode.workspace.getConfiguration("editor").update('cursorStyle', getCursorStyleEnglish() as string, vscode.ConfigurationTarget.Global);
				// vscode.workspace.getConfiguration("workbench").update('colorCustomizations.editorCursor.foreround', "#0000FF", vscode.ConfigurationTarget.Global);
				vscode.workspace.getConfiguration("workbench").update('colorCustomizations', { "editorCursor.foreground": getCursorColorEnglish() as string }, vscode.ConfigurationTarget.Global);
				break;
			case "2052":
				vscode.workspace.getConfiguration("editor").update("cursorStyle", getCursorStyleChinese() as string, vscode.ConfigurationTarget.Global);
				vscode.workspace.getConfiguration("workbench").update('colorCustomizations', { "editorCursor.foreground": getCursorColorChinese() as string }, vscode.ConfigurationTarget.Global);
				break;
		}
	} catch (e) {
		vscode.window.showErrorMessage(`Cursor setting ${e}`);
	}
}


export function activate(context: vscode.ExtensionContext) {
	console.log("光标和输入法 ACTIVATE");
	setCursor();

	context.subscriptions.push(vscode.commands.registerCommand('imeandcursor.switch', async () => {
		await switchIM();
		await setCursor();
	}));
}

export function deactivate(context: vscode.ExtensionContext) {
	console.log("光标和输入法 DEACTIVATE");
}