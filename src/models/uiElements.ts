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
  | TextUIElement
  | KeyValueListUIElement;

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
  items?: SingleSelectionUIElementItem[]; // Alias für options für Kompatibilität
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
  type?: 'SWITCH' | 'CHECKBOX' | 'DROPDOWN' | 'RADIO' | 'BUTTONGROUP';
  field_id: FieldId;
  default_value?: boolean;
  options?: {
    true_label?: TranslatableString;
    false_label?: TranslatableString;
  };
}

export interface StringUIElement extends UIElementEdit {
  pattern_type: 'StringUIElement';
  type: 'TEXT' | 'TEXT_AREA';
  field_id: FieldId;
  length_minimum?: number;
  length_maximum?: number;
  rows?: number;
  default_value?: string;
  placeholder?: TranslatableString;
  multiline?: boolean;
  pattern?: string;
}

export interface NumberUIElement extends UIElementEdit {
  pattern_type: 'NumberUIElement';
  type?: 'INTEGER' | 'DOUBLE';
  field_id: FieldId;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  default?: number;
  default_value?: number;
}

export interface DateUIElement extends UIElementEdit {
  pattern_type: 'DateUIElement';
  field_id: FieldId;
  type: 'YEAR' | 'MONTH' | 'DAY' | 'HOUR' | 'MINUTE' | 'YMD';
  minimum?: string;
  maximum?: string;
  default_value?: string;
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
  type: 'SLAB' | 'WINDOW' | 'DOOR' | 'WALL' | 'ROOM' | 'ROOM_GROUP' | 'POI' | 'POI_PHOTO';
  elements: any[]; // PatternLibraryElement[]
}

export interface ChipGroupUIElement extends UIElementEdit {
  pattern_type: 'ChipGroupUIElement';
  chips: BooleanUIElement[];
}

export interface KeyValueListUIElement extends UIElementEdit {
  pattern_type: 'KeyValueListUIElement';
  type: 'TABLE';
  items: KeyValueListItem[];
}

export interface KeyValueListItem {
  key: TranslatableString;
  field_value: {
    field_id: FieldId;
  };
  icon?: string;
}
