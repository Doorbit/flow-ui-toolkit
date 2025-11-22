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
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { SingleSelectionUIElement, StringUIElement } from '../../../models/uiElements';
import { v4 as uuidv4 } from 'uuid';
import IconField from '../common/IconField';

interface SingleSelectionElementEditorProps {
  element: SingleSelectionUIElement;
  onChange: (updatedElement: SingleSelectionUIElement) => void;
}

export const SingleSelectionElementEditor: React.FC<SingleSelectionElementEditorProps> = ({
  element,
  onChange
}) => {
  const [newOption, setNewOption] = useState('');

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
          key: uuidv4(),
          label: { de: 'Option 1', en: 'Option 1' }
        }
      ]
    });
  }

  return (
    <Box sx={{ mt: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
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

      <FormControl fullWidth sx={{ mb: 2 }}>
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

      <Typography variant="subtitle2" gutterBottom>Optionen</Typography>

      {element.options?.map((option, index) => (
        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Box sx={{ width: '25%' }}>
              <TextField
                fullWidth
                label="Schlüssel"
                size="small"
                value={option.key}
                onChange={(e) => handleUpdateOptionKey(index, e.target.value)}
              />
            </Box>
            <Box sx={{ width: '30%' }}>
              <TextField
                fullWidth
                label="Deutsch"
                size="small"
                value={option.label?.de || ''}
                onChange={(e) => handleUpdateOption(index, 'de', e.target.value)}
              />
            </Box>
            <Box sx={{ width: '30%' }}>
              <TextField
                fullWidth
                label="Englisch"
                size="small"
                value={option.label?.en || ''}
                onChange={(e) => handleUpdateOption(index, 'en', e.target.value)}
              />
            </Box>
            <Box sx={{ width: '15%' }}>
              <Tooltip title="Option löschen">
                <IconButton
                  color="error"
                  onClick={() => handleDeleteOption(index)}
                  disabled={element.options?.length === 1} // Mindestens eine Option muss bleiben
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
          <Box sx={{ mt: 1 }}>
            <IconField
              label="Icon"
              size="small"
              value={option.icon || ''}
              onChange={(value) => {
                const updatedOptions = [...element.options];
                updatedOptions[index] = {
                  ...option,
                  icon: value
                };
                onChange({
                  ...element,
                  options: updatedOptions
                });
              }}
              fullWidth
            />
          </Box>
        </Box>
      ))}

      <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 3 }}>
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
          Option hinzufügen
        </Button>
      </Box>

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
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Aktivierungswert für benutzerdefinierte Eingabe
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={element.other_user_value.activates_on_value_selection}
            onChange={(e) => {
              if (element.other_user_value) { // Nullcheck hinzufügen
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
          />

          <Typography variant="subtitle2" gutterBottom>
            Eingabefeld-Titel
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Box sx={{ width: '50%' }}>
              <TextField
                fullWidth
                label="Deutsch"
                size="small"
                value={element.other_user_value?.text_ui_element.title?.de || ''}
                onChange={(e) => {
                  if (element.other_user_value) { // Nullcheck hinzufügen
                    const title = element.other_user_value.text_ui_element.title || { de: '', en: '' };
                    onChange({
                      ...element,
                      other_user_value: {
                        ...element.other_user_value,
                        text_ui_element: {
                          ...element.other_user_value.text_ui_element,
                          title: {
                            ...title,
                            de: e.target.value
                          }
                        }
                      }
                    });
                  }
                }}
              />
            </Box>
            <Box sx={{ width: '50%' }}>
              <TextField
                fullWidth
                label="Englisch"
                size="small"
                value={element.other_user_value?.text_ui_element.title?.en || ''}
                onChange={(e) => {
                  if (element.other_user_value) { // Nullcheck hinzufügen
                    const title = element.other_user_value.text_ui_element.title || { de: '', en: '' };
                    onChange({
                      ...element,
                      other_user_value: {
                        ...element.other_user_value,
                        text_ui_element: {
                          ...element.other_user_value.text_ui_element,
                          title: {
                            ...title,
                            en: e.target.value
                          }
                        }
                      }
                    });
                  }
                }}
              />
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
};
