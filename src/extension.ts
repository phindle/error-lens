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
        backgroundColor: "rgba(240,10,0,0.3)"
    });

    const errorLensDecorationStyleWarning: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(240,30,120,0.3)"
    });

    const errorLensDecorationStyleInfo: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(240,160,0,0.3)"
    });

    const errorLensDecorationStyleHint: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(20,60,0,0.3)"
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
                // console.log( " ");
                // console.log("- uri.fsPath = " + uri.fsPath);
                // console.log("- window.activeTextEditor = " + activeTextEditor.document.uri.fsPath);

                // const diagnosticArray : vscode.Diagnostic[] = vscode.languages.getDiagnostics( uri );

                // Iterate over each diagnostic flagged in this file (uri). For each one, 
                let diagnostic : vscode.Diagnostic;

                // The aggregatedDiagnostics object will contain one or more objects, each object being keyed by "lineN",
                // where N is the source line where one or more diagnostics are being reported.
                // Each object which is keyed by "lineN" will contain one, or more, severityAndMessage[] array of objects.
                // This facilitates gathering info about lines which contain more than one diagnostic.
                // {
                //     line28: {
                //         line: 28,
                //         severityAndMessage: [
                //             {
                //                 diagnosticSeverity: 1,                                  // 1 => Warning
                //                 diagnosticMessage: "Unused Variable 'example'"
                //             }
                //         ]
                //     },
                //     line67: {
                //         line: 67,
                //         severityAndMessage: [
                //             {
                //                 diagnosticSeverity: 0,                                  // 0 => Error
                //                 diagnosticMessage: "Missing semi-colon'"
                //             },
                //             {
                //                 diagnosticSeverity: 0,                                  // 0 => Error
                //                 diagnosticMessage: "Unknown method 'XYZ()'"
                //             }
                //         ]
                //     },
                //     line93: {
                //         line: 93,
                //         severityAndMessage: [
                //             {
                //                 diagnosticSeverity: 0,                                  // 0 => Error
                //                 diagnosticMessage: "Missing argument to function Example()"
                //             }
                //         ]
                //     }
                // };

                let aggregatedDiagnostics : any = {};                                   // TODO - need a much better name than this!!!

                // Iterate 
                for ( diagnostic of vscode.languages.getDiagnostics( uri ) )
                {
                    let diagnosticLine = diagnostic.range.start.line;
                    let key = "line" + diagnosticLine;

                    let severityAndMessage = {
                        diagnosticSeverity: diagnostic.severity,
                        diagnosticMessage: diagnostic.message
                    };

                    if( aggregatedDiagnostics[key] )
                    {
                        aggregatedDiagnostics[key].severityAndMessages.push( severityAndMessage );
                    }
                    else
                    {
                        // Create a new object for this key, specifying the line: and a severityAndMessage[] array
                        let newDiag = {
                            line: diagnosticLine,
                            severityAndMessages: [ severityAndMessage ]
                        };

                        aggregatedDiagnostics[key] = newDiag ;
                    }
                }

                for ( diagnostic of vscode.languages.getDiagnostics( uri ) )
                {
// ------------------------------------------------------------
// ------------------------------------------------------------
                    // let testString = "TESTING 1..2..3..";
                    // let diagnosticLine = diagnostic.range.start.line;
                    // let diagnosticStartChar = diagnostic.range.end.character;
                    // let diagnosticEndChar = diagnosticStartChar + testString.length;

                    // let testRange = new vscode.Range( diagnosticLine, diagnosticStartChar, diagnosticLine, diagnosticEndChar );
                    // const test_diagnosticDecorationOptions : vscode.DecorationOptions = {
                    //     range: testRange
                    //     // hoverMessage: hoverStringHere
                    // };
                    // test_diagnosticDecorationOptions.

                    let diagnosticSource = "";
                    if( diagnostic.source )
                    {
                        diagnosticSource = "[" + diagnostic.source + "] ";
                    }

                    let severityString;
                    switch (diagnostic.severity) {
                        // Error
                        case 0:
                            severityString = "Error: ";
                            break;
                        // Warning
                        case 1:
                            severityString = "Warning: ";
                            break;
                        // Info
                        case 2:
                            severityString = "Info: ";
                            break;
                        // Hint
                        case 3:
                            severityString = "Hint: ";
                            break;
                    }

                    const decInstanceRenderOptions : vscode.DecorationInstanceRenderOptions = {
                        after: {
                            contentText: diagnosticSource + severityString + diagnostic.message,
                            fontStyle: "italic",
                            fontWeight: "normal",
                            margin: "100px"
                        }
                    };
// ------------------------------------------------------------
// ------------------------------------------------------------
                    console.log( severityString + diagnostic.message + " on line " + diagnostic.range.start.line + " to " + diagnostic.range.end.line );

                    // See type 'DecorationOptions': https://code.visualstudio.com/docs/extensionAPI/vscode-api#DecorationOptions
                    const diagnosticDecorationOptions : vscode.DecorationOptions = {
                        range: new vscode.Range(diagnostic.range.start, diagnostic.range.end),
                        renderOptions: decInstanceRenderOptions
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

        // activeTextEditor.setDecorations( decorationType : TextEditorDecorationType, rangesOrOptions : Range[] | DecorationOptions[] );
        //                                                               ^ what we're using for this
        //                                                                                                                  ^ what we're using for this

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
            updateStatusBar("$(bug) ErrorLens: " + numErrors + " error(s) and " + numWarnings + " warning(s). $(bug)", "rgba(250, 100, 20, 1.0)" );
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
