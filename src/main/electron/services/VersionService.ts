import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import type { ProjectService } from './ProjectService';
import { Version } from '../../../shared/types';

export class VersionService {
  constructor(private project: ProjectService) {}

  async list({ projectId, manuscriptId }: { projectId: string; manuscriptId: string }): Promise<Version[]> {
    const p = await this.project.openProject(projectId);
    if (!p) return [];
    const versionsDir = path.join(p.path, 'versions');
    if (!fs.existsSync(versionsDir)) return [];
    return fs.readdirSync(versionsDir)
      .filter((f) => f.endsWith('.json'))
      .map((name) => {
        const full = path.join(versionsDir, name);
        const raw = fs.readFileSync(full, 'utf-8');
        return JSON.parse(raw) as Version;
      })
      .filter((v) => v.manuscript_id === manuscriptId)
      .sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
  }

  async save({ manuscriptId, content, version_type, label }: { manuscriptId: string; content: string; version_type?: string; label?: string }) {
    const p = await this.project.openProject(manuscriptId);
    if (!p) throw new Error('Project not found');
    const versionsDir = path.join(p.path, 'versions');
    fs.mkdirSync(versionsDir, { recursive: true });
    const id = uuidv4();
    const vt = (['original','author-revision','ai-revision','final'] as const).includes((version_type ?? 'author-revision') as any)
      ? (version_type as any)
      : 'author-revision';
    const record: Version = {
      id,
      manuscript_id: manuscriptId,
      version_type: vt,
      content,
      label: label ?? '',
      created_at: Date.now(),
    };
    fs.writeFileSync(path.join(versionsDir, `${id}.json`), JSON.stringify(record, null, 2));
    return id;
  }

  async restore(versionId: string) {
    const p = await this.project.openProject(versionId);
    if (!p) throw new Error('Version not found');
    const full = path.join(p.path, 'versions', `${versionId}.json`);
    if (!fs.existsSync(full)) throw new Error('Version not found');
    const record = JSON.parse(fs.readFileSync(full, 'utf-8')) as Version;
    return record;
  }
}
