const { contextBridge, ipcRenderer } = require('electron');

const RpcChannel = {
  project: {
    create: 'hms:project.create',
    open: 'hms:project.open',
    list: 'hms:project.list',
    delete: 'hms:project.delete',
  },
  document: {
    list: 'hms:document.list',
    save: 'hms:document.save',
    load: 'hms:document.load',
    import: 'hms:document.import',
  },
  version: {
    list: 'hms:version.list',
    save: 'hms:version.save',
    restore: 'hms:version.restore',
  },
  backup: {
    list: 'hms:backup.list',
    create: 'hms:backup.create',
    restore: 'hms:backup.restore',
  },
  ai: {
    chat: 'hms:ai.chat',
    suggest: 'hms:ai.suggest',
  },
  model: {
    status: 'hms:model.status',
  },
  settings: {
    get: 'hms:settings.get',
    set: 'hms:settings.set',
  },
};

contextBridge.exposeInMainWorld('hms', {
  projects: {
    list: () => ipcRenderer.invoke(RpcChannel.project.list),
    create: (p) => ipcRenderer.invoke(RpcChannel.project.create, p),
    open: (id) => ipcRenderer.invoke(RpcChannel.project.open, id),
    delete: (id) => ipcRenderer.invoke(RpcChannel.project.delete, id),
  },
  documents: {
    list: (p) => ipcRenderer.invoke(RpcChannel.document.list, p),
    save: (p) => ipcRenderer.invoke(RpcChannel.document.save, p),
    load: (id) => ipcRenderer.invoke(RpcChannel.document.load, id),
    import: (p) => ipcRenderer.invoke(RpcChannel.document.import, p),
  },
  versions: {
    list: (manuscriptId) => ipcRenderer.invoke(RpcChannel.version.list, manuscriptId),
    save: (p) => ipcRenderer.invoke(RpcChannel.version.save, p),
    restore: (versionId) => ipcRenderer.invoke(RpcChannel.version.restore, versionId),
  },
  backups: {
    list: (projectId) => ipcRenderer.invoke(RpcChannel.backup.list, projectId),
    create: (projectId) => ipcRenderer.invoke(RpcChannel.backup.create, projectId),
    restore: (projectId, backupId) => ipcRenderer.invoke(RpcChannel.backup.restore, projectId, backupId),
  },
  ai: {
    chat: (p) => ipcRenderer.invoke(RpcChannel.ai.chat, p),
    suggest: (p) => ipcRenderer.invoke(RpcChannel.ai.suggest, p),
  },
  model: {
    status: () => ipcRenderer.invoke(RpcChannel.model.status),
  },
  settings: {
    get: () => ipcRenderer.invoke(RpcChannel.settings.get),
    set: (p) => ipcRenderer.invoke(RpcChannel.settings.set, p),
  },
});
