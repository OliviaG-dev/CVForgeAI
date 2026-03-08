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
}

interface Education {
  id: string;
  degree: string;
  school: string;
  city: string;
  startDate: string;
  endDate: string;
  specialty: string;
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

const COLOR_MAP: Record<AccentColor, string> = {
  blue:   'var(--accent)',
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
  education: Education[];
  technicalSkills: string[];
  softSkills: string[];
  languages: Language[];
  certifications: Certification[];
  interests: string[];
  accentColor?: AccentColor;
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

export function generateCVHTML(data: CVData): string {
  const { personalInfo: p, experiences, education, technicalSkills, softSkills, languages, certifications, interests } = data;
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

  const hasSkills = technicalSkills.length > 0 || softSkills.length > 0;
  const hasExperiences = experiences.length > 0;
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
    font-size: 10pt;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  a { color: var(--accent); text-decoration: none; }

  /* ── Header ── */
  .header { text-align: center; margin-bottom: 20pt; }

  .header__profession {
    font-size: 10.5pt;
    font-weight: 600;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 2.5pt;
    margin-bottom: 4pt;
  }

  .header__name {
    font-size: 24pt;
    font-weight: 700;
    color: #111827;
    letter-spacing: 0.5pt;
    margin-bottom: 10pt;
  }

  .header__summary {
    font-size: 9.5pt;
    color: #4b5563;
    max-width: 420pt;
    margin: 8pt auto 0;
    line-height: 1.55;
    text-align: center;
  }

  .header__bar {
    width: 40pt;
    height: 2.5pt;
    background: var(--accent);
    margin: 0 auto 10pt;
    border-radius: 2pt;
  }

  .header__info {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4pt 6pt;
    font-size: 9pt;
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
    width: 11pt;
    height: 11pt;
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
  .section { margin-bottom: 18pt; }

  .section__title {
    font-size: 10.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.8pt;
    color: var(--accent);
    padding-bottom: 5pt;
    border-bottom: 1.5pt solid #e5e7eb;
    margin-bottom: 10pt;
  }

  /* ── Skills ── */
  .skills-row {
    display: flex;
    margin-bottom: 5pt;
    font-size: 9.5pt;
    line-height: 1.5;
  }

  .skills-cat {
    font-weight: 600;
    color: #374151;
    min-width: 165pt;
    flex-shrink: 0;
  }

  .skills-val { color: #4b5563; }

  /* ── Entries (experiences / education) ── */
  .entry {
    margin-bottom: 14pt;
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
    font-size: 10.5pt;
    font-weight: 700;
    color: #111827;
  }

  .entry__at {
    font-weight: 400;
    color: #4b5563;
  }

  .entry__dates {
    font-size: 9pt;
    color: #6b7280;
    white-space: nowrap;
  }

  .entry__sub {
    font-size: 9pt;
    color: #6b7280;
    margin-top: 1pt;
  }

  .entry ul {
    margin-top: 5pt;
    padding-left: 14pt;
  }

  .entry li {
    margin-bottom: 2.5pt;
    font-size: 9.5pt;
    color: #374151;
  }

  .entry li::marker { color: var(--accent); }

  .entry__link {
    margin-top: 4pt;
    font-size: 9pt;
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
    font-size: 9.5pt;
  }

  .lang__name { font-weight: 600; color: #374151; }
  .lang__lvl { color: #6b7280; margin-left: 3pt; }

  /* ── Certifications ── */
  .cert {
    margin-bottom: 6pt;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }

  .cert__name { font-weight: 600; color: #111827; }
  .cert__org { color: #4b5563; }
  .cert__date { color: #6b7280; font-size: 9pt; }

  /* ── Interests ── */
  .interests { font-size: 9.5pt; color: #374151; }
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
    ${technicalSkills.length > 0 ? `
    <div class="skills-row">
      <span class="skills-cat">Compétences techniques</span>
      <span class="skills-val">${technicalSkills.map(esc).join(', ')}</span>
    </div>` : ''}
    ${softSkills.length > 0 ? `
    <div class="skills-row">
      <span class="skills-cat">Compétences transversales</span>
      <span class="skills-val">${softSkills.map(esc).join(', ')}</span>
    </div>` : ''}
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

</body>
</html>`;
}
