# Hermes Manuscript Studio — Implementation Roadmap

Generated from `App_Info.txt` plus current repo state checked on 2026-07-18.

## Current status

**Scaffolded**
- Electron + Vite + React repo at `/i/hermes-manuscript-studio`
- Main IPC handlers, services, preload, renderer shell
- TypeScript strict config, pnpm workspace
- Ponytail `AGENTS.md` copied into repo root

**Verified**
- `pnpm typecheck` result: 0 TS errors
- `better-sqlite3` native binding works on Windows x64
- `electron` binary present: `node_modules/electron/dist/electron.exe`
- Git history present for `/i/graphify` checkout
- `ponytail` repo cloned to `/i/ponytail`

**Blocked**
- App launch/build path is not yet verified; dev server has failed twice from plugin/runtime config issues
- Preload/production electron path is unresolved
- TipTap, import parsers, Ollama runtime, and settings screens are not present

---

## Step 1A: Fix app launch/build path

1. Choose one working strategy:
   - A) fix current `vite-plugin-electron` setup, or
   - B) switch to a known-good Electron + Vite scaffold for this environment
2. Add explicit renderer entry point if the plugin expects one at repo root
3. Verify an actual Electron window opens locally
4. Verify a production build output path matches Electron Builder `files` config

## Step 1B: Complete runtime wiring

1. Replace placeholder preload path in `main.ts`
2. Confirm IPC round trip works from renderer to main
3. Verify secure context bridge exposes only whitelisted channels

## Step 2: Editor core with TipTap

1. Add TipTap and a manuscript editor component
2. Wire save/load through IPC to `DocumentService`
3. Add chapter navigation, formatting toolbar, focus mode
4. Enforce feature-based folder layout from Part 3

## Step 3: Manuscript import

1. Implement DOCX/TXT/MD import paths
2. Leave PDF/RTF as post-MVP unless required
3. Add user-facing import status and error UI

## Step 4: Version control and backups

1. Build version history panel and restore flow
2. Add backup indicators and restore dialog
3. Hook auto-backup timer to settings

## Step 5: AI runtime and Ollama

1. Wire `ModelService` to local Ollama
2. Add context assembly: chapter, character notes, recent history
3. Implement permissioned tool model from Part 2/Part 4

## Step 6: Settings and roles

1. General/AI/Writing/Advanced screens
2. Author/Editor/Publisher role toggles
3. Feature flags with spec defaults:

```text
Story Graph: ON
Collaboration: OFF
Plugins: OFF
Multi-Agent: OFF
```

## Step 7: Polish and packaging

1. Add notifications, command palette, diagnostics panel
2. Configure Electron Builder for Windows
3. Smoke test: create project → import → edit → save → backup → AI chat

---

Suggested next action: pick Step 1A or Step 1B first, and do a single small config change with a fresh `pnpm dev` verify.
