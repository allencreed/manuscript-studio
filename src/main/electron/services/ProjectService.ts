import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '../../../shared/types';

export class ProjectService {
  private db: Database.Database;

  constructor() {
    const appData = app.getPath('userData');
    const projectsDir = path.join(appData, 'projects');
    if (!fs.existsSync(projectsDir)) fs.mkdirSync(projectsDir, { recursive: true });
    this.db = new Database(path.join(appData, 'main.db'));
    this.db.pragma('journal_mode = WAL');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        metadata TEXT
      );
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        word_count INTEGER DEFAULT 0,
        format TEXT DEFAULT 'markdown',
        modified_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS versions (
        id TEXT PRIMARY KEY,
        manuscript_id TEXT NOT NULL,
        version_type TEXT NOT NULL,
        content TEXT NOT NULL,
        label TEXT,
        created_at INTEGER NOT NULL
      );
    `);
  }

  listProjects(): Project[] {
    return this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as any[];
  }

  createProject(name: string): Project {
    const id = uuidv4();
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48);
    const projPath = path.join(app.getPath('userData'), 'projects', `${nameSlug}-${id}`);
    [
      'manuscript', 'versions', 'intelligence', 'backups', 'attachments'
    ].forEach(sub => fs.mkdirSync(path.join(projPath, sub), { recursive: true }));
    fs.writeFileSync(path.join(projPath, 'manuscript', 'current.md'), '');
    const now = Date.now();
    const p: Project = { id, name, path: projPath, created_at: now, updated_at: now };
    this.db.prepare('INSERT INTO projects (id,name,path,created_at,updated_at) VALUES (?,?,?,?,?)')
      .run(id, name, projPath, now, now);
    return p;
  }

  openProject(id: string): Project | null {
    const row = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any | undefined;
    return row ? { ...row, metadata: JSON.parse(row.metadata ?? '{}') } : null;
  }

  deleteProject(id: string): void {
    const row = this.db.prepare('SELECT path FROM projects WHERE id = ?').get(id) as any | undefined;
    if (row) {
      try { fs.rmSync(row.path, { recursive: true, force: true }); } catch { /* ignore */ }
    }
    this.db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  }

  getDb(): Database.Database { return this.db; }
}
