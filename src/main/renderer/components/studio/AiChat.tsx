import { useEffect, useState } from 'react';

export function AiChat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.hms?.ai.chat({ messages: [] }).then((reply: any) => {
      if (reply?.reply) setMessages((m) => [...m, { role: 'assistant', text: reply.reply }]);
    }).catch(() => {});
  }, []);

  const send = async () => {
    if (!input.trim() || busy) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setBusy(true);
    setError(null);
    try {
      const reply = await window.hms!.ai.chat({ messages: [...messages, { role: 'user', text }] });
      if (reply?.reply) setMessages((m) => [...m, { role: 'assistant', text: reply.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ padding: 12, borderBottom: '1px solid #222' }}>
        <div style={{ fontSize: 12, opacity: 0.6 }}>Assistant</div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {messages.length === 0 && <div style={{ opacity: 0.6, fontSize: 13 }}>Ask anything about your manuscript.</div>}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{m.role === 'user' ? 'You' : 'Assistant'}</div>
            <div style={{ fontSize: 13, background: '#181818', padding: 8, borderRadius: 6, border: '1px solid #2e2e2e' }}>{m.text}</div>
          </div>
        ))}
      </div>
      {error && <div style={{ padding: 8, color: '#ffb4b4', fontSize: 12 }}>{error}</div>}
      <div style={{ padding: 12, borderTop: '1px solid #222', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your manuscript…"
          style={{ flex: 1, background: '#181818', border: '1px solid #2e2e2e', color: '#e6e6e6', padding: '8px 10px', borderRadius: 6 }}
        />
        <button onClick={send} disabled={busy} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>
          {busy ? '…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
