import * as markdown from 'markdown-it';

const md = markdown();

export interface MarkdownHeading {
    text: string;
    line: number;
    level: number;
}

enum ParserState {
    Outside = 'outside',
    Inside = 'inside',
}


export default function getMarkdownHeadings (content: string): MarkdownHeading[]
{
    const mdContext = {};
    const mdNodes = md.parse(content, mdContext);

    const headings: MarkdownHeading[] = [];

    let insideHeading = false;
    let currentHeading: MarkdownHeading | null = null;
    let innerNodes = [];

    for(const node of mdNodes) {

        if(insideHeading) {

            if(node.type === 'heading_close') {

                (currentHeading as MarkdownHeading).text = innerNodes
                    .map(inode => inode.content)
                    .join('');

                insideHeading = false;
                headings.push(currentHeading as MarkdownHeading);
                currentHeading = null;
                innerNodes = [];
            } else {
                innerNodes.push(node);
            }

        } else {
            // Waiting for header open
            if(node.type === 'heading_open') {
                insideHeading = true;
                currentHeading = {
                    line: node.map[0],
                    level: node.level,
                    text: '',
                }
            }
        }
    }

    return headings;
}