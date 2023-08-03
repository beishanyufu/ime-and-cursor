// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('extension "imeandcursor" is now active!');

	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('imeandcursor.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from imeandcursor!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	console.log('extension "imeandcursor" is now DEACTIVE!');
}
