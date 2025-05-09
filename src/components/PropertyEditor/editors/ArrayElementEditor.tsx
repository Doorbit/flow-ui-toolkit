import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { PatternLibraryElement } from '../../../models/listingFlow';
import { TranslatableField } from '../common/TranslatableField';
import TabbedTranslatableFields from '../common/TabbedTranslatableFields';
import { AccordionSection } from '../common/AccordionSection';
import TitleIcon from '@mui/icons-material/Title';
import TuneIcon from '@mui/icons-material/Tune';

interface ArrayElementEditorProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Spezialisierte Komponente für die Bearbeitung von ArrayUIElement-Eigenschaften.
 * Unterstützt die Bearbeitung von Eigenschaften wie Titel, Beschreibung, Minimum und Maximum Anzahl.
 */
const ArrayElementEditor: React.FC<ArrayElementEditorProps> = ({ element, onUpdate }) => {
  const [languageTab, setLanguageTab] = useState(0);

  // Handler für Änderungen an Textfeldern
  const handleTextChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedElement = { ...element };
    const elementAny = updatedElement.element as any;

    // Konvertiere Werte zu Zahlen, wenn sie numerisch sind
    const value = event.target.value;
    if (field === 'min_count' || field === 'max_count' || field === 'min_items' || field === 'max_items') {
      elementAny[field] = value === '' ? '' : Number(value);
    } else {
      elementAny[field] = value;
    }

    onUpdate(updatedElement);
  };

  // Handler für Änderungen an Schaltern
  const handleSwitchChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedElement = { ...element };
    const elementAny = updatedElement.element as any;
    elementAny[field] = event.target.checked;

    onUpdate(updatedElement);
  };

  // Bestimme die korrekten Feldnamen für min/max (es gibt sowohl min_items/max_items als auch min_count/max_count)
  const minField = (element.element as any).min_count !== undefined ? 'min_count' : 'min_items';
  const maxField = (element.element as any).max_count !== undefined ? 'max_count' : 'max_items';

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

          <TextField
            label="Icon"
            size="small"
            value={(element.element as any).icon || ''}
            onChange={(e) => {
              const updatedElement = { ...element };
              const elementAny = updatedElement.element as any;
              elementAny.icon = e.target.value;
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
          <TextField
            label="Minimale Anzahl"
            type="number"
            value={(element.element as any)[minField] || ''}
            onChange={handleTextChange(minField)}
            fullWidth
            size="small"
          />

          <TextField
            label="Maximale Anzahl"
            type="number"
            value={(element.element as any)[maxField] || ''}
            onChange={handleTextChange(maxField)}
            fullWidth
            size="small"
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

export default ArrayElementEditor;
