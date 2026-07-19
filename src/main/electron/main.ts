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
  const root = path.join(__dirname, '..', 'dist', 'renderer');
  const candidates = [
    path.join(root, 'index.html'),
    path.join(root, 'src', 'main', 'renderer', 'index.html'),
  ];
  const found = candidates.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });
  if (!found) {
    console.error('[hms] Missing renderer HTML in dist/renderer. Run pnpm build first.');
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
    const items = fs.readdirSync(projectsDir).filter(f => f.endsWith('.json'));
    return items.map(f => {
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
