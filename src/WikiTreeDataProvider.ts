import * as fs from 'fs-extra';
import * as path from 'path';
import { EOL } from 'os';
import { Uri, TreeDataProvider, Event, ProviderResult, TreeItem, workspace, TextDocumentChangeEvent, WorkspaceFoldersChangeEvent, TreeItemCollapsibleState } from 'vscode';
import { Log } from './util/log';


export interface WikiNode extends TreeItem {
    type: 'document' | 'folder' | 'section';
	resource: Uri;
	isDirectory: boolean;
}

export interface Node {
    type: 'document' | 'section' | 'folder';
    title: string;
    absFilePath: string;
    folderPath: string;
}


export interface Node2 {
    type: 'document' | 'section' | 'folder' | 'other.empty-file-marker' | 'other.resource-container';
    title: string;
    absFile?: string;
    absFolder?: string;
}



export default class WikiTreeDataProvider implements TreeDataProvider<Node2> {


    private rootFsPath: string;

    
    constructor(private log: Log) {

        this.rootFsPath = workspace.rootPath || 'error';
        console.log(workspace.rootPath);
    }
    

    public getTreeItem(node: Node2): TreeItem {

        this.log.info(Uri.parse(node.absFile || ''))

        switch(node.type) {
            case 'other.empty-file-marker': return {
                description: 'File is empty!',
                collapsibleState: TreeItemCollapsibleState.None,
                contextValue: 'marker',
            }

            case 'section': return {
                label: node.title,
                collapsibleState: TreeItemCollapsibleState.None,
                contextValue: 'section',
                command: {
                    command: 'wiki-writer.open-section',
                    title: 'Open',
                    arguments: [node]
                }
            }

            case 'other.resource-container': return {
                collapsibleState: TreeItemCollapsibleState.Collapsed,
                description: 'resources',
            }

            default: return {
                label: node.title,
                collapsibleState: TreeItemCollapsibleState.Collapsed,
                contextValue: 'document',
                command: node.absFile? {
                    command: 'vscode.open',
                    title: 'Open',
                    arguments: [Uri.file(node.absFile)]
                } : undefined,
            }
        }
    }






    public async getChildren(node?: Node2): Promise<Node2[]> {
        let nodes: Node2[] = [];

        if(!node) {
            node = {
                type: 'document',
                absFolder: this.rootFsPath,
                title: 'root',
            };
        }


        // If its a folder, check for child documents
        if(node.absFolder) {
            if(!await fs.pathExists(node.absFolder)) {
                console.warn('Folder %s does not exist', node.absFolder);
            } else {
                // Check for a '.order' file
                const orderFile = path.join(node.absFolder, '.order');
                if( await fs.pathExists(orderFile)) {
                    nodes = nodes.concat(await parseNodesFromOrderFile(node.absFolder))
                } else {
                    nodes = nodes.concat(await parseNodesFromFolder(node.absFolder));
                }
            }
        }

        // If its a file, check for sections inside it
        if(node.absFile) {
            if(!await fs.pathExists(node.absFile)) {
                console.warn('File %s does not exist', node.absFile);
            } else {
                nodes = nodes.concat(await parseNodesFromDocument(node.absFile))
            }
        }

        return nodes;
    }


    private handleWorkspaceOnDidChangeTextDocument = (event: TextDocumentChangeEvent) =>
    {
        const { document } = event;
        const activeWorkspaceFolder = workspace.getWorkspaceFolder(document.uri);
        this.log.info('onDidChangeTextDocument');
    }

    private handleWorkspaceOnDidChangeWorkspaceFolders = (event: WorkspaceFoldersChangeEvent) =>
    {
        this.log.info('handleWorkspaceOnDidChangeWorkspaceFolders');
    }

}





export async function parseNodesFromOrderFile(folder: string, orderFilePath?: string)
{
    if(!orderFilePath) {
        orderFilePath = path.join(folder, '.order');
    }

    if(! await fs.pathExists(orderFilePath)) {
        throw new Error(`No order file found at ${orderFilePath}`);
    }

    const nodes: Node2[] = [];

    const items = (await fs.readFile(orderFilePath)).toString().split(EOL)
        .map(item => item.trim())
        .filter(item => item.length >= 1)

    for(const item of items) {
        const folderPath = path.join(folder, item);
        const filePath = `${folderPath}.md`;

        if(await fs.pathExists(filePath)) {
            nodes.push({
                type: 'document',
                absFile: filePath,
                title: item,
            });
        }

        if(await fs.pathExists(folderPath)) {
            nodes.push({
                type: 'folder',
                absFolder: folderPath,
                title: item
            })
        }
    }

    return nodes;
}


export async function parseNodesFromFolder(folder: string): Promise<Node2[]>
{
    let nodes: Node2[] = [];

    if(!await fs.pathExists(folder)) { throw new Error('Folder not found at '+folder); }

    const files = await fs.readdir(folder);

    for(const file of files) {
        const absPath = path.join(folder, file);
        const stat = await fs.lstat(absPath);

        if(stat.isFile()) {
            if(file.endsWith('.md')) {
                nodes.push({
                    type: 'document',
                    absFile: absPath,
                    title: file.replace(/\.md$/,'')
                })
            }
        }
        else if(stat.isDirectory()) {
            nodes.push({
                type: 'folder',
                absFolder: absPath,
                title: file,
            })
        }
    }

    return nodes;
}



export async function parseNodesFromDocument (filePath: string): Promise<Node2[]>
{
    if(!await fs.pathExists(filePath)) { throw new Error(`File not found at ${filePath}`)}

    return  [Math.round(Math.random())? {
        type: 'section',
        title: 'Overview'
    } : {
        type: 'other.empty-file-marker',
        title: 'EMPTY',
    }, {
        type: 'other.resource-container',
        title: 'RESOURCE_CONTAINER',
    }]
}







export async function getOrderedNodeList(folder: string, orderFileAbsPath: string): Promise<Node[]>
{

    const items = (await fs.readFile(orderFileAbsPath)).toString()
                    .split(EOL)
                    .filter(line => line.trim().length >= 1);

    
    const nodes: Node[] = [];
    for(const title of items) {
        const absPath = path.join(folder, title);
        const absFilePath = `${absPath}.md`
        if(await fs.pathExists(absFilePath)) {
            nodes.push({
                type: 'document',
                title,
                folderPath: folder,
                absFilePath,
            })
        }
        else if(await fs.pathExists(absPath)) {
            nodes.push({
                type: 'folder',
                title,
                folderPath: absPath,
                absFilePath: absPath,
            });
        }

    }

    return nodes;

    // return (await fs.readFile(orderFileAbsPath)).toString()
    //     .split(EOL)
    //     .filter(line => line.trim().length >= 1)
    //     .map( (title:string) => {
    //         const absFilePath = `${folder}${path.sep}${title}.md`;

    //         if(fs.pathExistsSync(absFilePath)) {
    //             return {
    //                 type: 'document',
    //                 title,
    //                 folderPath: folder,
    //                 absFilePath,
    //             }
    //         }

    //     })
    //     .map(title => ({
    //         title,
    //         type: 'document',
    //         folderPath: folder,
    //         absFilePath: `${folder}${path.sep}${title}.md`

    //     } as Node));
}