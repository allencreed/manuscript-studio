import * as fs from 'fs';
import * as path from 'path';
import type { ProjectService } from './ProjectService';
import { Document } from '../../../shared/types';

export class DocumentService {
  constructor(private project: ProjectService) {}

  async save({ projectId, manuscriptId, title, content }: { projectId: string; manuscriptId?: string; title: string; content: string }) {
    const p = await this.project.openProject(projectId);
    if (!p) throw new Error('Project not found');
    const id = manuscriptId ?? 'current';
    const md = path.join(p.path, 'manuscript', `${id}.md`);
    fs.writeFileSync(md, content, 'utf-8');
    const meta = path.join(p.path, 'manuscript', `${id}.meta.json`);
    fs.writeFileSync(meta, JSON.stringify({ id, title, projectId, updatedAt: Date.now() }, null, 2), 'utf-8');
    return id;
  }

  async load({ projectId, manuscriptId }: { projectId: string; manuscriptId: string }): Promise<Document | null> {
    const p = await this.project.openProject(projectId);
    if (!p) return null;
    const full = path.join(p.path, 'manuscript', `${manuscriptId}.md`);
    if (!fs.existsSync(full)) return null;
    const content = fs.readFileSync(full, 'utf-8');
    return {
      id: manuscriptId,
      project_id: projectId,
      title: '',
      content,
      word_count: content.split(/\s+/).filter(Boolean).length,
      format: 'markdown',
      modified_at: Date.now(),
    } as any;
  }

  async import({ absolutePath, projectId }: { absolutePath: string; projectId: string }) {
    const content = fs.readFileSync(absolutePath, 'utf-8');
    const title = path.basename(absolutePath, path.extname(absolutePath));
    const safeTitle = title.replace(/[^a-zA-Z0-9_.-]+/gi, '') || 'import';
    return this.save({ projectId, manuscriptId: safeTitle, title, content });
  }
}
