import React from 'react';

interface ElementPaletteProps {
  onElementClick: (type: string) => void;
}

// Mock für ElementPalette
const ElementPalette: React.FC<ElementPaletteProps> = ({ onElementClick }) => {
  return (
    <div data-testid="mock-element-palette" className="element-palette">
      <div className="palette-header">Element-Palette</div>
      <div className="palette-tabs">
        <button onClick={() => {}}>Basis-Elemente</button>
        <button onClick={() => {}}>Komplexe Elemente</button>
      </div>
      <div className="element-list">
        <div className="element-item" onClick={() => onElementClick('TextUIElement')}>Text</div>
        <div className="element-item" onClick={() => onElementClick('BooleanUIElement')}>Boolean</div>
        <div className="element-item" onClick={() => onElementClick('SingleSelectionUIElement')}>Auswahl</div>
        <div className="element-item" onClick={() => onElementClick('NumberUIElement')}>Nummer</div>
      </div>
    </div>
  );
};

export default ElementPalette;
