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
    const errorLensDecorationTypeError: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(240,10,0,0.5)"
    });

    const errorLensDecorationTypeWarning: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(180,150,0,0.5)"
    });

    const errorLensDecorationTypeInfo: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(240,200,0,0.5)"
    });

    const errorLensDecorationTypeHint: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: "rgba(20,100,0,0.5)"
    });

    // context.subscriptions.push(vscode.languages.onDidChangeDiagnostics(e => 
    vscode.languages.onDidChangeDiagnostics(diagnosticChangeEvent => {onChangedDiagnostics(diagnosticChangeEvent); }, null, context.subscriptions );

    // vscode.window.onDidChangeActiveTextEditor(editor => { console.log( "onDidChangeActiveTextEditor()" ); }, null, context.subscriptions);
    // vscode.workspace.onDidChangeTextDocument(editor => { console.log( "onDidChangeTextDocument()" ); }, null, context.subscriptions);
	// vscode.window.onDidChangeTextEditorSelection(editor => { console.log( "onDidChangeTextEditorSelection()" ); }, null, context.subscriptions);
	// vscode.window.onDidChangeTextEditorViewColumn(editor => { console.log( "onDidChangeTextEditorViewColumn()" ); }, null, context.subscriptions);
	vscode.workspace.onDidOpenTextDocument(textDocument => { updateDecorationsForUri( textDocument.uri ); }, null, context.subscriptions );
	// vscode.workspace.onDidCloseTextDocument(textDocument => { console.log( "onDidCloseTextDocument()" ); }, null, context.subscriptions);

    // vscode.workspace.onDidChangeTextDocument(event => {
    //     if (activeEditor && event.document === activeEditor.document) {
    //         triggerUpdateDecorations();
    //     }
    // }, null, context.subscriptions);

	// context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(e => updateStatusBar()));
	// context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(e => updateStatusBar()));
	// context.subscriptions.push(vscode.window.onDidChangeTextEditorViewColumn(e => updateStatusBar()));
	// context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(e => updateStatusBar()));
	// context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(e => updateStatusBar()));


    /**
     * Invoked by onDidChangeDiagnostics() when the language diagnostics change.
     *
     * @param {vscode.DiagnosticChangeEvent} diagnosticChangeEvent - Contains info about the change in diagnostics.
     */
    function onChangedDiagnostics(diagnosticChangeEvent: vscode.DiagnosticChangeEvent)
    {
        if( !vscode.window )
        {
            console.log( "Exit onChangedDiagnostics() - !vscode.window" );
            return;
        }

        const activeTextEditor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if( !activeTextEditor )
        {
            console.log( "Exit onChangedDiagnostics() - !activeTextEditor" );
            return;
        }
        

        for (const uri of diagnosticChangeEvent.uris)
        {
            // Only update decorations for the active text editor.
            if ( uri.fsPath === activeTextEditor.document.uri.fsPath )
            {
                updateDecorationsForUri( uri );
                break;
            }
        }
    }



    /**
     * todo
     *
     * @param {vscode.Uri} uri - Uri to add decorations to.
     */
    function updateDecorationsForUri( uri : vscode.Uri ) {
        if ( !uri )
        {
            console.log( "Exit updateDecorationsForUri() - uri = empty" );
            return;
        }

        if( !vscode.window )
        {
            console.log( "Exit updateDecorationsForUri() - !vscode.window" );
            return;
        }

        const activeTextEditor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if( !activeTextEditor )
        {
            console.log( "Exit updateDecorationsForUri() - !activeTextEditor" );
            return;
        }

        if ( !activeTextEditor.document.uri.fsPath )
        {
            console.log( "Exit updateDecorationsForUri() - activeTextEditor.document.uri.fsPath = empty" );
            return;
        }

        // Weirdness - when switching between files (using ctrl+Tab), I'll see the .fsPath properties like so:
        // activeTextEditor.document.uri.fsPath = c:\Users\Phil Hindle\git\Unity_Projects\RunOutTest\RunOut_UnityProject\Assets\Scripts\RotateCameraTest.cs
        // uri.fsPath                           = c:\Users\Phil Hindle\git\Unity_Projects\RunOutTest\RunOut_UnityProject\Assets\Scripts\RotateCameraTest.cs.git
        // See the .git on the end of uri.fsPath, wtf?!
        // So whilst it seems sensible to check the path of the active text editor is the same as uri.fsPath, this
        // comparison fails due to the spurious .git on the end of uri.fsPath.
        // For this reason, we don't do the check.
        // Subsequent references to the path in this function refer to activeTextEditor.document.uri, since that
        // seems to be 'correct' whilst uri.fsPath seems broken.

        // if ( activeTextEditor.document.uri.fsPath !== uri.fsPath )
        // {
        //     console.log( "Exit updateDecorationsForUri() - activeTextEditor.document.uri.fsPath = " + activeTextEditor.document.uri.fsPath );
        //     console.log( "Exit updateDecorationsForUri() - uri.fsPath = " + uri.fsPath );
        //     console.log( "Exit updateDecorationsForUri() - activeTextEditor.document.uri.fsPath !== uri.fsPath" );
        // }

        const errorLensDecorationOptionsError: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsWarning: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsInfo: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsHint: vscode.DecorationOptions[] = [];
        let numErrors = 0;
        let numWarnings = 0;


        // console.log( "updateDecorationsForUri() - uri.fsPath === activeTextEditor.document.uri.fsPath = " + activeTextEditor.document.uri.fsPath );

        // Iterate over each diagnostic flagged in this file (uri). For each one, 
        let diagnostic : vscode.Diagnostic;

        // The aggregatedDiagnostics object will contain one or more objects, each object being keyed by "lineN",
        // where N is the source line where one or more diagnostics are being reported.
        // Each object which is keyed by "lineN" will contain one or more arrayDiagnostics[] array of objects.
        // This facilitates gathering info about lines which contain more than one diagnostic.
        // {
        //     line28: {
        //         line: 28,
        //         arrayDiagnostics: [ <vscode.Diagnostic #1> ]
        //     },
        //     line67: {
        //         line: 67,
        //         arrayDiagnostics: [ <vscode.Diagnostic# 1>, <vscode.Diagnostic# 2> ]
        //     },
        //     line93: {
        //         line: 93,
        //         arrayDiagnostics: [ <vscode.Diagnostic #1> ]
        //     }
        // };

        let aggregatedDiagnostics : any = {};


        // Iterate over the diagnostics VS Code has reported for this file. For each one, add to
        // a list of objects, grouping together diagnostics which occur on a single line.
        for ( diagnostic of vscode.languages.getDiagnostics( activeTextEditor.document.uri ) )
        {
            let key = "line" + diagnostic.range.start.line;

            if( aggregatedDiagnostics[key] )
            {
                // Already added an object for this key, so add onto the arrayDiagnostics[] array.
                aggregatedDiagnostics[key].arrayDiagnostics.push( diagnostic );
            }
            else
            {
                // Create a new object for this key, specifying the line: and a arrayDiagnostics[] array
                aggregatedDiagnostics[key] = {
                    line: diagnostic.range.start.line,
                    arrayDiagnostics: [ diagnostic ]
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
            let aggregatedDiagnostic = aggregatedDiagnostics[key];
            let messagePrefix : string;

            if( aggregatedDiagnostic.arrayDiagnostics.length > 1 )
            {
                // If > 1 diagnostic for this source line, the prefix is "Diagnostic #1 of N: "
                messagePrefix = "Diagnostic #1 of " + aggregatedDiagnostic.arrayDiagnostics.length + ": ";
            }
            else
            {
                // If only 1 diagnostic for this source line, show the diagnostic severity
                switch (aggregatedDiagnostic.arrayDiagnostics[0].severity)
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
                    contentText: messagePrefix + aggregatedDiagnostic.arrayDiagnostics[0].message,
                    fontStyle: "italic",
                    fontWeight: "normal",
                    margin: "80px"
                }
            };

            // See type 'DecorationOptions': https://code.visualstudio.com/docs/extensionAPI/vscode-api#DecorationOptions
            const diagnosticDecorationOptions : vscode.DecorationOptions = {
                range: aggregatedDiagnostic.arrayDiagnostics[0].range,
                renderOptions: decInstanceRenderOptions
            };

            switch (aggregatedDiagnostic.arrayDiagnostics[0].severity)
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

        // The errorLensDecorationOptions* object(s) have been built, now apply them.
        activeTextEditor.setDecorations(errorLensDecorationTypeError, errorLensDecorationOptionsError);
        activeTextEditor.setDecorations(errorLensDecorationTypeWarning, errorLensDecorationOptionsWarning);
        activeTextEditor.setDecorations(errorLensDecorationTypeInfo, errorLensDecorationOptionsInfo);
        activeTextEditor.setDecorations(errorLensDecorationTypeHint, errorLensDecorationOptionsHint);

        // console.log( "updateDecorationsForUri() : errors + warnings = " + (numErrors + numWarnings) );

        if( numErrors + numWarnings === 0 )
        {
            updateStatusBar("ErrorLens: No errors or warnings" );
        }
        else
        {
            updateStatusBar("$(bug) ErrorLens: " + numErrors + " error(s) and " + numWarnings + " warning(s)." );
        }
    }



    /**
     * Update the Visual Studio Code status bar
     *
     * @param {string} statusBarText - Text to show in the Status Bar.
     * @returns
     */
    function updateStatusBar( statusBarText : string ) {
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
}

// this method is called when your extension is deactivated
export function deactivate() {
}
