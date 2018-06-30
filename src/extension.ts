'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let _statusBarItem: vscode.StatusBarItem;

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
        const activeTextEditor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;

        const errorLensDecorationOptionsError: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsWarning: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsInfo: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsHint: vscode.DecorationOptions[] = [];

        for (const uri of diagnosticChangeEvent.uris) {
            // Only update decorations for the active text editor.
            if ( uri.fsPath === activeTextEditor.document.uri.fsPath ) {
                // console.log("- uri.fsPath = " + uri.fsPath);
                // console.log("- window.activeTextEditor = " + activeTextEditor.document.uri.fsPath);

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

        let numErrors = errorLensDecorationOptionsError.length;
        let numWarnings = errorLensDecorationOptionsWarning.length;
        if( numErrors + numWarnings === 0 )
        {
            updateStatusBar("ErrorLens: No errors or warnings", "");
        }
        else
        {
            updateStatusBar("$(bug) ErrorLens: " + numErrors + " error(s) and " + numWarnings + " warning(s). $(bug)", "rgba(250, 100, 100, 1.0)" );
        }
    }



    /**
     * Update the Visual Studio Code status bar
     *
     * @param {string} statusBarText - Text to show in the Status Bar.
     * @param {string} textColor - Colour as string, e.g. "rgba(255, 255, 255, 1.0), or "" to use standard text colour.
     * @returns
     */
    function updateStatusBar( statusBarText : string, textColor : string ) {
        // Create _statusBarItem if needed
        if (!_statusBarItem) {
            _statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }

        const activeTextEditor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            // No open text editor
            _statusBarItem.hide();
            return;
        }

        _statusBarItem.text = statusBarText;
        if( textColor !== "")
        {
            _statusBarItem.color = textColor;
        }
        else
        {
            _statusBarItem.color = undefined;
        }
        _statusBarItem.show();
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
