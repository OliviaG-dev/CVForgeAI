interface PersonalInfo {
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
  photo?: string;
}

interface Experience {
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

interface Education {
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

interface Project {
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

interface Language {
  id: string;
  language: string;
  level: string;
}

interface Certification {
  id: string;
  name: string;
  organization: string;
  date: string;
}

type AccentColor = 'blue' | 'green' | 'orange' | 'red' | 'pink' | 'violet' | 'black' | 'teal';
type CVTemplate = 'classic' | 'creative';

const COLOR_MAP: Record<AccentColor, string> = {
  blue:   '#2563eb',
  teal:   '#0d9488',
  green:  '#16a34a',
  orange: '#ea580c',
  red:    '#dc2626',
  pink:   '#db2777',
  violet: '#7c3aed',
  black:  '#1f2937',
};

interface CVData {
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
  accentColor?: AccentColor;
  template?: CVTemplate;
  atsKeywords?: string;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(date: string): string {
  if (!date) return '';
  const [year, month] = date.split('-');
  if (!month) return year;
  return `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
}

function dateRange(start: string, end: string, current?: boolean): string {
  const s = formatDate(start);
  const e = current ? "Aujourd'hui" : formatDate(end);
  if (!s && !e) return '';
  if (!s) return e;
  if (!e) return s;
  return `${s} — ${e}`;
}

function cleanUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

function descriptionToHtml(desc: string): string {
  const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '';
  const items = lines.map(l => `<li>${esc(l.replace(/^[-•–]\s*/, ''))}</li>`).join('');
  return `<ul>${items}</ul>`;
}

type CreativeDensity = 'sparse' | 'low' | 'medium' | 'dense' | 'compact';

function computeCreativeContentDensity(data: CVData): { density: CreativeDensity; score: number } {
  const exp = data.experiences;
  const proj = data.projects || [];
  const edu = data.education;
  const descLen = [...exp, ...proj].reduce((s, x) => s + (x.description || '').length, 0);
  const score =
    exp.length * 5 + proj.length * 5 + edu.length * 4 +
    (data.technicalSkills.length + data.tools.length + data.softSkills.length) +
    data.languages.length + data.certifications.length + data.interests.length +
    Math.floor(descLen / 80);
  let density: CreativeDensity;
  if (score < 12) density = 'sparse';
  else if (score < 25) density = 'low';
  else if (score < 45) density = 'medium';
  else if (score < 70) density = 'dense';
  else density = 'compact';
  return { density, score };
}

function sortByStartDateDesc<T extends { startDate: string; current?: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    const dateA = a.startDate || '';
    const dateB = b.startDate || '';
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB.localeCompare(dateA);
  });
}

export function generateCVHTMLForTemplate(data: CVData): string {
  if (data.template === 'creative') return generateCreativeCVHTML(data);
  return generateClassicCVHTML(data);
}

function generateClassicCVHTML(data: CVData): string {
  const { personalInfo: p, technicalSkills, tools, softSkills, languages, certifications, interests } = data;
  const experiences = sortByStartDateDesc(data.experiences);
  const projects = sortByStartDateDesc(data.projects || []);
  const education = sortByStartDateDesc(data.education);
  const accent = COLOR_MAP[data.accentColor || 'blue'];

  const ico = (svg: string) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`;
  const icoMail = ico('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>');
  const icoPhone = ico('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.76.32 1.55.55 2.36.68A2 2 0 0 1 22 16.92z"/>');
  const icoPin = ico('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>');
  const icoLinkedin = ico('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>');
  const icoGlobe = ico('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>');
  const icoGithub = ico('<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>');

  const contactItems: string[] = [];
  if (p.email) contactItems.push(`<a href="mailto:${esc(p.email)}" class="info-item">${icoMail}<span>${esc(p.email)}</span></a>`);
  if (p.phone) contactItems.push(`<span class="info-item">${icoPhone}<span>${esc(p.phone)}</span></span>`);
  if (p.city) contactItems.push(`<a href="https://www.google.com/maps/search/${encodeURIComponent(p.city)}" class="info-item">${icoPin}<span>${esc(p.city)}</span></a>`);
  if (p.linkedin) contactItems.push(`<a href="${esc(p.linkedin)}" class="info-item">${icoLinkedin}<span>LinkedIn</span></a>`);
  if (p.portfolio) contactItems.push(`<a href="${esc(p.portfolio)}" class="info-item">${icoGlobe}<span>Portfolio</span></a>`);
  if (p.github) contactItems.push(`<a href="${esc(p.github)}" class="info-item">${icoGithub}<span>GitHub</span></a>`);
  const contactLine = contactItems.join('<span class="sep">•</span>');

  const hasSkills = technicalSkills.length > 0 || tools.length > 0 || softSkills.length > 0;
  const hasExperiences = experiences.length > 0;
  const hasProjects = (projects || []).length > 0;
  const hasEducation = education.length > 0;
  const hasLanguages = languages.length > 0;
  const hasCertifications = certifications.length > 0;
  const hasInterests = interests.length > 0;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  :root { --accent: ${accent}; }
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif;
    color: #1f2937;
    font-size: 14pt;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  a { color: var(--accent); text-decoration: none; }

  /* ── Header ── */
  .header { text-align: center; margin-bottom: 28pt; }

  .header__profession {
    font-size: 15pt;
    font-weight: 600;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 2.5pt;
    margin-bottom: 4pt;
  }

  .header__name {
    font-size: 36pt;
    font-weight: 700;
    color: #111827;
    letter-spacing: 0.5pt;
    margin-bottom: 10pt;
  }

  .header__summary {
    font-size: 14pt;
    color: #4b5563;
    max-width: 420pt;
    margin: 8pt auto 0;
    line-height: 1.55;
    text-align: center;
  }

  .header__bar {
    width: 50pt;
    height: 3pt;
    background: var(--accent);
    margin: 0 auto 10pt;
    border-radius: 2pt;
  }

  .header__info {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4pt 6pt;
    font-size: 13pt;
    color: #6b7280;
  }

  .info-item {
    display: inline-flex;
    align-items: center;
    gap: 3pt;
    color: #4b5563;
    text-decoration: none;
  }

  a.info-item:hover { color: var(--accent); }

  .ico {
    width: 16pt;
    height: 16pt;
    flex-shrink: 0;
    color: var(--accent);
  }

  .sep {
    display: inline-flex;
    align-items: center;
    margin: 0 2pt;
    color: #d1d5db;
    font-size: 7pt;
  }

  /* ── Sections ── */
  .section { margin-bottom: 24pt; }

  .section__title {
    font-size: 15pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.8pt;
    color: var(--accent);
    padding-bottom: 5pt;
    border-bottom: 1.5pt solid #e5e7eb;
    margin-bottom: 10pt;
  }

  /* ── Skills ── */
  .skills-grid {
    display: grid;
    grid-template-columns: 220pt 1fr;
    gap: 10pt 20pt;
    align-items: start;
    font-size: 14pt;
    line-height: 1.5;
  }

  .skills-cat {
    font-weight: 700;
    color: #374151;
    padding-right: 8pt;
  }

  .skills-val { color: #4b5563; }

  /* ── Entries (experiences / education) ── */
  .entry {
    margin-bottom: 16pt;
    page-break-inside: avoid;
  }

  .entry__line1 {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4pt;
  }

  .entry__role {
    font-size: 15pt;
    font-weight: 700;
    color: #111827;
  }

  .entry__at {
    font-weight: 400;
    color: #4b5563;
  }

  .entry__dates {
    font-size: 13pt;
    color: #6b7280;
    white-space: nowrap;
  }

  .entry__sub {
    font-size: 13pt;
    color: #6b7280;
    margin-top: 1pt;
  }

  .entry ul {
    margin-top: 5pt;
    padding-left: 14pt;
  }

  .entry li {
    margin-bottom: 2.5pt;
    font-size: 14pt;
    color: #374151;
  }

  .entry li::marker { color: var(--accent); }

  .entry__link {
    margin-top: 4pt;
    font-size: 13pt;
  }

  .entry__link a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
  }

  /* ── Languages ── */
  .langs {
    display: flex;
    flex-wrap: wrap;
    gap: 4pt 24pt;
    font-size: 14pt;
  }

  .lang__name { font-weight: 600; color: #374151; }
  .lang__lvl { color: #6b7280; margin-left: 3pt; }

  /* ── Certifications ── */
  .cert {
    margin-bottom: 6pt;
    font-size: 14pt;
    page-break-inside: avoid;
  }

  .cert__name { font-weight: 600; color: #111827; }
  .cert__org { color: #4b5563; }
  .cert__date { color: #6b7280; font-size: 13pt; }

  /* ── Interests ── */
  .interests { font-size: 14pt; color: #374151; }

  .ats-hidden {
    color: #ffffff;
    font-size: 1pt;
    line-height: 1pt;
    margin: 0;
    padding: 0;
  }
</style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    ${p.title ? `<div class="header__profession">${esc(p.title)}</div>` : ''}
    <div class="header__name">${esc(p.firstName)} ${esc(p.lastName)}</div>
    <div class="header__bar"></div>
    ${contactLine ? `<div class="header__info">${contactLine}</div>` : ''}
    ${p.summary ? `<div class="header__summary">${esc(p.summary)}</div>` : ''}
  </div>

  ${hasSkills ? `
  <!-- Compétences -->
  <div class="section">
    <div class="section__title">Compétences</div>
    <div class="skills-grid">
      ${technicalSkills.length > 0 ? `<div class="skills-cat">Compétences techniques</div><div class="skills-val">${technicalSkills.map(esc).join(', ')}</div>` : ''}
      ${tools.length > 0 ? `<div class="skills-cat">Outils</div><div class="skills-val">${tools.map(esc).join(', ')}</div>` : ''}
      ${softSkills.length > 0 ? `<div class="skills-cat">Compétences transversales</div><div class="skills-val">${softSkills.map(esc).join(', ')}</div>` : ''}
    </div>
  </div>` : ''}

  ${hasExperiences ? `
  <!-- Expériences -->
  <div class="section">
    <div class="section__title">Expériences</div>
    ${experiences.map(exp => {
      const loc = [exp.company, exp.city].filter(Boolean).join(', ');
      return `
    <div class="entry">
      <div class="entry__line1">
        <span class="entry__role">${esc(exp.position)}${loc ? ` <span class="entry__at">— ${esc(loc)}</span>` : ''}</span>
        <span class="entry__dates">${dateRange(exp.startDate, exp.endDate, exp.current)}</span>
      </div>
      ${exp.description ? `<div class="entry__desc">${descriptionToHtml(exp.description)}</div>` : ''}
      ${exp.projectLink ? `<div class="entry__link"><a href="${esc(exp.projectLink)}">Voir le projet</a></div>` : ''}
    </div>`;
    }).join('')}
  </div>` : ''}

  ${hasProjects ? `
  <!-- Projets -->
  <div class="section">
    <div class="section__title">Projets</div>
    ${(projects || []).map(proj => {
      return `
    <div class="entry">
      <div class="entry__line1">
        <span class="entry__role">${esc(proj.name)}</span>
        <span class="entry__dates">${dateRange(proj.startDate, proj.endDate)}</span>
      </div>
      ${proj.description ? `<div class="entry__desc">${descriptionToHtml(proj.description)}</div>` : ''}
      ${proj.url ? `<div class="entry__link"><a href="${esc(proj.url)}">${cleanUrl(proj.url)}</a></div>` : ''}
    </div>`;
    }).join('')}
  </div>` : ''}

  ${hasEducation ? `
  <!-- Formation -->
  <div class="section">
    <div class="section__title">Formation</div>
    ${education.map(edu => {
      const loc = [edu.school, edu.city].filter(Boolean).join(', ');
      return `
    <div class="entry">
      <div class="entry__line1">
        <span class="entry__role">${esc(edu.degree)}${loc ? ` <span class="entry__at">— ${esc(loc)}</span>` : ''}</span>
        <span class="entry__dates">${dateRange(edu.startDate, edu.endDate)}</span>
      </div>
      ${edu.specialty ? `<div class="entry__sub">${esc(edu.specialty)}</div>` : ''}
    </div>`;
    }).join('')}
  </div>` : ''}

  ${hasLanguages ? `
  <!-- Langues -->
  <div class="section">
    <div class="section__title">Langues</div>
    <div class="langs">
      ${languages.map(l => `<span><span class="lang__name">${esc(l.language)}</span><span class="lang__lvl">(${esc(l.level)})</span></span>`).join('')}
    </div>
  </div>` : ''}

  ${hasCertifications ? `
  <!-- Certifications -->
  <div class="section">
    <div class="section__title">Certifications</div>
    ${certifications.map(c => `
    <div class="cert">
      <span class="cert__name">${esc(c.name)}</span>
      ${c.organization ? `<span class="cert__org"> — ${esc(c.organization)}</span>` : ''}
      ${c.date ? `<span class="cert__date"> — ${formatDate(c.date)}</span>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${hasInterests ? `
  <!-- Centres d'intérêt -->
  <div class="section">
    <div class="section__title">Centres d'intérêt</div>
    <div class="interests">${interests.map(esc).join(', ')}</div>
  </div>` : ''}

  ${data.atsKeywords ? `<div class="ats-hidden">${esc(data.atsKeywords)}</div>` : ''}

</body>
</html>`;
}

function getCreativeDensityVars(density: CreativeDensity): string {
  const vars: Record<CreativeDensity, Record<string, string>> = {
    sparse: {
      '--pad-v': '40pt', '--pad-h': '30pt', '--gap': '28pt', '--timeline-mb': '20pt', '--label-mb': '14pt', '--inner-gap': '8pt', '--line-ht': '1.5',
      '--font-base': '10.5pt', '--font-sm': '9.5pt', '--font-xs': '9pt', '--font-title': '22pt', '--font-subtitle': '13pt',
    },
    low: {
      '--pad-v': '30pt', '--pad-h': '22pt', '--gap': '20pt', '--timeline-mb': '14pt', '--label-mb': '10pt', '--inner-gap': '6pt', '--line-ht': '1.5',
      '--font-base': '9.5pt', '--font-sm': '8.5pt', '--font-xs': '8pt', '--font-title': '19pt', '--font-subtitle': '11pt',
    },
    medium: {
      '--pad-v': '22pt', '--pad-h': '16pt', '--gap': '14pt', '--timeline-mb': '10pt', '--label-mb': '8pt', '--inner-gap': '5pt', '--line-ht': '1.5',
      '--font-base': '9pt', '--font-sm': '8pt', '--font-xs': '7.5pt', '--font-title': '17pt', '--font-subtitle': '10pt',
    },
    dense: {
      '--pad-v': '18pt', '--pad-h': '14pt', '--gap': '14pt', '--timeline-mb': '8pt', '--label-mb': '7pt', '--inner-gap': '5pt', '--line-ht': '1.55',
      '--font-base': '9pt', '--font-sm': '8pt', '--font-xs': '7.5pt', '--font-title': '17pt', '--font-subtitle': '10pt',
    },
    compact: {
      '--pad-v': '14pt', '--pad-h': '10pt', '--gap': '10pt', '--timeline-mb': '6pt', '--label-mb': '6pt', '--inner-gap': '4pt', '--line-ht': '1.5',
      '--font-base': '8.5pt', '--font-sm': '7.5pt', '--font-xs': '7pt', '--font-title': '15pt', '--font-subtitle': '9pt',
    },
  };
  return Object.entries(vars[density]).map(([k, v]) => `${k}: ${v}`).join('; ');
}

function generateCreativeCVHTML(data: CVData): string {
  const { personalInfo: p, technicalSkills, tools, softSkills, languages, certifications, interests } = data;
  const experiences = sortByStartDateDesc(data.experiences);
  const projects = sortByStartDateDesc(data.projects || []);
  const education = sortByStartDateDesc(data.education);
  const accent = COLOR_MAP[data.accentColor || 'blue'];
  const { density, score } = computeCreativeContentDensity(data);
  const densityVars = getCreativeDensityVars(density);

  const hasExperiences = experiences.length > 0;
  const hasProjects = projects.length > 0;
  const hasEducation = education.length > 0;
  const hasTech = technicalSkills.length > 0 || tools.length > 0;
  const hasSoft = softSkills.length > 0;
  const hasLanguages = languages.length > 0;
  const hasCertifications = certifications.length > 0;
  const hasInterests = interests.length > 0;

  const ico = (svg: string) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`;
  const icoMail = ico('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>');
  const icoPhone = ico('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.76.32 1.55.55 2.36.68A2 2 0 0 1 22 16.92z"/>');
  const icoPin = ico('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>');
  const icoLinkedin = ico('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>');
  const icoGlobe = ico('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>');
  const icoGithub = ico('<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>');

  const contactItems: string[] = [];
  if (p.email) contactItems.push(`<div class="c-contact__item">${icoMail}<span>${esc(p.email)}</span></div>`);
  if (p.phone) contactItems.push(`<div class="c-contact__item">${icoPhone}<span>${esc(p.phone)}</span></div>`);
  if (p.city) contactItems.push(`<div class="c-contact__item">${icoPin}<span>${esc(p.city)}</span></div>`);
  if (p.linkedin) contactItems.push(`<div class="c-contact__item">${icoLinkedin}<a href="${esc(p.linkedin)}">LinkedIn</a></div>`);
  if (p.github) contactItems.push(`<div class="c-contact__item">${icoGithub}<a href="${esc(p.github)}">GitHub</a></div>`);
  if (p.portfolio) contactItems.push(`<div class="c-contact__item">${icoGlobe}<a href="${esc(p.portfolio)}">Portfolio</a></div>`);

  const interestColors = ['#e8913a', '#3db8a9', '#7c3aed', '#db2777', '#2563eb', '#16a34a', '#dc2626'];

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  :root {
    --accent: ${accent};
    --dark: #1e1e3a;
    --dark-lighter: #2a2a4a;
    ${densityVars}
  }
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif;
    color: #1f2937;
    font-size: var(--font-base);
    line-height: var(--line-ht);
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  @page {
    margin: 0;
    size: A4;
  }

  a { color: var(--accent); text-decoration: none; }

  .page {
    display: flex;
    min-height: 100vh;
    align-items: stretch;
  }

  /* ── Left column ── */
  .left {
    width: 42%;
    min-width: 0;
    background: var(--dark);
    color: #e2e8f0;
    padding: var(--pad-v) var(--pad-h);
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    overflow: hidden;
    justify-content: space-between;
  }

  .left > div {
    min-width: 0;
  }

  .left .section-label {
    display: inline-block;
    background: var(--accent);
    color: #fff;
    font-size: var(--font-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2pt;
    padding: 3pt 10pt;
    border-radius: 3pt;
    margin-bottom: var(--label-mb);
  }

  /* Experiences / Education timeline */
  .timeline-item {
    margin-bottom: var(--timeline-mb);
    padding-left: 10pt;
    border-left: 1.5pt solid rgba(255,255,255,0.12);
    page-break-inside: avoid;
    min-width: 0;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  }

  .timeline-item:last-child { margin-bottom: 0; }

  .timeline-date {
    font-size: var(--font-xs);
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 1pt;
  }

  .timeline-title {
    font-size: var(--font-base);
    font-weight: 700;
    color: #fff;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .timeline-sub {
    font-size: var(--font-sm);
    color: #94a3b8;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .timeline-desc {
    margin-top: 3pt;
    font-size: var(--font-sm);
    color: #cbd5e1;
    line-height: var(--line-ht);
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
  }

  .timeline-desc ul {
    padding-left: 12pt;
    margin: 0;
    overflow-wrap: break-word;
  }

  .timeline-desc li {
    margin-bottom: 1.5pt;
  }

  .timeline-desc li::marker { color: var(--accent); }

  .timeline-link {
    font-size: var(--font-xs);
    margin-top: 2pt;
  }

  .timeline-link a { color: var(--accent); }

  /* Tech grid */
  .tech-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--inner-gap);
    min-width: 0;
  }

  .tech-tag {
    background: var(--dark-lighter);
    border: 1pt solid rgba(255,255,255,0.08);
    color: #e2e8f0;
    padding: 3pt 8pt;
    border-radius: 4pt;
    font-size: var(--font-sm);
    font-weight: 500;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  /* Soft skills */
  .soft-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 4pt;
  }

  .soft-tag {
    font-size: 8.5pt;
    font-weight: 600;
    color: #e2e8f0;
  }

  .soft-sep { color: #475569; margin: 0 2pt; }

  /* ── Right column ── */
  .right {
    width: 58%;
    padding: var(--pad-v) var(--pad-h);
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    justify-content: space-between;
  }

  /* Photo + identity */
  .identity { text-align: center; margin-bottom: 4pt; }

  .identity__photo {
    width: 90pt;
    height: 90pt;
    border-radius: 50%;
    object-fit: cover;
    border: 3pt solid var(--accent);
    margin: 0 auto 10pt;
    display: block;
  }

  .identity__name {
    font-size: var(--font-title);
    font-weight: 700;
    color: #111827;
    letter-spacing: 0.5pt;
  }

  .identity__title {
    font-size: var(--font-subtitle);
    font-weight: 700;
    color: var(--accent);
    margin-top: 2pt;
  }

  .identity__tagline {
    font-size: var(--font-sm);
    color: #6b7280;
    margin-top: 4pt;
    font-style: italic;
  }

  /* Right sections */
  .r-section { page-break-inside: avoid; }

  .r-section__label {
    display: inline-block;
    background: var(--accent);
    color: #fff;
    font-size: var(--font-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5pt;
    padding: 2.5pt 8pt;
    border-radius: 3pt;
    margin-bottom: var(--label-mb);
  }

  /* Profile box */
  .profile-box {
    background: #f8fafc;
    border: 1pt solid #e5e7eb;
    border-radius: 8pt;
    padding: calc(var(--inner-gap) + 4pt);
    font-size: var(--font-base);
    color: #374151;
    line-height: 1.6;
  }

  /* Contact */
  .c-contact__item {
    display: flex;
    align-items: center;
    gap: var(--inner-gap);
    font-size: var(--font-sm);
    color: #374151;
    margin-bottom: var(--inner-gap);
  }

  .c-contact__item a { color: var(--accent); }

  .ico {
    width: 11pt;
    height: 11pt;
    flex-shrink: 0;
    color: var(--accent);
  }

  /* Languages */
  .r-langs {
    font-size: 9pt;
  }

  .r-lang { margin-bottom: var(--inner-gap); }
  .r-lang__name { font-weight: 600; color: #374151; }
  .r-lang__lvl { color: #6b7280; }

  /* Certifications */
  .r-cert {
    margin-bottom: var(--inner-gap);
    font-size: 8.5pt;
  }
  .r-cert__name { font-weight: 600; color: #111827; font-size: var(--font-sm); }
  .r-cert__org { color: #6b7280; font-size: var(--font-xs); }

  /* Soft skills (right column) */
  .r-soft-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--inner-gap);
    font-size: var(--font-base);
  }

  .r-soft-tag {
    font-weight: 600;
    color: #374151;
  }

  .r-soft-sep {
    color: #9ca3af;
    margin: 0 2pt;
  }

  /* Interests */
  .interest-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--inner-gap);
  }

  .interest-card {
    padding: var(--inner-gap) calc(var(--inner-gap) * 2);
    border-radius: 6pt;
    font-size: var(--font-sm);
    font-weight: 600;
    color: #fff;
    text-align: center;
  }

  .ats-hidden {
    color: #ffffff;
    font-size: 1pt;
    line-height: 1pt;
    margin: 0;
    padding: 0;
  }

  .c-density-debug {
    position: fixed;
    bottom: 4pt;
    right: 4pt;
    font-size: 6pt;
    color: #94a3b8;
    background: rgba(0,0,0,0.5);
    padding: 2pt 4pt;
    border-radius: 3pt;
    z-index: 9999;
  }
</style>
</head>
<body>

<div class="page">
  <!-- Left column -->
  <div class="left">
    ${hasExperiences ? `
    <div>
      <div class="section-label">Expériences</div>
      ${experiences.map(exp => {
        const loc = [exp.company, exp.city].filter(Boolean).join(', ');
        return `
      <div class="timeline-item">
        <div class="timeline-date">${dateRange(exp.startDate, exp.endDate, exp.current)}</div>
        <div class="timeline-title">${esc(exp.position)}</div>
        ${loc ? `<div class="timeline-sub">${esc(loc)}</div>` : ''}
        ${exp.description ? `<div class="timeline-desc">${descriptionToHtml(exp.description)}</div>` : ''}
        ${exp.projectLink ? `<div class="timeline-link"><a href="${esc(exp.projectLink)}">Voir le projet</a></div>` : ''}
      </div>`;
      }).join('')}
    </div>` : ''}

    ${hasProjects ? `
    <div>
      <div class="section-label">Projets</div>
      ${projects.map(proj => `
      <div class="timeline-item">
        <div class="timeline-date">${dateRange(proj.startDate, proj.endDate)}</div>
        <div class="timeline-title">${esc(proj.name)}</div>
        ${proj.description ? `<div class="timeline-desc">${descriptionToHtml(proj.description)}</div>` : ''}
        ${proj.url ? `<div class="timeline-link"><a href="${esc(proj.url)}">${cleanUrl(proj.url)}</a></div>` : ''}
      </div>`).join('')}
    </div>` : ''}

    ${hasEducation ? `
    <div>
      <div class="section-label">Formations</div>
      ${education.map(edu => {
        const loc = [edu.school, edu.city].filter(Boolean).join(', ');
        return `
      <div class="timeline-item">
        <div class="timeline-date">${dateRange(edu.startDate, edu.endDate)}</div>
        <div class="timeline-title">${esc(edu.degree)}</div>
        ${loc ? `<div class="timeline-sub">${esc(loc)}</div>` : ''}
        ${edu.specialty ? `<div class="timeline-sub">${esc(edu.specialty)}</div>` : ''}
      </div>`;
      }).join('')}
    </div>` : ''}

    ${hasTech ? `
    <div>
      <div class="section-label">Technologies</div>
      <div class="tech-grid">
        ${[...technicalSkills, ...tools].map(s => `<span class="tech-tag">${esc(s)}</span>`).join('')}
      </div>
    </div>` : ''}
  </div>

  <!-- Right column -->
  <div class="right">
    <div class="identity">
      ${p.photo ? `<img class="identity__photo" src="${p.photo}" alt="Photo"/>` : ''}
      <div class="identity__name">${esc(p.firstName)} ${esc(p.lastName)}</div>
      ${p.title ? `<div class="identity__title">${esc(p.title)}</div>` : ''}
    </div>

    ${p.summary ? `
    <div class="r-section">
      <div class="r-section__label">Profil</div>
      <div class="profile-box">${esc(p.summary)}</div>
    </div>` : ''}

    ${contactItems.length > 0 ? `
    <div class="r-section">
      <div class="r-section__label">Contact</div>
      ${contactItems.join('')}
    </div>` : ''}

    ${hasSoft ? `
    <div class="r-section">
      <div class="r-section__label">Savoir-être</div>
      <div class="r-soft-grid">
        ${softSkills.map((s, i) => `<span class="r-soft-tag">${esc(s)}</span>${i < softSkills.length - 1 ? '<span class="r-soft-sep">·</span>' : ''}`).join('')}
      </div>
    </div>` : ''}

    ${hasLanguages ? `
    <div class="r-section">
      <div class="r-section__label">Langues</div>
      <div class="r-langs">
        ${languages.map(l => `<div class="r-lang"><span class="r-lang__name">${esc(l.language)}</span> : <span class="r-lang__lvl">${esc(l.level)}</span></div>`).join('')}
      </div>
    </div>` : ''}

    ${hasCertifications ? `
    <div class="r-section">
      <div class="r-section__label">Certifications</div>
      ${certifications.map(c => `
      <div class="r-cert">
        <span class="r-cert__name">${esc(c.name)}</span>
        ${c.organization ? `<span class="r-cert__org"> — ${esc(c.organization)}</span>` : ''}
        ${c.date ? `<span class="r-cert__org"> — ${formatDate(c.date)}</span>` : ''}
      </div>`).join('')}
    </div>` : ''}

    ${hasInterests ? `
    <div class="r-section">
      <div class="r-section__label">Centres d'intérêt</div>
      <div class="interest-grid">
        ${interests.map((interest, i) => `<span class="interest-card" style="background:${interestColors[i % interestColors.length]}">${esc(interest)}</span>`).join('')}
      </div>
    </div>` : ''}
  </div>
</div>

${data.atsKeywords ? `<div class="ats-hidden">${esc(data.atsKeywords)}</div>` : ''}

<div class="c-density-debug" title="Densité appliquée selon le contenu">${density} (${score})</div>

</body>
</html>`;
}
