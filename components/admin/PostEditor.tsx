'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminPostForm } from '@/lib/admin-blog';
import type { BlogCategorySlug } from '@/lib/blog-categories';
import { BLOG_CATEGORIES, BLOG_CATEGORY_SLUGS } from '@/lib/blog-categories';
import type { SeoAnalysis } from '@/lib/seo-analyze';
import {
  analyzeSeo,
  extractExcerptFromContent,
  slugify,
  suggestTags,
} from '@/lib/seo-analyze';

type Props = {
  mode: 'create' | 'edit';
  initial?: AdminPostForm;
  originalSlug?: string;
};

const INTIMGRAM_SNIPPETS = [
  { label: 'INTIMGRAM main', html: '<a href="https://intimgram.com" rel="noopener">INTIMGRAM</a>' },
  { label: 'Tbilisi', html: '<a href="https://intimgram.com/tbilisi" rel="noopener">ესკორტი თბილისი</a>' },
  { label: 'Batumi', html: '<a href="https://intimgram.com/batumi" rel="noopener">ესკორტი ბათუმი</a>' },
  { label: 'Girls', html: '<a href="https://intimgram.com/girls" rel="noopener">ესკორტ გოგონები</a>' },
];

const QUICK_TAGS = ['tbilisi', 'batumi', 'georgia', 'guide', 'wine', 'khinkali', 'festival'];

function emptyPost(): AdminPostForm {
  return {
    slug: '',
    title: '',
    seoTitle: '',
    excerpt: '',
    category: 'travel',
    tags: [],
    focusKeyword: '',
    publishedAt: new Date().toISOString().slice(0, 10),
    status: 'published',
    content: '<h2>შესავალი</h2>\n<p>დაიწყეთ თქვენი სტატია აქ…</p>',
  };
}

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--admin-green)';
  if (score >= 50) return 'var(--admin-gold)';
  return 'var(--admin-red)';
}

export function PostEditor({ mode, initial, originalSlug }: Props) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const slugTouched = useRef(false);

  const [form, setForm] = useState<AdminPostForm>(initial || emptyPost());
  const [analysis, setAnalysis] = useState<SeoAnalysis>(() => analyzeSeo(initial || emptyPost()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [tagInput, setTagInput] = useState('');

  const tagSuggestions = useMemo(
    () => suggestTags(form.title, form.content, form.tags),
    [form.title, form.content, form.tags],
  );

  const update = useCallback((patch: Partial<AdminPostForm>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (patch.title && !slugTouched.current && mode === 'create') {
        next.slug = slugify(patch.title);
      }
      return next;
    });
  }, [mode]);

  useEffect(() => {
    const t = setTimeout(() => setAnalysis(analyzeSeo(form)), 300);
    return () => clearTimeout(t);
  }, [form]);

  function insertHtml(snippet: string) {
    const el = contentRef.current;
    if (!el) {
      update({ content: form.content + '\n' + snippet });
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = form.content.slice(0, start);
    const after = form.content.slice(end);
    update({ content: before + snippet + after });
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + snippet.length;
    }, 0);
  }

  function wrapSelection(tag: string) {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = form.content.slice(start, end) || 'ტექსტი';
    const wrapped = `<${tag}>${selected}</${tag}>`;
    const before = form.content.slice(0, start);
    const after = form.content.slice(end);
    update({ content: before + wrapped + after });
  }

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase();
    if (!t || form.tags.includes(t)) return;
    update({ tags: [...form.tags, t] });
    setTagInput('');
  }

  function removeTag(tag: string) {
    update({ tags: form.tags.filter((t) => t !== tag) });
  }

  async function handleSave() {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const url =
        mode === 'create'
          ? '/api/admin/posts/'
          : `/api/admin/posts/${encodeURIComponent(originalSlug || form.slug)}/`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSuccess(mode === 'create' ? 'Published! Redirecting…' : 'Saved successfully!');
      setTimeout(() => {
        router.push('/admin/');
        router.refresh();
      }, 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!originalSlug || !confirm('Delete this post permanently?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/posts/${encodeURIComponent(originalSlug)}/`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      router.push('/admin/');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
      setSaving(false);
    }
  }

  function autoExcerpt() {
    update({ excerpt: extractExcerptFromContent(form.content) });
  }

  return (
    <div className="admin-editor">
      <header className="admin-editor__top">
        <div>
          <h1>{mode === 'create' ? 'New blog post' : 'Edit post'}</h1>
          <p className="admin-muted">Write SEO-optimized Georgian blog content with live scoring</p>
        </div>
        <div className="admin-editor__actions">
          {mode === 'edit' && (
            <button type="button" className="admin-btn admin-btn--danger" onClick={handleDelete} disabled={saving}>
              Delete
            </button>
          )}
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => router.push('/admin/')}>
            Cancel
          </button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : mode === 'create' ? 'Publish' : 'Save changes'}
          </button>
        </div>
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <div className="admin-editor__grid">
        <div className="admin-editor__main">
          <section className="admin-card">
            <h2>Content</h2>
            <label className="admin-field">
              <span>Title (H1)</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="ესკორტები თბილისში — სრული გზამკვლევი 2026"
              />
              <small className={analysis.titleLength > 60 ? 'admin-hint admin-hint--warn' : 'admin-hint'}>
                {form.title.length} chars · ideal 30–60
              </small>
            </label>

            <label className="admin-field">
              <span>SEO title <em>(optional — Google tab title)</em></span>
              <input
                type="text"
                value={form.seoTitle || ''}
                onChange={(e) => update({ seoTitle: e.target.value })}
                placeholder={form.title || 'Same as title if empty'}
              />
            </label>

            <label className="admin-field">
              <span>Category</span>
              <select
                value={form.category}
                onChange={(e) => update({ category: e.target.value as BlogCategorySlug })}
              >
                {BLOG_CATEGORY_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>
                    {BLOG_CATEGORIES[slug].emoji} {BLOG_CATEGORIES[slug].label} — {BLOG_CATEGORIES[slug].description}
                  </option>
                ))}
              </select>
            </label>

            <div className="admin-field-row">
              <label className="admin-field">
                <span>URL slug</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    slugTouched.current = true;
                    update({ slug: e.target.value });
                  }}
                  placeholder="eskortebi-tbilisi-guide"
                />
              </label>
              <label className="admin-field">
                <span>Publish date</span>
                <input
                  type="date"
                  value={form.publishedAt}
                  onChange={(e) => update({ publishedAt: e.target.value })}
                />
              </label>
            </div>

            <label className="admin-field">
              <span>Focus keyword</span>
              <input
                type="text"
                value={form.focusKeyword || ''}
                onChange={(e) => update({ focusKeyword: e.target.value })}
                placeholder="eskortebi tbilisi"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label-row">
                Meta description
                <button type="button" className="admin-link-btn" onClick={autoExcerpt}>
                  Auto-generate from content
                </button>
              </span>
              <textarea
                value={form.excerpt}
                onChange={(e) => update({ excerpt: e.target.value })}
                rows={3}
                placeholder="120–160 character summary for Google search results…"
              />
              <small className={
                analysis.excerptLength >= 120 && analysis.excerptLength <= 160
                  ? 'admin-hint admin-hint--ok'
                  : analysis.excerptLength > 160
                    ? 'admin-hint admin-hint--warn'
                    : 'admin-hint'
              }>
                {form.excerpt.length} chars · sweet spot 120–160
              </small>
            </label>

            <div className="admin-field">
              <span>Tags</span>
              <div className="admin-tags">
                {form.tags.map((tag) => (
                  <button key={tag} type="button" className="admin-tag" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </button>
                ))}
              </div>
              <div className="admin-tag-input">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="Add tag…"
                />
                <button type="button" className="admin-btn admin-btn--sm" onClick={() => addTag(tagInput)}>
                  Add
                </button>
              </div>
              <div className="admin-chips">
                {QUICK_TAGS.filter((t) => !form.tags.includes(t)).map((t) => (
                  <button key={t} type="button" className="admin-chip" onClick={() => addTag(t)}>
                    + {t}
                  </button>
                ))}
                {tagSuggestions.map((t) => (
                  <button key={`s-${t}`} type="button" className="admin-chip admin-chip--suggest" onClick={() => addTag(t)}>
                    ✦ {t}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="admin-card admin-card--editor">
            <div className="admin-tabs">
              <button
                type="button"
                className={tab === 'edit' ? 'admin-tabs__tab admin-tabs__tab--active' : 'admin-tabs__tab'}
                onClick={() => setTab('edit')}
              >
                HTML Editor
              </button>
              <button
                type="button"
                className={tab === 'preview' ? 'admin-tabs__tab admin-tabs__tab--active' : 'admin-tabs__tab'}
                onClick={() => setTab('preview')}
              >
                Preview
              </button>
            </div>

            {tab === 'edit' ? (
              <>
                <div className="admin-toolbar">
                  <button type="button" onClick={() => wrapSelection('h2')}>H2</button>
                  <button type="button" onClick={() => wrapSelection('h3')}>H3</button>
                  <button type="button" onClick={() => wrapSelection('p')}>P</button>
                  <button type="button" onClick={() => wrapSelection('strong')}>Bold</button>
                  <button type="button" onClick={() => wrapSelection('li')}>LI</button>
                  <span className="admin-toolbar__sep" />
                  {INTIMGRAM_SNIPPETS.map((s) => (
                    <button key={s.label} type="button" onClick={() => insertHtml(s.html)} title={s.html}>
                      + {s.label}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={contentRef}
                  className="admin-code"
                  value={form.content}
                  onChange={(e) => update({ content: e.target.value })}
                  rows={18}
                  spellCheck={false}
                />
                <small className="admin-hint">{analysis.wordCount} words · use H2 headings, 300+ words recommended</small>
              </>
            ) : (
              <div className="admin-preview post-content">
                <h1 className="post-title">{form.title || 'Untitled'}</h1>
                <p className="post-excerpt">{form.excerpt}</p>
                <div dangerouslySetInnerHTML={{ __html: form.content }} />
              </div>
            )}
          </section>
        </div>

        <aside className="admin-editor__sidebar">
          <section className="admin-card admin-seo-card">
            <h2>SEO Score</h2>
            <div className="admin-score-ring" style={{ '--score-color': scoreColor(analysis.score) } as React.CSSProperties}>
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" className="admin-score-ring__bg" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="admin-score-ring__fg"
                  strokeDasharray={`${analysis.score * 3.27} 327`}
                />
              </svg>
              <span className="admin-score-ring__num">{analysis.score}</span>
            </div>
            <ul className="admin-suggestions">
              {analysis.suggestions.map((s) => (
                <li key={s.id} className={`admin-suggestion admin-suggestion--${s.type}`}>
                  {s.message}
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-card admin-card--compact">
            <h3>Google preview</h3>
            <div className="admin-serp">
              <div className="admin-serp__url">geoeskort.com › blog › {form.slug || '…'}</div>
              <div className="admin-serp__title">
                {(form.seoTitle || form.title || 'Post title').slice(0, 60)}
                {(form.seoTitle || form.title).length > 60 ? '…' : ''}
              </div>
              <div className="admin-serp__desc">
                {form.excerpt.slice(0, 160) || 'Meta description appears here…'}
                {form.excerpt.length > 160 ? '…' : ''}
              </div>
            </div>
          </section>

          <section className="admin-card admin-card--compact">
            <h3>Checklist</h3>
            <ul className="admin-checklist">
              <li className={form.title.length >= 30 ? 'done' : ''}>Title 30+ chars</li>
              <li className={form.excerpt.length >= 120 ? 'done' : ''}>Meta description 120+ chars</li>
              <li className={form.slug.length >= 3 ? 'done' : ''}>Clean URL slug</li>
              <li className={analysis.hasH2 ? 'done' : ''}>H2 subheading</li>
              <li className={analysis.wordCount >= 300 ? 'done' : ''}>300+ words</li>
              <li className={analysis.hasIntimgramLink ? 'done' : ''}>INTIMGRAM link</li>
              <li className={form.tags.length >= 2 ? 'done' : ''}>2+ tags</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
