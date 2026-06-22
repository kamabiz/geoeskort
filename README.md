# GEOESKORT (Next.js)

Static landing page + blog about nightlife and escort culture in Georgia.

**Not a profile catalog** — profiles live on [INTIMGRAM](https://intimgram.com).

## Stack

- **Next.js 15** (App Router, static generation)
- Blog posts from `blog-content/*.md` at build time
- SEO: metadata API, JSON-LD, `/sitemap.xml`, `/robots.txt`, canonical URLs

## Commands

```bash
npm install
npm run dev      # http://localhost:3002
npm run build    # production build
npm run start    # serve production build (port 3002)
npm run clean    # clear .next cache
```

## Blog publishing — local vs Vercel production

### Local development (works out of the box)

Posts are saved as markdown files in `blog-content/*.md`. This applies to:

- **Admin panel** — `/admin/` (login required)
- **REST API** — `POST /api/posts/publish/` (API key required)

No extra setup needed locally. After creating or editing a post, it appears on the site immediately (with ISR revalidation).

### Vercel production — action required later

**Vercel’s filesystem is read-only.** Without Blob storage, admin and API publishes will **not persist** on production — they only work locally.

When you’re ready to enable live publishing on **geoeskort.com**, follow these steps:

#### 1. Create Vercel Blob storage

1. Open [Vercel Dashboard](https://vercel.com) → your **geoeskort** project
2. Go to **Storage** → **Blob** → **Create Database**
3. Name it (e.g. `geoeskort-posts`) → **Create**
4. **Connect to project** → select the geoeskort project → connect

Vercel will automatically add `BLOB_READ_WRITE_TOKEN` to the project env vars.

#### 2. Confirm environment variables

In **Project → Settings → Environment Variables**, ensure these exist for **Production** (and Preview if you test there):

| Variable | Purpose |
|----------|---------|
| `BLOB_READ_WRITE_TOKEN` | Auto-added when Blob is connected — **required for posts on Vercel** |
| `ADMIN_USERNAME` | Admin panel login |
| `ADMIN_PASSWORD` | Admin panel login |
| `ADMIN_SECRET` | Session signing (random 32+ char string) |
| `BLOG_PUBLISH_API_KEY` | REST API key for `POST /api/posts/publish/` |

Copy values from your local `.env.local` (except generate fresh secrets for production if preferred).

#### 3. Redeploy

After Blob is connected and env vars are set:

- **Deployments** → latest deployment → **Redeploy**, or
- Push any commit to `main` (Vercel auto-deploys)

#### 4. Verify

1. Log in at `https://geoeskort.com/admin/`
2. Create a test post → **Publish**
3. Confirm it appears on `https://geoeskort.com/blog/`
4. Optional: `GET https://geoeskort.com/api/posts/publish-test/` → `{ "status": "ok" }`

#### How storage is chosen (automatic)

The app checks for `BLOB_READ_WRITE_TOKEN`:

- **Set** → posts read/write via **Vercel Blob** (production)
- **Not set** → posts read/write to **`blog-content/`** on disk (local dev only)

You do not need to change any code — only add Blob + env var on Vercel.

#### Existing posts in git

Markdown files already in `blog-content/` are still used at **build time** for static generation. Once Blob is enabled, **new posts** from admin/API go to Blob. To migrate old git-based posts into Blob later, ask for assistance or re-publish them via admin/API.

---

## Add a blog post (manual)

1. Create `blog-content/my-post.md` (see `blog-content/README.md`)
2. Rebuild / refresh — posts are picked up automatically at build time

Or use **Admin** (`/admin/`) or **REST API** (`POST /api/posts/publish/`) — see `.env.example` for API key setup.

## SEO vs old Vite site

| Feature | Before (Vite) | Now (Next.js) |
|---------|---------------|---------------|
| Meta tags | Manual in HTML | `metadata` API per page |
| Blog posts | Client fetch JSON | **SSG** — full HTML in initial response |
| Sitemap | Static XML file | Dynamic `app/sitemap.ts` |
| Canonical URLs | Manual `<link>` | `alternates.canonical` |
| JSON-LD | Inline scripts | Server-rendered |
| Old catalog URLs | nginx redirects | `next.config.ts` redirects → intimgram.com |

## Deploy

Deploy as a standard Next.js app (Vercel, Node, or `output: 'standalone'`). Old catalog paths redirect to INTIMGRAM automatically.

---

## Community — Premium (archived)

Premium tier is **disabled by default** (`PREMIUM_ENABLED=false`). The app is fully free; points accumulation and gifting remain active.

| Resource | Location |
|----------|----------|
| Full spec & reactivation checklist | [`docs/PREMIUM-ARCHIVED.md`](docs/PREMIUM-ARCHIVED.md) |
| Admin reference (browser) | `/admin/premium/` (login required) |
| Feature flag | `PREMIUM_ENABLED=true` in env + Stripe keys |

To reactivate Premium later: set `PREMIUM_ENABLED=true`, configure Stripe env vars, redeploy. No database migration needed — `isPremium` fields remain in schema.

