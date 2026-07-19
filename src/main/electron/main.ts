import { app, ipcMain } from 'electron';
import { ProjectService } from './services/ProjectService';
import { DocumentService } from './services/DocumentService';
import { VersionService } from './services/VersionService';
import { BackupService } from './services/BackupService';
import { ModelService } from './services/ModelService';
import { SettingsService } from './services/SettingsService';

const projectService = new ProjectService();
const documentService = new DocumentService(projectService);
const versionService = new VersionService(projectService);
const backupService = new BackupService(projectService);
const modelService = new ModelService();
const settingsService = new SettingsService();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC only; window creation lives in electron-main.cjs
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
ipcMain.handle('hms:backup.list', async (_, projectId: string) => backupService.list(projectId));
ipcMain.handle('hms:backup.create', async (_, projectId: string) => backupService.create(projectId));
ipcMain.handle('hms:backup.restore', async (_, projectId: string, backupId: string) => backupService.restore(projectId, backupId));
ipcMain.handle('hms:ai.chat', async (_e, payload: any) => modelService.chat(payload));
ipcMain.handle('hms:ai.suggest', async () => modelService.suggest());
ipcMain.handle('hms:model.status', async () => modelService.status());
ipcMain.handle('hms:settings.get', async () => settingsService.getAll());
ipcMain.handle('hms:settings.set', async (_e, patch: any) => settingsService.set(patch));
