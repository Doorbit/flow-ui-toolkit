import React from 'react';
import {
  TextField,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import { PatternLibraryElement } from '../../models/listingFlow';
import { TranslatableField } from './common/TranslatableField';
import { SectionTitle } from './common/SectionTitle';
import { VisibilityConditionEditor } from './editors/VisibilityConditionEditor';
import IconField from './common/IconField';

interface CommonPropertiesEditorProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Komponente zum Bearbeiten der gemeinsamen Eigenschaften aller Elemente.
 */
export const CommonPropertiesEditor: React.FC<CommonPropertiesEditorProps> = ({ element, onUpdate }) => {
  const isTextUIElement = element.element.pattern_type === 'TextUIElement';

  return (
    <>
      <SectionTitle variant="subtitle1">Allgemeine Eigenschaften</SectionTitle>
      <Divider />

      <TranslatableField
        label="Titel"
        value={element.element.title}
        onChange={(value) => {
          const updatedElement = {
            ...element,
            element: {
              ...element.element,
              title: value
            }
          };
          onUpdate(updatedElement);
        }}
      />

      <TranslatableField
        label="Kurztitel"
        value={element.element.short_title}
        onChange={(value) => {
          const updatedElement = {
            ...element,
            element: {
              ...element.element,
              short_title: value
            }
          };
          onUpdate(updatedElement);
        }}
      />

      {!isTextUIElement && (
        <TranslatableField
          label="Beschreibung"
          value={element.element.description}
          onChange={(value) => {
            const updatedElement = {
              ...element,
              element: {
                ...element.element,
                description: value
              }
            };
            onUpdate(updatedElement);
          }}
        />
      )}

      <FormControlLabel
        control={
          <Switch
            checked={element.element.required}
            onChange={(e) => {
              const updatedElement = {
                ...element,
                element: {
                  ...element.element,
                  required: e.target.checked
                }
              };
              onUpdate(updatedElement);
            }}
          />
        }
        label="Erforderlich"
      />

      <IconField
        value={element.element.icon || ''}
        onChange={(value) => {
          const updatedElement = {
            ...element,
            element: {
              ...element.element,
              icon: value
            }
          };
          onUpdate(updatedElement);
        }}
      />

      <VisibilityConditionEditor
        visibilityCondition={element.element.visibility_condition}
        onChange={(newCondition) => {
          const updatedElement = {
            ...element,
            element: {
              ...element.element,
              visibility_condition: newCondition
            }
          };
          onUpdate(updatedElement);
        }}
      />
    </>
  );
};
