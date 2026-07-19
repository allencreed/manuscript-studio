import { UserSettings } from '../../shared/types';
import { contextBridge, ipcRenderer } from 'electron'
import { RpcChannel } from '../../shared/rpc'

contextBridge.exposeInMainWorld('hms', {
  projects: {
    list: () => ipcRenderer.invoke(RpcChannel.project.list),
    create: (p: { name: string }) => ipcRenderer.invoke(RpcChannel.project.create, p),
    open: (id: string) => ipcRenderer.invoke(RpcChannel.project.open, id),
    delete: (id: string) => ipcRenderer.invoke(RpcChannel.project.delete, id),
  },
  documents: {
    save: (p: { projectId: string; manuscriptId?: string; title: string; content: string }) => ipcRenderer.invoke(RpcChannel.document.save, p),
    load: (id: string) => ipcRenderer.invoke(RpcChannel.document.load, id),
    import: (p: { absolutePath: string; projectId: string }) => ipcRenderer.invoke(RpcChannel.document.import, p),
  },
  versions: {
    list: (manuscriptId: string) => ipcRenderer.invoke(RpcChannel.version.list, manuscriptId),
    save: (p: { manuscriptId: string; content: string; version_type?: string; label?: string }) => ipcRenderer.invoke(RpcChannel.version.save, p),
    restore: (versionId: string) => ipcRenderer.invoke(RpcChannel.version.restore, versionId),
  },
  backups: {
    list: (projectId: string) => ipcRenderer.invoke(RpcChannel.backup.list, projectId),
    create: (projectId: string) => ipcRenderer.invoke(RpcChannel.backup.create, projectId),
    restore: (projectId: string, backupId: string) => ipcRenderer.invoke(RpcChannel.backup.restore, projectId, backupId),
  },
  ai: {
    chat: (p: { prompt: string }) => ipcRenderer.invoke(RpcChannel.ai.chat, p),
    suggest: (p: { manuscriptId: string }) => ipcRenderer.invoke(RpcChannel.ai.suggest, p),
  },
  model: {
    status: () => ipcRenderer.invoke(RpcChannel.model.status),
  },
  settings: {
    get: () => ipcRenderer.invoke(RpcChannel.settings.get),
    set: (p: any) => ipcRenderer.invoke(RpcChannel.settings.set, p),
  },
});

export interface HMS {
  readonly projects: {
    readonly list: () => Promise<unknown[]>;
    readonly create: (p: { name: string }) => Promise<unknown>;
    readonly open: (id: string) => Promise<unknown>;
    readonly delete: (id: string) => Promise<void>;
  };
  readonly documents: {
    readonly save: (p: { projectId: string; manuscriptId?: string; title: string; content: string }) => Promise<string>;
    readonly load: (id: string) => Promise<unknown>;
    readonly import: (p: { absolutePath: string; projectId: string }) => Promise<{ id: string; title: string; content: string }>;
  };
  readonly versions: {
    readonly list: (manuscriptId: string) => Promise<unknown[]>;
    readonly save: (p: { manuscriptId: string; content: string; version_type?: string; label?: string }) => Promise<string>;
    readonly restore: (versionId: string) => Promise<unknown>;
  };
  readonly backups: {
    readonly list: (projectId: string) => Promise<unknown[]>;
    readonly restore: (projectId: string, backupId: string) => Promise<void>;
  };
  readonly ai: {
    readonly chat: (p: { prompt: string }) => Promise<{ reply: string }>;
    readonly suggest: (p: { manuscriptId: string }) => Promise<{ text: string }>;
  };
  readonly model: {
    readonly status: () => Promise<{ running: boolean; models: string[] }>;
  };
  readonly settings: {
    readonly get: () => Promise<UserSettings>;
    readonly set: (p: Partial<UserSettings>) => Promise<UserSettings>;
  };
}

export {};
