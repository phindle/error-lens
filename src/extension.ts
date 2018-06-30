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

    // Create decorator types that we use to amplify lines containing errors, warnings, info, etc.

    // createTextEditorDecorationType() ref. @ https://code.visualstudio.com/docs/extensionAPI/vscode-api#window.createTextEditorDecorationType
    // DecorationRenderOptions ref.  @ https://code.visualstudio.com/docs/extensionAPI/vscode-api#DecorationRenderOptions
    const errorLensDecorationStyleError: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(240,10,0,0.4)"
    });

    const errorLensDecorationStyleWarning: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(240,30,120,0.4)"
    });

    const errorLensDecorationStyleInfo: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(240,160,0,0.5)"
    });

    const errorLensDecorationStyleHint: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(20,60,0,0.5)"
    });

    // context.subscriptions.push(vscode.languages.onDidChangeDiagnostics(e => 
    vscode.languages.onDidChangeDiagnostics(diagnosticChangeEvent => updateErrorDecorations(diagnosticChangeEvent) );



    /**
     * Invoked by onDidChangeDiagnostics() when the language diagnostics change.
     *
     * @param {vscode.DiagnosticChangeEvent} diagnosticChangeEvent - Contains event data pertaining to the change in diagnostics.
     */
    function updateErrorDecorations(diagnosticChangeEvent: vscode.DiagnosticChangeEvent) {
        if( !vscode.window ) {
            return;
        }
        if( !vscode.window.activeTextEditor ) {
            return;
        }
        let activeTextEditor = vscode.window.activeTextEditor;

        const errorLensDecorationOptionsError: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsWarning: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsInfo: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsHint: vscode.DecorationOptions[] = [];

        for (const uri of diagnosticChangeEvent.uris) {
            // Only update decorations for the active text editor.
            if ( uri.fsPath === activeTextEditor.document.uri.fsPath ) {
                console.log("- uri.fsPath = " + uri.fsPath);
                console.log("- window.activeTextEditor = " + activeTextEditor.document.uri.fsPath);

                const diagnosticArray : vscode.Diagnostic[] = vscode.languages.getDiagnostics( uri );

                // Iterate over each diagnostic flagged in this file (uri). For each one, 
                let diagnostic : vscode.Diagnostic;

                for ( diagnostic of diagnosticArray )
                {
                    // See type 'DecorationOptions': https://code.visualstudio.com/docs/extensionAPI/vscode-api#DecorationOptions
                    const diagnosticDecorationOptions : vscode.DecorationOptions = {
                        range: new vscode.Range(diagnostic.range.start, diagnostic.range.end)
                        // hoverMessage: hoverStringHere
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

        activeTextEditor.setDecorations(errorLensDecorationStyleError, errorLensDecorationOptionsError);
        activeTextEditor.setDecorations(errorLensDecorationStyleWarning, errorLensDecorationOptionsWarning);
        activeTextEditor.setDecorations(errorLensDecorationStyleInfo, errorLensDecorationOptionsInfo);
        activeTextEditor.setDecorations(errorLensDecorationStyleHint, errorLensDecorationOptionsHint);
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
}

// this method is called when your extension is deactivated
export function deactivate() {
}
