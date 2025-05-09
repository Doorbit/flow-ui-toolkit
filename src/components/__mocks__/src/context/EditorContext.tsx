import React, { createContext, useContext, useReducer } from 'react';

// Interfaces
interface EditorState {
  selectedPageId: string | null;
  pages: any[];
  jsonPreviewVisible: boolean;
  selectedElement: any | null;
  undoStack: any[];
  redoStack: any[];
  hasUnsavedChanges: boolean;
  dialogOpen: {
    newPage: boolean;
    elementType: boolean;
    editPage: boolean;
  };
}

interface EditorAction {
  type: string;
  payload?: any;
}

interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}

// Mock Context
const initialState: EditorState = {
  selectedPageId: "page-1",
  pages: [],
  jsonPreviewVisible: false,
  selectedElement: null,
  undoStack: [],
  redoStack: [],
  hasUnsavedChanges: false,
  dialogOpen: {
    newPage: false,
    elementType: false,
    editPage: false,
  }
};

// Initialkontext
const EditorContext = createContext<EditorContextType>({
  state: initialState,
  dispatch: () => null
});

// Reducer-Funktion
const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case 'SET_PAGES':
      return {
        ...state,
        pages: action.payload
      };
    case 'SET_SELECTED_PAGE_ID':
      return {
        ...state,
        selectedPageId: action.payload
      };
    case 'TOGGLE_JSON_PREVIEW':
      return {
        ...state,
        jsonPreviewVisible: !state.jsonPreviewVisible
      };
    case 'OPEN_NEW_PAGE_DIALOG':
      return {
        ...state,
        dialogOpen: {
          ...state.dialogOpen,
          newPage: true
        }
      };
    case 'CLOSE_NEW_PAGE_DIALOG':
      return {
        ...state,
        dialogOpen: {
          ...state.dialogOpen,
          newPage: false
        }
      };
    default:
      return state;
  }
};

// Provider-Komponente
export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
};

// Custom Hook
export const useEditorContext = () => useContext(EditorContext);

export default EditorContext;
