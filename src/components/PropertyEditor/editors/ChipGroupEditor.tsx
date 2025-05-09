import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Paper,
  Divider,
  IconButton,
  Card,
  CardContent,
  CardActions,
  List,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TitleIcon from '@mui/icons-material/Title';
import TuneIcon from '@mui/icons-material/Tune';
import ViewListIcon from '@mui/icons-material/ViewList';
import { ChipGroupUIElement, BooleanUIElement } from '../../../models/uiElements';
import { TranslatableField } from '../common/TranslatableField';
import TabbedTranslatableFields from '../common/TabbedTranslatableFields';
import { AccordionSection } from '../common/AccordionSection';
import { VisibilityConditionEditor } from './VisibilityConditionEditor';
import { useSubflow } from '../../../context/SubflowContext';
import { v4 as uuidv4 } from 'uuid';

interface ChipGroupEditorProps {
  element: ChipGroupUIElement;
  onChange: (updatedElement: ChipGroupUIElement) => void;
}

/**
 * Spezialisierte Komponente für die Bearbeitung von ChipGroups und ihren enthaltenen BooleanUIElements.
 * Unterstützt das Hinzufügen, Bearbeiten und Löschen von Chips sowie die Bearbeitung von
 * Eigenschaften wie Titel, Icon und Default-Wert für jeden Chip.
 */
const ChipGroupEditor: React.FC<ChipGroupEditorProps> = ({ element, onChange }) => {
  const [editingChipIndex, setEditingChipIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [languageTab, setLanguageTab] = useState(0);
  const [newChip, setNewChip] = useState<BooleanUIElement>({
    pattern_type: 'BooleanUIElement',
    field_id: { field_name: `chip_${uuidv4()}` },
    required: false,
    default_value: false,
    title: { de: '', en: '' },
    icon: '',
  });
  // Subflow-State wird für zukünftige Erweiterungen benötigt
  const { state: _ } = useSubflow();

  // Funktion zum Öffnen des Dialogs für einen neuen Chip
  const handleOpenNewChipDialog = () => {
    setNewChip({
      pattern_type: 'BooleanUIElement',
      field_id: { field_name: `chip_${uuidv4()}` },
      required: false,
      default_value: false,
      title: { de: '', en: '' },
      icon: '',
    });
    setEditingChipIndex(null);
    setDialogOpen(true);
  };

  // Funktion zum Öffnen des Dialogs für die Bearbeitung eines bestehenden Chips
  const handleOpenEditChipDialog = (index: number) => {
    setNewChip({ ...element.chips[index] });
    setEditingChipIndex(index);
    setDialogOpen(true);
  };

  // Funktion zum Schließen des Dialogs
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Funktion zum Speichern eines Chips (neu oder bearbeitet)
  const handleSaveChip = () => {
    const updatedChips = [...element.chips];

    if (editingChipIndex !== null) {
      // Bestehenden Chip aktualisieren
      updatedChips[editingChipIndex] = newChip;
    } else {
      // Neuen Chip hinzufügen
      updatedChips.push(newChip);
    }

    onChange({
      ...element,
      chips: updatedChips,
    });

    setDialogOpen(false);
  };

  // Funktion zum Löschen eines Chips
  const handleDeleteChip = (index: number) => {
    const updatedChips = element.chips.filter((_, i) => i !== index);

    onChange({
      ...element,
      chips: updatedChips,
    });
  };

  // Funktion zum Aktualisieren der Visibility-Bedingung des ChipGroup-Elements
  const handleVisibilityChange = (newCondition: any) => {
    if (newCondition) {
      onChange({
        ...element,
        visibility_condition: newCondition,
      });
    } else {
      // Entferne die Visibility-Bedingung
      const { visibility_condition, ...restElement } = element;
      onChange(restElement as ChipGroupUIElement);
    }
  };

  // Diese Funktion wird in zukünftigen Erweiterungen verwendet
  // Funktion zum Aktualisieren der Visibility-Bedingung eines Chips
  const _handleChipVisibilityChange = (index: number, newCondition: any) => {
    const updatedChips = [...element.chips];

    if (newCondition) {
      updatedChips[index] = {
        ...updatedChips[index],
        visibility_condition: newCondition,
      };
    } else {
      // Entferne die Visibility-Bedingung
      const { visibility_condition, ...restChip } = updatedChips[index];
      updatedChips[index] = restChip as BooleanUIElement;
    }

    onChange({
      ...element,
      chips: updatedChips,
    });
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Chip-Gruppe bearbeiten
        </Typography>

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
                  value: element.title,
                  onChange: (value) => {
                    onChange({
                      ...element,
                      title: value,
                    });
                  }
                },
                {
                  id: 'description',
                  label: 'Beschreibung',
                  value: element.description,
                  onChange: (value) => {
                    onChange({
                      ...element,
                      description: value,
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
                  icon: e.target.value,
                });
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={element.required}
                  onChange={(e) => {
                    onChange({
                      ...element,
                      required: e.target.checked,
                    });
                  }}
                />
              }
              label="Erforderlich"
            />
          </Box>
        </AccordionSection>

        <AccordionSection
          title="Chips"
          icon={<ViewListIcon />}
          defaultExpanded={true}
          badge={element.chips.length}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenNewChipDialog}
              >
                Chip hinzufügen
              </Button>
            </Box>

            <List>
              {element.chips.map((chip, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {chip.title?.de || `Chip ${index + 1}`}
                        </Typography>
                        {chip.icon && (
                          <Typography variant="body2" color="text.secondary">
                            (Icon: {chip.icon})
                          </Typography>
                        )}
                        {chip.visibility_condition && (
                          <VisibilityIcon fontSize="small" color="primary" />
                        )}
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditChipDialog(index)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteChip(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Feld-ID: {chip.field_id?.field_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Default-Wert: {chip.default_value ? 'Wahr' : 'Falsch'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleOpenEditChipDialog(index)}
                    >
                      Bearbeiten
                    </Button>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => {
                        const updatedChip = {
                          ...chip,
                          visibility_condition: chip.visibility_condition || {
                            operator_type: 'RFO',
                            field_id: { field_name: '' },
                            op: 'eq',
                            value: true,
                          },
                        };
                        const updatedChips = [...element.chips];
                        updatedChips[index] = updatedChip;
                        onChange({
                          ...element,
                          chips: updatedChips,
                        });
                        handleOpenEditChipDialog(index);
                      }}
                    >
                      Sichtbarkeitsregeln
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </List>
          </Box>
        </AccordionSection>

        {/* Sichtbarkeitsregeln-Sektion wurde entfernt, da es dafür einen eigenen Tab gibt */}
      </Box>

      {/* Dialog für das Hinzufügen/Bearbeiten von Chips */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingChipIndex !== null ? 'Chip bearbeiten' : 'Neuen Chip hinzufügen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TabbedTranslatableFields
              fields={[
                {
                  id: 'title',
                  label: 'Titel',
                  value: newChip.title,
                  onChange: (value) => {
                    setNewChip({
                      ...newChip,
                      title: value,
                    });
                  }
                }
              ]}
              languageTab={languageTab}
              onLanguageTabChange={(newValue) => setLanguageTab(newValue)}
            />

            <TextField
              label="Feld-ID"
              size="small"
              fullWidth
              value={newChip.field_id?.field_name || ''}
              onChange={(e) => {
                setNewChip({
                  ...newChip,
                  field_id: {
                    field_name: e.target.value,
                  },
                });
              }}
            />

            <TextField
              label="Icon"
              size="small"
              fullWidth
              value={newChip.icon || ''}
              onChange={(e) => {
                setNewChip({
                  ...newChip,
                  icon: e.target.value,
                });
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newChip.required}
                  onChange={(e) => {
                    setNewChip({
                      ...newChip,
                      required: e.target.checked,
                    });
                  }}
                />
              }
              label="Erforderlich"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={!!newChip.default_value}
                  onChange={(e) => {
                    setNewChip({
                      ...newChip,
                      default_value: e.target.checked,
                    });
                  }}
                />
              }
              label="Default-Wert"
            />

            {editingChipIndex !== null && (
              <>
                <Divider />
                <Typography variant="subtitle1">Sichtbarkeitsregeln für diesen Chip</Typography>
                <VisibilityConditionEditor
                  visibilityCondition={newChip.visibility_condition}
                  onChange={(newCondition) => {
                    if (newCondition) {
                      setNewChip({
                        ...newChip,
                        visibility_condition: newCondition,
                      });
                    } else {
                      // Entferne die Visibility-Bedingung
                      const { visibility_condition, ...restChip } = newChip;
                      setNewChip(restChip as BooleanUIElement);
                    }
                  }}
                  showAsAccordion={false}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSaveChip} variant="contained" color="primary">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ChipGroupEditor;
