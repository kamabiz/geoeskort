import type { Locale } from './types';
import type { Dictionary } from './types';
import ka from './dictionaries/ka';
import en from './dictionaries/en';
import ru from './dictionaries/ru';
import tr from './dictionaries/tr';

const dictionaries: Record<Locale, Dictionary> = { ka, en, ru, tr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
