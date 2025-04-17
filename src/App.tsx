import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';

import Navigation from './components/Navigation/Navigation';
import ElementPalette from './components/ElementPalette/ElementPalette';
import EditorArea from './components/EditorArea/EditorArea';
import PropertyEditor from './components/PropertyEditor/PropertyEditor';
import JsonPreview from './components/JsonPreview/JsonPreview';
import PageNavigator from './components/PageNavigator/PageNavigator';
import { DndProvider } from './components/DndProvider';
import { EditorProvider, useEditor, getElementByPath } from './context/EditorContext';
import { FieldValuesProvider } from './context/FieldValuesContext';
import { SchemaProvider } from './context/SchemaContext';
import { ListingFlow, PatternLibraryElement } from './models/listingFlow';
import {
  TextUIElement,
  BooleanUIElement,
  SingleSelectionUIElement,
  NumberUIElement,
  DateUIElement,
  FileUIElement,
  GroupUIElement,
  ArrayUIElement,
  CustomUIElement,
  ChipGroupUIElement,
  StringUIElement
} from './models/uiElements';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const EditorContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const EditorAreaWrapper = styled.div`
  flex: 0.6; /* 60% der Breite */
  overflow: auto;
`;

const PropertyEditorWrapper = styled.div`
  flex: 0.4; /* 40% der Breite */
  overflow: auto;
  border-left: 1px solid #ddd;
`;

// Beispiel für eine leere ListingFlow-Struktur
const emptyFlow: ListingFlow = {
  id: 'new-flow',
  'url-key': 'new-flow',
  name: 'Neuer Flow',
  title: {
    de: 'Neuer Flow',
    en: 'New Flow'
  },
  icon: 'mdiFileOutline',
  pages_edit: [
    {
      pattern_type: 'Page',
      id: 'page-1',
      title: {
        de: 'Seite 1',
        en: 'Page 1'
      },
      elements: []
    }
  ],
  pages_view: []
};

// Funktion zum Erstellen eines Elements basierend auf dem angegebenen Typ
const createElement = (type: string): PatternLibraryElement => {
  switch (type) {
    case 'TextUIElement':
      return {
        element: {
          pattern_type: 'TextUIElement',
          required: false,
          type: 'PARAGRAPH',
          text: {
            de: 'Beispieltext',
            en: 'Example text'
          },
          title: {
            de: 'Text Element',
            en: 'Text Element'
          }
        } as TextUIElement
      };

    case 'BooleanUIElement':
      return {
        element: {
          pattern_type: 'BooleanUIElement',
          required: false,
          field_id: {
            field_name: 'boolean_field'
          },
          default_value: false,
          title: {
            de: 'Boolean Element',
            en: 'Boolean Element'
          }
        } as BooleanUIElement
      };

    case 'SingleSelectionUIElement':
      return {
        element: {
          pattern_type: 'SingleSelectionUIElement',
          required: false,
          field_id: {
            field_name: 'selection_field'
          },
          type: 'DROPDOWN',
          options: [
            { key: 'option1', label: { de: 'Option 1', en: 'Option 1' } },
            { key: 'option2', label: { de: 'Option 2', en: 'Option 2' } },
            { key: 'option3', label: { de: 'Option 3', en: 'Option 3' } }
          ],
          title: {
            de: 'Auswahl Element',
            en: 'Selection Element'
          }
        } as SingleSelectionUIElement
      };

    case 'NumberUIElement':
      return {
        element: {
          pattern_type: 'NumberUIElement',
          required: false,
          field_id: {
            field_name: 'number_field'
          },
          type: 'INTEGER',
          minimum: 0,
          maximum: 100,
          title: {
            de: 'Nummer Element',
            en: 'Number Element'
          }
        } as NumberUIElement
      };

    case 'DateUIElement':
      return {
        element: {
          pattern_type: 'DateUIElement',
          required: false,
          field_id: {
            field_name: 'date_field'
          },
          type: 'DAY', // Korrigiert: Typ hinzugefügt, erforderlich für DateUIElement
          title: {
            de: 'Datum Element',
            en: 'Date Element'
          }
        } as DateUIElement
      };

    case 'FileUIElement':
      return {
        element: {
          pattern_type: 'FileUIElement',
          required: false,
          file_type: 'FILE',
          allowed_file_types: ['image/jpeg', 'image/png', 'application/pdf'], // Korrigiert: allowed_file_types statt accepted_types
          id_field_id: { // Korrigiert: id_field_id hinzugefügt, erforderlich für FileUIElement
            field_name: 'file_field'
          },
          title: {
            de: 'Datei Element',
            en: 'File Element'
          }
        } as FileUIElement
      };

    case 'GroupUIElement':
      return {
        element: {
          pattern_type: 'GroupUIElement',
          required: false,
          isCollapsible: false,
          elements: [], // Leere Elemente-Liste
          title: {
            de: 'Gruppen Element',
            en: 'Group Element'
          }
        } as GroupUIElement
      };

    case 'ArrayUIElement':
      return {
        element: {
          pattern_type: 'ArrayUIElement',
          required: false,
          field_id: {
            field_name: 'array_field'
          },
          min_count: 0, // Korrigiert: min_count statt min_items
          max_count: 10, // Korrigiert: max_count statt max_items
          elements: [{ // Korrigiert: elements statt item_template
            element: {
              pattern_type: 'TextUIElement',
              required: false,
              type: 'PARAGRAPH',
              text: {
                de: 'Element in Array',
                en: 'Element in Array'
              },
              title: {
                de: 'Array Element',
                en: 'Array Element'
              }
            } as TextUIElement
          }],
          title: {
            de: 'Array Element',
            en: 'Array Element'
          }
        } as ArrayUIElement
      };

    case 'CustomUIElement':
      return {
        element: {
          pattern_type: 'CustomUIElement',
          required: false,
          title: {
            de: 'Benutzerdefiniertes Element',
            en: 'Custom Element'
          }
        } as CustomUIElement
      };

    case 'CustomUIElement_SCANNER':
      return {
        element: {
          pattern_type: 'CustomUIElement',
          type: 'SCANNER',
          id: `scanner-${uuidv4().substring(0, 8)}`,
          related_custom_ui_element_id: `scanner-view-${uuidv4().substring(0, 8)}`,
          display_position: 'RIGHT',
          required: false,
          title: {
            de: 'Scanner (Doorbit Studio)',
            en: 'Scanner (Doorbit Studio)'
          },
          sub_flows: [
            {
              type: 'POI_PHOTO',
              elements: [
                {
                  element: {
                    pattern_type: 'FileUIElement',
                    file_type: 'IMAGE',
                    title: {},
                    min_count: 0,
                    max_count: 1,
                    required: false,
                    id_field_id: {
                      field_name: 'building_poi_pictures_id'
                    },
                    caption_field_id: {
                      field_name: 'building_poi_pictures_caption'
                    },
                    allowed_file_types: []
                  }
                }
              ]
            }
          ]
        } as CustomUIElement
      };

    case 'CustomUIElement_ADDRESS':
      return {
        element: {
          pattern_type: 'CustomUIElement',
          type: 'ADDRESS',
          id: `address-${uuidv4().substring(0, 8)}`,
          required: false,
          title: {
            de: 'Adresse ermitteln',
            en: 'Determine address'
          },
          short_title: {
            de: 'Adresse',
            en: 'Address'
          },
          elements: [
            {
              element: {
                pattern_type: 'BooleanUIElement',
                required: false,
                field_id: {
                  field_name: 'address_show_obfuscated_location'
                },
                default_value: false,
                title: {
                  de: 'Adresse verbergen?',
                  en: 'Hide address?'
                },
                description: {
                  de: 'Wird die Adresse verborgen, ist sie nicht öffentlich sichtbar. Stattdessen wird ein ungefährer Standort präsentiert.',
                  en: 'If the address is hidden, it won\'t be publicly visible. Instead, an approximate location will be displayed.'
                }
              }
            }
          ]
        } as CustomUIElement
      };

    case 'CustomUIElement_LOCATION':
      return {
        element: {
          pattern_type: 'CustomUIElement',
          type: 'LOCATION',
          id: `location-${uuidv4().substring(0, 8)}`,
          icon: 'mdiMapMarker',
          required: false,
          short_title: {
            de: 'Lage',
            en: 'Location'
          },
          title: {
            de: 'Standort',
            en: 'Location'
          },
          elements: []
        } as CustomUIElement
      };

    case 'CustomUIElement_ADMIN_BOUNDARY':
      return {
        element: {
          pattern_type: 'CustomUIElement',
          type: 'ADMIN_BOUNDARY',
          id: `admin-boundary-${uuidv4().substring(0, 8)}`,
          icon: 'mdiHomeGroup',
          required: false,
          short_title: {
            de: 'Nachbarschaft',
            en: 'Administrative boundary'
          },
          title: {
            de: 'Umgebungsinfos',
            en: 'Environment information'
          },
          elements: []
        } as CustomUIElement
      };

    case 'ChipGroupUIElement': {
      // Erstelle BooleanUIElements direkt, ohne PatternLibraryElement-Wrapper
      const bool1: BooleanUIElement = {
        pattern_type: 'BooleanUIElement',
        required: false,
        field_id: { field_name: `chip_${uuidv4()}` },
        title: { de: 'Option 1', en: 'Option 1' },
        description: { de: 'Erste Option', en: 'First option' }
      };

      const bool2: BooleanUIElement = {
        pattern_type: 'BooleanUIElement',
        required: false,
        field_id: { field_name: `chip_${uuidv4()}` },
        title: { de: 'Option 2', en: 'Option 2' },
        description: { de: 'Zweite Option', en: 'Second option' }
      };

      return {
        element: {
          pattern_type: 'ChipGroupUIElement',
          required: false,
          title: {
            de: 'Chip-Gruppe Element',
            en: 'Chip Group Element'
          },
          // ChipGroupUIElement.chips erwartet BooleanUIElement[], nicht PatternLibraryElement[]
          chips: [bool1, bool2]
        } as ChipGroupUIElement
      };
    }

    case 'StringUIElement':
      return {
        element: {
          pattern_type: 'StringUIElement',
          required: false,
          type: 'TEXT',
          field_id: {
            field_name: 'string_field'
          },
          length_minimum: 0,
          length_maximum: 100,
          title: {
            de: 'String Element',
            en: 'String Element'
          }
        } as StringUIElement
      };

    default:
      // Fallback auf TextUIElement
      return {
        element: {
          pattern_type: 'TextUIElement',
          required: false,
          type: 'PARAGRAPH',
          text: {
            de: 'Beispieltext',
            en: 'Example text'
          },
          title: {
            de: 'Text Element',
            en: 'Text Element'
          }
        } as TextUIElement
      };
  }
};

const AppContent: React.FC = () => {
  const { state, dispatch } = useEditor();
  const [selectedElementPath, setSelectedElementPath] = useState<number[]>([]);

  // Initialisierung mit leerem Flow oder Mock-Daten
  useEffect(() => {
    dispatch({ type: 'SET_FLOW', flow: emptyFlow });
  }, [dispatch]);



  // Finde aktuelle Seite anhand der selectedPageId im EditorContext
  const currentPage = state.currentFlow?.pages_edit.find(page => page.id === state.selectedPageId);
  const currentElements = currentPage?.elements || [];

  // Hilfsfunktion zur Prüfung der Verschachtelungsregeln
  const isElementAllowedInParent = (elementType: string, parentType: string): { allowed: boolean, message: string } => {
    // Prüfe, ob das Ziel eine ChipGroup ist
    if (parentType === 'ChipGroupUIElement') {
      // Nur BooleanUIElements in ChipGroups erlauben
      return {
        allowed: elementType === 'BooleanUIElement',
        message: "Nur Boolean-Elemente können in Chip-Gruppen hinzugefügt werden"
      };
    }

    // Prüfe, ob das Ziel ein Array-Element ist
    if (parentType === 'ArrayUIElement') {
      // Arrays dürfen keine weiteren Arrays oder komplexe Elemente enthalten
      const isComplex = ['ArrayUIElement', 'GroupUIElement', 'CustomUIElement', 'ChipGroupUIElement'].includes(elementType);
      return {
        allowed: !isComplex,
        message: "Arrays dürfen keine weiteren Arrays oder komplexe Elemente enthalten"
      };
    }

    // Prüfe, ob das Ziel ein Gruppen-Element ist
    if (parentType === 'GroupUIElement') {
      // Gruppen dürfen keine weiteren Gruppen enthalten
      return {
        allowed: elementType !== 'GroupUIElement',
        message: "Gruppen dürfen keine weiteren Gruppen enthalten"
      };
    }

    return { allowed: true, message: "" };
  };

  // Element-Handler für Haupt- und verschachtelte Elemente
  const handleAddElement = (type: string, parentPath?: number[]) => {
    if (!state.selectedPageId) return;

    const newElement = createElement(type);

    if (parentPath && parentPath.length > 0) {
      // Ziel-Element anhand des Pfads holen
      const currentPage = state.currentFlow?.pages_edit.find(page => page.id === state.selectedPageId);
      let parent = currentPage?.elements;
      let target: any = null;
      if (parent) {
        // Navigiere explizit über .elements-Arrays
        target = parent;
        for (let i = 0; i < parentPath.length; i++) {
          if (Array.isArray(target)) {
            target = target[parentPath[i]];
          } else if (target && target.element && (target.element.elements || target.element.chips)) {
            if (target.element.elements) {
              target = target.element.elements[parentPath[i]];
            } else if (target.element.chips) {
              target = target.element.chips[parentPath[i]];
            }
          } else {
            target = null;
            break;
          }
        }
      }

      // Prüfe die Verschachtelungsregeln
      if (target && target.element) {
        const parentType = target.element.pattern_type;
        const elementType = newElement.element.pattern_type;
        const { allowed, message } = isElementAllowedInParent(elementType, parentType);

        if (!allowed) {
          alert(message);
          return;
        }
      }

      // Prüfen, ob das Ziel eine ChipGroup ist
      if (target && target.element && target.element.pattern_type === 'ChipGroupUIElement') {
        // Deep Copy des Flows
        const updatedFlow = JSON.parse(JSON.stringify(state.currentFlow));
        const pageIndex = updatedFlow.pages_edit.findIndex((page: { id: string }) => page.id === state.selectedPageId);
        if (pageIndex === -1) return;

        // Navigiere zu ChipGroup anhand des Pfads (nur über .elements)
        let chipGroupRef = updatedFlow.pages_edit[pageIndex].elements;
        for (let i = 0; i < parentPath.length; i++) {
          chipGroupRef = chipGroupRef[parentPath[i]].element.elements || chipGroupRef[parentPath[i]].element.chips || chipGroupRef[parentPath[i]].element;
        }
        // Der letzte Schritt ist das eigentliche ChipGroup-Objekt
        let chipGroupObj = updatedFlow.pages_edit[pageIndex].elements;
        for (let i = 0; i < parentPath.length; i++) {
          chipGroupObj = chipGroupObj[parentPath[i]].element;
          if (i < parentPath.length - 1) {
            if (chipGroupObj.elements) {
              chipGroupObj = chipGroupObj.elements;
            } else if (chipGroupObj.chips) {
              chipGroupObj = chipGroupObj.chips;
            }
          }
        }
        // Füge das neue BooleanUIElement zu chips hinzu
        if (!chipGroupObj.chips) chipGroupObj.chips = [];
        // BooleanUIElement extrahieren - ChipGroup erwartet BooleanUIElement, nicht PatternLibraryElement
        const boolElement = newElement.element && newElement.element.pattern_type === 'BooleanUIElement'
          ? {
              ...newElement.element,
              field_id: { field_name: `chip_${uuidv4()}` } // Stelle sicher, dass die field_id eindeutig ist
            }
          : {
              pattern_type: 'BooleanUIElement',
              required: false,
              field_id: { field_name: `chip_${uuidv4()}` },
              title: { de: 'Neue Option', en: 'New Option' }
            };
        chipGroupObj.chips.push(boolElement);

        dispatch({ type: 'UPDATE_FLOW', flow: updatedFlow });
        return;
      }

      // Unterelement zu einem vorhandenen Element hinzufügen (wie bisher)
      dispatch({
        type: 'ADD_SUB_ELEMENT',
        element: newElement,
        path: [...parentPath, 0], // Am Anfang der Unterelemente hinzufügen
        pageId: state.selectedPageId
      });
    } else {
      // Element auf oberster Ebene hinzufügen
      dispatch({
        type: 'ADD_ELEMENT',
        element: newElement,
        pageId: state.selectedPageId
      });
    }
  };

  const handleUpdateElement = (updatedElement: PatternLibraryElement) => {
    if (selectedElementPath.length === 0 || !state.currentFlow || !state.selectedPageId) return;

    console.log("⏩ handleUpdateElement aufgerufen für:", updatedElement);
    console.log("🔍 Pfad:", selectedElementPath);

    // Erstelle eine Kopie des Flows
    const updatedFlow = JSON.parse(JSON.stringify(state.currentFlow));

    // Finde die aktuelle Seite
    const pageIndex = updatedFlow.pages_edit.findIndex((page: { id: string }) => page.id === state.selectedPageId);
    if (pageIndex === -1) return;

    // Hole die aktuelle Seite
    const currentPage = updatedFlow.pages_edit[pageIndex];
    console.log("📄 Aktuelle Seite:", currentPage.id);

    // Der direkte Weg: Verwende updateElementAtPath aus dem EditorContext
    // Aber implementieren wir es hier direkt, um mehr Kontrolle zu haben

    // Prüfe, ob das Element in einer ChipGroup ist
    if (selectedElementPath.length >= 2) {
      // Hole das Elternelement
      let parentElement = currentPage.elements[selectedElementPath[0]];
      for (let i = 1; i < selectedElementPath.length - 1; i++) {
        if (parentElement.element.elements) {
          parentElement = parentElement.element.elements[selectedElementPath[i]];
        } else if (parentElement.element.chips) {
          // Wir haben eine ChipGroup gefunden!
          break;
        }
      }

      // Wenn das Elternelement eine ChipGroup ist
      if (parentElement && parentElement.element.pattern_type === 'ChipGroupUIElement') {
        console.log("🍪 ChipGroup gefunden:", parentElement);

        // Nimm den letzten Index im Pfad - dies ist der Index des Boolean-Elements in chips
        const chipIndex = selectedElementPath[selectedElementPath.length - 1];

        // Aktualisiere das Boolean-Element direkt in der chips-Array
        if (parentElement.element.chips && chipIndex < parentElement.element.chips.length) {
          console.log("🔄 Aktualisiere Boolean in ChipGroup, vor Update:", parentElement.element.chips[chipIndex]);

          // Ersetze das BooleanUIElement mit dem aktualisierten Element
          parentElement.element.chips[chipIndex] = updatedElement.element;

          console.log("✅ Aktualisiertes Boolean in ChipGroup:", parentElement.element.chips[chipIndex]);

          // Dispatch mit dem aktualisierten Flow
          dispatch({ type: 'UPDATE_FLOW', flow: updatedFlow });
          return;
        }
      }
    }

    // Wenn es kein Chip-Element ist oder wir es nicht gefunden haben, versuchen wir den Standard-Weg

    // Aktualisiere das Element im Flow anhand des Pfads
    let elementsArray = currentPage.elements;
    let currentArray = elementsArray;

    // Navigiere zu dem Eltern-Array, das das zu aktualisierende Element enthält
    for (let i = 0; i < selectedElementPath.length - 1; i++) {
      const index = selectedElementPath[i];
      const elem = currentArray[index];

      console.log(`🔍 Navigation Ebene ${i}, Element:`, elem.element.pattern_type);

      // Prüfe, ob es sich um ein Container-Element handelt
      if (elem.element.pattern_type === 'GroupUIElement' && elem.element.elements) {
        currentArray = elem.element.elements;
      } else if (elem.element.pattern_type === 'ArrayUIElement' && elem.element.elements) {
        currentArray = elem.element.elements;
      } else if (elem.element.pattern_type === 'ChipGroupUIElement' && elem.element.chips) {
        // Für ChipGroup müssen wir die BooleanUIElements in PatternLibraryElements konvertieren,
        // um konsistent zu bleiben
        currentArray = elem.element.chips.map((chip: any) => ({ element: chip }));
        console.log("🔄 ChipGroup Konvertierung:", currentArray);
      } else {
        console.error('❌ Ungültiger Pfad: Element hat keine Unterelemente');
        return;
      }
    }

    // Ersetze das Element an der letzten Position im Pfad
    if (selectedElementPath.length > 0) {
      const lastIndex = selectedElementPath[selectedElementPath.length - 1];

      // Prüfe, ob wir im vorherigen Schritt eine ChipGroup behandelt haben
      const parentIndex = selectedElementPath.length > 1 ? selectedElementPath[selectedElementPath.length - 2] : -1;
      if (parentIndex >= 0) {
        console.log("🔍 Prüfe Parent-Element at Index:", parentIndex);

        const parentElem = elementsArray;
        for (let i = 0; i < selectedElementPath.length - 2; i++) {
          const idx = selectedElementPath[i];
          console.log(`🔍 Navigiere zu Parent, Ebene ${i}, Element:`, parentElem[idx]?.element?.pattern_type);

          if (parentElem[idx].element.pattern_type === 'GroupUIElement' ||
              parentElem[idx].element.pattern_type === 'ArrayUIElement') {
            // Navigiere zum Parent
            const elemAtIdx = parentElem[idx];
            elementsArray = elemAtIdx.element.elements;
          } else if (parentElem[idx].element.pattern_type === 'ChipGroupUIElement') {
            // Wenn der Parent eine ChipGroup ist, müssen wir das updatedElement
            // direkt ins chips-Array des Parents speichern
            const chipParent = parentElem[idx];
            console.log("🍪 ChipGroup Parent gefunden, direkte Aktualisierung", chipParent);

            chipParent.element.chips[lastIndex] = updatedElement.element;
            console.log("✅ Boolean in ChipGroup direkt aktualisiert");

            // Dispatch mit dem aktualisierten Flow und zurückkehren
            dispatch({ type: 'UPDATE_FLOW', flow: updatedFlow });
            return;
          }
        }
      }

      // Standardfall: Element direkt ersetzen
      console.log("🔄 Standard-Update für Element an Index:", lastIndex);
      currentArray[lastIndex] = updatedElement;
    }

    // Dispatch mit dem aktualisierten Flow
    console.log("📤 Flow-Update:", updatedFlow);
    dispatch({ type: 'UPDATE_FLOW', flow: updatedFlow });
  };

  const handleSelectElement = (path: number[]) => {
    if (!state.selectedPageId) return;

    setSelectedElementPath(path);

    dispatch({
      type: 'SELECT_ELEMENT_BY_PATH',
      path,
      pageId: state.selectedPageId
    });
  };

  const handleRemoveElement = (path: number[]) => {
    if (!state.selectedPageId) return;

    if (path.length === 1) {
      // Element auf oberster Ebene entfernen
      dispatch({
        type: 'REMOVE_ELEMENT',
        elementIndex: path[0],
        pageId: state.selectedPageId
      });
    } else {
      // Verschachteltes Element entfernen
      dispatch({
        type: 'REMOVE_SUB_ELEMENT',
        path,
        pageId: state.selectedPageId
      });
    }

    // Selektion zurücksetzen, wenn das aktuell ausgewählte Element entfernt wurde
    if (JSON.stringify(selectedElementPath) === JSON.stringify(path)) {
      setSelectedElementPath([]);
    }
  };

  const handleDuplicateElement = (path: number[]) => {
    if (!state.selectedPageId || !currentPage) return;

    const elementToDuplicate = getElementByPath(currentPage.elements, path);
    if (!elementToDuplicate) return;

    // Prüfen, ob es sich um ein BooleanUIElement in einer ChipGroup handelt
    let duplicatedElement = {...elementToDuplicate};

    // Wenn es ein BooleanUIElement ist, generiere eine neue UUID für die field_id
    if (elementToDuplicate.element.pattern_type === 'BooleanUIElement') {
      // Prüfen, ob das Elternelement eine ChipGroup ist
      if (path.length > 1) {
        const parentPath = path.slice(0, -1);
        const parentElement = getElementByPath(currentPage.elements, parentPath);

        if (parentElement && parentElement.element.pattern_type === 'ChipGroupUIElement') {
          // Es ist ein BooleanUIElement in einer ChipGroup, generiere eine neue UUID
          duplicatedElement = {
            ...elementToDuplicate,
            element: {
              ...elementToDuplicate.element,
              field_id: { field_name: `chip_${uuidv4()}` }
            }
          };
        }
      }
    }

    if (path.length === 1) {
      // Element auf oberster Ebene duplizieren
      dispatch({
        type: 'ADD_ELEMENT',
        element: duplicatedElement,
        pageId: state.selectedPageId
      });
    } else {
      // Verschachteltes Element duplizieren
      const parentPath = path.slice(0, -1);
      const siblingIndex = path[path.length - 1] + 1;
      const targetPath = [...parentPath, siblingIndex];

      dispatch({
        type: 'ADD_SUB_ELEMENT',
        element: duplicatedElement,
        path: targetPath,
        pageId: state.selectedPageId
      });
    }
  };

  // Datei-Handler
  const handleNew = () => {
    if (window.confirm('Möchten Sie einen neuen Flow erstellen? Ungespeicherte Änderungen gehen verloren.')) {
      dispatch({ type: 'SET_FLOW', flow: emptyFlow });
      setSelectedElementPath([]);
      // Die selectedPageId wird automatisch in der SET_FLOW Aktion gesetzt
    }
  };

  const handleOpen = () => {
    // Öffne einen Datei-Dialog
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            dispatch({ type: 'SET_FLOW', flow: json });
            setSelectedElementPath([]);
            // Die selectedPageId wird automatisch in der SET_FLOW Aktion gesetzt
          } catch (error) {
            alert('Ungültiges JSON-Format: ' + error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSave = () => {
    if (!state.currentFlow) return;

    // Erstelle einen Blob aus dem JSON
    const json = JSON.stringify(state.currentFlow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Erstelle einen Link zum Herunterladen
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.currentFlow.id || 'listing-flow'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Ausgewähltes Element basierend auf Pfad finden
  const selectedElement = currentPage
    ? getElementByPath(currentPage.elements, selectedElementPath)
    : null;

  return (
    <FieldValuesProvider flow={state.currentFlow}>
      <AppContainer>
        <Navigation
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          canUndo={state.undoStack.length > 0}
          canRedo={state.redoStack.length > 0}
          onUndo={() => dispatch({ type: 'UNDO' })}
          onRedo={() => dispatch({ type: 'REDO' })}
        />

        {/* Seitennavigation */}
        {state.currentFlow && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f5f5f5' }}>
            <PageNavigator
              pages={state.currentFlow.pages_edit}
              selectedPageId={state.selectedPageId}
            />
          </Box>
        )}

      <MainContent>
        <ElementPalette onElementClick={(type) => handleAddElement(type)} />

        <EditorContainer>
          <EditorAreaWrapper>
            <EditorArea
              elements={currentElements}
              selectedElementPath={selectedElementPath}
              onSelectElement={handleSelectElement}
              onRemoveElement={handleRemoveElement}
              onDuplicateElement={handleDuplicateElement}
              onAddSubElement={(parentPath, type) => handleAddElement(type, parentPath)}
              onDropElement={handleAddElement}
              onMoveElement={(sourceIndex, targetIndex, targetParentPath, sourcePath) => {
                if (!state.selectedPageId) return;

                // Wir verwenden den vollständigen Quellpfad, wenn er vorhanden ist
                const fullSourcePath = sourcePath || [sourceIndex];
                // Ob die Quelle auf oberster Ebene ist
                const isSourceTopLevel = fullSourcePath.length === 1;
                // Ob das Ziel auf oberster Ebene ist
                const isTargetTopLevel = !targetParentPath || targetParentPath.length === 0;

                console.log('Handling move with source path:', fullSourcePath, 'to target path:', targetParentPath ? [...targetParentPath, targetIndex] : [targetIndex]);

                // Wir behandeln die verschiedenen Szenarien für Drag & Drop

                if (isSourceTopLevel && isTargetTopLevel) {
                  // Fall 1: Verschieben eines Elements innerhalb der obersten Ebene
                  dispatch({
                    type: 'MOVE_ELEMENT',
                    sourceIndex,
                    targetIndex,
                    pageId: state.selectedPageId
                  });
                } else {
                  // Fall 2: Verschieben zwischen Hierarchieebenen
                  // Wir verwenden MOVE_SUB_ELEMENT für alle anderen Fälle
                  const targetPath = isTargetTopLevel ? [targetIndex] : [...targetParentPath, targetIndex];

                  dispatch({
                    type: 'MOVE_SUB_ELEMENT',
                    sourcePath: fullSourcePath,
                    targetPath,
                    pageId: state.selectedPageId
                  });
                }
              }}
            />
          </EditorAreaWrapper>

          <PropertyEditorWrapper>
            <PropertyEditor
              element={selectedElement}
              onUpdate={handleUpdateElement}
            />
          </PropertyEditorWrapper>
        </EditorContainer>
      </MainContent>

      {/* JSON-Vorschau im eingeklappten Zustand unten */}
      {state.currentFlow && (
        <Box
          sx={{
            height: '5vh',
            borderTop: '1px solid #ddd',
            overflow: 'hidden',
            position: 'relative',
            '&:hover': {
              height: '30vh',
              transition: 'height 0.3s ease-in-out'
            }
          }}
        >
          <JsonPreview
            data={state.currentFlow}
            onEdit={({ updated_src }) => {
              dispatch({ type: 'UPDATE_FLOW', flow: updated_src });
            }}
          />
        </Box>
      )}
    </AppContainer>
    </FieldValuesProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SchemaProvider>
        <EditorProvider>
          <DndProvider>
            <AppContent />
          </DndProvider>
        </EditorProvider>
      </SchemaProvider>
    </ThemeProvider>
  );
};

export default App;

