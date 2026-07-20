import { useEffect, useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { DocumentSidebar } from '../studio/DocumentSidebar';
import { EditorWorkspace } from '../studio/EditorWorkspace';
import { VersionHistory } from '../studio/VersionHistory';
import { AiChat } from '../studio/AiChat';
import { SettingsScreen } from '../settings/SettingsScreen';

type Tab = 'editor' | 'ai' | 'settings';

export function AppShell() {
  const { activeProject } = useProjectStore();
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('editor');

  if (!activeProject) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', fontFamily: 'system-ui, sans-serif', color: '#e6e6e6' }}>
        <div style={{ width: 320, padding: 24, borderRight: '1px solid #222', background: '#141414' }}>
          <h2 style={{ marginTop: 0, marginBottom: 16 }}>Projects</h2>
          <ProjectForm />
          <RecentList />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
          Select or create a project.
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', fontFamily: 'system-ui, sans-serif', color: '#e6e6e6' }}>
      <div style={{ width: 220, borderRight: '1px solid #222', background: '#141414' }}>
        <div style={{ padding: 12, borderBottom: '1px solid #222', fontWeight: 600 }}>{activeProject.name}</div>
        <div style={{ padding: 8 }}>
          {(['editor', 'ai', 'settings'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ width: '100%', textAlign: 'left', background: tab === t ? '#1f2b38' : 'transparent', color: '#e6e6e6', border: '1px solid ' + (tab === t ? '#2563eb' : 'transparent'), padding: '8px 10px', borderRadius: 6, marginBottom: 4, cursor: 'pointer', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {tab === 'editor' && (
          <EditorWorkspace projectId={activeProject.id} activeDocId={activeDocId} onDocChange={(id) => setActiveDocId(id ?? null)} />
        )}
        {tab === 'ai' && <AiChat />}
        {tab === 'settings' && <SettingsScreen />}
      </div>
      {tab === 'editor' && <VersionHistory manuscriptId={activeDocId || undefined} projectId={activeProject.id} />}
    </div>
  );
}

function ProjectForm() {
  const { createProject } = useProjectStore();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createProject(name.trim());
      setName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name…" style={{ width: '100%', background: '#181818', border: '1px solid #2e2e2e', color: '#e6e6e6', padding: '8px 10px', borderRadius: 6, marginBottom: 8 }} />
      <button onClick={submit} disabled={busy} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}>
        {busy ? 'Creating…' : 'Create project'}
      </button>
      {error && <div style={{ marginTop: 8, color: '#ffb4b4', fontSize: 12 }}>{error}</div>}
    </div>
  );
}

function RecentList() {
  const { projects, loadProjects, openProject } = useProjectStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects().catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [loadProjects]);

  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>Recent projects</div>
      {error && <div style={{ color: '#ffb4b4', fontSize: 12, marginBottom: 8 }}>{error}</div>}
      {projects.length === 0 && <div style={{ opacity: 0.6, fontSize: 13 }}>No projects yet.</div>}
      {projects.map((p) => (
        <div key={p.id} onClick={() => openProject(p.id)} style={{ padding: '10px 12px', borderRadius: 6, cursor: 'pointer', background: '#181818', border: '1px solid #2e2e2e', marginBottom: 6 }}>
          <div style={{ fontSize: 14 }}>{p.name}</div>
          <div style={{ fontSize: 11, opacity: 0.5 }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</div>
        </div>
      ))}
    </div>
  );
}
