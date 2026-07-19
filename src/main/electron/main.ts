const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload-dev.cjs'),
      contextIsolation: true,
      sandbox: false,
    },
  });

  const htmlPath = path.join(__dirname, 'dist', 'renderer', 'src', 'main', 'renderer', 'index.html');
  mainWindow.loadFile(htmlPath).catch((err) => {
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
