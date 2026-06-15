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

import TabbedTranslatableFields from '../common/TabbedTranslatableFields';
import { AccordionSection } from '../common/AccordionSection';
import { ElementTypeIndicator } from '../common/ElementTypeIndicator';
import { ElementPreview } from '../common/ElementPreview';
import NumbersIcon from '@mui/icons-material/Numbers';
import TitleIcon from '@mui/icons-material/Title';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';

// Unterstützte Einheiten für NumberUIElement
const SUPPORTED_UNITS = [
  { value: 'CENTIMETER', label: 'Zentimeter (cm)' },
  { value: 'DEGREE_OF_ARC', label: 'Grad (°)' },
  { value: 'WATT_PER_SQUARE_METER_PER_KELVIN', label: 'W/(m²·K)' },
  { value: 'SQUARE_METER', label: 'Quadratmeter (m²)' },
  { value: 'KILOWATT', label: 'Kilowatt (kW)' },
  { value: 'LITER', label: 'Liter (L)' },
  { value: 'PERCENTAGE', label: 'Prozent (%)' },
  { value: 'METER', label: 'Meter (m)' },
  { value: 'DEGREE_CELSIUS', label: 'Grad Celsius (°C)' },
  { value: 'KILOWATT_HOUR', label: 'Kilowattstunde (kWh)' }
] as const;

interface NumberElementEditorProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Hilfsfunktion, um den Einheitswert in eine lesbare Darstellung umzuwandeln
 */
const getUnitDisplayLabel = (unitValue: string | undefined): string => {
  if (!unitValue) return '';
  const unit = SUPPORTED_UNITS.find(u => u.value === unitValue);
  if (unit) {
    // Extrahiere nur die Einheit in Klammern, z.B. "(cm)" aus "Zentimeter (cm)"
    const match = unit.label.match(/\(([^)]+)\)/);
    return match ? match[1] : unitValue;
  }
  return unitValue;
};

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
    if (field === 'minimum' || field === 'maximum' || field === 'default') {
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
  const min = numberElement.minimum !== undefined ? numberElement.minimum : 0;
  const max = numberElement.maximum !== undefined ? numberElement.maximum : 100;
  const step = 1; // portal kennt keine Schrittweite — nur für die Slider-Vorschau
  const defaultValue = numberElement.default !== undefined ? numberElement.default : min;

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

          <FormControl fullWidth size="small">
            <InputLabel>Einheit</InputLabel>
            <Select
              value={numberElement.unit || ''}
              label="Einheit"
              onChange={(e: SelectChangeEvent<string>) => {
                const updatedElement = { ...element };
                const elementAny = updatedElement.element as any;
                elementAny.unit = e.target.value;
                onUpdate(updatedElement);
              }}
            >
              <MenuItem value="">
                <em>Keine Einheit</em>
              </MenuItem>
              {SUPPORTED_UNITS.map((unit) => (
                <MenuItem key={unit.value} value={unit.value}>
                  {unit.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Wählen Sie eine Einheit für die Zahleneingabe
            </FormHelperText>
          </FormControl>

          <TextField
            label="Default-Wert"
            type="number"
            value={numberElement.default !== undefined ? numberElement.default : ''}
            onChange={handleTextChange('default')}
            fullWidth
            size="small"
            InputProps={{
              endAdornment: numberElement.unit ? (
                <InputAdornment position="end">{getUnitDisplayLabel(numberElement.unit)}</InputAdornment>
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
              value={numberElement.minimum !== undefined ? numberElement.minimum : ''}
              onChange={handleTextChange('minimum')}
              fullWidth
              size="small"
            />
            <TextField
              label="Maximum"
              type="number"
              value={numberElement.maximum !== undefined ? numberElement.maximum : ''}
              onChange={handleTextChange('maximum')}
              fullWidth
              size="small"
            />
          </Box>

          {numberElement.minimum !== undefined && numberElement.maximum !== undefined && (
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
                <InputAdornment position="end">{getUnitDisplayLabel(numberElement.unit)}</InputAdornment>
              ) : null,
              inputProps: {
                min: numberElement.minimum,
                max: numberElement.maximum,
                step: 1
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
