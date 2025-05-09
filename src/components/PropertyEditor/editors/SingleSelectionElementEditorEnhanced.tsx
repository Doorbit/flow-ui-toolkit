import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import ListAltIcon from '@mui/icons-material/ListAlt';
import TitleIcon from '@mui/icons-material/Title';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';

import { SingleSelectionUIElement, StringUIElement } from '../../../models/uiElements';
import { v4 as uuidv4 } from 'uuid';
import { AccordionSection } from '../common/AccordionSection';
import { ElementTypeIndicator } from '../common/ElementTypeIndicator';
import { ElementPreview } from '../common/ElementPreview';

import TabbedTranslatableFields from '../common/TabbedTranslatableFields';

interface SingleSelectionElementEditorEnhancedProps {
  element: SingleSelectionUIElement;
  onChange: (updatedElement: SingleSelectionUIElement) => void;
}

/**
 * Verbesserte Editor-Komponente für SingleSelectionUIElement.
 * Ermöglicht die Bearbeitung von Auswahlfeldern mit Optionen.
 */
export const SingleSelectionElementEditorEnhanced: React.FC<SingleSelectionElementEditorEnhancedProps> = ({
  element,
  onChange
}) => {
  const [newOption, setNewOption] = useState('');
  const [languageTab, setLanguageTab] = useState(0);

  const handleTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onChange({
      ...element,
      type: event.target.value as 'DROPDOWN' | 'BUTTONGROUP'
    });
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;

    // Erstelle eine eindeutige ID für die neue Option
    const key = uuidv4().substring(0, 8);

    const newOptions = [
      ...(element.options || []),
      {
        key,
        label: {
          de: newOption,
          en: newOption
        }
      }
    ];

    onChange({
      ...element,
      options: newOptions
    });

    setNewOption('');
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = [...(element.options || [])];
    newOptions.splice(index, 1);

    onChange({
      ...element,
      options: newOptions
    });
  };

  const handleUpdateOption = (index: number, field: 'de' | 'en', value: string) => {
    const newOptions = [...(element.options || [])];
    if (!newOptions[index].label) {
      newOptions[index].label = { de: '', en: '' };
    }
    newOptions[index] = {
      ...newOptions[index],
      label: {
        ...newOptions[index].label!,
        [field]: value
      }
    };

    onChange({
      ...element,
      options: newOptions
    });
  };

  const handleUpdateOptionKey = (index: number, value: string) => {
    const newOptions = [...(element.options || [])];
    newOptions[index] = {
      ...newOptions[index],
      key: value
    };

    onChange({
      ...element,
      options: newOptions
    });
  };

  const handleOtherUserValueChange = (checked: boolean) => {
    if (checked) {
      const textUiElement: StringUIElement = {
        pattern_type: 'StringUIElement',
        required: true,
        type: 'TEXT',
        field_id: {
          field_name: `${element.field_id?.field_name || 'option'}_other_${uuidv4().substring(0, 8)}`
        },
        title: {
          de: 'Benutzerdefinierte Eingabe',
          en: 'Custom Input'
        }
      };

      onChange({
        ...element,
        other_user_value: {
          activates_on_value_selection: "other",
          text_ui_element: textUiElement
        }
      });
    } else {
      const { other_user_value, ...rest } = element;
      onChange(rest as SingleSelectionUIElement);
    }
  };

  // Stelle sicher, dass options mindestens ein Element enthält (Option 1)
  if (!element.options || element.options.length === 0) {
    onChange({
      ...element,
      options: [
        {
          key: 'option1',
          label: { de: 'Option 1', en: 'Option 1' }
        }
      ]
    });
  }

  return (
    <>
      <ElementTypeIndicator
        type="Auswahlfeld"
        icon={<ListAltIcon fontSize="large" color="primary" />}
        description="Ermöglicht Benutzern die Auswahl aus vordefinierten Optionen"
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
                value: element.title || { de: '', en: '' },
                onChange: (value) => {
                  onChange({
                    ...element,
                    title: value
                  });
                }
              },
              {
                id: 'description',
                label: 'Beschreibung',
                value: element.description || { de: '', en: '' },
                onChange: (value) => {
                  onChange({
                    ...element,
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

          <TextField
            label="Icon"
            size="small"
            value={element.icon || ''}
            onChange={(e) => {
              onChange({
                ...element,
                icon: e.target.value
              });
            }}
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
            <InputLabel id="selection-type-label">Typ</InputLabel>
            <Select
              labelId="selection-type-label"
              value={element.type || 'DROPDOWN'}
              label="Typ"
              onChange={(e) => handleTypeChange(e as any)}
            >
              <MenuItem value="DROPDOWN">Dropdown</MenuItem>
              <MenuItem value="BUTTONGROUP">Button Gruppe</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="default-value-label">Default-Wert</InputLabel>
            <Select
              labelId="default-value-label"
              value={(element as any).default || ''}
              label="Default-Wert"
              onChange={(e) => {
                onChange({
                  ...element,
                  default: e.target.value || undefined
                } as SingleSelectionUIElement);
              }}
            >
              <MenuItem value="">
                <em>Kein Default-Wert</em>
              </MenuItem>
              {element.options?.map((option) => (
                <MenuItem key={option.key} value={option.key}>
                  {option.label?.de || option.label?.en || option.key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" gutterBottom>
            Optionen
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="30%">Schlüssel</TableCell>
                  <TableCell width="60%">
                    <Tabs
                      value={languageTab}
                      onChange={(_, newValue) => setLanguageTab(newValue)}
                      variant="fullWidth"
                    >
                      <Tab label="Deutsch" />
                      <Tab label="Englisch" />
                    </Tabs>
                  </TableCell>
                  <TableCell width="10%" align="center">Aktion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {element.options?.map((option, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={option.key}
                        onChange={(e) => handleUpdateOptionKey(index, e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      {languageTab === 0 ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={option.label?.de || ''}
                          onChange={(e) => handleUpdateOption(index, 'de', e.target.value)}
                        />
                      ) : (
                        <TextField
                          fullWidth
                          size="small"
                          value={option.label?.en || ''}
                          onChange={(e) => handleUpdateOption(index, 'en', e.target.value)}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Option löschen">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteOption(index)}
                          disabled={element.options?.length === 1} // Mindestens eine Option muss bleiben
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label="Neue Option"
              size="small"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOption();
                }
              }}
            />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddOption}
              disabled={!newOption.trim()}
            >
              Hinzufügen
            </Button>
          </Box>
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
                checked={!!element.required}
                onChange={(e) => {
                  onChange({
                    ...element,
                    required: e.target.checked
                  });
                }}
              />
            }
            label="Erforderlich"
          />

          <FormControlLabel
            control={
              <Switch
                checked={!!element.other_user_value}
                onChange={(e) => handleOtherUserValueChange(e.target.checked)}
              />
            }
            label="Option für benutzerdefinierte Eingabe anbieten"
          />

          {element.other_user_value && (
            <Box sx={{ pl: 2, pt: 1, borderLeft: '1px dashed rgba(0, 0, 0, 0.2)' }}>
              <Typography variant="subtitle2" gutterBottom>
                Benutzerdefinierte Eingabe-Einstellungen
              </Typography>

              <TextField
                fullWidth
                label="Aktivierungswert"
                size="small"
                value={element.other_user_value.activates_on_value_selection}
                onChange={(e) => {
                  if (element.other_user_value) {
                    onChange({
                      ...element,
                      other_user_value: {
                        ...element.other_user_value,
                        activates_on_value_selection: e.target.value
                      }
                    });
                  }
                }}
                sx={{ mb: 2 }}
                helperText="Schlüssel der Option, die die benutzerdefinierte Eingabe aktiviert"
              />

              <TabbedTranslatableFields
                fields={[
                  {
                    id: 'other_title',
                    label: 'Eingabefeld-Titel',
                    value: element.other_user_value?.text_ui_element.title || { de: '', en: '' },
                    onChange: (value) => {
                      if (element.other_user_value) {
                        onChange({
                          ...element,
                          other_user_value: {
                            ...element.other_user_value,
                            text_ui_element: {
                              ...element.other_user_value.text_ui_element,
                              title: value
                            }
                          }
                        });
                      }
                    }
                  }
                ]}
                languageTab={languageTab}
                onLanguageTabChange={(newValue) => setLanguageTab(newValue)}
              />
            </Box>
          )}
        </Box>
      </AccordionSection>



      <ElementPreview title="Vorschau">
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {element.title?.de || 'Auswahlfeld'}
          </Typography>

          {element.type === 'DROPDOWN' ? (
            <FormControl fullWidth size="small">
              <InputLabel>Auswahl</InputLabel>
              <Select
                value={(element as any).default || ''}
                label="Auswahl"
                disabled
              >
                {element.options?.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label?.de || option.key}
                  </MenuItem>
                ))}
                {element.other_user_value && (
                  <MenuItem value={element.other_user_value.activates_on_value_selection}>
                    {element.other_user_value.text_ui_element.title?.de || 'Benutzerdefinierte Eingabe'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {element.options?.map((option) => (
                <Button
                  key={option.key}
                  variant={(element as any).default === option.key ? 'contained' : 'outlined'}
                  size="small"
                  disabled
                >
                  {option.label?.de || option.key}
                </Button>
              ))}
              {element.other_user_value && (
                <Button
                  variant={(element as any).default === element.other_user_value.activates_on_value_selection ? 'contained' : 'outlined'}
                  size="small"
                  disabled
                >
                  {element.other_user_value.text_ui_element.title?.de || 'Benutzerdefinierte Eingabe'}
                </Button>
              )}
            </Box>
          )}

          {element.other_user_value && (element as any).default === element.other_user_value.activates_on_value_selection && (
            <TextField
              fullWidth
              size="small"
              placeholder={element.other_user_value.text_ui_element.title?.de || 'Benutzerdefinierte Eingabe'}
              disabled
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </ElementPreview>
    </>
  );
};

export default SingleSelectionElementEditorEnhanced;
