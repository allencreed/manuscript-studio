const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, app.isPackaged ? 'dist-electron/preload.js' : 'preload-dev.cjs'),
      contextIsolation: true,
      sandbox: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  const prodFile = path.join(__dirname, 'dist/renderer/index.html');

  if (app.isPackaged) {
    mainWindow.loadFile(prodFile).catch(() => {});
  } else {
    mainWindow.loadURL(devUrl).catch(() => mainWindow.loadFile(prodFile).catch(() => {}));
  }

  mainWindow.webContents.openDevTools({ mode: 'detach' });
}

// Load bundled main process for side effects so ipcMain.handle(...) registers.
require(path.join(__dirname, 'dist-electron/main-bundle.js'));

app.whenReady().then(() => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});
