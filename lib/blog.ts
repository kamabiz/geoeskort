import 'server-only';

export { fixLinks, parseMarkdown, serializeMarkdown, inputFromPost } from '@/lib/blog-parse';
export {
  getAllPostsAsync,
  getPostBySlugAsync,
  createPost,
  updatePost,
  deletePost,
  getStorageMode,
} from '@/lib/blog-store';

/** @deprecated use getAllPostsAsync */
export async function getAllPosts() {
  const { getAllPostsAsync } = await import('@/lib/blog-store');
  return getAllPostsAsync();
}

/** @deprecated use getPostBySlugAsync */
export async function getPostBySlug(slug: string) {
  const { getPostBySlugAsync } = await import('@/lib/blog-store');
  return getPostBySlugAsync(slug);
}
