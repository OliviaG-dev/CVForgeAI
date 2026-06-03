export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  summary: string;
  email: string;
  phone: string;
  city: string;
  linkedin: string;
  portfolio: string;
  github: string;
  photo: string;
}

export interface Experience {
  id: string;
  position: string;
  company: string;
  city: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  /** Puces structurées + titres en gras avant « : » dans le PDF */
  structuredDescription: boolean;
  projectLink: string;
  technicalSkills: string[];
  tools: string[];
  softSkills: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  city: string;
  startDate: string;
  endDate: string;
  specialty: string;
  technicalSkills: string[];
  tools: string[];
  softSkills: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  /** Puces structurées + titres en gras avant « : » dans le PDF */
  structuredDescription: boolean;
  url: string;
  startDate: string;
  endDate: string;
  technicalSkills: string[];
  tools: string[];
  softSkills: string[];
}

import type { EnglishUsageContext } from './language.types';

export interface Language {
  id: string;
  language: string;
  level: 'Natif' | 'Courant' | 'Intermédiaire' | 'Débutant';
  /** Contexte pro en anglais (Natif / Courant / Intermédiaire) */
  englishContexts?: EnglishUsageContext[];
}

export interface Certification {
  id: string;
  name: string;
  organization: string;
  date: string;
}

export type AccentColor = 'blue' | 'green' | 'orange' | 'red' | 'pink' | 'violet' | 'black' | 'teal';
export type CVTemplate = 'classic' | 'classic_dev' | 'creative';

export interface CVData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  technicalSkills: string[];
  tools: string[];
  softSkills: string[];
  languages: Language[];
  certifications: Certification[];
  interests: string[];
  accentColor: AccentColor;
  template: CVTemplate;
  atsKeywords: string;
}

export const emptyCVData: CVData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    title: '',
    summary: '',
    email: '',
    phone: '',
    city: '',
    linkedin: '',
    portfolio: '',
    github: '',
    photo: '',
  },
  experiences: [],
  projects: [],
  education: [],
  technicalSkills: [],
  tools: [],
  softSkills: [],
  languages: [],
  certifications: [],
  interests: [],
  accentColor: 'blue',
  template: 'classic',
  atsKeywords: '',
};
