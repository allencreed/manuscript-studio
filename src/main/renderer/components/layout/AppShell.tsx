import { useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { EditorWorkspace } from '../studio/EditorWorkspace';

export function ProjectGate() {
  const { createProject } = useProjectStore();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (typeof window === 'undefined' || !window.hms) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif', color: '#e6e6e6' }}>
        <h1>Hermes Manuscript Studio</h1>
        <p style={{ color: '#ff6b6b' }}>Main bridge is missing. Open DevTools (Ctrl+Shift+I) and check Console.</p>
        <p style={{ opacity: 0.7 }}>Expected: window.hms object present after preload loads.</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif', color: '#e6e6e6' }}>
      <h1 style={{ marginBottom: 12 }}>Hermes Manuscript Studio</h1>
      <p style={{ marginBottom: 24, opacity: 0.7 }}>Pick a project or create a new one to begin.</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <input value={name} onChange={e => { setName(e.target.value); setError(null); }} placeholder="New project name…" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #2e2e2e', background: '#181818', color: '#e6e6e6', minWidth: 200 }} />
        <button
          onClick={async () => {
            if (!name.trim() || busy) return;
            setBusy(true);
            setError(null);
            try {
              await createProject(name.trim());
              setName('');
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              setError(msg);
              console.error('[ProjectGate] Create failed:', err);
            } finally {
              setBusy(false);
            }
          }}
          style={{ padding: '10px 14px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}
          disabled={busy}
        >
          {busy ? 'Creating...' : 'Create'}
        </button>
      </div>
      {error && <p style={{ marginTop: 16, color: '#ff6b6b' }}>Error: {error}</p>}
    </div>
  );
}

export function AppShell() {
  const { activeProject } = useProjectStore();
  if (!activeProject) return <ProjectGate />;
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', fontFamily: 'system-ui, sans-serif', color: '#e6e6e6' }}>
      <div style={{ padding: 16, borderRight: '1px solid #2e2e2e' }}>Project: {activeProject.name}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <EditorWorkspace />
      </div>
    </div>
  );
}
