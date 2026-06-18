'use client';

import { useCallback, useEffect, useState } from 'react';
import { sendChatMessage } from '@/lib/community/actions';
import { SOCKET_CONFIG, type ChatMessagePayload } from '@/lib/community/socket-config';

type Props = {
  roomId?: string;
  recipientId?: string;
  peerId?: string;
  title: string;
};

export function ChatRoom({ roomId = SOCKET_CONFIG.generalRoomId, recipientId, peerId, title }: Props) {
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);
  const [body, setBody] = useState('');
  const [since, setSince] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    const params = new URLSearchParams();
    if (recipientId && peerId) {
      params.set('recipientId', recipientId);
      params.set('peerId', peerId);
    } else {
      params.set('roomId', roomId);
    }
    if (since) params.set('since', since);

    const res = await fetch(`/api/community/messages/?${params.toString()}`);
    if (!res.ok) return;
    const data = (await res.json()) as { messages: ChatMessagePayload[] };
    if (data.messages.length > 0) {
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const merged = [...prev, ...data.messages.filter((m) => !ids.has(m.id))];
        return merged.slice(-200);
      });
      setSince(data.messages[data.messages.length - 1]?.createdAt ?? since);
    }
  }, [roomId, recipientId, peerId, since]);

  useEffect(() => {
    fetchMessages();
    const id = window.setInterval(fetchMessages, SOCKET_CONFIG.pollingIntervalMs);
    return () => window.clearInterval(id);
  }, [fetchMessages]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.set('body', body);
    if (roomId) formData.set('roomId', roomId);
    if (recipientId) formData.set('recipientId', recipientId);
    await sendChatMessage(formData);
    setBody('');
    await fetchMessages();
  }

  return (
    <section className="community-chat">
      <div className="community-chat__head">
        <h1>{title}</h1>
        <p className="community-chat__mode">
          {SOCKET_CONFIG.enabled ? 'Socket.IO configured' : 'Polling mode (set NEXT_PUBLIC_SOCKET_URL for realtime)'}
        </p>
      </div>
      <ul className="community-chat__messages">
        {messages.map((message) => (
          <li key={message.id}>
            <strong>{message.senderUsername}</strong>
            <span>{new Date(message.createdAt).toLocaleString()}</span>
            <p>{message.body}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="community-form community-form--compact">
        <label>
          Message
          <input
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message..."
            required
          />
        </label>
        <button type="submit" className="btn btn--primary">Send</button>
      </form>
    </section>
  );
}
