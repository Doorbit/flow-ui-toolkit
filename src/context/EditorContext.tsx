import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ListingFlow, Page, PatternLibraryElement } from '../models/listingFlow';
import { ChipGroupUIElement } from '../models/uiElements';
import { ensureUUIDs } from '../utils/uuidUtils';

interface EditorState {
  currentFlow: ListingFlow | null;
  undoStack: ListingFlow[];
  redoStack: ListingFlow[];
  selectedElement: PatternLibraryElement | null;
  selectedElementPath: number[]; // Pfad zum ausgewählten Element
  isDirty: boolean;
  selectedPageId: string | null; // ID der ausgewählten Seite
  dialogs: { [key: string]: boolean }; // Zustand für verschiedene Dialoge
}

type Action =
  | { type: 'SET_FLOW'; flow: ListingFlow }
  | { type: 'UPDATE_FLOW'; flow: ListingFlow }
  | { type: 'SELECT_ELEMENT'; element: PatternLibraryElement | null }
  | { type: 'SELECT_ELEMENT_BY_PATH'; path: number[]; pageId: string }
  | { type: 'ADD_ELEMENT'; element: PatternLibraryElement; pageId: string }
  | { type: 'REMOVE_ELEMENT'; elementIndex: number; pageId: string }
  | { type: 'MOVE_ELEMENT'; sourceIndex: number; targetIndex: number; pageId: string }
  | { type: 'ADD_SUB_ELEMENT'; element: PatternLibraryElement; path: number[]; pageId: string }
  | { type: 'REMOVE_SUB_ELEMENT'; path: number[]; pageId: string }
  | { type: 'MOVE_SUB_ELEMENT'; sourcePath: number[]; targetPath: number[]; pageId: string }
  | { type: 'ADD_PAGE'; page: Page }
  | { type: 'UPDATE_PAGE'; page: Page }
  | { type: 'REMOVE_PAGE'; pageId: string }
  | { type: 'SELECT_PAGE'; pageId: string }
  | { type: 'MOVE_PAGE'; sourceIndex: number; targetIndex: number }
  | { type: 'TOGGLE_DIALOG'; payload: { dialog: string; open: boolean } } // Neue Action
  | { type: 'UNDO' }
  | { type: 'REDO' };

const initialState: EditorState = {
  currentFlow: null,
  undoStack: [],
  redoStack: [],
  selectedElement: null,
  selectedElementPath: [],
  isDirty: false,
  selectedPageId: null,
  dialogs: {}, // Initial leer
};

export interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<Action>;
}

export const EditorContext = createContext<EditorContextType | null>(null);

// Hilfsfunktion, um ein Element anhand eines Pfades zu finden
/**
 * Konvertiert ein Element in ein PatternLibraryElement wenn nötig
 */
const ensurePatternLibraryElement = (element: any): PatternLibraryElement => {
  if (element && element.element) {
    return element;
  }
  return { element };
};

/**
 * Bestimmt den Containertyp eines Elements
 * @param element Das zu prüfende Element
 * @returns Der Containertyp des Elements ('group', 'array', 'chipgroup', 'custom', 'subflow', 'none')
 */
export const getContainerType = (element: PatternLibraryElement | null): string => {
  if (!element || !element.element) return 'none';

  // Für Subflow-Objekte (die keinen pattern_type haben, aber einen 'type')
  if (!element.element.pattern_type && (element.element as any).type) {
    return 'subflow';
  }

  // Für reguläre UIElemente mit pattern_type
  switch (element.element.pattern_type) {
    case 'GroupUIElement':
      return 'group';
    case 'ArrayUIElement':
      return 'array';
    case 'ChipGroupUIElement':
      return 'chipgroup';
    case 'CustomUIElement':
      return 'custom';
    default:
      return 'none';
  }
};

/**
 * Bestimmt den Pfadkontext für einen gegebenen Pfad
 * @param elements Die Elemente, in denen der Pfad navigiert wird
 * @param path Der zu analysierende Pfad
 * @returns Ein Objekt mit Informationen über den Pfadkontext
 */
export interface PathContext {
  containerType: string;  // Der Typ des Containers am Ende des Pfads
  containerPath: number[]; // Der Pfad zum Container
  childrenProperty: string; // Die Eigenschaft, die die Kinder enthält ('elements', 'chips', 'sub_flows')
  isValid: boolean; // Ob der Pfad gültig ist
}

export const getPathContext = (elements: PatternLibraryElement[], path: number[]): PathContext => {
  console.log('[getPathContext] path:', path);

  // Standardwerte für den Pfadkontext
  const defaultContext: PathContext = {
    containerType: 'none',
    containerPath: [],
    childrenProperty: 'elements',
    isValid: false
  };

  if (path.length === 0) {
    // Wir sind auf der obersten Ebene
    return {
      containerType: 'root',
      containerPath: [],
      childrenProperty: 'elements',
      isValid: true
    };
  }

  // Wenn der Pfad nur ein Element enthält, ist der Container die oberste Ebene
  if (path.length === 1) {
    const element = elements[path[0]];
    if (!element) return defaultContext;

    return {
      containerType: 'root',
      containerPath: [],
      childrenProperty: 'elements',
      isValid: true
    };
  }

  // Für längere Pfade müssen wir den Pfad bis zum vorletzten Element navigieren
  const parentPath = path.slice(0, -1);
  const parentElement = getElementByPath(elements, parentPath);

  if (!parentElement) return defaultContext;

  const containerType = getContainerType(parentElement);

  // Bestimme die Eigenschaft, die die Kinder enthält
  let childrenProperty = 'elements';
  if (containerType === 'chipgroup') {
    childrenProperty = 'chips';
  } else if (containerType === 'custom' && (parentElement.element as any).sub_flows) {
    childrenProperty = 'sub_flows';
  } else if (containerType === 'subflow') {
    childrenProperty = 'elements';
  }

  return {
    containerType,
    containerPath: parentPath,
    childrenProperty,
    isValid: true
  };
};

/**
 * Holt Unterelemente eines Elements basierend auf seinem Typ
 * Verbesserte Version, die alle Containertypen in doorbit_original.json unterstützt
 */
export const getSubElements = (element: PatternLibraryElement): PatternLibraryElement[] => {
  if (!element || !element.element) return [];

  console.log('[getSubElements] Element:', element.element.pattern_type || (element.element as any).type || 'unknown');

  // Für Subflow-Objekte (die als parentElement übergeben werden, wenn currentPath auf sie zeigt)
  // Ein Subflow-Objekt selbst hat keinen pattern_type, aber einen 'type' (z.B. 'POI')
  // und enthält 'elements'.
  if (!element.element.pattern_type && (element.element as any).type) {
    console.log('[getSubElements] Subflow erkannt, type:', (element.element as any).type);
    // Die Kinder eines Subflow-Objekts sind dessen 'elements'-Array.
    const elementsInSubFlow = (element.element as any).elements || [];
    // Anmerkung: sub_elements wird hier nicht berücksichtigt, um konsistent mit getChildElements zu sein
    return elementsInSubFlow.map(ensurePatternLibraryElement);
  }

  // Für reguläre UIElemente mit pattern_type
  switch (element.element.pattern_type) {
    case 'GroupUIElement':
    case 'ArrayUIElement':
      console.log('[getSubElements] Group/Array erkannt, elements:', ((element.element as any).elements || []).length);
      return ((element.element as any).elements || []).map(ensurePatternLibraryElement);
    case 'ChipGroupUIElement':
      // Chips sind BooleanUIElements, müssen aber als PatternLibraryElement behandelt werden
      console.log('[getSubElements] ChipGroup erkannt, chips:', ((element.element as any).chips || []).length);
      return ((element.element as any).chips || []).map((chip: any) => ensurePatternLibraryElement(chip));
    case 'CustomUIElement':
      // Wenn ein CustomUIElement das parentElement ist, sind seine "Kinder" im Kontext des Drilldowns
      // zunächst seine sub_flows. Das Navigieren IN einen Subflow (um dessen Elemente anzuzeigen)
      // wird dadurch gehandhabt, dass getElementByPath das Subflow-Objekt als neues parentElement liefert.
      console.log('[getSubElements] CustomUIElement erkannt, prüfe auf sub_flows und elements');
      if ((element.element as any).sub_flows) {
        return ((element.element as any).sub_flows || []).map(ensurePatternLibraryElement);
      }
      // Hat ein CustomUIElement keine sub_flows, könnte es direkte 'elements' haben.
      if (Array.isArray((element.element as any).elements)) {
        return ((element.element as any).elements || []).map(ensurePatternLibraryElement);
      }
      return []; // CustomUIElement ohne sub_flows und ohne elements hat keine Kinder in diesem Kontext
  }

  // Generische Fallbacks für andere Typen, die möglicherweise Kinder haben könnten
  // (z.B. SingleSelectionUIElement mit 'options', KeyValueListUIElement mit 'items')
  const potentialChildArrays = ['elements', 'items', 'options'];
  for (const key of potentialChildArrays) {
    const childArray = (element.element as any)[key];
    if (Array.isArray(childArray) && childArray.length > 0) {
      // Prüfen, ob die Elemente der Arrays bereits PatternLibraryElement sind oder rohe Objekte
      return childArray.map((item: any) => ensurePatternLibraryElement(item));
    }
  }

  // Fallback: Wenn kein spezifischer Kind-Array-Typ gefunden wurde, aber eine beliebige Array-Eigenschaft existiert,
  // die Objekte enthält (weniger wahrscheinlich für Drilldown, aber zur Sicherheit)
  for (const key in element.element) {
    const value = (element.element as any)[key];
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      // Hier ist Vorsicht geboten, da nicht jedes Array von Objekten navigierbare Kinder darstellt.
      // Für den Drilldown sind primär 'elements' in Group/Array/SubFlow und 'sub_flows' in CustomUIElement relevant.
      return value.map((item: any) => ensurePatternLibraryElement(item));
    }
  }

  return [];
};

/**
 * Findet ein Element anhand eines Pfades in der Element-Hierarchie
 * Verbesserte Version, die alle Containertypen in doorbit_original.json unterstützt
 */
export const getElementByPath = (elements: PatternLibraryElement[], path: number[]): PatternLibraryElement | null => {
  if (path.length === 0 || !elements || elements.length === 0) return null;

  const [index, ...restPath] = path;
  if (index >= elements.length) return null;

  const element = elements[index];
  if (restPath.length === 0) return element;

  console.log('[getElementByPath] Navigiere zu Element:',
    element.element.pattern_type || (element.element as any).type || 'unknown',
    'restPath:', restPath);

  // Rekursiv durch die Unterelemente navigieren
  const subElements = getSubElements(element);
  if (subElements.length > 0) {
    // Spezielle Behandlung für CustomUIElement mit sub_flows
    if (element.element.pattern_type === 'CustomUIElement' && (element.element as any).sub_flows) {
      const subFlowIndex = restPath[0];
      const subFlows = (element.element as any).sub_flows || [];

      console.log('[getElementByPath] CustomUIElement mit sub_flows erkannt, subFlowIndex:', subFlowIndex, 'subFlows.length:', subFlows.length);

      if (subFlowIndex < subFlows.length) {
        if (restPath.length === 1) {
          // Wir wollen das SubFlow-Objekt selbst zurückgeben
          console.log('[getElementByPath] Gebe SubFlow-Objekt zurück');
          return ensurePatternLibraryElement(subFlows[subFlowIndex]);
        } else {
          // Wir wollen ein Element innerhalb des SubFlows zurückgeben
          const subFlowElement = ensurePatternLibraryElement(subFlows[subFlowIndex]);
          console.log('[getElementByPath] Navigiere in SubFlow:', (subFlowElement.element as any).type || 'unknown');

          // Hier verwenden wir getSubElements für das SubFlow-Element, um seine Unterelemente zu finden
          const subFlowChildElements = getSubElements(subFlowElement);

          // Dann navigieren wir weiter mit dem Rest des Pfades
          return getElementByPath(subFlowChildElements, restPath.slice(1));
        }
      }
    }

    // Spezielle Behandlung für ChipGroupUIElement mit chips
    else if (element.element.pattern_type === 'ChipGroupUIElement' && (element.element as any).chips) {
      console.log('[getElementByPath] ChipGroupUIElement mit chips erkannt');
      // Hier müssen wir sicherstellen, dass die chips korrekt als PatternLibraryElements behandelt werden
      return getElementByPath(subElements, restPath);
    }

    // Standardbehandlung für andere Containertypen
    else {
      console.log('[getElementByPath] Standard-Container erkannt, navigiere zu Unterelementen');
      return getElementByPath(subElements, restPath);
    }
  }

  console.log('[getElementByPath] Keine Unterelemente gefunden oder ungültiger Pfad');
  return null;
};

// Hilfsfunktion zum Aktualisieren tief verschachtelter Elemente
/*
const updateElementAtPath = (
  elements: PatternLibraryElement[],
  path: number[],
  updater: (element: PatternLibraryElement) => PatternLibraryElement
): PatternLibraryElement[] => {
  if (path.length === 0) return elements;

  const [index, ...restPath] = path;
  if (index >= elements.length) return elements;

  return elements.map((element, i) => {
    if (i !== index) return element;

    if (restPath.length === 0) {
      // Letzter Pfadteil erreicht, Element aktualisieren
      return updater(element);
    }

    // In die Tiefe gehen
    if (element.element.pattern_type === 'GroupUIElement' ||
        element.element.pattern_type === 'ArrayUIElement') {
      const subElements = [...((element.element as any).elements || [])];
      const updatedSubElements = updateElementAtPath(subElements, restPath, updater);

      return {
        ...element,
        element: {
          ...(element.element as any),
          elements: updatedSubElements
        }
      };
    }

    // Für ChipGroupUIElement mit chips-Array
    if (element.element.pattern_type === 'ChipGroupUIElement') {
      console.log('updateElementAtPath für ChipGroup:', element);
      const chipElements = ((element.element as any).chips || []).map((chip: any) => ({
        element: chip
      }));
      const updatedChipElements = updateElementAtPath(chipElements, restPath, updater);

      // Extrahiere die BooleanUIElements aus den PatternLibraryElements zurück
      const updatedChips = updatedChipElements.map((chipElement: any) => chipElement.element);
      console.log('Aktualisierte Chips:', updatedChips);

      return {
        ...element,
        element: {
          ...(element.element as any),
          chips: updatedChips
        }
      };
    }

    return element;
  });
};
*/

/**
 * Hilfsfunktion zum Hinzufügen eines Elements an einem bestimmten Pfad
 * Verbesserte Version, die alle Containertypen in doorbit_original.json unterstützt
 */
const addElementAtPath = (
  elements: PatternLibraryElement[],
  path: number[],
  newElement: PatternLibraryElement
): PatternLibraryElement[] => {
  console.log('[addElementAtPath] path:', path, 'newElement.pattern_type:', newElement.element.pattern_type);

  if (path.length === 0) {
    // Hinzufügen am Ende der Liste
    console.log('[addElementAtPath] Füge Element am Ende der Liste hinzu');
    return [...elements, newElement];
  }

  const [index, ...restPath] = path;
  if (index > elements.length) {
    console.log('[addElementAtPath] Index außerhalb des gültigen Bereichs');
    return elements;
  }

  if (restPath.length === 0) {
    // Element an dieser Stelle einfügen
    console.log('[addElementAtPath] Füge Element an Position', index, 'ein');
    const result = [...elements];
    result.splice(index, 0, newElement);
    return result;
  }

  return elements.map((element, i) => {
    if (i !== index) return element;

    console.log('[addElementAtPath] Navigiere zu Element:',
      element.element.pattern_type || (element.element as any).type || 'unknown');

    // Spezielle Behandlung für CustomUIElement mit sub_flows
    if (element.element.pattern_type === 'CustomUIElement' && (element.element as any).sub_flows) {
      const subFlowIndex = restPath[0];
      const subFlows = [...((element.element as any).sub_flows || [])];

      console.log('[addElementAtPath] CustomUIElement mit sub_flows erkannt, subFlowIndex:', subFlowIndex);

      // Wenn wir direkt in einen sub_flow einfügen wollen
      if (restPath.length === 1) {
        console.log('[addElementAtPath] Füge neuen sub_flow hinzu');
        // Hier fügen wir einen neuen sub_flow hinzu
        subFlows.splice(subFlowIndex, 0, newElement.element);

        return {
          ...element,
          element: {
            ...(element.element as any),
            sub_flows: subFlows
          }
        };
      }

      // Wenn wir in einen bestehenden sub_flow einfügen wollen
      if (subFlowIndex < subFlows.length) {
        console.log('[addElementAtPath] Füge Element in bestehenden sub_flow ein');
        const subFlow = subFlows[subFlowIndex];

        // Konvertiere den sub_flow zu einem PatternLibraryElement
        const subFlowElement = ensurePatternLibraryElement(subFlow);

        // Hole die Elemente des sub_flows
        const subFlowElements = ((subFlowElement.element as any).elements || []).map(ensurePatternLibraryElement);

        // Füge das neue Element in die Elemente des sub_flows ein
        const updatedSubFlowElements = addElementAtPath(subFlowElements, restPath.slice(1), newElement);

        // Aktualisiere den sub_flow
        subFlows[subFlowIndex] = {
          ...subFlow,
          elements: updatedSubFlowElements.map(el => el.element ? el : { element: el })
        };

        return {
          ...element,
          element: {
            ...(element.element as any),
            sub_flows: subFlows
          }
        };
      }
    }

    // In die Tiefe gehen für GroupUIElement oder ArrayUIElement
    else if (element.element.pattern_type === 'GroupUIElement' ||
        element.element.pattern_type === 'ArrayUIElement') {
      console.log('[addElementAtPath] Group/Array erkannt, navigiere zu Unterelementen');
      const subElements = [...((element.element as any).elements || [])];
      const updatedSubElements = addElementAtPath(subElements, restPath, newElement);

      return {
        ...element,
        element: {
          ...(element.element as any),
          elements: updatedSubElements
        }
      };
    }

    // Für ChipGroupUIElement mit chips-Array
    else if (element.element.pattern_type === 'ChipGroupUIElement') {
      console.log('[addElementAtPath] ChipGroup erkannt, verarbeite chips');
      // Wenn wir ein Element zu einer ChipGroup hinzufügen, muss es ein BooleanUIElement sein
      if (newElement.element.pattern_type !== 'BooleanUIElement') {
        console.error('Nur BooleanUIElements können zu ChipGroups hinzugefügt werden');
        return element;
      }

      // Konvertiere die chips zu PatternLibraryElements für die Verarbeitung
      const chipElements = ((element.element as ChipGroupUIElement).chips || []).map(chip => ({
        element: chip
      }));

      // Füge das neue Element zum chips-Array hinzu
      const updatedChipElements = addElementAtPath(chipElements, restPath, newElement);

      // Extrahiere die BooleanUIElements aus den PatternLibraryElements zurück
      const updatedChips = updatedChipElements.map(chipElement => chipElement.element);

      return {
        ...element,
        element: {
          ...(element.element as ChipGroupUIElement),
          chips: updatedChips
        }
      };
    }

    console.log('[addElementAtPath] Kein unterstützter Containertyp gefunden');
    return element;
  });
};

/**
 * Hilfsfunktion zum Entfernen eines Elements an einem bestimmten Pfad
 * Verbesserte Version, die alle Containertypen in doorbit_original.json unterstützt
 */
const removeElementAtPath = (
  elements: PatternLibraryElement[],
  path: number[]
): PatternLibraryElement[] => {
  console.log('[removeElementAtPath] path:', path);

  if (path.length === 0) return elements;

  const [index, ...restPath] = path;
  if (index >= elements.length) {
    console.log('[removeElementAtPath] Index außerhalb des gültigen Bereichs');
    return elements;
  }

  if (restPath.length === 0) {
    // Element an dieser Stelle entfernen
    console.log('[removeElementAtPath] Entferne Element an Position', index);
    return elements.filter((_, i) => i !== index);
  }

  return elements.map((element, i) => {
    if (i !== index) return element;

    console.log('[removeElementAtPath] Navigiere zu Element:',
      element.element.pattern_type || (element.element as any).type || 'unknown');

    // Spezielle Behandlung für CustomUIElement mit sub_flows
    if (element.element.pattern_type === 'CustomUIElement' && (element.element as any).sub_flows) {
      const subFlowIndex = restPath[0];
      const subFlows = [...((element.element as any).sub_flows || [])];

      console.log('[removeElementAtPath] CustomUIElement mit sub_flows erkannt, subFlowIndex:', subFlowIndex);

      // Wenn wir einen sub_flow entfernen wollen
      if (restPath.length === 1) {
        console.log('[removeElementAtPath] Entferne sub_flow');
        // Entferne den sub_flow
        const updatedSubFlows = subFlows.filter((_, i) => i !== subFlowIndex);

        return {
          ...element,
          element: {
            ...(element.element as any),
            sub_flows: updatedSubFlows
          }
        };
      }

      // Wenn wir ein Element innerhalb eines sub_flows entfernen wollen
      if (subFlowIndex < subFlows.length) {
        console.log('[removeElementAtPath] Entferne Element aus sub_flow');
        const subFlow = subFlows[subFlowIndex];

        // Konvertiere den sub_flow zu einem PatternLibraryElement
        const subFlowElement = ensurePatternLibraryElement(subFlow);

        // Hole die Elemente des sub_flows
        const subFlowElements = ((subFlowElement.element as any).elements || []).map(ensurePatternLibraryElement);

        // Entferne das Element aus den Elementen des sub_flows
        const updatedSubFlowElements = removeElementAtPath(subFlowElements, restPath.slice(1));

        // Aktualisiere den sub_flow
        subFlows[subFlowIndex] = {
          ...subFlow,
          elements: updatedSubFlowElements.map(el => el.element ? el : { element: el })
        };

        return {
          ...element,
          element: {
            ...(element.element as any),
            sub_flows: subFlows
          }
        };
      }
    }

    // In die Tiefe gehen für GroupUIElement oder ArrayUIElement
    else if (element.element.pattern_type === 'GroupUIElement' ||
        element.element.pattern_type === 'ArrayUIElement') {
      console.log('[removeElementAtPath] Group/Array erkannt, navigiere zu Unterelementen');
      const subElements = [...((element.element as any).elements || [])];
      const updatedSubElements = removeElementAtPath(subElements, restPath);

      return {
        ...element,
        element: {
          ...(element.element as any),
          elements: updatedSubElements
        }
      };
    }

    // Für ChipGroupUIElement mit chips-Array
    else if (element.element.pattern_type === 'ChipGroupUIElement') {
      console.log('[removeElementAtPath] ChipGroup erkannt, verarbeite chips');
      // Konvertiere die chips zu PatternLibraryElements für die Verarbeitung
      const chipElements = ((element.element as ChipGroupUIElement).chips || []).map(chip => ({
        element: chip
      }));

      // Entferne das Element aus dem chips-Array
      const updatedChipElements = removeElementAtPath(chipElements, restPath);

      // Extrahiere die BooleanUIElements aus den PatternLibraryElements zurück
      const updatedChips = updatedChipElements.map(chipElement => chipElement.element);

      return {
        ...element,
        element: {
          ...(element.element as ChipGroupUIElement),
          chips: updatedChips
        }
      };
    }

    console.log('[removeElementAtPath] Kein unterstützter Containertyp gefunden');
    return element;
  });
};

function editorReducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'SET_FLOW':
      // Sicherstellen, dass alle Elemente UUIDs haben
      const flowWithUUIDs = ensureUUIDs(action.flow);

      return {
        ...state,
        currentFlow: flowWithUUIDs,
        undoStack: [],
        redoStack: [],
        selectedElement: null,
        selectedElementPath: [],
        isDirty: false,
        // Erste Seite als Standard auswählen, wenn verfügbar
        selectedPageId: flowWithUUIDs?.pages_edit.length > 0 ? flowWithUUIDs.pages_edit[0].id : null,
      };

    case 'UPDATE_FLOW':
      return {
        ...state,
        undoStack: state.currentFlow ? [...state.undoStack, state.currentFlow] : state.undoStack,
        currentFlow: action.flow,
        redoStack: [],
        isDirty: true,
      };

    case 'SELECT_ELEMENT':
      return {
        ...state,
        selectedElement: action.element,
      };

    case 'SELECT_ELEMENT_BY_PATH': {
      if (!state.currentFlow) return state;

      const page = state.currentFlow.pages_edit.find(p => p.id === action.pageId);
      if (!page) return state;

      const selectedElement = getElementByPath(page.elements, action.path);

      return {
        ...state,
        selectedElement,
        selectedElementPath: action.path,
      };
    }

    case 'ADD_ELEMENT':
      if (!state.currentFlow) return state;

      const newFlowWithAdd = {
        ...state.currentFlow,
        pages_edit: state.currentFlow.pages_edit.map((page: Page) =>
          page.id === action.pageId
            ? { ...page, elements: [...page.elements, action.element] }
            : page
        ),
      };

      return {
        ...state,
        undoStack: [...state.undoStack, state.currentFlow],
        currentFlow: newFlowWithAdd,
        redoStack: [],
        isDirty: true,
      };

    case 'REMOVE_ELEMENT':
      if (!state.currentFlow) return state;

      const newFlowWithRemove = {
        ...state.currentFlow,
        pages_edit: state.currentFlow.pages_edit.map((page: Page) =>
          page.id === action.pageId
            ? {
                ...page,
                elements: page.elements.filter((_, index) => index !== action.elementIndex),
              }
            : page
        ),
      };

      return {
        ...state,
        undoStack: [...state.undoStack, state.currentFlow],
        currentFlow: newFlowWithRemove,
        redoStack: [],
        selectedElement: null,
        selectedElementPath: [],
        isDirty: true,
      };

    case 'MOVE_ELEMENT':
      if (!state.currentFlow) return state;

      const newFlowWithMove = {
        ...state.currentFlow,
        pages_edit: state.currentFlow.pages_edit.map((page: Page) => {
          if (page.id !== action.pageId) return page;

          const elements = [...page.elements];
          const [moved] = elements.splice(action.sourceIndex, 1);
          elements.splice(action.targetIndex, 0, moved);

          return { ...page, elements };
        }),
      };

      return {
        ...state,
        undoStack: [...state.undoStack, state.currentFlow],
        currentFlow: newFlowWithMove,
        redoStack: [],
        isDirty: true,
      };

    case 'ADD_SUB_ELEMENT': {
      if (!state.currentFlow) return state;

      const newFlowWithAddSub = {
        ...state.currentFlow,
        pages_edit: state.currentFlow.pages_edit.map((page: Page) => {
          if (page.id !== action.pageId) return page;

          if (action.path.length === 0) {
            // Top-Level Element hinzufügen
            return {
              ...page,
              elements: [...page.elements, action.element]
            };
          }

          // Element an einem bestimmten Pfad hinzufügen
          const updatedElements = addElementAtPath(page.elements, action.path, action.element);

          return {
            ...page,
            elements: updatedElements
          };
        }),
      };

      return {
        ...state,
        undoStack: [...state.undoStack, state.currentFlow],
        currentFlow: newFlowWithAddSub,
        redoStack: [],
        isDirty: true,
      };
    }

    case 'REMOVE_SUB_ELEMENT': {
      if (!state.currentFlow) return state;

      const newFlowWithRemoveSub = {
        ...state.currentFlow,
        pages_edit: state.currentFlow.pages_edit.map((page: Page) => {
          if (page.id !== action.pageId) return page;

          // Element an einem bestimmten Pfad entfernen
          const updatedElements = removeElementAtPath(page.elements, action.path);

          return {
            ...page,
            elements: updatedElements
          };
        }),
      };

      return {
        ...state,
        undoStack: [...state.undoStack, state.currentFlow],
        currentFlow: newFlowWithRemoveSub,
        redoStack: [],
        // Wenn das aktuell ausgewählte Element entfernt wurde, Auswahl zurücksetzen
        selectedElement: JSON.stringify(state.selectedElementPath).startsWith(JSON.stringify(action.path))
          ? null
          : state.selectedElement,
        selectedElementPath: JSON.stringify(state.selectedElementPath).startsWith(JSON.stringify(action.path))
          ? []
          : state.selectedElementPath,
        isDirty: true,
      };
    }

    case 'MOVE_SUB_ELEMENT': {
      if (!state.currentFlow) return state;

      const sourcePage = state.currentFlow.pages_edit.find(p => p.id === action.pageId);
      if (!sourcePage) return state;

      const sourceElement = getElementByPath(sourcePage.elements, action.sourcePath);
      if (!sourceElement) return state;

      // Erst entfernen, dann hinzufügen
      let newFlowWithRemove = {
        ...state.currentFlow,
        pages_edit: state.currentFlow.pages_edit.map((page: Page) => {
          if (page.id !== action.pageId) return page;

          // Element an Quellpfad entfernen
          const updatedElements = removeElementAtPath(page.elements, action.sourcePath);

          return {
            ...page,
            elements: updatedElements
          };
        }),
      };

      const newFlowWithMove = {
        ...newFlowWithRemove,
        pages_edit: newFlowWithRemove.pages_edit.map((page: Page) => {
          if (page.id !== action.pageId) return page;

          // Element am Zielpfad hinzufügen
          const updatedElements = addElementAtPath(page.elements, action.targetPath, sourceElement);

          return {
            ...page,
            elements: updatedElements
          };
        }),
      };

      return {
        ...state,
        undoStack: [...state.undoStack, state.currentFlow],
        currentFlow: newFlowWithMove,
        redoStack: [],
        isDirty: true,
      };
    }

    case 'UNDO':
      if (state.undoStack.length === 0) return state;

      const previousFlow = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        currentFlow: previousFlow,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: state.currentFlow ? [...state.redoStack, state.currentFlow] : state.redoStack,
        selectedElement: null,
        selectedElementPath: [],
        isDirty: true,
      };

    case 'REDO':
      if (state.redoStack.length === 0) return state;

      const nextFlow = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        currentFlow: nextFlow,
        undoStack: state.currentFlow ? [...state.undoStack, state.currentFlow] : state.undoStack,
        redoStack: state.redoStack.slice(0, -1),
        selectedElement: null,
        selectedElementPath: [],
        isDirty: true,
      };

    case 'ADD_PAGE': {
      if (!state.currentFlow) return state;

      // Erstelle die entsprechende View-Seite für eine Edit-Seite
      const viewPage: Page = {
        ...action.page,
        pattern_type: 'CustomUIElement', // Verwende CustomUIElement für View-Seiten
        id: action.page.id.replace('edit-', 'view-'), // Ersetze "edit-" durch "view-"
        layout: '2_COL_RIGHT_WIDER', // Standardlayout für View-Seiten
        elements: [], // View-Seite beginnt mit leerer Elementliste
        related_pages: [{ // Verknüpfe mit der Edit-Seite
          viewing_context: 'EDIT',
          page_id: action.page.id
        }]
      };

      // Aktualisiere auch die Edit-Seite, um sie mit der View-Seite zu verknüpfen
      const editPage: Page = {
        ...action.page,
        related_pages: [{ // Verknüpfe mit der View-Seite
          viewing_context: 'VIEW',
          page_id: viewPage.id
        }]
      };

      const newFlow = {
        ...state.currentFlow,
        pages_edit: [...state.currentFlow.pages_edit, editPage],
        pages_view: [...state.currentFlow.pages_view, viewPage]
      };

      return {
        ...state,
        undoStack: [...state.undoStack, state.currentFlow],
        currentFlow: newFlow,
        redoStack: [],
        selectedPageId: action.page.id, // Neue Seite auswählen
        selectedElement: null,
        selectedElementPath: [],
        isDirty: true,
      };
    }

    case 'REMOVE_PAGE': {
      if (!state.currentFlow) return state;

      // Prüfen, ob es die letzte Seite ist - wenn ja, nicht löschen
      if (state.currentFlow.pages_edit.length <= 1) {
        return state;
      }

      const newFlow = {
        ...state.currentFlow,
        pages_edit: state.currentFlow.pages_edit.filter(page => page.id !== action.pageId),
        pages_view: state.currentFlow.pages_view.filter(page => page.id !== action.pageId)
      };

      // Bestimme die nächste ausgewählte Seite
      let nextSelectedPageId = state.selectedPageId;
      if (state.selectedPageId === action.pageId) {
        // Wähle die erste verbleibende Seite aus, wenn die aktuelle Seite gelöscht wird
        nextSelectedPageId = newFlow.pages_edit.length > 0 ? newFlow.pages_edit[0].id : null;
      }

      return {
        ...state,
        undoStack: [...state.undoStack, state.currentFlow],
        currentFlow: newFlow,
        redoStack: [],
        selectedPageId: nextSelectedPageId,
        selectedElement: null,
        selectedElementPath: [],
        isDirty: true,
      };
    }

    case 'SELECT_PAGE': {
      return {
        ...state,
        selectedPageId: action.pageId,
        selectedElement: null,
        selectedElementPath: [],
      };
    }

    case 'MOVE_PAGE': {
      if (!state.currentFlow) return state;

      const pagesEdit = [...state.currentFlow.pages_edit];
      const pagesView = [...state.currentFlow.pages_view];

      // Seite aus pages_edit verschieben
      const [movedPageEdit] = pagesEdit.splice(action.sourceIndex, 1);
      pagesEdit.splice(action.targetIndex, 0, movedPageEdit);

      // Entsprechende Seite in pages_view auch verschieben
      const [movedPageView] = pagesView.splice(action.sourceIndex, 1);
      pagesView.splice(action.targetIndex, 0, movedPageView);

      const newFlow = {
        ...state.currentFlow,
        pages_edit: pagesEdit,
        pages_view: pagesView
      };

      return {
        ...state,
        undoStack: [...state.undoStack, state.currentFlow],
        currentFlow: newFlow,
        redoStack: [],
        isDirty: true
      };
    }

    case 'UPDATE_PAGE': {
      if (!state.currentFlow) return state;

      // Bestimme die korrespondierende View-Seiten-ID
      const viewPageId = action.page.id.startsWith('edit-')
        ? action.page.id.replace('edit-', 'view-')
        : action.page.id.replace('view-', 'edit-');

      // Aktualisiere die Seite in pages_edit
      const updatedPagesEdit = state.currentFlow.pages_edit.map(page =>
        page.id === action.page.id ? action.page : page
      );

      // Aktualisiere auch die entsprechende Seite in pages_view
      // Synchronisiere title, short_title und icon, aber behalte die elements der View-Seite bei
      const updatedPagesView = state.currentFlow.pages_view.map(page => {
        if (page.id === viewPageId || page.id === action.page.id) {
          return {
            ...page,
            title: action.page.title,
            short_title: action.page.short_title,
            icon: action.page.icon,
            layout: action.page.layout,
            visibility_condition: action.page.visibility_condition
          };
        }
        return page;
      });

      const newFlow = {
        ...state.currentFlow,
        pages_edit: updatedPagesEdit,
        pages_view: updatedPagesView
      };

      return {
        ...state,
        undoStack: [...state.undoStack, state.currentFlow],
        currentFlow: newFlow,
        redoStack: [],
        isDirty: true
      };
    }

    case 'TOGGLE_DIALOG': {
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          [action.payload.dialog]: action.payload.open,
        },
      };
    }

    default:
      return state;
  }
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
