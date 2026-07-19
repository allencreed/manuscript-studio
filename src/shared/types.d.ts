/// <reference types="vite/client" />

declare global {
  interface Window {
    hms?: {
      projects: {
        list: () => Promise<any[]>;
        create: (p: { name: string }) => Promise<any>;
        open: (id: string) => Promise<any>;
        delete: (id: string) => Promise<void>;
      };
      documents: {
        save: (p: { projectId: string; manuscriptId?: string; title: string; content: string }) => Promise<string>;
        load: (manuscriptId: string) => Promise<any>;
        import: (p: { absolutePath: string; projectId: string }) => Promise<{ id: string; title: string; content: string }>;
      };
      versions: {
        list: (manuscriptId: string) => Promise<any[]>;
        save: (p: { manuscriptId: string; content: string; version_type?: string; label?: string }) => Promise<string>;
        restore: (versionId: string) => Promise<any>;
      };
      backups: {
        list: (projectId: string) => Promise<any[]>;
        restore: (p: { projectId: string; backupId: string }) => Promise<void>;
      };
      ai: {
        chat: (p: { prompt: string }) => Promise<{ reply: string }>;
        suggest: (p: { manuscriptId: string }) => Promise<{ text: string }>;
      };
      model: {
        status: () => Promise<{ running: boolean; models: string[] }>;
      };
      settings: {
        get: () => Promise<any>;
        set: (p: any) => Promise<any>;
      };
    };
  }
}

export {};
