import { tokens } from '../../theme/tokens';

/**
 * Seiten-Layouts, die das portal tatsächlich rendert.
 *
 * Quelle der Wahrheit: `portal-applications` → `d-fc-page-default.vue` verzweigt ausschließlich auf
 * `null` (= Standard), `2_COL_RIGHT_WIDER` und `2_COL_RIGHT_FILL`. Jeder andere Layout-Wert läuft
 * dort in `d-fc-unknown-type` (unbekannter Typ). Der Editor darf deshalb nur diese Werte anbieten —
 * früher angebotene Werte (`2_COL_LEFT_WIDER`, `1_COL`) waren Schema-Drift.
 *
 * Ein abwesendes `layout` entspricht „Standard"; im Select wird das über den leeren String
 * repräsentiert und beim Speichern wieder zu `undefined` (statt `''`) gemappt.
 */
export const PAGE_LAYOUT_STANDARD = '';

export interface PageLayoutOption {
  value: string; // '' = Standard (kein layout-Feld gesetzt)
  label: string;
  description: string;
}

export const SUPPORTED_PAGE_LAYOUTS: PageLayoutOption[] = [
  {
    value: PAGE_LAYOUT_STANDARD,
    label: 'Standard (zentriert)',
    description: 'Kein layout-Feld gesetzt. Die rechte Spalte wird zentriert dargestellt.',
  },
  {
    value: '2_COL_RIGHT_WIDER',
    label: '2-spaltig, rechts breiter',
    description: 'Zwei Spalten; die rechte Spalte wird breiter zentriert dargestellt.',
  },
  {
    value: '2_COL_RIGHT_FILL',
    label: '2-spaltig, rechts gefüllt',
    description: 'Zwei Spalten; genau ein rechtes Element füllt die gesamte rechte Spalte.',
  },
];

/** Layout-Werte, die ein gesetztes `layout`-Feld haben dürfen (ohne den Standard/leer-Fall). */
export const SUPPORTED_LAYOUT_VALUES: string[] = SUPPORTED_PAGE_LAYOUTS.map((o) => o.value).filter(
  (v) => v !== PAGE_LAYOUT_STANDARD
);

/**
 * Prüft, ob ein Layout-Wert von portal gerendert werden kann.
 * Abwesend/leer (= Standard) gilt als unterstützt.
 */
export function isSupportedLayout(value?: string | null): boolean {
  if (value == null || value === PAGE_LAYOUT_STANDARD) return true;
  return SUPPORTED_LAYOUT_VALUES.includes(value);
}

/** Normalisiert einen Select-Wert für die Persistenz: leerer String → `undefined`. */
export function layoutForPersistence(value: string): string | undefined {
  return value === PAGE_LAYOUT_STANDARD ? undefined : value;
}

/** Farbpaar für die Layout-Vorschau (Rahmen + gefüllter Block). */
export const LAYOUT_PREVIEW_COLORS = {
  frame: tokens.neutral.border,
  block: tokens.brand.green,
  muted: tokens.surface.subtle,
} as const;
