import { useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';

export function ChatPanel() {
  const { activeProject } = useProjectStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!activeProject || !input.trim()) return;
    const text = input.trim();
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await window.hms!.ai.chat({ prompt: text });
      setMessages(m => [...m, { role: 'assistant', text: res.reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: 'Error contacting Hermes runtime.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside style={{ width: 320, background: '#121212', borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #222', fontWeight: 600, fontSize: 13 }}>Hermes AI</div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && <div style={{ opacity: 0.5, fontSize: 13 }}>Ask for help writing, editing, or analyzing your manuscript.</div>}
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#2563eb' : '#1e1e1e', padding: '8px 12px', borderRadius: 12, fontSize: 13, maxWidth: '85%' }}>{m.text}</div>
        ))}
        {loading && <div style={{ opacity: 0.5, fontSize: 13 }}>Thinking…</div>}
      </div>
      <div style={{ padding: 12, borderTop: '1px solid #222', display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask Hermes…" style={{ flex: 1, background: '#181818', border: '1px solid #2e2e2e', borderRadius: 8, color: '#e6e6e6', padding: '8px 10px' }} />
        <button onClick={send} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Send</button>
      </div>
    </aside>
  );
}
