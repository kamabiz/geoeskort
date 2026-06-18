import Link from 'next/link';
import { BLOG_CATEGORY_SLUGS, getCategoryEmoji } from '@/lib/blog-categories';
import type { BlogCategorySlug } from '@/lib/blog-categories';
import { localePath } from '@/lib/i18n/paths';
import type { Dictionary, Locale } from '@/lib/i18n/types';

type Props = {
  locale: Locale;
  dict: Dictionary;
  activeCategory?: BlogCategorySlug | 'all';
};

export function BlogSidebar({ locale, dict, activeCategory = 'all' }: Props) {
  return (
    <aside className="blog-sidebar">
      <div className="sidebar-widget">
        <h3>{dict.blog.categoriesTitle}</h3>
        <ul className="sidebar-links">
          <li>
            <Link
              href={localePath(locale, '/blog/')}
              className={activeCategory === 'all' ? 'is-active' : undefined}
              aria-current={activeCategory === 'all' ? 'page' : undefined}
            >
              {dict.blog.categoryAll}
            </Link>
          </li>
          {BLOG_CATEGORY_SLUGS.map((slug) => {
            const cat = dict.blog.categories[slug];
            return (
              <li key={slug}>
                <Link
                  href={localePath(locale, `/blog/category/${slug}/`)}
                  className={activeCategory === slug ? 'is-active' : undefined}
                  aria-current={activeCategory === slug ? 'page' : undefined}
                  title={cat.desc}
                >
                  <span className="sidebar-links__emoji" aria-hidden="true">
                    {getCategoryEmoji(slug)}
                  </span>
                  {cat.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
