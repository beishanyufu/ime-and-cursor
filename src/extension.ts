/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { exec } from 'child_process';
import { resolve } from 'path';


const defaultObtainIMCmd = resolve(__dirname, '..', 'switcher', 'im-select.exe');
const defaultSwitchIMCmd = defaultObtainIMCmd + ' {im}';
const defaultEnglishIM = '1033';
const defaultChineseIM = '2052';

// const cursorStyles:{ [key: string]: vscode.TextEditorCursorStyle } = {
// 	line: vscode.TextEditorCursorStyle['Line'],
// 	block: vscode.TextEditorCursorStyle.Block,
// 	underline: vscode.TextEditorCursorStyle.Underline,
// 	'line-thin': vscode.TextEditorCursorStyle.LineThin,
// 	'block-outline': vscode.TextEditorCursorStyle.BlockOutline,
// 	'underline-thin': vscode.TextEditorCursorStyle.UnderlineThin,
// };

// type CS = 'Line'|'Block'|'Underline'|'LineThin'|'BlockOutline'|'UnderlineThin';  // 或
type CS = keyof typeof vscode.TextEditorCursorStyle;


const out = vscode.window.createOutputChannel('imeandcursor', { log: true });


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
		let IM = await execCmd(getObtainIMCmd());
		// console.log(IM.trim());
		return IM.trim();
	} catch (e) {
		vscode.window.showInformationMessage("获取输入法ID失败，请检查是否正确设置了“ObtainIMCmd”。");
		throw (e);
	}

}

async function switchIM(currentIM: string) {
	let targetIM = getEnglishIM();
	if (currentIM === targetIM) {
		targetIM = getChineseIM();
	}
	try {
		await execCmd(getSwitchIMCmd().replace('{im}', targetIM));
	} catch (e) {
		vscode.window.showInformationMessage("切换输入法失败，请检查是否正确设置了“SwitchIMCmd”。");
		throw (e);
	}
}

// function setCursorOld(currentIM: string) {
// 	let EnglishIM = getEnglishIM();
// 	let ChineseIM = getChineseIM();
// 	switch (currentIM) {
// 		case EnglishIM:
// 			vscode.workspace.getConfiguration("editor").update('cursorStyle', getCursorStyleEnglish() as string, vscode.ConfigurationTarget.Global);
// 			vscode.workspace.getConfiguration("workbench").update('colorCustomizations', { "editorCursor.foreground": getCursorColorEnglish() as string }, vscode.ConfigurationTarget.Global);
// 			break;
// 		case ChineseIM:
// 			vscode.workspace.getConfiguration("editor").update("cursorStyle", getCursorStyleChinese() as string, vscode.ConfigurationTarget.Global);
// 			vscode.workspace.getConfiguration("workbench").update('colorCustomizations', { "editorCursor.foreground": getCursorColorChinese() as string }, vscode.ConfigurationTarget.Global);
// 			break;
// 		default:
// 			vscode.window.showInformationMessage(`没有匹配的输入法ID（当前：${currentIM}），请检查是否正确设置了“EnglishIM”和“ChineseIM”。`);
// 	}
// }

function setCursor(currentIM: string) {
	if (!vscode.window.activeTextEditor) {
		out.info('setCursor:activeTextEditor === undefined');
		return;
	}
	out.info(`setCursor:${vscode.window.activeTextEditor.document.fileName}`); 
	const EnglishIM = getEnglishIM();
	const ChineseIM = getChineseIM();
	switch (currentIM) {
		case EnglishIM:
			vscode.window.activeTextEditor.options = { cursorStyle: vscode.TextEditorCursorStyle[getCursorStyleEnglish() as CS] };
			break;
		case ChineseIM:
			// vscode.window.activeTextEditor.options = { cursorStyle: vscode.TextEditorCursorStyle.Block };
			vscode.window.activeTextEditor.options = { cursorStyle: vscode.TextEditorCursorStyle[getCursorStyleChinese() as CS] };
			break;
		default:
			vscode.window.showInformationMessage(`没有匹配的输入法ID（当前：${currentIM}），请检查是否正确设置了“EnglishIM”和“ChineseIM”。`);
	}
}

export async function activate(context: vscode.ExtensionContext) {
	out.info("光标和输入法-ACTIVATE");
	try {
		setCursor(await obtainIM());
	} catch (err) {
		out.error(`${err}`);
	}

	context.subscriptions.push(vscode.commands.registerCommand('imeandcursor.switch', async () => {
		out.info("switch IM!");
		try {
			await switchIM(await obtainIM());
			setCursor(await obtainIM());

		} catch (err) {
			out.error(`${err}`);
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeWindowState(async (e: vscode.WindowState) => {
		if (e.focused) {
			out.info("window focused!");
			try {
				setCursor(await obtainIM());
			} catch (err) {
				out.error(`${err}`);
			}
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(async (e: vscode.TextEditor | undefined) => {
		if (e !== undefined) {
			out.info('text editor activated!');
			try {
				setCursor(await obtainIM());
			} catch (err) {
				out.error(`${err}`);
			}
		}
	}));
}

export async function deactivate(context: vscode.ExtensionContext) {
	out.info("光标和输入法-DEACTIVATE");
}