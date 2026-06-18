'use client';

import { useEffect, useState } from 'react';
import type { CommunityDict } from '@/lib/i18n/community-dict';

const STORAGE_KEY = 'geoeskort_age_verified';

type Props = {
  dict: CommunityDict['ageGate'];
};

export function AgeGate({ dict }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem(STORAGE_KEY);
    if (!verified) setVisible(true);
  }, []);

  function confirm() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  function deny() {
    window.location.href = 'https://www.google.com';
  }

  if (!visible) return null;

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className="age-gate__card">
        <span className="age-gate__badge">18+</span>
        <h2 id="age-gate-title" className="age-gate__title">{dict.title}</h2>
        <p className="age-gate__body">{dict.body}</p>
        <div className="age-gate__actions">
          <button type="button" className="btn btn--primary" onClick={confirm}>
            {dict.confirm}
          </button>
          <button type="button" className="btn btn--ghost" onClick={deny}>
            {dict.deny}
          </button>
        </div>
      </div>
    </div>
  );
}
