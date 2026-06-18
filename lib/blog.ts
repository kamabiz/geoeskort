import 'server-only';

export { fixLinks, parseMarkdown, inferCategoryFromContent } from '@/lib/blog-parse';
export type { LegacyMarkdownPost } from '@/lib/blog-parse';
export {
  getAllPostsAsync,
  getPostBySlugAsync,
  getAllRecordsAsync,
  getRecordBySlugAsync,
  createPost,
  updatePost,
  deletePost,
  getStorageMode,
} from '@/lib/blog-store';

import type { Locale } from '@/lib/i18n/types';

/** Locale-aware blog listing (defaults to ka). */
export async function getAllPosts(locale: Locale = 'ka') {
  const { getAllPostsAsync } = await import('@/lib/blog-store');
  return getAllPostsAsync(locale);
}

/** Locale-aware single post lookup (defaults to ka). */
export async function getPostBySlug(slug: string, locale: Locale = 'ka') {
  const { getPostBySlugAsync } = await import('@/lib/blog-store');
  return getPostBySlugAsync(slug, locale);
}
