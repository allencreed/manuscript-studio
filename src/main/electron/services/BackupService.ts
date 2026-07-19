import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import type { ProjectService } from './ProjectService';

export class BackupService {
  constructor(private project: ProjectService) {}

  list(projectId: string) {
    const p = this.project.openProject(projectId);
    if (!p) return [];
    const backupsDir = path.join(p.path, 'backups');
    if (!fs.existsSync(backupsDir)) return [];
    return fs.readdirSync(backupsDir)
      .filter(f => f.endsWith('.zip'))
      .map(name => ({ id: name, path: path.join(backupsDir, name), createdAt: fs.statSync(path.join(backupsDir, name)).mtimeMs }));
  }

  async create(projectId: string, label = 'auto') {
    const p = this.project.openProject(projectId);
    if (!p) throw new Error('Project not found');
    const zip = new AdmZip();
    const rels = {
      'manuscript/current.md': path.join(p.path, 'manuscript', 'current.md'),
      'intelligence/graph.json': path.join(p.path, 'intelligence', 'graph.json'),
      'intelligence/timeline.json': path.join(p.path, 'intelligence', 'timeline.json'),
    };
    for (const [rel, full] of Object.entries(rels)) {
      if (fs.existsSync(full)) zip.addLocalFile(full, path.dirname(rel), path.basename(rel));
    }
    const backupsDir = path.join(p.path, 'backups');
    fs.mkdirSync(backupsDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0,19);
    const outName = `${stamp}_${label}.zip`;
    zip.writeZip(path.join(backupsDir, outName));
    return { id: outName, createdAt: Date.now() };
  }

  restore(projectId: string, backupId: string) {
    const p = this.project.openProject(projectId);
    if (!p) throw new Error('Project not found');
    const zipPath = path.join(p.path, 'backups', backupId);
    if (!fs.existsSync(zipPath)) throw new Error('Backup not found');
    const zip = new AdmZip(zipPath);
    zip.getEntries().forEach(entry => {
      const out = path.join(p.path, entry.entryName);
      if (entry.entryName.endsWith('/') || entry.isDirectory) {
        fs.mkdirSync(out, { recursive: true });
      } else {
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, entry.getData());
      }
    });
  }
}
