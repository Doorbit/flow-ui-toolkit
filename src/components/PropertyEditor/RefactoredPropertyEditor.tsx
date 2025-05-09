import React from 'react';
import styled from 'styled-components';
import { Paper, Typography, Box } from '@mui/material';
import { PatternLibraryElement } from '../../models/listingFlow';
import { CommonPropertiesEditor } from './CommonPropertiesEditor';
import { ElementEditorFactory } from './ElementEditorFactory';

const PropertyEditorContainer = styled(Paper)`
  width: 100%;
  height: 100%;
  padding: 1rem;
  background-color: #f5f5f5;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

interface PropertyEditorProps {
  element: PatternLibraryElement | null;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Refaktorierte PropertyEditor-Komponente, die die Bearbeitung von Elementen in kleinere Komponenten aufteilt.
 */
export const RefactoredPropertyEditor: React.FC<PropertyEditorProps> = ({ element, onUpdate }) => {
  if (!element) {
    return (
      <PropertyEditorContainer>
        <Typography variant="subtitle1" sx={{ padding: 2, textAlign: 'center', color: '#666' }}>
          Kein Element ausgewählt
        </Typography>
      </PropertyEditorContainer>
    );
  }

  return (
    <PropertyEditorContainer>
      <Typography variant="h6" gutterBottom>
        Eigenschaften
      </Typography>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        {element.element.pattern_type}
      </Typography>

      <Form>
        {/* Gemeinsame Eigenschaften für alle Elemente */}
        <CommonPropertiesEditor element={element} onUpdate={onUpdate} />
        
        {/* Spezifische Eigenschaften je nach Elementtyp */}
        <Box sx={{ mt: 2 }}>
          <ElementEditorFactory element={element} onUpdate={onUpdate} />
        </Box>
      </Form>
    </PropertyEditorContainer>
  );
};
