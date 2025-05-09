import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tabs,
  Tab,
  Checkbox,
  Radio,
  RadioGroup,
  Button,
  ButtonGroup
} from '@mui/material';
import { PatternLibraryElement } from '../../../models/listingFlow';
import { BooleanUIElement } from '../../../models/uiElements';
import { useFieldValues } from '../../../context/FieldValuesContext';
import { AccordionSection } from '../common/AccordionSection';
import { ElementTypeIndicator } from '../common/ElementTypeIndicator';
import { ElementPreview } from '../common/ElementPreview';
import TabbedTranslatableFields from '../common/TabbedTranslatableFields';
import IconField from '../common/IconField';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import TitleIcon from '@mui/icons-material/Title';
import TuneIcon from '@mui/icons-material/Tune';

interface BooleanElementEditorProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Editor-Komponente für BooleanUIElement.
 * Ermöglicht die Bearbeitung von Boolean-Elementen (Ja/Nein-Auswahl).
 */
export const BooleanElementEditor: React.FC<BooleanElementEditorProps> = ({ element, onUpdate }) => {
  const boolElement = element.element as BooleanUIElement;
  const { setFieldValue } = useFieldValues();
  const [languageTab, setLanguageTab] = useState(0);

  // Hilfsfunktion zum Aktualisieren des Elements
  const updateBoolElement = (updates: Partial<BooleanUIElement>) => {
    const updatedBoolElement: BooleanUIElement = {
      ...boolElement,
      ...updates
    };
    const updatedElement = {
      ...element,
      element: updatedBoolElement
    };
    onUpdate(updatedElement);

    // Aktualisiere den Feldwert im FieldValuesContext, wenn default_value geändert wurde
    if ('default_value' in updates && boolElement.field_id?.field_name) {
      setFieldValue(boolElement.field_id.field_name, updates.default_value || false);
    }
  };

  // Hilfsfunktion zum Aktualisieren der Labels
  const updateLabel = (labelType: 'true_label' | 'false_label', language: 'de' | 'en', value: string) => {
    const options = boolElement.options || { true_label: {}, false_label: {} };
    const label = options[labelType] || {};

    updateBoolElement({
      options: {
        ...options,
        [labelType]: {
          ...label,
          [language]: value
        }
      }
    });
  };

  return (
    <>
      <ElementTypeIndicator
        type="Boolean-Auswahl"
        icon={<ToggleOnIcon fontSize="large" color="primary" />}
        description="Ermöglicht Benutzern die Auswahl zwischen Ja/Nein-Optionen"
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
                value: boolElement.title,
                onChange: (value) => {
                  updateBoolElement({
                    title: value
                  });
                }
              },
              {
                id: 'description',
                label: 'Beschreibung',
                value: boolElement.description,
                onChange: (value) => {
                  updateBoolElement({
                    description: value
                  });
                },
                multiline: true,
                rows: 2
              }
            ]}
            languageTab={languageTab}
            onLanguageTabChange={(newValue) => setLanguageTab(newValue)}
          />

          <IconField
            value={boolElement.icon || ''}
            onChange={(value) => {
              updateBoolElement({
                icon: value
              });
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
          <FormControl fullWidth size="small">
            <InputLabel id="boolean-display-type-label">Darstellungsart</InputLabel>
            <Select
              labelId="boolean-display-type-label"
              value={boolElement.type || 'SWITCH'}
              label="Darstellungsart"
              onChange={(e) => {
                updateBoolElement({
                  type: e.target.value as 'SWITCH' | 'CHECKBOX' | 'DROPDOWN' | 'RADIO' | 'BUTTONGROUP'
                });
              }}
            >
              <MenuItem value="SWITCH">Toggle-Switch</MenuItem>
              <MenuItem value="CHECKBOX">Checkbox</MenuItem>
              <MenuItem value="DROPDOWN">Dropdown</MenuItem>
              <MenuItem value="RADIO">Radio-Buttons</MenuItem>
              <MenuItem value="BUTTONGROUP">Button-Gruppe</MenuItem>
            </Select>
          </FormControl>

          {/* Default-Wert mit passendem UI je nach Typ */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Default-Wert
            </Typography>
            {(boolElement.type === 'SWITCH' || !boolElement.type) && (
              <FormControlLabel
                control={
                  <Switch
                    checked={boolElement.default_value || false}
                    onChange={(e) => {
                      updateBoolElement({
                        default_value: e.target.checked
                      });
                    }}
                  />
                }
                label={boolElement.default_value ?
                  (boolElement.options?.true_label?.de || 'Ja') :
                  (boolElement.options?.false_label?.de || 'Nein')}
              />
            )}
            {boolElement.type === 'CHECKBOX' && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={boolElement.default_value || false}
                    onChange={(e) => {
                      updateBoolElement({
                        default_value: e.target.checked
                      });
                    }}
                  />
                }
                label={boolElement.default_value ?
                  (boolElement.options?.true_label?.de || 'Ja') :
                  (boolElement.options?.false_label?.de || 'Nein')}
              />
            )}
            {boolElement.type === 'RADIO' && (
              <RadioGroup
                value={boolElement.default_value ? 'true' : 'false'}
                onChange={(e) => {
                  updateBoolElement({
                    default_value: e.target.value === 'true'
                  });
                }}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label={boolElement.options?.true_label?.de || 'Ja'}
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label={boolElement.options?.false_label?.de || 'Nein'}
                />
              </RadioGroup>
            )}
            {boolElement.type === 'BUTTONGROUP' && (
              <ButtonGroup>
                <Button
                  variant={boolElement.default_value ? 'contained' : 'outlined'}
                  onClick={() => {
                    updateBoolElement({
                      default_value: true
                    });
                  }}
                >
                  {boolElement.options?.true_label?.de || 'Ja'}
                </Button>
                <Button
                  variant={!boolElement.default_value ? 'contained' : 'outlined'}
                  onClick={() => {
                    updateBoolElement({
                      default_value: false
                    });
                  }}
                >
                  {boolElement.options?.false_label?.de || 'Nein'}
                </Button>
              </ButtonGroup>
            )}
            {boolElement.type === 'DROPDOWN' && (
              <FormControl fullWidth size="small">
                <InputLabel>Wert</InputLabel>
                <Select
                  value={boolElement.default_value ? 'true' : 'false'}
                  label="Wert"
                  onChange={(e) => {
                    updateBoolElement({
                      default_value: e.target.value === 'true'
                    });
                  }}
                >
                  <MenuItem value="true">{boolElement.options?.true_label?.de || 'Ja'}</MenuItem>
                  <MenuItem value="false">{boolElement.options?.false_label?.de || 'Nein'}</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>

          {/* Optionen mit Tabs für Sprachen */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Optionen
            </Typography>
            <Tabs
              value={languageTab}
              onChange={(_, newValue) => setLanguageTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Deutsch" />
              <Tab label="Englisch" />
            </Tabs>

            {languageTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Label für 'true'"
                  size="small"
                  value={boolElement.options?.true_label?.de || ''}
                  onChange={(e) => updateLabel('true_label', 'de', e.target.value)}
                  placeholder="Wahr"
                />
                <TextField
                  label="Label für 'false'"
                  size="small"
                  value={boolElement.options?.false_label?.de || ''}
                  onChange={(e) => updateLabel('false_label', 'de', e.target.value)}
                  placeholder="Falsch"
                />
              </Box>
            )}

            {languageTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Label für 'true'"
                  size="small"
                  value={boolElement.options?.true_label?.en || ''}
                  onChange={(e) => updateLabel('true_label', 'en', e.target.value)}
                  placeholder="True"
                />
                <TextField
                  label="Label für 'false'"
                  size="small"
                  value={boolElement.options?.false_label?.en || ''}
                  onChange={(e) => updateLabel('false_label', 'en', e.target.value)}
                  placeholder="False"
                />
              </Box>
            )}
          </Box>
        </Box>
      </AccordionSection>



      <ElementPreview title="Vorschau">
        <Box sx={{ p: 1 }}>
          {(boolElement.type === 'SWITCH' || !boolElement.type) && (
            <FormControlLabel
              control={
                <Switch
                  checked={boolElement.default_value || false}
                  disabled
                />
              }
              label={boolElement.title?.de || 'Boolean-Feld'}
            />
          )}
          {boolElement.type === 'CHECKBOX' && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={boolElement.default_value || false}
                  disabled
                />
              }
              label={boolElement.title?.de || 'Boolean-Feld'}
            />
          )}
          {boolElement.type === 'RADIO' && (
            <RadioGroup
              value={boolElement.default_value ? 'true' : 'false'}
            >
              <FormControlLabel
                value="true"
                control={<Radio disabled />}
                label={boolElement.options?.true_label?.de || 'Ja'}
              />
              <FormControlLabel
                value="false"
                control={<Radio disabled />}
                label={boolElement.options?.false_label?.de || 'Nein'}
              />
            </RadioGroup>
          )}
          {boolElement.type === 'BUTTONGROUP' && (
            <ButtonGroup>
              <Button
                variant={boolElement.default_value ? 'contained' : 'outlined'}
                disabled
              >
                {boolElement.options?.true_label?.de || 'Ja'}
              </Button>
              <Button
                variant={!boolElement.default_value ? 'contained' : 'outlined'}
                disabled
              >
                {boolElement.options?.false_label?.de || 'Nein'}
              </Button>
            </ButtonGroup>
          )}
          {boolElement.type === 'DROPDOWN' && (
            <FormControl fullWidth size="small">
              <InputLabel>Wert</InputLabel>
              <Select
                value={boolElement.default_value ? 'true' : 'false'}
                label="Wert"
                disabled
              >
                <MenuItem value="true">{boolElement.options?.true_label?.de || 'Ja'}</MenuItem>
                <MenuItem value="false">{boolElement.options?.false_label?.de || 'Nein'}</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </ElementPreview>
    </>
  );
};
