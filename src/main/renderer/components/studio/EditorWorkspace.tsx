import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';

type LocalDoc = { id?: string; title?: string; content?: string; updatedAt?: string };

export function EditorWorkspace({
  projectId,
  activeDocId,
  onDocChange,
}: {
  projectId: string;
  activeDocId: string | null;
  onDocChange: (id: string | null) => void;
}) {
  const [title, setTitle] = useState('Untitled');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Typography,
      Placeholder.configure({ placeholder: 'Begin writing…' }),
    ],
    content: '<p></p>',
    editorProps: {
      attributes: { style: 'min-height: 60vh; outline: none;' },
    },
  });

  const loadDoc = async (id: string) => {
    setError(null);
    try {
      const doc = (await window.hms!.documents.load({ projectId, manuscriptId: id })) as LocalDoc | null;
      if (doc) {
        setCurrentDocId(doc.id ?? null);
        setTitle(doc.title ?? 'Untitled');
        if (typeof doc.content === 'string') {
          editor?.commands.setContent(doc.content);
        }
        setSavedAt(doc.updatedAt ?? null);
        onDocChange(doc.id ?? null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const createNewDoc = async () => {
    if (!projectId) return;
    setError(null);
    try {
      const doc = await window.hms!.documents.save({
        projectId,
        title: title || 'Untitled',
        content: editor?.getJSON() ?? '<p></p>',
      });
      setCurrentDocId(doc.id ?? null);
      setSavedAt(new Date().toISOString());
      onDocChange(doc.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    if (!projectId) return;
    if (activeDocId) {
      loadDoc(activeDocId);
    } else {
      setCurrentDocId(null);
      setTitle('Untitled');
      setSavedAt(null);
      editor?.commands.setContent('<p></p>');
    }
  }, [activeDocId, projectId]);

  const saveDocument = async () => {
    if (!projectId) return;
    setError(null);
    try {
      const doc = await window.hms!.documents.save({
        projectId,
        title,
        content: editor?.getJSON() ?? '<p></p>',
      });
      setCurrentDocId(doc.id ?? null);
      setSavedAt(new Date().toISOString());
      onDocChange(doc.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0f0f0f', minWidth: 0 }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #222', display: 'flex', gap: 12, alignItems: 'center' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#e6e6e6', fontSize: 14, flex: 1 }} />
        <span style={{ fontSize: 12, opacity: 0.5 }}>{savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : 'Not saved'}</span>
        <button onClick={createNewDoc} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>New</button>
        <button onClick={saveDocument} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>Save</button>
      </div>
      {error && <div style={{ padding: '8px 16px', background: '#3b1515', color: '#ffb4b4' }}>{error}</div>}
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <EditorContent editor={editor} />
      </div>
    </main>
  );
}
