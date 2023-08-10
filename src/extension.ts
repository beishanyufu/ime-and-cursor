/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { exec } from 'child_process';
import { resolve } from 'path';

// const configuration = vscode.workspace.getConfiguration("imeandcursor");
// const editorConfiguration = vscode.workspace.getConfiguration("editor");
// const workbenchConfiguration = vscode.workspace.getConfiguration("workbench");
const defaultObtainIMCmd = resolve(__dirname, '..', 'switcher', 'im-select.exe');
const defaultSwitchIMCmd = defaultObtainIMCmd + ' {im}';
const defaultEnglishIM = '1033';
const defaultChineseIM = '2052';
const cursorStyleBak = vscode.workspace.getConfiguration("editor").get('cursorStyle') as string;
const cursorColorBak = vscode.workspace.getConfiguration("workbench").get('colorCustomizations');
console.log(cursorStyleBak);
console.log(cursorColorBak);
const out = vscode.window.createOutputChannel('imeandcursor',{log:true});

// let eventSubscriptions = [];
// function getSwitcherLocation() {
// 	let location = vscode.workspace.getConfiguration("imeandcursor").get<string>("switcherLocation");
// 	return location ? location : resolve(__dirname, '..', 'switcher', 'im-select.exe');
// }
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
function getEnglishIM() {
	let EnglishIM = vscode.workspace.getConfiguration("imeandcursor").get<string>("EnglishIM")?.trim();
	if (!EnglishIM) {
		EnglishIM = defaultEnglishIM;
	}
	return EnglishIM;
}
function getChineseIM() {
	let ChineseIM = vscode.workspace.getConfiguration("imeandcursor").get<string>("ChineseIM")?.trim();
	if (!ChineseIM) {
		ChineseIM = defaultChineseIM;
	}
	return ChineseIM;
}
function getSwitchIMCmd() {
	let switchIMCmd = vscode.workspace.getConfiguration("imeandcursor").get<string>("switchIMCmd");
	if (switchIMCmd === '/path/to/im-select {im}' || !switchIMCmd) {
		switchIMCmd = defaultSwitchIMCmd;
	}
	return switchIMCmd;
}
function getObtainIMCmd() {
	let obtainIMCmd = vscode.workspace.getConfiguration("imeandcursor").get<string>("obtainIMCmd");
	if (obtainIMCmd === '/path/to/im-select' || !obtainIMCmd) {
		obtainIMCmd = defaultObtainIMCmd;
	}
	return obtainIMCmd;
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

async function obtainIM() {
	try {
		let imID = await execCmd(getObtainIMCmd());
		// console.log(imID.trim());
		return imID.trim();
	} catch (e) {
		vscode.window.showInformationMessage("获取输入法ID失败，请检查是否正确设置了“ObtainIMCmd”。");
		throw (e);
	}

}

async function switchIM(currentImID: string) {
	let targetImID = getEnglishIM();
	if (currentImID === targetImID) {
		targetImID = getChineseIM();
	}
	try {
		await execCmd(getSwitchIMCmd().replace('{im}', targetImID));
	} catch (e) {
		vscode.window.showInformationMessage("切换输入法失败，请检查是否正确设置了“SwitchIMCmd”。");
		throw (e);
	}
}

function setCursor(currentImID: string) {
	let EnglishIM = getEnglishIM();
	let ChineseIM = getChineseIM();
	switch (currentImID) {
		case EnglishIM:
			vscode.workspace.getConfiguration("editor").update('cursorStyle', getCursorStyleEnglish() as string, vscode.ConfigurationTarget.Global);
			vscode.workspace.getConfiguration("workbench").update('colorCustomizations', { "editorCursor.foreground": getCursorColorEnglish() as string }, vscode.ConfigurationTarget.Global);
			// vscode.workspace.getConfiguration("terminal").update('integrated.cursorStyle', 'line', vscode.ConfigurationTarget.Global);
			break;
		case ChineseIM:
			vscode.workspace.getConfiguration("editor").update("cursorStyle", getCursorStyleChinese() as string, vscode.ConfigurationTarget.Global);
			vscode.workspace.getConfiguration("workbench").update('colorCustomizations', { "editorCursor.foreground": getCursorColorChinese() as string }, vscode.ConfigurationTarget.Global);
			// vscode.workspace.getConfiguration("terminal").update('integrated.cursorStyle', 'block', vscode.ConfigurationTarget.Global);
			break;
		default:
			vscode.window.showInformationMessage(`没有匹配的输入法ID（当前：${currentImID}），请检查是否正确设置了“EnglishIM”和“ChineseIM”。`);
	}
}



export async function activate(context: vscode.ExtensionContext) {
	console.log("光标和输入法 ACTIVATE");
	try {
		setCursor(await obtainIM());
	} catch (e) {
		console.log(e);
	}

	context.subscriptions.push(vscode.commands.registerCommand('imeandcursor.switch', async () => {
		try {
			await switchIM(await obtainIM());
			setCursor(await obtainIM());

		} catch (e) {
			console.log(e);
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeWindowState(async (e: vscode.WindowState) => {
		if (e.focused) {
			console.log("window focused!");
			try {
				setCursor(await obtainIM());
			} catch (e) {
				console.log(e);
			}
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(async (e: vscode.TextEditor | undefined) => {
		// console.log('active text editor changed!',e);
		if (e !== undefined) {
			console.log('text editor activated!');
			try {
				setCursor(await obtainIM());
			} catch (e) {
				console.log(e);
			}
		}
	}));
}

export async function deactivate(context: vscode.ExtensionContext) {
	console.log("光标和输入法 DEACTIVATE");

	// return new Promise<void>((resolve,reject) => {
	// 	console.log(vscode.workspace.getConfiguration('editor').get('cursorStyle'));
		// vscode.workspace.getConfiguration("editor").update('cursorStyle', cursorStyleBak, vscode.ConfigurationTarget.Global).then(() => {
	// 		console.log('update complete');
	// 		resolve();
	// 	},(err) =>{
	// 		console.log('update failed',err);
	// 		reject();
	// 	});

	// return vscode.workspace.getConfiguration("editor").update('cursorStyle',cursorStyleBak, vscode.ConfigurationTarget.Global);

}