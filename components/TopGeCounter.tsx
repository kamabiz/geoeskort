'use client';

import Script from 'next/script';
import { TOP_GE_SITE_ID } from '@/lib/site';

export function TopGeCounter() {
  return (
    <>
      <div
        id="top-ge-counter-container"
        className="footer-topge-counter"
        data-site-id={TOP_GE_SITE_ID}
      />
      <Script src="https://counter.top.ge/counter.js" strategy="lazyOnload" />
    </>
  );
}
