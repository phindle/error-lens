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

    const config = vscode.workspace.getConfiguration("errorLens");

    const errorColor = config.get("errorColor") || "rgba(240,10,0,0.5)";
    const warningColor = config.get("warningColor") || "rgba(200,100,0,0.5)";
    const infoColor = config.get("infoColor") || "rgba(40,20,120,0.5)";
    const hintColor = config.get("hintColor") || "rgba(20,120,40,0.5)";
    const errorLensFontStyle : string = config.get("fontStyle") || "italic";
    const errorLensFontWeight : string = config.get("fontWeight") || "normal";
    const errorLensMargin : string = config.get("fontMargin") || "40px";
    const errorMsgPrefix : string | undefined = config.get("errorMsgPrefix");

    // Create decorator types that we use to amplify lines containing errors, warnings, info, etc.

    // createTextEditorDecorationType() ref. @ https://code.visualstudio.com/docs/extensionAPI/vscode-api#window.createTextEditorDecorationType
    // DecorationRenderOptions ref.  @ https://code.visualstudio.com/docs/extensionAPI/vscode-api#DecorationRenderOptions
    const errorLensDecorationTypeError: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: errorColor
    });

    const errorLensDecorationTypeWarning: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: warningColor
    });

    const errorLensDecorationTypeInfo: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: infoColor
    });

    const errorLensDecorationTypeHint: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: hintColor
    });

    vscode.languages.onDidChangeDiagnostics(diagnosticChangeEvent => { onChangedDiagnostics(diagnosticChangeEvent); }, null, context.subscriptions );

    // Note: URIs for onDidOpenTextDocument() can contain schemes other than file:// (such as git://)
	vscode.workspace.onDidOpenTextDocument(textDocument => { updateDecorationsForUri( textDocument.uri ); }, null, context.subscriptions );


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
        
        // Many URIs can change - we only need to decorate the active text editor
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
     * Update the editor decorations for the provided URI. Only if the URI scheme is "file" is the function
     * processed. (It can be others, such as "git://<something>", in which case the function early-exits).
     *
     * @param {vscode.Uri} uriToDecorate - Uri to add decorations to.
     */
    function updateDecorationsForUri( uriToDecorate : vscode.Uri ) {
        if ( !uriToDecorate )
        {
            console.log( "Exit updateDecorationsForUri() - uriToDecorate = empty" );
            return;
        }

        // Only process "file://" URIs.
        if( uriToDecorate.scheme !== "file" )
        {
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

        const errorLensDecorationOptionsError: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsWarning: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsInfo: vscode.DecorationOptions[] = [];
        const errorLensDecorationOptionsHint: vscode.DecorationOptions[] = [];
        let numErrors = 0;
        let numWarnings = 0;

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
        let diagnostic : vscode.Diagnostic;

        // Iterate over each diagnostic that VS Code has reported for this file. For each one, add to
        // a list of objects, grouping together diagnostics which occur on a single line.
        for ( diagnostic of vscode.languages.getDiagnostics( uriToDecorate ) )
        {
            let key = "line" + diagnostic.range.start.line;

            if( aggregatedDiagnostics[key] )
            {
                // Already added an object for this key, so augment the arrayDiagnostics[] array.
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
        for ( key in aggregatedDiagnostics )       // Iterate over property values (not names)
        {
            let aggregatedDiagnostic = aggregatedDiagnostics[key];
            let messagePrefix : string = errorMsgPrefix ? errorMsgPrefix : "";

            if( aggregatedDiagnostic.arrayDiagnostics.length > 1 )
            {
                // If > 1 diagnostic for this source line, the prefix is "Diagnostic #1 of N: "
                messagePrefix += "Diagnostic #1 of " + aggregatedDiagnostic.arrayDiagnostics.length + ": ";
            }
            else
            {
                // If only 1 diagnostic for this source line, show the diagnostic severity
                switch (aggregatedDiagnostic.arrayDiagnostics[0].severity)
                {
                    case 0:
                        messagePrefix += "Error: ";
                        break;

                    case 1:
                        messagePrefix += "Warning: ";
                        break;

                    case 2:
                        messagePrefix += "Info: ";
                        break;

                    case 3:
                    default:
                        messagePrefix += "Hint: ";
                        break;
                }
            }

            // Generate a DecorationInstanceRenderOptions object which specifies the text which will be rendered
            // after the source-code line in the editor, and text rendering options.
            const decInstanceRenderOptions : vscode.DecorationInstanceRenderOptions = {
                after: {
                    contentText: messagePrefix + aggregatedDiagnostic.arrayDiagnostics[0].message,
                    fontStyle: errorLensFontStyle,
                    fontWeight: errorLensFontWeight,
                    margin: errorLensMargin
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
     */
    function updateStatusBar( statusBarText : string ) {
        // Create _statusBarItem if needed
        if (!_statusBarItem)
        {
            _statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }

        const activeTextEditor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;

        if (!activeTextEditor)
        {
            // No open text editor
            _statusBarItem.hide();
        }
        else
        {
            _statusBarItem.text = statusBarText;

            _statusBarItem.show();
        }

    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}
