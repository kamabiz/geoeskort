'use client';

import { useState } from 'react';
import { getCompatibility, getZodiacSigns, compatibilityLabel } from '@/lib/community/zodiac';
import type { CommunityDict } from '@/lib/i18n/community-dict';

type Props = {
  dict: CommunityDict['zodiac'];
};

export function ZodiacTool({ dict }: Props) {
  const signs = getZodiacSigns();
  const [sign1, setSign1] = useState(signs[0]);
  const [sign2, setSign2] = useState(signs[1]);
  const [score, setScore] = useState<number | null>(null);

  function check() {
    setScore(getCompatibility(sign1, sign2));
  }

  return (
    <div className="zodiac-tool">
      <label>
        {dict.sign1}
        <select value={sign1} onChange={(e) => setSign1(e.target.value)}>
          {signs.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label>
        {dict.sign2}
        <select value={sign2} onChange={(e) => setSign2(e.target.value)}>
          {signs.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <button type="button" className="btn btn--primary" onClick={check}>{dict.check}</button>
      {score !== null && (
        <div className="zodiac-tool__result">
          <strong>{dict.result}: {score}%</strong>
          <p>{compatibilityLabel(score)}</p>
        </div>
      )}
    </div>
  );
}
