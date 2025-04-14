import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ListingFlow, Page, PatternLibraryElement } from '../models/listingFlow';
import { GroupUIElement, ArrayUIElement } from '../models/uiElements';

interface EditorState {
  currentFlow: ListingFlow | null;
  undoStack: ListingFlow[];
  redoStack: ListingFlow[];
  selectedElement: PatternLibraryElement | null;
  selectedElementPath: number[]; // Pfad zum ausgewählten Element
  isDirty: boolean;
  selectedPageId: string | null; // ID der ausgewählten Seite
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
  | { type: 'REMOVE_PAGE'; pageId: string }
  | { type: 'SELECT_PAGE'; pageId: string }
  | { type: 'MOVE_PAGE'; sourceIndex: number; targetIndex: number }
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
};

export interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<Action>;
}

export const EditorContext = createContext<EditorContextType | null>(null);

// Hilfsfunktion, um ein Element anhand eines Pfades zu finden
export const getElementByPath = (elements: PatternLibraryElement[], path: number[]): PatternLibraryElement | null => {
  if (path.length === 0 || !elements || elements.length === 0) return null;
  
  const [index, ...restPath] = path;
  if (index >= elements.length) return null;
  
  const element = elements[index];
  if (restPath.length === 0) return element;
  
  if (element.element.pattern_type === 'GroupUIElement' || 
      element.element.pattern_type === 'ArrayUIElement') {
    return getElementByPath((element.element as any).elements || [], restPath);
  }
  
  return null;
};

// Hilfsfunktion zum Aktualisieren tief verschachtelter Elemente
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
    
    return element;
  });
};

// Hilfsfunktion zum Hinzufügen eines Elements an einem bestimmten Pfad
const addElementAtPath = (
  elements: PatternLibraryElement[],
  path: number[],
  newElement: PatternLibraryElement
): PatternLibraryElement[] => {
  if (path.length === 0) {
    // Hinzufügen am Ende der Liste
    return [...elements, newElement];
  }
  
  const [index, ...restPath] = path;
  if (index > elements.length) return elements;
  
  if (restPath.length === 0) {
    // Element an dieser Stelle einfügen
    const result = [...elements];
    result.splice(index, 0, newElement);
    return result;
  }
  
  return elements.map((element, i) => {
    if (i !== index) return element;
    
    // In die Tiefe gehen
    if (element.element.pattern_type === 'GroupUIElement' || 
        element.element.pattern_type === 'ArrayUIElement') {
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
    
    return element;
  });
};

// Hilfsfunktion zum Entfernen eines Elements an einem bestimmten Pfad
const removeElementAtPath = (
  elements: PatternLibraryElement[],
  path: number[]
): PatternLibraryElement[] => {
  if (path.length === 0) return elements;
  
  const [index, ...restPath] = path;
  if (index >= elements.length) return elements;
  
  if (restPath.length === 0) {
    // Element an dieser Stelle entfernen
    return elements.filter((_, i) => i !== index);
  }
  
  return elements.map((element, i) => {
    if (i !== index) return element;
    
    // In die Tiefe gehen
    if (element.element.pattern_type === 'GroupUIElement' || 
        element.element.pattern_type === 'ArrayUIElement') {
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
    
    return element;
  });
};

function editorReducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'SET_FLOW':
      return {
        ...state,
        currentFlow: action.flow,
        undoStack: [],
        redoStack: [],
        selectedElement: null,
        selectedElementPath: [],
        isDirty: false,
        // Erste Seite als Standard auswählen, wenn verfügbar
        selectedPageId: action.flow?.pages_edit.length > 0 ? action.flow.pages_edit[0].id : null,
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
      
      const newFlow = {
        ...state.currentFlow,
        pages_edit: [...state.currentFlow.pages_edit, action.page],
        // Für die View-Seiten auch eine entsprechende leere Seite anlegen
        pages_view: [...state.currentFlow.pages_view, {
          ...action.page,
          elements: [] // View-Seite beginnt mit leerer Elementliste
        }]
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
