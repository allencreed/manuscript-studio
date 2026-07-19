import { ProjectService } from './ProjectService';
import { DocumentService } from './DocumentService';
import { VersionService } from './VersionService';
import { BackupService } from './BackupService';
import { ModelService } from './ModelService';
import { SettingsService } from './SettingsService';

const project = new ProjectService();
export const services = {
  project,
  document: new DocumentService(project),
  version: new VersionService(project),
  backup: new BackupService(project),
  model: new ModelService(),
  settings: new SettingsService(),
};
