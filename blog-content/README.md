# Blog posts

Add posts via **Admin** (`/admin/`), **Publish API** (`POST /api/posts/publish/`), or legacy `.md` files.

## Multilingual storage

Each post is one JSON file (`blog-content/{slug}.json`) with **separate content per locale** (`ka`, `en`, `ru`, `tr`). The same URL slug is shared; switching language loads that locale’s title, tags, excerpt, and HTML body.

Legacy `.md` files are treated as **Georgian (`ka`) only**.

## Categories

| Slug | Topics |
|------|--------|
| `nightlife` | Clubs, bars, rooftops, late-night spots |
| `food` | Khinkali, khachapuri, Georgian wine, chacha, restaurants |
| `travel` | Neighborhoods, transport, visas, money, safety, seasons |
| `culture` | Electronic music scene, folk music, festivals, art, history |

## Publish API (multilingual)

```http
POST /api/posts/publish/
Authorization: Bearer YOUR_BLOG_PUBLISH_API_KEY
Content-Type: application/json
```

```json
{
  "slug": "georgian-food-guide",
  "category": "food",
  "status": "published",
  "publishedAt": "2026-06-18",
  "coverImage": "https://example.com/cover.jpg",
  "translations": {
    "ka": {
      "title": "ქართული სამზარეულო",
      "excerpt": "გზამკვლევი...",
      "content": "<h2>...</h2><p>...</p>",
      "tags": ["khinkali", "wine", "tbilisi"]
    },
    "en": {
      "title": "Georgian Food Guide",
      "excerpt": "Insider guide...",
      "content": "<h2>...</h2><p>...</p>",
      "tags": ["food", "georgia", "tbilisi"]
    },
    "ru": {
      "title": "Гид по грузинской кухне",
      "excerpt": "...",
      "content": "<h2>...</h2><p>...</p>",
      "tags": ["еда", "тбилиси"]
    },
    "tr": {
      "title": "Gürcü Mutfağı Rehberi",
      "excerpt": "...",
      "content": "<h2>...</h2><p>...</p>",
      "tags": ["yemek", "tbilisi"]
    }
  }
}
```

`coverImage` (or alias `featuredImage`) must be an **absolute `https://` URL**. It is stored on the post and shown on blog cards; it is also prepended to each locale’s HTML body as a `<figure class="post-cover">`.

**Legacy single-locale body** (treated as `ka`):

```json
{
  "title": "Post title",
  "content": "<p>HTML content</p>",
  "tags": ["tbilisi"],
  "category": "travel"
}
```

**Update existing post** — merge new/updated translations:

```json
{
  "slug": "georgian-food-guide",
  "update": true,
  "translations": { "en": { "title": "...", "content": "..." } }
}
```

Response includes `availableLocales` (which language versions exist).

## Legacy markdown template

```markdown
# Blog Post: Your title

## Meta Information
- **Title:** Your post title
- **Slug:** your-post-slug
- **Category:** food
- **Excerpt:** Short description for listings
- **Date:** 2026-06-18
- **Tags:** tbilisi, khinkali, guide

---

## Content (HTML)

\`\`\`html
<h2>Heading</h2>
<p>Your content here. Link to <a href="https://kama.biz/tbilisi">KAMA.BIZ</a>.</p>
\`\`\`
```

If `Category` is omitted, it is inferred from title, tags, and content.
