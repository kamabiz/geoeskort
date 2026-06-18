import 'server-only';

import fs from 'fs';
import path from 'path';
import { list, put, del, get } from '@vercel/blob';
import { parseStoredContent, resolvePost, serializeRecord } from '@/lib/blog-record';
import type { Locale } from '@/lib/i18n/types';
import type { BlogPost, BlogPostInput, BlogPostRecord } from '@/lib/types/blog';
import { getAvailableLocales } from '@/lib/types/blog';

const CONTENT_DIR = path.join(process.cwd(), 'blog-content');
const BLOB_PREFIX = 'blog-content/';

function hasBlobStorage(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return true;
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

function jsonFilenameForSlug(slug: string): string {
  return `${slug}.json`;
}

function mdFilenameForSlug(slug: string): string {
  return `${slug}.md`;
}

function ensureContentDir(): void {
  assertCanWrite();
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

function isPostFile(name: string): boolean {
  const lower = name.toLowerCase();
  if (lower === 'readme.md') return false;
  return lower.endsWith('.json') || lower.endsWith('.md');
}

async function readFromBlob(): Promise<{ name: string; content: string }[]> {
  const { blobs } = await list({ prefix: BLOB_PREFIX });
  const posts: { name: string; content: string }[] = [];
  for (const blob of blobs) {
    const name = path.basename(blob.pathname);
    if (!isPostFile(name)) continue;
    const result = await get(blob.pathname, { access: 'private' });
    if (!result) continue;
    const content = await new Response(result.stream).text();
    posts.push({ name, content });
  }
  return posts;
}

function readFromFs(): { name: string; content: string }[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter(isPostFile)
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
    const record = parseStoredContent(post.content, post.name);
    if (!record) continue;
    const existing = bySlug.get(record.slug);
    if (!existing || post.name.endsWith('.json')) {
      bySlug.set(record.slug, post);
    }
  }

  for (const post of blobPosts) {
    const record = parseStoredContent(post.content, post.name);
    if (!record) continue;
    const existing = bySlug.get(record.slug);
    if (!existing || post.name.endsWith('.json')) {
      bySlug.set(record.slug, post);
    }
  }

  return [...bySlug.values()];
}

function parseRecords(rawPosts: { name: string; content: string }[], includeDrafts = false): BlogPostRecord[] {
  return rawPosts
    .map(({ name, content }) => parseStoredContent(content, name))
    .filter((r): r is BlogPostRecord => r !== null)
    .filter((r) => includeDrafts || r.status !== 'draft')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getAllRecordsAsync(includeDrafts = false): Promise<BlogPostRecord[]> {
  return parseRecords(await listRawPosts(), includeDrafts);
}

export async function getRecordBySlugAsync(slug: string): Promise<BlogPostRecord | undefined> {
  const records = await getAllRecordsAsync(true);
  return records.find((r) => r.slug === slug);
}

export async function getAllPostsAsync(
  locale: Locale,
  includeDrafts = false,
): Promise<BlogPost[]> {
  return parseRecords(await listRawPosts(), includeDrafts)
    .map((record) => resolvePost(record, locale))
    .filter((p): p is BlogPost => p !== null);
}

export async function getPostBySlugAsync(
  slug: string,
  locale: Locale,
): Promise<BlogPost | undefined> {
  const record = await getRecordBySlugAsync(slug);
  if (!record) return undefined;
  return resolvePost(record, locale) ?? undefined;
}

async function writeRecord(slug: string, json: string): Promise<void> {
  assertCanWrite();
  const filename = jsonFilenameForSlug(slug);
  if (USE_BLOB) {
    await put(`${BLOB_PREFIX}${filename}`, json, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
    return;
  }
  ensureContentDir();
  fs.writeFileSync(path.join(CONTENT_DIR, filename), json, 'utf8');
}

async function deletePostFiles(slug: string): Promise<void> {
  assertCanWrite();
  const filenames = [jsonFilenameForSlug(slug), mdFilenameForSlug(slug)];

  if (USE_BLOB) {
    for (const filename of filenames) {
      const { blobs } = await list({ prefix: `${BLOB_PREFIX}${filename}` });
      for (const blob of blobs) await del(blob.url);
    }
    return;
  }

  for (const filename of filenames) {
    const filePath = path.join(CONTENT_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

export async function createPost(input: BlogPostInput): Promise<BlogPostRecord> {
  const existing = await getRecordBySlugAsync(input.slug);
  if (existing) throw new Error('A post with this slug already exists');

  const json = serializeRecord(input);
  await writeRecord(input.slug, json);

  const record = parseStoredContent(json, jsonFilenameForSlug(input.slug));
  if (!record) throw new Error('Failed to parse saved post');
  return record;
}

export async function updatePost(slug: string, input: BlogPostInput): Promise<BlogPostRecord> {
  if (slug !== input.slug) {
    const conflict = await getRecordBySlugAsync(input.slug);
    if (conflict) throw new Error('Target slug already in use');
    await deletePostFiles(slug);
  }

  const json = serializeRecord(input);
  await writeRecord(input.slug, json);

  const record = parseStoredContent(json, jsonFilenameForSlug(input.slug));
  if (!record) throw new Error('Failed to parse saved post');
  return record;
}

export async function mergePostLocales(
  slug: string,
  patch: Partial<BlogPostRecord>,
): Promise<BlogPostRecord> {
  const existing = await getRecordBySlugAsync(slug);
  if (!existing) throw new Error('Post not found');

  const merged: BlogPostRecord = {
    ...existing,
    ...patch,
    slug: patch.slug || existing.slug,
    locales: {
      ...existing.locales,
      ...patch.locales,
    },
  };

  return updatePost(slug, merged);
}

export async function deletePost(slug: string): Promise<void> {
  const existing = await getRecordBySlugAsync(slug);
  if (!existing) throw new Error('Post not found');
  await deletePostFiles(slug);
}

export function getStorageMode(): 'blob' | 'filesystem' | 'unconfigured' {
  if (USE_BLOB) return 'blob';
  if (process.env.VERCEL) return 'unconfigured';
  return 'filesystem';
}

export function getStorageDiagnostics() {
  return {
    storage: getStorageMode(),
    vercel: !!process.env.VERCEL,
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN?.trim(),
    hasBlobStoreId: !!process.env.BLOB_STORE_ID?.trim(),
    hasOidcToken: !!process.env.VERCEL_OIDC_TOKEN?.trim(),
  };
}

export { getAvailableLocales };
