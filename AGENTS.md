# agent.md

Quick onboarding notes for contributors and AI agents working in this repository.

## Project at a glance

- VS Code extension: **famakctl**
- Main code: `extension.js`
- Extension manifest and keybindings: `package.json`
- User docs: `README.md`
- Release automation: `.github/workflows/release.yml`

## Local packaging

- Build a VSIX locally with `npx @vscode/vsce package`.
- VSIX files are intentionally not tracked in git (`*.vsix` in `.gitignore`).

## Release workflow

1. Ensure `version` in `package.json` matches the intended release version.
2. Commit and push your changes.
3. Create and push a tag like `v0.0.2`.
4. GitHub Action `.github/workflows/release.yml` runs on that tag, packages the extension, and uploads the generated VSIX to the GitHub release.
