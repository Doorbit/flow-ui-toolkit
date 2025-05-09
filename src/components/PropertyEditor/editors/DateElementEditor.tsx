import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
  TextField,
  InputAdornment,
  Tooltip,
  FormHelperText,
  Chip
} from '@mui/material';
import { PatternLibraryElement } from '../../../models/listingFlow';
import { DateUIElement } from '../../../models/uiElements';
import { TranslatableField } from '../common/TranslatableField';
import TabbedTranslatableFields from '../common/TabbedTranslatableFields';
import { AccordionSection } from '../common/AccordionSection';
import { ElementTypeIndicator } from '../common/ElementTypeIndicator';
import { ElementPreview } from '../common/ElementPreview';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TitleIcon from '@mui/icons-material/Title';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface DateElementEditorProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Spezialisierte Komponente für die Bearbeitung von DateUIElement-Eigenschaften.
 * Unterstützt die Bearbeitung von Eigenschaften wie Datumstyp (Jahr, Monat, Tag, Stunde, Minute).
 */
const DateElementEditor: React.FC<DateElementEditorProps> = ({ element, onUpdate }) => {
  const dateElement = element.element as DateUIElement;
  const [languageTab, setLanguageTab] = useState(0);

  // Handler für Änderungen an Auswahlfeldern
  const handleSelectChange = (field: string) => (event: SelectChangeEvent) => {
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

  // Handler für Änderungen an Textfeldern
  const handleTextChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedElement = { ...element };
    const elementAny = updatedElement.element as any;
    elementAny[field] = event.target.value;

    onUpdate(updatedElement);
  };

  // Hilfsfunktion für die Anzeige des Hilfetext basierend auf dem Datumstyp
  function getHelperTextForDateType(type: string): string {
    switch (type) {
      case 'YEAR':
        return 'Format: YYYY (z.B. 2023)';
      case 'MONTH':
        return 'Format: MM (z.B. 01 für Januar)';
      case 'DAY':
        return 'Format: DD (z.B. 15)';
      case 'HOUR':
        return 'Format: HH (z.B. 14 für 14:00)';
      case 'MINUTE':
        return 'Format: MM (z.B. 30)';
      case 'YMD':
        return 'Format: YYYY-MM-DD (z.B. 2023-01-15)';
      default:
        return 'Format abhängig vom gewählten Typ';
    }
  }

  // Hilfsfunktion für die Anzeige des Eingabetyps basierend auf dem Datumstyp
  function getInputTypeForDateType(type: string): string {
    switch (type) {
      case 'YEAR':
        return 'number';
      case 'MONTH':
        return 'month';
      case 'DAY':
        return 'number';
      case 'HOUR':
        return 'time';
      case 'MINUTE':
        return 'number';
      case 'YMD':
        return 'date';
      default:
        return 'text';
    }
  }

  // Hilfsfunktion für die Anzeige des Icons basierend auf dem Datumstyp
  function getIconForDateType(type: string): React.ReactElement {
    switch (type) {
      case 'HOUR':
      case 'MINUTE':
        return <AccessTimeIcon />;
      default:
        return <CalendarMonthIcon />;
    }
  }

  return (
    <>
      <ElementTypeIndicator
        type="Datumseingabe"
        icon={<CalendarMonthIcon fontSize="large" color="primary" />}
        description="Ermöglicht Benutzern die Eingabe von Datums- oder Zeitwerten"
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
                value: dateElement.title || { de: '', en: '' },
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
                value: dateElement.description || { de: '', en: '' },
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
            value={dateElement.icon || ''}
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
              value={dateElement.type || 'DAY'}
              onChange={handleSelectChange('type')}
              label="Typ"
            >
              <MenuItem value="YEAR">Jahr</MenuItem>
              <MenuItem value="MONTH">Monat</MenuItem>
              <MenuItem value="DAY">Tag</MenuItem>
              <MenuItem value="HOUR">Stunde</MenuItem>
              <MenuItem value="MINUTE">Minute</MenuItem>
              <MenuItem value="YMD">Datum (Jahr-Monat-Tag)</MenuItem>
            </Select>
            <FormHelperText>
              {getHelperTextForDateType(dateElement.type || 'DAY')}
            </FormHelperText>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={getIconForDateType(dateElement.type || 'DAY')}
              label={`Format: ${getHelperTextForDateType(dateElement.type || 'DAY')}`}
              variant="outlined"
              size="small"
            />
            <Tooltip title="Das Format wird automatisch basierend auf dem gewählten Typ festgelegt">
              <HelpOutlineIcon color="info" fontSize="small" />
            </Tooltip>
          </Box>

          <TextField
            label="Default-Wert"
            value={dateElement.default_value || ''}
            onChange={handleTextChange('default_value')}
            fullWidth
            size="small"
            type={getInputTypeForDateType(dateElement.type || 'DAY')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={getHelperTextForDateType(dateElement.type || 'DAY')}>
                    <HelpOutlineIcon color="info" fontSize="small" />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            helperText={getHelperTextForDateType(dateElement.type || 'DAY')}
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
                checked={!!dateElement.required}
                onChange={handleSwitchChange('required')}
                color="primary"
              />
            }
            label="Erforderlich"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Minimum"
              value={dateElement.minimum || ''}
              onChange={handleTextChange('minimum')}
              fullWidth
              size="small"
              type={getInputTypeForDateType(dateElement.type || 'DAY')}
              helperText={`Minimaler ${dateElement.type === 'YMD' ? 'Datumswert' : 'Wert'}`}
            />
            <TextField
              label="Maximum"
              value={dateElement.maximum || ''}
              onChange={handleTextChange('maximum')}
              fullWidth
              size="small"
              type={getInputTypeForDateType(dateElement.type || 'DAY')}
              helperText={`Maximaler ${dateElement.type === 'YMD' ? 'Datumswert' : 'Wert'}`}
            />
          </Box>
        </Box>
      </AccordionSection>



      <ElementPreview title="Vorschau">
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {dateElement.title?.de || 'Datumseingabe'}
          </Typography>
          <TextField
            fullWidth
            type={getInputTypeForDateType(dateElement.type || 'DAY')}
            defaultValue={dateElement.default_value || ''}
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {getIconForDateType(dateElement.type || 'DAY')}
                </InputAdornment>
              ),
            }}
            helperText={getHelperTextForDateType(dateElement.type || 'DAY')}
          />
        </Box>
      </ElementPreview>
    </>
  );
};

export default DateElementEditor;
