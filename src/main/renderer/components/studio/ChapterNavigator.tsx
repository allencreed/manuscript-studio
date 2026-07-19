import { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';

export function ChapterNavigator() {
  const { openProject } = useProjectStore();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const list = (await window.hms!.projects.list()) as any[];
      setProjects(list);
    })();
  }, []);

  return (
    <div style={{ width: 220, background: '#121212', borderRight: '1px solid #222', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.3, marginBottom: 4 }}>Library</div>
      {projects.map(p => (
        <button key={p.id} onClick={() => openProject(p.id)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #2a2a2a', background: '#181818', color: '#e6e6e6', textAlign: 'left', cursor: 'pointer', fontSize: 12 }}>
          {String((p as any).name)}
        </button>
      ))}
    </div>
  );
}
