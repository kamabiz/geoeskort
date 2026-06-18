'use client';

import { useEffect } from 'react';
import type { Locale } from '@/lib/i18n/types';
import { htmlLang } from '@/lib/i18n/config';

export function SetHtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = htmlLang[locale];
  }, [locale]);
  return null;
}
