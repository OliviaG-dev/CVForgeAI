import { classifySkillsForClassicDev } from "../utils/classifyDevSkills.js";
import { computeDurationLabel } from "../utils/dateDuration.js";
import { descriptionToHtml } from "../utils/descriptionHtml.js";
import { formatLanguageLevelDetail } from "../utils/formatLanguage.js";

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
  /** Mise en page senior : puces, titre en gras avant « : » */
  structuredDescription?: boolean;
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
  structuredDescription?: boolean;
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
  englishContexts?: string[];
}

interface Certification {
  id: string;
  name: string;
  organization: string;
  date: string;
}

type AccentColor =
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "pink"
  | "violet"
  | "black"
  | "teal";
type CVTemplate = "classic" | "classic_dev" | "creative";

const COLOR_MAP: Record<AccentColor, string> = {
  blue: "#2563eb",
  teal: "#0d9488",
  green: "#16a34a",
  orange: "#ea580c",
  red: "#dc2626",
  pink: "#db2777",
  violet: "#7c3aed",
  black: "#1f2937",
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
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(date: string): string {
  if (!date) return "";
  const [year, month] = date.split("-");
  if (!month) return year;
  return `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
}

type DateRangeOptions = {
  current?: boolean;
  /** Formation en cours : pas de date de fin → jusqu'à aujourd'hui */
  ongoingIfNoEnd?: boolean;
  /** Ajoute « (2 ans et 3 mois) » si calcul possible */
  withDuration?: boolean;
};

function dateRange(
  start: string,
  end: string,
  options?: boolean | DateRangeOptions,
): string {
  const opts: DateRangeOptions =
    typeof options === "boolean" ? { current: options } : options ?? {};
  const ongoing = opts.ongoingIfNoEnd && !!start && !end;
  const s = formatDate(start);
  const e =
    opts.current || ongoing
      ? "Aujourd'hui"
      : formatDate(end);
  if (!s && !e) return "";
  let label: string;
  if (!s) label = e;
  else if (!e) label = s;
  else label = `${s} — ${e}`;

  if (!opts.withDuration || !start) return label;

  const duration = computeDurationLabel(start, end, {
    current: opts.current,
    ongoingIfNoEnd: opts.ongoingIfNoEnd,
  });
  if (!duration) return label;
  return `${label} (${duration})`;
}

function experienceDateRange(start: string, end: string, current?: boolean): string {
  return dateRange(start, end, { current, withDuration: true });
}

function educationDateRange(start: string, end: string): string {
  return dateRange(start, end, { ongoingIfNoEnd: true, withDuration: true });
}

function cleanUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/** Entreprise / école + ville (ville plus discrète) — template classique */
function entryOrgCityHtml(organization: string, city: string): string {
  const org = organization?.trim() || "";
  const c = city?.trim() || "";
  if (!org && !c) return "";
  let html = "";
  if (org) html += ` <span class="entry__at">— ${esc(org)}</span>`;
  if (c) {
    html += org
      ? `<span class="entry__city">, ${esc(c)}</span>`
      : ` <span class="entry__city">— ${esc(c)}</span>`;
  }
  return html;
}

/** Entreprise / école + ville — template créatif */
function timelineOrgCityHtml(organization: string, city: string): string {
  const org = organization?.trim() || "";
  const c = city?.trim() || "";
  if (!org && !c) return "";
  if (org && c) {
    return `<div class="timeline-sub">${esc(org)}<span class="timeline-city">, ${esc(c)}</span></div>`;
  }
  if (org) return `<div class="timeline-sub">${esc(org)}</div>`;
  return `<div class="timeline-sub"><span class="timeline-city">${esc(c)}</span></div>`;
}

type CreativeDensity = "sparse" | "low" | "medium" | "dense" | "compact";

function computeCreativeContentDensity(data: CVData): {
  density: CreativeDensity;
  score: number;
} {
  const exp = data.experiences;
  const proj = data.projects || [];
  const edu = data.education;
  const descLen = [...exp, ...proj].reduce(
    (s, x) => s + (x.description || "").length,
    0,
  );
  const score =
    exp.length * 5 +
    proj.length * 5 +
    edu.length * 4 +
    (data.technicalSkills.length + data.tools.length + data.softSkills.length) +
    data.languages.length +
    data.certifications.length +
    data.interests.length +
    Math.floor(descLen / 80);
  let density: CreativeDensity;
  if (score < 8) density = "sparse";
  else if (score < 18) density = "low";
  else if (score < 35) density = "medium";
  else if (score < 55) density = "dense";
  else density = "compact";
  return { density, score };
}

function sortByStartDateDesc<
  T extends { startDate: string; current?: boolean },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    const dateA = a.startDate || "";
    const dateB = b.startDate || "";
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB.localeCompare(dateA);
  });
}

export function generateCVHTMLForTemplate(data: CVData): string {
  if (data.template === "creative") return generateCreativeCVHTML(data);
  return generateClassicCVHTML(data);
}

type ClassicLayoutMode = "compact" | "balanced" | "airy";

/**
 * Espacement vertical harmonieux (classique / classique dev).
 * Le score ne compte pas les lignes de compétences : une section compétences longue
 * ne doit pas désactiver les marges avant expériences.
 */
function computeClassicLayoutSpacing(
  data: CVData,
  devSkillRowCount: number,
  useDevSkills: boolean,
): { mode: ClassicLayoutMode; fillPage: boolean } {
  const exp = data.experiences;
  const descLen = [...exp, ...(data.projects || [])].reduce(
    (s, x) => s + (x.description || "").length,
    0,
  );
  const bodyScore =
    exp.length * 10 +
    (data.projects?.length || 0) * 6 +
    data.education.length * 4 +
    Math.floor(descLen / 100);

  const hasDevSkillsBlock = useDevSkills && devSkillRowCount > 0;

  if (hasDevSkillsBlock) {
    if (bodyScore >= 70) return { mode: "compact", fillPage: false };
    if (bodyScore >= 45) return { mode: "balanced", fillPage: false };
    return { mode: "airy", fillPage: bodyScore < 38 };
  }

  if (bodyScore >= 50) return { mode: "compact", fillPage: false };
  if (bodyScore >= 28) return { mode: "balanced", fillPage: false };
  if (bodyScore >= 14) return { mode: "airy", fillPage: bodyScore < 34 };
  return { mode: "airy", fillPage: true };
}

function generateClassicCVHTML(data: CVData): string {
  const useDevSkills = data.template === "classic_dev";
  const {
    personalInfo: p,
    technicalSkills,
    tools,
    softSkills,
    languages,
    certifications,
    interests,
  } = data;
  const experiences = sortByStartDateDesc(data.experiences);
  const projects = sortByStartDateDesc(data.projects || []);
  const education = sortByStartDateDesc(data.education);
  const accent = COLOR_MAP[data.accentColor || "blue"];

  const ico = (svg: string) =>
    `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`;
  const icoMail = ico(
    '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  );
  const icoPhone = ico(
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.76.32 1.55.55 2.36.68A2 2 0 0 1 22 16.92z"/>',
  );
  const icoPin = ico(
    '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  );
  const icoLinkedin = ico(
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  );
  const icoGlobe = ico(
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  );
  const icoGithub = ico(
    '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  );

  const contactItems: string[] = [];
  if (p.email)
    contactItems.push(
      `<a href="mailto:${esc(p.email)}" class="info-item">${icoMail}<span>${esc(p.email)}</span></a>`,
    );
  if (p.phone)
    contactItems.push(
      `<span class="info-item">${icoPhone}<span>${esc(p.phone)}</span></span>`,
    );
  if (p.city)
    contactItems.push(
      `<a href="https://www.google.com/maps/search/${encodeURIComponent(p.city)}" class="info-item">${icoPin}<span>${esc(p.city)}</span></a>`,
    );
  if (p.linkedin)
    contactItems.push(
      `<a href="${esc(p.linkedin)}" class="info-item">${icoLinkedin}<span>LinkedIn</span></a>`,
    );
  if (p.portfolio)
    contactItems.push(
      `<a href="${esc(p.portfolio)}" class="info-item">${icoGlobe}<span>Portfolio</span></a>`,
    );
  if (p.github)
    contactItems.push(
      `<a href="${esc(p.github)}" class="info-item">${icoGithub}<span>GitHub</span></a>`,
    );
  const contactLine = contactItems.join('<span class="sep">•</span>');

  const hasSkills =
    technicalSkills.length > 0 || tools.length > 0 || softSkills.length > 0;
  const devSkillRows = useDevSkills
    ? classifySkillsForClassicDev(technicalSkills, tools, softSkills)
    : [];
  const hasDevSkillsBlock =
    hasSkills && useDevSkills && devSkillRows.length > 0;
  const layout = computeClassicLayoutSpacing(
    data,
    devSkillRows.length,
    useDevSkills,
  );
  const hasExperiences = experiences.length > 0;
  const useLayoutSpacing = layout.mode !== "compact";
  const showGapAfterHeader =
    useLayoutSpacing && hasDevSkillsBlock && (p.summary || true);
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
    font-size: 10pt;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    max-width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }

  .cv-flow {
    display: flex;
    flex-direction: column;
    max-width: 100%;
  }

  .cv-flow--fill {
    min-height: 100vh;
  }

  .cv-gap {
    display: block;
    flex: 0 0 auto;
    width: 100%;
    height: 0;
    overflow: hidden;
  }

  /* Peu d'espace résumé → compétences */
  .cv-body--balanced .cv-gap--after-header,
  .cv-body--airy .cv-gap--after-header {
    height: 0;
  }

  .cv-flow--fill .cv-gap--after-header {
    height: 0;
    flex: 0 0 auto;
    min-height: 0;
    max-height: 0;
  }

  .cv-body--balanced {
    --space-header-bottom: 26pt;
    --space-after-profession: 28pt;
    --space-after-name: 36pt;
    --space-after-bar: 30pt;
    --space-after-contact: 32pt;
    --space-before-summary: 28pt;
    --space-after-summary: 6pt;
    --space-before-skills: 6pt;
    --space-after-skills: 20pt;
  }

  .cv-body--airy {
    --space-header-bottom: 32pt;
    --space-after-profession: 34pt;
    --space-after-name: 46pt;
    --space-after-bar: 38pt;
    --space-after-contact: 42pt;
    --space-before-summary: 36pt;
    --space-after-summary: 8pt;
    --space-before-skills: 8pt;
    --space-after-skills: 24pt;
  }

  /* Classique dev : densifier l'en-tête pour tenir en 2 pages */
  .cv-body--balanced.has-dev-skills {
    --space-header-bottom: 10pt;
    --space-after-profession: 4pt;
    --space-after-name: 12pt;
    --space-after-bar: 14pt;
    --space-after-contact: 8pt;
    --space-before-summary: 6pt;
    --space-after-summary: 2pt;
    --space-before-skills: 2pt;
    --space-after-skills: 18pt;
  }

  .cv-body--airy.has-dev-skills {
    --space-header-bottom: 12pt;
    --space-after-profession: 5pt;
    --space-after-name: 14pt;
    --space-after-bar: 16pt;
    --space-after-contact: 10pt;
    --space-before-summary: 8pt;
    --space-after-summary: 3pt;
    --space-before-skills: 3pt;
    --space-after-skills: 22pt;
  }

  .cv-body--balanced.has-dev-skills .header {
    padding-top: 2pt;
  }

  .cv-body--airy.has-dev-skills .header {
    padding-top: 4pt;
  }

  .cv-body.has-dev-skills .header__name {
    font-size: 14pt;
    margin-bottom: 12pt;
  }

  .cv-body.has-dev-skills .header__bar {
    margin-bottom: 14pt;
  }

  .cv-body.has-dev-skills .section--experiences {
    margin-top: 14pt;
    padding-top: 0;
  }

  .cv-body--balanced .header,
  .cv-body--airy .header {
    margin-bottom: var(--space-header-bottom, 20pt);
  }

  .cv-body--balanced .header__profession,
  .cv-body--airy .header__profession {
    margin-bottom: var(--space-after-profession, 4pt);
  }

  .cv-body--balanced .header__name,
  .cv-body--airy .header__name {
    margin-bottom: var(--space-after-name, 10pt);
  }

  .cv-body--balanced .header__bar,
  .cv-body--airy .header__bar {
    margin-bottom: var(--space-after-bar, 10pt);
  }

  .cv-body--balanced .header__info,
  .cv-body--airy .header__info {
    margin-bottom: var(--space-after-contact, 0);
  }

  .cv-body--balanced .header__summary,
  .cv-body--airy .header__summary {
    margin-top: var(--space-before-summary, 8pt);
    padding-top: 0;
    margin-bottom: var(--space-after-summary, 0);
  }

  .cv-body--balanced .section--skills,
  .cv-body--airy .section--skills {
    margin-top: var(--space-before-skills, 0);
    margin-bottom: var(--space-after-skills, 18pt);
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
    white-space: pre-line;
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
  .section { margin-bottom: 18pt; max-width: 100%; }

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
  .skills-grid {
    display: grid;
    grid-template-columns: 180pt 1fr;
    gap: 8pt 16pt;
    align-items: start;
    font-size: 9.5pt;
    line-height: 1.5;
  }

  /* Libellés « Compétences clés » — style dédié, indépendant des puces missions/projets */
  .skills-grid .skills-cat,
  .skills-grid--dev .skills-cat {
    font-weight: 700;
    color: #374151;
    padding-right: 8pt;
  }

  .skills-val { color: #4b5563; }

  .skills-grid--dev {
    grid-template-columns: 200pt 1fr;
  }

  .section__title--dev-skills {
    text-transform: none;
    letter-spacing: 1pt;
  }

  /* ── Entries (experiences / education) ── */
  .entry {
    margin-bottom: 14pt;
    page-break-inside: avoid;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
  }

  .entry__desc {
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
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
    min-width: 0;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  }

  .entry__at {
    font-weight: 400;
    color: #4b5563;
  }

  .entry__city {
    font-size: 8pt;
    font-weight: 400;
    color: #9ca3af;
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
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  }

  .entry li {
    margin-bottom: 2.5pt;
    font-size: 9.5pt;
    color: #374151;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  }

  .desc-list--structured {
    list-style: none;
    padding-left: 0;
    margin-top: 5pt;
  }

  .desc-list--structured li {
    position: relative;
    padding-left: 11pt;
    margin-bottom: 5pt;
    line-height: 1.4;
    color: #4b5563;
  }

  .desc-list--structured li::before {
    content: "●";
    position: absolute;
    left: 0;
    color: var(--accent);
    font-size: 7pt;
    top: 1.5pt;
  }

  .entry__desc .desc-list--structured li strong {
    font-weight: 700;
    color: #4b5563;
    letter-spacing: 0.02em;
  }

  .entry li::marker { color: var(--accent); }

  .entry__link {
    margin-top: 4pt;
    font-size: 8pt;
  }

  .entry__link a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
  }

  .entry__skills {
    margin-top: 4pt;
    font-size: 8pt;
    color: #6b7280;
  }

  .entry__skills span {
    display: inline;
  }

  .entry__skills span:not(:last-child)::after {
    content: " · ";
    color: #9ca3af;
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

  .ats-hidden {
    color: #ffffff;
    font-size: 1pt;
    line-height: 1pt;
    margin: 0;
    padding: 0;
  }
</style>
</head>
<body class="cv-body cv-body--${layout.mode}${layout.fillPage ? " cv-body--fill" : ""}${hasDevSkillsBlock ? " has-dev-skills" : ""}">

  <div class="cv-flow${layout.fillPage ? " cv-flow--fill" : ""}">

  <!-- Header -->
  <div class="header">
    ${p.title ? `<div class="header__profession">${esc(p.title)}</div>` : ""}
    <div class="header__name">${esc(p.firstName)} ${esc(p.lastName)}</div>
    <div class="header__bar"></div>
    ${contactLine ? `<div class="header__info">${contactLine}</div>` : ""}
    ${p.summary ? `<div class="header__summary">${esc(p.summary)}</div>` : ""}
  </div>

  ${showGapAfterHeader ? '<div class="cv-gap cv-gap--after-header"></div>' : ""}

  ${
    hasSkills && useDevSkills && devSkillRows.length > 0
      ? `
  <!-- Compétences clés (classique dev) -->
  <div class="section section--skills">
    <div class="section__title section__title--dev-skills">COMPÉTENCES CLÉS</div>
    <div class="skills-grid skills-grid--dev">
      ${devSkillRows
        .map(
          ({ label, items }) =>
            `<div class="skills-cat">${esc(label)} :</div><div class="skills-val">${items.map(esc).join(", ")}</div>`,
        )
        .join("")}
    </div>
  </div>`
      : ""
  }
  ${
    hasSkills && (!useDevSkills || devSkillRows.length === 0)
      ? `
  <!-- Compétences -->
  <div class="section section--skills">
    <div class="section__title">Compétences</div>
    <div class="skills-grid">
      ${technicalSkills.length > 0 ? `<div class="skills-cat">Compétences techniques</div><div class="skills-val">${technicalSkills.map(esc).join(", ")}</div>` : ""}
      ${tools.length > 0 ? `<div class="skills-cat">Outils</div><div class="skills-val">${tools.map(esc).join(", ")}</div>` : ""}
      ${softSkills.length > 0 ? `<div class="skills-cat">Compétences transversales</div><div class="skills-val">${softSkills.map(esc).join(", ")}</div>` : ""}
    </div>
  </div>`
      : ""
  }

  ${
    hasExperiences
      ? `
  <!-- Expériences -->
  <div class="section section--experiences">
    <div class="section__title">Expériences</div>
    ${experiences
      .map((exp) => {
        return `
    <div class="entry">
      <div class="entry__line1">
        <span class="entry__role">${esc(exp.position)}${entryOrgCityHtml(exp.company, exp.city)}</span>
        <span class="entry__dates">${experienceDateRange(exp.startDate, exp.endDate, exp.current)}</span>
      </div>
      ${exp.description ? `<div class="entry__desc">${descriptionToHtml(exp.description, exp.structuredDescription)}</div>` : ""}
      ${[...(exp.technicalSkills || []), ...(exp.tools || [])].length > 0 ? `<div class="entry__skills">${[...(exp.technicalSkills || []), ...(exp.tools || [])].map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}
      ${exp.projectLink ? `<div class="entry__link"><a href="${esc(exp.projectLink)}">Voir le projet</a></div>` : ""}
    </div>`;
      })
      .join("")}
  </div>`
      : ""
  }

  ${
    hasProjects
      ? `
  <!-- Projets -->
  <div class="section">
    <div class="section__title">Projets</div>
    ${(projects || [])
      .map((proj) => {
        return `
    <div class="entry">
      <div class="entry__line1">
        <span class="entry__role">${esc(proj.name)}</span>
        <span class="entry__dates">${dateRange(proj.startDate, proj.endDate)}</span>
      </div>
      ${proj.description ? `<div class="entry__desc">${descriptionToHtml(proj.description, proj.structuredDescription)}</div>` : ""}
      ${[...(proj.technicalSkills || []), ...(proj.tools || [])].length > 0 ? `<div class="entry__skills">${[...(proj.technicalSkills || []), ...(proj.tools || [])].map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}
      ${proj.url ? `<div class="entry__link"><a href="${esc(proj.url)}">${cleanUrl(proj.url)}</a></div>` : ""}
    </div>`;
      })
      .join("")}
  </div>`
      : ""
  }

  ${
    hasEducation
      ? `
  <!-- Formation -->
  <div class="section">
    <div class="section__title">Formation</div>
    ${education
      .map((edu) => {
        return `
    <div class="entry">
      <div class="entry__line1">
        <span class="entry__role">${esc(edu.degree)}${entryOrgCityHtml(edu.school, edu.city)}</span>
        <span class="entry__dates">${educationDateRange(edu.startDate, edu.endDate)}</span>
      </div>
      ${edu.specialty ? `<div class="entry__sub">${esc(edu.specialty)}</div>` : ""}
      ${[...(edu.technicalSkills || []), ...(edu.tools || [])].length > 0 ? `<div class="entry__skills">${[...(edu.technicalSkills || []), ...(edu.tools || [])].map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}
    </div>`;
      })
      .join("")}
  </div>`
      : ""
  }

  ${
    hasLanguages
      ? `
  <!-- Langues -->
  <div class="section">
    <div class="section__title">Langues</div>
    <div class="langs">
      ${languages
        .map((l) => {
          const lvl = formatLanguageLevelDetail(l.level, l.englishContexts);
          return `<span><span class="lang__name">${esc(l.language)}</span><span class="lang__lvl">(${esc(lvl)})</span></span>`;
        })
        .join("")}
    </div>
  </div>`
      : ""
  }

  ${
    hasCertifications
      ? `
  <!-- Certifications -->
  <div class="section">
    <div class="section__title">Certifications</div>
    ${certifications
      .map(
        (c) => `
    <div class="cert">
      <span class="cert__name">${esc(c.name)}</span>
      ${c.organization ? `<span class="cert__org"> — ${esc(c.organization)}</span>` : ""}
      ${c.date ? `<span class="cert__date"> — ${formatDate(c.date)}</span>` : ""}
    </div>`,
      )
      .join("")}
  </div>`
      : ""
  }

  ${
    hasInterests
      ? `
  <!-- Centres d'intérêt -->
  <div class="section">
    <div class="section__title">Centres d'intérêt</div>
    <div class="interests">${interests.map(esc).join(", ")}</div>
  </div>`
      : ""
  }

  ${data.atsKeywords ? `<div class="ats-hidden">${esc(data.atsKeywords)}</div>` : ""}

  </div>

</body>
</html>`;
}

function getCreativeDensityVars(density: CreativeDensity): string {
  const vars: Record<CreativeDensity, Record<string, string>> = {
    sparse: {
      "--pad-v": "24pt",
      "--pad-h": "18pt",
      "--gap": "22pt",
      "--timeline-mb": "12pt",
      "--label-mb": "8pt",
      "--inner-gap": "5pt",
      "--line-ht": "1.5",
      "--font-base": "9.5pt",
      "--font-sm": "8.5pt",
      "--font-xs": "8pt",
      "--font-title": "20pt",
      "--font-subtitle": "11pt",
    },
    low: {
      "--pad-v": "20pt",
      "--pad-h": "16pt",
      "--gap": "18pt",
      "--timeline-mb": "10pt",
      "--label-mb": "7pt",
      "--inner-gap": "5pt",
      "--line-ht": "1.48",
      "--font-base": "9pt",
      "--font-sm": "8pt",
      "--font-xs": "7.5pt",
      "--font-title": "18pt",
      "--font-subtitle": "10pt",
    },
    medium: {
      "--pad-v": "16pt",
      "--pad-h": "14pt",
      "--gap": "16pt",
      "--timeline-mb": "8pt",
      "--label-mb": "6pt",
      "--inner-gap": "4pt",
      "--line-ht": "1.45",
      "--font-base": "8.5pt",
      "--font-sm": "7.5pt",
      "--font-xs": "7pt",
      "--font-title": "16pt",
      "--font-subtitle": "9pt",
    },
    dense: {
      "--pad-v": "14pt",
      "--pad-h": "12pt",
      "--gap": "14pt",
      "--timeline-mb": "6pt",
      "--label-mb": "5pt",
      "--inner-gap": "4pt",
      "--line-ht": "1.4",
      "--font-base": "8pt",
      "--font-sm": "7pt",
      "--font-xs": "6.5pt",
      "--font-title": "15pt",
      "--font-subtitle": "8.5pt",
    },
    compact: {
      "--pad-v": "12pt",
      "--pad-h": "10pt",
      "--gap": "12pt",
      "--timeline-mb": "5pt",
      "--label-mb": "4pt",
      "--inner-gap": "3pt",
      "--line-ht": "1.35",
      "--font-base": "7.5pt",
      "--font-sm": "6.5pt",
      "--font-xs": "6pt",
      "--font-title": "14pt",
      "--font-subtitle": "8pt",
    },
  };
  return Object.entries(vars[density])
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
}

function generateCreativeCVHTML(data: CVData): string {
  const {
    personalInfo: p,
    technicalSkills,
    tools,
    softSkills,
    languages,
    certifications,
    interests,
  } = data;
  const experiences = sortByStartDateDesc(data.experiences);
  const projects = sortByStartDateDesc(data.projects || []);
  const education = sortByStartDateDesc(data.education);
  const accent = COLOR_MAP[data.accentColor || "blue"];
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

  const ico = (svg: string) =>
    `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`;
  const icoMail = ico(
    '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  );
  const icoPhone = ico(
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.76.32 1.55.55 2.36.68A2 2 0 0 1 22 16.92z"/>',
  );
  const icoPin = ico(
    '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  );
  const icoLinkedin = ico(
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  );
  const icoGlobe = ico(
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  );
  const icoGithub = ico(
    '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  );

  const contactItems: string[] = [];
  if (p.email)
    contactItems.push(
      `<div class="c-contact__item">${icoMail}<span>${esc(p.email)}</span></div>`,
    );
  if (p.phone)
    contactItems.push(
      `<div class="c-contact__item">${icoPhone}<span>${esc(p.phone)}</span></div>`,
    );
  if (p.city)
    contactItems.push(
      `<div class="c-contact__item">${icoPin}<span>${esc(p.city)}</span></div>`,
    );
  if (p.linkedin)
    contactItems.push(
      `<div class="c-contact__item">${icoLinkedin}<a href="${esc(p.linkedin)}">LinkedIn</a></div>`,
    );
  if (p.github)
    contactItems.push(
      `<div class="c-contact__item">${icoGithub}<a href="${esc(p.github)}">GitHub</a></div>`,
    );
  if (p.portfolio)
    contactItems.push(
      `<div class="c-contact__item">${icoGlobe}<a href="${esc(p.portfolio)}">Portfolio</a></div>`,
    );

  const interestColors = [
    "#e8913a",
    "#3db8a9",
    "#7c3aed",
    "#db2777",
    "#2563eb",
    "#16a34a",
    "#dc2626",
  ];

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
    padding: 3pt 8pt;
    border-radius: 3pt;
    margin-bottom: var(--label-mb);
  }

  /* Experiences / Education timeline */
  .timeline-item {
    margin-bottom: var(--timeline-mb);
    padding-left: 8pt;
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
    margin-bottom: 2pt;
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

  .timeline-city {
    font-size: var(--font-xs);
    font-weight: 400;
    color: #64748b;
  }

  .timeline-desc {
    margin-top: 2pt;
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

  .timeline-desc .desc-list--structured {
    list-style: none;
    padding-left: 0;
  }

  .timeline-desc .desc-list--structured li {
    position: relative;
    padding-left: 11pt;
    margin-bottom: 4pt;
    line-height: 1.4;
    color: #94a3b8;
  }

  .timeline-desc .desc-list--structured li::before {
    content: "●";
    position: absolute;
    left: 0;
    color: var(--accent);
    font-size: 7pt;
    top: 1.5pt;
  }

  .timeline-desc .desc-list--structured li strong {
    font-weight: 700;
    color: #cbd5e1;
    letter-spacing: 0.02em;
  }

  .timeline-link {
    font-size: var(--font-xs);
    margin-top: 1pt;
  }

  .timeline-link a { color: var(--accent); }

  .timeline-skills {
    margin-top: 3pt;
    font-size: var(--font-xs);
    color: #94a3b8;
  }

  .timeline-skills span { display: inline; }
  .timeline-skills span:not(:last-child)::after { content: " · "; color: #64748b; }

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
    padding: 2pt 6pt;
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
  }

  /* Photo + identity */
  .identity { text-align: center; margin-bottom: 2pt; }

  .identity__photo {
    width: 70pt;
    height: 70pt;
    border-radius: 50%;
    object-fit: cover;
    border: 3pt solid var(--accent);
    margin: 0 auto 8pt;
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
    letter-spacing: 1pt;
    padding: 2pt 6pt;
    border-radius: 3pt;
    margin-bottom: var(--label-mb);
  }

  /* Profile box */
  .profile-box {
    background: #f8fafc;
    border: 1pt solid #e5e7eb;
    border-radius: 6pt;
    padding: calc(var(--inner-gap) + 4pt);
    font-size: var(--font-base);
    color: #374151;
    line-height: 1.55;
    white-space: pre-line;
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

  /* Technologies (right column) */
  .r-tech-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--inner-gap);
    min-width: 0;
  }

  .r-tech-tag {
    background: #f1f5f9;
    border: 1pt solid #e2e8f0;
    color: #374151;
    padding: 2pt 6pt;
    border-radius: 4pt;
    font-size: var(--font-sm);
    font-weight: 500;
    overflow-wrap: break-word;
    word-break: break-word;
  }

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
    ${
      hasExperiences
        ? `
    <div>
      <div class="section-label">Expériences</div>
      ${experiences
        .map((exp) => {
          return `
      <div class="timeline-item">
        <div class="timeline-date">${experienceDateRange(exp.startDate, exp.endDate, exp.current)}</div>
        <div class="timeline-title">${esc(exp.position)}</div>
        ${timelineOrgCityHtml(exp.company, exp.city)}
        ${exp.description ? `<div class="timeline-desc">${descriptionToHtml(exp.description, exp.structuredDescription)}</div>` : ""}
        ${[...(exp.technicalSkills || []), ...(exp.tools || [])].length > 0 ? `<div class="timeline-skills">${[...(exp.technicalSkills || []), ...(exp.tools || [])].map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}
        ${exp.projectLink ? `<div class="timeline-link"><a href="${esc(exp.projectLink)}">Voir le projet</a></div>` : ""}
      </div>`;
        })
        .join("")}
    </div>`
        : ""
    }

    ${
      hasProjects
        ? `
    <div>
      <div class="section-label">Projets</div>
      ${projects
        .map(
          (proj) => `
      <div class="timeline-item">
        <div class="timeline-date">${dateRange(proj.startDate, proj.endDate)}</div>
        <div class="timeline-title">${esc(proj.name)}</div>
        ${proj.description ? `<div class="timeline-desc">${descriptionToHtml(proj.description, proj.structuredDescription)}</div>` : ""}
        ${[...(proj.technicalSkills || []), ...(proj.tools || [])].length > 0 ? `<div class="timeline-skills">${[...(proj.technicalSkills || []), ...(proj.tools || [])].map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}
        ${proj.url ? `<div class="timeline-link"><a href="${esc(proj.url)}">${cleanUrl(proj.url)}</a></div>` : ""}
      </div>`,
        )
        .join("")}
    </div>`
        : ""
    }

    ${
      hasEducation
        ? `
    <div>
      <div class="section-label">Formations</div>
      ${education
        .map((edu) => {
          return `
      <div class="timeline-item">
        <div class="timeline-date">${educationDateRange(edu.startDate, edu.endDate)}</div>
        <div class="timeline-title">${esc(edu.degree)}</div>
        ${timelineOrgCityHtml(edu.school, edu.city)}
        ${edu.specialty ? `<div class="timeline-sub">${esc(edu.specialty)}</div>` : ""}
        ${[...(edu.technicalSkills || []), ...(edu.tools || [])].length > 0 ? `<div class="timeline-skills">${[...(edu.technicalSkills || []), ...(edu.tools || [])].map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}
      </div>`;
        })
        .join("")}
    </div>`
        : ""
    }

  </div>

  <!-- Right column -->
  <div class="right">
    <div class="identity">
      ${p.photo ? `<img class="identity__photo" src="${p.photo}" alt="Photo"/>` : ""}
      <div class="identity__name">${esc(p.firstName)} ${esc(p.lastName)}</div>
      ${p.title ? `<div class="identity__title">${esc(p.title)}</div>` : ""}
    </div>

    ${
      p.summary
        ? `
    <div class="r-section">
      <div class="r-section__label">Profil</div>
      <div class="profile-box">${esc(p.summary)}</div>
    </div>`
        : ""
    }

    ${
      hasTech
        ? `
    <div class="r-section">
      <div class="r-section__label">Technologies</div>
      <div class="r-tech-grid">
        ${[...technicalSkills, ...tools].map((s) => `<span class="r-tech-tag">${esc(s)}</span>`).join("")}
      </div>
    </div>`
        : ""
    }

    ${
      contactItems.length > 0
        ? `
    <div class="r-section">
      <div class="r-section__label">Contact</div>
      ${contactItems.join("")}
    </div>`
        : ""
    }

    ${
      hasSoft
        ? `
    <div class="r-section">
      <div class="r-section__label">Savoir-être</div>
      <div class="r-soft-grid">
        ${softSkills.map((s, i) => `<span class="r-soft-tag">${esc(s)}</span>${i < softSkills.length - 1 ? '<span class="r-soft-sep">·</span>' : ""}`).join("")}
      </div>
    </div>`
        : ""
    }

    ${
      hasLanguages
        ? `
    <div class="r-section">
      <div class="r-section__label">Langues</div>
      <div class="r-langs">
        ${languages
          .map((l) => {
            const lvl = formatLanguageLevelDetail(l.level, l.englishContexts);
            return `<div class="r-lang"><span class="r-lang__name">${esc(l.language)}</span> : <span class="r-lang__lvl">${esc(lvl)}</span></div>`;
          })
          .join("")}
      </div>
    </div>`
        : ""
    }

    ${
      hasCertifications
        ? `
    <div class="r-section">
      <div class="r-section__label">Certifications</div>
      ${certifications
        .map(
          (c) => `
      <div class="r-cert">
        <span class="r-cert__name">${esc(c.name)}</span>
        ${c.organization ? `<span class="r-cert__org"> — ${esc(c.organization)}</span>` : ""}
        ${c.date ? `<span class="r-cert__org"> — ${formatDate(c.date)}</span>` : ""}
      </div>`,
        )
        .join("")}
    </div>`
        : ""
    }

    ${
      hasInterests
        ? `
    <div class="r-section">
      <div class="r-section__label">Centres d'intérêt</div>
      <div class="interest-grid">
        ${interests.map((interest, i) => `<span class="interest-card" style="background:${interestColors[i % interestColors.length]}">${esc(interest)}</span>`).join("")}
      </div>
    </div>`
        : ""
    }
  </div>
</div>

${data.atsKeywords ? `<div class="ats-hidden">${esc(data.atsKeywords)}</div>` : ""}

<div class="c-density-debug" title="Densité appliquée selon le contenu">${density} (${score})</div>

</body>
</html>`;
}
