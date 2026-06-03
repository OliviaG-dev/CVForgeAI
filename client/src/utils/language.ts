import type { Language } from '../types/cv';
import {
  ENGLISH_ELIGIBLE_LEVELS,
  type EnglishUsageContext,
} from '../types/language.types';

export function isEnglishLanguage(name: string): boolean {
  const n = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  return (
    n === 'anglais' ||
    n === 'english' ||
    n === 'en' ||
    n.startsWith('anglais ') ||
    n.includes('english')
  );
}

export function canShowEnglishContexts(lang: Language): boolean {
  return (
    isEnglishLanguage(lang.language) &&
    ENGLISH_ELIGIBLE_LEVELS.includes(
      lang.level as (typeof ENGLISH_ELIGIBLE_LEVELS)[number],
    )
  );
}

export function toggleEnglishContext(
  contexts: EnglishUsageContext[] | undefined,
  id: EnglishUsageContext,
  checked: boolean,
): EnglishUsageContext[] {
  const current = contexts ?? [];
  if (checked) {
    return current.includes(id) ? current : [...current, id];
  }
  return current.filter((c) => c !== id);
}
