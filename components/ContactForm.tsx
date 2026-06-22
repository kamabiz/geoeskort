'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContactForm, type ContactActionState } from '@/lib/contact/actions';
import type { Dictionary } from '@/lib/i18n/types';

type Props = {
  dict: Dictionary['contact'];
  defaultName?: string;
  defaultEmail?: string;
};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--primary contact-form__submit" disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export function ContactForm({ dict, defaultName = '', defaultEmail = '' }: Props) {
  const [state, formAction] = useActionState<ContactActionState, FormData>(submitContactForm, null);

  if (state?.ok) {
    return (
      <div className="contact-form contact-form--success" role="status">
        <span className="contact-form__success-icon" aria-hidden>✓</span>
        <h2>{dict.form.successTitle}</h2>
        <p>{dict.form.successBody}</p>
      </div>
    );
  }

  const errorMessage =
    state?.ok === false
      ? state.error === 'validation'
        ? dict.form.errorValidation
        : dict.form.errorService
      : null;

  return (
    <form action={formAction} className="contact-form community-form">
      <div className="contact-form__grid">
        <label>
          {dict.form.name}
          <input type="text" name="name" required minLength={2} maxLength={120} defaultValue={defaultName} placeholder={dict.form.namePlaceholder} autoComplete="name" />
        </label>
        <label>
          {dict.form.email}
          <input type="email" name="email" required maxLength={254} defaultValue={defaultEmail} placeholder={dict.form.emailPlaceholder} autoComplete="email" />
        </label>
      </div>
      <label>
        {dict.form.subject}
        <input type="text" name="subject" required minLength={3} maxLength={200} placeholder={dict.form.subjectPlaceholder} />
      </label>
      <label>
        {dict.form.message}
        <textarea name="message" required minLength={10} maxLength={5000} rows={6} placeholder={dict.form.messagePlaceholder} />
      </label>
      <div className="community-form__actions">
        <SubmitButton label={dict.form.submit} pendingLabel={dict.form.sending} />
      </div>
      {errorMessage && <p className="community-form__error">{errorMessage}</p>}
    </form>
  );
}
