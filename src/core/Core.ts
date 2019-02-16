import { Disposable, ExtensionContext } from "vscode";


export default class Core implements Disposable
{

    private readonly context: ExtensionContext;

    constructor (context: ExtensionContext)
    {
        this.context = context;

    }



    dispose ()
    {
        throw new Error("Method not implemented.");
    }
    
}