// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, commands, ExtensionContext, workspace, TextDocumentChangeEvent, TextDocument } from 'vscode';
import WikiTreeDataProvider from './WikiTreeDataProvider';
import Wiki from './Wiki';
import createLog from './util/log';
import addFileCommand from './commands/addFile.command';
import initTableOfContents from './ui/table-of-contents/TableOfContents';


const log = createLog('Wiki Explorer');

 
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	initTableOfContents(context);
	
	context.subscriptions.push(commands.registerCommand('writer.addFile', addFileCommand));


	log.info('Extension activation complete');
}

// this method is called when your extension is deactivated
export function deactivate() {}
