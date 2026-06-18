'use client';

import Link from 'next/link';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  registerLabel: string;
  loginLabel: string;
  closeLabel: string;
  registerHref: string;
  loginHref: string;
};

export function ChatGuestLimitModal({
  open,
  onClose,
  title,
  body,
  registerLabel,
  loginLabel,
  closeLabel,
  registerHref,
  loginHref,
}: Props) {
  if (!open) return null;

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-labelledby="chat-guest-limit-title">
      <div className="age-gate__card">
        <span className="age-gate__badge">✨</span>
        <h2 id="chat-guest-limit-title" className="age-gate__title">{title}</h2>
        <p className="age-gate__body">{body}</p>
        <div className="age-gate__actions">
          <Link href={registerHref} className="btn btn--primary">
            {registerLabel}
          </Link>
          <Link href={loginHref} className="btn btn--ghost">
            {loginLabel}
          </Link>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
