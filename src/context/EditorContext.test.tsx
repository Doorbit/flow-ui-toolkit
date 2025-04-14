import React, { useContext } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorProvider, EditorContext } from './EditorContext';

// Test-Komponente, die den Editor-Context verwendet
const TestComponent = () => {
  const { state, dispatch } = useContext(EditorContext)!;

  const handleSetFlow = () => {
    dispatch({
      type: 'SET_FLOW',
      flow: {
        id: 'test-flow',
        'url-key': 'test',
        name: 'Test Flow',
        title: { de: 'Test', en: 'Test' },
        icon: 'test-icon',
        pages_edit: [],
        pages_view: []
      }
    });
  };

  return (
    <div>
      <div data-testid="flow-id">{state.currentFlow?.id || 'no-flow'}</div>
      <button data-testid="set-flow-btn" onClick={handleSetFlow}>
        Set Flow
      </button>
    </div>
  );
};

describe('EditorContext', () => {
  test('initializes with null currentFlow', () => {
    render(
      <EditorProvider>
        <TestComponent />
      </EditorProvider>
    );

    expect(screen.getByTestId('flow-id')).toHaveTextContent('no-flow');
  });

  test('updates state when SET_FLOW action is dispatched', () => {
    render(
      <EditorProvider>
        <TestComponent />
      </EditorProvider>
    );

    fireEvent.click(screen.getByTestId('set-flow-btn'));
    expect(screen.getByTestId('flow-id')).toHaveTextContent('test-flow');
  });
});
