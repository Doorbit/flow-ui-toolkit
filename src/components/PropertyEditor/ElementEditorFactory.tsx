import React from 'react';
import { PatternLibraryElement } from '../../models/listingFlow';
import {
  TextElementEditor,
  BooleanElementEditor,
  NumberElementEditor,
  DateElementEditor,
  StringElementEditor,
  GroupElementEditor,
  ArrayElementEditor,
  CustomElementEditor
} from './editors';
import ChipGroupEditor from './editors/ChipGroupEditor';
import SingleSelectionElementEditorEnhanced from './editors/SingleSelectionElementEditorEnhanced';
import FileElementEditorEnhanced from './editors/FileElementEditorEnhanced';
import {
  // Diese Typen werden für Typumwandlungen in den case-Anweisungen verwendet
  SingleSelectionUIElement,
  FileUIElement,
  ChipGroupUIElement
} from '../../models/uiElements';

interface ElementEditorFactoryProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Factory-Komponente, die basierend auf dem Elementtyp die passende Editor-Komponente rendert.
 */
export const ElementEditorFactory: React.FC<ElementEditorFactoryProps> = ({ element, onUpdate }) => {
  const elementType = element.element.pattern_type;

  // Rendere die passende Editor-Komponente basierend auf dem Elementtyp
  switch (elementType) {
    case 'TextUIElement':
      return <TextElementEditor element={element} onUpdate={onUpdate} />;

    case 'BooleanUIElement':
      return <BooleanElementEditor element={element} onUpdate={onUpdate} />;

    case 'SingleSelectionUIElement':
      return <SingleSelectionElementEditorEnhanced
               element={element.element as SingleSelectionUIElement}
               onChange={(updatedElement: SingleSelectionUIElement) => {
                 onUpdate({ ...element, element: updatedElement });
               }}
             />;

    case 'FileUIElement':
      return <FileElementEditorEnhanced
               element={element.element as FileUIElement}
               onChange={(updatedElement: FileUIElement) => {
                 onUpdate({ ...element, element: updatedElement });
               }}
             />;

    case 'ChipGroupUIElement':
      return <ChipGroupEditor
               element={element.element as ChipGroupUIElement}
               onChange={(updatedElement) => {
                 onUpdate({ ...element, element: updatedElement });
               }}
             />;

    case 'NumberUIElement':
      return <NumberElementEditor element={element} onUpdate={onUpdate} />;

    case 'DateUIElement':
      return <DateElementEditor element={element} onUpdate={onUpdate} />;

    case 'StringUIElement':
      return <StringElementEditor element={element} onUpdate={onUpdate} />;

    case 'GroupUIElement':
      return <GroupElementEditor element={element} onUpdate={onUpdate} />;

    case 'ArrayUIElement':
      return <ArrayElementEditor element={element} onUpdate={onUpdate} />;

    case 'CustomUIElement':
      return <CustomElementEditor element={element} onUpdate={onUpdate} />;

    default:
      return (
        <div>
          Editor für {elementType} ist noch nicht implementiert.
        </div>
      );
  }
};
