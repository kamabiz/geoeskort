# Blog posts (Georgian only)

Add posts via **Admin** (`/admin/`), **Publish API** (`POST /api/posts/publish/`), or legacy `.md` files.

## Storage format

Each post is one JSON file (`blog-content/{slug}.json`) with **flat Georgian fields**:

```json
{
  "slug": "georgian-food-guide",
  "category": "food",
  "status": "published",
  "publishedAt": "2026-06-18",
  "coverImage": "https://example.com/cover.jpg",
  "title": "ქართული სამზარეულო",
  "seoTitle": "ქართული სამზარეულო — სრული გზამკვლევი",
  "excerpt": "გზამკვლევი...",
  "content": "<h2>...</h2><p>...</p>",
  "tags": ["khinkali", "wine", "tbilisi"],
  "focusKeyword": "ქართული სამზარეულო"
}
```

**Legacy imports:** old files with `locales.ka` or `translations.ka` are migrated to Georgian on read. Other languages (`en`, `ru`, `tr`) are ignored. Legacy `.md` files are treated as Georgian.

## Categories

| Slug | Topics |
|------|--------|
| `nightlife` | Clubs, bars, rooftops, late-night spots |
| `food` | Khinkali, khachapuri, Georgian wine, chacha, restaurants |
| `travel` | Neighborhoods, transport, visas, money, safety, seasons |
| `culture` | Electronic music scene, folk music, festivals, art, history |
| `dating` | Dating culture, meeting people, apps, romance & etiquette |

## Publish API

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
  "title": "ქართული სამზარეულო",
  "excerpt": "გზამკვლევი...",
  "content": "<h2>...</h2><p>...</p>",
  "tags": ["khinkali", "wine", "tbilisi"]
}
```

`coverImage` (or alias `featuredImage`) must be an **absolute `https://` URL**.

**Update existing post:**

```json
{
  "slug": "georgian-food-guide",
  "update": true,
  "title": "განახლებული სათაური",
  "content": "<p>...</p>"
}
```

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
