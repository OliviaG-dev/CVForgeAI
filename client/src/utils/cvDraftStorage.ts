import type { AccentColor, CVData, CVTemplate, Language, PersonalInfo } from '../types/cv';
import { emptyCVData } from '../types/cv';

const PERSONAL_KEYS: (keyof PersonalInfo)[] = [
  'firstName',
  'lastName',
  'title',
  'summary',
  'email',
  'phone',
  'city',
  'linkedin',
  'portfolio',
  'github',
  'photo',
];

const DRAFT_KEY = 'cvforge-draft';
const DRAFT_VERSION = 1;

/** Nombre d’étapes du formulaire (0-based : dernier index = STEPS.length - 1) */
export const CV_FORM_STEP_COUNT = 6;

const ACCENT_COLORS: AccentColor[] = [
  'blue',
  'green',
  'orange',
  'red',
  'pink',
  'violet',
  'black',
  'teal',
];

const CV_TEMPLATES: CVTemplate[] = ['classic', 'classic_dev', 'creative'];

const LANGUAGE_LEVELS = ['Natif', 'Courant', 'Intermédiaire', 'Débutant'] as const;

function parseAccentColor(v: unknown): AccentColor {
  return typeof v === 'string' && ACCENT_COLORS.includes(v as AccentColor)
    ? (v as AccentColor)
    : emptyCVData.accentColor;
}

function parseTemplate(v: unknown): CVTemplate {
  return typeof v === 'string' && CV_TEMPLATES.includes(v as CVTemplate)
    ? (v as CVTemplate)
    : emptyCVData.template;
}

function parseLanguages(v: unknown): Language[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item) => {
      const level = item.level;
      const safeLevel =
        typeof level === 'string' && LANGUAGE_LEVELS.includes(level as (typeof LANGUAGE_LEVELS)[number])
          ? (level as Language['level'])
          : 'Courant';
      return {
        id: typeof item.id === 'string' ? item.id : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        language: typeof item.language === 'string' ? item.language : '',
        level: safeLevel,
      };
    });
}

export function mergeCVDataFromStorage(raw: unknown): CVData {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...emptyCVData };
  }
  const p = raw as Record<string, unknown>;

  const personal =
    p.personalInfo && typeof p.personalInfo === 'object' && !Array.isArray(p.personalInfo)
      ? (p.personalInfo as Record<string, unknown>)
      : {};

  const personalInfo: PersonalInfo = { ...emptyCVData.personalInfo };
  for (const key of PERSONAL_KEYS) {
    const v = personal[key];
    personalInfo[key] = typeof v === 'string' ? v : '';
  }

  return {
    personalInfo,
    experiences: Array.isArray(p.experiences) ? p.experiences : emptyCVData.experiences,
    projects: Array.isArray(p.projects) ? p.projects : emptyCVData.projects,
    education: Array.isArray(p.education) ? p.education : emptyCVData.education,
    technicalSkills: Array.isArray(p.technicalSkills)
      ? p.technicalSkills.filter((x): x is string => typeof x === 'string')
      : emptyCVData.technicalSkills,
    tools: Array.isArray(p.tools) ? p.tools.filter((x): x is string => typeof x === 'string') : emptyCVData.tools,
    softSkills: Array.isArray(p.softSkills)
      ? p.softSkills.filter((x): x is string => typeof x === 'string')
      : emptyCVData.softSkills,
    languages: parseLanguages(p.languages),
    certifications: Array.isArray(p.certifications) ? p.certifications : emptyCVData.certifications,
    interests: Array.isArray(p.interests)
      ? p.interests.filter((x): x is string => typeof x === 'string')
      : emptyCVData.interests,
    accentColor: parseAccentColor(p.accentColor),
    template: parseTemplate(p.template),
    atsKeywords: typeof p.atsKeywords === 'string' ? p.atsKeywords : emptyCVData.atsKeywords,
  };
}

export function loadCVDraft(): { data: CVData; step: number } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const obj = parsed as Record<string, unknown>;

    let dataRaw: unknown = obj.data;
    if (dataRaw === undefined && obj.v === undefined) {
      dataRaw = parsed;
    }

    const data = mergeCVDataFromStorage(dataRaw);
    const stepRaw = obj.step;
    const step =
      typeof stepRaw === 'number' && Number.isFinite(stepRaw)
        ? Math.max(0, Math.min(Math.floor(stepRaw), CV_FORM_STEP_COUNT - 1))
        : 0;

    return { data, step };
  } catch {
    return null;
  }
}

export function saveCVDraft(data: CVData, step: number): void {
  const safeStep = Math.max(0, Math.min(Math.floor(step), CV_FORM_STEP_COUNT - 1));
  const payload = JSON.stringify({
    v: DRAFT_VERSION,
    data,
    step: safeStep,
  });
  try {
    localStorage.setItem(DRAFT_KEY, payload);
  } catch (e) {
    console.warn('Impossible d’enregistrer le brouillon CV', e);
  }
}

export function clearCVDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    console.warn('Impossible d’effacer le brouillon CV', e);
  }
}
