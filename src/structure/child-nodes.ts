import * as Markdown from "markdown-it";
import * as fs from "fs-extra";
import * as path from "path";
import { EOL } from "os";

import { isFile, isDirectory } from "../util/fs";
import {
  StructureNode,
  StructureNodeType,
  DocumentNode,
  SectionNode
} from "./StructureNode";
import getMarkdownHeadings from "../util/markdown";



export async function getChildNodes(parentNode: StructureNode): Promise<StructureNode[]>
{
  let childNodes: StructureNode[] = [];

  switch (parentNode.type) {
    case StructureNodeType.Section: break;
    case StructureNodeType.Document: {
      childNodes = await getChildNodesForDocument(parentNode);
      break;
    }

    default: {
      console.warn(`Node to type ${parentNode.type} has no child finder`);
    }
  }

  childNodes.forEach(node => {
    node.parent = parentNode;
  })
  parentNode.childNodes = childNodes;

  return childNodes;
}


export async function getChildNodesForDocument(parentNode: DocumentNode): Promise<StructureNode[]>
{
  let nodes: StructureNode[] = [];

  if (parentNode.filePath) {
    nodes = nodes.concat(await getChildNodesFromMarkdownFile(parentNode.filePath));
  }
  if (parentNode.folderPath) {
    nodes = nodes.concat(await getChildNodesFromFolderPath(parentNode.folderPath));
  }
  return nodes;
}

/**
 * Finds all child nodes for a particular File node.
 *
 * Since a FileNode cannot have any FileNode or FolderNode children,
 * it will only return SectionNodes, if anything.
 *
 * @param parentNode The node to find children for
 */
export async function getChildNodesFromMarkdownFile( filePath: string ): Promise<StructureNode[]>
{
  if (!(await fs.pathExists(filePath))) {
    throw new Error(`File node not found at path ${filePath}`);
  }

  const fileContent = (await fs.readFile(filePath)).toString();
  const astContext = {};

  const headings = getMarkdownHeadings(fileContent);
  headings.shift();
  return headings.map(heading => ({
      type: StructureNodeType.Section,
      id: `${Math.round(Math.random()*9999)}`,
      filePath,
      lineNumber: heading.line,
      name: heading.text,
    } as SectionNode));
}


export async function getChildNodesFromFolderPath(folderPath: string): Promise<StructureNode[]>
{
  let nodes: StructureNode[] = [];

  // Check for a `.order` file
  const orderFilePath = path.join(folderPath, ".order");
  const orderFileExists = await isFile(orderFilePath);

  return orderFileExists
    ? await getChildNodesFromOrderFile(folderPath, orderFilePath)
    : await getChildNodesFromDirectoryContents(folderPath);
}


export async function getChildNodesFromOrderFile(folderPath: string, orderFilePath: string): Promise<StructureNode[]>
{
  const nodes: StructureNode[] = [];

  const names = (await fs.readFile(orderFilePath))
    .toString()
    .split(EOL)
    .map((item: string) => item.trim())
    .filter((item: string) => item.length >= 1);

  return await getChildNodesFromListOfNames(folderPath, names);
}


export async function getChildNodesFromDirectoryContents(folderPath: string): Promise<StructureNode[]>
{
  const names = (await fs.readdir(folderPath)).map( (name: string) => name.replace(/\.md$/,''));
  return await getChildNodesFromListOfNames(folderPath, names);
}



export async function getChildNodesFromListOfNames( folderPath: string, names: string[]): Promise<StructureNode[]>
{
  const nodes: StructureNode[] = [];

  for (const name of names) {
    const node: DocumentNode = {
      name,
      type: StructureNodeType.Document,
      id: Math.round(Math.random() * 999).toString() //@TODO: Make this not shit
    };

    // Check for a file
    const childFilePath = path.join(folderPath, `${name}.md`);
    if (await isFile(childFilePath)) {
      node.filePath = childFilePath;
    }

    // Check for a folder
    const childFolderPath = path.join(folderPath, name);
    if (await isDirectory(childFolderPath)) {
      node.folderPath = childFolderPath;
    }

    if (node.filePath || node.folderPath) {
      nodes.push(node);
    } else {
      console.warn(`Document Node ${name} has no children`);
    }
  }

  return nodes;
}
