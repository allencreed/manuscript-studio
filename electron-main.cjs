const { app, BrowserWindow, net } = require('electron');
const path = require('path');
const http = require('http');

function resolveHtmlPath() {
  const dir = path.resolve(__dirname);
  const candidates = [
    path.join(dir, 'dist', 'renderer', 'index.html'),
    path.join(dir, 'src', 'main', 'renderer', 'index.html'),
  ];
  for (const candidate of candidates) {
    if (require('fs').existsSync(candidate)) return candidate;
  }
  return null;
}

function isDevServerUp() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5173', (res) => {
      resolve(true);
      res.resume();
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function createWindow() {
  const useDev = !app.isPackaged && await isDevServerUp();
  const loadUrl = useDev ? 'http://localhost:5173' : resolveHtmlPath();

  if (!loadUrl) {
    console.error('[hms] No renderer HTML found at dist/renderer/index.html and no dev server available.');
    app.quit();
    return;
  }

  console.log('[hms] Loading renderer from:', loadUrl);

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, app.isPackaged ? 'dist-electron/preload.js' : 'preload-dev.cjs'),
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    mainWindow.webContents.executeJavaScript(`document.body.innerHTML = '<div style="color:#ff6b6b;padding:24px;font-family:system-ui"><h1>Load failed</h1><p>' + ${JSON.stringify(errorDescription)} + '</p><p>' + validatedURL + '</p></div>'`);
    console.error('[hms] Failed to load:', validatedURL, errorDescription);
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[renderer ${level}] ${sourceId}:${line} - ${message}`);
  });

  if (useDev) {
    mainWindow.loadURL(loadUrl).catch((err) => {
      console.error('[hms] Failed to load dev URL:', err);
    });
  } else {
    mainWindow.loadFile(loadUrl).catch((err) => {
      console.error('[hms] Failed to load HTML:', err);
      mainWindow.webContents.executeJavaScript(`document.body.innerHTML = '<div style="color:#ff6b6b;padding:24px;font-family:system-ui"><h1>Exception</h1><pre>' + ${JSON.stringify(err instanceof Error ? err.message : String(err))} + '</pre></div>'`);
    });
  }
}

require(path.join(__dirname, 'dist-electron', 'main-bundle.cjs'));

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', (err) => {
  console.error('[hms] Uncaught exception:', err);
  if (!app.isPackaged) app.quit();
});
