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
  url: string;
  startDate: string;
  endDate: string;
  technicalSkills: string[];
  tools: string[];
  softSkills: string[];
}

export interface Language {
  id: string;
  language: string;
  level: 'Natif' | 'Courant' | 'Intermédiaire' | 'Débutant';
}

export interface Certification {
  id: string;
  name: string;
  organization: string;
  date: string;
}

export type AccentColor = 'blue' | 'green' | 'orange' | 'red' | 'pink' | 'violet' | 'black' | 'teal';
export type CVTemplate = 'classic' | 'creative';

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
