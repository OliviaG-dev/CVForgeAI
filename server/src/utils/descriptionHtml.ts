function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Normalise les caractères de puce copiés depuis Word / PDF. */
function normalizeDescriptionText(desc: string): string {
  return desc
    .replace(/\r\n/g, "\n")
    .replace(/[\uE000-\uF8FF\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

/** Découpe ligne par ligne (format classique). */
function parsePlainLines(desc: string): string[] {
  const text = normalizeDescriptionText(desc);
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-•–●]\s*/, "").trim())
    .filter(Boolean);
}

/** Découpe une description en entrées (puces ●/• ou lignes). */
export function parseDescriptionItems(desc: string): string[] {
  const text = normalizeDescriptionText(desc);
  if (!text) return [];

  const hasInlineBullets = /[●•]/.test(text);
  if (hasInlineBullets) {
    const parts = text
      .split(/\s*[●•]\s+/)
      .map((p) => p.replace(/\n+/g, " ").trim())
      .filter(Boolean);
    if (parts.length > 1) return parts;
  }

  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-•–●]\s*/, "").trim())
    .filter(Boolean);
}

function formatStructuredLine(line: string): string {
  const cleaned = line.replace(/^[-•–●]\s*/, "").trim();
  const colonIdx = cleaned.indexOf(":");
  if (colonIdx > 0 && colonIdx <= 120) {
    const title = cleaned.slice(0, colonIdx).trim();
    const body = cleaned.slice(colonIdx + 1).trim();
    if (body) {
      return `<li><strong>${esc(title)}</strong> : ${esc(body)}</li>`;
    }
    return `<li><strong>${esc(title)}</strong></li>`;
  }
  return `<li>${esc(cleaned)}</li>`;
}

function formatPlainLine(line: string): string {
  return `<li>${esc(line.replace(/^[-•–●]\s*/, "").trim())}</li>`;
}

export function descriptionToHtml(
  desc: string,
  structuredFlag?: boolean,
): string {
  const structured = structuredFlag === true;
  const items = structured ? parseDescriptionItems(desc) : parsePlainLines(desc);
  if (items.length === 0) return "";
  const listClass = structured ? "desc-list desc-list--structured" : "desc-list";
  const itemsHtml = items
    .map((line) => (structured ? formatStructuredLine(line) : formatPlainLine(line)))
    .join("");

  return `<ul class="${listClass}">${itemsHtml}</ul>`;
}
