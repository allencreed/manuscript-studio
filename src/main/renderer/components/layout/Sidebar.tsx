import { useProjectStore } from '../../stores/useProjectStore';

export function Sidebar() {
  const { activeProject } = useProjectStore();

  return (
    <aside style={{ width: 220, background: '#121212', borderLeft: '1px solid #222', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.3 }}>Hermes</div>
      {activeProject ? (
        <>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{String((activeProject as any).name)}</div>
          <button onClick={() => window.hms!.ai.chat({ prompt: 'Summarize my manuscript.' })} style={styles.btn}>Ask Hermes</button>
          <button onClick={async () => { if (activeProject) await window.hms!.backups.create((activeProject as any).id); }} style={styles.btn}>Create Backup</button>
          <button onClick={() => window.hms!.settings.get().then((s: any) => alert(JSON.stringify(s, null, 2)))} style={styles.btn}>Settings</button>
        </>
      ) : (
        <div style={{ fontSize: 12, opacity: 0.5, marginTop: 8 }}>Select or create a project to start.</div>
      )}
    </aside>
  );
}

const styles = {
  btn: { padding: '8px 10px', borderRadius: 6, border: '1px solid #2a2a2a', background: '#181818', color: '#e6e6e6', textAlign: 'left' as const, cursor: 'pointer', fontSize: 12 },
};
