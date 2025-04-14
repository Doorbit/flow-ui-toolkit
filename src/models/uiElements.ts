import { TranslatableString, UIElementEdit, FieldId } from './listingFlow';

export type UIElement =
  | BooleanUIElement
  | SingleSelectionUIElement
  | ChipGroupUIElement
  | StringUIElement
  | NumberUIElement
  | DateUIElement
  | CustomUIElement
  | FileUIElement
  | ArrayUIElement
  | GroupUIElement
  | TextUIElement;

export interface TextUIElement extends UIElementEdit {
  pattern_type: 'TextUIElement';
  type: 'PARAGRAPH' | 'HEADING';
  text: TranslatableString;
}

export interface SingleSelectionUIElement extends UIElementEdit {
  pattern_type: 'SingleSelectionUIElement';
  type?: 'BUTTONGROUP' | 'DROPDOWN';
  field_id: FieldId;
  options: SingleSelectionUIElementItem[];
  default?: string;
  sorting?: 'ASC';
  other_user_value?: SingleSelectionUIElementItemOther;
}

export interface SingleSelectionUIElementItem {
  key: string;
  label?: TranslatableString;
  short_title?: TranslatableString;
  description?: TranslatableString;
  visibility_condition?: any;
  icon?: string;
  example_image?: string;
  display_position?: 'LEFT' | 'RIGHT';
}

export interface SingleSelectionUIElementItemOther {
  activates_on_value_selection: string;
  text_ui_element: StringUIElement;
}

export interface BooleanUIElement extends UIElementEdit {
  pattern_type: 'BooleanUIElement';
  field_id: FieldId;
  default_value?: boolean;
}

export interface StringUIElement extends UIElementEdit {
  pattern_type: 'StringUIElement';
  type: 'TEXT' | 'TEXT_AREA';
  field_id: FieldId;
  length_minimum?: number;
  length_maximum?: number;
  rows?: number;
}

export interface NumberUIElement extends UIElementEdit {
  pattern_type: 'NumberUIElement';
  type?: 'INTEGER' | 'DOUBLE';
  field_id: FieldId;
  unit?: string;
  minimum?: number;
  maximum?: number;
}

export interface DateUIElement extends UIElementEdit {
  pattern_type: 'DateUIElement';
  field_id: FieldId;
  type: 'YEAR' | 'MONTH' | 'DAY' | 'HOUR' | 'MINUTE';
  minimum?: string;
  maximum?: string;
}

export interface FileUIElement extends UIElementEdit {
  pattern_type: 'FileUIElement';
  file_type?: 'IMAGE' | 'FILE';
  allowed_file_types: string[];
  id_field_id: FieldId;
  caption_field_id?: FieldId;
  min_count?: number;
  max_count?: number;
}

export interface GroupUIElement extends UIElementEdit {
  pattern_type: 'GroupUIElement';
  isCollapsible?: boolean;
  elements: any[]; // PatternLibraryElement[]
}

export interface ArrayUIElement extends UIElementEdit {
  pattern_type: 'ArrayUIElement';
  min_count: number;
  max_count: number;
  elements: any[]; // PatternLibraryElement[]
}

export interface CustomUIElement extends UIElementEdit {
  pattern_type: 'CustomUIElement';
  id?: string;
  related_custom_ui_element_id?: string;
  type?: 'SCANNER' | 'ADDRESS' | 'LOCATION' | 'ADMIN_BOUNDARY' | string;
  elements?: any[]; // PatternLibraryElement[]
  sub_flows?: SubFlow[];
}

export interface SubFlow {
  type: 'SLAB' | 'WINDOW' | 'DOOR' | 'WALL' | 'ROOM';
  elements: any[]; // PatternLibraryElement[]
}

export interface ChipGroupUIElement extends UIElementEdit {
  pattern_type: 'ChipGroupUIElement';
  chips: BooleanUIElement[];
}
