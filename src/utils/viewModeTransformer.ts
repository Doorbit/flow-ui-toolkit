import { v4 as uuidv4 } from 'uuid';
import { Page, PatternLibraryElement } from '../models/listingFlow';
import {
  FileUIElement,
  GroupUIElement,
  TextUIElement,
  KeyValueListUIElement,
  KeyValueListItem
} from '../models/uiElements';

/**
 * Transformiert eine Edit-Page automatisch in eine View-Page
 * mit intelligenter Gruppierung und Element-Transformation.
 * 
 * Strategie:
 * 1. Root-Level Input-Felder → KeyValueListUIElement (Tabelle)
 * 2. FileUIElements → TextUIElement (Heading) + ImageGalleryUIElement
 * 3. GroupUIElements → TextUIElement (Heading) + KeyValueListUIElement (Tabelle)
 * 4. Display-Elemente (TextUIElement, KeyValueListUIElement) → Bleiben unverändert
 */
export function transformEditPageToViewPage(editPage: Page): Page {
  const viewElements: PatternLibraryElement[] = [];
  
  // Sammle Elemente nach Typ
  const rootLevelFields: PatternLibraryElement[] = [];
  const fileElements: PatternLibraryElement[] = [];
  const groupElements: PatternLibraryElement[] = [];
  
  // Kategorisiere Elemente
  editPage.elements?.forEach(elem => {
    const element = elem.element;
    
    if (element.pattern_type === 'FileUIElement') {
      fileElements.push(elem);
    } else if (element.pattern_type === 'GroupUIElement') {
      groupElements.push(elem);
    } else if (isInputElement(element)) {
      rootLevelFields.push(elem);
    } else if (element.pattern_type === 'TextUIElement' || 
               element.pattern_type === 'KeyValueListUIElement') {
      // Display-Elemente bleiben unverändert
      viewElements.push(elem);
    }
  });
  
  // 1. Haupt-Tabelle für Root-Level-Felder
  if (rootLevelFields.length > 0) {
    const mainTableItems = rootLevelFields
      .map(elem => transformToKeyValueListItem(elem.element))
      .filter(item => item !== null) as KeyValueListItem[];
    
    if (mainTableItems.length > 0) {
      viewElements.push(createKeyValueListElement(mainTableItems));
    }
  }
  
  // 2. File-Sections (Bilder-Galerien)
  fileElements.forEach(fileElem => {
    const fileElement = fileElem.element as FileUIElement;
    viewElements.push(...createImageGallerySection(fileElement));
  });
  
  // 3. Group-Sections
  groupElements.forEach(groupElem => {
    const groupElement = groupElem.element as GroupUIElement;
    viewElements.push(...createGroupSection(groupElement));
  });
  
  // Erstelle View-Page
  const viewPage: Page = {
    ...editPage,
    id: editPage.id.replace('edit-', 'view-'),
    icon: editPage.icon || '', // View-Pages haben oft Icons
    elements: viewElements,
    related_pages: [{
      viewing_context: 'EDIT',
      page_id: editPage.id
    }]
  };
  
  return viewPage;
}

/**
 * Prüft, ob ein Element ein Input-Element ist
 */
function isInputElement(element: any): boolean {
  return [
    'BooleanUIElement',
    'SingleSelectionUIElement',
    'StringUIElement',
    'NumberUIElement',
    'DateUIElement',
    'ChipGroupUIElement'
  ].includes(element.pattern_type);
}

/**
 * Transformiert ein Input-Element zu einem KeyValueListItem
 */
function transformToKeyValueListItem(element: any): KeyValueListItem | null {
  if (!element.field_id || !element.title) {
    return null;
  }
  
  return {
    key: element.title,
    field_value: {
      field_id: element.field_id
    },
    icon: element.icon
  };
}

/**
 * Erstellt ein KeyValueListUIElement aus Items
 */
function createKeyValueListElement(items: KeyValueListItem[]): PatternLibraryElement {
  const keyValueList: KeyValueListUIElement = {
    pattern_type: 'KeyValueListUIElement',
    type: 'TABLE',
    items: items,
    title: {
      de: 'Neues KeyValueListUIElement',
      en: 'New KeyValueListUIElement'
    },
    required: false
  };

  return { element: keyValueList };
}

/**
 * Erstellt eine Image-Gallery-Section aus einem FileUIElement
 */
function createImageGallerySection(fileElement: FileUIElement): PatternLibraryElement[] {
  const heading: TextUIElement = {
    pattern_type: 'TextUIElement',
    type: 'HEADING',
    display_position: 'RIGHT',
    text: fileElement.title || { de: 'Bilder', en: 'Images' },
    title: {
      de: 'Neues TextUIElement',
      en: 'New TextUIElement'
    },
    required: false
  };

  const gallery: any = {
    pattern_type: 'ImageGalleryUIElement',
    preferred_size: 'M',
    display_position: 'RIGHT',
    id_field_value: {
      field_id: fileElement.id_field_id
    },
    field_id: {
      field_name: `imagegalleryuielement_${uuidv4()}`
    },
    title: {
      de: 'Neues ImageGalleryUIElement',
      en: 'New ImageGalleryUIElement'
    }
  };

  return [
    { element: heading },
    { element: gallery }
  ];
}

/**
 * Erstellt eine Group-Section aus einem GroupUIElement
 */
function createGroupSection(groupElement: GroupUIElement): PatternLibraryElement[] {
  const heading: TextUIElement = {
    pattern_type: 'TextUIElement',
    type: 'HEADING',
    text: groupElement.title || { de: 'Gruppe', en: 'Group' },
    title: {
      de: 'Neues TextUIElement',
      en: 'New TextUIElement'
    },
    required: false
  };

  // Transformiere alle Kinder zu KeyValueListItems
  const items: KeyValueListItem[] = [];

  groupElement.elements?.forEach(childElem => {
    const child = childElem.element;

    if (child.pattern_type === 'FileUIElement') {
      // FileUIElements in Groups werden separat behandelt
      return;
    }

    const item = transformToKeyValueListItem(child);
    if (item) {
      items.push(item);
    }
  });

  const result: PatternLibraryElement[] = [{ element: heading }];

  if (items.length > 0) {
    result.push(createKeyValueListElement(items));
  }

  // Füge FileUIElements aus der Gruppe hinzu
  groupElement.elements?.forEach(childElem => {
    if (childElem.element.pattern_type === 'FileUIElement') {
      result.push(...createImageGallerySection(childElem.element as FileUIElement));
    }
  });

  return result;
}

