import type { Locale } from './types';
import type { Dictionary } from './types';
import ka from './dictionaries/ka';

const dictionaries: Record<Locale, Dictionary> = { ka };

export function getDictionary(_locale: Locale): Dictionary {
  return dictionaries.ka;
}
