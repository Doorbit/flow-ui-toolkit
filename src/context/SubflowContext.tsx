import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PatternLibraryElement } from '../models/listingFlow';
import { CustomUIElement } from '../models/uiElements';
import { findElementByPath, updateElementByPath } from '../utils/SubflowManager';
import { useEditor } from './EditorContext';

/**
 * Repräsentiert den Zustand der Subflow-Bearbeitung.
 */
interface SubflowState {
  // Das CustomUIElement, das die Subflows enthält
  customElement: CustomUIElement | null;
  // Der Index des aktuell ausgewählten Subflows
  selectedSubflowIndex: number | null;
  // Der Typ des aktuell ausgewählten Subflows (z.B. 'POI', 'POI_PHOTO')
  selectedSubflowType: string | null;
  // Der Pfad zum aktuell ausgewählten Element innerhalb des Subflows
  selectedElementPath: number[] | null;
  // Das aktuell ausgewählte Element
  selectedElement: PatternLibraryElement | null;
  // Der Navigationspfad (für Breadcrumbs)
  navigationPath: Array<{ label: string; path: number[] }>;
  // Der Bearbeitungsmodus (z.B. 'view', 'edit', 'add')
  editMode: 'view' | 'edit' | 'add';
}

/**
 * Die möglichen Aktionen für den Subflow-Reducer.
 */
type SubflowAction =
  | { type: 'SET_CUSTOM_ELEMENT'; customElement: CustomUIElement }
  | { type: 'SELECT_SUBFLOW'; subflowIndex: number; subflowType: string }
  | { type: 'SELECT_ELEMENT'; path: number[]; element: PatternLibraryElement }
  | { type: 'NAVIGATE_UP' }
  | { type: 'NAVIGATE_TO_ROOT' }
  | { type: 'SET_EDIT_MODE'; mode: 'view' | 'edit' | 'add' }
  | { type: 'UPDATE_ELEMENT'; updates: Record<string, any> }
  | { type: 'ADD_ELEMENT'; element: PatternLibraryElement; path: number[] }
  | { type: 'REMOVE_ELEMENT'; path: number[] };

/**
 * Der initiale Zustand für den Subflow-Reducer.
 */
const initialSubflowState: SubflowState = {
  customElement: null,
  selectedSubflowIndex: null,
  selectedSubflowType: null,
  selectedElementPath: null,
  selectedElement: null,
  navigationPath: [] as Array<{ label: string; path: number[] }>,
  editMode: 'view',
};

/**
 * Der Typ für den Subflow-Kontext.
 */
export interface SubflowContextType {
  state: SubflowState;
  dispatch: React.Dispatch<SubflowAction>;
  // Hilfsfunktionen
  navigateToElement: (path: number[], element: PatternLibraryElement) => void;
  navigateUp: () => void;
  navigateToRoot: () => void;
  updateElement: (updates: Record<string, any>) => void;
  addElement: (element: PatternLibraryElement, path: number[]) => void;
  removeElement: (path: number[]) => void;
  setEditMode: (mode: 'view' | 'edit' | 'add') => void;
}

/**
 * Der Subflow-Kontext.
 */
export const SubflowContext = createContext<SubflowContextType | null>(null);

/**
 * Der Reducer für den Subflow-Kontext.
 */
function subflowReducer(state: SubflowState, action: SubflowAction): SubflowState {
  switch (action.type) {
    case 'SET_CUSTOM_ELEMENT':
      return {
        ...state,
        customElement: action.customElement,
        selectedSubflowIndex: null,
        selectedSubflowType: null,
        selectedElementPath: null,
        selectedElement: null,
        navigationPath: [],
        editMode: 'view',
      };

    case 'SELECT_SUBFLOW':
      return {
        ...state,
        selectedSubflowIndex: action.subflowIndex,
        selectedSubflowType: action.subflowType,
        selectedElementPath: null,
        selectedElement: null,
        navigationPath: [
          {
            label: action.subflowType,
            path: [],
          },
        ],
        editMode: 'view',
      };

    case 'SELECT_ELEMENT': {
      // Erstelle einen neuen Navigationspfad basierend auf dem ausgewählten Element
      const newNavigationPath: Array<{ label: string; path: number[] }> = [
        {
          label: state.selectedSubflowType || '',
          path: [],
        },
      ];

      // Füge für jeden Schritt im Pfad einen Eintrag zum Navigationspfad hinzu
      let currentPath: number[] = [];
      for (let i = 0; i < action.path.length; i++) {
        currentPath = [...currentPath, action.path[i]];

        // Finde das Element an diesem Pfad
        const element = state.customElement && state.selectedSubflowIndex !== null
          ? findElementByPath(state.customElement, {
              subflowIndex: state.selectedSubflowIndex,
              path: currentPath,
            })
          : null;

        // Füge einen Eintrag zum Navigationspfad hinzu
        if (element) {
          const label = element.element.title?.de || element.element.pattern_type;
          newNavigationPath.push({
            label,
            path: [...currentPath] as number[],
          });
        }
      }

      return {
        ...state,
        selectedElementPath: action.path,
        selectedElement: action.element,
        navigationPath: newNavigationPath,
        editMode: 'view',
      };
    }

    case 'NAVIGATE_UP': {
      if (state.navigationPath.length <= 1) {
        // Wenn wir bereits auf der obersten Ebene sind, bleiben wir dort
        return {
          ...state,
          selectedElementPath: null,
          selectedElement: null,
          navigationPath: state.navigationPath.slice(0, 1),
          editMode: 'view',
        };
      }

      // Entferne den letzten Eintrag aus dem Navigationspfad
      const newNavigationPath = state.navigationPath.slice(0, -1);
      const lastEntry = newNavigationPath[newNavigationPath.length - 1];

      // Finde das Element am neuen Pfad
      const element = state.customElement && state.selectedSubflowIndex !== null
        ? findElementByPath(state.customElement, {
            subflowIndex: state.selectedSubflowIndex,
            path: lastEntry.path,
          })
        : null;

      return {
        ...state,
        selectedElementPath: lastEntry.path,
        selectedElement: element,
        navigationPath: newNavigationPath,
        editMode: 'view',
      };
    }

    case 'NAVIGATE_TO_ROOT':
      return {
        ...state,
        selectedElementPath: null,
        selectedElement: null,
        navigationPath: state.navigationPath.slice(0, 1),
        editMode: 'view',
      };

    case 'SET_EDIT_MODE':
      return {
        ...state,
        editMode: action.mode,
      };

    case 'UPDATE_ELEMENT': {
      if (!state.customElement || state.selectedSubflowIndex === null || state.selectedElementPath === null) {
        return state;
      }

      // Aktualisiere das Element im CustomUIElement
      const updatedCustomElement = updateElementByPath(
        state.customElement,
        {
          subflowIndex: state.selectedSubflowIndex,
          path: state.selectedElementPath,
        },
        action.updates
      );

      // Finde das aktualisierte Element
      const updatedElement = findElementByPath(updatedCustomElement, {
        subflowIndex: state.selectedSubflowIndex,
        path: state.selectedElementPath,
      });

      return {
        ...state,
        customElement: updatedCustomElement,
        selectedElement: updatedElement,
        editMode: 'view',
      };
    }

    case 'ADD_ELEMENT': {
      if (!state.customElement || state.selectedSubflowIndex === null) {
        return state;
      }

      // Kopie des CustomUIElement erstellen
      const updatedCustomElement = JSON.parse(JSON.stringify(state.customElement));

      // Finde den Subflow
      const subflow = updatedCustomElement.sub_flows?.[state.selectedSubflowIndex];
      if (!subflow) {
        return state;
      }

      // Wenn der Pfad leer ist, füge das Element direkt zum Subflow hinzu
      if (action.path.length === 0) {
        subflow.elements.push(action.element);
      } else {
        // Finde das übergeordnete Element
        let currentElements = subflow.elements;
        let currentPath = [];

        for (let i = 0; i < action.path.length; i++) {
          const index = action.path[i];
          currentPath.push(index);

          if (i === action.path.length - 1) {
            // Letzter Schritt im Pfad, füge das Element hier hinzu
            const element = currentElements[index];

            if (element.element.pattern_type === 'GroupUIElement') {
              element.element.elements.push(action.element);
            } else if (element.element.pattern_type === 'ArrayUIElement') {
              element.element.elements.push(action.element);
            } else if (element.element.pattern_type === 'ChipGroupUIElement') {
              // Für ChipGroupUIElement müssen wir prüfen, ob das neue Element ein BooleanUIElement ist
              if (action.element.element.pattern_type === 'BooleanUIElement') {
                element.element.chips.push(action.element.element);
              }
            }
          } else {
            // Zwischenschritt, navigiere tiefer
            const element = currentElements[index];

            if (element.element.pattern_type === 'GroupUIElement') {
              currentElements = element.element.elements;
            } else if (element.element.pattern_type === 'ArrayUIElement') {
              currentElements = element.element.elements;
            } else if (element.element.pattern_type === 'ChipGroupUIElement') {
              // ChipGroupUIElement hat keine elements, sondern chips
              // Wir müssen die chips als "Elemente" behandeln
              currentElements = element.element.chips.map((chip: any) => ({ element: chip }));
            }
          }
        }
      }

      return {
        ...state,
        customElement: updatedCustomElement,
        editMode: 'view',
      };
    }

    case 'REMOVE_ELEMENT': {
      if (!state.customElement || state.selectedSubflowIndex === null) {
        return state;
      }

      // Kopie des CustomUIElement erstellen
      const updatedCustomElement = JSON.parse(JSON.stringify(state.customElement));

      // Finde den Subflow
      const subflow = updatedCustomElement.sub_flows?.[state.selectedSubflowIndex];
      if (!subflow) {
        return state;
      }

      // Wenn der Pfad leer ist, können wir nichts entfernen
      if (action.path.length === 0) {
        return state;
      }

      // Finde das übergeordnete Element
      let currentElements = subflow.elements;
      let lastIndex = action.path[action.path.length - 1];

      for (let i = 0; i < action.path.length - 1; i++) {
        const index = action.path[i];

        if (!currentElements || !currentElements[index]) {
          return state;
        }

        const element = currentElements[index];



        // Gehe tiefer
        if (element.element.pattern_type === 'GroupUIElement') {
          currentElements = element.element.elements;
        } else if (element.element.pattern_type === 'ArrayUIElement') {
          currentElements = element.element.elements;
        } else if (element.element.pattern_type === 'ChipGroupUIElement') {
          // ChipGroupUIElement hat keine elements, sondern chips
          // Wir müssen die chips als "Elemente" behandeln
          currentElements = element.element.chips.map((chip: any) => ({ element: chip }));
        } else {
          // Das Element hat keine verschachtelten Elemente
          return state;
        }

        // Aktualisiere lastIndex für den nächsten Schritt
        lastIndex = action.path[i + 1];
      }

      // Entferne das Element
      if (currentElements && currentElements[lastIndex]) {
        currentElements.splice(lastIndex, 1);
      }

      return {
        ...state,
        customElement: updatedCustomElement,
        selectedElementPath: null,
        selectedElement: null,
        navigationPath: state.navigationPath.slice(0, 1),
        editMode: 'view',
      };
    }

    default:
      return state;
  }
}

/**
 * Der Provider für den Subflow-Kontext.
 */
export function SubflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(subflowReducer, initialSubflowState);
  const { dispatch: editorDispatch } = useEditor();

  // Hilfsfunktionen
  const navigateToElement = (path: number[], element: PatternLibraryElement) => {
    dispatch({ type: 'SELECT_ELEMENT', path, element });
  };

  const navigateUp = () => {
    dispatch({ type: 'NAVIGATE_UP' });
  };

  const navigateToRoot = () => {
    dispatch({ type: 'NAVIGATE_TO_ROOT' });
  };

  const updateElement = (updates: Record<string, any>) => {
    dispatch({ type: 'UPDATE_ELEMENT', updates });

    // Aktualisiere auch den EditorContext, wenn ein CustomUIElement aktualisiert wurde
    if (state.customElement) {
      editorDispatch({ type: 'UPDATE_FLOW', flow: { ...state.customElement } as any });
    }
  };

  const addElement = (element: PatternLibraryElement, path: number[]) => {
    dispatch({ type: 'ADD_ELEMENT', element, path });

    // Aktualisiere auch den EditorContext, wenn ein CustomUIElement aktualisiert wurde
    if (state.customElement) {
      editorDispatch({ type: 'UPDATE_FLOW', flow: { ...state.customElement } as any });
    }
  };

  const removeElement = (path: number[]) => {
    dispatch({ type: 'REMOVE_ELEMENT', path });

    // Aktualisiere auch den EditorContext, wenn ein CustomUIElement aktualisiert wurde
    if (state.customElement) {
      editorDispatch({ type: 'UPDATE_FLOW', flow: { ...state.customElement } as any });
    }
  };

  const setEditMode = (mode: 'view' | 'edit' | 'add') => {
    dispatch({ type: 'SET_EDIT_MODE', mode });
  };

  return (
    <SubflowContext.Provider
      value={{
        state,
        dispatch,
        navigateToElement,
        navigateUp,
        navigateToRoot,
        updateElement,
        addElement,
        removeElement,
        setEditMode,
      }}
    >
      {children}
    </SubflowContext.Provider>
  );
}

/**
 * Hook für den Zugriff auf den Subflow-Kontext.
 */
export function useSubflow() {
  const context = useContext(SubflowContext);
  if (!context) {
    throw new Error('useSubflow must be used within a SubflowProvider');
  }
  return context;
}
