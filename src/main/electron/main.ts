const { app, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const homeDir = app.getPath('home');
const dataDir = path.join(homeDir, '.hermes-manuscript-studio');
const projectsDir = path.join(dataDir, 'projects');

if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
}

let window = null;

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

  // Use dev server when available, fallback to built files
  const devUrl = 'http://localhost:5173';
  if (process.env.NODE_ENV === 'development') {
    window.loadURL(devUrl).catch(() => {
      window.loadFile(path.join(__dirname, 'dist', 'renderer', 'index.html')).catch(console.error);
    });
  } else {
    window.loadFile(path.join(__dirname, 'dist', 'renderer', 'index.html')).catch(console.error);
  }
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
