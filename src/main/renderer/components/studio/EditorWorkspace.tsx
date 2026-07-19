import { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';

export function EditorWorkspace() {
  const { activeProject } = useProjectStore();
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [title, setTitle] = useState('Untitled');

  useEffect(() => {
    if (!activeProject) return;
    (async () => {
      const doc = (await window.hms!.documents.load('current')) as any;
      if (doc) {
        setContent(doc.content ?? '');
        setTitle(doc.title ?? 'Untitled');
        setWordCount(doc.word_count ?? 0);
      }
    })();
  }, [activeProject]);

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0f0f0f', minWidth: 0 }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #222', display: 'flex', gap: 12, alignItems: 'center' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#e6e6e6', fontSize: 14, flex: 1 }} />
        <span style={{ fontSize: 12, opacity: 0.5 }}>{wordCount} words</span>
        <button
          onClick={async () => {
            if (!activeProject) return;
            await window.hms!.documents.save({ projectId: (activeProject as any).id, manuscriptId: 'current', title, content });
            setWordCount(content.split(/\s+/).filter(Boolean).length);
          }}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}
        >
          Save
        </button>
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Begin writing…"
        style={{ flex: 1, background: '#0f0f0f', color: '#e6e6e6', border: 'none', padding: 24, fontSize: 16, lineHeight: 1.7, resize: 'none', outline: 'none' }}
      />
    </main>
  );
}
