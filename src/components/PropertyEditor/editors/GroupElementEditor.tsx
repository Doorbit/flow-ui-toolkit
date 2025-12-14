import React, { useState } from 'react';
import {
  Box,
  FormControlLabel,
  Switch
} from '@mui/material';
import { PatternLibraryElement } from '../../../models/listingFlow';

import TabbedTranslatableFields from '../common/TabbedTranslatableFields';
import { AccordionSection } from '../common/AccordionSection';
import IconField from '../common/IconField';
import TitleIcon from '@mui/icons-material/Title';
import TuneIcon from '@mui/icons-material/Tune';

interface GroupElementEditorProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Spezialisierte Komponente für die Bearbeitung von GroupUIElement-Eigenschaften.
 * Unterstützt die Bearbeitung von Eigenschaften wie Titel, Beschreibung und Einklappbarkeit.
 */
const GroupElementEditor: React.FC<GroupElementEditorProps> = ({ element, onUpdate }) => {
  const [languageTab, setLanguageTab] = useState(0);

  // Handler für Änderungen an Schaltern
  const handleSwitchChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedElement = { ...element };
    const elementAny = updatedElement.element as any;
    elementAny[field] = event.target.checked;

    onUpdate(updatedElement);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                value: (element.element as any).title || { de: '', en: '' },
                onChange: (value) => {
                  const updatedElement = { ...element };
                  const elementAny = updatedElement.element as any;
                  elementAny.title = value;
                  onUpdate(updatedElement);
                }
              },
              {
                id: 'description',
                label: 'Beschreibung',
                value: (element.element as any).description || { de: '', en: '' },
                onChange: (value) => {
                  const updatedElement = { ...element };
                  const elementAny = updatedElement.element as any;
                  elementAny.description = value;
                  onUpdate(updatedElement);
                },
                multiline: true,
                rows: 2
              }
            ]}
            languageTab={languageTab}
            onLanguageTabChange={(newValue) => setLanguageTab(newValue)}
          />

          <IconField
            value={(element.element as any).icon || ''}
            onChange={(value) => {
              const updatedElement = { ...element };
              const elementAny = updatedElement.element as any;
              elementAny.icon = value;
              onUpdate(updatedElement);
            }}
          />
        </Box>
      </AccordionSection>

      <AccordionSection
        title="Inhalt & Verhalten"
        icon={<TuneIcon />}
        defaultExpanded={true}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={!!(element.element as any).collapsible}
                onChange={handleSwitchChange('collapsible')}
                color="primary"
              />
            }
            label="Ist eingeklappt"
          />

          <FormControlLabel
            control={
              <Switch
                checked={!!(element.element as any).required}
                onChange={handleSwitchChange('required')}
                color="primary"
              />
            }
            label="Erforderlich"
          />
        </Box>
      </AccordionSection>
    </Box>
  );
};

export default GroupElementEditor;
