import Link from 'next/link';
import { requireAuth } from '@/lib/auth';

export default async function AdminPremiumReferencePage() {
  await requireAuth();

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header__brand">
          <Link href="/admin/">GEO<span>ESKORT</span> Admin</Link>
        </div>
        <nav className="admin-header__nav">
          <Link href="/admin/" className="admin-btn admin-btn--ghost">
            ← Dashboard
          </Link>
          <Link href="/" className="admin-btn admin-btn--ghost" target="_blank">
            View site ↗
          </Link>
        </nav>
      </header>

      <main className="admin-main">
        <div className="admin-dashboard__head">
          <h1>Premium reference (archived)</h1>
          <p className="admin-muted">
            Full spec: <code>docs/PREMIUM-ARCHIVED.md</code> in repo. Premium is currently{' '}
            <strong>disabled</strong> — app is fully free.
          </p>
        </div>

        <div className="admin-alert admin-alert--info">
          <strong>Reactivate:</strong> set <code>PREMIUM_ENABLED=true</code> in env + configure Stripe keys, then redeploy.
        </div>

        <section className="admin-premium-ref">
          <h2>Pricing</h2>
          <ul>
            <li><strong>500 points / 30 days</strong> (points redeem)</li>
            <li>Stripe subscription via <code>STRIPE_PRICE_ID</code></li>
          </ul>

          <h2>Premium perks</h2>
          <ul>
            <li>All articles &amp; restricted stories</li>
            <li>LIVE chat &amp; private messages</li>
            <li>Verification &amp; profile photo</li>
            <li>Gift points to other members</li>
            <li>Extra photo uploads</li>
            <li>Ad-free + Premium badge</li>
          </ul>

          <h2>Gated when enabled</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Premium posts</td><td><code>lib/community/premium.ts</code></td></tr>
              <tr><td>Category restricted-stories</td><td><code>lib/community/categories.ts</code></td></tr>
              <tr><td>LIVE chat</td><td><code>app/[locale]/chat/page.tsx</code></td></tr>
              <tr><td>Private messages</td><td><code>app/[locale]/messages/page.tsx</code></td></tr>
              <tr><td>Stripe checkout</td><td><code>app/api/community/stripe/checkout/route.ts</code></td></tr>
              <tr><td>Points redeem</td><td><code>lib/community/actions.ts</code></td></tr>
            </tbody>
          </table>

          <h2>Env vars</h2>
          <pre className="admin-code-block">{`PREMIUM_ENABLED=true
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...`}</pre>

          <h2>Points (always active)</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Action</th><th>Points</th></tr>
            </thead>
            <tbody>
              <tr><td>Story published</td><td>+50</td></tr>
              <tr><td>Story reported</td><td>+10</td></tr>
              <tr><td>Comment received</td><td>+2</td></tr>
              <tr><td>Post upvoted</td><td>+1</td></tr>
              <tr><td>Comment upvoted</td><td>+1</td></tr>
              <tr><td>Premium redeem (when enabled)</td><td>−500</td></tr>
            </tbody>
          </table>

          <h2>Reactivation checklist</h2>
          <ol>
            <li>Set <code>PREMIUM_ENABLED=true</code></li>
            <li>Configure Stripe env vars</li>
            <li>Webhook: <code>/api/community/stripe/webhook/</code></li>
            <li>Redeploy</li>
            <li>Test checkout, points redeem, content locks, chat/DM gates</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
