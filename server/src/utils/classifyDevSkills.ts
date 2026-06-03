import devSkillConfig from "../data/devSkillCategories.json" with { type: "json" };

type DevSkillCategoryId =
  | "frontend"
  | "mobile"
  | "backend"
  | "testing"
  | "devops"
  | "ia"
  | "dataviz"
  | "methodology"
  | "other";

type DevSkillRow = { label: string; items: string[] };

const config = devSkillConfig as {
  displayOrder: { id: DevSkillCategoryId; label: string }[];
  preferredOrder: Partial<Record<DevSkillCategoryId, string[]>>;
  substringMatchers: Partial<Record<DevSkillCategoryId, string[]>>;
  regexMatchers: Partial<Record<DevSkillCategoryId, string[]>>;
  classificationPriority: DevSkillCategoryId[];
};

function normalizeSkillMatch(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").trim();
}

function matchesSubstring(normalized: string, needles: string[]): boolean {
  return needles.some((needle) => {
    const n = needle.trim().toLowerCase();
    if (!n) return false;
    return normalized.includes(n);
  });
}

function matchesRegex(normalized: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    try {
      return new RegExp(pattern, "i").test(normalized);
    } catch {
      return false;
    }
  });
}

function classifySkill(
  raw: string,
  source: "tech" | "soft",
): DevSkillCategoryId | null {
  const normalized = normalizeSkillMatch(raw);
  if (!normalized) return null;

  const priority =
    source === "soft"
      ? ([...config.classificationPriority, "methodology"] as DevSkillCategoryId[])
      : config.classificationPriority;

  for (const categoryId of priority) {
    const substrings = config.substringMatchers[categoryId] ?? [];
    const regexes = config.regexMatchers[categoryId] ?? [];
    if (
      matchesSubstring(normalized, substrings) ||
      matchesRegex(normalized, regexes)
    ) {
      return categoryId;
    }
  }

  if (source === "soft") return "methodology";
  return null;
}

function sortWithinCategory(
  categoryId: DevSkillCategoryId,
  items: string[],
): string[] {
  const preferred = config.preferredOrder[categoryId] ?? [];
  const preferredKeys = new Map(
    preferred.map((name, index) => [normalizeSkillMatch(name), index]),
  );

  return [...items].sort((a, b) => {
    const ia = preferredKeys.get(normalizeSkillMatch(a));
    const ib = preferredKeys.get(normalizeSkillMatch(b));
    if (ia !== undefined && ib !== undefined) return ia - ib;
    if (ia !== undefined) return -1;
    if (ib !== undefined) return 1;
    return a.localeCompare(b, "fr", { sensitivity: "base" });
  });
}

/** Regroupe les listes du formulaire en lignes « Compétences clés » (template classique dev). */
export function classifySkillsForClassicDev(
  technicalSkills: string[],
  tools: string[],
  softSkills: string[],
): DevSkillRow[] {
  const techIn = technicalSkills.map((s) => s.trim()).filter(Boolean);
  const toolsIn = tools.map((s) => s.trim()).filter(Boolean);
  const softIn = softSkills.map((s) => s.trim()).filter(Boolean);

  const seen = new Set<string>();
  const buckets = Object.fromEntries(
    config.displayOrder.map(({ id }) => [id, new Set<string>()]),
  ) as Record<DevSkillCategoryId, Set<string>>;

  const addToBucket = (categoryId: DevSkillCategoryId, raw: string) => {
    const key = normalizeSkillMatch(raw);
    if (!key || seen.has(key)) return;
    seen.add(key);
    buckets[categoryId].add(raw.trim());
  };

  for (const raw of [...techIn, ...toolsIn]) {
    const category = classifySkill(raw, "tech");
    addToBucket(category ?? "other", raw);
  }

  for (const raw of softIn) {
    const category = classifySkill(raw, "soft");
    addToBucket(category ?? "methodology", raw);
  }

  const rows: DevSkillRow[] = [];
  for (const { id, label } of config.displayOrder) {
    const items = sortWithinCategory(id, [...buckets[id]]);
    if (items.length > 0) rows.push({ label, items });
  }

  return rows;
}
