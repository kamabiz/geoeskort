'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminSexologyForm } from '@/lib/admin-sexology';
import type { SeoAnalysis } from '@/lib/seo-analyze';
import {
  analyzeSeo,
  extractExcerptFromContent,
  slugify,
  suggestTags,
} from '@/lib/seo-analyze';

type Props = {
  mode: 'create' | 'edit';
  initial?: AdminSexologyForm;
  articleId?: string;
  articleSlug?: string;
};

const QUICK_TAGS = [
  'seksologiia',
  'janmrteloba',
  'urTieroba',
  'relacia',
  'konsultacia',
  'simptom',
];

function emptyArticle(): AdminSexologyForm {
  return {
    title: '',
    body: '<h2>შესავალი</h2>\n<p>დაიწყეთ სტატია აქ…</p>',
    tags: [],
    status: 'PUBLISHED',
    isAnonymous: true,
  };
}

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--admin-green)';
  if (score >= 50) return 'var(--admin-gold)';
  return 'var(--admin-red)';
}

function toSeoInput(form: AdminSexologyForm) {
  return {
    title: form.title,
    excerpt: extractExcerptFromContent(form.body),
    slug: slugify(form.title) || 'article',
    content: form.body,
    tags: form.tags,
  };
}

export function SexologyArticleEditor({ mode, initial, articleId, articleSlug }: Props) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState<AdminSexologyForm>(initial || emptyArticle());
  const [analysis, setAnalysis] = useState<SeoAnalysis>(() => analyzeSeo(toSeoInput(initial || emptyArticle())));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [tagInput, setTagInput] = useState('');

  const excerpt = useMemo(() => extractExcerptFromContent(form.body), [form.body]);
  const previewSlug = useMemo(() => slugify(form.title) || 'article', [form.title]);

  const tagSuggestions = useMemo(
    () => suggestTags(form.title, form.body, form.tags),
    [form.title, form.body, form.tags],
  );

  const update = useCallback((patch: Partial<AdminSexologyForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setAnalysis(analyzeSeo(toSeoInput(form))), 300);
    return () => clearTimeout(t);
  }, [form]);

  function insertHtml(snippet: string) {
    const el = contentRef.current;
    if (!el) {
      update({ body: form.body + '\n' + snippet });
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = form.body.slice(0, start);
    const after = form.body.slice(end);
    update({ body: before + snippet + after });
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
    const selected = form.body.slice(start, end) || 'ტექსტი';
    const wrapped = `<${tag}>${selected}</${tag}>`;
    const before = form.body.slice(0, start);
    const after = form.body.slice(end);
    update({ body: before + wrapped + after });
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
          ? '/api/admin/sexology/'
          : `/api/admin/sexology/${encodeURIComponent(articleId || '')}/`;
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
        router.push('/admin/sexology/');
        router.refresh();
      }, 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!articleId || !confirm('Delete this article permanently?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/sexology/${encodeURIComponent(articleId)}/`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      router.push('/admin/sexology/');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
      setSaving(false);
    }
  }

  return (
    <div className="admin-editor">
      <header className="admin-editor__top">
        <div>
          <h1>{mode === 'create' ? 'New sexology article' : 'Edit sexology article'}</h1>
          <p className="admin-muted">სამედიცინო სექსოლოგიის სტატიები — HTML რედაქტორი და live preview</p>
        </div>
        <div className="admin-editor__actions">
          {mode === 'edit' && articleSlug && (
            <a
              href={`/history/${articleSlug}/`}
              className="admin-btn admin-btn--ghost"
              target="_blank"
              rel="noopener"
            >
              View on site ↗
            </a>
          )}
          {mode === 'edit' && (
            <button type="button" className="admin-btn admin-btn--danger" onClick={handleDelete} disabled={saving}>
              Delete
            </button>
          )}
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => router.push('/admin/sexology/')}>
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
            <h2>Article details</h2>
            <label className="admin-field">
              <span>Title (H1)</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="სექსუალური ჯანმრთელობა — რა უნდა იცოდეს ყველა"
              />
              <small className={analysis.titleLength > 60 ? 'admin-hint admin-hint--warn' : 'admin-hint'}>
                {form.title.length} chars · ideal 30–60
              </small>
            </label>

            <div className="admin-field-row">
              <label className="admin-field">
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(e) =>
                    update({ status: e.target.value as AdminSexologyForm['status'] })
                  }
                >
                  <option value="PUBLISHED">Published (live on /medical/)</option>
                  <option value="DRAFT">Draft (hidden)</option>
                  <option value="ARCHIVED">Archived (hidden)</option>
                </select>
              </label>
              <label className="admin-field">
                <span>
                  <input
                    type="checkbox"
                    checked={form.isAnonymous}
                    onChange={(e) => update({ isAnonymous: e.target.checked })}
                  />{' '}
                  Anonymous author (shows as „ანონიმი“)
                </span>
              </label>
            </div>

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
                  <button
                    type="button"
                    onClick={() =>
                      insertHtml('<blockquote><p>მნიშვნელოვანი: ეს ინფორმაცია არ არის სამედიცინო დიაგნოზი.</p></blockquote>')
                    }
                  >
                    + Disclaimer
                  </button>
                  <button
                    type="button"
                    onClick={() => insertHtml('<ul>\n<li>პუნქტი 1</li>\n<li>პუნქტი 2</li>\n</ul>')}
                  >
                    + List
                  </button>
                </div>
                <textarea
                  ref={contentRef}
                  className="admin-code"
                  value={form.body}
                  onChange={(e) => update({ body: e.target.value })}
                  rows={18}
                  spellCheck={false}
                />
                <small className="admin-hint">{analysis.wordCount} words · use H2 headings, 300+ words recommended</small>
              </>
            ) : (
              <div className="admin-preview post-content">
                <h1 className="post-title">{form.title || 'Untitled'}</h1>
                <p className="post-excerpt">{excerpt}</p>
                <div dangerouslySetInnerHTML={{ __html: form.body }} />
              </div>
            )}
          </section>
        </div>

        <aside className="admin-editor__sidebar">
          <section className="admin-card admin-seo-card">
            <h2>Content score</h2>
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
            <h3>Search preview</h3>
            <div className="admin-serp">
              <div className="admin-serp__url">geoeskort.com › medical › {previewSlug}</div>
              <div className="admin-serp__title">
                {(form.title || 'Article title').slice(0, 60)}
                {form.title.length > 60 ? '…' : ''}
              </div>
              <div className="admin-serp__desc">
                {excerpt.slice(0, 160) || 'Description appears here…'}
                {excerpt.length > 160 ? '…' : ''}
              </div>
            </div>
          </section>

          <section className="admin-card admin-card--compact">
            <h3>Checklist</h3>
            <ul className="admin-checklist">
              <li className={form.title.length >= 30 ? 'done' : ''}>Title 30+ chars</li>
              <li className={excerpt.length >= 120 ? 'done' : ''}>Intro/summary 120+ chars</li>
              <li className={analysis.hasH2 ? 'done' : ''}>H2 subheading</li>
              <li className={analysis.wordCount >= 300 ? 'done' : ''}>300+ words</li>
              <li className={form.tags.length >= 2 ? 'done' : ''}>2+ tags</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
