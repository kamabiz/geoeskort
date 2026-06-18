import 'server-only';

import fs from 'fs';
import path from 'path';
import { list, put, del, get } from '@vercel/blob';
import { parseMarkdown, serializeMarkdown } from '@/lib/blog-parse';
import type { BlogPost, BlogPostInput } from '@/lib/types/blog';

const CONTENT_DIR = path.join(process.cwd(), 'blog-content');
const BLOB_PREFIX = 'blog-content/';

function hasBlobStorage(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return true;
  // Vercel OIDC (default for newly connected Blob stores — no static token needed)
  if (process.env.VERCEL && process.env.BLOB_STORE_ID?.trim()) return true;
  return false;
}

const USE_BLOB = hasBlobStorage();

const STORAGE_ERROR =
  'Blog storage not configured on Vercel: go to Storage → Blob → Create → Connect to project (sets BLOB_STORE_ID / BLOB_READ_WRITE_TOKEN), then redeploy.';

function assertCanWrite(): void {
  if (USE_BLOB) return;
  if (process.env.VERCEL) throw new Error(STORAGE_ERROR);
}

function filenameForSlug(slug: string): string {
  return `${slug}.md`;
}

function ensureContentDir(): void {
  assertCanWrite();
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

async function readFromBlob(): Promise<{ name: string; content: string }[]> {
  const { blobs } = await list({ prefix: BLOB_PREFIX });
  const posts: { name: string; content: string }[] = [];
  for (const blob of blobs) {
    if (!blob.pathname.endsWith('.md')) continue;
    const result = await get(blob.pathname, { access: 'private' });
    if (!result) continue;
    const content = await new Response(result.stream).text();
    posts.push({ name: path.basename(blob.pathname), content });
  }
  return posts;
}

function readFromFs(): { name: string; content: string }[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')
    .map((name) => ({
      name,
      content: fs.readFileSync(path.join(CONTENT_DIR, name), 'utf8'),
    }));
}

async function listRawPosts(): Promise<{ name: string; content: string }[]> {
  const fsPosts = readFromFs();
  if (!USE_BLOB) return fsPosts;

  const blobPosts = await readFromBlob();
  const bySlug = new Map<string, { name: string; content: string }>();

  for (const post of fsPosts) {
    const parsed = parseMarkdown(post.content, post.name);
    if (parsed) bySlug.set(parsed.slug, post);
  }
  for (const post of blobPosts) {
    const parsed = parseMarkdown(post.content, post.name);
    if (parsed) bySlug.set(parsed.slug, post);
  }

  return [...bySlug.values()];
}

function parseAll(rawPosts: { name: string; content: string }[], includeDrafts = false): BlogPost[] {
  return rawPosts
    .map(({ name, content }) => parseMarkdown(content, name))
    .filter((p): p is BlogPost => p !== null)
    .filter((p) => includeDrafts || p.status !== 'draft')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getAllPostsAsync(includeDrafts = false): Promise<BlogPost[]> {
  return parseAll(await listRawPosts(), includeDrafts);
}

export async function getPostBySlugAsync(slug: string): Promise<BlogPost | undefined> {
  const posts = await getAllPostsAsync(true);
  return posts.find((p) => p.slug === slug);
}

async function writePost(slug: string, markdown: string): Promise<void> {
  assertCanWrite();
  const filename = filenameForSlug(slug);
  if (USE_BLOB) {
    await put(`${BLOB_PREFIX}${filename}`, markdown, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'text/markdown',
    });
    return;
  }
  ensureContentDir();
  fs.writeFileSync(path.join(CONTENT_DIR, filename), markdown, 'utf8');
}

async function deletePostFile(slug: string): Promise<void> {
  assertCanWrite();
  const filename = filenameForSlug(slug);
  if (USE_BLOB) {
    const { blobs } = await list({ prefix: `${BLOB_PREFIX}${filename}` });
    for (const blob of blobs) await del(blob.url);
    return;
  }
  const filePath = path.join(CONTENT_DIR, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const existing = await getPostBySlugAsync(input.slug);
  if (existing) throw new Error('A post with this slug already exists');
  const markdown = serializeMarkdown(input);
  await writePost(input.slug, markdown);
  const post = parseMarkdown(markdown, filenameForSlug(input.slug));
  if (!post) throw new Error('Failed to parse saved post');
  return post;
}

export async function updatePost(slug: string, input: BlogPostInput): Promise<BlogPost> {
  if (slug !== input.slug) {
    const conflict = await getPostBySlugAsync(input.slug);
    if (conflict) throw new Error('Target slug already in use');
    await deletePostFile(slug);
  }
  const markdown = serializeMarkdown(input);
  await writePost(input.slug, markdown);
  const post = parseMarkdown(markdown, filenameForSlug(input.slug));
  if (!post) throw new Error('Failed to parse saved post');
  return post;
}

export async function deletePost(slug: string): Promise<void> {
  const existing = await getPostBySlugAsync(slug);
  if (!existing) throw new Error('Post not found');
  await deletePostFile(slug);
}

export function getStorageMode(): 'blob' | 'filesystem' | 'unconfigured' {
  if (USE_BLOB) return 'blob';
  if (process.env.VERCEL) return 'unconfigured';
  return 'filesystem';
}

/** Safe diagnostics for publish-test (no secrets exposed). */
export function getStorageDiagnostics() {
  return {
    storage: getStorageMode(),
    vercel: !!process.env.VERCEL,
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN?.trim(),
    hasBlobStoreId: !!process.env.BLOB_STORE_ID?.trim(),
    hasOidcToken: !!process.env.VERCEL_OIDC_TOKEN?.trim(),
  };
}
