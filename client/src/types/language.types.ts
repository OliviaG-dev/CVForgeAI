export type EnglishUsageContext =
  | 'professional'
  | 'internationalTeam'
  | 'technicalDaily';

export const ENGLISH_USAGE_OPTIONS: {
  id: EnglishUsageContext;
  label: string;
}[] = [
  { id: 'professional', label: 'Professionnel' },
  { id: 'internationalTeam', label: 'Équipe internationale' },
  { id: 'technicalDaily', label: 'Daily & Syncs techniques' },
];

export const ENGLISH_ELIGIBLE_LEVELS = ['Natif', 'Courant', 'Intermédiaire'] as const;
