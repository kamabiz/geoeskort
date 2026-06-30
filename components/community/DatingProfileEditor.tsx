'use client';

import { useActionState } from 'react';
import type { DatingProfileView } from '@/lib/community/dating';
import type { DatingActionState } from '@/lib/community/dating-actions';
import {
  DATING_PRESET_CASES,
  type DatingPresetCase,
} from '@/lib/community/dating-presets';

type Messages = {
  save: string;
  presetCase: string;
  presetCaseHint: string;
  bio: string;
  bioPlaceholder: string;
  bioHint: string;
  isVisible: string;
  photosTitle: string;
  photosLead: string;
  photoUpload: string;
  photoUploadHint: string;
  photoRemove: string;
  presetLabels: Record<DatingPresetCase, string>;
  errors: Record<string, string>;
  successes: Record<string, string>;
};

type Props = {
  profile: DatingProfileView | null;
  upsertProfile: (prev: DatingActionState, formData: FormData) => Promise<DatingActionState>;
  addPhoto: (prev: DatingActionState, formData: FormData) => Promise<DatingActionState>;
  removePhoto: (prev: DatingActionState, formData: FormData) => Promise<DatingActionState>;
  messages: Messages;
};

function ActionForm({
  action,
  messages,
  submitLabel,
  encType,
  children,
  className,
}: {
  action: (prev: DatingActionState, formData: FormData) => Promise<DatingActionState>;
  messages: Messages;
  submitLabel: string;
  encType?: 'multipart/form-data';
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const errorMessage = state?.error ? messages.errors[state.error] : null;
  const successMessage = state?.success ? messages.successes[state.success] : null;

  return (
    <form
      action={formAction}
      encType={encType}
      className={['community-form community-form--compact', className].filter(Boolean).join(' ')}
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

export function DatingProfileEditor({
  profile,
  upsertProfile,
  addPhoto,
  removePhoto,
  messages,
}: Props) {
  const defaultPreset = profile?.presetCase ?? 'open_to_all';

  return (
    <div className="community-settings dating-editor">
      <section className="community-settings__section">
        <h2>{messages.photosTitle}</h2>
        <p className="community-settings__hint">{messages.photosLead}</p>
        {profile && profile.photos.length > 0 && (
          <div className="dating-editor__photos">
            {profile.photos.map((photo) => (
              <div key={photo.id} className="dating-editor__photo">
                <img src={photo.url} alt="" className="dating-editor__photo-img" loading="lazy" />
                <ActionForm
                  action={removePhoto}
                  messages={messages}
                  submitLabel={messages.photoRemove}
                  className="dating-editor__photo-remove-form"
                >
                  <input type="hidden" name="photoId" value={photo.id} />
                </ActionForm>
              </div>
            ))}
          </div>
        )}
        <ActionForm
          action={addPhoto}
          messages={messages}
          submitLabel={messages.photoUpload}
          encType="multipart/form-data"
        >
          <label>
            {messages.photoUpload}
            <input type="file" name="photoFile" accept="image/jpeg,image/png,image/webp,image/gif" />
          </label>
          <p className="community-settings__hint">{messages.photoUploadHint}</p>
        </ActionForm>
      </section>

      <section className="community-settings__section">
        <ActionForm action={upsertProfile} messages={messages} submitLabel={messages.save}>
          <label>
            {messages.presetCase}
            <select name="presetCase" defaultValue={defaultPreset}>
              {DATING_PRESET_CASES.map((preset) => (
                <option key={preset} value={preset}>
                  {messages.presetLabels[preset]}
                </option>
              ))}
            </select>
          </label>
          <p className="community-settings__hint">{messages.presetCaseHint}</p>
          <label>
            {messages.bio}
            <textarea
              name="bio"
              rows={4}
              maxLength={300}
              defaultValue={profile?.bio ?? ''}
              placeholder={messages.bioPlaceholder}
            />
          </label>
          <p className="community-settings__hint">{messages.bioHint}</p>
          <label className="community-form__checkbox">
            <input
              type="checkbox"
              name="isVisible"
              defaultChecked={profile?.isVisible ?? true}
            />
            {messages.isVisible}
          </label>
        </ActionForm>
      </section>
    </div>
  );
}
