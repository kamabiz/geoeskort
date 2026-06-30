import type { AvatarGender } from '@/lib/community/avatar';

export type DatingGenderBucket = 'male' | 'female' | 'trans';

export type DatingPresetCase =
  | 'straight_male'
  | 'straight_female'
  | 'gay_male'
  | 'lesbian_female'
  | 'bi_male'
  | 'bi_female'
  | 'trans_straight'
  | 'trans_gay'
  | 'trans_bi'
  | 'open_to_all';

export const DATING_PRESET_CASES: readonly DatingPresetCase[] = [
  'straight_male',
  'straight_female',
  'gay_male',
  'lesbian_female',
  'bi_male',
  'bi_female',
  'trans_straight',
  'trans_gay',
  'trans_bi',
  'open_to_all',
] as const;

const PRESET_SET = new Set<string>(DATING_PRESET_CASES);

const PRESET_TO_BUCKET: Record<DatingPresetCase, DatingGenderBucket> = {
  straight_male: 'male',
  straight_female: 'female',
  gay_male: 'male',
  lesbian_female: 'female',
  bi_male: 'male',
  bi_female: 'female',
  trans_straight: 'trans',
  trans_gay: 'trans',
  trans_bi: 'trans',
  open_to_all: 'trans',
};

export function parseDatingPresetCase(raw: string): DatingPresetCase | null {
  const normalized = raw.trim();
  return PRESET_SET.has(normalized) ? (normalized as DatingPresetCase) : null;
}

export function parseDatingGenderBucket(raw: string): DatingGenderBucket | null {
  if (raw === 'male' || raw === 'female' || raw === 'trans') return raw;
  return null;
}

export function genderBucketFromPreset(
  preset: DatingPresetCase,
  userGender?: AvatarGender | null,
): DatingGenderBucket {
  if (preset === 'open_to_all') {
    if (userGender === 'male') return 'male';
    if (userGender === 'female') return 'female';
    return 'trans';
  }
  return PRESET_TO_BUCKET[preset];
}
