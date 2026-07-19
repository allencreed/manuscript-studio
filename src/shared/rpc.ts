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
} as const;
