/**
 * Validierung & Ableitung der Flow-Metadaten (`id`, `url-key`, `name`, `title`, `icon`).
 *
 * Schema-Bezug: `ListingFlow` in `portal-applications/api/rest/listing-flow-api.yaml` verlangt
 * `id`, `url-key`, `name`, `title`, `icon`. `id`/`url-key` sind technische Identifier — der Editor
 * erzwingt ein slug-artiges Format (Kleinbuchstaben, Ziffern, „-"/„_"), wie es die realen Flows
 * nutzen (z. B. `doorbit_esg`, `new-flow`). Ein flow-weites `description`-Feld existiert im Schema
 * NICHT und wird daher bewusst nicht angeboten.
 */

/** Wandelt freien Text in einen slug („Mein Flow" → „mein-flow"). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Kleinbuchstaben/Ziffern-Segmente, getrennt durch genau ein „-" oder „_".
const SLUG_RE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

/** Validiert einen technischen Identifier (id / url-key). `null` = gültig. */
export function validateSlug(value: string, fieldLabel = 'Wert'): string | null {
  const v = value.trim();
  if (!v) return `${fieldLabel} darf nicht leer sein`;
  if (!SLUG_RE.test(v)) {
    return `${fieldLabel}: nur Kleinbuchstaben, Ziffern, „-" und „_" (keine Leerzeichen)`;
  }
  return null;
}

/** Validiert ein Pflichtfeld (nicht leer). `null` = gültig. */
export function validateRequired(value: string, fieldLabel = 'Wert'): string | null {
  return value.trim() ? null : `${fieldLabel} darf nicht leer sein`;
}
