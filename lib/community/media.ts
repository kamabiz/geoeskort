import { put } from '@vercel/blob';
import sharp from 'sharp';

export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function hasBlobStorage(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return true;
  if (process.env.VERCEL && process.env.BLOB_STORE_ID?.trim()) return true;
  return false;
}

export type CompressedImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

export async function compressImageForUpload(
  input: Buffer,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number },
): Promise<CompressedImage> {
  const maxWidth = options?.maxWidth ?? 1200;
  const maxHeight = options?.maxHeight ?? 1200;
  const quality = options?.quality ?? 80;

  const buffer = await sharp(input)
    .rotate()
    .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  return {
    buffer,
    contentType: 'image/webp',
    extension: 'webp',
  };
}

export async function storeImageFile(
  pathPrefix: string,
  file: File,
  options?: {
    maxInputBytes?: number;
    compress?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  },
): Promise<string | { error: string }> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return { error: 'invalidImageType' };

  const maxInputBytes = options?.maxInputBytes ?? 5 * 1024 * 1024;
  if (file.size > maxInputBytes) return { error: 'imageTooLarge' };

  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  let contentType = file.type;
  let extension =
    file.type === 'image/png'
      ? 'png'
      : file.type === 'image/webp'
        ? 'webp'
        : file.type === 'image/gif'
          ? 'gif'
          : 'jpg';

  if (options?.compress !== false && file.type !== 'image/gif') {
    const compressed = await compressImageForUpload(buffer, {
      maxWidth: options?.maxWidth,
      maxHeight: options?.maxHeight,
      quality: options?.quality,
    });
    buffer = Buffer.from(compressed.buffer);
    contentType = compressed.contentType;
    extension = compressed.extension;
  }

  if (hasBlobStorage()) {
    const blob = await put(`${pathPrefix}-${Date.now()}.${extension}`, buffer, {
      access: 'public',
      contentType,
    });
    return blob.url;
  }

  return `data:${contentType};base64,${buffer.toString('base64')}`;
}
