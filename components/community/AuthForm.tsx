'use client';

import { useActionState } from 'react';
import type { AuthActionState } from '@/lib/community/actions';

type ErrorMessages = {
  invalidCredentials: string;
  usernameTaken: string;
  usernameTooShort: string;
  passwordTooShort: string;
  serviceUnavailable: string;
};

type Props = {
  action: (prev: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  errors: ErrorMessages;
  submitLabel: string;
  children: React.ReactNode;
};

export function AuthForm({ action, errors, submitLabel, children }: Props) {
  const [state, formAction, pending] = useActionState(action, null);

  const errorMessage =
    state?.error === 'invalidCredentials'
      ? errors.invalidCredentials
      : state?.error === 'usernameTaken'
        ? errors.usernameTaken
        : state?.error === 'usernameTooShort'
          ? errors.usernameTooShort
          : state?.error === 'passwordTooShort'
            ? errors.passwordTooShort
            : state?.error === 'serviceUnavailable'
              ? errors.serviceUnavailable
              : null;

  return (
    <form action={formAction} className="community-form">
      {children}
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? '...' : submitLabel}
      </button>
      {errorMessage && <p className="community-form__error">{errorMessage}</p>}
    </form>
  );
}
