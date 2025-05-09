import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorProvider, useErrorContext } from './ErrorContext';

// Mock für console-Methoden, um Testausgabe sauber zu halten
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Testkomponente, die den ErrorContext verwendet
const TestComponent = () => {
  const { errors, addError, removeError } = useErrorContext();
  
  return (
    <div>
      <button
        onClick={() => addError('Test Fehlermeldung', 'error')}
        data-testid="add-error"
      >
        Fehler hinzufügen
      </button>
      
      <button
        onClick={() => {
          // Suche nach der ID des ersten Fehlers
          if (errors.length > 0) {
            removeError(errors[0].id);
          }
        }}
        data-testid="remove-error"
      >
        Fehler entfernen
      </button>
      
      <div data-testid="error-count">
        {errors.length} Fehler
      </div>
      
      <ul>
        {errors.map(error => (
          <li key={error.id} data-testid={`error-${error.id}`}>
            {error.message} ({error.severity})
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('ErrorContext', () => {
  it('sollte ohne Fehler initialisiert werden', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );
    
    expect(screen.getByTestId('error-count')).toHaveTextContent('0 Fehler');
  });

  it('sollte einen Fehler hinzufügen können', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );
    
    fireEvent.click(screen.getByTestId('add-error'));
    
    expect(screen.getByTestId('error-count')).toHaveTextContent('1 Fehler');
    // Wir können nicht mehr nach einer bestimmten ID suchen, da sie dynamisch ist
    expect(screen.getByText(/Test Fehlermeldung/)).toBeInTheDocument();
  });

  it('sollte einen Fehler entfernen können', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );
    
    // Fehler hinzufügen und dann entfernen
    fireEvent.click(screen.getByTestId('add-error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('1 Fehler');
    
    fireEvent.click(screen.getByTestId('remove-error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('0 Fehler');
  });

  it('sollte mehrere Fehler verwalten können', () => {
    // Erstelle eine spezielle Testkomponente für mehrere Fehler
    const MultipleErrorsTestComponent = () => {
      const { errors, addError } = useErrorContext();
      
      return (
        <div>
          <button
            onClick={() => addError('Erster Fehler', 'error')}
            data-testid="add-error-1"
          >
            Fehler 1 hinzufügen
          </button>
          <button
            onClick={() => addError('Zweiter Fehler', 'warning')}
            data-testid="add-error-2"
          >
            Fehler 2 hinzufügen
          </button>
          <div data-testid="error-count">
            {errors.length} Fehler
          </div>
          <ul>
            {errors.map(error => (
              <li key={error.id} data-testid={`error-item-${error.id}`}>
                {error.message} ({error.severity})
              </li>
            ))}
          </ul>
        </div>
      );
    };
    
    render(
      <ErrorProvider>
        <MultipleErrorsTestComponent />
      </ErrorProvider>
    );
    
    // Füge zwei Fehler hinzu
    fireEvent.click(screen.getByTestId('add-error-1'));
    fireEvent.click(screen.getByTestId('add-error-2'));
    
    // Prüfe, ob beide Fehler angezeigt werden
    expect(screen.getByTestId('error-count')).toHaveTextContent('2 Fehler');
    expect(screen.getByText(/Erster Fehler \(error\)/)).toBeInTheDocument();
    expect(screen.getByText(/Zweiter Fehler \(warning\)/)).toBeInTheDocument();
  });

  it('sollte alle Schweregrade für Fehler unterstützen', () => {
    const SeverityTestComponent = () => {
      const { errors, addError, clearErrors } = useErrorContext();
      
      return (
        <div>
          <button
            onClick={() => {
              clearErrors();
              addError('Info Meldung', 'info');
            }}
            data-testid="add-info"
          >Info hinzufügen</button>
          
          <button
            onClick={() => {
              clearErrors();
              addError('Warnung', 'warning');
            }}
            data-testid="add-warning"
          >Warnung hinzufügen</button>
          
          <button
            onClick={() => {
              clearErrors();
              addError('Fehler', 'error');
            }}
            data-testid="add-error"
          >Fehler hinzufügen</button>
          
          {errors.length > 0 && (
            <div data-testid="error-severity">{errors[0].severity}</div>
          )}
        </div>
      );
    };
    
    render(
      <ErrorProvider>
        <SeverityTestComponent />
      </ErrorProvider>
    );
    
    // Teste jeden Schweregrad
    fireEvent.click(screen.getByTestId('add-info'));
    expect(screen.getByTestId('error-severity')).toHaveTextContent('info');
    
    fireEvent.click(screen.getByTestId('add-warning'));
    expect(screen.getByTestId('error-severity')).toHaveTextContent('warning');
    
    fireEvent.click(screen.getByTestId('add-error'));
    expect(screen.getByTestId('error-severity')).toHaveTextContent('error');
  });

  it('sollte Fehler löschen können', () => {
    const ClearTestComponent = () => {
      const { errors, addError, clearErrors } = useErrorContext();
      
      return (
        <div>
          <button
            onClick={() => addError('Fehler 1', 'error')}
            data-testid="add-error-1"
          >
            Fehler 1 hinzufügen
          </button>
          <button
            onClick={() => addError('Fehler 2', 'error')}
            data-testid="add-error-2"
          >
            Fehler 2 hinzufügen
          </button>
          <button
            onClick={clearErrors}
            data-testid="clear-errors"
          >
            Fehler löschen
          </button>
          <div data-testid="error-count">
            {errors.length} Fehler
          </div>
        </div>
      );
    };
    
    render(
      <ErrorProvider>
        <ClearTestComponent />
      </ErrorProvider>
    );
    
    // Füge Fehler hinzu
    fireEvent.click(screen.getByTestId('add-error-1'));
    fireEvent.click(screen.getByTestId('add-error-2'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('2 Fehler');
    
    // Lösche alle Fehler
    fireEvent.click(screen.getByTestId('clear-errors'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('0 Fehler');
  });
});
