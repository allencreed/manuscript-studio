export interface Project {
  id: string;
  name: string;
  path: string;
  created_at: number;
  updated_at: number;
  metadata?: Record<string, unknown>;
}

export interface Document {
  id: string;
  project_id: string;
  title: string;
  content: string;
  word_count: number;
  format: 'markdown' | 'docx' | 'txt';
}

export interface Version {
  id: string;
  manuscript_id: string;
  version_type: 'original' | 'ai-revision' | 'author-revision' | 'final';
  content: string;
  label?: string;
  created_at: number;
}

export interface AIPrompt {
  manuscriptId: string;
  prompt: string;
  context?: string;
}

export interface KnowledgeNode {
  id: string;
  project_id: string;
  type: 'character' | 'location' | 'theme' | 'event';
  name: string;
  properties: Record<string, unknown>;
}

export interface UserSettings {
  authorName?: string;
  backupFrequencyMinutes: number;
  preferredModel: string;
  ollamaEndpoint: string;
  remoteEnabled: boolean;
  remoteEndpoint?: string;
  theme: 'light' | 'dark' | 'system';
}
