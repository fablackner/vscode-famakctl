const vscode = require("vscode");

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.lookDown', () => look('down')));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.lookUp', () => look('up')));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.lookMiddle', () => lookMiddle()));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.lookTop', () => lookTop()));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.moveDown', () => move('down')));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.moveUp', () => move('up')));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.scrollDown', () => scroll('down')));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.scrollUp', () => scroll('up')));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.scrollFastDown', () => fastScroll('down')));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.scrollFastUp', () => fastScroll('up')));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.placeCursorUp', () => placeCursorUp()));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.moveCursorConditionalUp', () => moveCursorConditional("up", 3)));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.moveCursorConditionalDown', () => moveCursorConditional("down", 3)));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.selectLineWithPreviousBreakDown', () => selectLineWithPreviousBreakDown()));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.selectLineWithPreviousBreakUp', () => selectLineWithPreviousBreakUp()));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.revealCellAtTop', () => revealCellAtTop()));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.revealCellInCenter', () => revealCellInCenter()));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.cellScrollUp', () => cellScrollUp()));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.cellScrollDown', () => cellScrollDown()));
    context.subscriptions.push(vscode.commands.registerCommand('famakctl.selectCellAtTop', () => selectCellAtTop()));
    registerSequenceCommand(context, 'famakctl.upWithFocus', [
        'list.focusUp',
        'list.selectAndPreserveFocus'
    ]);
    registerSequenceCommand(context, 'famakctl.downWithFocus', [
        'list.focusDown',
        'list.selectAndPreserveFocus'
    ]);
    registerSequenceCommand(context, 'famakctl.focusFirstEditorGroup', [
        'workbench.action.maximizeEditorHideSidebar',
        'workbench.action.closePanel',
        'workbench.action.closeSidebar',
        'workbench.action.activityBarLocation.hide',
        'workbench.action.focusAuxiliaryBar',
        'workbench.action.focusFirstEditorGroup',
        'famakctl.placeCursorUp'
    ]);
    registerSequenceCommand(context, 'famakctl.focusFirstEditorGroupFast', [
        'workbench.action.closePanel',
        'workbench.action.focusFirstEditorGroup'
    ]);
    registerSequenceCommand(context, 'famakctl.focusSecondEditorGroup', [
        'workbench.action.maximizeEditorHideSidebar',
        'workbench.action.closePanel',
        'workbench.action.closeSidebar',
        'workbench.action.activityBarLocation.hide',
        'workbench.action.focusAuxiliaryBar',
        'workbench.action.focusSecondEditorGroup',
        'famakctl.placeCursorUp'
    ]);
    registerSequenceCommand(context, 'famakctl.focusSecondEditorGroupFast', [
        'workbench.action.closePanel',
        'workbench.action.focusSecondEditorGroup'
    ]);
    registerSequenceCommand(context, 'famakctl.showPanelFromFirstEditorGroup', [
        'workbench.action.togglePanel',
        'workbench.action.focusFirstEditorGroup'
    ]);
    registerSequenceCommand(context, 'famakctl.showPanelFromSecondEditorGroup', [
        'workbench.action.togglePanel',
        'workbench.action.focusSecondEditorGroup'
    ]);
    registerSequenceCommand(context, 'famakctl.focusTerminal', [
        'workbench.action.closeSidebar',
        'workbench.action.closeAuxiliaryBar',
        'workbench.action.activityBarLocation.hide',
        'workbench.action.closePanel',
        'workbench.action.toggleMaximizedPanel'
    ]);
}

function registerSequenceCommand(context, command, sequence) {
    context.subscriptions.push(vscode.commands.registerCommand(command, async () => {
        for (const sequenceCommand of sequence) {
            await vscode.commands.executeCommand(sequenceCommand);
        }
    }));
}

function look(direction) {
    const activeTextEditor = vscode.window.activeTextEditor;
    const offset = vscode.workspace.getConfiguration('famakctl').get('offset');

    if (activeTextEditor) {
        const currentLineNumber = activeTextEditor.selection.start.line;
        const lineNumber = direction === 'down' ? currentLineNumber - offset : currentLineNumber + offset;
        const at = direction === 'down' ? 'top' : 'bottom';

        vscode.commands.executeCommand('revealLine', { lineNumber, at })
            .then(() => console.log(`Looked ${direction}`), console.error);
    } else {
        console.error('No active text editor!');
    }
}

let currentOffsetUpSaved, currentOffsetDownSaved;

function lookOrScroll(direction) {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (activeTextEditor) {
        const { start, end } = activeTextEditor.visibleRanges[0];
        const currentLineNumber = activeTextEditor.selection.start.line;
        const offset = direction === 'down' ? currentLineNumber - start.line : end.line - currentLineNumber;
        const offsetSaved = direction === 'down' ? currentOffsetDownSaved : currentOffsetUpSaved;

        if (currentLineNumber >= start.line && currentLineNumber <= end.line) {
            if (offset === offsetSaved) {
                fastScroll(direction);
            } else {
                look(direction);
                if (direction === 'down') currentOffsetDownSaved = offset;
                else currentOffsetUpSaved = offset;
            }
        } else {
            fastScroll(direction);
        }
    } else {
        console.error('No active text editor!');
    }
}

function scroll(direction) {
    const activeTextEditor = vscode.window.activeTextEditor;
    const scrollDistance = vscode.workspace.getConfiguration('famakctl').get('scrollDistance');

    if (activeTextEditor) {
        let command = direction === 'down' ? 'scrollLineDown' : 'scrollLineUp';
        let promiseChain = Promise.resolve();

        for (let i = 0; i < scrollDistance; i++) {
            promiseChain = promiseChain.then(() => vscode.commands.executeCommand(command));
        }

        promiseChain.then(() => console.log(`Scrolled ${direction}`)).catch(err => console.error(`Error during scrolling ${direction}:`, err));
    } else {
        console.error('No active text editor!');
    }
}

function fastScroll(direction) {
    const activeTextEditor = vscode.window.activeTextEditor;
    const distance = vscode.workspace.getConfiguration('famakctl').get('distance');

    if (activeTextEditor) {
        vscode.commands.executeCommand('editorScroll', {
            to: direction,
            by: "wrappedLine",
            value: distance
        }).then(() => console.log(`Fast scrolled ${direction}`), console.error);
    } else {
        console.error('No active text editor!');
    }
}

function move(direction) {
    const activeTextEditor = vscode.window.activeTextEditor;
    const distance = vscode.workspace.getConfiguration('famakctl').get('distance');

    if (activeTextEditor) {
        vscode.commands.executeCommand('editorScroll', { to: direction, by: "wrappedLine", value: distance })
            .then(() => vscode.commands.executeCommand('cursorMove', { to: direction, by: "wrappedLine", value: distance }))
            .then(() => console.log(`Moved ${direction}`), console.error);
    } else {
        console.error('No active text editor!');
    }
}

function placeCursorUp() {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (activeTextEditor) {
        const offset = 11;
        const { start } = activeTextEditor.visibleRanges[0];
        const targetLineNumber = Math.min(start.line + offset - 1, activeTextEditor.document.lineCount - 1);

        const lineText = activeTextEditor.document.lineAt(targetLineNumber).text;
        const newPosition = new vscode.Position(targetLineNumber, lineText.length);

        activeTextEditor.selection = new vscode.Selection(newPosition, newPosition);
        activeTextEditor.revealRange(new vscode.Range(newPosition, newPosition), vscode.TextEditorRevealType.Default);

        console.log('Placed cursor up');
    } else {
        console.error('No active text editor!');
    }
}

function placeCursorMiddle() {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (activeTextEditor) {
        const { start, end } = activeTextEditor.visibleRanges[0];

        const middleLineNumber = Math.floor((start.line + end.line) / 2) + 1;
        const newPosition = new vscode.Position(middleLineNumber, 0);

        activeTextEditor.selection = new vscode.Selection(newPosition, newPosition);

        console.log('Placed cursor in the middle of the page');
    } else {
        console.error('No active text editor!');
    }
}

function moveCursorConditional(direction, numberOfLines) {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (activeTextEditor) {
        const { start, end } = activeTextEditor.visibleRanges[0];
        const currentLineNumber = activeTextEditor.selection.start.line;

        if (currentLineNumber >= start.line && currentLineNumber <= end.line) {
            const commandArgs = {
                to: direction,
                by: "wrappedLine",
                value: numberOfLines
            };

            vscode.commands.executeCommand('cursorMove', commandArgs);
        } else {
            placeCursorMiddle();
        }
    } else {
        console.error('No active text editor!');
    }
}

function selectLineWithPreviousBreakUp() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    if (selection.isEmpty) {
        vscode.commands.executeCommand('cursorEnd');
        vscode.commands.executeCommand('cursorUpSelect');
        vscode.commands.executeCommand('cursorEndSelect');
    } else {
        vscode.commands.executeCommand('cursorUpSelect');
        vscode.commands.executeCommand('cursorEndSelect');
    }
}

function selectLineWithPreviousBreakDown() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    if (selection.isEmpty) {
        vscode.commands.executeCommand('cursorUp');
        vscode.commands.executeCommand('cursorEnd');
        vscode.commands.executeCommand('cursorDownSelect');
        vscode.commands.executeCommand('cursorEndSelect');
    } else {
        vscode.commands.executeCommand('cursorDownSelect');
        vscode.commands.executeCommand('cursorEndSelect');
    }
}

function revealCellAtTop() {
    const notebookEditor = vscode.window.activeNotebookEditor;
    if (!notebookEditor) {
        return;
    }
    const activeRange = notebookEditor.selections[0];
    notebookEditor.revealRange(activeRange, vscode.NotebookEditorRevealType.AtTop);
}

function revealCellInCenter() {
    const notebookEditor = vscode.window.activeNotebookEditor;
    if (!notebookEditor) {
        return;
    }
    const activeRange = notebookEditor.selections[0];
    notebookEditor.revealRange(activeRange, vscode.NotebookEditorRevealType.InCenter);
}

function cellScrollUp() {
    const notebookEditor = vscode.window.activeNotebookEditor;
    if (!notebookEditor) {
        return;
    }
    const visibleRanges = notebookEditor.visibleRanges[0];
    const targetRange = new vscode.NotebookRange(visibleRanges.start - 1, visibleRanges.start - 1);
    notebookEditor.revealRange(targetRange, vscode.NotebookEditorRevealType.AtTop);
}

function cellScrollDown() {
    const notebookEditor = vscode.window.activeNotebookEditor;
    if (!notebookEditor) {
        return;
    }
    const visibleRanges = notebookEditor.visibleRanges[0];
    const targetRange = new vscode.NotebookRange(visibleRanges.start + 1, visibleRanges.start + 1);
    notebookEditor.revealRange(targetRange, vscode.NotebookEditorRevealType.AtTop);
}

function selectCellAtTop() {
    const notebookEditor = vscode.window.activeNotebookEditor;
    if (!notebookEditor) {
        return;
    }
    const visibleRanges = notebookEditor.visibleRanges;
    if (!visibleRanges || visibleRanges.length === 0) {
        return;
    }
    const firstVisibleRange = visibleRanges[0];
    const firstCellRange = new vscode.NotebookRange(firstVisibleRange.start, firstVisibleRange.start);
    notebookEditor.selections = [firstCellRange];
}

function lookTop() {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (activeTextEditor) {
        const currentLineNumber = activeTextEditor.selection.start.line;

        vscode.commands.executeCommand('revealLine', { lineNumber: currentLineNumber, at: 'top' })
            .then(() => console.log('Moved current line to top'), console.error);
    } else {
        console.error('No active text editor!');
    }
}

function lookMiddle() {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (activeTextEditor) {
        const currentLineNumber = activeTextEditor.selection.start.line;

        vscode.commands.executeCommand('revealLine', { lineNumber: currentLineNumber, at: 'center' })
            .then(() => console.log('Centered current line'), console.error);
    } else {
        console.error('No active text editor!');
    }
}

exports.activate = activate;
exports.deactivate = () => { };
