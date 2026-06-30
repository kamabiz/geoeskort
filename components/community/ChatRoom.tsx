'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChatGuestLimitModal } from '@/components/community/ChatGuestLimitModal';
import { SOCKET_CONFIG, type ChatMessagePayload } from '@/lib/community/socket-config';

type GuestLabels = {
  limitTitle: string;
  limitBody: string;
  register: string;
  login: string;
  close: string;
  banner: string;
  bannerUsed: string;
};

type Props = {
  roomId?: string;
  recipientId?: string;
  peerId?: string;
  title: string;
  currentUserId?: string;
  labels?: { send: string; placeholder: string; loginRequired?: string };
  guestMode?: boolean;
  guestLabels?: GuestLabels;
  registerHref?: string;
  loginHref?: string;
  tabs?: React.ReactNode;
};

type GuestStatus = {
  messagesRemaining: number;
  limit: number;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) return 'დღეს';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  if (isYesterday) return 'გუშინ';
  return d.toLocaleDateString('ka-GE', { day: 'numeric', month: 'long' });
}

function getDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function ChatRoom({
  roomId = SOCKET_CONFIG.generalRoomId,
  recipientId,
  peerId,
  title,
  currentUserId,
  labels = { send: 'გაგზავნა', placeholder: 'დაწერეთ შეტყობინება...' },
  guestMode = false,
  guestLabels,
  registerHref = '/register/',
  loginHref = '/login/',
  tabs,
}: Props) {
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);
  const [body, setBody] = useState('');
  const [since, setSince] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [guestStatus, setGuestStatus] = useState<GuestStatus | null>(null);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);

  const messagesContainerRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const MAX_CHARS = 280;

  const guestLimitReached =
    guestMode && guestStatus !== null && guestStatus.messagesRemaining <= 0;

  const scrollToBottom = useCallback((smooth = true) => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    }
    setNewCount(0);
    setIsAtBottom(true);
  }, []);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 80;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setIsAtBottom(atBottom);
    if (atBottom) setNewCount(0);
  }, []);

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
      const newMsgs = data.messages.filter((m) => !seenIdsRef.current.has(m.id));
      newMsgs.forEach((m) => seenIdsRef.current.add(m.id));

      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const merged = [...prev, ...data.messages.filter((m) => !ids.has(m.id))];
        return merged.slice(-200);
      });
      setSince(data.messages[data.messages.length - 1]?.createdAt ?? since);

      if (newMsgs.length > 0) {
        setIsAtBottom((atBottom) => {
          if (!atBottom) {
            setNewCount((c) => c + newMsgs.length);
          }
          return atBottom;
        });
      }
    }
  }, [roomId, recipientId, peerId, since]);

  useEffect(() => {
    fetchMessages();
    const id = window.setInterval(fetchMessages, SOCKET_CONFIG.pollingIntervalMs);
    return () => window.clearInterval(id);
  }, [fetchMessages]);

  // Scroll to bottom when new messages arrive while user is at bottom
  useEffect(() => {
    if (isAtBottom) {
      const el = messagesContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages, isAtBottom]);

  // Initial scroll
  useEffect(() => {
    setTimeout(() => scrollToBottom(false), 100);
  }, [scrollToBottom]);

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
        seenIdsRef.current.add(data.message.id);
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message!.id)) return prev;
          const next = [...prev, data.message!];
          return next.slice(-200);
        });
        setSince(data.message.createdAt);
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch {
      setError('შეტყობინება ვერ გაიგზავნა.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  // Group messages by date
  const groupedMessages: Array<{ dateKey: string; label: string; messages: ChatMessagePayload[] }> = [];
  for (const msg of messages) {
    const key = getDateKey(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.dateKey === key) {
      last.messages.push(msg);
    } else {
      groupedMessages.push({ dateKey: key, label: formatDateLabel(msg.createdAt), messages: [msg] });
    }
  }

  const guestRemaining = guestStatus?.messagesRemaining ?? null;
  const showGuestBanner = guestMode && guestLabels;

  return (
    <>
      <div className="chat-room">
        {/* Header */}
        <div className="chat-room__header">
          {tabs ? (
            <h1 className="visually-hidden">{title}</h1>
          ) : (
            <div className="chat-room__header-inner">
              <div className="chat-room__title-wrap">
                <span className="chat-room__title-icon">💬</span>
                <h1 className="chat-room__title">{title}</h1>
              </div>
            </div>
          )}
          {tabs}
        </div>

        {/* Guest banner */}
        {showGuestBanner && (
          <div className={`chat-room__guest-banner${guestLimitReached ? ' chat-room__guest-banner--limit' : ''}`}>
            <span className="chat-room__guest-banner-text">
              {guestLimitReached ? guestLabels!.bannerUsed : guestLabels!.banner}
            </span>
            <div className="chat-room__guest-banner-actions">
              <Link href={registerHref} className="chat-room__guest-cta chat-room__guest-cta--primary">
                {guestLabels!.register}
              </Link>
              <Link href={loginHref} className="chat-room__guest-cta">
                {guestLabels!.login}
              </Link>
            </div>
          </div>
        )}

        {/* Messages */}
        <ul
          className="chat-room__messages"
          ref={messagesContainerRef}
          onScroll={handleScroll}
          aria-live="polite"
          aria-label={title}
        >
          {messages.length === 0 ? (
            <li className="chat-room__empty">
              <span className="chat-room__empty-emoji">👋</span>
              <p>პირველი შეტყობინება შენია! დაიწყე საუბარი.</p>
            </li>
          ) : (
            groupedMessages.map((group) => (
              <li key={group.dateKey} className="chat-room__day-group">
                <div className="chat-room__date-divider">
                  <span>{group.label}</span>
                </div>
                <ul className="chat-room__day-messages">
                  {group.messages.map((msg, idx) => {
                    const isMine = !!currentUserId && msg.senderId === currentUserId;
                    const prevMsg = group.messages[idx - 1];
                    const isFirstFromSender = !prevMsg || prevMsg.senderId !== msg.senderId;
                    return (
                      <li
                        key={msg.id}
                        className={`chat-bubble ${isMine ? 'chat-bubble--mine' : 'chat-bubble--theirs'} ${isFirstFromSender ? 'chat-bubble--first' : ''}`}
                      >
                        {!isMine && isFirstFromSender && (
                          <span className="chat-bubble__sender">{msg.senderUsername}</span>
                        )}
                        <div className="chat-bubble__row">
                          <div className="chat-bubble__body">
                            {msg.body}
                          </div>
                          <span className="chat-bubble__time">{formatTime(msg.createdAt)}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>

        {/* Scroll-to-bottom button */}
        {!isAtBottom && (
          <button
            type="button"
            className="chat-room__scroll-btn"
            onClick={() => scrollToBottom(true)}
            aria-label="ბოლოში გადასვლა"
          >
            {newCount > 0 && <span className="chat-room__scroll-badge">{newCount}</span>}
            ↓
          </button>
        )}

        {/* Input */}
        <div className="chat-room__input-bar">
          {error && <p className="chat-room__error" role="alert">{error}</p>}
          <form onSubmit={handleSubmit} className="chat-room__form">
            <label className="visually-hidden" htmlFor="chat-input">{labels.placeholder}</label>
            <input
              id="chat-input"
              ref={inputRef}
              name="body"
              value={body}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setBody(e.target.value);
                  if (error) setError(null);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={guestLimitReached ? (guestLabels?.bannerUsed ?? labels.placeholder) : labels.placeholder}
              autoComplete="off"
              disabled={sending}
              readOnly={guestLimitReached}
              onClick={guestLimitReached ? openGuestLimitModal : undefined}
              className="chat-room__input"
              maxLength={MAX_CHARS}
            />
            <div className="chat-room__input-right">
              {body.length > MAX_CHARS * 0.75 && (
                <span className={`chat-room__char-count${body.length >= MAX_CHARS ? ' chat-room__char-count--limit' : ''}`}>
                  {MAX_CHARS - body.length}
                </span>
              )}
              <button
                type="submit"
                className="chat-room__send-btn"
                disabled={sending || !body.trim() || guestLimitReached}
                aria-label={labels.send}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

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
