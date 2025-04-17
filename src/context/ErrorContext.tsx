import React, { createContext, useState, useContext, ReactNode } from 'react';

export type ErrorSeverity = 'info' | 'warning' | 'error';

export interface ErrorMessage {
  id: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  details?: unknown;
}

interface ErrorContextType {
  errors: ErrorMessage[];
  addError: (message: string, severity: ErrorSeverity, details?: unknown) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useErrorContext = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  const addError = (message: string, severity: ErrorSeverity = 'error', details?: unknown) => {
    const newError: ErrorMessage = {
      id: Date.now().toString(),
      message,
      severity,
      timestamp: new Date(),
      details
    };
    setErrors(prev => [...prev, newError]);
    
    // Log errors to console for debugging
    if (severity === 'error') {
      console.error(message, details);
    } else if (severity === 'warning') {
      console.warn(message, details);
    } else {
      console.info(message, details);
    }
  };

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};