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
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  city: string;
  startDate: string;
  endDate: string;
  specialty: string;
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

export interface CVData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  technicalSkills: string[];
  softSkills: string[];
  languages: Language[];
  certifications: Certification[];
  interests: string[];
  accentColor: AccentColor;
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
  },
  experiences: [],
  education: [],
  technicalSkills: [],
  softSkills: [],
  languages: [],
  certifications: [],
  interests: [],
  accentColor: 'blue',
};
