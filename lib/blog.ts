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

/** Georgian blog listing. */
export async function getAllPosts() {
  const { getAllPostsAsync } = await import('@/lib/blog-store');
  return getAllPostsAsync();
}

/** Georgian single post lookup. */
export async function getPostBySlug(slug: string) {
  const { getPostBySlugAsync } = await import('@/lib/blog-store');
  return getPostBySlugAsync(slug);
}
