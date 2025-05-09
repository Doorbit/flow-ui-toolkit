import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent
} from '@mui/material';
import { PatternLibraryElement } from '../../../models/listingFlow';
import { TextUIElement } from '../../../models/uiElements';
import { TranslatableField } from '../common/TranslatableField';
import TabbedTranslatableFields from '../common/TabbedTranslatableFields';
import { AccordionSection } from '../common/AccordionSection';
import { ElementTypeIndicator } from '../common/ElementTypeIndicator';
import { ElementPreview } from '../common/ElementPreview';
import IconField from '../common/IconField';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TitleIcon from '@mui/icons-material/Title';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import SettingsIcon from '@mui/icons-material/Settings';

interface TextElementEditorProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Editor-Komponente für TextUIElement.
 * Ermöglicht die Bearbeitung von statischen Textinhalten, die im UI angezeigt werden.
 */
export const TextElementEditor: React.FC<TextElementEditorProps> = ({ element, onUpdate }) => {
  const textElement = element.element as TextUIElement;
  const [languageTab, setLanguageTab] = useState(0);

  return (
    <>
      <ElementTypeIndicator
        type="Statischer Text"
        icon={<TextFieldsIcon fontSize="large" color="primary" />}
        description="Zeigt statischen Text an, keine Benutzereingabe"
      />

      <AccordionSection
        title="Grundlegende Informationen"
        icon={<TitleIcon />}
        defaultExpanded={true}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TabbedTranslatableFields
            fields={[
              {
                id: 'title',
                label: 'Titel',
                value: textElement.title,
                onChange: (value) => {
                  const updatedTextElement: TextUIElement = {
                    ...textElement,
                    title: value
                  };
                  const updatedElement = {
                    ...element,
                    element: updatedTextElement
                  };
                  onUpdate(updatedElement);
                }
              }
            ]}
            languageTab={languageTab}
            onLanguageTabChange={(newValue) => setLanguageTab(newValue)}
          />

          <IconField
            value={textElement.icon || ''}
            onChange={(value) => {
              const updatedTextElement: TextUIElement = {
                ...textElement,
                icon: value
              };
              const updatedElement = {
                ...element,
                element: updatedTextElement
              };
              onUpdate(updatedElement);
            }}
          />
        </Box>
      </AccordionSection>

      <AccordionSection
        title="Inhalt & Verhalten"
        icon={<FormatColorTextIcon />}
        defaultExpanded={true}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Typ</InputLabel>
            <Select
              value={textElement.type}
              label="Typ"
              onChange={(e: SelectChangeEvent) => {
                const newValue = e.target.value as "PARAGRAPH" | "HEADING";
                const updatedTextElement: TextUIElement = {
                  ...textElement,
                  type: newValue
                };
                const updatedElement = {
                  ...element,
                  element: updatedTextElement
                };
                onUpdate(updatedElement);
              }}
            >
              <MenuItem value="PARAGRAPH">Paragraph</MenuItem>
              <MenuItem value="HEADING">Überschrift</MenuItem>
            </Select>
          </FormControl>

          <TabbedTranslatableFields
            fields={[
              {
                id: 'text',
                label: 'Text',
                value: textElement.text,
                onChange: (value) => {
                  const updatedTextElement: TextUIElement = {
                    ...textElement,
                    text: value
                  };
                  const updatedElement = {
                    ...element,
                    element: updatedTextElement
                  };
                  onUpdate(updatedElement);
                },
                multiline: true,
                rows: 3
              }
            ]}
            languageTab={languageTab}
            onLanguageTabChange={(newValue) => setLanguageTab(newValue)}
          />
        </Box>
      </AccordionSection>

      <ElementPreview title="Vorschau">
        {textElement.type === 'HEADING' ? (
          <Typography variant="h5" gutterBottom>
            {textElement.text?.de || 'Überschrift'}
          </Typography>
        ) : (
          <Typography variant="body1">
            {textElement.text?.de || 'Absatztext'}
          </Typography>
        )}
      </ElementPreview>
    </>
  );
};
