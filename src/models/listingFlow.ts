import { UIElement } from './uiElements';

export interface TranslatableString {
  [key: string]: string;
}

export interface ListingFlow {
  id: string;
  'url-key': string;
  name: string;
  title: TranslatableString;
  icon: string;
  pages_edit: Page[];
  pages_view: Page[];
  // Optionaler Modul-Katalog dieses Flows. Fehlt er / leer = keine Module (heutiges Verhalten).
  // Aktiviert wird ein Modul über das Boolean-Feld `module_<id>_active`; mit `module_id`
  // getaggte Seiten/Elemente sind nur sichtbar, wenn ihr Modul aktiv ist.
  modules?: Module[];
  // Semver-artige Version des Flow-Artefakts. Relevant für CATALOG-Modul-Artefakte
  // (eigenständige flow-förmige JSONs), damit veraltete Caches erkannt werden.
  version?: string;
}

// Ein optional pro Projekt aktivierbares Modul eines Flows (z. B. ISFP, Heizlast,
// Hydraulischer Abgleich). Bündelt zusätzliche Seiten/Felder, die ein Projekt bei Bedarf
// — auch nachträglich — aktivieren kann.
export interface Module {
  // Stabile id; Aktivierungs-Feld eines Projekts heißt `module_<id>_active`.
  id: string;
  // Anzeigename des Moduls (übersetzt).
  name: TranslatableString;
  // Kurzbeschreibung für den Auswahl-/Katalog-Dialog (übersetzt).
  description: TranslatableString;
  // mdi-Icon-Name für die Modul-Darstellung.
  icon?: string;
  // Wenn true, ist das Modul bei der Projektanlage vorausgewählt.
  default_active?: boolean;
  // Auslieferungsart: INLINE (im Flow enthalten, Default) oder CATALOG
  // (separates Artefakt, nachladbar und offline-cachebar).
  delivery?: 'INLINE' | 'CATALOG';
  // Semver-artige Version des Modul-Artefakts. Nur für CATALOG-Module gesetzt.
  version?: string;
}

export interface Page {
  pattern_type: string; // Im alten Schema "Page", im doorbit_esg.json Schema "CustomUIElement"
  id: string;
  layout?: string; // z.B. "2_COL_RIGHT_FILL" für Edit-Seiten, "2_COL_RIGHT_WIDER" für View-Seiten
  related_pages?: RelatedPage[]; // Verknüpfung zu korrespondierenden View- oder Edit-Seiten
  short_title?: TranslatableString;
  title?: TranslatableString;
  icon?: string;
  elements: PatternLibraryElement[];
  // Visibility-Bedingung für die Seite
  visibility_condition?: VisibilityCondition;
  // Weitere Eigenschaften für doorbit_esg.json Kompatibilität
  sub_flows?: SubFlow[];
  related_custom_ui_element_id?: string;
  type?: string;
  // Markiert diese Seite als Teil des Moduls mit dieser id (→ ListingFlow.modules[].id).
  // Die Seite ist dann nur sichtbar, wenn das Modul aktiv ist (`module_<id>_active === true`).
  // null/absent = gehört zu keinem Modul (immer sichtbar).
  module_id?: string;
}

export interface SubFlow {
  type: string; // z.B. "POI", "ROOM", "POI_PHOTO", "ROOM_GROUP" etc.
  elements: PatternLibraryElement[];
}

export interface RelatedPage {
  viewing_context: 'VIEW' | 'EDIT';
  page_id: string;
}

export interface PatternLibraryElement {
  element: UIElement;
}

export interface UIElementBase {
  pattern_type: string;
  uuid?: string; // Eindeutige ID für jedes UI-Element
  visibility_condition?: VisibilityCondition;
  tree_level?: number;
  display_position?: 'LEFT' | 'RIGHT';
  display_variant?: 'DEFAULT' | 'FULLSCREEN';
  // Markiert dieses Element (und seinen Teilbaum) als Teil des Moduls mit dieser id
  // (→ ListingFlow.modules[].id). Sichtbarkeit wird automatisch an die Modul-Aktivierung
  // (Feld `module_<id>_active`) gekoppelt. null/absent = modul-unabhängig (immer sichtbar).
  // Gilt via Vererbung für alle UIElement-Typen inkl. GroupUIElement.
  module_id?: string;
}

export interface UIElementEdit extends UIElementBase {
  required: boolean;
  title?: TranslatableString;
  short_title?: TranslatableString;
  description?: TranslatableString;
  example_image?: string;
  icon?: string;
}

export type VisibilityCondition = LogicalOperator | RelationalContextOperator | RelationalFieldOperator;

export interface Operator {
  operator_type: string;
}

export interface LogicalOperator extends Operator {
  operator: 'AND' | 'OR' | 'NOT';
  conditions: VisibilityCondition[];
}

export interface RelationalContextOperator extends Operator {
  context: 'CREATE' | 'EDIT' | 'VIEW' | 'BACK_OFFICE';
}

export interface RelationalFieldOperator extends Operator {
  field_id: FieldId;
  op: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin';
  value?: any;
  value_list?: any[];
}

export interface FieldId {
  field_name: string;
}
