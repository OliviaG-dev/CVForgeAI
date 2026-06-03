/** Index mois 0-based à partir d'une chaîne YYYY ou YYYY-MM. */
function toMonthIndex(ym: string): number | null {
  if (!ym?.trim()) return null;
  const [yStr, mStr] = ym.trim().split("-");
  const year = parseInt(yStr, 10);
  if (!Number.isFinite(year)) return null;
  const month = mStr ? parseInt(mStr, 10) : 1;
  if (!Number.isFinite(month) || month < 1 || month > 12) return null;
  return year * 12 + (month - 1);
}

function currentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function resolveEndMonthIndex(end: string, options?: { current?: boolean; ongoingIfNoEnd?: boolean }): number | null {
  if (options?.current) {
    const { year, month } = currentYearMonth();
    return year * 12 + (month - 1);
  }
  const endIdx = toMonthIndex(end);
  if (endIdx !== null) return endIdx;
  if (options?.ongoingIfNoEnd) {
    const { year, month } = currentYearMonth();
    return year * 12 + (month - 1);
  }
  return null;
}

/** Durée inclusive en mois entre deux dates YYYY-MM. */
export function countInclusiveMonths(
  start: string,
  end: string,
  options?: { current?: boolean; ongoingIfNoEnd?: boolean },
): number | null {
  const startIdx = toMonthIndex(start);
  const endIdx = resolveEndMonthIndex(end, options);
  if (startIdx === null || endIdx === null) return null;
  const total = endIdx - startIdx + 1;
  if (total < 1) return null;
  return total;
}

export function formatDurationFr(totalMonths: number): string {
  if (totalMonths < 1) return "";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts: string[] = [];
  if (years > 0) {
    parts.push(years === 1 ? "1 an" : `${years} ans`);
  }
  if (months > 0) {
    parts.push(months === 1 ? "1 mois" : `${months} mois`);
  }
  if (parts.length === 0) return "1 mois";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} et ${parts[1]}`;
}

export function computeDurationLabel(
  start: string,
  end: string,
  options?: { current?: boolean; ongoingIfNoEnd?: boolean },
): string | null {
  const months = countInclusiveMonths(start, end, options);
  if (months === null) return null;
  return formatDurationFr(months);
}
