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
let ccEnglish: string | undefined;
let ccChinese: string | undefined;
let csEnable: boolean;
let ccEnable: boolean;
let EnglishIM: string;
let ChineseIM: string;
let obtainIMCmd: string;
let switchIMCmd: string;
let useWithVim: boolean;

let didCSEnableOnceTurnOff = false;

function isVimOn() {
	let isvimon = false;
	for (let ext of vscode.extensions.all) {
		if (ext.id.includes('vim') && ext.isActive) {
			isvimon = true;
			// console.log("has active vim");
			break;
		}
	}
	return isvimon;
}

async function ifVimOn() {
	if (!useWithVim) {
		return;
	}
	if (ccEnable && !csEnable && isVimOn()) {
		try {
			await switchIM(ChineseIM);
			// console.log("switch on vim");
		} catch (err) {
			// out.error(`${err}`);
		}
	}
}

function getConfiguration() {
	// out.info('get configuration.');
	let csEnableTemp = vscode.workspace.getConfiguration("ime-and-cursor").get<boolean>("cursorStyle.enable") as boolean;
	if (csEnableTemp !== csEnable) {
		csEnable = csEnableTemp;
		if (!csEnableTemp) {
			didCSEnableOnceTurnOff = true;
			vscode.window.showInformationMessage('稍后如果发现光标样式不对，可通过重启VSCode进行重置。');
		}
	}

	let ccEnableTemp = vscode.workspace.getConfiguration("ime-and-cursor").get<boolean>("cursorColor.enable") as boolean;
	if (ccEnableTemp !== ccEnable) {
		ccEnable = ccEnableTemp;
		if (!ccEnableTemp) {
			vscode.workspace.getConfiguration("workbench").update('colorCustomizations', { "editorCursor.foreground": undefined }, vscode.ConfigurationTarget.Global);
		}
	}

	csChinese = vscode.workspace.getConfiguration("ime-and-cursor").get<string>("cursorStyle.Chinese") as CS;
	csEnglish = vscode.workspace.getConfiguration("ime-and-cursor").get<string>("cursorStyle.English") as CS;
	ccChinese = vscode.workspace.getConfiguration("ime-and-cursor").get<string>("cursorColor.Chinese") as string;
	ccEnglish = vscode.workspace.getConfiguration("ime-and-cursor").get<string>("cursorColor.English") as string;
	if (ccEnglish === '') { ccEnglish = undefined; }
	if (ccChinese === '') { ccChinese = undefined; }

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
	useWithVim = vscode.workspace.getConfiguration("ime-and-cursor").get<boolean>("useWithVim") as boolean;
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
	// console.log('ime-and-cursor activate');
	defaultObtainIMCmd = context.asAbsolutePath('switcher/im-select.exe');
	defaultSwitchIMCmd = defaultObtainIMCmd + ' {im}';
	csEnable = vscode.workspace.getConfiguration("ime-and-cursor").get<boolean>("cursorStyle.enable") as boolean;
	ccEnable = vscode.workspace.getConfiguration("ime-and-cursor").get<boolean>("cursorColor.enable") as boolean;
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
			// console.log("switch");
		} catch (err) {
			// out.error(`${err}`);
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeWindowState(async (e: vscode.WindowState) => {
		if (e.focused) {
			// out.info("window focused!");
			ifVimOn();
			try {
				setCursor(await obtainIM());
			} catch (err) {
				// out.error(`${err}`);
			}
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(async (e: vscode.TextEditor | undefined) => {
		// console.log(e);
		if (e !== undefined) {
			// out.info('text editor activated!');
			if (didCSEnableOnceTurnOff && !csEnable && vscode.window.activeTextEditor) {
				if (!isVimOn()) {
					vscode.window.activeTextEditor.options = { cursorStyle: 1 };
					// console.log('reset active text editor cursor style');
				}
			}
			// if (e.options.cursorStyle !== 1) {
				ifVimOn();
			// }
			try {
				setCursor(await obtainIM());
			} catch (err) {
				// out.error(`${err}`);
			}
		}
	}));


	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
		if (e.affectsConfiguration("ime-and-cursor")) {
			getConfiguration();
			// console.log('getConfiguration');
		}
	}));
}

export async function deactivate(context: vscode.ExtensionContext) {
	// out.info("光标和输入法-DEACTIVATE");
	await vscode.workspace.getConfiguration("workbench").update('colorCustomizations', { "editorCursor.foreground": undefined }, vscode.ConfigurationTarget.Global);
}