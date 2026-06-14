import React, { useContext } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorProvider, EditorContext, getElementByPath } from './EditorContext';
import { TextUIElement, GroupUIElement, CustomUIElement } from '../models/uiElements';
import { PatternLibraryElement, Page } from '../models/listingFlow';

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
        pattern_type: 'Page', // Im alten Schema "Page", im doorbit_esg.json Schema "CustomUIElement"
        title: { de: 'Seite 1', en: 'Page 1' },
        elements: [
          { element: textElement } // Einfaches Element für bestehende Tests
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

// Tests für den Modul-Katalog (Modulare Flows, Phase 2)
const ModuleTestComponent = () => {
  const { state, dispatch } = useContext(EditorContext)!;

  const taggedElement = {
    pattern_type: 'TextUIElement',
    type: 'PARAGRAPH',
    text: { de: 'Modul-Element' },
    required: false,
    module_id: 'heizlast',
  } as any;

  const moduleFlow = {
    id: 'mod-flow',
    'url-key': 'mod',
    name: 'Modul Flow',
    title: { de: 'Modul Flow', en: 'Module Flow' },
    icon: 'mdiFileOutline',
    pages_edit: [
      {
        id: 'page-1',
        pattern_type: 'Page',
        title: { de: 'Seite 1', en: 'Page 1' },
        module_id: 'heizlast',
        elements: [{ element: taggedElement }],
      },
    ],
    pages_view: [],
  };

  const modules = state.currentFlow?.modules ?? [];
  const page = state.currentFlow?.pages_edit[0];
  const firstElement = page?.elements[0]?.element as any;

  return (
    <div>
      <div data-testid="module-count">{modules.length}</div>
      <div data-testid="first-module-default-active">{String(modules[0]?.default_active ?? 'none')}</div>
      <div data-testid="page-module-id">{page?.module_id ?? 'none'}</div>
      <div data-testid="element-module-id">{firstElement?.module_id ?? 'none'}</div>
      <div data-testid="can-undo">{state.undoStack.length > 0 ? 'can-undo' : 'cannot-undo'}</div>

      <button data-testid="set-flow-btn" onClick={() => dispatch({ type: 'SET_FLOW', flow: moduleFlow })}>Set</button>
      <button
        data-testid="add-module-btn"
        onClick={() =>
          dispatch({
            type: 'ADD_MODULE',
            module: { id: 'heizlast', name: { de: 'Heizlast' }, description: { de: '' }, default_active: false, delivery: 'INLINE' },
          })
        }
      >
        Add
      </button>
      <button
        data-testid="update-module-btn"
        onClick={() => dispatch({ type: 'UPDATE_MODULE', moduleId: 'heizlast', updates: { default_active: true } })}
      >
        Update
      </button>
      <button data-testid="remove-module-btn" onClick={() => dispatch({ type: 'REMOVE_MODULE', moduleId: 'heizlast' })}>
        Remove
      </button>
      <button data-testid="undo-btn" onClick={() => dispatch({ type: 'UNDO' })}>Undo</button>
    </div>
  );
};

describe('EditorContext - Modul-Katalog', () => {
  const renderModuleTest = () =>
    render(
      <EditorProvider>
        <ModuleTestComponent />
      </EditorProvider>
    );

  test('ADD_MODULE fügt ein Modul zum Katalog hinzu', () => {
    renderModuleTest();
    fireEvent.click(screen.getByTestId('set-flow-btn'));
    expect(screen.getByTestId('module-count')).toHaveTextContent('0');
    fireEvent.click(screen.getByTestId('add-module-btn'));
    expect(screen.getByTestId('module-count')).toHaveTextContent('1');
  });

  test('UPDATE_MODULE ändert ein Feld des Moduls', () => {
    renderModuleTest();
    fireEvent.click(screen.getByTestId('set-flow-btn'));
    fireEvent.click(screen.getByTestId('add-module-btn'));
    expect(screen.getByTestId('first-module-default-active')).toHaveTextContent('false');
    fireEvent.click(screen.getByTestId('update-module-btn'));
    expect(screen.getByTestId('first-module-default-active')).toHaveTextContent('true');
  });

  test('REMOVE_MODULE entfernt das Modul und bereinigt referenzierende module_id (Page + Element)', () => {
    renderModuleTest();
    fireEvent.click(screen.getByTestId('set-flow-btn'));
    fireEvent.click(screen.getByTestId('add-module-btn'));
    // Vorbedingung: Page und Element sind getaggt
    expect(screen.getByTestId('page-module-id')).toHaveTextContent('heizlast');
    expect(screen.getByTestId('element-module-id')).toHaveTextContent('heizlast');

    fireEvent.click(screen.getByTestId('remove-module-btn'));
    expect(screen.getByTestId('module-count')).toHaveTextContent('0');
    expect(screen.getByTestId('page-module-id')).toHaveTextContent('none');
    expect(screen.getByTestId('element-module-id')).toHaveTextContent('none');
  });

  test('Undo nach ADD_MODULE stellt den Vorzustand wieder her', () => {
    renderModuleTest();
    fireEvent.click(screen.getByTestId('set-flow-btn'));
    fireEvent.click(screen.getByTestId('add-module-btn'));
    expect(screen.getByTestId('module-count')).toHaveTextContent('1');
    expect(screen.getByTestId('can-undo')).toHaveTextContent('can-undo');
    fireEvent.click(screen.getByTestId('undo-btn'));
    expect(screen.getByTestId('module-count')).toHaveTextContent('0');
  });
});

// Tests für getElementByPath
describe('getElementByPath', () => {
  const deepTextElement: TextUIElement = {
    pattern_type: 'TextUIElement', type: 'PARAGRAPH', text: { de: 'Tiefes Element' }, required: false, title: {de: 'Tief'}
  };
  const groupChildElement: TextUIElement = {
    pattern_type: 'TextUIElement', type: 'PARAGRAPH', text: { de: 'Gruppenkind' }, required: false, title: {de: 'Kind'}
  };

  const nestedGroupElement: GroupUIElement = {
    pattern_type: 'GroupUIElement', title: { de: 'Verschachtelte Gruppe' }, required: false,
    elements: [{ element: deepTextElement }]
  };

  const subFlowElement: GroupUIElement = {
    pattern_type: 'GroupUIElement', title: { de: 'Element in SubFlow' }, required: false,
    elements: [{ element: nestedGroupElement }] // Enthält die verschachtelte Gruppe
  };

  const customUIWithSubFlows: CustomUIElement = {
    pattern_type: 'CustomUIElement', title: { de: 'Custom mit SubFlows' }, required: false,
    sub_flows: [
      { type: 'POI', elements: [{ element: subFlowElement }] }
    ]
  };

  const topLevelGroup: GroupUIElement = {
    pattern_type: 'GroupUIElement', title: { de: 'Top Level Gruppe' }, required: false,
    elements: [{ element: groupChildElement }]
  };

  const testPageElements: PatternLibraryElement[] = [
    { element: customUIWithSubFlows }, // Index 0
    { element: topLevelGroup }          // Index 1
  ];

  it('sollte null zurückgeben für leeren Pfad oder leere Elemente', () => {
    expect(getElementByPath(testPageElements, [])).toBeNull();
    expect(getElementByPath([], [0])).toBeNull();
  });

  it('sollte null zurückgeben für ungültigen Index', () => {
    expect(getElementByPath(testPageElements, [5])).toBeNull();
  });

  it('sollte das korrekte Top-Level-Element zurückgeben', () => {
    const el = getElementByPath(testPageElements, [1]);
    expect(el?.element.pattern_type).toBe('GroupUIElement');
    expect((el?.element as GroupUIElement).title?.de).toBe('Top Level Gruppe');
  });

  it('sollte ein Element innerhalb einer Top-Level-Gruppe finden', () => {
    const el = getElementByPath(testPageElements, [1, 0]);
    expect(el?.element.pattern_type).toBe('TextUIElement');
    expect((el?.element as TextUIElement).text.de).toBe('Gruppenkind');
  });

  it('sollte das CustomUIElement finden', () => {
    const el = getElementByPath(testPageElements, [0]);
    expect(el?.element.pattern_type).toBe('CustomUIElement');
  });

  it('sollte ein SubFlow-Objekt als Element finden', () => {
    // Pfad zum SubFlow-Objekt selbst
    const el = getElementByPath(testPageElements, [0, 0]);
    // Hier verwenden wir eine Typzusicherung, da das SubFlow-Objekt nicht direkt in UIElement enthalten ist
    expect((el?.element as any)?.type).toBe('POI'); // SubFlows haben 'type', nicht 'pattern_type'
  });

  it('sollte ein Element erster Ebene innerhalb eines SubFlows finden', () => {
    // Pfad zum GroupUIElement "Element in SubFlow"
    const el = getElementByPath(testPageElements, [0, 0, 0]);
    expect(el?.element.pattern_type).toBe('GroupUIElement');
    expect((el?.element as GroupUIElement).title?.de).toBe('Element in SubFlow');
  });

  it('sollte ein verschachteltes Element (zweite Ebene) innerhalb eines SubFlows finden', () => {
    // Pfad zum GroupUIElement "Verschachtelte Gruppe"
    const el = getElementByPath(testPageElements, [0, 0, 0, 0]);
    expect(el?.element.pattern_type).toBe('GroupUIElement');
    expect((el?.element as GroupUIElement).title?.de).toBe('Verschachtelte Gruppe');
  });

  it('sollte ein tief verschachteltes Element (dritte Ebene) innerhalb eines SubFlows finden', () => {
    // Pfad zum TextUIElement "Tiefes Element"
    const el = getElementByPath(testPageElements, [0, 0, 0, 0, 0]);
    expect(el?.element.pattern_type).toBe('TextUIElement');
    expect((el?.element as TextUIElement).text.de).toBe('Tiefes Element');
  });

  it('sollte null zurückgeben für einen zu tiefen oder ungültigen Pfad in einem SubFlow', () => {
    expect(getElementByPath(testPageElements, [0, 0, 0, 0, 0, 0])).toBeNull(); // Zu tief
    expect(getElementByPath(testPageElements, [0, 1, 0])).toBeNull(); // Ungültiger SubFlow-Index
    expect(getElementByPath(testPageElements, [0, 0, 1])).toBeNull(); // Ungültiger Element-Index im SubFlow
  });
});
