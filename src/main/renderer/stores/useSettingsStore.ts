import { create } from 'zustand';
import { UserSettings } from '../../../shared/types';

export interface SettingsStore {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>(set => ({
  settings: {
    authorName: '',
    backupFrequencyMinutes: 10,
    preferredModel: 'Qwen2.5:3b',
    ollamaEndpoint: 'http://localhost:11434',
    remoteEnabled: false,
    theme: 'system',
  },
  loadSettings: async () => {
    if (!window.hms) return;
    const settings = await window.hms.settings.get();
    set({ settings });
  },
  updateSettings: async (patch: Partial<UserSettings>) => {
    if (!window.hms) return;
    const updated = await window.hms.settings.set(patch as any);
    set({ settings: updated });
  },
}));
