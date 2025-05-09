import React, { useContext } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorProvider, EditorContext } from './EditorContext';
import { TextUIElement } from '../models/uiElements';

// Vereinfachte Version der Tests, die nur die tatsächlich unterstützten
// Aktionen und Typstrukturen verwendet
const TestComponent = () => {
  const { state, dispatch } = useContext(EditorContext)!;

  // Erstellen eines korrekten TextUIElement
  const textElement: TextUIElement = {
    pattern_type: 'TextUIElement',
    type: 'PARAGRAPH',
    text: { de: 'Beispieltext', en: 'Example text' },
    required: false,
    title: { de: 'Textfeld', en: 'Text Field' }
  };

  // Korrektes Flow-Objekt mit gültigen PatternLibraryElements
  const testFlow = {
    id: 'test-flow',
    'url-key': 'test',
    name: 'Test Flow',
    title: { de: 'Test Flow', en: 'Test Flow' },
    icon: 'test-icon',
    pages_edit: [
      {
        id: 'page-1',
        pattern_type: 'Page',
        title: { de: 'Seite 1', en: 'Page 1' },
        elements: [
          { element: textElement }
        ]
      },
      {
        id: 'page-2',
        pattern_type: 'Page',
        title: { de: 'Seite 2', en: 'Page 2' },
        elements: []
      }
    ],
    pages_view: []
  };

  // Basis-Aktionen, die im EditorContext definiert sind
  const handleSetFlow = () => {
    dispatch({ type: 'SET_FLOW', flow: testFlow });
  };

  const handleAddPage = () => {
    dispatch({
      type: 'ADD_PAGE',
      page: {
        id: 'page-3',
        pattern_type: 'Page',
        title: { de: 'Neue Seite', en: 'New Page' },
        elements: []
      }
    });
  };

  const handleUpdatePage = () => {
    dispatch({
      type: 'UPDATE_PAGE',
      page: {
        id: 'page-1',
        pattern_type: 'Page',
        title: { de: 'Aktualisierte Seite', en: 'Updated Page' },
        elements: []
      }
    });
  };

  const handleRemovePage = () => {
    dispatch({
      type: 'REMOVE_PAGE',
      pageId: 'page-2'
    });
  };

  const handleSelectPage = () => {
    dispatch({
      type: 'SELECT_PAGE',
      pageId: 'page-1'
    });
  };

  const handleUndo = () => {
    dispatch({ type: 'UNDO' });
  };

  const handleRedo = () => {
    dispatch({ type: 'REDO' });
  };

  return (
    <div>
      <div data-testid="flow-id">{state.currentFlow?.id || 'no-flow'}</div>
      <div data-testid="page-count">
        {state.currentFlow?.pages_edit ? state.currentFlow.pages_edit.length : 0}
      </div>
      <div data-testid="selected-page">{state.selectedPageId || 'none'}</div>
      <div data-testid="can-undo">{state.undoStack.length > 0 ? 'can-undo' : 'cannot-undo'}</div>
      <div data-testid="can-redo">{state.redoStack.length > 0 ? 'can-redo' : 'cannot-redo'}</div>
      
      <button data-testid="set-flow-btn" onClick={handleSetFlow}>Set Flow</button>
      <button data-testid="add-page-btn" onClick={handleAddPage}>Add Page</button>
      <button data-testid="update-page-btn" onClick={handleUpdatePage}>Update Page</button>
      <button data-testid="remove-page-btn" onClick={handleRemovePage}>Remove Page</button>
      <button data-testid="select-page-btn" onClick={handleSelectPage}>Select Page</button>
      <button data-testid="undo-btn" onClick={handleUndo}>Undo</button>
      <button data-testid="redo-btn" onClick={handleRedo}>Redo</button>
    </div>
  );
};

describe('EditorContext', () => {
  test('initialisiert mit einem leeren Editor-Zustand', () => {
    render(
      <EditorProvider>
        <TestComponent />
      </EditorProvider>
    );

    expect(screen.getByTestId('flow-id')).toHaveTextContent('no-flow');
    expect(screen.getByTestId('page-count')).toHaveTextContent('0');
    expect(screen.getByTestId('selected-page')).toHaveTextContent('none');
    expect(screen.getByTestId('can-undo')).toHaveTextContent('cannot-undo');
    expect(screen.getByTestId('can-redo')).toHaveTextContent('cannot-redo');
  });

  test('aktualisiert den Zustand bei SET_FLOW-Aktion', () => {
    render(
      <EditorProvider>
        <TestComponent />
      </EditorProvider>
    );

    fireEvent.click(screen.getByTestId('set-flow-btn'));
    expect(screen.getByTestId('flow-id')).toHaveTextContent('test-flow');
    expect(screen.getByTestId('page-count')).toHaveTextContent('2');
  });

  test('fügt eine neue Seite mit ADD_PAGE-Aktion hinzu', () => {
    render(
      <EditorProvider>
        <TestComponent />
      </EditorProvider>
    );

    // Zuerst Flow setzen
    fireEvent.click(screen.getByTestId('set-flow-btn'));
    // Dann Seite hinzufügen
    fireEvent.click(screen.getByTestId('add-page-btn'));
    
    expect(screen.getByTestId('page-count')).toHaveTextContent('3');
  });

  test('aktualisiert eine Seite mit UPDATE_PAGE-Aktion', () => {
    render(
      <EditorProvider>
        <TestComponent />
      </EditorProvider>
    );

    // Flow setzen und dann eine Seite aktualisieren
    fireEvent.click(screen.getByTestId('set-flow-btn'));
    fireEvent.click(screen.getByTestId('update-page-btn'));
    
    expect(screen.getByTestId('page-count')).toHaveTextContent('2');
  });

  test('löscht eine Seite mit REMOVE_PAGE-Aktion', () => {
    render(
      <EditorProvider>
        <TestComponent />
      </EditorProvider>
    );

    // Flow setzen und eine Seite löschen
    fireEvent.click(screen.getByTestId('set-flow-btn'));
    fireEvent.click(screen.getByTestId('remove-page-btn'));
    
    expect(screen.getByTestId('page-count')).toHaveTextContent('1');
  });

  test('wählt eine Seite mit SELECT_PAGE-Aktion aus', () => {
    render(
      <EditorProvider>
        <TestComponent />
      </EditorProvider>
    );

    // Flow setzen und eine Seite auswählen
    fireEvent.click(screen.getByTestId('set-flow-btn'));
    fireEvent.click(screen.getByTestId('select-page-btn'));
    
    expect(screen.getByTestId('selected-page')).toHaveTextContent('page-1');
  });

  test('Undo/Redo-Funktionalität', () => {
    render(
      <EditorProvider>
        <TestComponent />
      </EditorProvider>
    );

    // Flow setzen
    fireEvent.click(screen.getByTestId('set-flow-btn'));
    
    // Eine Aktion ausführen, die den Undo-Stack füllt
    fireEvent.click(screen.getByTestId('add-page-btn'));
    expect(screen.getByTestId('can-undo')).toHaveTextContent('can-undo');
    
    // Undo ausführen
    fireEvent.click(screen.getByTestId('undo-btn'));
    expect(screen.getByTestId('can-redo')).toHaveTextContent('can-redo');
    
    // Redo ausführen
    fireEvent.click(screen.getByTestId('redo-btn'));
    expect(screen.getByTestId('can-undo')).toHaveTextContent('can-undo');
  });
});
