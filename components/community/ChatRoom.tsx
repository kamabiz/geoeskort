'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChatGuestLimitModal } from '@/components/community/ChatGuestLimitModal';
import { SOCKET_CONFIG, type ChatMessagePayload } from '@/lib/community/socket-config';

type GuestLabels = {
  limitTitle: string;
  limitBody: string;
  register: string;
  login: string;
  close: string;
};

type Props = {
  roomId?: string;
  recipientId?: string;
  peerId?: string;
  title: string;
  labels?: { send: string; placeholder: string; loginRequired?: string };
  guestMode?: boolean;
  guestLabels?: GuestLabels;
  registerHref?: string;
  loginHref?: string;
};

type GuestStatus = {
  messagesRemaining: number;
  limit: number;
};

export function ChatRoom({
  roomId = SOCKET_CONFIG.generalRoomId,
  recipientId,
  peerId,
  title,
  labels = { send: 'გაგზავნა', placeholder: 'დაწერეთ შეტყობინება...' },
  guestMode = false,
  guestLabels,
  registerHref = '/register/',
  loginHref = '/login/',
}: Props) {
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);
  const [body, setBody] = useState('');
  const [since, setSince] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [guestStatus, setGuestStatus] = useState<GuestStatus | null>(null);
  const [guestModalOpen, setGuestModalOpen] = useState(false);

  const guestLimitReached =
    guestMode && guestStatus !== null && guestStatus.messagesRemaining <= 0;

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
    const data = (await res.json()) as {
      messages: ChatMessagePayload[];
      guestStatus?: GuestStatus | null;
    };
    if (data.guestStatus) {
      setGuestStatus(data.guestStatus);
    }
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

  function openGuestLimitModal() {
    if (!guestLabels) return;
    setGuestModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;

    if (guestLimitReached) {
      openGuestLimitModal();
      return;
    }

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

      const data = (await res.json()) as {
        message?: ChatMessagePayload;
        error?: string;
        code?: string;
        guestStatus?: GuestStatus;
      };

      if (!res.ok) {
        if (data.code === 'GUEST_LIMIT' || data.error === 'Guest limit reached') {
          setGuestStatus({ messagesRemaining: 0, limit: 1 });
          openGuestLimitModal();
          return;
        }
        setError(
          data.error === 'Login required'
            ? labels.loginRequired || 'შედით ანგარიშში.'
            : data.error || 'შეტყობინება ვერ გაიგზავნა.',
        );
        return;
      }

      setBody('');
      if (data.guestStatus) {
        setGuestStatus(data.guestStatus);
      }
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
    <>
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

      {guestLabels && (
        <ChatGuestLimitModal
          open={guestModalOpen}
          onClose={() => setGuestModalOpen(false)}
          title={guestLabels.limitTitle}
          body={guestLabels.limitBody}
          registerLabel={guestLabels.register}
          loginLabel={guestLabels.login}
          closeLabel={guestLabels.close}
          registerHref={registerHref}
          loginHref={loginHref}
        />
      )}
    </>
  );
}
