import { v4 as uuidv4 } from 'uuid';
import { ListingFlow, Page, PatternLibraryElement, VisibilityCondition } from '../models/listingFlow';
import {
  GroupUIElement,
  ArrayUIElement,
  ChipGroupUIElement,
  BooleanUIElement,
  SingleSelectionUIElement,
  SingleSelectionUIElementItem,
  SingleSelectionUIElementItemOther,
  CustomUIElement,
  SubFlow
} from '../models/uiElements';

/**
 * Rekursive Funktion, um UUIDs für alle Elemente in einem Flow sicherzustellen.
 * Fügt UUIDs zu allen Elementen hinzu, die noch keine haben, für eindeutige Identifikation.
 * @param flow Der zu verarbeitende ListingFlow
 * @returns Ein neuer ListingFlow mit sichergestellten UUIDs
 */
export const ensureUUIDs = (flow: ListingFlow): ListingFlow => {
  // Deep copy um Immutabilität zu gewährleisten
  const updatedFlow = JSON.parse(JSON.stringify(flow));

  // Edit-Seiten verarbeiten
  if (updatedFlow.pages_edit) {
    updatedFlow.pages_edit = updatedFlow.pages_edit.map((page: Page) => ensurePageUUIDs(page));
  }

  // View-Seiten verarbeiten
  if (updatedFlow.pages_view) {
    updatedFlow.pages_view = updatedFlow.pages_view.map((page: Page) => ensurePageUUIDs(page));
  }

  return updatedFlow;
};

/**
 * Verarbeitet alle Elemente einer Seite rekursiv
 * @param page Die zu verarbeitende Seite
 * @returns Eine neue Seite mit korrekten Eigenschaften
 */
const ensurePageUUIDs = (page: Page): Page => {
  // Füge eine UUID hinzu, wenn sie nicht existiert
  if (!(page as any).uuid) {
    (page as any).uuid = uuidv4();
  }

  // Wenn die Seite eine visibility_condition hat, diese verarbeiten
  if (page.visibility_condition) {
    page.visibility_condition = ensureVisibilityConditionUUIDs(page.visibility_condition);
  }

  // Elemente der Seite verarbeiten
  if (page.elements) {
    page.elements = page.elements.map(element => ensureElementUUID(element));
  }

  // SubFlows der Seite verarbeiten, falls vorhanden
  if (page.sub_flows) {
    page.sub_flows = ensureSubFlowsUUIDs(page.sub_flows as any);
  }

  return page;
};

/**
 * Stellt sicher, dass jede Sichtbarkeitsbedingung und ihre verschachtelten Bedingungen korrekt verarbeitet werden
 * @param condition Die zu verarbeitende Sichtbarkeitsbedingung
 * @returns Die aktualisierte Sichtbarkeitsbedingung
 */
const ensureVisibilityConditionUUIDs = (condition: VisibilityCondition): VisibilityCondition => {
  if (!condition) return condition;

  // Füge eine UUID hinzu, wenn sie nicht existiert
  if (!(condition as any).uuid) {
    (condition as any).uuid = uuidv4();
  }

  // Normalisiere field_id in RelationalFieldOperator
  if (condition.operator_type === 'RFO' && 'field_id' in condition) {
    const rfo = condition as any;

    // Wenn field_id ein String ist, konvertiere es in ein Objekt
    if (typeof rfo.field_id === 'string') {
      rfo.field_id = {
        field_name: rfo.field_id
      };
    }
  }

  // Für logische Operatoren (AND, OR, NOT) rekursiv durch conditions gehen
  if ('conditions' in condition && Array.isArray(condition.conditions)) {
    condition.conditions = condition.conditions.map(subCondition =>
      ensureVisibilityConditionUUIDs(subCondition)
    );
  }

  return condition;
};

/**
 * Stellt sicher, dass alle Optionen in SingleSelectionUIElement korrekt verarbeitet werden
 * @param options Die zu verarbeitenden Optionen
 * @returns Die aktualisierten Optionen
 */
const ensureSingleSelectionOptionsUUIDs = (options: SingleSelectionUIElementItem[]): SingleSelectionUIElementItem[] => {
  if (!options) return options;

  return options.map(option => {
    // Füge eine UUID hinzu, wenn sie nicht existiert
    if (!(option as any).uuid) {
      (option as any).uuid = uuidv4();
    }

    // Für verschachtelte VisibilityConditions
    if (option.visibility_condition) {
      option.visibility_condition = ensureVisibilityConditionUUIDs(option.visibility_condition);
    }

    return option;
  });
};

/**
 * Stellt sicher, dass other_user_value in SingleSelectionUIElement korrekt verarbeitet wird
 * @param otherUserValue Das zu verarbeitende other_user_value-Objekt
 * @returns Das aktualisierte other_user_value-Objekt
 */
const ensureOtherUserValueUUIDs = (otherUserValue: SingleSelectionUIElementItemOther): SingleSelectionUIElementItemOther => {
  if (!otherUserValue) return otherUserValue;

  // Füge eine UUID hinzu, wenn sie nicht existiert
  if (!(otherUserValue as any).uuid) {
    (otherUserValue as any).uuid = uuidv4();
  }

  // Eingebettete StringUIElement verarbeiten
  if (otherUserValue.text_ui_element) {
    // Füge eine UUID hinzu, wenn sie nicht existiert
    if (!otherUserValue.text_ui_element.uuid) {
      otherUserValue.text_ui_element.uuid = uuidv4();
    }

    // Stelle sicher, dass die field_id eine UUID enthält
    if (otherUserValue.text_ui_element.field_id && typeof otherUserValue.text_ui_element.field_id === 'object') {
      const fieldName = otherUserValue.text_ui_element.field_id.field_name || '';
      if (!fieldName.includes('-')) {
        otherUserValue.text_ui_element.field_id.field_name = `other_text_${uuidv4()}`;
      }
    }

    // Auch visibility_condition der StringUIElement verarbeiten
    if (otherUserValue.text_ui_element.visibility_condition) {
      otherUserValue.text_ui_element.visibility_condition =
        ensureVisibilityConditionUUIDs(otherUserValue.text_ui_element.visibility_condition);
    }
  }

  return otherUserValue;
};

/**
 * Stellt sicher, dass alle SubFlows und ihre Elemente korrekt verarbeitet werden
 * @param subFlows Die zu verarbeitenden SubFlows
 * @returns Die aktualisierten SubFlows
 */
const ensureSubFlowsUUIDs = (subFlows: SubFlow[]): SubFlow[] => {
  if (!subFlows) return subFlows;

  return subFlows.map(subFlow => {
    // Füge eine UUID hinzu, wenn sie nicht existiert
    if (!(subFlow as any).uuid) {
      (subFlow as any).uuid = uuidv4();
    }

    // Elemente im SubFlow verarbeiten
    if (subFlow.elements) {
      subFlow.elements = subFlow.elements.map(subElement =>
        ensureElementUUID(subElement)
      );
    }

    return subFlow;
  });
};

/**
 * Stellt sicher, dass ein Element und alle seine Unterelemente UUIDs haben
 * @param element Das zu verarbeitende Element
 * @returns Ein neues Element mit sichergestellten UUIDs
 */
const ensureElementUUID = (element: PatternLibraryElement): PatternLibraryElement => {
  // Füge eine UUID hinzu, wenn sie nicht existiert
  if (!element.element.uuid) {
    element.element.uuid = uuidv4();
  }

  // Normalisiere field_id, wenn es ein String ist
  if (element.element.pattern_type !== 'TextUIElement' &&
      'field_id' in element.element) {

    // Wenn field_id ein String ist, konvertiere es in ein Objekt
    if (typeof element.element.field_id === 'string') {
      element.element.field_id = {
        field_name: element.element.field_id
      };
    }

    // Stelle sicher, dass field_id ein Objekt ist und eine field_name-Eigenschaft hat
    if (element.element.field_id &&
        typeof element.element.field_id === 'object') {
      const fieldName = element.element.field_id.field_name || '';

      // Prüfe, ob die field_id bereits eine UUID enthält
      if (!fieldName.includes('-')) {
        // Wenn nicht, füge eine UUID hinzu
        element.element.field_id.field_name = `${fieldName}_${uuidv4()}`;
      }
    }
  }

  // Normalisiere id_field_id und caption_field_id für FileUIElement
  if (element.element.pattern_type === 'FileUIElement') {
    const fileElement = element.element as any;

    // Normalisiere id_field_id
    if (typeof fileElement.id_field_id === 'string') {
      fileElement.id_field_id = {
        field_name: fileElement.id_field_id
      };
    }

    // Normalisiere caption_field_id, falls vorhanden
    if (fileElement.caption_field_id && typeof fileElement.caption_field_id === 'string') {
      fileElement.caption_field_id = {
        field_name: fileElement.caption_field_id
      };
    }
  }

  // Visibility Condition für das Element verarbeiten
  if (element.element.visibility_condition) {
    element.element.visibility_condition = ensureVisibilityConditionUUIDs(element.element.visibility_condition);
  }

  // Element-spezifische Verarbeitung basierend auf dem pattern_type
  switch (element.element.pattern_type) {
    case 'GroupUIElement':
      const groupElement = element.element as GroupUIElement;
      if (groupElement.elements) {
        groupElement.elements = groupElement.elements.map(subElement => ensureElementUUID(subElement));
      }
      break;

    case 'ArrayUIElement':
      const arrayElement = element.element as ArrayUIElement;
      if (arrayElement.elements) {
        arrayElement.elements = arrayElement.elements.map(subElement => ensureElementUUID(subElement));
      }
      break;

    case 'ChipGroupUIElement':
      const chipGroupElement = element.element as ChipGroupUIElement;
      if (chipGroupElement.chips) {
        chipGroupElement.chips = chipGroupElement.chips.map(chip => {
          // Füge eine UUID hinzu, wenn sie nicht existiert
          if (!chip.uuid) {
            chip.uuid = uuidv4();
          }

          // Normalisiere field_id, wenn es ein String ist
          if (typeof chip.field_id === 'string') {
            chip.field_id = {
              field_name: chip.field_id
            };
          }

          // Stelle sicher, dass die field_id eine UUID enthält
          if (chip.field_id && typeof chip.field_id === 'object') {
            const fieldName = chip.field_id.field_name || '';
            if (!fieldName.includes('-')) {
              chip.field_id.field_name = `chip_${uuidv4()}`;
            }
          }

          return chip;
        });
      }
      break;

    case 'SingleSelectionUIElement':
      const selectionElement = element.element as SingleSelectionUIElement;
      // Options-Array verarbeiten
      if (selectionElement.options) {
        selectionElement.options = ensureSingleSelectionOptionsUUIDs(selectionElement.options);
      }
      // Other user value verarbeiten
      if (selectionElement.other_user_value) {
        selectionElement.other_user_value = ensureOtherUserValueUUIDs(selectionElement.other_user_value);
      }
      break;

    case 'CustomUIElement':
      const customElement = element.element as CustomUIElement;
      // Sub-flows verarbeiten
      if ((customElement as any).sub_flows) {
        (customElement as any).sub_flows = ensureSubFlowsUUIDs((customElement as any).sub_flows);
      }
      // Elements in CustomUIElement verarbeiten
      if ((customElement as any).elements) {
        (customElement as any).elements = (customElement as any).elements.map((subElement: PatternLibraryElement) =>
          ensureElementUUID(subElement)
        );
      }
      break;
  }

  return element;
};

/**
 * Liefert eine neue UUID für die Verwendung in UI-Elementen
 * @returns Eine neue UUID
 */
export const generateUUID = (): string => {
  return uuidv4();
};

/**
 * Transformiert ein Element für den Export, indem es die uuid-Eigenschaft entfernt
 * und die Eigenschaften in der gewünschten Reihenfolge neu anordnet, mit visibility_condition an erster Stelle.
 * @param element Das zu transformierende Element
 * @returns Das transformierte Element
 */
export const transformElementForExport = (element: any): any => {
  if (!element) return element;

  const result: any = {};

  // Visibility condition zuerst hinzufügen, falls vorhanden
  if (element.visibility_condition) {
    result.visibility_condition = element.visibility_condition;
  }

  // Alle anderen Eigenschaften außer uuid hinzufügen
  for (const key in element) {
    if (key !== 'uuid' && key !== 'visibility_condition') {
      result[key] = element[key];
    }
  }

  // Rekursiv für verschachtelte Elemente
  if (result.elements && Array.isArray(result.elements)) {
    result.elements = result.elements.map((el: any) => {
      return { element: transformElementForExport(el.element) };
    });
  }

  if (result.chips && Array.isArray(result.chips)) {
    result.chips = result.chips.map(transformElementForExport);
  }

  // KeyValueListUIElement items verarbeiten
  if (result.items && Array.isArray(result.items)) {
    result.items = result.items.map((item: any) => {
      const newItem = { ...item };
      if (newItem.uuid) {
        delete newItem.uuid;
      }
      return newItem;
    });
  }

  if (result.options && Array.isArray(result.options)) {
    result.options = result.options.map((option: any) => {
      const newOption = { ...option };
      if (newOption.uuid) {
        delete newOption.uuid;
      }
      if (newOption.visibility_condition) {
        const visibilityCondition = newOption.visibility_condition;
        delete newOption.visibility_condition;
        return { visibility_condition: visibilityCondition, ...newOption };
      }
      return newOption;
    });
  }

  return result;
};
