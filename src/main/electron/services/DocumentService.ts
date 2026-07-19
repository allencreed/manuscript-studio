import * as fs from 'fs';
import * as path from 'path';
import type { ProjectService } from './ProjectService';
import { Document } from '../../../shared/types';

export class DocumentService {
  constructor(private project: ProjectService) {}

  save({ projectId, manuscriptId, title, content }: { projectId: string; manuscriptId?: string; title: string; content: string }) {
    const p = this.project.openProject(projectId);
    if (!p) throw new Error('Project not found');
    const id = manuscriptId ?? 'current';
    const full = path.join(p.path, 'manuscript', `${id}.md`);
    fs.writeFileSync(full, content, 'utf-8');
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    this.project.getDb().prepare(`
      INSERT INTO documents (id,project_id,title,content,word_count,format,modified_at)
      VALUES (@id,@projectId,@title,@content,@wordCount,'markdown',@modifiedAt)
      ON CONFLICT(id) DO UPDATE SET title=@title, content=@content, word_count=@wordCount, modified_at=@modifiedAt
    `).run({
      id,
      projectId,
      title,
      content,
      wordCount,
      modifiedAt: Date.now(),
    });
    return id;
  }

  load(manuscriptId: string): Document | null {
    const doc = this.project.getDb().prepare('SELECT * FROM documents WHERE id = ?').get(manuscriptId) as any;
    if (doc) return doc;
    return null;
  }

  async import({ absolutePath, projectId }: { absolutePath: string; projectId: string }) {
    const p = this.project.openProject(projectId);
    if (!p) throw new Error('Project not found');
    const content = fs.readFileSync(absolutePath, 'utf-8');
    const title = path.basename(absolutePath, path.extname(absolutePath));
    const id = title.replace(/[^a-zA-Z0-9_-]+/gi, '_').toLowerCase();
    return this.save({ projectId, manuscriptId: id, title, content });
  }
}
