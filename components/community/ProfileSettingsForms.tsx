'use client';

import { useActionState } from 'react';
import { CommunityAvatar } from '@/components/community/CommunityAvatar';
import type { SettingsActionState } from '@/lib/community/profile-actions';
import type { AvatarGender } from '@/lib/community/avatar';

type Messages = {
  save: string;
  username: string;
  email: string;
  emailOptional: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  avatarTitle: string;
  avatarUpload: string;
  avatarUploadHint: string;
  gender: string;
  genderFemale: string;
  genderMale: string;
  genderNonBinary: string;
  errors: Record<string, string>;
  successes: Record<string, string>;
};

type Props = {
  username: string;
  email: string | null;
  avatar: string | null;
  gender: AvatarGender | null;
  updateUsername: (prev: SettingsActionState, formData: FormData) => Promise<SettingsActionState>;
  updateEmail: (prev: SettingsActionState, formData: FormData) => Promise<SettingsActionState>;
  updatePassword: (prev: SettingsActionState, formData: FormData) => Promise<SettingsActionState>;
  updateAvatar: (prev: SettingsActionState, formData: FormData) => Promise<SettingsActionState>;
  messages: Messages;
};

function SettingsForm({
  action,
  messages,
  submitLabel,
  encType,
  children,
}: {
  action: (prev: SettingsActionState, formData: FormData) => Promise<SettingsActionState>;
  messages: Messages;
  submitLabel: string;
  encType?: 'multipart/form-data';
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const errorMessage = state?.error ? messages.errors[state.error] : null;
  const successMessage = state?.success ? messages.successes[state.success] : null;

  return (
    <form
      action={formAction}
      encType={encType}
      className="community-form community-form--compact"
    >
      {children}
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? '...' : submitLabel}
      </button>
      {errorMessage && <p className="community-form__error">{errorMessage}</p>}
      {successMessage && <p className="community-form__success">{successMessage}</p>}
    </form>
  );
}

export function ProfileSettingsForms({
  username,
  email,
  avatar,
  gender,
  updateUsername,
  updateEmail,
  updatePassword,
  updateAvatar,
  messages,
}: Props) {
  return (
    <div className="community-settings">
      <section className="community-settings__section">
        <h2>{messages.avatarTitle}</h2>
        <div className="community-settings__avatar-preview">
          <CommunityAvatar username={username} avatar={avatar} size="lg" />
          <p className="community-settings__hint">@{username}</p>
        </div>
        <SettingsForm
          action={updateAvatar}
          messages={messages}
          submitLabel={messages.save}
          encType="multipart/form-data"
        >
          <label>
            {messages.gender}
            <select name="gender" defaultValue={gender ?? 'nonBinary'}>
              <option value="female">{messages.genderFemale}</option>
              <option value="male">{messages.genderMale}</option>
              <option value="nonBinary">{messages.genderNonBinary}</option>
            </select>
          </label>
          <label>
            {messages.avatarUpload}
            <input name="avatarFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
          </label>
          <p className="community-settings__hint">{messages.avatarUploadHint}</p>
        </SettingsForm>
      </section>

      <section className="community-settings__section">
        <h2>{messages.username}</h2>
        <SettingsForm action={updateUsername} messages={messages} submitLabel={messages.save}>
          <label>
            {messages.username}
            <input
              name="username"
              required
              minLength={3}
              maxLength={24}
              defaultValue={username}
              autoComplete="username"
              pattern="[a-zA-Z0-9_]{3,24}"
            />
          </label>
        </SettingsForm>
      </section>

      <section className="community-settings__section">
        <h2>{messages.email}</h2>
        <SettingsForm action={updateEmail} messages={messages} submitLabel={messages.save}>
          <label>
            {messages.emailOptional}
            <input name="email" type="email" defaultValue={email ?? ''} autoComplete="email" />
          </label>
        </SettingsForm>
      </section>

      <section className="community-settings__section">
        <h2>{messages.newPassword}</h2>
        <SettingsForm action={updatePassword} messages={messages} submitLabel={messages.save}>
          <label>
            {messages.currentPassword}
            <input name="currentPassword" type="password" required autoComplete="current-password" />
          </label>
          <label>
            {messages.newPassword}
            <input name="newPassword" type="password" required minLength={6} autoComplete="new-password" />
          </label>
          <label>
            {messages.confirmPassword}
            <input name="confirmPassword" type="password" required minLength={6} autoComplete="new-password" />
          </label>
        </SettingsForm>
      </section>
    </div>
  );
}
