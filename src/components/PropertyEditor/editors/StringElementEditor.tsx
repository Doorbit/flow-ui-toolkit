import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  InputAdornment,
  Tooltip,
  FormHelperText,
  Input
} from '@mui/material';
import { PatternLibraryElement } from '../../../models/listingFlow';
import { StringUIElement } from '../../../models/uiElements';
import { TranslatableField } from '../common/TranslatableField';
import TabbedTranslatableFields from '../common/TabbedTranslatableFields';
import { AccordionSection } from '../common/AccordionSection';
import { ElementTypeIndicator } from '../common/ElementTypeIndicator';
import { ElementPreview } from '../common/ElementPreview';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TitleIcon from '@mui/icons-material/Title';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface StringElementEditorProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Spezialisierte Komponente für die Bearbeitung von StringUIElement-Eigenschaften.
 * Unterstützt die Bearbeitung von Eigenschaften wie Platzhalter, Muster und Default-Wert.
 */
const StringElementEditor: React.FC<StringElementEditorProps> = ({ element, onUpdate }) => {
  const stringElement = element.element as StringUIElement;
  const [languageTab, setLanguageTab] = useState(0);

  // Handler für Änderungen an Textfeldern
  const handleTextChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedElement = { ...element };
    const elementAny = updatedElement.element as any;
    elementAny[field] = event.target.value;

    onUpdate(updatedElement);
  };

  // Handler für Änderungen an Schaltern
  const handleSwitchChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedElement = { ...element };
    const elementAny = updatedElement.element as any;
    elementAny[field] = event.target.checked;

    onUpdate(updatedElement);
  };

  return (
    <>
      <ElementTypeIndicator
        type="Texteingabe"
        icon={<TextFieldsIcon fontSize="large" color="primary" />}
        description="Ermöglicht Benutzern die Eingabe von Text"
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
                value: stringElement.title || { de: '', en: '' },
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
                value: stringElement.description || { de: '', en: '' },
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
            value={stringElement.icon || ''}
            onChange={handleTextChange('icon')}
            fullWidth
          />
        </Box>
      </AccordionSection>

      <AccordionSection
        title="Inhalt & Verhalten"
        icon={<TuneIcon />}
        defaultExpanded={true}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TabbedTranslatableFields
            fields={[
              {
                id: 'placeholder',
                label: 'Platzhalter',
                value: stringElement.placeholder || { de: '', en: '' },
                onChange: (value) => {
                  const updatedElement = { ...element };
                  const elementAny = updatedElement.element as any;
                  elementAny.placeholder = value;
                  onUpdate(updatedElement);
                }
              }
            ]}
            languageTab={languageTab}
            onLanguageTabChange={(newValue) => setLanguageTab(newValue)}
          />

          <TextField
            label="Default-Wert"
            value={stringElement.default_value || ''}
            onChange={handleTextChange('default_value')}
            fullWidth
            size="small"
          />

          <FormControlLabel
            control={
              <Switch
                checked={!!stringElement.multiline}
                onChange={handleSwitchChange('multiline')}
                color="primary"
              />
            }
            label="Mehrzeilig"
          />

          {stringElement.multiline && (
            <TextField
              label="Anzahl der Zeilen"
              type="number"
              value={stringElement.rows || 3}
              onChange={handleTextChange('rows')}
              fullWidth
              size="small"
              InputProps={{ inputProps: { min: 2, max: 20 } }}
            />
          )}
        </Box>
      </AccordionSection>

      <AccordionSection
        title="Validierung & Einschränkungen"
        icon={<VerifiedIcon />}
        defaultExpanded={false}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={!!stringElement.required}
                onChange={handleSwitchChange('required')}
                color="primary"
              />
            }
            label="Erforderlich"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Min. Länge"
              type="number"
              value={stringElement.length_minimum || ''}
              onChange={handleTextChange('length_minimum')}
              fullWidth
              size="small"
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              label="Max. Länge"
              type="number"
              value={stringElement.length_maximum || ''}
              onChange={handleTextChange('length_maximum')}
              fullWidth
              size="small"
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Box>

          <TextField
            label="Muster (Regex)"
            value={stringElement.pattern || ''}
            onChange={handleTextChange('pattern')}
            fullWidth
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Regulärer Ausdruck zur Validierung der Eingabe, z.B. ^[0-9]+$ für Zahlen">
                    <HelpOutlineIcon color="info" fontSize="small" />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          <FormHelperText>
            Beispiele: ^[0-9]+$ (nur Zahlen), ^[A-Za-z]+$ (nur Buchstaben)
          </FormHelperText>
        </Box>
      </AccordionSection>

      <AccordionSection
        title="Erweiterte Einstellungen"
        icon={<SettingsIcon />}
        defaultExpanded={false}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Feld-ID"
            value={stringElement.field_id || ''}
            onChange={handleTextChange('field_id')}
            fullWidth
            size="small"
          />
        </Box>
      </AccordionSection>

      <ElementPreview title="Vorschau">
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {stringElement.title?.de || 'Texteingabe'}
          </Typography>
          {stringElement.multiline ? (
            <TextField
              fullWidth
              multiline
              rows={stringElement.rows || 3}
              placeholder={stringElement.placeholder?.de || ''}
              defaultValue={stringElement.default_value || ''}
              disabled
            />
          ) : (
            <TextField
              fullWidth
              placeholder={stringElement.placeholder?.de || ''}
              defaultValue={stringElement.default_value || ''}
              disabled
            />
          )}
        </Box>
      </ElementPreview>
    </>
  );
};

export default StringElementEditor;
