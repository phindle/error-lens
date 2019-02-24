# Change Log

All notable changes to the ErrorLens extension will be documented in this file.

## 1.1.3

- Released 24th February 2019.
- Various minor fixes.
- Remove superfluous console.log() calls.
- Truncate very long messages.

## 1.1.2

- Released 14th February 2019. (Valentine's Day Edition).
- Fix for <https://github.com/phindle/error-lens/issues/15>. Diagnostic highlights are now shown on the whole line again.

## 1.1.0

- Released February 2019.
- This release contains some new features and fixes some bugs.
- Additional font weight options. (Thank you to Oleg Orlov for the PR).
- Changes to the ErrorLens settings will be reloaded without restarting VS Code. (Hot reload).
- Implement the ability to configure which diagnostic levels are shown (Addresses issue #1: <https://github.com/phindle/error-lens/issues/1>).
  Configured via `errorlens.enabledDiagnosticLevels` in the settings.

  The default setting is to show all diagnostics, i.e. `errorlens.enabledDiagnosticLevels = [ "error", "warning", "info", "hint" ]`

  If you wanted to show only errors for example, use this setting: `errorlens.enabledDiagnosticLevels = [ "error" ]`

- Implement configurable text and background colours, per diagnostic type, which may override the default values.
  This addresses issue #4 (<https://github.com/phindle/error-lens/issues/4>).
  For example, to configure the background and text colour for errors:

```
"errorLens.errorColor": {
  "type": "string",
  "default": "rgba(240,10,0,0.3)",
  "description": "The background color used to highlight lines containing errors. (Alpha is used)"
},
"errorLens.errorTextColor": {
  "type": "string",
  "default": "rgba(240,240,240,1.0)",
  "description": "The text color used to highlight lines containing errors. (Alpha is used)"
},
```

- More responsive when switching between tabs and editors. (Fix for <https://github.com/phindle/error-lens/issues/8>)

- Added a configuration property (`errorLens.statusBarControl`) which controls when ErrorLens status bar info is shown.
 One of 3 options: (1) always show, (2) never show or (3) only show when there are any warnings or errors.
 This addresses issue #11: <https://github.com/phindle/error-lens/issues/11>.

- Added a configuration property (`errorLens.addAnnotationTextPrefixes`) which controls whether to prefix diagnostic severity to the ErrorLens annotations. (Implements <https://github.com/phindle/error-lens/issues/9>).

- Added command to enable and disable ErrorLens on-demand. Implements request <https://github.com/phindle/error-lens/issues/3>.
 2 commands are available from the command palette: _Enable ErrorLens_ and _Disable ErrorLens_.
 These commands do not have any default keyboard bindings.

## 1.0.0

- Initial release of ErrorLens (October 2018)
