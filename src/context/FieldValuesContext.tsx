import React, { createContext, useContext, useState, useEffect } from 'react';
import { ListingFlow } from '../models/listingFlow';

// Kontext für die Feldwerte
interface FieldValuesContextType {
  fieldValues: Record<string, any>;
  setFieldValue: (fieldName: string, value: any) => void;
  resetFieldValues: () => void;
}

const FieldValuesContext = createContext<FieldValuesContextType>({
  fieldValues: {},
  setFieldValue: () => {},
  resetFieldValues: () => {}
});

// Hook zum Zugriff auf den Kontext
export const useFieldValues = () => useContext(FieldValuesContext);

// Provider-Komponente
export const FieldValuesProvider: React.FC<{
  children: React.ReactNode;
  flow?: ListingFlow;
}> = ({ children, flow }) => {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  // Setze einen einzelnen Feldwert
  const setFieldValue = (fieldName: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Setze alle Feldwerte zurück
  const resetFieldValues = () => {
    setFieldValues({});
  };

  // Extrahiere Standardwerte aus dem Flow beim Laden
  useEffect(() => {
    if (flow) {
      const defaultValues: Record<string, any> = {};
      
      // Funktion zum rekursiven Extrahieren von Standardwerten
      const extractDefaultValues = (elements: any[]) => {
        elements.forEach(element => {
          if (element.element) {
            const { pattern_type, field_id, default_value } = element.element;
            
            // Für BooleanUIElement, SingleSelectionUIElement, etc.
            if (field_id && field_id.field_name && default_value !== undefined) {
              defaultValues[field_id.field_name] = default_value;
            }
            
            // Rekursiv für verschachtelte Elemente
            if (pattern_type === 'GroupUIElement' && element.element.elements) {
              extractDefaultValues(element.element.elements);
            } else if (pattern_type === 'ArrayUIElement' && element.element.elements) {
              extractDefaultValues(element.element.elements);
            } else if (pattern_type === 'ChipGroupUIElement' && element.element.chips) {
              // Für ChipGroups: Extrahiere Standardwerte aus den Chips
              element.element.chips.forEach((chip: any) => {
                if (chip.field_id && chip.field_id.field_name && chip.default_value !== undefined) {
                  defaultValues[chip.field_id.field_name] = chip.default_value;
                }
              });
            }
          }
        });
      };
      
      // Extrahiere Standardwerte aus allen Seiten
      if (flow.pages_edit) {
        flow.pages_edit.forEach(page => {
          if (page.elements) {
            extractDefaultValues(page.elements);
          }
        });
      }
      
      // Setze die extrahierten Standardwerte
      setFieldValues(defaultValues);
    }
  }, [flow]);

  return (
    <FieldValuesContext.Provider value={{ fieldValues, setFieldValue, resetFieldValues }}>
      {children}
    </FieldValuesContext.Provider>
  );
};
