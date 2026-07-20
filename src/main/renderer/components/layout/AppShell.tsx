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
    return <DocumentSidebar activeDocId={null} onSelect={(id) => setActiveDocId(id)} />;
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
