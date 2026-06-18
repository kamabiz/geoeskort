'use client';

import { useCallback, useEffect, useState } from 'react';
import { SOCKET_CONFIG, type ChatMessagePayload } from '@/lib/community/socket-config';

type Props = {
  roomId?: string;
  recipientId?: string;
  peerId?: string;
  title: string;
  labels?: { send: string; placeholder: string; loginRequired?: string };
};

export function ChatRoom({
  roomId = SOCKET_CONFIG.generalRoomId,
  recipientId,
  peerId,
  title,
  labels = { send: 'გაგზავნა', placeholder: 'დაწერეთ შეტყობინება...' },
}: Props) {
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);
  const [body, setBody] = useState('');
  const [since, setSince] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

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
    const text = body.trim();
    if (!text || sending) return;

    setError(null);
    setSending(true);

    try {
      const res = await fetch('/api/community/messages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: text,
          roomId: recipientId ? undefined : roomId,
          recipientId: recipientId || undefined,
        }),
      });

      const data = (await res.json()) as { message?: ChatMessagePayload; error?: string };

      if (!res.ok) {
        setError(
          data.error === 'Login required'
            ? labels.loginRequired || 'შედით ანგარიშში.'
            : data.error || 'შეტყობინება ვერ გაიგზავნა.',
        );
        return;
      }

      setBody('');
      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message!.id)) return prev;
          const next = [...prev, data.message!];
          return next.slice(-200);
        });
        setSince(data.message.createdAt);
      }
    } catch {
      setError('შეტყობინება ვერ გაიგზავნა.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="community-chat">
      <div className="community-chat__head">
        <h2>{title}</h2>
      </div>
      <ul className="community-chat__messages">
        {messages.length === 0 ? (
          <li className="community-chat__empty">შეტყობინებები ჯერ არ არის. დაიწყე საუბარი!</li>
        ) : (
          messages.map((message) => (
            <li key={message.id}>
              <strong>{message.senderUsername}</strong>
              <span>{new Date(message.createdAt).toLocaleString('ka-GE')}</span>
              <p>{message.body}</p>
            </li>
          ))
        )}
      </ul>
      <form onSubmit={handleSubmit} className="community-form community-form--compact community-form--chat">
        <label>
          <span className="visually-hidden">{labels.placeholder}</span>
          <input
            name="body"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (error) setError(null);
            }}
            placeholder={labels.placeholder}
            autoComplete="off"
            disabled={sending}
            required
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={sending || !body.trim()}>
          {labels.send}
        </button>
        {error && <p className="community-form__error">{error}</p>}
      </form>
    </section>
  );
}
