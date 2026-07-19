import { useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { ChapterNavigator } from '../studio/ChapterNavigator';
import { EditorWorkspace } from '../studio/EditorWorkspace';
import { Sidebar } from './Sidebar';

function ProjectGate() {
  const { createProject } = useProjectStore();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif', color: '#e6e6e6' }}>
      <h1 style={{ marginBottom: 12 }}>Hermes Manuscript Studio</h1>
      <p style={{ marginBottom: 24, opacity: 0.7 }}>Pick a project or create a new one to begin.</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New project name…" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #2e2e2e', background: '#181818', color: '#e6e6e6', minWidth: 200 }} />
        <button
          onClick={async () => {
            if (!name.trim() || busy) return;
            setBusy(true);
            try {
              await createProject(name.trim());
              setName('');
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
      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.5 }}>If you see this, React is rendering.</div>
    </div>
  );
}

export function AppShell() {
  const { activeProject } = useProjectStore();
  if (!activeProject) return <ProjectGate />;
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', fontFamily: 'system-ui, sans-serif', color: '#e6e6e6' }}>
      <ChapterNavigator />
      <EditorWorkspace />
      <Sidebar />
    </div>
  );
}
