/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { exec } from 'child_process';
// import { resolve } from 'path';

const defaultEnglishIM = '1033';
const defaultChineseIM = '2052';
// const defaultObtainIMCmd = resolve(__dirname, '..', 'switcher', 'im-select.exe');
// const defaultSwitchIMCmd = defaultObtainIMCmd + ' {im}';
let defaultObtainIMCmd = '';
let defaultSwitchIMCmd = '';
// type CS = 'Line'|'Block'|'Underline'|'LineThin'|'BlockOutline'|'UnderlineThin';  // 或
type CS = keyof typeof vscode.TextEditorCursorStyle;

// const out = vscode.window.createOutputChannel('ime-and-cursor', { log: true });

let csEnglish: CS;
let csChinese: CS;
let ccEnglish: string;
let ccChinese: string;
let csEnable: boolean;
let ccEnable: boolean;
let EnglishIM: string;
let ChineseIM: string;
let obtainIMCmd: string;
let switchIMCmd: string;

function getConfiguration() {
	// out.info('get configuration.');
	csEnable = vscode.workspace.getConfiguration("ime-and-cursor").get<boolean>("cursorStyle.enable") as boolean;
	if (csEnable) {
		csChinese = vscode.workspace.getConfiguration("ime-and-cursor").get<string>("cursorStyle.Chinese") as CS;
		csEnglish = vscode.workspace.getConfiguration("ime-and-cursor").get<string>("cursorStyle.English") as CS;
	}
	ccEnable = vscode.workspace.getConfiguration("ime-and-cursor").get<boolean>("cursorColor.enable") as boolean;
	if (ccEnable) {
		ccChinese = vscode.workspace.getConfiguration("ime-and-cursor").get<string>("cursorColor.Chinese") as string;
		ccEnglish = vscode.workspace.getConfiguration("ime-and-cursor").get<string>("cursorColor.English") as string;
	} else {
		vscode.workspace.getConfiguration("workbench").update('colorCustomizations', { "editorCursor.foreground": undefined }, vscode.ConfigurationTarget.Global);
	}
	EnglishIM = vscode.workspace.getConfiguration("ime-and-cursor").get<string>("EnglishIM")?.trim() as string;
	if (!EnglishIM) {
		EnglishIM = defaultEnglishIM;
	}
	ChineseIM = vscode.workspace.getConfiguration("ime-and-cursor").get<string>("ChineseIM")?.trim() as string;
	if (!ChineseIM) {
		ChineseIM = defaultChineseIM;
	}
	obtainIMCmd = vscode.workspace.getConfiguration("ime-and-cursor").get<string>("obtainIMCmd") as string;
	if (obtainIMCmd === '/path/to/im-select' || !obtainIMCmd) {
		obtainIMCmd = defaultObtainIMCmd;
	}
	switchIMCmd = vscode.workspace.getConfiguration("ime-and-cursor").get<string>("switchIMCmd") as string;
	if (switchIMCmd === '/path/to/im-select {im}' || !switchIMCmd) {
		switchIMCmd = defaultSwitchIMCmd;
	}
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
		let IM = await execCmd(obtainIMCmd);
		// console.log(IM.trim());
		return IM.trim();
	} catch (e) {
		vscode.window.showInformationMessage("获取输入法的key失败，请检查是否正确设置了“ObtainIMCmd”。");
		throw (e);
	}

}

async function switchIM(currentIM: string) {
	const targetIM = currentIM === EnglishIM ? ChineseIM : EnglishIM;
	try {
		await execCmd(switchIMCmd.replace('{im}', targetIM));
	} catch (e) {
		vscode.window.showInformationMessage("切换输入法失败，请检查是否正确设置了“SwitchIMCmd”。");
		throw (e);
	}
}


function setCursor(currentIM: string) {
	if (!vscode.window.activeTextEditor) {
		// out.info('setCursor:activeTextEditor === undefined');
		return;
	}
	// out.info(`setCursor:${vscode.window.activeTextEditor.document.fileName}`);
	switch (currentIM) {
		case EnglishIM:
			if (csEnable) {
				vscode.window.activeTextEditor.options = { cursorStyle: vscode.TextEditorCursorStyle[csEnglish] };
			}
			if (ccEnable) {
				vscode.workspace.getConfiguration("workbench").update('colorCustomizations', { "editorCursor.foreground": ccEnglish }, vscode.ConfigurationTarget.Global);
			}
			break;
		case ChineseIM:
			if (csEnable) {
				vscode.window.activeTextEditor.options = { cursorStyle: vscode.TextEditorCursorStyle[csChinese] };
			}
			if (ccEnable) {
				vscode.workspace.getConfiguration("workbench").update('colorCustomizations', { "editorCursor.foreground": ccChinese }, vscode.ConfigurationTarget.Global);
			}
			break;
		default:
			vscode.window.showInformationMessage(`没有匹配的输入法key值（当前：${currentIM}），请检查是否正确设置了“EnglishIM”和“ChineseIM”。`);
	}
}

export async function activate(context: vscode.ExtensionContext) {
	// out.info("光标和输入法-ACTIVATE");
	defaultObtainIMCmd = context.asAbsolutePath('switcher/im-select.exe');
	defaultSwitchIMCmd = defaultObtainIMCmd + ' {im}';
	getConfiguration();
	try {
		setCursor(await obtainIM());
	} catch (err) {
		// out.error(`${err}`);
	}

	context.subscriptions.push(vscode.commands.registerCommand('ime-and-cursor.switch', async () => {
		// out.info("switch IM!");
		try {
			await switchIM(await obtainIM());
			setCursor(await obtainIM());

		} catch (err) {
			// out.error(`${err}`);
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeWindowState(async (e: vscode.WindowState) => {
		if (e.focused) {
			// out.info("window focused!");
			try {
				setCursor(await obtainIM());
			} catch (err) {
				// out.error(`${err}`);
			}
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(async (e: vscode.TextEditor | undefined) => {
		if (e !== undefined) {
			// out.info('text editor activated!');
			try {
				setCursor(await obtainIM());
			} catch (err) {
				// out.error(`${err}`);
			}
		}
	}));

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
		getConfiguration();
	}));
}

export async function deactivate(context: vscode.ExtensionContext) {
	// out.info("光标和输入法-DEACTIVATE");
}