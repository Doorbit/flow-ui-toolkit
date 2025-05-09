import React from 'react';
import { PatternLibraryElement } from '../../models/listingFlow';
import { ElementEditorFactory } from '../PropertyEditor/ElementEditorFactory';
import { Box, Typography } from '@mui/material';

interface EnhancedElementEditorFactoryProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

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

  return (
    <Box sx={{ mt: 2 }}>
      <ElementEditorFactory element={element} onUpdate={onUpdate} />
    </Box>
  );
};

export default EnhancedElementEditorFactory;
