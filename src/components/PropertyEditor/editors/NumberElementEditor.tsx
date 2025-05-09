import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Slider,
  InputAdornment,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { PatternLibraryElement } from '../../../models/listingFlow';
import { NumberUIElement } from '../../../models/uiElements';
import { TranslatableField } from '../common/TranslatableField';
import TabbedTranslatableFields from '../common/TabbedTranslatableFields';
import { AccordionSection } from '../common/AccordionSection';
import { ElementTypeIndicator } from '../common/ElementTypeIndicator';
import { ElementPreview } from '../common/ElementPreview';
import NumbersIcon from '@mui/icons-material/Numbers';
import TitleIcon from '@mui/icons-material/Title';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';
import SettingsIcon from '@mui/icons-material/Settings';

interface NumberElementEditorProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Spezialisierte Komponente für die Bearbeitung von NumberUIElement-Eigenschaften.
 * Unterstützt die Bearbeitung von Eigenschaften wie Minimum, Maximum, Schrittweite und Default-Wert.
 */
const NumberElementEditor: React.FC<NumberElementEditorProps> = ({ element, onUpdate }) => {
  const numberElement = element.element as NumberUIElement;
  const [languageTab, setLanguageTab] = useState(0);

  // Handler für Änderungen an Textfeldern
  const handleTextChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedElement = { ...element };
    const elementAny = updatedElement.element as any;

    // Konvertiere Werte zu Zahlen, wenn sie numerisch sind
    const value = event.target.value;
    if (field === 'min' || field === 'max' || field === 'step' || field === 'default_value') {
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

  // Handler für Änderungen am Typ
  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    const updatedElement = { ...element };
    const elementAny = updatedElement.element as any;
    elementAny.type = event.target.value as string;
    onUpdate(updatedElement);
  };

  // Berechne den Slider-Bereich
  const min = numberElement.min !== undefined ? numberElement.min : 0;
  const max = numberElement.max !== undefined ? numberElement.max : 100;
  const step = numberElement.step || 1;
  const defaultValue = numberElement.default_value !== undefined
    ? numberElement.default_value
    : (numberElement.default !== undefined ? numberElement.default : min);

  return (
    <>
      <ElementTypeIndicator
        type="Zahleneingabe"
        icon={<NumbersIcon fontSize="large" color="primary" />}
        description="Ermöglicht Benutzern die Eingabe von Zahlen"
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
                value: numberElement.title || { de: '', en: '' },
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
                value: numberElement.description || { de: '', en: '' },
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
            value={numberElement.icon || ''}
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
          <FormControl fullWidth size="small">
            <InputLabel>Typ</InputLabel>
            <Select
              value={numberElement.type || 'INTEGER'}
              label="Typ"
              onChange={handleTypeChange}
            >
              <MenuItem value="INTEGER">Ganzzahl</MenuItem>
              <MenuItem value="DOUBLE">Dezimalzahl</MenuItem>
            </Select>
            <FormHelperText>
              {numberElement.type === 'INTEGER'
                ? 'Nur ganze Zahlen erlaubt'
                : 'Dezimalzahlen erlaubt'}
            </FormHelperText>
          </FormControl>

          <TextField
            label="Einheit"
            value={numberElement.unit || ''}
            onChange={handleTextChange('unit')}
            fullWidth
            size="small"
            placeholder="z.B. kg, m, €"
          />

          <TextField
            label="Default-Wert"
            type="number"
            value={numberElement.default_value !== undefined
              ? numberElement.default_value
              : (numberElement.default !== undefined ? numberElement.default : '')}
            onChange={handleTextChange('default_value')}
            fullWidth
            size="small"
            InputProps={{
              endAdornment: numberElement.unit ? (
                <InputAdornment position="end">{numberElement.unit}</InputAdornment>
              ) : null,
            }}
          />
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
                checked={!!numberElement.required}
                onChange={handleSwitchChange('required')}
                color="primary"
              />
            }
            label="Erforderlich"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Minimum"
              type="number"
              value={numberElement.min !== undefined ? numberElement.min : ''}
              onChange={handleTextChange('min')}
              fullWidth
              size="small"
            />
            <TextField
              label="Maximum"
              type="number"
              value={numberElement.max !== undefined ? numberElement.max : ''}
              onChange={handleTextChange('max')}
              fullWidth
              size="small"
            />
          </Box>

          <TextField
            label="Schrittweite"
            type="number"
            value={numberElement.step || ''}
            onChange={handleTextChange('step')}
            fullWidth
            size="small"
            helperText={`Erlaubte Werte: ${min}, ${min + step}, ${min + 2 * step}, ...`}
          />

          {numberElement.min !== undefined && numberElement.max !== undefined && (
            <Box sx={{ px: 2, mt: 1 }}>
              <Typography gutterBottom>Wertebereich-Vorschau</Typography>
              <Slider
                value={typeof defaultValue === 'number' ? defaultValue : min}
                min={min}
                max={max}
                step={step}
                marks={[
                  { value: min, label: min.toString() },
                  { value: max, label: max.toString() }
                ]}
                valueLabelDisplay="auto"
                disabled
              />
            </Box>
          )}
        </Box>
      </AccordionSection>


      <ElementPreview title="Vorschau">
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {numberElement.title?.de || 'Zahleneingabe'}
          </Typography>
          <TextField
            fullWidth
            type="number"
            defaultValue={defaultValue}
            InputProps={{
              endAdornment: numberElement.unit ? (
                <InputAdornment position="end">{numberElement.unit}</InputAdornment>
              ) : null,
              inputProps: {
                min: numberElement.min,
                max: numberElement.max,
                step: numberElement.step || 1
              }
            }}
            disabled
          />
        </Box>
      </ElementPreview>
    </>
  );
};

export default NumberElementEditor;
