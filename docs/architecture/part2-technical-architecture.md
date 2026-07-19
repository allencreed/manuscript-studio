# Hermes AI Manuscript Intelligence Studio
## Technical Architecture Specification v1.0

---

# PART 2 — TECHNICAL ARCHITECTURE

# 1. Platform Overview

**Runtime:** Electron 33+  
**UI Framework:** React 19 + TypeScript 7.0  
**Build Tool:** Vite 6 + Electron Builder  
**State Management:** Zustand 5  
**AI Backend:** Hermes Agent (localhost multi-process)  
**Database:** SQLite via better-sqlite3 (local, no server)  
**Vector Store:** sqlite-vec extension (local embedding index)  
**Graph Engine:** custom SQLite adjacency model (no external graph DB)

---

# 2. Electron Architecture

## Process Model

```
┌─────────────────────────────────────────────────────┐
│                   Main Process                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  App Life   │  │  IPC         │  │  Runtime   │ │
│  │  Manager    │  │  Router      │  │  Launcher  │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  FS         │  │  DB          │  │  Backup    │ │
│  │  Service    │  │  Service     │  │  Service   │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
│  ┌─────────────┐  ┌──────────────┐                 │
│  │  Model      │  │  Security    │                 │
│  │  Manager    │  │  Boundary    │                 │
│  └─────────────┘  └──────────────┘                 │
├─────────────────────────────────────────────────────┤
│  ─────────── IPC / Context Bridge ────────────────  │
├─────────────────────────────────────────────────────┤
│                  Renderer Process                    │
│  ┌───────────────────────────────────────────────┐  │
│  │              React Application                 │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐ │  │
│  │  │  Studio  │ │  Chat    │ │  Intelligence │ │  │
│  │  │  Editor  │ │  Panel   │ │  Graph View   │ │  │
│  │  └──────────┘ └──────────┘ └───────────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐ │  │
│  │  │  Chapter │ │  Version │ │  Settings     │ │  │
│  │  │  Nav     │ │  History │ │  Manager      │ │  │
│  │  └──────────┘ └──────────┘ └───────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
           │                        │
           ▼                        ▼
   Local Ollama              Project Storage
   http://localhost:11434     ~/.hermes-manuscript-studio/
```

## Process Isolation Rules

| Service | Process | Reason |
|---------|---------|--------|
| UI | Renderer | React needs fast DOM access |
| File I/O, DB, Backup | Main | Security boundary, no Node APIs in renderer |
| AI Runtime | Main | Manages child processes for Ollama/Qwen2.5 |
| Model hot-load | Main | GPU memory management, no renderer leak risk |

**Renderer process NEVER has access to:** raw filesystem paths, child_process exec, environment variables containing API keys.

---

# 3. React Application Structure

```
src/renderer/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatusBar.tsx
│   │   └── MenuBar.tsx
│   ├── studio/
│   │   ├── EditorWorkspace.tsx
│   │   ├── ChapterNavigator.tsx
│   │   ├── FormattingToolbar.tsx
│   │   └── FocusMode.tsx
│   ├── chat/
│   │   ├── ChatPanel.tsx
│   │   ├── MessageStream.tsx
│   │   ├── SuggestionCard.tsx
│   │   └── ContextInspector.tsx
│   ├── intelligence/
│   │   ├── KnowledgeGraph.tsx
│   │   ├── CharacterCard.tsx
│   │   ├── TimelineView.tsx
│   │   └── ThemeMap.tsx
│   ├── versions/
│   │   ├── VersionHistory.tsx
│   │   ├── DiffViewer.tsx
│   │   └── RestoreDialog.tsx
│   └── settings/
│       ├── ProjectSettings.tsx
│       ├── AISettings.tsx
│       └── BackupSettings.tsx
├── stores/
│   ├── useProjectStore.ts
│   ├── useEditorStore.ts
│   ├── useChatStore.ts
│   ├── useVersionStore.ts
│   └── useSettingsStore.ts
├── hooks/
│   ├── useIPC.ts
│   ├── useAutoSave.ts
│   ├── useAIChat.ts
│   └── useKeyboardShortcuts.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── styles/
│   ├── global.css
│   ├── studio.css
│   └── themes/
└── App.tsx
src/renderer/App.tsx
```

## State Management Policy

- **Zustand** for UI state (panel open/close, selection, scroll)
- **IPC only** for data mutations (save, version, AI action)
- **No in-memory data duplication** — renderer asks main for current state on focus, main is source of truth
- **Optimistic updates** only for editor typing (undo-able via IPC rollback)

---

# 4. IPC Communication Layer

## Architecture

```
Renderer                    Main Process
   │                              │
   │  ipcRenderer.invoke(...)     │
   │ ───────────────────────────► │
   │                              │  ipcMain.handle(...)
   │                              │  ┌─────────────┐
   │                              │  │ Auth Check  │
   │                              │  │ Validation  │
   │                              │  │ Service     │
   │                              │  │ Execution   │
   │                              │  └─────────────┘
   │                              │
   │  Promise<T> response         │
   │ ◄─────────────────────────── │
```

## Channel Namespace

All channels are prefixed to avoid collision with Electron defaults:

| Namespace | Example | Purpose |
|-----------|---------|---------|
| `hms:project.*` | `hms:project.create` | Project CRUD |
| `hms:document.*` | `hms:document.save` | Manuscript I/O |
| `hms:version.*` | `hms:version.list` | Version control |
| `hms:ai.*` | `hms:ai.chat` | AI assistant |
| `hms:backup.*` | `hms:backup.restore` | Backup system |
| `hms:settings.*` | `hms:settings.get` | User preferences |

## Type-safe IPC

All channels, request payloads, and response types are defined in `src/shared/types.ts`:

```typescript
// src/shared/rpc.ts
export const RpcChannel = {
  project: {
    create: 'hms:project.create',
    open: 'hms:project.open',
    list: 'hms:project.list',
    delete: 'hms:project.delete',
  },
  document: {
    save: 'hms:document.save',
    load: 'hms:document.load',
    import: 'hms:document.import',
  },
} as const;
```

Both main and renderer import from this same file.

---

# 5. Local Runtime & AI Model Management

## Hermes Agent Runtime

Instead of embedding an LLM directly, Hermes spawns a **Hermes Agent orchestrator** as a managed child process within the main Electron process.

```
┌─────────────────────────────────────────┐
│          Main Process                    │
│                                          │
│   ┌────────────────────────────────┐     │
│   │   Hermes Agent Orchestrator     │     │
│   │   ┌───────────┐ ┌───────────┐  │     │
│   │   │  Agent    │ │  Tool     │  │     │
│   │   │  Loop     │ │  Registry │  │     │
│   │   └─────┬─────┘ └─────┬─────┘  │     │
│   │         │             │        │     │
│   │   ┌─────▼─────────────▼─────┐  │     │
│   │   │   Local Inference       │  │     │
│   │   │   Agent (Ollama)        │  │     │
│   │   └─────────────────────────┘  │     │
│   └────────────────────────────────┘     │
│                                          │
│   ┌──────────────┐                      │
│   │  File Tools  │ ←──────────────────┐  │
│   │  DB Tools    │                    │  │
│   │  Search Tools│ ←── Tool Execution │  │
│   └──────────────┘                    │  │
└─────────────────────────────────────────┘
                                           │
                              spawn child
                                           ▼
                              `ollama run qwen2.5:7b`
```

**Why a separate orchestrator?**  
1. Agent loops can run for seconds — keeps main process responsive  
2. Tool use (file read, DB query) happens locally with no network  
3. Memory management: agent state is in-process, not leaked across IPC  

## Model Defaults

| Tier | Model | Purpose |
|------|-------|---------|
| Fast (default) | `Qwen2.5:3b` | Chat, simple edits |
| Balanced | `Qwen2.5:7b` | Analysis, suggestion |
| Complex | `Qwen2.5:14b` | Structural review |

Models are **user-configurable** in settings. Hermes checks Ollama at startup and warns if preferred models are missing.

## Remote Fallback

Optional: If local inference is unavailable, Hermes can route to a user-provided OpenAI-compatible endpoint. This is **off by default** and requires explicit user configuration.

---

# 6. Security Boundaries

## Threat Model

| Threat | Mitigation |
|--------|-----------|
| Malicious project file | Sandbox all project file access through main; never open project path in renderer |
| AI prompt injection | Renderer builds prompts; main sanitizes before sending to agent; agent never has direct filesystem write |
| Data exfiltration | No telemetry by default; cloud features opt-in via explicit user action |
| Dependency supply chain | `npm audit` CI, pin versions, verify hashes |

## Communication Rules

1. Renderer can only invoke whitelisted IPC channels
2. Main validates all input types against `src/shared/types.ts`
3. Agent tools expose read-only operations by default; write operations require confirmation flags
4. No network calls originate from renderer without proxying through main

---

# 7. Data Models

## Core Entities

```
Project
├── id: UUID
├── name: string
├── path: string (absolute, never sent to renderer)
├── created_at, updated_at
└── metadata: JSON (author, genre, notes)

Manuscript
├── id: UUID
├── project_id: UUID
├── title: string
├── content: string (current master)
├── word_count: number (cached)
└── format: 'markdown' | 'docx' | 'txt'

Chapter
├── id: UUID
├── manuscript_id: UUID
├── order: number
├── title: string
├── content: string
└── scene_boundaries: JSON[]

Version
├── id: UUID
├── manuscript_id: UUID
├── version_type: 'original' | 'ai-revision' | 'author-revision' | 'final'
├── content: string
├── label: string
└── created_at

KnowledgeNode
├── id: UUID
├── project_id: UUID
├── type: 'character' | 'location' | 'theme' | 'event'
├── name: string
├── properties: JSON
└── embedding: float[] (sqlite-vec)
```

---

# 8. Storage Layout

```
~/.hermes-manuscript-studio/
├── projects/
│   ├── <project-id>/
│   │   ├── project.json          (project metadata)
│   │   ├── manuscript/
│   │   │   ├── current.md        (master copy)
│   │   │   ├── chapters/
│   │   │   └── attachments/
│   │   ├── versions/
│   │   ├── intelligence/
│   │   │   ├── graph.json        (knowledge graph)
│   │   │   ├── embeddings.db     (sqlite-vec)
│   │   │   └── timeline.json
│   │   └── backups/
│   │       └── YYYYMMDD_HHMMSS.zip
├── cache/
│   └── temp-imports/
├── settings.json
└── runtime.log
```

---

# 9. Plugin Architecture

Hermes exposes a plugin surface for extending core functionality. Plugins run in the main process sandbox.

```
plugins/
├── index.ts              → plugin loader
├── registry.ts           → capability registry
├── handlers/
│   ├── importers/        → file format parsers
│   ├── analysers/        → structural analysis tools
│   ├── exporters/        → publishing output formats
│   └── ai-tools/         → custom agent tools
└── services/
    └── plugin-lifecycle.ts
```

Plugin contract:
```typescript
interface HMSPlugin {
  name: string;
  version: string;
  capabilities: string[]; // registered tool namespaces
  initialize(context: PluginContext): Promise<void>;
  shutdown(): Promise<void>;
}
```

---

# END OF PART 2

Next section: # PART 3 — IMPLEMENTATION ROADMAP  
(Sprint 0 setup, Sprint 1–7 plan, testing strategy, CI/CD)
