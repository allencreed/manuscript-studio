import { useEffect, useState } from 'react';

type Settings = Record<string, any>;

export function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.hms?.settings.get?.().then((data: Settings) => setSettings(data ?? {})).catch(() => {});
  }, []);

  const update = (key: string, value: any) => setSettings((s) => ({ ...s, [key]: value }));

  const save = async () => {
    setError(null);
    try {
      const next = await window.hms!.settings.set(settings);
      setSettings(next ?? settings);
      setSaved(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, color: '#e6e6e6' }}>
      <h2 style={{ marginTop: 0 }}>Settings</h2>
      <div style={{ maxWidth: 480 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>Auto-backup interval (minutes)</div>
          <input type="number" value={settings.autoBackupMinutes ?? 30} onChange={(e) => update('autoBackupMinutes', Number(e.target.value))} style={{ width: '100%', background: '#181818', border: '1px solid #2e2e2e', color: '#e6e6e6', padding: '8px 10px', borderRadius: 6 }} />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>Writing goal (words)</div>
          <input type="number" value={settings.writingGoalWords ?? 2000} onChange={(e) => update('writingGoalWords', Number(e.target.value))} style={{ width: '100%', background: '#181818', border: '1px solid #2e2e2e', color: '#e6e6e6', padding: '8px 10px', borderRadius: 6 }} />
        </label>
        {saved && <div style={{ fontSize: 12, opacity: 0.6 }}>Saved at {saved}</div>}
        {error && <div style={{ color: '#ffb4b4', fontSize: 12 }}>{error}</div>}
        <button onClick={save} style={{ marginTop: 12, background: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>Save settings</button>
      </div>
    </div>
  );
}
