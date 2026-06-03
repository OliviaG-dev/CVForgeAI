const ENGLISH_CONTEXT_LABELS: Record<string, string> = {
  professional: "Professionnel",
  internationalTeam: "Équipe internationale",
  technicalDaily: "Daily & Syncs techniques",
};

export function formatLanguageLevelDetail(
  level: string,
  englishContexts?: string[],
): string {
  const labels = (englishContexts ?? [])
    .map((id) => ENGLISH_CONTEXT_LABELS[id])
    .filter(Boolean);
  if (labels.length === 0) return level;
  return `${level} — ${labels.join(", ")}`;
}
