import React from 'react';
import { PatternLibraryElement } from '../../../../../models/listingFlow';

interface PropertyEditorProps {
  selectedElement: PatternLibraryElement | null;
  onPropertyChange: (path: string, value: any) => void;
}

// Mock für PropertyEditor
const PropertyEditor: React.FC<PropertyEditorProps> = ({ selectedElement, onPropertyChange }) => {
  return (
    <div data-testid="mock-property-editor" className="property-editor">
      <div className="editor-header">Eigenschaften</div>
      
      {selectedElement ? (
        <div className="property-fields">
          <div className="property-field">
            <label>Typ:</label>
            <span>{selectedElement.element.pattern_type}</span>
          </div>
          <button onClick={() => onPropertyChange('title.de', 'Neuer Titel')}>
            Titel ändern
          </button>
        </div>
      ) : (
        <div className="no-selection">Kein Element ausgewählt</div>
      )}
    </div>
  );
};

export default PropertyEditor;
