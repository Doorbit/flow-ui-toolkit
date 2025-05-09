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
