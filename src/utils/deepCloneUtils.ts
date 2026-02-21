import { v4 as uuidv4 } from 'uuid';
import { PatternLibraryElement, Page } from '../models/listingFlow';

/**
 * Optionen für das Deep-Cloning von Elementen
 */
export interface DeepCloneElementOptions {
  /** true = field_ids beibehalten (z. B. beim Cross-File-Import), false = neue field_ids generieren (z. B. beim Intra-File-Kopieren) */
  preserveFieldIds: boolean;
  /** true = neue UUIDs für alle Elemente generieren */
  regenerateUUIDs: boolean;
}

/**
 * Bestimmt das Präfix für eine neue field_id basierend auf dem Element-Typ.
 * Entspricht der Logik aus App.tsx regenerateFieldIds.
 * @param patternType Der pattern_type des Elements
 * @returns Das passende Präfix
 */
function getFieldIdPrefix(patternType: string): string {
  switch (patternType) {
    case 'BooleanUIElement':
      return 'boolean_field';
    case 'StringUIElement':
      return 'string_field';
    case 'NumberUIElement':
      return 'number_field';
    case 'DateUIElement':
      return 'date_field';
    case 'SingleSelectionUIElement':
      return 'selection_field';
    case 'FileUIElement':
      return 'fileuielement';
    case 'GroupUIElement':
      return 'group_field';
    default:
      return patternType.toLowerCase().replace('uielement', '_field');
  }
}

/**
 * Generiert eine neue field_id mit dem passenden Präfix
 * @param patternType Der pattern_type des Elements
 * @returns Ein neues FieldId-Objekt
 */
function generateNewFieldId(patternType: string): { field_name: string } {
  const prefix = getFieldIdPrefix(patternType);
  return { field_name: `${prefix}_${uuidv4()}` };
}

/**
 * Deep-Cloned ein einzelnes UI-Element (die innere Ebene eines PatternLibraryElement).
 * Behandelt rekursiv alle verschachtelten Container-Typen:
 * - GroupUIElement.elements
 * - ArrayUIElement.elements
 * - ChipGroupUIElement.chips
 * - CustomUIElement.sub_flows und .elements
 * - SingleSelectionUIElement.other_user_value.text_ui_element
 *
 * @param rawElement Das rohe Element (innerhalb von PatternLibraryElement)
 * @param options Klon-Optionen
 * @returns Das geklonte Element
 */
function deepCloneRawElement(rawElement: any, options: DeepCloneElementOptions): any {
  if (!rawElement) return rawElement;

  const elem = { ...rawElement };

  // UUID regenerieren
  if (options.regenerateUUIDs) {
    elem.uuid = uuidv4();
  }

  // field_id regenerieren oder beibehalten
  if (!options.preserveFieldIds && 'field_id' in elem && elem.field_id && elem.pattern_type) {
    elem.field_id = generateNewFieldId(elem.pattern_type);
  }

  // Visibility Condition: UUIDs regenerieren (aber field_id-Referenzen NICHT ändern)
  if (elem.visibility_condition && options.regenerateUUIDs) {
    elem.visibility_condition = deepCloneVisibilityCondition(elem.visibility_condition);
  }

  // Typ-spezifische rekursive Verarbeitung
  switch (elem.pattern_type) {
    case 'GroupUIElement':
      if (elem.elements && Array.isArray(elem.elements)) {
        elem.elements = elem.elements.map((subElem: any) => {
          // Unterelemente können als PatternLibraryElement { element: ... } oder direkt vorliegen
          if (subElem && subElem.element) {
            return { element: deepCloneRawElement(subElem.element, options) };
          }
          return deepCloneRawElement(subElem, options);
        });
      }
      break;

    case 'ArrayUIElement':
      if (elem.elements && Array.isArray(elem.elements)) {
        elem.elements = elem.elements.map((subElem: any) => {
          if (subElem && subElem.element) {
            return { element: deepCloneRawElement(subElem.element, options) };
          }
          return deepCloneRawElement(subElem, options);
        });
      }
      break;

    case 'ChipGroupUIElement':
      if (elem.chips && Array.isArray(elem.chips)) {
        elem.chips = elem.chips.map((chip: any) => {
          const clonedChip = { ...chip };
          if (options.regenerateUUIDs) {
            clonedChip.uuid = uuidv4();
          }
          if (!options.preserveFieldIds && clonedChip.field_id) {
            clonedChip.field_id = { field_name: `chip_${uuidv4()}` };
          }
          return clonedChip;
        });
      }
      break;

    case 'CustomUIElement':
      // sub_flows verarbeiten
      if (elem.sub_flows && Array.isArray(elem.sub_flows)) {
        elem.sub_flows = elem.sub_flows.map((subflow: any) => {
          const clonedSubflow = { ...subflow };
          if (options.regenerateUUIDs) {
            clonedSubflow.uuid = uuidv4();
          }
          if (clonedSubflow.elements && Array.isArray(clonedSubflow.elements)) {
            clonedSubflow.elements = clonedSubflow.elements.map((subElem: any) => {
              if (subElem && subElem.element) {
                return { element: deepCloneRawElement(subElem.element, options) };
              }
              return deepCloneRawElement(subElem, options);
            });
          }
          return clonedSubflow;
        });
      }
      // Direkte elements in CustomUIElement
      if (elem.elements && Array.isArray(elem.elements)) {
        elem.elements = elem.elements.map((subElem: any) => {
          if (subElem && subElem.element) {
            return { element: deepCloneRawElement(subElem.element, options) };
          }
          return deepCloneRawElement(subElem, options);
        });
      }
      break;

    case 'SingleSelectionUIElement':
      // Options UUIDs regenerieren
      if (elem.options && Array.isArray(elem.options) && options.regenerateUUIDs) {
        elem.options = elem.options.map((option: any) => ({
          ...option,
          uuid: uuidv4(),
          visibility_condition: option.visibility_condition
            ? deepCloneVisibilityCondition(option.visibility_condition)
            : undefined,
        }));
      }
      // other_user_value.text_ui_element verarbeiten
      if (elem.other_user_value?.text_ui_element) {
        const textElem = { ...elem.other_user_value.text_ui_element };
        if (options.regenerateUUIDs) {
          textElem.uuid = uuidv4();
        }
        if (!options.preserveFieldIds && textElem.field_id) {
          textElem.field_id = { field_name: `string_field_${uuidv4()}` };
        }
        if (textElem.visibility_condition && options.regenerateUUIDs) {
          textElem.visibility_condition = deepCloneVisibilityCondition(textElem.visibility_condition);
        }
        elem.other_user_value = {
          ...elem.other_user_value,
          text_ui_element: textElem,
        };
      }
      break;

    case 'FileUIElement':
      // id_field_id und caption_field_id regenerieren
      if (!options.preserveFieldIds) {
        if (elem.id_field_id) {
          elem.id_field_id = { field_name: `file_images_id_${uuidv4()}` };
        }
        if (elem.caption_field_id) {
          elem.caption_field_id = { field_name: `file_images_caption_${uuidv4()}` };
        }
      }
      break;
  }

  return elem;
}

/**
 * Deep-Cloned eine VisibilityCondition und regeneriert deren UUIDs.
 * field_id-Referenzen in RelationalFieldOperator werden NICHT verändert.
 * @param condition Die zu klonende Sichtbarkeitsbedingung
 * @returns Die geklonte Bedingung mit neuen UUIDs
 */
function deepCloneVisibilityCondition(condition: any): any {
  if (!condition) return condition;

  const cloned = { ...condition };
  cloned.uuid = uuidv4();

  // Rekursiv durch verschachtelte Bedingungen (AND, OR, NOT)
  if (cloned.conditions && Array.isArray(cloned.conditions)) {
    cloned.conditions = cloned.conditions.map((sub: any) => deepCloneVisibilityCondition(sub));
  }

  return cloned;
}

/**
 * Deep-Cloned ein PatternLibraryElement mit allen verschachtelten Unterelementen.
 * Erstellt eine vollständige Kopie via JSON.parse(JSON.stringify(...)) und
 * regeneriert dann UUIDs und optional field_ids.
 *
 * @param element Das zu klonende PatternLibraryElement
 * @param options Klon-Optionen (preserveFieldIds, regenerateUUIDs)
 * @returns Ein neues, unabhängiges PatternLibraryElement
 */
export function deepCloneElement(
  element: PatternLibraryElement,
  options: DeepCloneElementOptions
): PatternLibraryElement {
  // Vollständige Deep-Copy via JSON um alle Referenzen zu trennen
  const deepCopy: PatternLibraryElement = JSON.parse(JSON.stringify(element));

  // Rekursiv UUIDs und field_ids verarbeiten
  const clonedInner = deepCloneRawElement(deepCopy.element, options);

  return { element: clonedInner };
}

/**
 * Deep-Cloned ein Seitenpaar (Edit + View) mit neuen Seiten-IDs.
 * Alle Element-UUIDs werden regeneriert. field_ids werden beibehalten,
 * da die Datenbindungen innerhalb der importierten Seite intakt bleiben müssen.
 * related_pages-Referenzen werden auf die neuen IDs aktualisiert.
 *
 * @param editPage Die Edit-Seite zum Klonen
 * @param viewPage Die zugehörige View-Seite (kann undefined sein, wird dann minimal erstellt)
 * @returns Ein Objekt mit den geklonten Edit- und View-Seiten
 */
export function deepClonePagePair(
  editPage: Page,
  viewPage: Page | undefined
): { editPage: Page; viewPage: Page } {
  const newUuid = uuidv4();
  const newEditId = `edit-${newUuid}`;
  const newViewId = `view-${newUuid}`;

  // Deep-Copy der Edit-Seite
  const clonedEditPage: Page = JSON.parse(JSON.stringify(editPage));
  clonedEditPage.id = newEditId;
  if (clonedEditPage.elements) {
    clonedEditPage.elements = clonedEditPage.elements.map((el: PatternLibraryElement) =>
      deepCloneElement(el, { preserveFieldIds: true, regenerateUUIDs: true })
    );
  }
  // Sub-Flows in der Edit-Seite ebenfalls klonen
  if (clonedEditPage.sub_flows) {
    clonedEditPage.sub_flows = clonedEditPage.sub_flows.map((sf: any) => {
      const clonedSf = { ...sf, uuid: uuidv4() };
      if (clonedSf.elements) {
        clonedSf.elements = clonedSf.elements.map((el: PatternLibraryElement) =>
          deepCloneElement(el, { preserveFieldIds: true, regenerateUUIDs: true })
        );
      }
      return clonedSf;
    });
  }
  // related_pages aktualisieren
  clonedEditPage.related_pages = [{
    viewing_context: 'VIEW' as const,
    page_id: newViewId,
  }];

  // Deep-Copy der View-Seite (oder minimal erstellen)
  let clonedViewPage: Page;
  if (viewPage) {
    clonedViewPage = JSON.parse(JSON.stringify(viewPage));
    clonedViewPage.id = newViewId;
    if (clonedViewPage.elements) {
      clonedViewPage.elements = clonedViewPage.elements.map((el: PatternLibraryElement) =>
        deepCloneElement(el, { preserveFieldIds: true, regenerateUUIDs: true })
      );
    }
    if (clonedViewPage.sub_flows) {
      clonedViewPage.sub_flows = clonedViewPage.sub_flows.map((sf: any) => {
        const clonedSf = { ...sf, uuid: uuidv4() };
        if (clonedSf.elements) {
          clonedSf.elements = clonedSf.elements.map((el: PatternLibraryElement) =>
            deepCloneElement(el, { preserveFieldIds: true, regenerateUUIDs: true })
          );
        }
        return clonedSf;
      });
    }
  } else {
    // Minimale View-Seite erstellen (analog zu ADD_PAGE-Reducer-Logik)
    clonedViewPage = {
      pattern_type: 'CustomUIElement',
      id: newViewId,
      layout: '2_COL_RIGHT_WIDER',
      elements: [],
      related_pages: [],
    } as Page;
  }
  clonedViewPage.related_pages = [{
    viewing_context: 'EDIT' as const,
    page_id: newEditId,
  }];

  return { editPage: clonedEditPage, viewPage: clonedViewPage };
}

/**
 * Findet alle field_id.field_name-Werte, die in Sichtbarkeitsbedingungen
 * eines Elements und seiner Unterelemente referenziert werden.
 * Nützlich für Warnungen beim Cross-File-Export: Diese Feld-Referenzen
 * existieren möglicherweise nicht in der Zieldatei.
 *
 * @param element Das zu prüfende PatternLibraryElement
 * @returns Array von referenzierten field_name-Werten
 */
export function findVisibilityFieldReferences(element: PatternLibraryElement): string[] {
  const references: Set<string> = new Set();

  function extractFromCondition(condition: any): void {
    if (!condition) return;

    // RelationalFieldOperator: hat field_id
    if (condition.operator_type === 'RFO' && condition.field_id) {
      const fieldName = typeof condition.field_id === 'string'
        ? condition.field_id
        : condition.field_id?.field_name;
      if (fieldName) {
        references.add(fieldName);
      }
    }

    // Logische Operatoren: rekursiv durch conditions
    if (condition.conditions && Array.isArray(condition.conditions)) {
      condition.conditions.forEach((sub: any) => extractFromCondition(sub));
    }
  }

  function walkElement(elem: any): void {
    if (!elem) return;

    // Visibility Condition des Elements selbst
    if (elem.visibility_condition) {
      extractFromCondition(elem.visibility_condition);
    }

    // Rekursiv durch verschachtelte Elemente
    switch (elem.pattern_type) {
      case 'GroupUIElement':
      case 'ArrayUIElement':
        if (elem.elements && Array.isArray(elem.elements)) {
          elem.elements.forEach((sub: any) => {
            if (sub && sub.element) {
              walkElement(sub.element);
            } else {
              walkElement(sub);
            }
          });
        }
        break;

      case 'ChipGroupUIElement':
        if (elem.chips && Array.isArray(elem.chips)) {
          elem.chips.forEach((chip: any) => {
            if (chip.visibility_condition) {
              extractFromCondition(chip.visibility_condition);
            }
          });
        }
        break;

      case 'CustomUIElement':
        if (elem.sub_flows && Array.isArray(elem.sub_flows)) {
          elem.sub_flows.forEach((sf: any) => {
            if (sf.elements && Array.isArray(sf.elements)) {
              sf.elements.forEach((sub: any) => {
                if (sub && sub.element) {
                  walkElement(sub.element);
                } else {
                  walkElement(sub);
                }
              });
            }
          });
        }
        if (elem.elements && Array.isArray(elem.elements)) {
          elem.elements.forEach((sub: any) => {
            if (sub && sub.element) {
              walkElement(sub.element);
            } else {
              walkElement(sub);
            }
          });
        }
        break;

      case 'SingleSelectionUIElement':
        if (elem.options && Array.isArray(elem.options)) {
          elem.options.forEach((opt: any) => {
            if (opt.visibility_condition) {
              extractFromCondition(opt.visibility_condition);
            }
          });
        }
        if (elem.other_user_value?.text_ui_element?.visibility_condition) {
          extractFromCondition(elem.other_user_value.text_ui_element.visibility_condition);
        }
        break;
    }
  }

  walkElement(element.element);
  return Array.from(references);
}

/**
 * Findet die zugehörige View-Seite zu einer Edit-Seite in einem Flow.
 * Sucht zuerst über related_pages, dann über ID-Konvention (edit- → view-).
 *
 * @param editPage Die Edit-Seite
 * @param viewPages Array aller View-Seiten im Flow
 * @returns Die zugehörige View-Seite oder undefined
 */
export function findCorrespondingViewPage(
  editPage: Page,
  viewPages: Page[]
): Page | undefined {
  // Methode 1: Über related_pages
  if (editPage.related_pages) {
    const viewRef = editPage.related_pages.find(rp => rp.viewing_context === 'VIEW');
    if (viewRef) {
      const viewPage = viewPages.find(p => p.id === viewRef.page_id);
      if (viewPage) return viewPage;
    }
  }

  // Methode 2: Über ID-Konvention (edit-xxx → view-xxx)
  if (editPage.id.startsWith('edit-')) {
    const expectedViewId = editPage.id.replace('edit-', 'view-');
    return viewPages.find(p => p.id === expectedViewId);
  }

  return undefined;
}
