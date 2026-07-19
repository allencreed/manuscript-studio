import { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { EditorWorkspace } from '../studio/EditorWorkspace';
import { ChapterNavigator } from '../studio/ChapterNavigator';
import { Sidebar } from './Sidebar';

function ProjectGate() {
  const { projects, openProject, createProject, loadProjects } = useProjectStore();
  const [name, setName] = useState('');

  useEffect(() => {
    loadProjects().catch(() => {});
  }, [loadProjects]);
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif', color: '#e6e6e6' }}>
      <h1 style={{ marginBottom: 12 }}>Hermes Manuscript Studio</h1>
      <p style={{ marginBottom: 24, opacity: 0.7 }}>Pick a project or create a new one to begin.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New project name…" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #2e2e2e', background: '#181818', color: '#e6e6e6', minWidth: 200 }} />
        <button onClick={async () => { if (name.trim()) { await createProject(name.trim()); setName(''); } }} style={{ padding: '10px 14px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>Create</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320, width: '100%' }}>
        {projects.map(p => (
          <button key={p.id} onClick={() => openProject(p.id)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #2e2e2e', background: '#111', color: '#e6e6e6', textAlign: 'left', cursor: 'pointer' }}>{String((p as any).name)}</button>
        ))}
      </div>
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
