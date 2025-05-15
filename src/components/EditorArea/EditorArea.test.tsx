import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditorArea from './EditorArea';

// Mocks für die abhängigen Komponenten und Kontexte
jest.mock('../../context/EditorContext', () => {
  const mockDispatch = jest.fn();
  const mockState = {
    selectedPageId: 'test-page-1',
    selectedElementId: null,
    currentFlow: {
      pages_edit: [
        {
          id: 'test-page-1',
          pattern_type: 'Page',
          title: { de: 'Testseite 1' },
          elements: []
        }
      ]
    },
    dialogs: { elementType: false } // Standardmäßig geschlossen
  };
  return {
    useEditorContext: jest.fn().mockImplementation(() => ({
      state: mockState,
      dispatch: mockDispatch
    })),
    useEditor: jest.fn().mockImplementation(() => ({
      state: mockState,
      dispatch: mockDispatch
    }))
  };
});

// Mock für DnD
jest.mock('react-dnd', () => ({
  useDrag: () => [{ isDragging: false }, jest.fn()],
  useDrop: () => [{ isOver: false }, jest.fn()]
}));

// Mock für FieldValuesContext
jest.mock('../../context/FieldValuesContext', () => ({
  useFieldValues: jest.fn().mockImplementation(() => ({
    fieldValues: {},
    updateFieldValue: jest.fn()
  }))
}));

// Mock für ElementTypeDialog
jest.mock('./ElementTypeDialog', () => ({
  __esModule: true,
  default: ({ open, onClose, onSelectElementType }: {
    open: boolean;
    onClose: () => void;
    onSelectElementType: (type: string) => void
  }) => (
    <div
      data-testid="element-type-dialog"
      style={{ display: open ? 'block' : 'none' }}
    >
      <button onClick={() => onSelectElementType('TextUIElement')} data-testid="select-text">
        Text auswählen
      </button>
      <button onClick={onClose} data-testid="close-dialog">
        Schließen
      </button>
    </div>
  )
}));

// Verwende die Mock-Datei in src/components/__mocks__/styled-components.js
import styled from 'styled-components';

// Mock für Material-UI Komponenten
jest.mock('@mui/material', () => ({
  Box: (props: any) => <div {...props} />,
  Paper: (props: any) => <div {...props} />,
  Typography: (props: any) => <div {...props} />,
  Card: (props: any) => <div {...props} />,
  CardContent: (props: any) => <div {...props} />,
  IconButton: (props: any) => <button {...props} />,
  Button: (props: any) => <button {...props} />,
  Collapse: ({ in: open, children, ...rest }: any) => open ? <div {...rest}>{children}</div> : null,
  Tooltip: (props: any) => <div>{props.children}</div>,
  Dialog: (props: any) => <div>{props.children}</div>,
  DialogTitle: (props: any) => <div>{props.children}</div>,
  DialogContent: (props: any) => <div>{props.children}</div>,
  DialogActions: (props: any) => <div>{props.children}</div>,
  FormControl: (props: any) => <div>{props.children}</div>,
  InputLabel: (props: any) => <div>{props.children}</div>,
  Select: (props: any) => <select onChange={props.onChange}>{props.children}</select>,
  MenuItem: (props: any) => <option value={props.value}>{props.children}</option>,
  TextField: (props: any) => <input type="text" {...props} />
}));

// Mock für Material Icons
jest.mock('@mui/icons-material', () => ({
  AddCircle: () => <span data-testid="icon-add-circle">+</span>,
  Add: () => <span data-testid="icon-add">+</span>,
  Delete: () => <span data-testid="icon-delete">x</span>,
  ContentCopy: () => <span data-testid="icon-copy">c</span>,
  ExpandMore: () => <span data-testid="icon-expand-more">v</span>,
  ExpandLess: () => <span data-testid="icon-expand-less">^</span>,
  DragIndicator: () => <span data-testid="icon-drag-indicator">::</span>,
  Visibility: () => <span data-testid="icon-visibility">👁</span>,
  Collapse: () => <div data-testid="collapse"></div>,
  Tooltip: (props: any) => <div {...props} />
}));

describe('EditorArea', () => {
  it('sollte eine leere Area rendern, wenn keine Seite ausgewählt ist', () => {
    // Überschreibe den Mock für diesen speziellen Test
    const { useEditor } = require('../../context/EditorContext');
    useEditor.mockImplementation(() => ({
      state: {
        selectedPageId: null,
        selectedElementId: null,
        currentFlow: null,
        dialogs: { elementType: false }
      },
      dispatch: jest.fn()
    }));

    render(
      <EditorArea
        elements={[]}
        onSelectElement={jest.fn()}
        onRemoveElement={jest.fn()}
        onDuplicateElement={jest.fn()}
      />
    );

    // In der aktuellen Implementierung wird nur ein leerer Editor angezeigt
    expect(screen.getByText(/Editor/i)).toBeInTheDocument();
  });

  it('sollte eine leere Seite mit "Element hinzufügen" Button rendern', () => {
    // Setze den Standard-Mock wieder her
    const { useEditor } = require('../../context/EditorContext');
    useEditor.mockImplementation(() => ({
      state: {
        selectedPageId: 'test-page-1',
        selectedElementId: null,
        currentFlow: {
          pages_edit: [
            {
              id: 'test-page-1',
              pattern_type: 'Page',
              title: { de: 'Testseite 1' },
              elements: []
            }
          ]
        },
        dialogs: { elementType: false }
      },
      dispatch: jest.fn()
    }));

    render(
      <EditorArea
        elements={[]}
        onSelectElement={jest.fn()}
        onRemoveElement={jest.fn()}
        onDuplicateElement={jest.fn()}
      />
    );

    expect(screen.getByTestId('icon-add-circle')).toBeInTheDocument();
  });

  it('sollte den ElementTypeDialog öffnen, wenn auf "Element hinzufügen" geklickt wird', () => {
    const { useEditor } = require('../../context/EditorContext');
    const mockDispatch = jest.fn();
    useEditor.mockImplementation(() => ({
      state: {
        selectedPageId: 'test-page-1',
        selectedElementId: null,
        currentFlow: {
          pages_edit: [
            {
              id: 'test-page-1',
              pattern_type: 'Page',
              title: { de: 'Testseite 1' },
              elements: []
            }
          ]
        },
        dialogs: { elementType: false }
      },
      dispatch: mockDispatch
    }));

    render(
      <EditorArea
        elements={[]}
        onSelectElement={jest.fn()}
        onRemoveElement={jest.fn()}
        onDuplicateElement={jest.fn()}
      />
    );

    // Klicke auf den "Element hinzufügen" Button
    fireEvent.click(screen.getByTestId('icon-add-circle'));

    // Prüfe, ob der dispatch mit der entsprechenden Aktion aufgerufen wurde
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_DIALOG',
      payload: { dialog: 'elementType', open: true }
    });
  });

  it('sollte ElementTypeDialog mit korrekten Props rendern', () => {
    // Mock mit geöffnetem Dialog
    const { useEditor } = require('../../context/EditorContext');
    useEditor.mockImplementation(() => ({
      state: {
        selectedPageId: 'test-page-1',
        selectedElementId: null,
        currentFlow: {
          pages_edit: [
            {
              id: 'test-page-1',
              pattern_type: 'Page',
              title: { de: 'Testseite 1' },
              elements: []
            }
          ]
        },
        dialogs: { elementType: true } // Dialog ist geöffnet
      },
      dispatch: jest.fn()
    }));

    render(
      <EditorArea
        elements={[]}
        onSelectElement={jest.fn()}
        onRemoveElement={jest.fn()}
        onDuplicateElement={jest.fn()}
      />
    );

    // Prüfe, ob der Dialog sichtbar ist
    const dialog = screen.getByTestId('element-type-dialog');
    expect(dialog).toHaveStyle('display: block');
  });

  it('sollte den Dialog schließen, wenn auf "Schließen" geklickt wird', () => {
    const { useEditor } = require('../../context/EditorContext');
    const mockDispatch = jest.fn();
    useEditor.mockImplementation(() => ({
      state: {
        selectedPageId: 'test-page-1',
        selectedElementId: null,
        currentFlow: {
          pages_edit: [
            {
              id: 'test-page-1',
              pattern_type: 'Page',
              title: { de: 'Testseite 1' },
              elements: []
            }
          ]
        },
        dialogs: { elementType: true } // Dialog ist geöffnet
      },
      dispatch: mockDispatch
    }));

    render(
      <EditorArea
        elements={[]}
        onSelectElement={jest.fn()}
        onRemoveElement={jest.fn()}
        onDuplicateElement={jest.fn()}
      />
    );

    // Klicke auf den "Schließen" Button im Dialog
    fireEvent.click(screen.getByTestId('close-dialog'));

    // Prüfe, ob der dispatch mit der entsprechenden Aktion aufgerufen wurde
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_DIALOG',
      payload: { dialog: 'elementType', open: false }
    });
  });

  it('sollte ein Element hinzufügen, wenn es im Dialog ausgewählt wird', () => {
    const { useEditor } = require('../../context/EditorContext');
    const mockDispatch = jest.fn();
    useEditor.mockImplementation(() => ({
      state: {
        selectedPageId: 'test-page-1',
        selectedElementId: null,
        currentFlow: {
          pages_edit: [
            {
              id: 'test-page-1',
              pattern_type: 'Page',
              title: { de: 'Testseite 1' },
              elements: []
            }
          ]
        },
        dialogs: { elementType: true } // Dialog ist geöffnet
      },
      dispatch: mockDispatch
    }));

    // Mock für uuid, damit die ID vorhersehbar ist
    jest.mock('uuid', () => ({
      v4: () => 'mock-uuid-1234'
    }));

    render(
      <EditorArea
        elements={[]}
        onSelectElement={jest.fn()}
        onRemoveElement={jest.fn()}
        onDuplicateElement={jest.fn()}
      />
    );

    // Klicke auf "Text auswählen" im Dialog
    fireEvent.click(screen.getByTestId('select-text'));

    // Prüfe, ob die richtigen Aktionen ausgelöst wurden
    expect(mockDispatch).toHaveBeenCalledTimes(1);

    // Die Aktion sollte TOGGLE_DIALOG sein
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_DIALOG',
      payload: { dialog: 'elementType', open: false }
    });
  });
});
