import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { ProjectService } from './services/ProjectService';
import { DocumentService } from './services/DocumentService';
import { VersionService } from './services/VersionService';
import { BackupService } from './services/BackupService';
import { ModelService } from './services/ModelService';
import { SettingsService } from './services/SettingsService';

let window: BrowserWindow | null = null;
const projectService = new ProjectService();
const documentService = new DocumentService(projectService);
const versionService = new VersionService(projectService);
const backupService = new BackupService(projectService);
const modelService = new ModelService();
const settingsService = new SettingsService();

function createWindow() {
  window = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, '../dist/electron/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    window.loadURL('http://localhost:5173');
    window.webContents.openDevTools();
  } else {
    window.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
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

ipcMain.handle('hms:project.list', async () => projectService.listProjects());
ipcMain.handle('hms:project.create', async (_e, payload: any) => projectService.createProject(payload.name));
ipcMain.handle('hms:project.open', async (_e, id: string) => projectService.openProject(id));
ipcMain.handle('hms:project.delete', async (_e, id: string) => projectService.deleteProject(id));
ipcMain.handle('hms:document.save', async (_e, payload: any) => documentService.save(payload));
ipcMain.handle('hms:document.load', async (_e, payload: { manuscriptId: string; projectId: string }) => documentService.load(payload));
ipcMain.handle('hms:document.import', async (_e, payload: any) => documentService.import(payload));
ipcMain.handle('hms:version.list', async (_e, payload: { manuscriptId: string; projectId: string }) => versionService.list(payload));
ipcMain.handle('hms:version.save', async (_e, payload: any) => versionService.save(payload));
ipcMain.handle('hms:version.restore', async (_e, versionId: string) => versionService.restore(versionId));
ipcMain.handle('hms:backup.list', async (_e, projectId: string) => backupService.list(projectId));
ipcMain.handle('hms:backup.create', async (_e, projectId: string) => backupService.create(projectId));
ipcMain.handle('hms:backup.restore', async (_e, projectId: string, backupId: string) => backupService.restore(projectId, backupId));
ipcMain.handle('hms:ai.chat', async (_e, payload: any) => modelService.chat(payload));
ipcMain.handle('hms:ai.suggest', async () => modelService.suggest());
ipcMain.handle('hms:model.status', async () => modelService.status());
ipcMain.handle('hms:settings.get', async () => settingsService.getAll());
ipcMain.handle('hms:settings.set', async (_e, patch: any) => settingsService.set(patch));
