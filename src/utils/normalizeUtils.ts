import { ListingFlow } from '../models/listingFlow';
import { v4 as uuidv4 } from 'uuid';

/**
 * Maps abbreviated type values to their full counterparts for different element types
 */
const TYPE_MAPPINGS: Record<string, Record<string, string>> = {
  DateUIElement: {
    // enion_esg.json ist die Referenz: es verwendet die Kurzformen 'Y', 'YM', 'YMD'.
    // Neue Flows sollen ausschließlich diese Werte nutzen.
    'Y': 'Y',
    'YM': 'YM',
    'YMD': 'YMD',

    // Rückwärtskompatibilität: ältere Flows oder Beispiel-Dateien können noch
    // Langformen wie 'YEAR', 'MONTH', 'DAY' oder 'DATE' enthalten.
    // Diese werden hier auf die neuen Kurzformen abgebildet.
    YEAR: 'Y',
    MONTH: 'YM',
    DAY: 'YMD',
    DATE: 'YMD',
  },
  BooleanUIElement: {
    'TOGGLE': 'SWITCH', // Falls in manchen JSONs TOGGLE statt SWITCH verwendet wird
    'RADIO_BUTTON': 'RADIO', // Normalisierung von RADIO_BUTTON zu RADIO
    'CHECK': 'CHECKBOX', // Weitere mögliche Variante
    'BOOL': 'CHECKBOX', // Weitere mögliche Variante
  },
  SingleSelectionUIElement: {
    'BUTTON_GROUP': 'BUTTONGROUP', // Normalisierung von BUTTON_GROUP zu BUTTONGROUP
    'RADIO_GROUP': 'BUTTONGROUP', // Weitere mögliche Variante
    'SELECT': 'DROPDOWN', // Weitere mögliche Variante
    'COMBOBOX': 'DROPDOWN', // Weitere mögliche Variante
  },
  NumberUIElement: {
    'INT': 'INTEGER', // Falls in manchen JSONs INT statt INTEGER verwendet wird
    'FLOAT': 'DOUBLE', // Falls in manchen JSONs FLOAT statt DOUBLE verwendet wird
    'DECIMAL': 'DOUBLE', // Weitere mögliche Variante
    'NUMBER': 'INTEGER', // Weitere mögliche Variante
    'REAL': 'DOUBLE', // Weitere mögliche Variante
  },
  FileUIElement: {
    'IMG': 'IMAGE', // Falls in manchen JSONs IMG statt IMAGE verwendet wird
    'PHOTO': 'IMAGE', // Weitere mögliche Variante
    'DOCUMENT': 'FILE', // Weitere mögliche Variante
    'DOC': 'FILE', // Weitere mögliche Variante
    'ATTACHMENT': 'FILE', // Weitere mögliche Variante
  },
  TextUIElement: {
    'TEXT': 'PARAGRAPH', // Falls in manchen JSONs TEXT statt PARAGRAPH verwendet wird
    'H1': 'HEADING', // Weitere mögliche Variante
    'H2': 'HEADING', // Weitere mögliche Variante
    'HEADER': 'HEADING', // Weitere mögliche Variante
    'TITLE': 'HEADING', // Weitere mögliche Variante
    'PLAIN': 'PARAGRAPH', // Weitere mögliche Variante
  },
  StringUIElement: {
    'TEXTAREA': 'TEXT_AREA', // Normalisierung von TEXTAREA zu TEXT_AREA
    'INPUT': 'TEXT', // Normalisierung von INPUT zu TEXT
    'MULTILINE': 'TEXT_AREA', // Weitere mögliche Variante
    'SINGLE_LINE': 'TEXT', // Weitere mögliche Variante
    'PASSWORD': 'PASSWORD', // Weitere mögliche Variante
    'EMAIL': 'EMAIL', // Weitere mögliche Variante
  },
  CustomUIElement: {
    'SCANNER': 'SCANNER', // Standardisierung von CustomUIElement-Typen
    'ADDRESS': 'ADDRESS', // Standardisierung von CustomUIElement-Typen
    'LOCATION': 'LOCATION', // Standardisierung von CustomUIElement-Typen
    'ADMIN_BOUNDARY': 'ADMIN_BOUNDARY', // Standardisierung von CustomUIElement-Typen
    'ENVIRONMENT': 'ENVIRONMENT', // Standardisierung von CustomUIElement-Typen
  },
};

/**
 * Normalisiert Elementtypen in einem ListingFlow-Objekt
 * @param flow Das zu normalisierende ListingFlow-Objekt
 * @param ensureFieldIds Ob field_ids sichergestellt werden sollen (Standard: true)
 * @returns Das normalisierte ListingFlow-Objekt
 */
export const normalizeElementTypes = (flow: ListingFlow, ensureFieldIds: boolean = true): ListingFlow => {
  // Deep copy erstellen, um das Original nicht zu verändern
  const normalizedFlow = JSON.parse(JSON.stringify(flow));

  // Stelle sicher, dass die Grundstruktur vorhanden ist
  if (!normalizedFlow.id) {
    normalizedFlow.id = `flow_${uuidv4()}`;
  }

  if (!normalizedFlow.pages_edit) {
    normalizedFlow.pages_edit = [];
  }

  if (!normalizedFlow.pages_view) {
    normalizedFlow.pages_view = normalizedFlow.pages_edit;
  }

  // pages_edit normalisieren
  if (normalizedFlow.pages_edit) {
    normalizedFlow.pages_edit = normalizedFlow.pages_edit.map((page: any) => {
      // Stelle sicher, dass die Seite eine ID hat
      if (!page.id) {
        page.id = `page_${uuidv4()}`;
      }

      // Stelle sicher, dass die Seite einen Titel hat
      if (!page.title) {
        page.title = { de: 'Neue Seite', en: 'New Page' };
      } else if (typeof page.title === 'string') {
        const titleText = page.title;
        page.title = { de: titleText, en: titleText };
      }

      // Stelle sicher, dass elements ein Array ist
      if (!page.elements) {
        page.elements = [];
      }

      // Normalisiere die Elemente
      if (page.elements) {
        page.elements = page.elements.map((elementWrapper: any) => {
          // Prüfe, ob das Element bereits ein PatternLibraryElement ist
          if (elementWrapper.element) {
            return { element: normalizeElement(elementWrapper.element, ensureFieldIds) };
          } else {
            // Wenn nicht, wickle es ein
            return { element: normalizeElement(elementWrapper, ensureFieldIds) };
          }
        });
      }

      // Auch sub_flows normalisieren, falls vorhanden
      if (page.sub_flows) {
        page.sub_flows = page.sub_flows.map((subFlow: any) => {
          // Stelle sicher, dass der Subflow einen type hat
          if (!subFlow.type) {
            subFlow.type = 'SUBFLOW';
          }

          // Stelle sicher, dass elements ein Array ist
          if (!subFlow.elements) {
            subFlow.elements = [];
          }

          if (subFlow.elements) {
            subFlow.elements = subFlow.elements.map((elementWrapper: any) => {
              // Prüfe, ob das Element bereits ein PatternLibraryElement ist
              if (elementWrapper.element) {
                return { element: normalizeElement(elementWrapper.element, ensureFieldIds) };
              } else {
                // Wenn nicht, wickle es ein
                return { element: normalizeElement(elementWrapper, ensureFieldIds) };
              }
            });
          }
          return subFlow;
        });
      }

      return page;
    });
  }

  // pages_view normalisieren
  if (normalizedFlow.pages_view) {
    normalizedFlow.pages_view = normalizedFlow.pages_view.map((page: any) => {
      // Stelle sicher, dass die Seite eine ID hat
      if (!page.id) {
        page.id = `page_${uuidv4()}`;
      }

      // Stelle sicher, dass die Seite einen Titel hat
      if (!page.title) {
        page.title = { de: 'Neue Seite', en: 'New Page' };
      } else if (typeof page.title === 'string') {
        const titleText = page.title;
        page.title = { de: titleText, en: titleText };
      }

      // Stelle sicher, dass elements ein Array ist
      if (!page.elements) {
        page.elements = [];
      }

      // Normalisiere die Elemente
      if (page.elements) {
        page.elements = page.elements.map((elementWrapper: any) => {
          // Prüfe, ob das Element bereits ein PatternLibraryElement ist
          if (elementWrapper.element) {
            return { element: normalizeElement(elementWrapper.element, ensureFieldIds) };
          } else {
            // Wenn nicht, wickle es ein
            return { element: normalizeElement(elementWrapper, ensureFieldIds) };
          }
        });
      }
      return page;
    });
  }

  // Validiere die Struktur
  const validationResult = validateFlowStructure(normalizedFlow);
  if (!validationResult.valid) {
    console.warn('[normalizeElementTypes] Validierungsfehler:', validationResult.errors);
  }

  return normalizedFlow;
};

/**
 * Normalisiert ein einzelnes Element und seine verschachtelten Elemente
 * @param element Das zu normalisierende Element
 * @param ensureFieldId Ob eine field_id sichergestellt werden soll (Standard: true)
 * @returns Das normalisierte Element
 */
const normalizeElement = (element: any, ensureFieldId: boolean = true): any => {
  if (!element) {
    return element;
  }

  // Wenn das Element kein pattern_type hat, aber einen type hat, könnte es ein Subflow sein
  if (!element.pattern_type && element.type) {
    // Normalisiere Subflow-Elemente
    if (element.elements) {
      element.elements = element.elements.map((elementWrapper: any) => {
        // Prüfe, ob das Element bereits ein PatternLibraryElement ist
        if (elementWrapper.element) {
          return { element: normalizeElement(elementWrapper.element, ensureFieldId) };
        } else {
          // Wenn nicht, wickle es ein
          return { element: normalizeElement(elementWrapper, ensureFieldId) };
        }
      });
    }
    return element;
  }

  // Wenn das Element kein pattern_type hat und auch keinen type, können wir es nicht normalisieren
  if (!element.pattern_type) {
    return element;
  }

  const patternType = element.pattern_type;
  const typeMapping = TYPE_MAPPINGS[patternType];

  // Stelle sicher, dass eine field_id vorhanden ist
  if (ensureFieldId && !element.field_id) {
    console.log(`[normalizeElement] Erzeuge field_id für ${patternType}`);
    element.field_id = { field_name: `${patternType.toLowerCase()}_${uuidv4()}` };
  }

  // Stelle sicher, dass title vorhanden ist
  if (!element.title) {
    element.title = { de: `Neues ${patternType}`, en: `New ${patternType}` };
  } else if (typeof element.title === 'string') {
    // Wenn title ein String ist, konvertiere es zu einem Objekt
    const titleText = element.title;
    element.title = { de: titleText, en: titleText };
  } else if (!element.title.de && element.title.en) {
    // Wenn nur der englische Titel vorhanden ist, kopiere ihn zum deutschen
    element.title.de = element.title.en;
  } else if (!element.title.en && element.title.de) {
    // Wenn nur der deutsche Titel vorhanden ist, kopiere ihn zum englischen
    element.title.en = element.title.de;
  }

  // Stelle sicher, dass description vorhanden ist, wenn es ein Eingabefeld ist
  if (['StringUIElement', 'NumberUIElement', 'DateUIElement', 'BooleanUIElement', 'SingleSelectionUIElement', 'FileUIElement'].includes(patternType) && !element.description) {
    element.description = { de: '', en: '' };
  } else if (element.description && typeof element.description === 'string') {
    // Wenn description ein String ist, konvertiere es zu einem Objekt
    const descText = element.description;
    element.description = { de: descText, en: descText };
  } else if (element.description && !element.description.de && element.description.en) {
    // Wenn nur die englische Beschreibung vorhanden ist, kopiere sie zur deutschen
    element.description.de = element.description.en;
  } else if (element.description && !element.description.en && element.description.de) {
    // Wenn nur die deutsche Beschreibung vorhanden ist, kopiere sie zur englischen
    element.description.en = element.description.de;
  }

  // Typzuordnung anwenden, falls für diesen pattern_type verfügbar
  if (typeMapping && element.type && typeMapping[element.type]) {
    element.type = typeMapping[element.type];
  }

  // Normalisiere file_type für FileUIElement (falls vorhanden)
  if (patternType === 'FileUIElement' && element.file_type && typeMapping && typeMapping[element.file_type]) {
    element.file_type = typeMapping[element.file_type];
  }

  // Normalisiere Feldnamen (z.B. accepted_types zu allowed_file_types)
  if (patternType === 'FileUIElement' && element.accepted_types && !element.allowed_file_types) {
    element.allowed_file_types = element.accepted_types;
    delete element.accepted_types;
  }

  // Normalisiere SingleSelectionUIElement items zu options
  if (patternType === 'SingleSelectionUIElement' && element.items && !element.options) {
    element.options = element.items;
    delete element.items;
  }

  // Normalisiere NumberUIElement default zu default_value
  if (patternType === 'NumberUIElement' && element.default !== undefined && element.default_value === undefined) {
    element.default_value = element.default;
    delete element.default;
  }

  // Normalisiere visibility_condition
  if (element.visibility_condition) {
    element.visibility_condition = normalizeVisibilityCondition(element.visibility_condition);
  }

  // Rekursiv verschachtelte Elemente normalisieren
  if (patternType === 'GroupUIElement' && element.elements) {
    // Prüfe, ob die Elemente bereits PatternLibraryElements sind
    element.elements = element.elements.map((elementWrapper: any) => {
      if (elementWrapper.element) {
        return { element: normalizeElement(elementWrapper.element, ensureFieldId) };
      } else {
        return { element: normalizeElement(elementWrapper, ensureFieldId) };
      }
    });
  } else if (patternType === 'ArrayUIElement' && element.elements) {
    // Prüfe, ob die Elemente bereits PatternLibraryElements sind
    element.elements = element.elements.map((elementWrapper: any) => {
      if (elementWrapper.element) {
        return { element: normalizeElement(elementWrapper.element, ensureFieldId) };
      } else {
        return { element: normalizeElement(elementWrapper, ensureFieldId) };
      }
    });
  } else if (patternType === 'CustomUIElement') {
    // Elemente in CustomUIElement
    if (element.elements) {
      element.elements = element.elements.map((elementWrapper: any) => {
        if (elementWrapper.element) {
          return { element: normalizeElement(elementWrapper.element, ensureFieldId) };
        } else {
          return { element: normalizeElement(elementWrapper, ensureFieldId) };
        }
      });
    }

    // sub_flows in CustomUIElement
    if (element.sub_flows) {
      element.sub_flows = element.sub_flows.map((subFlow: any) => {
        // Stelle sicher, dass der Subflow einen type hat
        if (!subFlow.type) {
          subFlow.type = element.type || 'SUBFLOW';
        }

        if (subFlow.elements) {
          subFlow.elements = subFlow.elements.map((elementWrapper: any) => {
            if (elementWrapper.element) {
              return { element: normalizeElement(elementWrapper.element, ensureFieldId) };
            } else {
              return { element: normalizeElement(elementWrapper, ensureFieldId) };
            }
          });
        }
        return subFlow;
      });
    }
  } else if (patternType === 'ChipGroupUIElement' && element.chips) {
    // Stelle sicher, dass alle Chips BooleanUIElements sind und eine eindeutige field_id haben
    element.chips = element.chips.map((chip: any) => {
      // Wenn der Chip kein pattern_type hat, setze ihn auf BooleanUIElement
      if (!chip.pattern_type) {
        chip.pattern_type = 'BooleanUIElement';
      }

      return normalizeElement(chip, ensureFieldId);
    });
  }

  return element;
};

/**
 * Normalisiert eine Visibility Condition
 * @param condition Die zu normalisierende Visibility Condition
 * @returns Die normalisierte Visibility Condition
 */
const normalizeVisibilityCondition = (condition: any): any => {
  if (!condition) return condition;

  // Wenn die Bedingung ein Array ist, normalisiere jedes Element
  if (Array.isArray(condition)) {
    return condition.map(normalizeVisibilityCondition);
  }

  // Wenn die Bedingung ein Objekt ist
  if (typeof condition === 'object') {
    // Normalisiere Operatoren
    if (condition.operator) {
      // Konvertiere Operatoren zu Großbuchstaben
      condition.operator = condition.operator.toUpperCase();

      // Normalisiere logische Operatoren
      if (['AND', 'OR'].includes(condition.operator) && condition.conditions) {
        condition.conditions = condition.conditions.map(normalizeVisibilityCondition);
      }

      // Normalisiere Vergleichsoperatoren
      if (['EQ', 'NEQ', 'GT', 'GTE', 'LT', 'LTE', 'CONTAINS', 'NOT_CONTAINS'].includes(condition.operator)) {
        // Stelle sicher, dass field_id ein Objekt ist
        if (condition.field_id && typeof condition.field_id === 'string') {
          condition.field_id = { field_name: condition.field_id };
        }
      }
    }

    // Normalisiere alte Formate
    if (condition.type === 'LO' && condition.value) {
      // Logischer Operator (AND, OR)
      condition.operator = condition.value.toUpperCase();
      delete condition.type;
      delete condition.value;

      if (condition.children) {
        condition.conditions = condition.children.map(normalizeVisibilityCondition);
        delete condition.children;
      }
    } else if (condition.type === 'RFO' && condition.field && condition.operator) {
      // Relativer Feldoperator (EQ, NEQ, etc.)
      if (typeof condition.field === 'string') {
        condition.field_id = { field_name: condition.field };
      } else {
        condition.field_id = condition.field;
      }
      delete condition.field;
      delete condition.type;
    }
  }

  return condition;
};

/**
 * Validiert die Struktur eines ListingFlow-Objekts
 * @param flow Das zu validierende ListingFlow-Objekt
 * @returns Ein Objekt mit dem Validierungsergebnis und ggf. Fehlern
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateFlowStructure = (flow: ListingFlow): ValidationResult => {
  const errors: string[] = [];

  // Prüfe, ob die Grundstruktur vorhanden ist
  if (!flow) {
    errors.push('Flow ist nicht definiert');
    return { valid: false, errors };
  }

  if (!flow.id) {
    errors.push('Flow hat keine ID');
  }

  if (!flow.pages_edit || !Array.isArray(flow.pages_edit)) {
    errors.push('Flow hat keine pages_edit oder pages_edit ist kein Array');
  }

  if (!flow.pages_view || !Array.isArray(flow.pages_view)) {
    errors.push('Flow hat keine pages_view oder pages_view ist kein Array');
  }

  // Prüfe die Seiten
  if (flow.pages_edit) {
    flow.pages_edit.forEach((page: any, index: number) => {
      if (!page.id) {
        errors.push(`Seite ${index} hat keine ID`);
      }

      if (!page.title) {
        errors.push(`Seite ${index} hat keinen Titel`);
      }

      if (!page.elements || !Array.isArray(page.elements)) {
        errors.push(`Seite ${index} hat keine elements oder elements ist kein Array`);
      }

      // Prüfe die Elemente
      if (page.elements) {
        page.elements.forEach((elementWrapper: any, elementIndex: number) => {
          if (!elementWrapper.element) {
            errors.push(`Element ${elementIndex} auf Seite ${index} ist kein PatternLibraryElement`);
          } else {
            const elementErrors = validateElement(elementWrapper.element, `Seite ${index}, Element ${elementIndex}`);
            errors.push(...elementErrors);
          }
        });
      }

      // Prüfe die sub_flows
      if (page.sub_flows) {
        if (!Array.isArray(page.sub_flows)) {
          errors.push(`sub_flows auf Seite ${index} ist kein Array`);
        } else {
          page.sub_flows.forEach((subFlow: any, subFlowIndex: number) => {
            if (!subFlow.type) {
              errors.push(`Subflow ${subFlowIndex} auf Seite ${index} hat keinen type`);
            }

            if (!subFlow.elements || !Array.isArray(subFlow.elements)) {
              errors.push(`Subflow ${subFlowIndex} auf Seite ${index} hat keine elements oder elements ist kein Array`);
            }

            // Prüfe die Elemente im Subflow
            if (subFlow.elements) {
              subFlow.elements.forEach((elementWrapper: any, elementIndex: number) => {
                if (!elementWrapper.element) {
                  errors.push(`Element ${elementIndex} in Subflow ${subFlowIndex} auf Seite ${index} ist kein PatternLibraryElement`);
                } else {
                  const elementErrors = validateElement(elementWrapper.element, `Seite ${index}, Subflow ${subFlowIndex}, Element ${elementIndex}`);
                  errors.push(...elementErrors);
                }
              });
            }
          });
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validiert ein einzelnes Element
 * @param element Das zu validierende Element
 * @param path Der Pfad zum Element (für Fehlermeldungen)
 * @returns Ein Array mit Fehlermeldungen
 */
const validateElement = (element: any, path: string): string[] => {
  const errors: string[] = [];

  if (!element) {
    errors.push(`${path}: Element ist nicht definiert`);
    return errors;
  }

  if (!element.pattern_type) {
    errors.push(`${path}: Element hat keinen pattern_type`);
  }

  // Prüfe, ob eine field_id vorhanden ist (außer bei TextUIElement)
  if (element.pattern_type !== 'TextUIElement' && !element.field_id) {
    errors.push(`${path}: Element hat keine field_id`);
  }

  // Prüfe, ob ein Titel vorhanden ist
  if (!element.title) {
    errors.push(`${path}: Element hat keinen Titel`);
  } else if (typeof element.title === 'object' && (!element.title.de || !element.title.en)) {
    errors.push(`${path}: Element hat keinen vollständigen Titel (de/en)`);
  }

  // Prüfe spezifische Elementtypen
  switch (element.pattern_type) {
    case 'GroupUIElement':
    case 'ArrayUIElement':
      if (!element.elements || !Array.isArray(element.elements)) {
        errors.push(`${path}: ${element.pattern_type} hat keine elements oder elements ist kein Array`);
      } else {
        // Prüfe die Unterelemente
        element.elements.forEach((elementWrapper: any, index: number) => {
          if (!elementWrapper.element) {
            errors.push(`${path}, Unterelement ${index}: Element ist kein PatternLibraryElement`);
          } else {
            const elementErrors = validateElement(elementWrapper.element, `${path}, Unterelement ${index}`);
            errors.push(...elementErrors);
          }
        });
      }
      break;

    case 'CustomUIElement':
      if (element.sub_flows) {
        if (!Array.isArray(element.sub_flows)) {
          errors.push(`${path}: CustomUIElement hat sub_flows, aber sub_flows ist kein Array`);
        } else {
          // Prüfe die sub_flows
          element.sub_flows.forEach((subFlow: any, index: number) => {
            if (!subFlow.type) {
              errors.push(`${path}, Subflow ${index}: Subflow hat keinen type`);
            }

            if (!subFlow.elements || !Array.isArray(subFlow.elements)) {
              errors.push(`${path}, Subflow ${index}: Subflow hat keine elements oder elements ist kein Array`);
            } else {
              // Prüfe die Elemente im Subflow
              subFlow.elements.forEach((elementWrapper: any, elementIndex: number) => {
                if (!elementWrapper.element) {
                  errors.push(`${path}, Subflow ${index}, Element ${elementIndex}: Element ist kein PatternLibraryElement`);
                } else {
                  const elementErrors = validateElement(elementWrapper.element, `${path}, Subflow ${index}, Element ${elementIndex}`);
                  errors.push(...elementErrors);
                }
              });
            }
          });
        }
      }
      break;

    case 'ChipGroupUIElement':
      if (!element.chips || !Array.isArray(element.chips)) {
        errors.push(`${path}: ChipGroupUIElement hat keine chips oder chips ist kein Array`);
      } else {
        // Prüfe die Chips
        element.chips.forEach((chip: any, index: number) => {
          if (!chip.pattern_type) {
            errors.push(`${path}, Chip ${index}: Chip hat keinen pattern_type`);
          } else if (chip.pattern_type !== 'BooleanUIElement') {
            errors.push(`${path}, Chip ${index}: Chip ist kein BooleanUIElement, sondern ${chip.pattern_type}`);
          }

          if (!chip.field_id) {
            errors.push(`${path}, Chip ${index}: Chip hat keine field_id`);
          }
        });
      }
      break;

    case 'SingleSelectionUIElement':
      if (!element.options || !Array.isArray(element.options)) {
        errors.push(`${path}: SingleSelectionUIElement hat keine options oder options ist kein Array`);
      }
      break;

    case 'FileUIElement':
      if (!element.file_type) {
        errors.push(`${path}: FileUIElement hat keinen file_type`);
      }
      break;
  }

  return errors;
};

/**
 * Konvertiert ein Element in ein PatternLibraryElement wenn nötig
 * @param element Das zu konvertierende Element
 * @returns Das Element als PatternLibraryElement
 */
export const ensurePatternLibraryElement = (element: any): any => {
  if (element && element.element) {
    return element;
  }
  return { element };
};

/**
 * Erzwingt die Einwicklung aller Elemente in PatternLibraryElement-Objekte
 * @param flow Das zu verarbeitende ListingFlow-Objekt
 * @returns Das ListingFlow-Objekt mit eingewickelten Elementen
 */
export const enforcePatternLibraryElementWrapping = (flow: ListingFlow): ListingFlow => {
  // Deep copy erstellen, um das Original nicht zu verändern
  const wrappedFlow = JSON.parse(JSON.stringify(flow));

  // pages_edit verarbeiten
  if (wrappedFlow.pages_edit) {
    wrappedFlow.pages_edit = wrappedFlow.pages_edit.map((page: any) => {
      // Elemente einwickeln
      if (page.elements) {
        page.elements = page.elements.map((elementWrapper: any) => {
          return ensurePatternLibraryElement(elementWrapper);
        });
      }

      // sub_flows verarbeiten
      if (page.sub_flows) {
        page.sub_flows = page.sub_flows.map((subFlow: any) => {
          if (subFlow.elements) {
            subFlow.elements = subFlow.elements.map((elementWrapper: any) => {
              return ensurePatternLibraryElement(elementWrapper);
            });
          }
          return subFlow;
        });
      }

      return page;
    });
  }

  // pages_view verarbeiten
  if (wrappedFlow.pages_view) {
    wrappedFlow.pages_view = wrappedFlow.pages_view.map((page: any) => {
      if (page.elements) {
        page.elements = page.elements.map((elementWrapper: any) => {
          return ensurePatternLibraryElement(elementWrapper);
        });
      }
      return page;
    });
  }

  return wrappedFlow;
};

/**
 * Normalisiert die Struktur eines ListingFlow-Objekts für komplexe JSON-Strukturen wie doorbit_original.json
 * @param flow Das zu normalisierende ListingFlow-Objekt
 * @returns Das normalisierte ListingFlow-Objekt
 */
export const normalizeComplexStructure = (flow: ListingFlow): ListingFlow => {
  // Zuerst die Grundnormalisierung durchführen
  let normalizedFlow = normalizeElementTypes(flow);

  // Dann die Einwicklung erzwingen
  normalizedFlow = enforcePatternLibraryElementWrapping(normalizedFlow);

  // Deep copy erstellen, um das Original nicht zu verändern
  const complexNormalizedFlow = JSON.parse(JSON.stringify(normalizedFlow));

  // Spezielle Normalisierung für komplexe Strukturen
  if (complexNormalizedFlow.pages_edit) {
    complexNormalizedFlow.pages_edit = complexNormalizedFlow.pages_edit.map((page: any) => {
      // Normalisiere die Elemente rekursiv
      if (page.elements) {
        page.elements = normalizeComplexElements(page.elements);
      }

      // Normalisiere sub_flows
      if (page.sub_flows) {
        page.sub_flows = page.sub_flows.map((subFlow: any) => {
          // Stelle sicher, dass der Subflow einen type hat
          if (!subFlow.type) {
            subFlow.type = 'SUBFLOW';
          }

          // Normalisiere die Elemente im Subflow
          if (subFlow.elements) {
            subFlow.elements = normalizeComplexElements(subFlow.elements);
          }

          return subFlow;
        });
      }

      return page;
    });
  }

  // Validiere die Struktur
  const validationResult = validateFlowStructure(complexNormalizedFlow);
  if (!validationResult.valid) {
    console.warn('[normalizeComplexStructure] Validierungsfehler:', validationResult.errors);
  }

  return complexNormalizedFlow;
};

/**
 * Normalisiert komplexe Elementstrukturen rekursiv
 * @param elements Die zu normalisierenden Elemente
 * @returns Die normalisierten Elemente
 */
const normalizeComplexElements = (elements: any[]): any[] => {
  return elements.map((elementWrapper: any) => {
    if (!elementWrapper.element) {
      return elementWrapper;
    }

    const element = elementWrapper.element;

    // Normalisiere verschachtelte Elemente
    if (element.pattern_type === 'GroupUIElement' && element.elements) {
      element.elements = normalizeComplexElements(element.elements);
    } else if (element.pattern_type === 'ArrayUIElement' && element.elements) {
      element.elements = normalizeComplexElements(element.elements);
    } else if (element.pattern_type === 'CustomUIElement') {
      // Normalisiere Elemente in CustomUIElement
      if (element.elements) {
        element.elements = normalizeComplexElements(element.elements);
      }

      // Normalisiere sub_flows in CustomUIElement
      if (element.sub_flows) {
        element.sub_flows = element.sub_flows.map((subFlow: any) => {
          // Stelle sicher, dass der Subflow einen type hat
          if (!subFlow.type) {
            subFlow.type = element.type || 'SUBFLOW';
          }

          // Normalisiere die Elemente im Subflow
          if (subFlow.elements) {
            subFlow.elements = normalizeComplexElements(subFlow.elements);
          }

          return subFlow;
        });
      }
    }

    // Stelle sicher, dass alle Referenzen auf andere Elemente korrekt sind
    if (element.visibility_condition) {
      element.visibility_condition = normalizeVisibilityCondition(element.visibility_condition);
    }

    return elementWrapper;
  });
};
