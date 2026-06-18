'use client';

import { useState } from 'react';

export function PremiumCheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function checkout() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/community/stripe/checkout/', { method: 'POST' });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || 'Checkout unavailable');
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" className="btn btn--primary" onClick={checkout} disabled={loading}>
        {loading ? 'Redirecting…' : 'Subscribe with Stripe'}
      </button>
      {error && <p className="community-form__error">{error}</p>}
    </div>
  );
}
