'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "errorlens" is now active!');

    // Create a decorator type that we use to decorate 'guid: <guid-value>' text items
    // Options reference @ https://code.visualstudio.com/docs/extensionAPI/vscode-api#DecorationRenderOptions
    const guidDecorationStyle = vscode.window.createTextEditorDecorationType({
        borderWidth: "1px",
        borderStyle: "solid",
        overviewRulerColor: "orange",
        overviewRulerLane: vscode.OverviewRulerLane.Left,
        cursor: "pointer",
        backgroundColor: "rgba(240,30,0,0.2)"
    });

    // isWholeLine: true,
    // borderWidth: `0 0 ${borderWidth} 0`,
    // borderStyle: `${borderStyle}`, //TODO: file bug, this shouldn't throw a lint error.
    // borderColor

    // Create decorator types that we use to amplify lines containing errors, warnings, info, etc.

    // createTextEditorDecorationType() ref. @ https://code.visualstudio.com/docs/extensionAPI/vscode-api#window.createTextEditorDecorationType
    // DecorationRenderOptions ref.  @ https://code.visualstudio.com/docs/extensionAPI/vscode-api#DecorationRenderOptions
    const errorLensDecorationStyleError : vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(240,10,0,0.4)"
    });

    const errorLensDecorationStyleWarning : vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(240,30,120,0.4)"
    });

    const errorLensDecorationStyleInfo : vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(240,160,0,0.5)"
    });

    const errorLensDecorationStyleHint : vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(20,60,0,0.5)"
    });

    // Create a new GuidMap - this will parse all .meta files in the workspace
    // const guidMap = new GuidMap();

    // Create a new FileIdMap - this will parse all <TODO> files in the workspace
    // const fileIdMap = new FileIdMap();

    let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

	// context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(e => updateStatusBar()));
	// context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(e => updateStatusBar()));
	// context.subscriptions.push(vscode.window.onDidChangeTextEditorViewColumn(e => updateStatusBar()));
	// context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(e => updateStatusBar()));
	// context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(e => updateStatusBar()));

    // context.subscriptions.push(vscode.languages.onDidChangeDiagnostics(e => 
    /* tslint:disable */
    vscode.languages.onDidChangeDiagnostics(diagnosticChangeEvent => updateErrorDecorations(diagnosticChangeEvent) );

    var timeout = null;         // tslint:disable-line
    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(updateDecorations, 500);
    }


    // /**
    //  * Update the Visual Studio Code status bar
    //  * 
    //  * @returns 
    //  */
    // function updateStatusBar() {
    //     const editor: vscode.TextEditor = vscode.window.activeTextEditor;
    //     if (!editor) {
    //         return; // No open text editor
    //     }

    //     const currentLine: number = editor.selection.active.line;
    //     const textLine: vscode.TextLine = editor.document.lineAt(currentLine);
    //     const textLineString = textLine.text;
    //     if (!activeEditor) {
    //         return;
    //     }
    
    //     guidMap.tryShowGuidReference(textLineString);
    // }

    /**
     * TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
     * TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
     * TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
     * TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
     * 
     * @returns 
     */
    function updateErrorDecorations(diagnosticChangeEvent: vscode.workspace.DiagnosticChangeEvent) {

        const errorLensDecorationOptionsError: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsWarning: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsInfo: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsHint: vscode.DecorationOptions[] = [];

        for (const uri of diagnosticChangeEvent.uris) {
            if ( uri.fsPath === vscode.window.activeTextEditor.document.uri.fsPath ) {
                console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>> uri.fsPath = " + uri.fsPath);
                console.log(">> window.activeTextEditor = " + vscode.window.activeTextEditor.document.uri.fsPath);

                // var diagnosticArray: vscode.workspace.Diagnostic = vscode.languages.getDiagnostics( uri );
                const diagnosticArray = vscode.languages.getDiagnostics( uri );
                let diagnostic: vscode.Diagnostic;
                for ( diagnostic of diagnosticArray )
                {
                    let severity = "";
                    switch (diagnostic.severity) {
                        case 0:
                            severity = "Error";
                            break;
                        case 1:
                            severity = "Warning";
                            break;
                        case 2:
                            severity = "Information";
                            break;
                        case 3:
                            severity = "Hint";
                            break;
                    }
                    console.log(">> diagnostic.message = " + diagnostic.message);
                    // diagnostic.source seems to generally be undefined. Ignore it.
                    console.log(">> diagnostic.severity = " + severity);
                    console.log(">> diagnostic.range.start.character = " + diagnostic.range.start.character);
                    console.log(">> diagnostic.range.end.character = " + diagnostic.range.end.character);
                    console.log(">> diagnostic.range.start.line = " + diagnostic.range.start.line );

                    const debugInfo = diagnostic.message + "\nSeverity = " + severity + "\nstart.line = " + diagnostic.range.start.line + "\nend.line = " + diagnostic.range.end.line;

                    // See type 'DecorationOptions'
                    // const diagnosticDecorationOptions = {
                    //     range: new vscode.Range(diagnostic.range.start, diagnostic.range.end),
                    //     hoverMessage: debugInfo
                    // };
                    // const diagnosticDecorationOptions = {
                    //     range: new vscode.Range(diagnostic.range.start, diagnostic.range.end)
                    // };
                    const diagnosticDecorationOptions = {
                        range: new vscode.Range(diagnostic.range.start, diagnostic.range.start)
                    };

                    switch (diagnostic.severity) {
                        // Error
                        case 0:
                            errorLensDecorationOptionsError.push(diagnosticDecorationOptions);
                            break;
                        // Warning
                        case 1:
                            errorLensDecorationOptionsWarning.push(diagnosticDecorationOptions);
                            break;
                        // Info
                        case 2:
                            errorLensDecorationOptionsInfo.push(diagnosticDecorationOptions);
                            break;
                        // Hint
                        case 3:
                            errorLensDecorationOptionsHint.push(diagnosticDecorationOptions);
                            break;
                    }
                }
            }
        }

        activeEditor.setDecorations(errorLensDecorationStyleError, errorLensDecorationOptionsError);
        activeEditor.setDecorations(errorLensDecorationStyleWarning, errorLensDecorationOptionsWarning);
        activeEditor.setDecorations(errorLensDecorationStyleInfo, errorLensDecorationOptionsInfo);
        activeEditor.setDecorations(errorLensDecorationStyleHint, errorLensDecorationOptionsHint);
    }

    /**
     * Update the decorations for the current editor - any lines containing 'guid: <some-guid>' will be decorated.
     * 
     * @returns 
     */
    function updateDecorations() {
        if (!activeEditor) {
            return;
        }

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
        const regEx = /guid: (\w+)/g;
        const documentText = activeEditor.document.getText();
        const guidDecorationOptions: vscode.DecorationOptions[] = [];
        let match;
// todo - get the currently opened filename, and look stuff up.

        // Iterate over the whole document text, finding guid: matches
        // For each match found, decorate the matched section of text, highlighting the guid,
        // and adding a hover message to the highlighted text areas.
        while (match = regEx.exec(documentText)) {
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);

            // match[1] is the parenthesised substring match (match[0] is the full string of chars matched)
            const referencedFile = guidMap.getReferencedFileFromGuid(match[1]);

            // const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
            // const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number _' + match[0] + '_' };
            const decoration = {
                range: new vscode.Range(startPos, endPos),
                hoverMessage: "Unity File -> " + referencedFile
            };

            guidDecorationOptions.push(decoration);
        }
        activeEditor.setDecorations(guidDecorationStyle, guidDecorationOptions);
    }

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('errorlens.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello ErrorLens World!');
    });

    context.subscriptions.push(disposable);

    // // The command has been defined in the package.json file
    // // Now provide the implementation of the command with  registerCommand
    // // The commandId parameter must match the command field in package.json
    // const disposableSayHello = vscode.commands.registerCommand("unity-navigator.sayHello", () => {
    //     // The code you place here will be executed every time your command is executed

    //     // Display a message box to the user
    //     vscode.window.showInformationMessage("Hello World!");
    //     console.log("We called showInformationMessage(hello)");
    // });

    // context.subscriptions.push(disposableSayHello);
    // context.subscriptions.push(guidMap);
}

// this method is called when your extension is deactivated
export function deactivate() {
}



/**
 * 
 * 
 * @param {string} fullPath Full system path which is expected to contain the sub-string "/Assets/"
 * @returns {string} Everything after "/Assets/".
 */
function GetPathAfterAssets( fullPath: string ): string {
    const matchAssetSubfolderRegEx = /\/Assets\/(.+)/g;

    const pathFollowingAssets = matchAssetSubfolderRegEx.exec(fullPath);
    if (pathFollowingAssets) {
        return( pathFollowingAssets[1] );
    }

    console.error("GetPathAfterAssets(): Can't find /Assets/ within path: " + fullPath );
    return null;
}



/**
 * A class which generates a dictionary of GUID values to .meta files.
 * 
 * @class GuidMap
 */
class GuidMap {

    private _statusBarItem: vscode.StatusBarItem;
    private mapGuidsToFiles = {};
    private mapFilesToGuids = {};

    /**
     * Creates an instance of GuidMap.
     * @memberof GuidMap
     */
    constructor() {
        const workspaceFolder: vscode.WorkspaceFolder = vscode.workspace.workspaceFolders[0];
        const fsPath: string = workspaceFolder.uri.fsPath;

        // console.log("GuidMap. Scanning workspace path: " + fsPath);
        this.parseMetaFileGuids(fsPath + "/", null);

        // Debug utility - show key-value pairs in the guid-to-filename dictionary
        // for (const key in this.mapGuidsToFiles) {
        //     console.log("mapGuidsToFiles[" + key + "] = " + this.mapGuidsToFiles[key]);
        // }

        // Debug utility - show key-value pairs in the filename-to-guid dictionary
        // for (const key in this.mapFilesToGuids) {
        //     console.log("mapFilesToGuids[" + key + "] = " + this.mapFilesToGuids[key]);
        // }
    }

    
    /**
     * Recursive function, iterating into directory 'dir'
     * 
     * @memberof GuidMap
     */
    public parseMetaFileGuids = function (dir, filelist) {
        const self = this;
        // console.log("parseMetaFileGuids(), dir = " + dir + ", and filelist = " + filelist);

        const fs = require("fs");
        const path = require("path");

        // console.log('parseMetaFileGuids() - parsing folder: ' + dir );
        const files = fs.readdirSync(dir);

        filelist = filelist || [];

        files.forEach(function (file) {
            // Ignore .git directories
            if (dir.includes(".git")) {
                return filelist;
            }

            // console.log('statSync(dir + file) = ' + (dir + file));
            if (fs.statSync(dir + file).isDirectory()) {
                // This is a directory - walk into it
                self.parseMetaFileGuids(dir + file + "/", filelist, self.mapGuidsToFiles);
            }
            else {
                // This is a file
                filelist.push(file);

                // Parse .meta files, searching for guid: and putting guid values into a map
                if (path.extname(file) === ".meta") {
                    // console.log('scanning file: ' + (file));

                    // https://stackoverflow.com/questions/6831918/node-js-read-a-text-file-into-an-array-each-line-an-item-in-the-array

                    // Read in the file, splitting by newline (Converting Windows EOLs to *nix EOLs)
                    const linesInFile = fs.readFileSync(dir + file).toString().replace(/\r\n/g, "\n").split("\n");

                    const matchGuidRegEx = /guid: (\w+)/;

                    for (const i in linesInFile) {
                        const lineString = linesInFile[i];
                        const findGuidValue = lineString.match(matchGuidRegEx);
                        if (findGuidValue !== null) {
                            // regex matched, so we found 'guid: <long hex sequence>'
                            // findGuidValue[0] = source i.e. lineString
                            // findGuidValue[1] = captured part #1, i.e. guidValue = (\w+)

                            // e.g. /home/phil/git/Unity_Projects/UnityExample/Assets/Scripts/Test.cs.meta
                            // or:  c:\Users\phil\git\Unity_Projects\UnityExample/Assets/Scripts/Test.cs.meta
                            const fullPath = dir + file;

                            // We want to strip the path prior to '/Assets/', leaving the string after /Assets/
                            const pathAfterAssets = GetPathAfterAssets(fullPath);

                            if (pathAfterAssets !== null) {
                                // console.log('   ... findRelativeAssetPath = ' + findRelativeAssetPath[1]);
                                if (self.mapGuidsToFiles[findGuidValue[1]] !== undefined) {
                                    console.error("guid " + findGuidValue[1] + " is already in the map. (" +
                                    self.mapGuidsToFiles[findGuidValue[1]] + "). This should not happen");
                                }
                                else {
                                    // Store in map. key = guid, value = filename
                                    self.mapGuidsToFiles[findGuidValue[1]] = pathAfterAssets;
                                    // console.log("parseMetaFileGuids(): mapGuidsToFiles[" + findGuidValue[1] + "] = " + pathAfterAssets );

                                    // Store in map. key = filename, value = guid
                                    self.mapFilesToGuids[pathAfterAssets] = findGuidValue[1];
                                    // console.log("parseMetaFileGuids(): mapFilesToGuids[" + pathAfterAssets + "] = " + findGuidValue[1] );
                                }
                            }
                            else {
                                console.error("parseMetaFileGuids(): Unable to regEx the asset path from: " + fullPath);
                            }

                            // exit for loop after the first guid: (may be other lines containing guid:
                            // but these are just references)
                            // Bonus - guid: line in .meta files are generally on the 2nd line, so this
                            // has the effect of skipping a great deal of unnecessary additional parsing.
                            break;
                        }
                    }
                }
            }
        });
        return filelist;
    };

    /**
     * Wrapper which safely gets the filename from the supplied guid.
     * If the guid isn't valid (null or undefined) the returned string indicates an error occurred.
     * 
     * @param {string} guid A guid
     * @returns {string} The filename which the 'guid' argument refers to.
     * @memberof GuidMap
     */
    public getReferencedFileFromGuid(guid: string): string {
        if (guid !== null && guid !== undefined) {
            return (this.mapGuidsToFiles[guid]);
        }
        return ("getReferencedFileFromGuid() - null or undefined guid");
    }

    /**
     * Given some text, if it contains "guid: <some-guid>", the reference to said Guid
     * will be shown in the status bar.
     * 
     * @param {string} lineOfEditorText The whole line of text the cursor is currently on.
     * @memberof GuidMap
     */
    public tryShowGuidReference(lineOfEditorText: string) {
        // Create _statusBarItem if needed
        if (!this._statusBarItem) {
            console.log("tryShowGuidReference() - doing createStatusBarItem()");
            this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }

        const regex = /guid: (\w+)/;
        const result = lineOfEditorText.match(regex);
        if (result !== null) {
            // console.log("tryShowGuidReference() - line contains guid:");

            // regex matched, so we found 'guid: <long hex sequence>'
            // console.log( 'guid of ' + dir + file + ' = ' + result[1] );
            if (this.mapGuidsToFiles[result[1]] !== undefined) {
                // console.log("   guid: " + result[1] + " -> " + this.mapGuidsToFiles[result[1]]);
                // this.updateStatusBarWithGuidRef(result[1]);
                // vscode.window.showInformationMessage('GUID ' + result[1] + ' -> ' + mapGuidsToFiles[result[1]]);
            }
            else {
                console.error("   guid: " + result[1] + " -> not found!");
            }
        }
        else {
            this._statusBarItem.hide();
            // console.log("tryShowGuidReference() - line does not contain guid:");
        }
    }

    dispose() {
        // this._statusBarItem.dispose();
    }
}   // class GuidMap


