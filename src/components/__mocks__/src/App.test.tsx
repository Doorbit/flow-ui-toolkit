import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock der Navigation-Komponente
jest.mock('./components/Navigation/Navigation', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-navigation">Mock Navigation</div>
  };
});

describe('App Komponente', () => {
  test('Rendert ohne Fehler', () => {
    render(<App />);
    expect(screen.getByTestId('mock-navigation')).toBeInTheDocument();
  });
});
