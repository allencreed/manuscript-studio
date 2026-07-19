import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { useProjectStore } from '../../stores/useProjectStore';

type LocalDoc = { id?: string; title?: string; content?: string };

export function EditorWorkspace() {
  const { activeProject } = useProjectStore();
  const [title, setTitle] = useState('Untitled');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!activeProject || !editor) return;
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const doc = (await window.hms!.documents.list({ projectId: activeProject.id })) as LocalDoc[];
        const current = doc[0];
        if (current && !cancelled) {
          setTitle(current.title ?? 'Untitled');
          editor.commands.setContent((current.content as string) ?? '<p></p>');
          setSavedAt(current.updatedAt ?? null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [activeProject, editor]);

  const saveDocument = async () => {
    if (!activeProject || !editor) return;
    setError(null);
    try {
      await window.hms!.documents.save({
        projectId: activeProject.id,
        title,
        content: editor.getJSON(),
      });
      setSavedAt(new Date().toISOString());
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    }
  };

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0f0f0f', minWidth: 0 }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #222', display: 'flex', gap: 12, alignItems: 'center' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#e6e6e6', fontSize: 14, flex: 1 }} />
        <span style={{ fontSize: 12, opacity: 0.5 }}>{savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : 'Not saved'}</span>
        <button onClick={saveDocument} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>Save</button>
      </div>
      {error && <div style={{ padding: '8px 16px', background: '#3b1515', color: '#ffb4b4' }}>{error}</div>}
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <EditorContent editor={editor} />
      </div>
    </main>
  );
}
