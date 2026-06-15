import React from 'react';
import { PatternLibraryElement } from '../../models/listingFlow';
import { ElementEditorFactory } from '../PropertyEditor/ElementEditorFactory';
import { Box, Typography } from '@mui/material';
import FieldIdField from '../PropertyEditor/common/FieldIdField';

interface EnhancedElementEditorFactoryProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

// Wertführende Eingabe-Typen, die zwingend eine Feld-ID brauchen (dort landet der Wert).
const FIELD_ID_TYPES = [
  'BooleanUIElement',
  'StringUIElement',
  'NumberUIElement',
  'DateUIElement',
  'SingleSelectionUIElement',
];

/**
 * Brückenkomponente, die die ElementEditorFactory in den EnhancedPropertyEditor integriert.
 * Diese Komponente dient als Adapter zwischen dem EnhancedPropertyEditor und den spezialisierten
 * Editor-Komponenten aus dem PropertyEditor.
 */
export const EnhancedElementEditorFactory: React.FC<EnhancedElementEditorFactoryProps> = ({
  element,
  onUpdate
}) => {
  if (!element) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Kein Element ausgewählt.
        </Typography>
      </Box>
    );
  }

  const elementType = element.element?.pattern_type;
  const showFieldId = FIELD_ID_TYPES.includes(elementType);
  // field_id robust lesen (manche Altdaten/Editoren hielten es als String statt {field_name}).
  const rawFieldId = (element.element as any).field_id;
  const fieldName = typeof rawFieldId === 'string' ? rawFieldId : rawFieldId?.field_name ?? '';
  const handleFieldIdChange = (name: string) => {
    onUpdate({
      ...element,
      element: { ...element.element, field_id: { field_name: name } } as any,
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      {showFieldId && (
        <FieldIdField value={fieldName} onChange={handleFieldIdChange} />
      )}
      <ElementEditorFactory element={element} onUpdate={onUpdate} />
    </Box>
  );
};

export default EnhancedElementEditorFactory;
