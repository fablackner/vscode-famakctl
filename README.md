# vscode-famakctl

`vscode-famakctl` is a personal VS Code keybinding extension based on the **famak** keyboard layout, focused on fast editor navigation.

This has evolved over many iterations for my own workflow. It might not fit everyone, but you can try it and decide if it feels good for you.

## Install manually from `.vsix`

1. Clone or download this repository.
2. Open VS Code.
3. Open the Command Palette (`Ctrl+Shift+P`).
4. Run **Extensions: Install from VSIX...**
5. Choose `famakctl-0.0.1.vsix` from this folder.
6. Reload VS Code if prompted.

Terminal install also works:

```bash
code --install-extension famakctl-0.0.1.vsix
```

## How to use

1. Open any project in VS Code.
2. Start using the remapped keys from this extension.
3. If something conflicts with your setup, disable/remove the extension or test it in a separate VS Code profile first.

## Settings

- `famakctl.offset` - offset used by look up/down behavior
- `famakctl.distance` - distance used for move/fast scroll behavior
- `famakctl.scrollDistance` - distance used for smooth scrolling
