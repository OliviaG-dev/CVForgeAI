/**
 * Normalise une compétence pour la comparaison (détection des doublons).
 * - Minuscules, trim
 * - Suppression des points (Node.js → nodejs)
 * - / et - remplacés par espace, espaces multiples réduits
 */
function normalizeSkill(s: string): string {
  if (!s || typeof s !== 'string') return '';
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
    .replace(/[/\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Vérifie si deux compétences normalisées sont équivalentes.
 * Gère le pluriel simple : "react" === "reacts" (sauf mots courts type "css").
 */
function isSameSkill(normA: string, normB: string): boolean {
  if (normA === normB) return true;
  if (!normA || !normB) return false;
  if (normA.length >= 4 && normB.length >= 4) {
    if (normA === normB + 's' || normB === normA + 's') return true;
  }
  return false;
}

function hasEquivalent(byNormalized: Map<string, string>, norm: string): boolean {
  for (const k of byNormalized.keys()) {
    if (isSameSkill(k, norm)) return true;
  }
  return false;
}

/**
 * Fusionne des compétences en évitant les doublons (normalisation).
 * Conserve la première forme rencontrée pour l'affichage.
 */
export function mergeSkillsUnique(existing: string[], incoming: string[]): string[] {
  const byNormalized = new Map<string, string>();

  for (const s of existing) {
    const n = normalizeSkill(s);
    if (!n) continue;
    if (!hasEquivalent(byNormalized, n)) byNormalized.set(n, s);
  }

  for (const s of incoming) {
    const n = normalizeSkill(s);
    if (!n) continue;
    if (!hasEquivalent(byNormalized, n)) byNormalized.set(n, s);
  }

  return Array.from(byNormalized.values());
}
