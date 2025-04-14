import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import styled from 'styled-components';

import Navigation from './components/Navigation/Navigation';
import ElementPalette from './components/ElementPalette/ElementPalette';
import EditorArea from './components/EditorArea/EditorArea';
import PropertyEditor from './components/PropertyEditor/PropertyEditor';
import JsonPreview from './components/JsonPreview/JsonPreview';
import PageNavigator from './components/PageNavigator/PageNavigator';
import { DndProvider } from './components/DndProvider';
import { EditorProvider, useEditor, getElementByPath } from './context/EditorContext';
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
          component_name: 'CustomComponent',
          props: {},
          title: {
            de: 'Benutzerdefiniertes Element',
            en: 'Custom Element'
          }
        } as CustomUIElement
      };
      
    case 'ChipGroupUIElement':
      return {
        element: {
          pattern_type: 'ChipGroupUIElement',
          required: false,
          chips: [ // Korrigiert: chips statt options
            {
              pattern_type: 'BooleanUIElement',
              required: false,
              field_id: { field_name: 'chip1' },
              title: { de: 'Chip 1', en: 'Chip 1' }
            } as BooleanUIElement,
            {
              pattern_type: 'BooleanUIElement',
              required: false,
              field_id: { field_name: 'chip2' },
              title: { de: 'Chip 2', en: 'Chip 2' }
            } as BooleanUIElement,
            {
              pattern_type: 'BooleanUIElement',
              required: false,
              field_id: { field_name: 'chip3' },
              title: { de: 'Chip 3', en: 'Chip 3' }
            } as BooleanUIElement
          ],
          title: {
            de: 'Chip-Gruppe Element',
            en: 'Chip Group Element'
          }
        } as ChipGroupUIElement
      };
      
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

  // Element-Handler für Haupt- und verschachtelte Elemente
  const handleAddElement = (type: string, parentPath?: number[]) => {
    if (!state.selectedPageId) return;
    
    const newElement = createElement(type);
    
    if (parentPath && parentPath.length > 0) {
      // Unterelement zu einem vorhandenen Element hinzufügen
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

    // Erstelle eine Kopie des Flows
    const updatedFlow = JSON.parse(JSON.stringify(state.currentFlow));
    
    // Finde die aktuelle Seite
    const pageIndex = updatedFlow.pages_edit.findIndex((page: { id: string }) => page.id === state.selectedPageId);
    if (pageIndex === -1) return;
    
    // Aktualisiere das Element im Flow anhand des Pfads
    let elementsArray = updatedFlow.pages_edit[pageIndex].elements;
    let currentArray = elementsArray;
    
    // Navigiere zu dem Eltern-Array, das das zu aktualisierende Element enthält
    for (let i = 0; i < selectedElementPath.length - 1; i++) {
      const index = selectedElementPath[i];
      const elem = currentArray[index];
      
      // Prüfe, ob es sich um ein Container-Element handelt
      if (elem.element.pattern_type === 'GroupUIElement' && elem.element.elements) {
        currentArray = elem.element.elements;
      } else if (elem.element.pattern_type === 'ArrayUIElement' && elem.element.elements) {
        currentArray = elem.element.elements;
      } else {
        console.error('Ungültiger Pfad: Element hat keine Unterelemente');
        return;
      }
    }
    
    // Ersetze das Element an der letzten Position im Pfad
    if (selectedElementPath.length > 0) {
      const lastIndex = selectedElementPath[selectedElementPath.length - 1];
      currentArray[lastIndex] = updatedElement;
    }
    
    // Dispatch mit dem aktualisierten Flow
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
    
    if (path.length === 1) {
      // Element auf oberster Ebene duplizieren
      const newIndex = path[0] + 1;
      dispatch({
        type: 'ADD_ELEMENT',
        element: {...elementToDuplicate},
        pageId: state.selectedPageId
      });
    } else {
      // Verschachteltes Element duplizieren
      const parentPath = path.slice(0, -1);
      const siblingIndex = path[path.length - 1] + 1;
      const targetPath = [...parentPath, siblingIndex];
      
      dispatch({
        type: 'ADD_SUB_ELEMENT',
        element: {...elementToDuplicate},
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
