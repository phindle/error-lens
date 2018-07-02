'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let _statusBarItem: vscode.StatusBarItem;

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    console.log('Visual Studio Code Extension "errorlens" is now active');

    // Create decorator types that we use to amplify lines containing errors, warnings, info, etc.

    // createTextEditorDecorationType() ref. @ https://code.visualstudio.com/docs/extensionAPI/vscode-api#window.createTextEditorDecorationType
    // DecorationRenderOptions ref.  @ https://code.visualstudio.com/docs/extensionAPI/vscode-api#DecorationRenderOptions
    const errorLensDecorationStyleError: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(240,10,0,0.5)"
    });

    const errorLensDecorationStyleWarning: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(180,150,0,0.5)"
    });

    const errorLensDecorationStyleInfo: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(240,200,0,0.5)"
    });

    const errorLensDecorationStyleHint: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(20,100,0,0.5)"
    });

    // context.subscriptions.push(vscode.languages.onDidChangeDiagnostics(e => 
    vscode.languages.onDidChangeDiagnostics(diagnosticChangeEvent => updateErrorDecorations(diagnosticChangeEvent) );

    /**
     * Invoked by onDidChangeDiagnostics() when the language diagnostics change.
     *
     * @param {vscode.DiagnosticChangeEvent} diagnosticChangeEvent - Contains info about the change in diagnostics.
     */
    function updateErrorDecorations(diagnosticChangeEvent: vscode.DiagnosticChangeEvent) {
        if( !vscode.window ) {
            return;
        }

        const activeTextEditor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if( !activeTextEditor ) {
            return;
        }

        const errorLensDecorationOptionsError: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsWarning: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsInfo: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsHint: vscode.DecorationOptions[] = [];
        let numErrors = 0;
        let numWarnings = 0;

        for (const uri of diagnosticChangeEvent.uris) {
            // Only update decorations for the active text editor.
            if ( uri.fsPath === activeTextEditor.document.uri.fsPath ) {
                // console.log( " ");
                // console.log("- uri.fsPath = " + uri.fsPath);
                // console.log("- window.activeTextEditor = " + activeTextEditor.document.uri.fsPath);

                // Iterate over each diagnostic flagged in this file (uri). For each one, 
                let diagnostic : vscode.Diagnostic;

                // The aggregatedDiagnostics object will contain one or more objects, each object being keyed by "lineN",
                // where N is the source line where one or more diagnostics are being reported.
                // Each object which is keyed by "lineN" will contain one or more singleDiagnostics[] array of objects.
                // This facilitates gathering info about lines which contain more than one diagnostic.
                // {
                //     line28: {
                //         line: 28,
                //         singleDiagnostics: [
                //             {
                //                 severity: 1,                                  // 1 => Warning
                //                 message: "Unused Variable 'example'",
                //                 range: <range>
                //             }
                //         ]
                //     },
                //     line67: {
                //         line: 67,
                //         singleDiagnostics: [
                //             {
                //                 severity: 0,                                  // 0 => Error
                //                 message: "Missing semi-colon'"
                //                 range: <range>
                //             },
                //             {
                //                 severity: 0,                                  // 0 => Error
                //                 message: "Unknown method 'XYZ()'"
                //                 range: <range>
                //             }
                //         ]
                //     },
                //     line93: {
                //         line: 93,
                //         singleDiagnostics: [
                //             {
                //                 severity: 0,                                  // 0 => Error
                //                 message: "Missing argument to function Example()"
                //                 range: <range>
                //             }
                //         ]
                //     }
                // };

                let aggregatedDiagnostics : any = {};

                // Iterate over the diagnostics VS Code has reported for this file. For each one, add to
                // a list of objects, grouping together diagnostics which occur on a single line.
                for ( diagnostic of vscode.languages.getDiagnostics( uri ) )
                {
                    let diagnosticLine = diagnostic.range.start.line;
                    let key = "line" + diagnosticLine;

                    let singleDiagnostic = {
                        severity: diagnostic.severity,
                        message: diagnostic.message,
                        range: new vscode.Range(diagnostic.range.start, diagnostic.range.end)
                    };

                    if( aggregatedDiagnostics[key] )
                    {
                        // Already added an object for this key, so add onto the singleDiagnostics[] array.
                        aggregatedDiagnostics[key].singleDiagnostics.push( singleDiagnostic );
                    }
                    else
                    {
                        // Create a new object for this key, specifying the line: and a singleDiagnostics[] array
                        aggregatedDiagnostics[key] = {
                            line: diagnosticLine,
                            singleDiagnostics: [ singleDiagnostic ]
                        };
                    }

                    switch (diagnostic.severity)
                    {
                        case 0:
                            numErrors += 1;
                            break;

                        case 1:
                            numWarnings += 1;
                            break;

                        // Ignore other severities.
                    }
                }

                let key : any;
                for ( key in aggregatedDiagnostics )       // Iterate over propery values (not names)
                {
                    // console.log( "aggregatedDiagnostic = " + aggregatedDiagnostic);
                    // var x = aggregatedDiagnostic;
                    let aggregatedDiagnostic = aggregatedDiagnostics[key];

                    let messagePrefix : string;

                    if( aggregatedDiagnostic.singleDiagnostics.length > 1 )
                    {
                        // If > 1 diagnostic for this source line, the prefix is "Diagnostic #1 of N: "
                        messagePrefix = "Diagnostic #1 of " + aggregatedDiagnostic.singleDiagnostics.length + ": ";
                    }
                    else
                    {
                        // If only 1 diagnostic for this source line, show the diagnostic severity
                        switch (aggregatedDiagnostic.singleDiagnostics[0].severity)
                        {
                            case 0:
                                messagePrefix = "Error: ";
                                break;

                            case 1:
                                messagePrefix = "Warning: ";
                                break;

                            case 2:
                                messagePrefix = "Info: ";
                                break;

                            case 3:
                            default:
                                messagePrefix = "Hint: ";
                                break;
                        }
                    }

                    // Generate a DecorationInstanceRenderOptions object which specifies the text which will be rendered
                    // after the source-code line in the editor, and text rendering options.
                    const decInstanceRenderOptions : vscode.DecorationInstanceRenderOptions = {
                        after: {
                            contentText: messagePrefix + aggregatedDiagnostic.singleDiagnostics[0].message,
                            fontStyle: "italic",
                            fontWeight: "normal",
                            margin: "80px"
                        }
                    };

                    // See type 'DecorationOptions': https://code.visualstudio.com/docs/extensionAPI/vscode-api#DecorationOptions
                    const diagnosticDecorationOptions : vscode.DecorationOptions = {
                        range: aggregatedDiagnostic.singleDiagnostics[0].range,
                        renderOptions: decInstanceRenderOptions
                    };

                    switch (aggregatedDiagnostic.singleDiagnostics[0].severity)
                    {
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

        if( numErrors + numWarnings === 0 )
        {
            updateStatusBar("ErrorLens: No errors or warnings", "");
        }
        else
        {
            updateStatusBar("$(bug) ErrorLens: " + numErrors + " error(s) and " + numWarnings + " warning(s).", "rgba(250, 100, 20, 1.0)" );
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
        // if( textColor !== "")
        // {
        //     _statusBarItem.color = textColor;
        // }
        // else
        // {
        //     _statusBarItem.color = undefined;
        // }
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
