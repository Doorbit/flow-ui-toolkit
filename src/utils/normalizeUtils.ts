import { ListingFlow } from '../models/listingFlow';

/**
 * Maps abbreviated type values to their full counterparts for different element types
 */
const TYPE_MAPPINGS: Record<string, Record<string, string>> = {
  DateUIElement: {
    'Y': 'YEAR',
    'M': 'MONTH',
    'D': 'DAY',
    'h': 'HOUR',
    'm': 'MINUTE',
    // 'YMD' wird nicht mehr zu 'DAY' konvertiert, sondern als eigener Typ beibehalten
  },
  BooleanUIElement: {
    'TOGGLE': 'SWITCH', // Falls in manchen JSONs TOGGLE statt SWITCH verwendet wird
    'RADIO_BUTTON': 'RADIO', // Normalisierung von RADIO_BUTTON zu RADIO
  },
  SingleSelectionUIElement: {
    'BUTTON_GROUP': 'BUTTONGROUP', // Normalisierung von BUTTON_GROUP zu BUTTONGROUP
    'RADIO_GROUP': 'BUTTONGROUP', // Weitere mögliche Variante
  },
  NumberUIElement: {
    'INT': 'INTEGER', // Falls in manchen JSONs INT statt INTEGER verwendet wird
    'FLOAT': 'DOUBLE', // Falls in manchen JSONs FLOAT statt DOUBLE verwendet wird
    'DECIMAL': 'DOUBLE', // Weitere mögliche Variante
  },
  FileUIElement: {
    'IMG': 'IMAGE', // Falls in manchen JSONs IMG statt IMAGE verwendet wird
    'PHOTO': 'IMAGE', // Weitere mögliche Variante
  },
  TextUIElement: {
    'TEXT': 'PARAGRAPH', // Falls in manchen JSONs TEXT statt PARAGRAPH verwendet wird
    'H1': 'HEADING', // Weitere mögliche Variante
    'H2': 'HEADING', // Weitere mögliche Variante
  },
  StringUIElement: {
    'TEXTAREA': 'TEXT_AREA', // Normalisierung von TEXTAREA zu TEXT_AREA
    'INPUT': 'TEXT', // Normalisierung von INPUT zu TEXT
  },
};

/**
 * Normalisiert Elementtypen in einem ListingFlow-Objekt
 * @param flow Das zu normalisierende ListingFlow-Objekt
 * @returns Das normalisierte ListingFlow-Objekt
 */
export const normalizeElementTypes = (flow: ListingFlow): ListingFlow => {
  // Deep copy erstellen, um das Original nicht zu verändern
  const normalizedFlow = JSON.parse(JSON.stringify(flow));

  // pages_edit normalisieren
  if (normalizedFlow.pages_edit) {
    normalizedFlow.pages_edit = normalizedFlow.pages_edit.map((page: any) => {
      if (page.elements) {
        page.elements = page.elements.map((elementWrapper: any) => {
          return { element: normalizeElement(elementWrapper.element) };
        });
      }

      // Auch sub_flows normalisieren, falls vorhanden
      if (page.sub_flows) {
        page.sub_flows = page.sub_flows.map((subFlow: any) => {
          if (subFlow.elements) {
            subFlow.elements = subFlow.elements.map((elementWrapper: any) => {
              return { element: normalizeElement(elementWrapper.element) };
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
      if (page.elements) {
        page.elements = page.elements.map((elementWrapper: any) => {
          return { element: normalizeElement(elementWrapper.element) };
        });
      }
      return page;
    });
  }

  return normalizedFlow;
};

/**
 * Normalisiert ein einzelnes Element und seine verschachtelten Elemente
 * @param element Das zu normalisierende Element
 * @returns Das normalisierte Element
 */
const normalizeElement = (element: any): any => {
  if (!element || !element.pattern_type) {
    return element;
  }

  const patternType = element.pattern_type;
  const typeMapping = TYPE_MAPPINGS[patternType];

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

  // Rekursiv verschachtelte Elemente normalisieren
  if (patternType === 'GroupUIElement' && element.elements) {
    element.elements = element.elements.map((elementWrapper: any) => {
      return { element: normalizeElement(elementWrapper.element) };
    });
  } else if (patternType === 'ArrayUIElement' && element.elements) {
    element.elements = element.elements.map((elementWrapper: any) => {
      return { element: normalizeElement(elementWrapper.element) };
    });
  } else if (patternType === 'CustomUIElement') {
    // Elemente in CustomUIElement
    if (element.elements) {
      element.elements = element.elements.map((elementWrapper: any) => {
        return { element: normalizeElement(elementWrapper.element) };
      });
    }

    // sub_flows in CustomUIElement
    if (element.sub_flows) {
      element.sub_flows = element.sub_flows.map((subFlow: any) => {
        if (subFlow.elements) {
          subFlow.elements = subFlow.elements.map((elementWrapper: any) => {
            return { element: normalizeElement(elementWrapper.element) };
          });
        }
        return subFlow;
      });
    }
  } else if (patternType === 'ChipGroupUIElement' && element.chips) {
    element.chips = element.chips.map(normalizeElement);
  }

  return element;
};
