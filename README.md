# GEOESKORT (Next.js)

Static landing page + blog about nightlife and escort culture in Georgia.

**Not a profile catalog** — profiles live on [KAMA.BIZ](https://kama.biz).

## Stack

- **Next.js 15** (App Router, static generation)
- Blog posts from `blog-content/*.md` at build time
- SEO: metadata API, JSON-LD, `/sitemap.xml`, `/robots.txt`, canonical URLs

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export-ready production build
npm run start    # serve production build
```

## Add a blog post

1. Create `blog-content/my-post.md` (see `blog-content/README.md`)
2. Rebuild / refresh — posts are picked up automatically at build time

## SEO vs old Vite site

| Feature | Before (Vite) | Now (Next.js) |
|---------|---------------|---------------|
| Meta tags | Manual in HTML | `metadata` API per page |
| Blog posts | Client fetch JSON | **SSG** — full HTML in initial response |
| Sitemap | Static XML file | Dynamic `app/sitemap.ts` |
| Canonical URLs | Manual `<link>` | `alternates.canonical` |
| JSON-LD | Inline scripts | Server-rendered |
| Old catalog URLs | nginx redirects | `next.config.ts` redirects → kama.biz |

## Deploy

Deploy as a standard Next.js app (Vercel, Node, or `output: 'standalone'`). Old catalog paths redirect to KAMA.BIZ automatically.
