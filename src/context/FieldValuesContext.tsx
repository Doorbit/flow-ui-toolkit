import React, { createContext, useContext, useState, useEffect } from 'react';
import { ListingFlow } from '../models/listingFlow';

// Kontext für die Feldwerte
interface FieldValuesContextType {
  fieldValues: Record<string, any>;
  setFieldValue: (fieldName: string, value: any) => void;
  resetFieldValues: () => void;
  availableFields: Array<{
    fieldName: string,
    elementType: string,
    title: string,
    pageName?: string, // Name der Seite, zu der das Feld gehört
    pageId?: string // ID der Seite, zu der das Feld gehört
  }>;
}

const FieldValuesContext = createContext<FieldValuesContextType>({
  fieldValues: {},
  setFieldValue: () => {},
  resetFieldValues: () => {},
  availableFields: []
});

// Hook zum Zugriff auf den Kontext
export const useFieldValues = () => useContext(FieldValuesContext);

// Provider-Komponente
export const FieldValuesProvider: React.FC<{
  children: React.ReactNode;
  flow?: ListingFlow;
}> = ({ children, flow }) => {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [availableFields, setAvailableFields] = useState<Array<{
    fieldName: string,
    elementType: string,
    title: string,
    pageName?: string,
    pageId?: string
  }>>([]);

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

  // Extrahiere Standardwerte und verfügbare Felder aus dem Flow beim Laden
  useEffect(() => {
    if (flow) {
      const defaultValues: Record<string, any> = {};
      const fields: Array<{
        fieldName: string,
        elementType: string,
        title: string,
        pageName?: string,
        pageId?: string
      }> = [];

      // Funktion zum rekursiven Extrahieren von Standardwerten und Feldern
      const extractFieldsAndValues = (elements: any[], pageId: string, pageName: string) => {
        elements.forEach(element => {
          if (element.element) {
            const { pattern_type, field_id, default_value, title } = element.element;

            // Für Elemente mit field_id
            if (field_id && field_id.field_name) {
              // Standardwerte extrahieren
              if (default_value !== undefined) {
                defaultValues[field_id.field_name] = default_value;
              }

              // Feld zur Liste hinzufügen
              const fieldTitle = title && (title.de || title.en) ? (title.de || title.en) : field_id.field_name;
              fields.push({
                fieldName: field_id.field_name,
                elementType: pattern_type,
                title: fieldTitle,
                pageName: pageName,
                pageId: pageId
              });
            }

            // Rekursiv für verschachtelte Elemente
            if (pattern_type === 'GroupUIElement' && element.element.elements) {
              extractFieldsAndValues(element.element.elements, pageId, pageName);
            } else if (pattern_type === 'ArrayUIElement' && element.element.elements) {
              extractFieldsAndValues(element.element.elements, pageId, pageName);
            } else if (pattern_type === 'ChipGroupUIElement' && element.element.chips) {
              // Für ChipGroups: Extrahiere Felder und Werte aus den Chips
              element.element.chips.forEach((chip: any) => {
                if (chip.field_id && chip.field_id.field_name) {
                  // Standardwerte extrahieren
                  if (chip.default_value !== undefined) {
                    defaultValues[chip.field_id.field_name] = chip.default_value;
                  }

                  // Feld zur Liste hinzufügen
                  const chipTitle = chip.title && (chip.title.de || chip.title.en) ? (chip.title.de || chip.title.en) : chip.field_id.field_name;
                  fields.push({
                    fieldName: chip.field_id.field_name,
                    elementType: chip.pattern_type || 'BooleanUIElement', // ChipGroups enthalten normalerweise BooleanUIElements
                    title: chipTitle,
                    pageName: pageName,
                    pageId: pageId
                  });
                }
              });
            }
          }
        });
      };

      // Extrahiere Felder und Werte aus allen Seiten
      if (flow.pages_edit) {
        flow.pages_edit.forEach(page => {
          if (page.elements) {
            const pageName = page.title?.de || page.title?.en || page.id;
            extractFieldsAndValues(page.elements, page.id, pageName);
          }
        });
      }

      // Setze die extrahierten Werte
      setFieldValues(defaultValues);
      setAvailableFields(fields);
    }
  }, [flow]);

  return (
    <FieldValuesContext.Provider value={{ fieldValues, setFieldValue, resetFieldValues, availableFields }}>
      {children}
    </FieldValuesContext.Provider>
  );
};
