import {
  TreeDataProvider,
  TreeItem,
  ProviderResult,
  TreeItemCollapsibleState,
  Uri,
  Command,
  Range,
  Event
} from "vscode";
import {
  StructureNode,
  StructureNodeType,
  DocumentNode,
  SectionNode
} from "../../structure/StructureNode";
import { getChildNodes } from "../../structure/child-nodes";


export default class TableOfContentsDataProvider implements TreeDataProvider<StructureNode>
{

    private rootNode: StructureNode;
    private changeListeners: any[] = [];

    constructor (rootNode: StructureNode)
    {
        this.rootNode = rootNode;
    }



    public onDidChangeTreeData = ( listener: (_: any)=>any): any => {
        console.log('onDidChangeTreeData');
        this.changeListeners.push(listener);
    }


    public emitChange()
    {
        this.changeListeners.forEach(listener => listener())
    }


    public async getTreeItem(node: StructureNode): Promise<TreeItem> {
        switch (node.type) {

            case StructureNodeType.Document: return this.getDocumentTreeItem(node);
            case StructureNodeType.Section: return this.getSectionTreeItem(node);

            default: return {
                id: "0",
                description: "ERROR: Invalid node"
            };
        }
    }


    public async getChildren(node?: StructureNode): Promise<StructureNode[]> {
        if (!node) {
        node = this.rootNode;
        }

        const kids = await getChildNodes(node);

        return await getChildNodes(node);
    }

    public getParent(node: StructureNode): StructureNode | undefined {
        return node.parent;
    }


    private getDocumentTreeItem (node: DocumentNode): TreeItem
    {
        const treeItem: TreeItem = {
            id: node.id,
            label: node.name,
            contextValue: "document",
            tooltip: "hello!",
            collapsibleState: TreeItemCollapsibleState.Collapsed,
        }

        if(node.filePath) {
            treeItem.command = {
                command: 'vscode.open',
                title: 'Open',
                arguments: [Uri.file(node.filePath), {
                    selection: new Range(0,0,0,0),
                }],
            }
        }

        return treeItem;
    }


    private getSectionTreeItem (node: SectionNode): TreeItem
    {
        const treeItem: TreeItem = {
            id: node.id,
            label: node.name,
            contextValue: 'section',
            collapsibleState: TreeItemCollapsibleState.None,
            command: {
                command: 'vscode.open',
                title: 'Open',
                arguments: [Uri.file(node.filePath), {
                    selection: new Range(node.lineNumber, 0, node.lineNumber, 0)
                }]
            }
        }

        return treeItem;
    }





}
