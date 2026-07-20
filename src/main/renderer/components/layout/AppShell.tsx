import { useState } from 'react';
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
