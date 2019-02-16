import * as fs from "fs-extra";


export async function isFile (filePath: string)
{
    try {
        return (await fs.stat(filePath)).isFile();
    } catch (err) {
        return false;
    }
}


export async function isDirectory (filePath: string)
{
    try {
        return (await fs.stat(filePath)).isDirectory();
    } catch (err) {
        return false;
    }
}
