import { useEffect, useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';

type Version = { id?: string; createdAt?: string; label?: string };

export function VersionHistory({
  manuscriptId,
  projectId,
}: {
  manuscriptId?: string;
  projectId?: string;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!manuscriptId || !projectId) return;
    setLoading(true);
    setError(null);
    try {
      const list = (await window.hms!.versions.list({ manuscriptId, projectId })) as Version[];
      setVersions(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [manuscriptId, projectId]);

  const saveVersion = async () => {
    if (!manuscriptId || !projectId) return;
    setError(null);
    try {
      await window.hms!.versions.save({ manuscriptId, projectId, label: 'Manual save' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (!manuscriptId || !projectId) {
    return (
      <aside style={{ width: 240, borderLeft: '1px solid #222', padding: 12, opacity: 0.5 }}>
        Select a document to view history.
      </aside>
    );
  }

  return (
    <aside style={{ width: 240, borderLeft: '1px solid #222', background: '#141414', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #222' }}>
        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>Version history</div>
        <button onClick={saveVersion} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>
          Save version
        </button>
      </div>
      {error && <div style={{ padding: 8, color: '#ffb4b4', fontSize: 12 }}>{error}</div>}
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {loading && <div style={{ opacity: 0.6, fontSize: 13 }}>Loading…</div>}
        {versions.length === 0 && !loading && <div style={{ opacity: 0.6, fontSize: 13 }}>No versions yet.</div>}
        {versions.map((v) => (
          <div key={v.id} style={{ padding: '6px 8px', borderRadius: 6, marginBottom: 4, background: '#181818', border: '1px solid #2e2e2e', fontSize: 12 }}>
            <div>{v.label ?? 'Version'}</div>
            <div style={{ opacity: 0.5 }}>{v.createdAt ? new Date(v.createdAt).toLocaleString() : ''}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
