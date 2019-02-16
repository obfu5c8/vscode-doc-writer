import { window, ExtensionContext, TreeViewOptions, TreeView, workspace, commands } from 'vscode';
import WikiTreeDataProvider, { Node, Node2 } from './WikiTreeDataProvider';

import createLog, { Log } from './util/log';


export default class Wiki 
{

    constructor (
        private context: ExtensionContext, 
        private log: Log
        ) 
    {
        this.registerTreePanel(); 


        context.subscriptions.push(commands.registerCommand('wiki-writer.open-section', (node: Node2) => {
            console.log('command:open-section', node);
        }));

        
    }


    private treeView?: TreeView<Node2>;


    private registerTreePanel () {

        const dataProvider = new WikiTreeDataProvider(this.log);

        this.treeView = window.createTreeView('obfu5c8', { 
            treeDataProvider: dataProvider,
        });

    }

} 