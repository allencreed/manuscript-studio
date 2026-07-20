import { useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { DocumentSidebar } from '../studio/DocumentSidebar';
import { EditorWorkspace } from '../studio/EditorWorkspace';
import { VersionHistory } from '../studio/VersionHistory';

export function AppShell() {
  const { activeProject } = useProjectStore();
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  if (!activeProject) return <DocumentSidebar activeDocId={null} onSelect={(id) => setActiveDocId(id)} />;

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', fontFamily: 'system-ui, sans-serif', color: '#e6e6e6' }}>
      <DocumentSidebar activeDocId={activeDocId} onSelect={(id) => setActiveDocId(id)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <EditorWorkspace projectId={activeProject.id} activeDocId={activeDocId} onDocChange={(id) => setActiveDocId(id ?? null)} />
      </div>
      <VersionHistory manuscriptId={activeDocId || undefined} projectId={activeProject.id} />
    </div>
  );
}
