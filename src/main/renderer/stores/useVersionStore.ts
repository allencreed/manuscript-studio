import { create } from 'zustand';

export interface Version {
  id: string;
  content: string;
  label: string;
  type: string;
  created_at: number;
}

export interface VersionStore {
  versions: Version[];
  loadVersions: () => Promise<void>;
}

export const useVersionStore = create<VersionStore>(() => ({
  versions: [],
  loadVersions: async () => {
    if (!window.hms) return;
  },
}));
