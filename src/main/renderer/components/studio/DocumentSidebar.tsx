import { useEffect, useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';

type Doc = { id?: string; title?: string; content?: string; updatedAt?: string };

export function DocumentSidebar({
  activeDocId,
  onSelect,
}: {
  activeDocId: string | null;
  onSelect: (id: string) => void;
}) {
  const { activeProject } = useProjectStore();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!activeProject) return;
    try {
      const list = (await window.hms!.documents.list({ projectId: activeProject.id })) as Doc[];
      setDocs(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    refresh();
  }, [activeProject]);

  const createDoc = async () => {
    if (!activeProject || !newTitle.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const doc = await window.hms!.documents.save({
        projectId: activeProject.id,
        title: newTitle.trim(),
        content: '<p></p>',
      });
      setNewTitle('');
      await refresh();
      onSelect(doc.id!);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  };

  const importFile = async () => {
    if (!activeProject || importing) return;
    setImporting(true);
    setError(null);
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.md,.docx';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          setImporting(false);
          return;
        }
        const text = await file.text();
        const doc = await window.hms!.documents.import({
          projectId: activeProject.id,
          title: file.name.replace(/\.[^.]+$/, ''),
          content: text,
        });
        await refresh();
        onSelect(doc.id!);
        setImporting(false);
      };
      input.click();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setImporting(false);
    }
  };

  const deleteDoc = async (id: string) => {
    if (!activeProject || !confirm('Delete this document?')) return;
    try {
      await window.hms!.projects.delete(id);
      await refresh();
      if (activeDocId === id) onSelect('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (!activeProject) {
    return (
      <aside style={{ width: 260, borderRight: '1px solid #222', padding: 16, opacity: 0.5 }}>
        Open a project to see documents.
      </aside>
    );
  }

  return (
    <aside style={{ width: 260, borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', background: '#141414' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #222' }}>
        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>Documents</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New doc…"
            style={{ flex: 1, background: '#181818', border: '1px solid #2e2e2e', color: '#e6e6e6', padding: '6px 8px', borderRadius: 6 }}
          />
          <button onClick={createDoc} disabled={creating} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>
            {creating ? '…' : '+'}
          </button>
          <button onClick={importFile} disabled={importing} title="Import" style={{ background: '#333', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>
            ↑
          </button>
        </div>
      </div>
      {error && <div style={{ padding: 8, color: '#ffb4b4', fontSize: 12 }}>{error}</div>}
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {docs.length === 0 && <div style={{ opacity: 0.6, fontSize: 13 }}>No documents yet.</div>}
        {docs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSelect(doc.id ?? '')}
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              background: activeDocId === doc.id ? '#1f2b38' : 'transparent',
              border: '1px solid ' + (activeDocId === doc.id ? '#2563eb' : 'transparent'),
              marginBottom: 4,
            }}
          >
            <div style={{ fontSize: 13 }}>{doc.title}</div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>
              {doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : ''}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
