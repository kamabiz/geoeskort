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

/** Georgian blog listing — never throws; returns [] if storage is unavailable. */
export async function getAllPosts() {
  try {
    const { getAllPostsAsync } = await import('@/lib/blog-store');
    return await getAllPostsAsync();
  } catch {
    return [];
  }
}

/** Georgian single post lookup — returns undefined if storage read fails. */
export async function getPostBySlug(slug: string) {
  try {
    const { getPostBySlugAsync } = await import('@/lib/blog-store');
    return await getPostBySlugAsync(slug);
  } catch {
    return undefined;
  }
}
