/**
 * Zentrale Design-Tokens (Single Source of Truth für Farben).
 *
 * Alle Komponenten — egal ob via MUI-`sx`, styled-components oder inline-Style —
 * referenzieren Farben ausschließlich über dieses Modul, nie über hardcodierte
 * Hex-Werte. Das MUI-Theme (siehe `src/App.tsx`) wird ebenfalls aus diesen Tokens
 * gebaut, sodass Theme-Palette und freie Styles garantiert konsistent bleiben.
 *
 * Werte sind 1:1 aus dem vorherigen, über die Komponenten verstreuten Bestand
 * übernommen (reine Zentralisierung, keine visuelle Änderung). Künftige
 * Konsolidierung fast-identischer Schattierungen kann hier zentral erfolgen.
 */
export const tokens = {
  /** Corporate Branding — Grün-Ramp + Sekundär-Orange. */
  brand: {
    green: '#009F64',          // Primärgrün (palette.primary.main)
    greenLight: '#4CC695',     // palette.primary.light
    greenDark: '#005D3A',      // palette.primary.dark
    greenHover: '#008D58',     // dunkler Hover des Primärgrüns
    greenHoverAlt: '#008755',  // Hover-Variante
    greenPressed: '#008555',   // Pressed/aktiv
    greenDeep: '#007A4D',      // tiefer Akzent
    greenBright: '#43E77F',    // helles Akzentgrün (Gradient/Highlight)
    greenBrightStrong: '#35D870',
    greenBrightSoft: '#7CFFB2',
    orange: '#F05B29',         // Sekundär/Fehler (palette.secondary.main)
    orangeDark: '#D04010',     // palette.secondary.dark
    orangeLight: '#F78057',    // palette.secondary.light
    orangePressed: '#D04E24',
  },

  /** Text-Farben. */
  text: {
    primary: '#2A2E3F',        // Überschriften (palette.text.primary)
    secondary: '#343951',      // Fließtext (palette.text.secondary)
  },

  /** Flächen/Hintergründe. */
  surface: {
    appBg: '#F8FAFC',          // App-Hintergrund (palette.background.default)
    paper: '#FFFFFF',          // Karten/Dialoge (palette.background.paper)
    subtle: '#F5F5F5',         // leicht abgesetzte Fläche
    subtleAlt: '#F0F2F4',
    subtleAlt2: '#F0F0F0',
    dark: '#1E1E1E',           // dunkle Fläche (z. B. Code)
  },

  /** Neutrale Töne — Rahmen, Icons, Schwarz. */
  neutral: {
    border: '#E0E0E0',         // Standard-Rahmen (palette.grey[300])
    borderStrong: '#BDBDBD',   // palette.grey[400]
    icon: '#848BA5',           // Icon-/Sekundärgrau (palette.grey[500])
    borderCool: '#C8D6E5',     // bläulicher Rahmen
    muted: '#666666',          // gedämpftes Grau (Hinweistexte)
    nearBlack: '#111111',
    black: '#000000',
  },

  /** Akzent-Blau (Info-/Hinweis-Flächen). */
  accentBlue: {
    main: '#1976D2',
    dark: '#1565C0',
    light: '#4FC3F7',
    lightSoft: '#81D4FA',
    bg: '#E3F2FD',
    border: '#BBDEFB',
  },

  /** Akzent-Indigo. */
  accentIndigo: {
    main: '#3F51B5',
    dark: '#303F9F',
    bg: '#F0F4FF',
  },

  /** Status-Flächen (Warnung/Fehler) — eigenständig neben den Brand-Tönen. */
  status: {
    warning: '#ED6C02',
    warningBg: '#FFF8E1',
    warningBorder: '#FFECB3',
    errorBg: '#FFF8F8',
    errorBorder: '#FFCDD2',
  },
} as const;

export default tokens;
