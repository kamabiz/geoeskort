export type AvatarGender = 'male' | 'female' | 'nonBinary';

const GENDER_SET = new Set<AvatarGender>(['male', 'female', 'nonBinary']);

function hashSeed(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length];
}

export function parseAvatarGender(raw: string): AvatarGender | null {
  if (!raw) return null;
  const normalized = raw.trim() as AvatarGender;
  return GENDER_SET.has(normalized) ? normalized : null;
}

export function buildDefaultAvatarSvg(options: {
  username: string;
  gender: AvatarGender;
}): string {
  const { username, gender } = options;
  const seed = hashSeed(`${username}:${gender}`);
  const initials = (username[0] ?? '?').toUpperCase();

  const palettes: Record<AvatarGender, ReadonlyArray<readonly [string, string, string]>> = {
    male: [
      ['#0ea5e9', '#0369a1', '#7dd3fc'],
      ['#2563eb', '#1d4ed8', '#93c5fd'],
      ['#0284c7', '#075985', '#67e8f9'],
    ],
    female: [
      ['#db2777', '#9d174d', '#f9a8d4'],
      ['#d946ef', '#a21caf', '#f5d0fe'],
      ['#ec4899', '#be185d', '#fbcfe8'],
    ],
    nonBinary: [
      ['#a855f7', '#6d28d9', '#ddd6fe'],
      ['#6366f1', '#4338ca', '#c7d2fe'],
      ['#14b8a6', '#0f766e', '#99f6e4'],
    ],
  };

  const symbols: Record<AvatarGender, string> = {
    male: '♂',
    female: '♀',
    nonBinary: '⚧',
  };

  const [start, end, accent] = pick(palettes[gender], seed);
  const symbol = symbols[gender];

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="${username} avatar">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${start}" />
      <stop offset="100%" stop-color="${end}" />
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.42" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.22"/>
    </filter>
  </defs>
  <rect width="160" height="160" rx="36" fill="url(#bg)" />
  <circle cx="${30 + (seed % 100)}" cy="140" r="54" fill="${accent}" fill-opacity="0.16" />
  <circle cx="146" cy="20" r="28" fill="#ffffff" fill-opacity="0.12" />
  <rect x="14" y="14" width="132" height="60" rx="20" fill="url(#shine)" />
  <text x="80" y="84" text-anchor="middle" dominant-baseline="middle" font-size="44" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" fill="#ffffff" opacity="0.94">${symbol}</text>
  <text x="80" y="119" text-anchor="middle" dominant-baseline="middle" font-size="28" font-weight="700" letter-spacing="1" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" fill="#ffffff" filter="url(#softShadow)">${initials}</text>
</svg>`.trim();
}

export function buildDefaultAvatarDataUri(options: {
  username: string;
  gender: AvatarGender;
}): string {
  const svg = buildDefaultAvatarSvg(options);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
