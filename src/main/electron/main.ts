const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const homeDir = app.getPath('home');
const dataDir = path.join(homeDir, '.hermes-manuscript-studio');
const projectsDir = path.join(dataDir, 'projects');

if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
}

let window = null;

function rendererHtmlPath() {
  const candidates = [
    path.join(__dirname, '..', 'dist', 'renderer', 'index.html'),
    path.join(__dirname, '..', 'dist', 'renderer', 'src', 'main', 'renderer', 'index.html'),
  ];
  const found = candidates.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });
  if (!found) {
    console.error('[hms] Missing renderer HTML in dist/renderer. Run pnpm vite build first.');
  }
  return found || candidates[0];
}

function createWindow() {
  window = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload-dev.cjs'),
      contextIsolation: true,
      sandbox: false,
      cache: false,
    },
  });

  const htmlPath = rendererHtmlPath();
  window.loadFile(htmlPath).catch((err) => {
    console.error('[hms] Failed to load HTML:', err);
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('hms:project.list', () => {
  try {
    const items = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.json'));
    return items.map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(projectsDir, f), 'utf8'));
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error('[hms] project.list failed:', error);
    return [];
  }
});

ipcMain.handle('hms:project.create', (_event, payload) => {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const project = {
    id,
    name: payload?.name || 'Untitled Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(projectsDir, `${id}.json`), JSON.stringify(project, null, 2));
  return project;
});

ipcMain.handle('hms:project.open', (_event, id) => {
  try {
    const data = fs.readFileSync(path.join(projectsDir, `${id}.json`), 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
});

ipcMain.handle('hms:project.delete', (_event, id) => {
  const target = path.join(projectsDir, `${id}.json`);
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
    return true;
  }
  return false;
});

ipcMain.handle('hms:document.list', (_event, payload) => {
  const projectId = payload?.projectId || 'default';
  const docsDir = path.join(projectsDir, projectId, 'documents');
  if (!fs.existsSync(docsDir)) return [];
  try {
    return fs.readdirSync(docsDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(fs.readFileSync(path.join(docsDir, f), 'utf8')))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch {
    return [];
  }
});

ipcMain.handle('hms:document.save', (_event, payload) => {
  const projectId = payload?.projectId || 'default';
  const docsDir = path.join(projectsDir, projectId, 'documents');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  const id = payload?.id || Date.now().toString(36);
  const doc = {
    id,
    projectId,
    title: payload?.title || 'Untitled',
    content: payload?.content || '',
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(docsDir, `${id}.json`), JSON.stringify(doc, null, 2));
  return doc;
});

ipcMain.handle('hms:document.load', (_event, payload) => {
  const { manuscriptId, projectId } = payload || {};
  if (!manuscriptId || !projectId) return null;
  try {
    const data = fs.readFileSync(path.join(projectsDir, projectId, 'documents', `${manuscriptId}.json`), 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
});

ipcMain.handle('hms:document.import', (_event, payload) => {
  const projectId = payload?.projectId || 'default';
  const docsDir = path.join(projectsDir, projectId, 'documents');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  const id = Date.now().toString(36);
  const doc = {
    id,
    projectId,
    title: payload?.title || 'Imported Document',
    content: payload?.content || '',
    source: payload?.source || 'import',
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(docsDir, `${id}.json`), JSON.stringify(doc, null, 2));
  return doc;
});

ipcMain.handle('hms:version.list', (_event, payload) => {
  const { manuscriptId, projectId } = payload || {};
  if (!manuscriptId || !projectId) return [];
  const versionsDir = path.join(projectsDir, projectId, 'versions');
  if (!fs.existsSync(versionsDir)) return [];
  try {
    return fs.readdirSync(versionsDir)
      .filter((f) => f.startsWith(`${manuscriptId}-`) && f.endsWith('.json'))
      .map((f) => JSON.parse(fs.readFileSync(path.join(versionsDir, f), 'utf8')))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
});

ipcMain.handle('hms:version.save', (_event, payload) => {
  const { manuscriptId, projectId, label } = payload || {};
  if (!manuscriptId || !projectId) return null;
  const versionsDir = path.join(projectsDir, projectId, 'versions');
  if (!fs.existsSync(versionsDir)) fs.mkdirSync(versionsDir, { recursive: true });
  const id = `${manuscriptId}-${Date.now().toString(36)}`;
  const version = {
    id,
    manuscriptId,
    projectId,
    label: label || 'Auto-save',
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(versionsDir, `${id}.json`), JSON.stringify(version, null, 2));
  return version;
});

ipcMain.handle('hms:version.restore', (_event, versionId) => {
  return null;
});

ipcMain.handle('hms:backup.list', (_event, projectId) => {
  const backupsDir = path.join(projectsDir, projectId || 'default', 'backups');
  if (!fs.existsSync(backupsDir)) return [];
  try {
    return fs.readdirSync(backupsDir)
      .filter((f) => f.endsWith('.zip'))
      .map((f) => ({
        id: f,
        name: f,
        path: path.join(backupsDir, f),
        createdAt: fs.statSync(path.join(backupsDir, f)).mtime.toISOString(),
      }));
  } catch {
    return [];
  }
});

ipcMain.handle('hms:backup.create', (_event, projectId) => {
  const targetDir = path.join(projectsDir, projectId || 'default', 'backups');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  const id = `backup-${Date.now().toString(36)}.zip`;
  fs.writeFileSync(path.join(targetDir, id), Buffer.from('placeholder backup'));
  return { id, path: path.join(targetDir, id) };
});

ipcMain.handle('hms:backup.restore', (_event, projectId, backupId) => {
  return false;
});

ipcMain.handle('hms:ai.chat', (_event, payload) => {
  return { reply: 'AI is not configured yet.', citations: [] };
});

ipcMain.handle('hms:ai.suggest', () => {
  return { suggestions: [] };
});

ipcMain.handle('hms:model.status', () => {
  return { available: false, provider: 'none', model: 'none' };
});

ipcMain.handle('hms:settings.get', () => {
  const settingsPath = path.join(dataDir, 'settings.json');
  try {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch {
    return {};
  }
});

ipcMain.handle('hms:settings.set', (_event, patch) => {
  const settingsPath = path.join(dataDir, 'settings.json');
  try {
    const current = JSON.parse(fs.readFileSync(settingsPath, 'utf8') || '{}');
    const next = { ...current, ...patch };
    fs.writeFileSync(settingsPath, JSON.stringify(next, null, 2));
    return next;
  } catch {
    fs.writeFileSync(settingsPath, JSON.stringify(patch || {}, null, 2));
    return patch || {};
  }
});
