import React from 'react';
import { Box } from '@mui/material';
import { PatternLibraryElement } from '../../../models/listingFlow';

interface EditorAreaProps {
  elements: PatternLibraryElement[];
  selectedElementPath?: number[];
  onSelectElement: (path: number[]) => void;
  onRemoveElement: (path: number[]) => void;
  onDuplicateElement: (path: number[]) => void;
  onAddSubElement?: (parentPath: number[], type: string) => void;
  onDropElement?: (type: string, parentPath?: number[]) => void;
  onMoveElement?: (sourceIndex: number, targetIndex: number, parentPath?: number[]) => void;
}

// Mock-Implementation für Tests
const EditorArea: React.FC<EditorAreaProps> = ({ 
  elements, 
  selectedElementPath,
  onSelectElement,
  onRemoveElement,
  onDuplicateElement
}) => {
  return (
    <Box data-testid="mock-editor-area">
      Mock EditorArea: {elements.length} Elemente
      {selectedElementPath && selectedElementPath.length > 0 && (
        <div>Ausgewählter Pfad: {selectedElementPath.join('-')}</div>
      )}
    </Box>
  );
};

export default EditorArea;
