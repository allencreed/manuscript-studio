const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'dist-electron/preload.js'),
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

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!mainWindow) createWindow(); });
