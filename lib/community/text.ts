const WORDS_PER_MINUTE = 200;

export function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/[#>*_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function computeReadingTimeMinutes(body: string): number {
  const words = stripMarkdown(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function makeExcerpt(body: string, maxLength = 160): string {
  const plain = stripMarkdown(body);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}…`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function applyInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function autoParagraphs(text: string, sentencesPerParagraph = 3): string[] {
  const parts = text.match(/[^.!?…]+(?:[.!?…]+)\s*/g);
  if (!parts || parts.length <= sentencesPerParagraph) return [text];

  const paragraphs: string[] = [];
  for (let i = 0; i < parts.length; i += sentencesPerParagraph) {
    const chunk = parts.slice(i, i + sentencesPerParagraph).join('').trim();
    if (chunk) paragraphs.push(chunk);
  }
  return paragraphs.length ? paragraphs : [text];
}

function splitBodyIntoBlocks(body: string): string[] {
  const normalized = body.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  if (/\n\s*\n/.test(normalized)) {
    return normalized.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  }

  if (normalized.includes('\n')) {
    return normalized.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  if (normalized.length > 240) {
    return autoParagraphs(normalized);
  }

  return [normalized];
}

function blockToHtml(block: string): string {
  if (/^### /.test(block)) {
    return `<h3>${applyInlineMarkdown(escapeHtml(block.slice(4)))}</h3>`;
  }
  if (/^## /.test(block)) {
    return `<h2>${applyInlineMarkdown(escapeHtml(block.slice(3)))}</h2>`;
  }
  if (/^# /.test(block)) {
    return `<h1>${applyInlineMarkdown(escapeHtml(block.slice(2)))}</h1>`;
  }

  const withBreaks = applyInlineMarkdown(escapeHtml(block)).replace(/\n/g, '<br />');
  return `<p>${withBreaks}</p>`;
}

export function markdownToHtml(body: string): string {
  return splitBodyIntoBlocks(body).map(blockToHtml).join('');
}
