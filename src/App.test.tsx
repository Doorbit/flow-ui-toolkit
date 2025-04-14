import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mocks für Komponenten, die vom Test nicht direkt getestet werden
jest.mock('./components/EditorArea/EditorArea', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-editor">Mock Editor</div>
  };
});

jest.mock('./components/PageNavigator/PageNavigator', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-page-navigator">Mock PageNavigator</div>
  };
});

test('renders editor interface', () => {
  render(<App />);
  const mockEditor = screen.getByTestId('mock-editor');
  expect(mockEditor).toBeInTheDocument();
});
