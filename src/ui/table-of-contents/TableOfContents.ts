import { workspace, window, ExtensionContext, TextDocument, Disposable, TreeView } from 'vscode';
import TableOfContentsDataProvider from './TableOfContentsDataProvider';
import { FolderNode, StructureNodeType, DocumentNode, StructureNode } from '../../structure/StructureNode';



export class TableOfContents implements Disposable
{

    private treeView: TreeView<StructureNode>;

    constructor (context: ExtensionContext) {
        const filePath = window.activeTextEditor!.document.fileName;

        const rootPath = workspace.rootPath as string;
        const rootNode: DocumentNode = {
            type: StructureNodeType.Document,
            id: 'root',
            name: 'root',
            folderPath: rootPath,
        }

        const dataProvider = new TableOfContentsDataProvider(rootNode);
        this.treeView = window.createTreeView('writer.table-of-contents', { 
            treeDataProvider: dataProvider,
        });
        context.subscriptions.push(this.treeView);

    }



    dispose() {
        
    }
    
}



export default function initTableOfContents (context: ExtensionContext)
{

    const filePath = window.activeTextEditor!.document.fileName;

    const rootPath = workspace.rootPath as string;
    const rootNode: DocumentNode = {
        type: StructureNodeType.Document,
        id: 'root',
        name: 'root',
        folderPath: rootPath,
    } 
        
    const dataProvider = new TableOfContentsDataProvider(rootNode);
    const treeView = window.createTreeView('writer.table-of-contents', { 
        treeDataProvider: dataProvider,
    });
    context.subscriptions.push(treeView);




    workspace.onDidSaveTextDocument( (event: TextDocument) => {
        dataProvider.emitChange(); 
        treeView.reveal()
    });


}