import { UserSettings } from '../../../shared/types';
import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export class SettingsService {
  settingsPath = path.join(app.getPath('userData'), 'settings.json');
  defaults: UserSettings = {
    backupFrequencyMinutes: 10,
    preferredModel: 'Qwen2.5:3b',
    ollamaEndpoint: 'http://localhost:11434',
    remoteEnabled: false,
    theme: 'system',
  };

  getAll(): UserSettings {
    if (fs.existsSync(this.settingsPath)) {
      try { return { ...this.defaults, ...JSON.parse(fs.readFileSync(this.settingsPath, 'utf-8')) }; }
      catch { /* ignore */ }
    }
    return { ...this.defaults };
  }

  set(patch: Partial<UserSettings>): UserSettings {
    const cur = this.getAll();
    const next = { ...cur, ...patch };
    fs.writeFileSync(this.settingsPath, JSON.stringify(next, null, 2));
    return next;
  }
}
