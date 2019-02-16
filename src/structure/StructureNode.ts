

export enum StructureNodeType {
    File = 'file',
    Folder = 'folder',
    FileFolder = 'file-folder',
    Section = 'section',
    Document = 'document'
}

export interface StructureNodeBase {
    type: StructureNodeType;
    id: string;
    name: string;
    parent?: StructureNode;
    childNodes?: StructureNode[];
}


export interface DocumentNode extends StructureNodeBase {
    type: StructureNodeType.Document;
    filePath?: string;
    folderPath?: string;
}


export interface FileNode extends StructureNodeBase {
    type: StructureNodeType.File;
    filePath: string;
}

export interface FolderNode extends StructureNodeBase {
    type: StructureNodeType.Folder;
    folderPath: string;
}

export interface FileFolderNode extends StructureNodeBase {
    type: StructureNodeType.FileFolder;
    filePath: string;
    folderPath: string;
}

export interface SectionNode extends StructureNodeBase {
    type: StructureNodeType.Section;
    filePath: string;
    lineNumber: number;
}


export type StructureNode = FileNode | FolderNode | FileFolderNode | SectionNode | DocumentNode;

