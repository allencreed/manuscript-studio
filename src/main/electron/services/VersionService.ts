import { v4 as uuidv4 } from 'uuid';
import type { ProjectService } from './ProjectService';
import { Version } from '../../../shared/types';

export class VersionService {
  constructor(private project: ProjectService) {}

  list(manuscriptId: string): Version[] {
    return this.project.getDb().prepare('SELECT * FROM versions WHERE manuscript_id = ? ORDER BY created_at DESC').all(manuscriptId) as Version[];
  }

  save({ manuscriptId, content, version_type = 'author-revision', label }: { manuscriptId: string; content: string; version_type?: Version['version_type']; label?: string }) {
    const id = uuidv4();
    this.project.getDb().prepare(
      'INSERT INTO versions (id,manuscript_id,version_type,content,label,created_at) VALUES (?,?,?,?,?,?)'
    ).run(id, manuscriptId, version_type, content, label ?? '', Date.now());
    return id;
  }

  restore(versionId: string) {
    const v = this.project.getDb().prepare('SELECT * FROM versions WHERE id = ?').get(versionId) as any;
    if (!v) throw new Error('Version not found');
    // The consumer (Renderer) will call document.save with this content.
    return v;
  }
}
