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

    let activeEditor = vscode.window.activeTextEditor;

    // context.subscriptions.push(vscode.languages.onDidChangeDiagnostics(e => 
    vscode.languages.onDidChangeDiagnostics(diagnosticChangeEvent => updateErrorDecorations(diagnosticChangeEvent) );

    // var timeout = null;         // tslint:disable-line
    // function triggerUpdateDecorations() {
    //     if (timeout) {
    //         clearTimeout(timeout);
    //     }
    //     timeout = setTimeout(updateDecorations, 500);
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
        if (!activeEditor) {
            return;
        }

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
