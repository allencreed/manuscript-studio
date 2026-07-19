import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import http from 'http';

export class ModelService {
  settingsPath = path.join(app.getPath('userData'), 'settings.json');

  async status(): Promise<{ running: boolean; models: string[] }> {
    return { running: false, models: [] };
  }

  async chat({ prompt }: { prompt: string }): Promise<{ reply: string }> {
    const settings = this.getSettings();
    const body = JSON.stringify({ model: settings.preferredModel ?? 'Qwen2.5:3b', prompt, stream: false });
    await new Promise<void>((resolve, reject) => {
      const req = http.request({ hostname: 'localhost', port: 11434, path: '/api/generate', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
        let data = '';
        res.on('data', d => (data += d));
        res.on('end', () => resolve());
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
    return { reply: '(placeholder)' };
  }

  async suggest(): Promise<{ text: string }> {
    return { text: 'This feature requires the runtime agent loop to be wired up in Sprint 3.' };
  }

  private getSettings() {
    try { return JSON.parse(fs.readFileSync(this.settingsPath, 'utf-8')); } catch { return {}; }
  }
}
