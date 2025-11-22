import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useFieldValues } from '../../context/FieldValuesContext';
import { useSubflow } from '../../context/SubflowContext';
import {
  Paper,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Button,
  IconButton,
  Card,
  CardContent,
  Grid as MuiGrid,
  GridProps,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import { PatternLibraryElement, VisibilityCondition, RelationalFieldOperator, LogicalOperator, FieldId, RelationalContextOperator } from '../../models/listingFlow';
import {
  TextUIElement,
  BooleanUIElement,
  SingleSelectionUIElement,
  SingleSelectionUIElementItem,
  GroupUIElement,
  ArrayUIElement,
  ChipGroupUIElement,
  CustomUIElement,
  StringUIElement,
  NumberUIElement,
  DateUIElement,
  FileUIElement,
  SubFlow
} from '../../models/uiElements';
import { VisibilityConditionEditor } from './editors/VisibilityConditionEditor';
import FileElementEditor from './editors/FileElementEditor';
import ChipGroupEditor from './editors/ChipGroupEditor';
import SubflowNavigator from './common/SubflowNavigator';
import { TranslatableField } from './common/TranslatableField';
import IconField from './common/IconField';

const PropertyEditorContainer = styled(Paper)`
  width: 100%;
  height: 100%;
  padding: 1rem;
  background-color: #F8FAFC;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  border-left: 1px solid #E0E0E0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled(Typography)`
  font-weight: 500;
  margin-top: 1rem;
  color: #009F64;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 159, 100, 0.1);
`;

const OptionCard = styled(Card)`
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid rgba(0, 159, 100, 0.2);

  &:hover {
    border-color: rgba(0, 159, 100, 0.4);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

interface PropertyEditorProps {
  element: PatternLibraryElement | null;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

// Verwende die TranslatableField-Komponente aus common/TranslatableField.tsx

const PropertyEditor: React.FC<PropertyEditorProps> = ({ element, onUpdate }) => {
  const [newOptionKey, setNewOptionKey] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const { setFieldValue, availableFields } = useFieldValues();
  const { state: subflowState, dispatch: subflowDispatch, navigateToElement, navigateUp, navigateToRoot } = useSubflow();

  // Setze das CustomUIElement im SubflowContext, wenn sich das Element ändert
  useEffect(() => {
    if (element && element.element.pattern_type === 'CustomUIElement') {
      subflowDispatch({
        type: 'SET_CUSTOM_ELEMENT',
        customElement: element.element as CustomUIElement
      });
    }
  }, [element, subflowDispatch]);

  // Verbesserte Funktion zum Rendern des POI-Subflows mit Unterstützung für tiefe Verschachtelung
  const renderScannerPoiSubflow = (poiSubflow: SubFlow, subflowIndex: number) => {
    if (!element) return null;

    // Wenn ein Element im Subflow ausgewählt ist, zeige den SubflowNavigator und die Eigenschaften des ausgewählten Elements
    if (subflowState.selectedSubflowIndex === subflowIndex && subflowState.selectedElementPath) {
      return (
        <Box sx={{ mt: 1 }}>
          <SubflowNavigator />

          {subflowState.selectedElement && (
            <Box sx={{ mt: 2 }}>
              {renderSelectedElementEditor(subflowState.selectedElement, subflowIndex, subflowState.selectedElementPath)}
            </Box>
          )}
        </Box>
      );
    }

    // Wenn kein Element ausgewählt ist, zeige eine Liste der verfügbaren Elemente
    return (
      <Box sx={{ mt: 1 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            subflowDispatch({
              type: 'SELECT_SUBFLOW',
              subflowIndex,
              subflowType: 'POI'
            });
          }}
          sx={{ mb: 2 }}
        >
          POI-Elemente bearbeiten
        </Button>

        <Typography variant="body2" color="text.secondary">
          Klicken Sie auf den Button, um die POI-Elemente zu bearbeiten. Sie können dann durch die verschachtelten Elemente navigieren und alle Eigenschaften bearbeiten.
        </Typography>
      </Box>
    );
  };

  // Verbesserte Funktion zum Rendern des ROOM-Subflows mit Unterstützung für tiefe Verschachtelung
  const renderScannerRoomSubflow = (roomSubflow: SubFlow, subflowIndex: number) => {
    if (!element) return null;

    // Wenn ein Element im Subflow ausgewählt ist, zeige den SubflowNavigator und die Eigenschaften des ausgewählten Elements
    if (subflowState.selectedSubflowIndex === subflowIndex && subflowState.selectedElementPath) {
      return (
        <Box sx={{ mt: 1 }}>
          <SubflowNavigator />

          {subflowState.selectedElement && (
            <Box sx={{ mt: 2 }}>
              {renderSelectedElementEditor(subflowState.selectedElement, subflowIndex, subflowState.selectedElementPath)}
            </Box>
          )}
        </Box>
      );
    }

    // Wenn kein Element ausgewählt ist, zeige eine Liste der verfügbaren Elemente
    return (
      <Box sx={{ mt: 1 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            subflowDispatch({
              type: 'SELECT_SUBFLOW',
              subflowIndex,
              subflowType: 'ROOM'
            });
          }}
          sx={{ mb: 2 }}
        >
          Raum-Elemente bearbeiten
        </Button>

        <Typography variant="body2" color="text.secondary">
          Klicken Sie auf den Button, um die Raum-Elemente zu bearbeiten. Sie können dann durch die verschachtelten Elemente navigieren und alle Eigenschaften bearbeiten.
        </Typography>
      </Box>
    );
  };

  // Funktion zum Rendern des POI_PHOTO-Subflows mit Unterstützung für tiefe Verschachtelung
  const renderScannerPoiPhotoSubflow = (poiPhotoSubflow: SubFlow, subflowIndex: number) => {
    if (!element) return null;

    // Wenn ein Element im Subflow ausgewählt ist, zeige den SubflowNavigator und die Eigenschaften des ausgewählten Elements
    if (subflowState.selectedSubflowIndex === subflowIndex && subflowState.selectedElementPath) {
      return (
        <Box sx={{ mt: 1 }}>
          <SubflowNavigator />

          {subflowState.selectedElement && (
            <Box sx={{ mt: 2 }}>
              {renderSelectedElementEditor(subflowState.selectedElement, subflowIndex, subflowState.selectedElementPath)}
            </Box>
          )}
        </Box>
      );
    }

    // Wenn kein Element ausgewählt ist, zeige eine Liste der verfügbaren Elemente
    return (
      <Box sx={{ mt: 1 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            subflowDispatch({
              type: 'SELECT_SUBFLOW',
              subflowIndex,
              subflowType: 'POI_PHOTO'
            });
          }}
          sx={{ mb: 2 }}
        >
          POI-Foto-Elemente bearbeiten
        </Button>

        <Typography variant="body2" color="text.secondary">
          Klicken Sie auf den Button, um die POI-Foto-Elemente zu bearbeiten. Sie können dann durch die verschachtelten Elemente navigieren und alle Eigenschaften bearbeiten.
        </Typography>
      </Box>
    );
  };

  // Funktion zum Rendern des ausgewählten Element-Editors basierend auf dem Elementtyp
  const renderSelectedElementEditor = (selectedElement: PatternLibraryElement, subflowIndex: number, elementPath: number[]) => {
    if (!element) return null;

    const elementType = selectedElement.element.pattern_type;

    // Rendere den entsprechenden Editor basierend auf dem Elementtyp
    switch (elementType) {
      case 'FileUIElement':
        return (
          <FileElementEditor
            element={selectedElement.element as FileUIElement}
            onChange={(updatedElementData) => {
              const updatedCustomElement = { ...element.element as CustomUIElement };

              // Aktualisiere das Element im CustomUIElement
              const updatedElementResult = updateElementByPath(
                updatedCustomElement,
                subflowIndex,
                elementPath,
                updatedElementData
              );

              onUpdate({
                ...element,
                element: updatedElementResult
              });
            }}
          />
        );

      case 'ChipGroupUIElement':
        return (
          <ChipGroupEditor
            element={selectedElement.element as ChipGroupUIElement}
            onChange={(updatedElementData) => {
              const updatedCustomElement = { ...element.element as CustomUIElement };

              // Aktualisiere das Element im CustomUIElement
              const updatedElementResult = updateElementByPath(
                updatedCustomElement,
                subflowIndex,
                elementPath,
                updatedElementData
              );

              onUpdate({
                ...element,
                element: updatedElementResult
              });
            }}
          />
        );

      default:
        // Für andere Elementtypen verwende die Standard-Eigenschaften
        return renderStandardElementProperties(selectedElement, subflowIndex, elementPath);
    }
  };

  // Hilfsfunktion zum Aktualisieren eines Elements basierend auf einem Pfad
  const updateElementByPath = (
    customElement: CustomUIElement,
    subflowIndex: number,
    elementPath: number[],
    updatedElementData: any
  ): CustomUIElement => {
    const updatedCustomElement = { ...customElement };
    const updatedSubflows = [...updatedCustomElement.sub_flows!];

    // Wenn der Pfad leer ist, können wir nichts aktualisieren
    if (elementPath.length === 0) {
      return updatedCustomElement;
    }

    // Navigiere zum übergeordneten Element
    let currentElements = updatedSubflows[subflowIndex].elements;
    let currentPath = [];

    for (let i = 0; i < elementPath.length; i++) {
      const index = elementPath[i];
      currentPath.push(index);

      if (i === elementPath.length - 1) {
        // Letzter Schritt im Pfad, aktualisiere das Element hier
        currentElements[index] = {
          ...currentElements[index],
          element: updatedElementData
        };
      } else {
        // Zwischenschritt, navigiere tiefer
        const element = currentElements[index];

        if (element.element.pattern_type === 'GroupUIElement') {
          currentElements = (element.element as GroupUIElement).elements;
        } else if (element.element.pattern_type === 'ArrayUIElement') {
          currentElements = (element.element as any).elements;
        } else if (element.element.pattern_type === 'ChipGroupUIElement') {
          // ChipGroupUIElement hat keine elements, sondern chips
          // Wir müssen die chips als "Elemente" behandeln
          currentElements = (element.element as ChipGroupUIElement).chips.map((chip: any) => ({
            element: chip
          }));
        }
      }
    }

    return updatedCustomElement;
  };

  // Funktion zum Rendern der Standard-Eigenschaften eines Elements
  const renderStandardElementProperties = (subElement: PatternLibraryElement, subflowIndex: number, elementPath: number[]) => {
    // Gemeinsame Eigenschaften für alle Elemente
    if (!element) return null;

    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" gutterBottom>
            {subElement.element.title?.de || subElement.element.pattern_type} bearbeiten
          </Typography>

          <Divider />

          <TranslatableField
            label="Titel"
            value={subElement.element.title}
            onChange={(value) => {
              const updatedCustomElement = { ...element.element as CustomUIElement };

              // Aktualisiere das Element im CustomUIElement
              const updatedElement = updateElementByPath(
                updatedCustomElement,
                subflowIndex,
                elementPath,
                {
                  ...subElement.element,
                  title: value
                }
              );

              onUpdate({
                ...element,
                element: updatedElement
              });
            }}
          />

          <TranslatableField
            label="Beschreibung"
            value={subElement.element.description}
            onChange={(value) => {
              const updatedCustomElement = { ...element.element as CustomUIElement };

              // Aktualisiere das Element im CustomUIElement
              const updatedElement = updateElementByPath(
                updatedCustomElement,
                subflowIndex,
                elementPath,
                {
                  ...subElement.element,
                  description: value
                }
              );

              onUpdate({
                ...element,
                element: updatedElement
              });
            }}
          />

          <IconField
            label="Icon"
            size="small"
            fullWidth
            value={subElement.element.icon || ''}
            onChange={(value) => {
              const updatedCustomElement = { ...element.element as CustomUIElement };

              // Aktualisiere das Element im CustomUIElement
              const updatedElement = updateElementByPath(
                updatedCustomElement,
                subflowIndex,
                elementPath,
                {
                  ...subElement.element,
                  icon: value
                }
              );

              onUpdate({
                ...element,
                element: updatedElement
              });
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={subElement.element.required}
                onChange={(e) => {
                  const updatedCustomElement = { ...element.element as CustomUIElement };

                  // Aktualisiere das Element im CustomUIElement
                  const updatedElement = updateElementByPath(
                    updatedCustomElement,
                    subflowIndex,
                    elementPath,
                    {
                      ...subElement.element,
                      required: e.target.checked
                    }
                  );

                  onUpdate({
                    ...element,
                    element: updatedElement
                  });
                }}
              />
            }
            label="Erforderlich"
          />

          <Divider />

          <Typography variant="subtitle1">Sichtbarkeitsregeln</Typography>
          <VisibilityConditionEditor
            visibilityCondition={subElement.element.visibility_condition}
            onChange={(newCondition) => {
              const updatedCustomElement = { ...element.element as CustomUIElement };

              // Aktualisiere das Element im CustomUIElement
              const updatedElement = updateElementByPath(
                updatedCustomElement,
                subflowIndex,
                elementPath,
                {
                  ...subElement.element,
                  visibility_condition: newCondition
                }
              );

              onUpdate({
                ...element,
                element: updatedElement
              });
            }}
            showAsAccordion={false}
          />

          {/* Spezifische Eigenschaften je nach Elementtyp */}
          {renderElementSpecificProperties(subElement, subflowIndex, elementPath)}
        </Box>
      </Paper>
    );
  };

  // Funktion zum Rendern der spezifischen Eigenschaften eines Elements basierend auf seinem Typ
  const renderElementSpecificProperties = (subElement: PatternLibraryElement, subflowIndex: number, elementPath: number[]) => {
    const elementType = subElement.element.pattern_type;

    switch (elementType) {
      case 'StringUIElement':
        return renderStringElementProperties(subElement.element as StringUIElement, subflowIndex, elementPath);
      case 'NumberUIElement':
        return renderNumberElementProperties(subElement.element as NumberUIElement, subflowIndex, elementPath);
      case 'DateUIElement':
        return renderDateElementProperties(subElement.element as DateUIElement, subflowIndex, elementPath);
      case 'SingleSelectionUIElement':
        return renderSingleSelectionElementProperties(subElement.element as SingleSelectionUIElement, subflowIndex, elementPath);
      case 'BooleanUIElement':
        return renderBooleanElementProperties(subElement.element as BooleanUIElement, subflowIndex, elementPath);
      default:
        return null;
    }
  };

  // Funktion zum Rendern der Eigenschaften eines StringUIElement
  const renderStringElementProperties = (stringElement: StringUIElement, subflowIndex: number, elementPath: number[]) => {
    if (!element) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Spezifische Eigenschaften</Typography>

        <TextField
          label="Feld-ID"
          size="small"
          fullWidth
          value={stringElement.field_id?.field_name || ''}
          onChange={(e) => {
            const updatedCustomElement = { ...element.element as CustomUIElement };

            // Aktualisiere das Element im CustomUIElement
            const updatedElement = updateElementByPath(
              updatedCustomElement,
              subflowIndex,
              elementPath,
              {
                ...stringElement,
                field_id: {
                  field_name: e.target.value
                }
              }
            );

            onUpdate({
              ...element,
              element: updatedElement
            });
          }}
          sx={{ mt: 1 }}
        />

        <TextField
          label="Default-Wert"
          size="small"
          fullWidth
          value={stringElement.default_value || ''}
          onChange={(e) => {
            const updatedCustomElement = { ...element.element as CustomUIElement };

            // Aktualisiere das Element im CustomUIElement
            const updatedElement = updateElementByPath(
              updatedCustomElement,
              subflowIndex,
              elementPath,
              {
                ...stringElement,
                default_value: e.target.value
              }
            );

            onUpdate({
              ...element,
              element: updatedElement
            });
          }}
          sx={{ mt: 1 }}
        />
      </Box>
    );
  };

  // Funktion zum Rendern der Eigenschaften eines NumberUIElement
  const renderNumberElementProperties = (numberElement: NumberUIElement, subflowIndex: number, elementPath: number[]) => {
    if (!element) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Spezifische Eigenschaften</Typography>

        <TextField
          label="Feld-ID"
          size="small"
          fullWidth
          value={numberElement.field_id?.field_name || ''}
          onChange={(e) => {
            const updatedCustomElement = { ...element.element as CustomUIElement };

            // Aktualisiere das Element im CustomUIElement
            const updatedElement = updateElementByPath(
              updatedCustomElement,
              subflowIndex,
              elementPath,
              {
                ...numberElement,
                field_id: {
                  field_name: e.target.value
                }
              }
            );

            onUpdate({
              ...element,
              element: updatedElement
            });
          }}
          sx={{ mt: 1 }}
        />

        <TextField
          label="Default-Wert"
          size="small"
          fullWidth
          type="number"
          value={numberElement.default_value || ''}
          onChange={(e) => {
            const updatedCustomElement = { ...element.element as CustomUIElement };

            // Aktualisiere das Element im CustomUIElement
            const updatedElement = updateElementByPath(
              updatedCustomElement,
              subflowIndex,
              elementPath,
              {
                ...numberElement,
                default_value: parseFloat(e.target.value)
              }
            );

            onUpdate({
              ...element,
              element: updatedElement
            });
          }}
          sx={{ mt: 1 }}
        />
      </Box>
    );
  };

  // Funktion zum Rendern der Eigenschaften eines DateUIElement
  const renderDateElementProperties = (dateElement: DateUIElement, subflowIndex: number, elementPath: number[]) => {
    if (!element) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Spezifische Eigenschaften</Typography>

        <TextField
          label="Feld-ID"
          size="small"
          fullWidth
          value={dateElement.field_id?.field_name || ''}
          onChange={(e) => {
            const updatedCustomElement = { ...element.element as CustomUIElement };

            // Aktualisiere das Element im CustomUIElement
            const updatedElement = updateElementByPath(
              updatedCustomElement,
              subflowIndex,
              elementPath,
              {
                ...dateElement,
                field_id: {
                  field_name: e.target.value
                }
              }
            );

            onUpdate({
              ...element,
              element: updatedElement
            });
          }}
          sx={{ mt: 1 }}
        />
      </Box>
    );
  };

  // Funktion zum Rendern der Eigenschaften eines SingleSelectionUIElement
  const renderSingleSelectionElementProperties = (singleSelectionElement: SingleSelectionUIElement, subflowIndex: number, elementPath: number[]) => {
    if (!element) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Spezifische Eigenschaften</Typography>

        <TextField
          label="Feld-ID"
          size="small"
          fullWidth
          value={singleSelectionElement.field_id?.field_name || ''}
          onChange={(e) => {
            const updatedCustomElement = { ...element.element as CustomUIElement };

            // Aktualisiere das Element im CustomUIElement
            const updatedElement = updateElementByPath(
              updatedCustomElement,
              subflowIndex,
              elementPath,
              {
                ...singleSelectionElement,
                field_id: {
                  field_name: e.target.value
                }
              }
            );

            onUpdate({
              ...element,
              element: updatedElement
            });
          }}
          sx={{ mt: 1 }}
        />

        <Typography variant="subtitle2" sx={{ mt: 2 }}>Optionen</Typography>

        {(singleSelectionElement.items || singleSelectionElement.options || []).map((item: any, itemIndex: number) => (
          <Card key={itemIndex} variant="outlined" sx={{ mb: 1, p: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                label="Schlüssel"
                size="small"
                value={item.key || ''}
                onChange={(e) => {
                  const updatedItems = [...(singleSelectionElement.items || singleSelectionElement.options || [])];
                  updatedItems[itemIndex] = {
                    ...updatedItems[itemIndex],
                    key: e.target.value
                  };

                  const updatedCustomElement = { ...element.element as CustomUIElement };

                  // Aktualisiere das Element im CustomUIElement
                  const updatedElement = updateElementByPath(
                    updatedCustomElement,
                    subflowIndex,
                    elementPath,
                    {
                      ...singleSelectionElement,
                      items: updatedItems
                    }
                  );

                  onUpdate({
                    ...element,
                    element: updatedElement
                  });
                }}
                sx={{ flex: 1 }}
              />

              <TextField
                label="Titel (DE)"
                size="small"
                value={(item.title?.de || item.label?.de) || ''}
                onChange={(e) => {
                  const updatedItems = [...(singleSelectionElement.items || singleSelectionElement.options || [])];
                  updatedItems[itemIndex] = {
                    ...updatedItems[itemIndex],
                    label: {
                      ...(updatedItems[itemIndex].label || {}),
                      de: e.target.value
                    }
                  };

                  const updatedCustomElement = { ...element.element as CustomUIElement };

                  // Aktualisiere das Element im CustomUIElement
                  const updatedElement = updateElementByPath(
                    updatedCustomElement,
                    subflowIndex,
                    elementPath,
                    {
                      ...singleSelectionElement,
                      items: updatedItems
                    }
                  );

                  onUpdate({
                    ...element,
                    element: updatedElement
                  });
                }}
                sx={{ flex: 1 }}
              />

              <IconButton
                color="error"
                onClick={() => {
                  const updatedItems = (singleSelectionElement.items || singleSelectionElement.options || []).filter((_: any, i: number) => i !== itemIndex);

                  const updatedCustomElement = { ...element.element as CustomUIElement };

                  // Aktualisiere das Element im CustomUIElement
                  const updatedElement = updateElementByPath(
                    updatedCustomElement,
                    subflowIndex,
                    elementPath,
                    {
                      ...singleSelectionElement,
                      items: updatedItems
                    }
                  );

                  onUpdate({
                    ...element,
                    element: updatedElement
                  });
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Card>
        ))}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => {
            const newItem = {
              key: '',
              label: { de: '', en: '' }
            };

            const updatedItems = [...(singleSelectionElement.items || singleSelectionElement.options || []), newItem];

            const updatedCustomElement = { ...element.element as CustomUIElement };

            // Aktualisiere das Element im CustomUIElement
            const updatedElement = updateElementByPath(
              updatedCustomElement,
              subflowIndex,
              elementPath,
              {
                ...singleSelectionElement,
                items: updatedItems
              }
            );

            onUpdate({
              ...element,
              element: updatedElement
            });
          }}
          sx={{ mt: 1 }}
        >
          Option hinzufügen
        </Button>
      </Box>
    );
  };

  // Funktion zum Rendern der Eigenschaften eines BooleanUIElement
  const renderBooleanElementProperties = (booleanElement: BooleanUIElement, subflowIndex: number, elementPath: number[]) => {
    if (!element) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Spezifische Eigenschaften</Typography>

        <TextField
          label="Feld-ID"
          size="small"
          fullWidth
          value={booleanElement.field_id?.field_name || ''}
          onChange={(e) => {
            const updatedCustomElement = { ...element.element as CustomUIElement };

            // Aktualisiere das Element im CustomUIElement
            const updatedElement = updateElementByPath(
              updatedCustomElement,
              subflowIndex,
              elementPath,
              {
                ...booleanElement,
                field_id: {
                  field_name: e.target.value
                }
              }
            );

            onUpdate({
              ...element,
              element: updatedElement
            });
          }}
          sx={{ mt: 1 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={!!booleanElement.default_value}
              onChange={(e) => {
                const updatedCustomElement = { ...element.element as CustomUIElement };

                // Aktualisiere das Element im CustomUIElement
                const updatedElement = updateElementByPath(
                  updatedCustomElement,
                  subflowIndex,
                  elementPath,
                  {
                    ...booleanElement,
                    default_value: e.target.checked
                  }
                );

                onUpdate({
                  ...element,
                  element: updatedElement
                });
              }}
            />
          }
          label="Default-Wert"
          sx={{ mt: 1 }}
        />
      </Box>
    );
  };

  // Funktion zum Rendern der Visibility-Bedingung eines Elements innerhalb eines Subflows
  const renderSubflowElementVisibilityCondition = (subElement: PatternLibraryElement, subflowIndex: number, elementIndex: number) => {
    const visibilityCondition = subElement.element.visibility_condition;

    // Funktion zum Aktualisieren der Visibility-Bedingung
    const updateVisibilityCondition = (newCondition: VisibilityCondition | undefined) => {
      if (!element) return;

      const updatedCustomElement = { ...element.element as CustomUIElement };
      const updatedSubflows = [...updatedCustomElement.sub_flows!];
      const updatedElements = [...updatedSubflows[subflowIndex].elements];

      if (newCondition) {
        updatedElements[elementIndex] = {
          ...updatedElements[elementIndex],
          element: {
            ...updatedElements[elementIndex].element,
            visibility_condition: newCondition
          }
        };
      } else {
        // Entferne die Sichtbarkeitsregel
        const { visibility_condition, ...restElement } = updatedElements[elementIndex].element;

        updatedElements[elementIndex] = {
          ...updatedElements[elementIndex],
          element: restElement
        };
      }

      updatedSubflows[subflowIndex] = {
        ...updatedSubflows[subflowIndex],
        elements: updatedElements
      };

      updatedCustomElement.sub_flows = updatedSubflows;

      onUpdate({
        ...element,
        element: updatedCustomElement
      });
    };

    // Funktion zum Rendern eines relationalen Feldoperators
    const renderRelationalFieldOperator = (condition: RelationalFieldOperator) => {
      const { field_id, op, value, value_list } = condition;

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Feld-ID</InputLabel>
            <Select
              value={field_id?.field_name || ''}
              label="Feld-ID"
              onChange={(e) => {
                const updatedCondition: RelationalFieldOperator = {
                  ...condition,
                  field_id: { field_name: e.target.value as string }
                };

                updateVisibilityCondition(updatedCondition);
              }}
            >
              {availableFields.map((field) => (
                <MenuItem key={field.fieldName} value={field.fieldName}>
                  {field.fieldName} {field.pageName && `(${field.pageName})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Operator</InputLabel>
            <Select
              value={op || 'eq'}
              label="Operator"
              onChange={(e) => {
                const updatedCondition: RelationalFieldOperator = {
                  ...condition,
                  op: e.target.value as 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin'
                };

                updateVisibilityCondition(updatedCondition);
              }}
            >
              <MenuItem value="eq">Gleich (=)</MenuItem>
              <MenuItem value="ne">Ungleich (!=)</MenuItem>
              <MenuItem value="gt">Größer als (&gt;)</MenuItem>
              <MenuItem value="lt">Kleiner als (&lt;)</MenuItem>
              <MenuItem value="gte">Größer oder gleich (&gt;=)</MenuItem>
              <MenuItem value="lte">Kleiner oder gleich (&lt;=)</MenuItem>
              <MenuItem value="in">In Liste</MenuItem>
              <MenuItem value="nin">Nicht in Liste</MenuItem>
            </Select>
          </FormControl>

          {/* Wert-Eingabe basierend auf dem Feldtyp */}
          {renderValueInput(condition)}
        </Box>
      );
    };

    // Funktion zum Rendern eines logischen Operators
    const renderLogicalOperator = (condition: LogicalOperator) => {
      const { operator, conditions } = condition;

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Logischer Operator</InputLabel>
            <Select
              value={operator || 'AND'}
              label="Logischer Operator"
              onChange={(e) => {
                const updatedCondition: LogicalOperator = {
                  ...condition,
                  operator: e.target.value as 'AND' | 'OR' | 'NOT'
                };

                updateVisibilityCondition(updatedCondition);
              }}
            >
              <MenuItem value="AND">UND (Alle Bedingungen müssen erfüllt sein)</MenuItem>
              <MenuItem value="OR">ODER (Mindestens eine Bedingung muss erfüllt sein)</MenuItem>
              <MenuItem value="NOT">NICHT (Negation der ersten Bedingung)</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="subtitle2">Bedingungen</Typography>
          <Box sx={{ pl: 2 }}>
            {conditions.map((subCondition, conditionIndex) => (
              <Card key={conditionIndex} variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Bedingungstyp</InputLabel>
                    <Select
                      value={subCondition.operator_type || 'RFO'}
                      label="Bedingungstyp"
                      onChange={(e) => {
                        const newType = e.target.value;
                        let newSubCondition: VisibilityCondition;

                        if (newType === 'LO') {
                          // Logischer Operator
                          newSubCondition = {
                            operator_type: 'LO',
                            operator: 'AND',
                            conditions: []
                          };
                        } else {
                          // Relationaler Feldoperator
                          newSubCondition = {
                            operator_type: 'RFO',
                            field_id: { field_name: '' },
                            op: 'eq',
                            value: true
                          };
                        }

                        const updatedConditions = [...conditions];
                        updatedConditions[conditionIndex] = newSubCondition;

                        const updatedCondition: LogicalOperator = {
                          ...condition,
                          conditions: updatedConditions
                        };

                        updateVisibilityCondition(updatedCondition);
                      }}
                    >
                      <MenuItem value="RFO">Einfache Bedingung</MenuItem>
                      <MenuItem value="LO">Logische Verknüpfung</MenuItem>
                    </Select>
                  </FormControl>

                  {subCondition.operator_type === 'RFO' && renderRelationalFieldOperator(subCondition as RelationalFieldOperator)}
                  {subCondition.operator_type === 'LO' && renderLogicalOperator(subCondition as LogicalOperator)}

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      const updatedConditions = conditions.filter((_, i) => i !== conditionIndex);

                      const updatedCondition: LogicalOperator = {
                        ...condition,
                        conditions: updatedConditions
                      };

                      updateVisibilityCondition(updatedCondition);
                    }}
                  >
                    Bedingung entfernen
                  </Button>
                </Box>
              </Card>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                const newSubCondition: RelationalFieldOperator = {
                  operator_type: 'RFO',
                  field_id: { field_name: '' },
                  op: 'eq',
                  value: true
                };

                const updatedConditions = [...conditions, newSubCondition];

                const updatedCondition: LogicalOperator = {
                  ...condition,
                  conditions: updatedConditions
                };

                updateVisibilityCondition(updatedCondition);
              }}
            >
              Bedingung hinzufügen
            </Button>
          </Box>
        </Box>
      );
    };

    // Funktion zum Rendern der Wert-Eingabe basierend auf dem Feldtyp
    const renderValueInput = (condition: RelationalFieldOperator) => {
      const { field_id, value } = condition;

      if (!field_id || !field_id.field_name) {
        return null;
      }

      // Finde den Feldtyp basierend auf der field_id
      const fieldInfo = availableFields.find(f => f.fieldName === field_id.field_name);
      const fieldType = fieldInfo?.elementType || 'unknown';

      // Rendere die Wert-Eingabe basierend auf dem Feldtyp
      switch (fieldType) {
        case 'BooleanUIElement':
          return (
            <FormControl fullWidth size="small">
              <InputLabel>Wert</InputLabel>
              <Select
                value={value === true ? 'true' : value === false ? 'false' : ''}
                label="Wert"
                onChange={(e) => {
                  const newValue = e.target.value === 'true' ? true : e.target.value === 'false' ? false : null;

                  const updatedCondition: RelationalFieldOperator = {
                    ...condition,
                    value: newValue
                  };

                  updateVisibilityCondition(updatedCondition);
                }}
              >
                <MenuItem value="true">Wahr</MenuItem>
                <MenuItem value="false">Falsch</MenuItem>
              </Select>
            </FormControl>
          );

        case 'StringUIElement':
        case 'SingleSelectionUIElement':
          return (
            <TextField
              label="Wert"
              size="small"
              value={value || ''}
              onChange={(e) => {
                const updatedCondition: RelationalFieldOperator = {
                  ...condition,
                  value: e.target.value
                };

                updateVisibilityCondition(updatedCondition);
              }}
            />
          );

        case 'NumberUIElement':
          return (
            <TextField
              label="Wert"
              size="small"
              type="number"
              value={value || ''}
              onChange={(e) => {
                const updatedCondition: RelationalFieldOperator = {
                  ...condition,
                  value: parseFloat(e.target.value)
                };

                updateVisibilityCondition(updatedCondition);
              }}
            />
          );

        default:
          return (
            <TextField
              label="Wert"
              size="small"
              value={value || ''}
              onChange={(e) => {
                const updatedCondition: RelationalFieldOperator = {
                  ...condition,
                  value: e.target.value
                };

                updateVisibilityCondition(updatedCondition);
              }}
            />
          );
      }
    };

    return (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: !!visibilityCondition ? '#e3f2fd' : 'inherit',
            '&:hover': {
              backgroundColor: !!visibilityCondition ? '#bbdefb' : '#f5f5f5'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography sx={{ flex: 1 }}>Sichtbarkeitsregeln</Typography>
            {!!visibilityCondition && (
              <Tooltip title="Dieses Element hat aktive Sichtbarkeitsregeln">
                <VisibilityIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
              </Tooltip>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!visibilityCondition}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Erstelle eine einfache Sichtbarkeitsregel
                      const newCondition: RelationalFieldOperator = {
                        operator_type: 'RFO',
                        field_id: { field_name: '' },
                        op: 'eq',
                        value: true
                      };

                      updateVisibilityCondition(newCondition);
                    } else {
                      // Entferne die Sichtbarkeitsregel
                      updateVisibilityCondition(undefined);
                    }
                  }}
                />
              }
              label="Sichtbarkeitsregel aktivieren"
            />

            {!!visibilityCondition && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sichtbarkeitsregeln bestimmen, wann dieses Element angezeigt wird. Das Element wird nur angezeigt, wenn die Bedingung erfüllt ist.
              </Typography>
            )}

            {visibilityCondition && (
              <>
                <FormControl fullWidth size="small">
                  <InputLabel>Bedingungstyp</InputLabel>
                  <Select
                    value={visibilityCondition.operator_type || 'RFO'}
                    label="Bedingungstyp"
                    onChange={(e) => {
                      const newType = e.target.value;
                      let newCondition: VisibilityCondition;

                      if (newType === 'LO') {
                        // Logischer Operator
                        newCondition = {
                          operator_type: 'LO',
                          operator: 'AND',
                          conditions: []
                        };
                      } else {
                        // Relationaler Feldoperator
                        newCondition = {
                          operator_type: 'RFO',
                          field_id: { field_name: '' },
                          op: 'eq',
                          value: true
                        };
                      }

                      updateVisibilityCondition(newCondition);
                    }}
                  >
                    <MenuItem value="RFO">Einfache Bedingung</MenuItem>
                    <MenuItem value="LO">Logische Verknüpfung</MenuItem>
                  </Select>
                </FormControl>

                {visibilityCondition.operator_type === 'RFO' && renderRelationalFieldOperator(visibilityCondition as RelationalFieldOperator)}
                {visibilityCondition.operator_type === 'LO' && renderLogicalOperator(visibilityCondition as LogicalOperator)}
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  // Funktion zum Rendern der spezifischen Eigenschaften eines Elements innerhalb eines Subflows
  const renderSubflowElementSpecificProperties = (subElement: PatternLibraryElement, subflowIndex: number, elementIndex: number) => {
    if (!element) return null;

    const elementType = subElement.element.pattern_type;

    switch (elementType) {
      case 'StringUIElement': {
        const stringElement = subElement.element as StringUIElement;
        return (
          <>
            <SectionTitle variant="subtitle2" sx={{ mt: 2 }}>String-Eigenschaften</SectionTitle>
            <Divider />

            <TextField
              label="Feld-ID"
              size="small"
              fullWidth
              margin="dense"
              value={stringElement.field_id?.field_name || ''}
              onChange={(e) => {
                const updatedCustomElement = { ...element.element as CustomUIElement };
                const updatedSubflows = [...updatedCustomElement.sub_flows!];
                const updatedElements = [...updatedSubflows[subflowIndex].elements];

                updatedElements[elementIndex] = {
                  ...updatedElements[elementIndex],
                  element: {
                    ...updatedElements[elementIndex].element,
                    field_id: {
                      field_name: e.target.value
                    }
                  }
                };

                updatedSubflows[subflowIndex] = {
                  ...updatedSubflows[subflowIndex],
                  elements: updatedElements
                };

                updatedCustomElement.sub_flows = updatedSubflows;

                onUpdate({
                  ...element,
                  element: updatedCustomElement
                });
              }}
            />

            <FormControl fullWidth size="small" margin="dense">
              <InputLabel>Typ</InputLabel>
              <Select
                value={stringElement.type || 'TEXT'}
                label="Typ"
                onChange={(e) => {
                  const updatedCustomElement = { ...element.element as CustomUIElement };
                  const updatedSubflows = [...updatedCustomElement.sub_flows!];
                  const updatedElements = [...updatedSubflows[subflowIndex].elements];

                  updatedElements[elementIndex] = {
                    ...updatedElements[elementIndex],
                    element: {
                      ...updatedElements[elementIndex].element,
                      type: e.target.value as 'TEXT' | 'TEXT_AREA'
                    }
                  };

                  updatedSubflows[subflowIndex] = {
                    ...updatedSubflows[subflowIndex],
                    elements: updatedElements
                  };

                  updatedCustomElement.sub_flows = updatedSubflows;

                  onUpdate({
                    ...element,
                    element: updatedCustomElement
                  });
                }}
              >
                <MenuItem value="TEXT">Einzeiliger Text</MenuItem>
                <MenuItem value="TEXT_AREA">Mehrzeiliger Text</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      }

      case 'BooleanUIElement': {
        const boolElement = subElement.element as BooleanUIElement;
        return (
          <>
            <SectionTitle variant="subtitle2" sx={{ mt: 2 }}>Boolean-Eigenschaften</SectionTitle>
            <Divider />

            <TextField
              label="Feld-ID"
              size="small"
              fullWidth
              margin="dense"
              value={boolElement.field_id?.field_name || ''}
              onChange={(e) => {
                const updatedCustomElement = { ...element.element as CustomUIElement };
                const updatedSubflows = [...updatedCustomElement.sub_flows!];
                const updatedElements = [...updatedSubflows[subflowIndex].elements];

                updatedElements[elementIndex] = {
                  ...updatedElements[elementIndex],
                  element: {
                    ...updatedElements[elementIndex].element,
                    field_id: {
                      field_name: e.target.value
                    }
                  }
                };

                updatedSubflows[subflowIndex] = {
                  ...updatedSubflows[subflowIndex],
                  elements: updatedElements
                };

                updatedCustomElement.sub_flows = updatedSubflows;

                onUpdate({
                  ...element,
                  element: updatedCustomElement
                });
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={!!boolElement.default_value}
                  onChange={(e) => {
                    const updatedCustomElement = { ...element.element as CustomUIElement };
                    const updatedSubflows = [...updatedCustomElement.sub_flows!];
                    const updatedElements = [...updatedSubflows[subflowIndex].elements];

                    updatedElements[elementIndex] = {
                      ...updatedElements[elementIndex],
                      element: {
                        ...updatedElements[elementIndex].element,
                        default_value: e.target.checked
                      }
                    };

                    updatedSubflows[subflowIndex] = {
                      ...updatedSubflows[subflowIndex],
                      elements: updatedElements
                    };

                    updatedCustomElement.sub_flows = updatedSubflows;

                    onUpdate({
                      ...element,
                      element: updatedCustomElement
                    });
                  }}
                />
              }
              label="Default-Wert"
            />
          </>
        );
      }

      case 'ChipGroupUIElement': {
        const chipGroupElement = subElement.element as ChipGroupUIElement;
        return (
          <>
            <SectionTitle variant="subtitle2" sx={{ mt: 2 }}>Chips</SectionTitle>
            <Divider />

            {chipGroupElement.chips.map((chip, chipIndex) => (
              <Accordion key={chipIndex} sx={{ mt: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2">
                    {chip.title?.de || `Chip ${chipIndex + 1}`}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    label="Feld-ID"
                    size="small"
                    fullWidth
                    margin="dense"
                    value={chip.field_id?.field_name || ''}
                    onChange={(e) => {
                      const updatedCustomElement = { ...element.element as CustomUIElement };
                      const updatedSubflows = [...updatedCustomElement.sub_flows!];
                      const updatedElements = [...updatedSubflows[subflowIndex].elements];

                      const updatedChipGroup = { ...updatedElements[elementIndex].element as ChipGroupUIElement };
                      const updatedChips = [...updatedChipGroup.chips];

                      updatedChips[chipIndex] = {
                        ...updatedChips[chipIndex],
                        field_id: {
                          field_name: e.target.value
                        }
                      };

                      updatedChipGroup.chips = updatedChips;

                      updatedElements[elementIndex] = {
                        ...updatedElements[elementIndex],
                        element: updatedChipGroup
                      };

                      updatedSubflows[subflowIndex] = {
                        ...updatedSubflows[subflowIndex],
                        elements: updatedElements
                      };

                      updatedCustomElement.sub_flows = updatedSubflows;

                      onUpdate({
                        ...element,
                        element: updatedCustomElement
                      });
                    }}
                  />

                  <TranslatableField
                    label="Titel"
                    value={chip.title}
                    onChange={(value) => {
                      const updatedCustomElement = { ...element.element as CustomUIElement };
                      const updatedSubflows = [...updatedCustomElement.sub_flows!];
                      const updatedElements = [...updatedSubflows[subflowIndex].elements];

                      const updatedChipGroup = { ...updatedElements[elementIndex].element as ChipGroupUIElement };
                      const updatedChips = [...updatedChipGroup.chips];

                      updatedChips[chipIndex] = {
                        ...updatedChips[chipIndex],
                        title: value
                      };

                      updatedChipGroup.chips = updatedChips;

                      updatedElements[elementIndex] = {
                        ...updatedElements[elementIndex],
                        element: updatedChipGroup
                      };

                      updatedSubflows[subflowIndex] = {
                        ...updatedSubflows[subflowIndex],
                        elements: updatedElements
                      };

                      updatedCustomElement.sub_flows = updatedSubflows;

                      onUpdate({
                        ...element,
                        element: updatedCustomElement
                      });
                    }}
                  />

                  <TextField
                    label="Icon"
                    size="small"
                    fullWidth
                    margin="dense"
                    value={chip.icon || ''}
                    onChange={(e) => {
                      const updatedCustomElement = { ...element.element as CustomUIElement };
                      const updatedSubflows = [...updatedCustomElement.sub_flows!];
                      const updatedElements = [...updatedSubflows[subflowIndex].elements];

                      const updatedChipGroup = { ...updatedElements[elementIndex].element as ChipGroupUIElement };
                      const updatedChips = [...updatedChipGroup.chips];

                      updatedChips[chipIndex] = {
                        ...updatedChips[chipIndex],
                        icon: e.target.value
                      };

                      updatedChipGroup.chips = updatedChips;

                      updatedElements[elementIndex] = {
                        ...updatedElements[elementIndex],
                        element: updatedChipGroup
                      };

                      updatedSubflows[subflowIndex] = {
                        ...updatedSubflows[subflowIndex],
                        elements: updatedElements
                      };

                      updatedCustomElement.sub_flows = updatedSubflows;

                      onUpdate({
                        ...element,
                        element: updatedCustomElement
                      });
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        );
      }

      case 'SingleSelectionUIElement': {
        const selectionElement = subElement.element as SingleSelectionUIElement;
        const fieldName = selectionElement.field_id?.field_name || '';

        // Spezielle Behandlung für Heizkörpertypen im POI-Subflow
        if (fieldName === 'building_poi_radiator_type') {
          return (
            <>
              <SectionTitle variant="subtitle2" sx={{ mt: 2 }}>Heizkörpertypen</SectionTitle>
              <Divider />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                Hier können Sie die verschiedenen Heizkörpertypen bearbeiten, die zur Auswahl stehen.
              </Typography>

              <TextField
                label="Feld-ID"
                size="small"
                fullWidth
                margin="dense"
                value={fieldName}
                onChange={(e) => {
                  if (!element) return;
                  const updatedCustomElement = { ...element.element as CustomUIElement };
                  const updatedSubflows = [...updatedCustomElement.sub_flows!];
                  const updatedElements = [...updatedSubflows[subflowIndex].elements];

                  updatedElements[elementIndex] = {
                    ...updatedElements[elementIndex],
                    element: {
                      ...updatedElements[elementIndex].element,
                      field_id: {
                        field_name: e.target.value
                      }
                    }
                  };

                  updatedSubflows[subflowIndex] = {
                    ...updatedSubflows[subflowIndex],
                    elements: updatedElements
                  };

                  updatedCustomElement.sub_flows = updatedSubflows;

                  onUpdate({
                    ...element,
                    element: updatedCustomElement
                  });
                }}
              />

              <SectionTitle variant="subtitle2" sx={{ mt: 2 }}>Optionen</SectionTitle>

              {selectionElement.options?.map((option, optionIndex) => (
                <Accordion key={optionIndex} sx={{ mt: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {option.icon && (
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography color="primary" sx={{ fontSize: '1.2rem' }}>
                            {option.icon}
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="body2">
                        {option.label?.de || option.key}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      label="Schlüssel"
                      size="small"
                      fullWidth
                      margin="dense"
                      value={option.key || ''}
                      onChange={(e) => {
                        if (!element) return;
                        const updatedCustomElement = { ...element.element as CustomUIElement };
                        const updatedSubflows = [...updatedCustomElement.sub_flows!];
                        const updatedElements = [...updatedSubflows[subflowIndex].elements];

                        const updatedSelection = { ...updatedElements[elementIndex].element as SingleSelectionUIElement };
                        const updatedOptions = [...updatedSelection.options];

                        updatedOptions[optionIndex] = {
                          ...updatedOptions[optionIndex],
                          key: e.target.value
                        };

                        updatedSelection.options = updatedOptions;

                        updatedElements[elementIndex] = {
                          ...updatedElements[elementIndex],
                          element: updatedSelection
                        };

                        updatedSubflows[subflowIndex] = {
                          ...updatedSubflows[subflowIndex],
                          elements: updatedElements
                        };

                        updatedCustomElement.sub_flows = updatedSubflows;

                        onUpdate({
                          ...element,
                          element: updatedCustomElement
                        });
                      }}
                    />

                    <IconField
                      label="Icon"
                      size="small"
                      fullWidth
                      value={option.icon || ''}
                      onChange={(value) => {
                        if (!element) return;
                        const updatedCustomElement = { ...element.element as CustomUIElement };
                        const updatedSubflows = [...updatedCustomElement.sub_flows!];
                        const updatedElements = [...updatedSubflows[subflowIndex].elements];

                        const updatedSelection = { ...updatedElements[elementIndex].element as SingleSelectionUIElement };
                        const updatedOptions = [...updatedSelection.options];

                        updatedOptions[optionIndex] = {
                          ...updatedOptions[optionIndex],
                          icon: value
                        };

                        updatedSelection.options = updatedOptions;

                        updatedElements[elementIndex] = {
                          ...updatedElements[elementIndex],
                          element: updatedSelection
                        };

                        updatedSubflows[subflowIndex] = {
                          ...updatedSubflows[subflowIndex],
                          elements: updatedElements
                        };

                        updatedCustomElement.sub_flows = updatedSubflows;

                        onUpdate({
                          ...element,
                          element: updatedCustomElement
                        });
                      }}
                    />

                    <TranslatableField
                      label="Bezeichnung"
                      value={option.label}
                      onChange={(value) => {
                        if (!element) return;
                        const updatedCustomElement = { ...element.element as CustomUIElement };
                        const updatedSubflows = [...updatedCustomElement.sub_flows!];
                        const updatedElements = [...updatedSubflows[subflowIndex].elements];

                        const updatedSelection = { ...updatedElements[elementIndex].element as SingleSelectionUIElement };
                        const updatedOptions = [...updatedSelection.options];

                        updatedOptions[optionIndex] = {
                          ...updatedOptions[optionIndex],
                          label: value
                        };

                        updatedSelection.options = updatedOptions;

                        updatedElements[elementIndex] = {
                          ...updatedElements[elementIndex],
                          element: updatedSelection
                        };

                        updatedSubflows[subflowIndex] = {
                          ...updatedSubflows[subflowIndex],
                          elements: updatedElements
                        };

                        updatedCustomElement.sub_flows = updatedSubflows;

                        onUpdate({
                          ...element,
                          element: updatedCustomElement
                        });
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          );
        }

        // Spezielle Behandlung für Temperaturauswahl im ROOM-Subflow
        if (fieldName === 'room_temperature_type') {
          return (
            <>
              <SectionTitle variant="subtitle2" sx={{ mt: 2 }}>Raumtemperatur-Einstellungen</SectionTitle>
              <Divider />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                Hier können Sie die verschiedenen Raumtemperatur-Optionen bearbeiten, die zur Auswahl stehen.
              </Typography>

              <TextField
                label="Feld-ID"
                size="small"
                fullWidth
                margin="dense"
                value={fieldName}
                onChange={(e) => {
                  if (!element) return;
                  const updatedCustomElement = { ...element.element as CustomUIElement };
                  const updatedSubflows = [...updatedCustomElement.sub_flows!];
                  const updatedElements = [...updatedSubflows[subflowIndex].elements];

                  updatedElements[elementIndex] = {
                    ...updatedElements[elementIndex],
                    element: {
                      ...updatedElements[elementIndex].element,
                      field_id: {
                        field_name: e.target.value
                      }
                    }
                  };

                  updatedSubflows[subflowIndex] = {
                    ...updatedSubflows[subflowIndex],
                    elements: updatedElements
                  };

                  updatedCustomElement.sub_flows = updatedSubflows;

                  onUpdate({
                    ...element,
                    element: updatedCustomElement
                  });
                }}
              />

              <SectionTitle variant="subtitle2" sx={{ mt: 2 }}>Optionen</SectionTitle>

              {selectionElement.options?.map((option, optionIndex) => (
                <Accordion key={optionIndex} sx={{ mt: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2">
                      {option.label?.de || option.key}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      label="Schlüssel"
                      size="small"
                      fullWidth
                      margin="dense"
                      value={option.key || ''}
                      onChange={(e) => {
                        if (!element) return;
                        const updatedCustomElement = { ...element.element as CustomUIElement };
                        const updatedSubflows = [...updatedCustomElement.sub_flows!];
                        const updatedElements = [...updatedSubflows[subflowIndex].elements];

                        const updatedSelection = { ...updatedElements[elementIndex].element as SingleSelectionUIElement };
                        const updatedOptions = [...updatedSelection.options];

                        updatedOptions[optionIndex] = {
                          ...updatedOptions[optionIndex],
                          key: e.target.value
                        };

                        updatedSelection.options = updatedOptions;

                        updatedElements[elementIndex] = {
                          ...updatedElements[elementIndex],
                          element: updatedSelection
                        };

                        updatedSubflows[subflowIndex] = {
                          ...updatedSubflows[subflowIndex],
                          elements: updatedElements
                        };

                        updatedCustomElement.sub_flows = updatedSubflows;

                        onUpdate({
                          ...element,
                          element: updatedCustomElement
                        });
                      }}
                    />

                    <TranslatableField
                      label="Bezeichnung"
                      value={option.label}
                      onChange={(value) => {
                        if (!element) return;
                        const updatedCustomElement = { ...element.element as CustomUIElement };
                        const updatedSubflows = [...updatedCustomElement.sub_flows!];
                        const updatedElements = [...updatedSubflows[subflowIndex].elements];

                        const updatedSelection = { ...updatedElements[elementIndex].element as SingleSelectionUIElement };
                        const updatedOptions = [...updatedSelection.options];

                        updatedOptions[optionIndex] = {
                          ...updatedOptions[optionIndex],
                          label: value
                        };

                        updatedSelection.options = updatedOptions;

                        updatedElements[elementIndex] = {
                          ...updatedElements[elementIndex],
                          element: updatedSelection
                        };

                        updatedSubflows[subflowIndex] = {
                          ...updatedSubflows[subflowIndex],
                          elements: updatedElements
                        };

                        updatedCustomElement.sub_flows = updatedSubflows;

                        onUpdate({
                          ...element,
                          element: updatedCustomElement
                        });
                      }}
                    />

                    <TextField
                      label="Temperatur (°C)"
                      size="small"
                      fullWidth
                      margin="dense"
                      type="number"
                      value={(() => {
                        const match = (option.label?.de || '').match(/\(ca\.\s*(\d+)°C\)/);
                        return match ? match[1] : '';
                      })()}
                      onChange={(e) => {
                        if (!element) return;
                        const temp = e.target.value;
                        const updatedCustomElement = { ...element.element as CustomUIElement };
                        const updatedSubflows = [...updatedCustomElement.sub_flows!];
                        const updatedElements = [...updatedSubflows[subflowIndex].elements];

                        const updatedSelection = { ...updatedElements[elementIndex].element as SingleSelectionUIElement };
                        const updatedOptions = [...updatedSelection.options];

                        // Aktualisiere die Bezeichnung mit der neuen Temperatur
                        const oldLabel = updatedOptions[optionIndex].label || {};

                        // Funktion zum Aktualisieren der Temperatur im Label
                        const updateTemp = (label: string): string => {
                          if (!label) return '';
                          if (label.match(/\(ca\.\s*\d+°C\)/)) {
                            return label.replace(/\(ca\.\s*\d+°C\)/, `(ca. ${temp}°C)`);
                          }
                          return `${label} (ca. ${temp}°C)`;
                        };

                        const newLabelDe = updateTemp(oldLabel.de || '');
                        const newLabelEn = updateTemp(oldLabel.en || '');

                        updatedOptions[optionIndex] = {
                          ...updatedOptions[optionIndex],
                          label: {
                            ...oldLabel,
                            de: newLabelDe,
                            en: newLabelEn
                          }
                        };

                        updatedSelection.options = updatedOptions;

                        updatedElements[elementIndex] = {
                          ...updatedElements[elementIndex],
                          element: updatedSelection
                        };

                        updatedSubflows[subflowIndex] = {
                          ...updatedSubflows[subflowIndex],
                          elements: updatedElements
                        };

                        updatedCustomElement.sub_flows = updatedSubflows;

                        onUpdate({
                          ...element,
                          element: updatedCustomElement
                        });
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          );
        }

        // Standard-Behandlung für andere SingleSelectionUIElement
        return (
          <>
            <SectionTitle variant="subtitle2" sx={{ mt: 2 }}>Auswahl-Eigenschaften</SectionTitle>
            <Divider />

            <TextField
              label="Feld-ID"
              size="small"
              fullWidth
              margin="dense"
              value={selectionElement.field_id?.field_name || ''}
              onChange={(e) => {
                if (!element) return;
                const updatedCustomElement = { ...element.element as CustomUIElement };
                const updatedSubflows = [...updatedCustomElement.sub_flows!];
                const updatedElements = [...updatedSubflows[subflowIndex].elements];

                updatedElements[elementIndex] = {
                  ...updatedElements[elementIndex],
                  element: {
                    ...updatedElements[elementIndex].element,
                    field_id: {
                      field_name: e.target.value
                    }
                  }
                };

                updatedSubflows[subflowIndex] = {
                  ...updatedSubflows[subflowIndex],
                  elements: updatedElements
                };

                updatedCustomElement.sub_flows = updatedSubflows;

                onUpdate({
                  ...element,
                  element: updatedCustomElement
                });
              }}
            />

            <SectionTitle variant="subtitle2" sx={{ mt: 2 }}>Optionen</SectionTitle>

            {selectionElement.options?.map((option, optionIndex) => (
              <Accordion key={optionIndex} sx={{ mt: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2">
                    {option.label?.de || option.key}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    label="Schlüssel"
                    size="small"
                    fullWidth
                    margin="dense"
                    value={option.key || ''}
                    onChange={(e) => {
                      if (!element) return;
                      const updatedCustomElement = { ...element.element as CustomUIElement };
                      const updatedSubflows = [...updatedCustomElement.sub_flows!];
                      const updatedElements = [...updatedSubflows[subflowIndex].elements];

                      const updatedSelection = { ...updatedElements[elementIndex].element as SingleSelectionUIElement };
                      const updatedOptions = [...updatedSelection.options];

                      updatedOptions[optionIndex] = {
                        ...updatedOptions[optionIndex],
                        key: e.target.value
                      };

                      updatedSelection.options = updatedOptions;

                      updatedElements[elementIndex] = {
                        ...updatedElements[elementIndex],
                        element: updatedSelection
                      };

                      updatedSubflows[subflowIndex] = {
                        ...updatedSubflows[subflowIndex],
                        elements: updatedElements
                      };

                      updatedCustomElement.sub_flows = updatedSubflows;

                      onUpdate({
                        ...element,
                        element: updatedCustomElement
                      });
                    }}
                  />

                  <TranslatableField
                    label="Bezeichnung"
                    value={option.label}
                    onChange={(value) => {
                      if (!element) return;
                      const updatedCustomElement = { ...element.element as CustomUIElement };
                      const updatedSubflows = [...updatedCustomElement.sub_flows!];
                      const updatedElements = [...updatedSubflows[subflowIndex].elements];

                      const updatedSelection = { ...updatedElements[elementIndex].element as SingleSelectionUIElement };
                      const updatedOptions = [...updatedSelection.options];

                      updatedOptions[optionIndex] = {
                        ...updatedOptions[optionIndex],
                        label: value
                      };

                      updatedSelection.options = updatedOptions;

                      updatedElements[elementIndex] = {
                        ...updatedElements[elementIndex],
                        element: updatedSelection
                      };

                      updatedSubflows[subflowIndex] = {
                        ...updatedSubflows[subflowIndex],
                        elements: updatedElements
                      };

                      updatedCustomElement.sub_flows = updatedSubflows;

                      onUpdate({
                        ...element,
                        element: updatedCustomElement
                      });
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        );
      }

      // Weitere Elementtypen können hier hinzugefügt werden

      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Spezifische Eigenschaften für {elementType} sind noch nicht implementiert.
          </Typography>
        );
    }
  };

  // Aktualisiere die Feldwerte, wenn sich das Element ändert
  useEffect(() => {
    if (element && element.element) {
      // Prüfe den Typ des Elements und extrahiere die Werte entsprechend
      const { pattern_type } = element.element;

      if (pattern_type === 'BooleanUIElement') {
        const boolElement = element.element as BooleanUIElement;
        if (boolElement.field_id?.field_name && boolElement.default_value !== undefined) {
          setFieldValue(boolElement.field_id.field_name, boolElement.default_value);
        }
      } else if (pattern_type === 'SingleSelectionUIElement') {
        const selectionElement = element.element as SingleSelectionUIElement;
        if (selectionElement.field_id?.field_name && selectionElement.default !== undefined) {
          setFieldValue(selectionElement.field_id.field_name, selectionElement.default);
        }
      }
      // Weitere Elementtypen können hier hinzugefügt werden
    }
  }, [element, setFieldValue]);

  if (!element) {
    return (
      <PropertyEditorContainer>
        <Typography variant="subtitle1" sx={{ padding: 2, textAlign: 'center', color: '#666' }}>
          Kein Element ausgewählt
        </Typography>
      </PropertyEditorContainer>
    );
  }

  // Funktion zum Rendern der Visibility-Bedingung
  const renderVisibilityCondition = () => {
    const visibilityCondition = element.element.visibility_condition;

    return (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: !!visibilityCondition ? '#e3f2fd' : 'inherit',
            '&:hover': {
              backgroundColor: !!visibilityCondition ? '#bbdefb' : '#f5f5f5'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography sx={{ flex: 1 }}>Sichtbarkeitsregeln</Typography>
            {!!visibilityCondition && (
              <Tooltip title="Dieses Element hat aktive Sichtbarkeitsregeln">
                <VisibilityIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
              </Tooltip>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!visibilityCondition}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Erstelle eine einfache Sichtbarkeitsregel
                      const newCondition: RelationalFieldOperator = {
                        operator_type: 'RFO',
                        field_id: { field_name: '' },
                        op: 'eq',
                        value: true
                      };

                      const updatedElement = {
                        ...element,
                        element: {
                          ...element.element,
                          visibility_condition: newCondition
                        }
                      };
                      onUpdate(updatedElement);
                    } else {
                      // Entferne die Sichtbarkeitsregel
                      const { visibility_condition, ...restElement } = element.element;
                      const updatedElement = {
                        ...element,
                        element: restElement
                      };
                      onUpdate(updatedElement);
                    }
                  }}
                />
              }
              label="Sichtbarkeitsregel aktivieren"
            />

            {!!visibilityCondition && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sichtbarkeitsregeln bestimmen, wann dieses Element angezeigt wird. Das Element wird nur angezeigt, wenn die Bedingung erfüllt ist.
              </Typography>
            )}

            {visibilityCondition && (
              <>
                <FormControl fullWidth size="small">
                  <InputLabel>Bedingungstyp</InputLabel>
                  <Select
                    value={visibilityCondition.operator_type || 'RFO'}
                    label="Bedingungstyp"
                    onChange={(e) => {
                      const newType = e.target.value;
                      let newCondition: VisibilityCondition;

                      if (newType === 'LO') {
                        // Logischer Operator
                        newCondition = {
                          operator_type: 'LO',
                          operator: 'AND',
                          conditions: []
                        };
                      } else {
                        // Relationaler Feldoperator
                        newCondition = {
                          operator_type: 'RFO',
                          field_id: { field_name: '' },
                          op: 'eq',
                          value: true
                        };
                      }

                      const updatedElement = {
                        ...element,
                        element: {
                          ...element.element,
                          visibility_condition: newCondition
                        }
                      };
                      onUpdate(updatedElement);
                    }}
                  >
                    <MenuItem value="RFO">Einfache Bedingung</MenuItem>
                    <MenuItem value="LO">Logische Verknüpfung</MenuItem>
                  </Select>
                </FormControl>

                {visibilityCondition.operator_type === 'RFO' && (
                  <>
                    <FormControl fullWidth size="small">
                      <InputLabel>Feld-ID</InputLabel>
                      <Select
                        value={(visibilityCondition as RelationalFieldOperator).field_id?.field_name || ''}
                        label="Feld-ID"
                        onChange={(e) => {
                          const updatedCondition: RelationalFieldOperator = {
                            ...(visibilityCondition as RelationalFieldOperator),
                            field_id: { field_name: e.target.value as string }
                          };

                          const updatedElement = {
                            ...element,
                            element: {
                              ...element.element,
                              visibility_condition: updatedCondition
                            }
                          };
                          onUpdate(updatedElement);
                        }}
                      >
                        <MenuItem value=""><em>Feld auswählen</em></MenuItem>
                        {availableFields.map((field) => (
                          <MenuItem key={field.fieldName} value={field.fieldName}>
                            {field.title} ({field.fieldName})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={(visibilityCondition as RelationalFieldOperator).op || 'eq'}
                        label="Operator"
                        onChange={(e) => {
                          const updatedCondition: RelationalFieldOperator = {
                            ...(visibilityCondition as RelationalFieldOperator),
                            op: e.target.value as any
                          };

                          const updatedElement = {
                            ...element,
                            element: {
                              ...element.element,
                              visibility_condition: updatedCondition
                            }
                          };
                          onUpdate(updatedElement);
                        }}
                      >
                        <MenuItem value="eq">Gleich (=)</MenuItem>
                        <MenuItem value="ne">Ungleich (≠)</MenuItem>
                        <MenuItem value="gt">Größer als ({'>'})</MenuItem>
                        <MenuItem value="lt">Kleiner als ({'<'})</MenuItem>
                        <MenuItem value="gte">Größer oder gleich (≥)</MenuItem>
                        <MenuItem value="lte">Kleiner oder gleich (≤)</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Wert-Eingabe basierend auf dem Feldtyp */}
                    {(() => {
                      const fieldName = (visibilityCondition as RelationalFieldOperator).field_id?.field_name;
                      const field = availableFields.find(f => f.fieldName === fieldName);
                      const fieldType = field?.elementType;

                      // Default-Wert
                      const currentValue = (visibilityCondition as RelationalFieldOperator).value;

                      if (fieldType === 'BooleanUIElement') {
                        // Boolean-Wert
                        return (
                          <FormControl fullWidth size="small">
                            <InputLabel>Wert</InputLabel>
                            <Select
                              value={currentValue === true ? 'true' : currentValue === false ? 'false' : ''}
                              label="Wert"
                              onChange={(e) => {
                                const value = e.target.value === 'true' ? true : e.target.value === 'false' ? false : null;

                                const updatedCondition: RelationalFieldOperator = {
                                  ...(visibilityCondition as RelationalFieldOperator),
                                  value: value
                                };

                                const updatedElement = {
                                  ...element,
                                  element: {
                                    ...element.element,
                                    visibility_condition: updatedCondition
                                  }
                                };
                                onUpdate(updatedElement);
                              }}
                            >
                              <MenuItem value="true">Wahr</MenuItem>
                              <MenuItem value="false">Falsch</MenuItem>
                            </Select>
                          </FormControl>
                        );
                      } else if (fieldType === 'SingleSelectionUIElement') {
                        // Auswahl-Wert
                        return (
                          <TextField
                            label="Wert (Schlüssel)"
                            size="small"
                            fullWidth
                            value={typeof currentValue === 'string' ? currentValue : ''}
                            onChange={(e) => {
                              const updatedCondition: RelationalFieldOperator = {
                                ...(visibilityCondition as RelationalFieldOperator),
                                value: e.target.value
                              };

                              const updatedElement = {
                                ...element,
                                element: {
                                  ...element.element,
                                  visibility_condition: updatedCondition
                                }
                              };
                              onUpdate(updatedElement);
                            }}
                          />
                        );
                      } else if (fieldType === 'NumberUIElement') {
                        // Numerischer Wert
                        return (
                          <TextField
                            label="Wert (Zahl)"
                            type="number"
                            size="small"
                            fullWidth
                            value={typeof currentValue === 'number' ? currentValue : ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? '' : Number(e.target.value);

                              const updatedCondition: RelationalFieldOperator = {
                                ...(visibilityCondition as RelationalFieldOperator),
                                value: value
                              };

                              const updatedElement = {
                                ...element,
                                element: {
                                  ...element.element,
                                  visibility_condition: updatedCondition
                                }
                              };
                              onUpdate(updatedElement);
                            }}
                          />
                        );
                      } else {
                        // Default-Fall: Textfeld mit JSON-Eingabe
                        return (
                          <TextField
                            label="Wert"
                            size="small"
                            fullWidth
                            value={JSON.stringify(currentValue) || ''}
                            onChange={(e) => {
                              let value;
                              try {
                                value = JSON.parse(e.target.value);
                              } catch {
                                value = e.target.value;
                              }

                              const updatedCondition: RelationalFieldOperator = {
                                ...(visibilityCondition as RelationalFieldOperator),
                                value: value
                              };

                              const updatedElement = {
                                ...element,
                                element: {
                                  ...element.element,
                                  visibility_condition: updatedCondition
                                }
                              };
                              onUpdate(updatedElement);
                            }}
                          />
                        );
                      }
                    })()}
                  </>
                )}

                {visibilityCondition.operator_type === 'LO' && (
                  <>
                    <FormControl fullWidth size="small">
                      <InputLabel>Logischer Operator</InputLabel>
                      <Select
                        value={(visibilityCondition as LogicalOperator).operator || 'AND'}
                        label="Logischer Operator"
                        onChange={(e) => {
                          const updatedCondition: LogicalOperator = {
                            ...(visibilityCondition as LogicalOperator),
                            operator: e.target.value as any
                          };

                          const updatedElement = {
                            ...element,
                            element: {
                              ...element.element,
                              visibility_condition: updatedCondition
                            }
                          };
                          onUpdate(updatedElement);
                        }}
                      >
                        <MenuItem value="AND">UND</MenuItem>
                        <MenuItem value="OR">ODER</MenuItem>
                        <MenuItem value="NOT">NICHT</MenuItem>
                      </Select>
                    </FormControl>

                    <Typography variant="subtitle2">Bedingungen</Typography>
                    <Box sx={{ pl: 2 }}>
                      {(visibilityCondition as LogicalOperator).conditions?.map((condition, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {condition.operator_type === 'RFO' && (
                              <>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Feld-ID</InputLabel>
                                  <Select
                                    value={(condition as RelationalFieldOperator).field_id?.field_name || ''}
                                    label="Feld-ID"
                                    onChange={(e) => {
                                      const updatedConditions = [...(visibilityCondition as LogicalOperator).conditions];
                                      updatedConditions[index] = {
                                        ...condition,
                                        field_id: { field_name: e.target.value as string }
                                      } as RelationalFieldOperator;

                                      const updatedLogicalCondition: LogicalOperator = {
                                        ...(visibilityCondition as LogicalOperator),
                                        conditions: updatedConditions
                                      };

                                      const updatedElement = {
                                        ...element,
                                        element: {
                                          ...element.element,
                                          visibility_condition: updatedLogicalCondition
                                        }
                                      };
                                      onUpdate(updatedElement);
                                    }}
                                  >
                                    <MenuItem value=""><em>Feld auswählen</em></MenuItem>
                                    {availableFields.map((field) => (
                                      <MenuItem key={field.fieldName} value={field.fieldName}>
                                        {field.title} ({field.fieldName})
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                  <InputLabel>Operator</InputLabel>
                                  <Select
                                    value={(condition as RelationalFieldOperator).op || 'eq'}
                                    label="Operator"
                                    onChange={(e) => {
                                      const updatedConditions = [...(visibilityCondition as LogicalOperator).conditions];
                                      updatedConditions[index] = {
                                        ...condition,
                                        op: e.target.value as any
                                      } as RelationalFieldOperator;

                                      const updatedLogicalCondition: LogicalOperator = {
                                        ...(visibilityCondition as LogicalOperator),
                                        conditions: updatedConditions
                                      };

                                      const updatedElement = {
                                        ...element,
                                        element: {
                                          ...element.element,
                                          visibility_condition: updatedLogicalCondition
                                        }
                                      };
                                      onUpdate(updatedElement);
                                    }}
                                  >
                                    <MenuItem value="eq">Gleich (=)</MenuItem>
                                    <MenuItem value="ne">Ungleich (≠)</MenuItem>
                                    <MenuItem value="gt">Größer als ({'>'})</MenuItem>
                                    <MenuItem value="lt">Kleiner als ({'<'})</MenuItem>
                                    <MenuItem value="gte">Größer oder gleich (≥)</MenuItem>
                                    <MenuItem value="lte">Kleiner oder gleich (≤)</MenuItem>
                                  </Select>
                                </FormControl>

                                {/* Wert-Eingabe basierend auf dem Feldtyp */}
                                {(() => {
                                  const fieldName = (condition as RelationalFieldOperator).field_id?.field_name;
                                  const field = availableFields.find(f => f.fieldName === fieldName);
                                  const fieldType = field?.elementType;

                                  // Default-Wert
                                  const currentValue = (condition as RelationalFieldOperator).value;

                                  if (fieldType === 'BooleanUIElement') {
                                    // Boolean-Wert
                                    return (
                                      <FormControl fullWidth size="small">
                                        <InputLabel>Wert</InputLabel>
                                        <Select
                                          value={currentValue === true ? 'true' : currentValue === false ? 'false' : ''}
                                          label="Wert"
                                          onChange={(e) => {
                                            const value = e.target.value === 'true' ? true : e.target.value === 'false' ? false : null;

                                            const updatedConditions = [...(visibilityCondition as LogicalOperator).conditions];
                                            updatedConditions[index] = {
                                              ...condition,
                                              value: value
                                            } as RelationalFieldOperator;

                                            const updatedLogicalCondition: LogicalOperator = {
                                              ...(visibilityCondition as LogicalOperator),
                                              conditions: updatedConditions
                                            };

                                            const updatedElement = {
                                              ...element,
                                              element: {
                                                ...element.element,
                                                visibility_condition: updatedLogicalCondition
                                              }
                                            };
                                            onUpdate(updatedElement);
                                          }}
                                        >
                                          <MenuItem value="true">Wahr</MenuItem>
                                          <MenuItem value="false">Falsch</MenuItem>
                                        </Select>
                                      </FormControl>
                                    );
                                  } else if (fieldType === 'SingleSelectionUIElement') {
                                    // Auswahl-Wert
                                    return (
                                      <TextField
                                        label="Wert (Schlüssel)"
                                        size="small"
                                        fullWidth
                                        value={typeof currentValue === 'string' ? currentValue : ''}
                                        onChange={(e) => {
                                          const updatedConditions = [...(visibilityCondition as LogicalOperator).conditions];
                                          updatedConditions[index] = {
                                            ...condition,
                                            value: e.target.value
                                          } as RelationalFieldOperator;

                                          const updatedLogicalCondition: LogicalOperator = {
                                            ...(visibilityCondition as LogicalOperator),
                                            conditions: updatedConditions
                                          };

                                          const updatedElement = {
                                            ...element,
                                            element: {
                                              ...element.element,
                                              visibility_condition: updatedLogicalCondition
                                            }
                                          };
                                          onUpdate(updatedElement);
                                        }}
                                      />
                                    );
                                  } else if (fieldType === 'NumberUIElement') {
                                    // Numerischer Wert
                                    return (
                                      <TextField
                                        label="Wert (Zahl)"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={typeof currentValue === 'number' ? currentValue : ''}
                                        onChange={(e) => {
                                          const value = e.target.value === '' ? '' : Number(e.target.value);

                                          const updatedConditions = [...(visibilityCondition as LogicalOperator).conditions];
                                          updatedConditions[index] = {
                                            ...condition,
                                            value: value
                                          } as RelationalFieldOperator;

                                          const updatedLogicalCondition: LogicalOperator = {
                                            ...(visibilityCondition as LogicalOperator),
                                            conditions: updatedConditions
                                          };

                                          const updatedElement = {
                                            ...element,
                                            element: {
                                              ...element.element,
                                              visibility_condition: updatedLogicalCondition
                                            }
                                          };
                                          onUpdate(updatedElement);
                                        }}
                                      />
                                    );
                                  } else {
                                    // Default-Fall: Textfeld mit JSON-Eingabe
                                    return (
                                      <TextField
                                        label="Wert"
                                        size="small"
                                        fullWidth
                                        value={JSON.stringify(currentValue) || ''}
                                        onChange={(e) => {
                                          let value;
                                          try {
                                            value = JSON.parse(e.target.value);
                                          } catch {
                                            value = e.target.value;
                                          }

                                          const updatedConditions = [...(visibilityCondition as LogicalOperator).conditions];
                                          updatedConditions[index] = {
                                            ...condition,
                                            value: value
                                          } as RelationalFieldOperator;

                                          const updatedLogicalCondition: LogicalOperator = {
                                            ...(visibilityCondition as LogicalOperator),
                                            conditions: updatedConditions
                                          };

                                          const updatedElement = {
                                            ...element,
                                            element: {
                                              ...element.element,
                                              visibility_condition: updatedLogicalCondition
                                            }
                                          };
                                          onUpdate(updatedElement);
                                        }}
                                      />
                                    );
                                  }
                                })()}
                              </>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => {
                                  const updatedConditions = [...(visibilityCondition as LogicalOperator).conditions];
                                  updatedConditions.splice(index, 1);

                                  const updatedLogicalCondition: LogicalOperator = {
                                    ...(visibilityCondition as LogicalOperator),
                                    conditions: updatedConditions
                                  };

                                  const updatedElement = {
                                    ...element,
                                    element: {
                                      ...element.element,
                                      visibility_condition: updatedLogicalCondition
                                    }
                                  };
                                  onUpdate(updatedElement);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Card>
                      ))}
                    </Box>

                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const newCondition: RelationalFieldOperator = {
                          operator_type: 'RFO',
                          field_id: { field_name: '' },
                          op: 'eq',
                          value: true
                        };

                        const updatedConditions = [...((visibilityCondition as LogicalOperator).conditions || [])];
                        updatedConditions.push(newCondition);

                        const updatedLogicalCondition: LogicalOperator = {
                          ...(visibilityCondition as LogicalOperator),
                          conditions: updatedConditions
                        };

                        const updatedElement = {
                          ...element,
                          element: {
                            ...element.element,
                            visibility_condition: updatedLogicalCondition
                          }
                        };
                        onUpdate(updatedElement);
                      }}
                    >
                      Bedingung hinzufügen
                    </Button>
                  </>
                )}
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  // Gemeinsame Eigenschaften für alle Elemente
  const renderCommonProperties = () => (
    <>
      <SectionTitle variant="subtitle1">Allgemeine Eigenschaften</SectionTitle>
      <Divider />

      <TranslatableField
        label="Titel"
        value={element.element.title}
        onChange={(value) => {
          const updatedElement = {
            ...element,
            element: {
              ...element.element,
              title: value
            }
          };
          onUpdate(updatedElement);
        }}
      />

      {/* Kurztitel und Beschreibung ausgeblendet, um die UI nicht zu überfrachten */}

      <FormControlLabel
        control={
          <Switch
            checked={element.element.required}
            onChange={(e) => {
              const updatedElement = {
                ...element,
                element: {
                  ...element.element,
                  required: e.target.checked
                }
              };
              onUpdate(updatedElement);
            }}
          />
        }
        label="Erforderlich"
      />

      <TextField
        label="Icon"
        size="small"
        value={element.element.icon || ''}
        onChange={(e) => {
          const updatedElement = {
            ...element,
            element: {
              ...element.element,
              icon: e.target.value
            }
          };
          onUpdate(updatedElement);
        }}
      />

      {renderVisibilityCondition()}
    </>
  );

  // Spezifische Eigenschaften je nach Elementtyp
  const renderSpecificProperties = () => {
    switch (element.element.pattern_type) {
      case 'GroupUIElement': {
        const groupElement = element.element as GroupUIElement;
        return (
          <>
            <SectionTitle variant="subtitle1">Gruppen-Eigenschaften</SectionTitle>
            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={groupElement.isCollapsible ?? false}
                  onChange={(e) => {
                    const updatedGroupElement: GroupUIElement = {
                      ...groupElement,
                      isCollapsible: e.target.checked
                    };
                    const updatedElement = {
                      ...element,
                      element: updatedGroupElement
                    };
                    onUpdate(updatedElement);
                  }}
                />
              }
              label="Ist eingeklappt"
            />
          </>
        );
      }

      case 'TextUIElement': {
        const textElement = element.element as TextUIElement;
        return (
          <>
            <SectionTitle variant="subtitle1">Text-Eigenschaften</SectionTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                TextUIElement wird für statische Textanzeige verwendet, nicht für Benutzereingaben.
              </Typography>
              <Tooltip title="Für Benutzereingaben verwenden Sie bitte StringUIElement">
                <InfoIcon fontSize="small" color="info" />
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Typ</InputLabel>
                <Select
                  value={textElement.type}
                  label="Typ"
                  onChange={(e) => {
                    const newValue = e.target.value as "PARAGRAPH" | "HEADING";
                    const updatedTextElement: TextUIElement = {
                      ...textElement,
                      type: newValue
                    };
                    const updatedElement = {
                      ...element,
                      element: updatedTextElement
                    };
                    onUpdate(updatedElement);
                  }}
                >
                  <MenuItem value="PARAGRAPH">Paragraph</MenuItem>
                  <MenuItem value="HEADING">Überschrift</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <TranslatableField
                label="Text"
                value={textElement.text}
                onChange={(value) => {
                  const updatedTextElement: TextUIElement = {
                    ...textElement,
                    text: value
                  };
                  const updatedElement = {
                    ...element,
                    element: updatedTextElement
                  };
                  onUpdate(updatedElement);
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Vorschau:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                {textElement.type === 'HEADING' ? (
                  <Typography variant="h5" gutterBottom>
                    {textElement.text?.de || 'Überschrift'}
                  </Typography>
                ) : (
                  <Typography variant="body1">
                    {textElement.text?.de || 'Absatztext'}
                  </Typography>
                )}
              </Paper>
            </Box>
          </>
        );
      }

      case 'BooleanUIElement': {
        const boolElement = element.element as BooleanUIElement;
        return (
          <>
            <SectionTitle variant="subtitle1">Boolean-Eigenschaften</SectionTitle>
            <Divider />

            <TextField
              label="Feld-ID"
              size="small"
              value={boolElement.field_id?.field_name || ''}
              onChange={(e) => {
                const updatedBoolElement: BooleanUIElement = {
                  ...boolElement,
                  field_id: {
                    field_name: e.target.value
                  }
                };
                const updatedElement = {
                  ...element,
                  element: updatedBoolElement
                };
                onUpdate(updatedElement);
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={boolElement.default_value || false}
                  onChange={(e) => {
                    const updatedBoolElement: BooleanUIElement = {
                      ...boolElement,
                      default_value: e.target.checked
                    };
                    const updatedElement = {
                      ...element,
                      element: updatedBoolElement
                    };

                    // Aktualisiere den Feldwert im FieldValuesContext
                    if (boolElement.field_id?.field_name) {
                      setFieldValue(boolElement.field_id.field_name, e.target.checked);
                    }

                    onUpdate(updatedElement);
                  }}
                />
              }
              label="Default-Wert"
            />
          </>
        );
      }

      case 'SingleSelectionUIElement': {
        const selectionElement = element.element as SingleSelectionUIElement;
        return (
          <>
            <SectionTitle variant="subtitle1">Auswahl-Eigenschaften</SectionTitle>
            <Divider />

            <TextField
              label="Feld-ID"
              size="small"
              value={selectionElement.field_id?.field_name || ''}
              onChange={(e) => {
                const updatedSelectionElement: SingleSelectionUIElement = {
                  ...selectionElement,
                  field_id: {
                    field_name: e.target.value
                  }
                };
                const updatedElement = {
                  ...element,
                  element: updatedSelectionElement
                };
                onUpdate(updatedElement);
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Typ</InputLabel>
              <Select
                value={selectionElement.type || 'DROPDOWN'}
                label="Typ"
                onChange={(e) => {
                  const newValue = e.target.value as "BUTTONGROUP" | "DROPDOWN";
                  const updatedSelectionElement: SingleSelectionUIElement = {
                    ...selectionElement,
                    type: newValue
                  };
                  const updatedElement = {
                    ...element,
                    element: updatedSelectionElement
                  };
                  onUpdate(updatedElement);
                }}
              >
                <MenuItem value="DROPDOWN">Dropdown</MenuItem>
                <MenuItem value="BUTTONGROUP">Button-Gruppe</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Default-Wert"
              size="small"
              value={selectionElement.default || ''}
              onChange={(e) => {
                const updatedSelectionElement: SingleSelectionUIElement = {
                  ...selectionElement,
                  default: e.target.value
                };
                const updatedElement = {
                  ...element,
                  element: updatedSelectionElement
                };

                // Aktualisiere den Feldwert im FieldValuesContext
                if (selectionElement.field_id?.field_name) {
                  setFieldValue(selectionElement.field_id.field_name, e.target.value);
                }

                onUpdate(updatedElement);
              }}
            />

            <SectionTitle variant="subtitle2">Optionen</SectionTitle>

            {/* Optionen-Liste */}
            <Box sx={{ mt: 1, mb: 2 }}>
              {selectionElement.options?.map((option, index) => (
                <OptionCard key={index} variant="outlined">
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Schlüssel"
                        size="small"
                        fullWidth
                        value={option.key}
                        onChange={(e) => {
                          const updatedOptions = [...selectionElement.options];
                          updatedOptions[index] = {
                            ...option,
                            key: e.target.value
                          };

                          const updatedSelectionElement: SingleSelectionUIElement = {
                            ...selectionElement,
                            options: updatedOptions
                          };

                          const updatedElement = {
                            ...element,
                            element: updatedSelectionElement
                          };
                          onUpdate(updatedElement);
                        }}
                      />

                      <TextField
                        label="Bezeichnung (DE)"
                        size="small"
                        fullWidth
                        value={option.label?.de || ''}
                        onChange={(e) => {
                          const updatedOptions = [...selectionElement.options];
                          updatedOptions[index] = {
                            ...option,
                            label: {
                              ...(option.label || {}),
                              de: e.target.value
                            }
                          };

                          const updatedSelectionElement: SingleSelectionUIElement = {
                            ...selectionElement,
                            options: updatedOptions
                          };

                          const updatedElement = {
                            ...element,
                            element: updatedSelectionElement
                          };
                          onUpdate(updatedElement);
                        }}
                      />

                      <TextField
                        label="Bezeichnung (EN)"
                        size="small"
                        fullWidth
                        value={option.label?.en || ''}
                        onChange={(e) => {
                          const updatedOptions = [...selectionElement.options];
                          updatedOptions[index] = {
                            ...option,
                            label: {
                              ...(option.label || {}),
                              en: e.target.value
                            }
                          };

                          const updatedSelectionElement: SingleSelectionUIElement = {
                            ...selectionElement,
                            options: updatedOptions
                          };

                          const updatedElement = {
                            ...element,
                            element: updatedSelectionElement
                          };
                          onUpdate(updatedElement);
                        }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => {
                            const updatedOptions = [...selectionElement.options];
                            updatedOptions.splice(index, 1);

                            const updatedSelectionElement: SingleSelectionUIElement = {
                              ...selectionElement,
                              options: updatedOptions
                            };

                            const updatedElement = {
                              ...element,
                              element: updatedSelectionElement
                            };
                            onUpdate(updatedElement);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </OptionCard>
              ))}
            </Box>

            {/* Neue Option hinzufügen */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <TextField
                label="Neuer Optionsschlüssel"
                size="small"
                fullWidth
                value={newOptionKey}
                onChange={(e) => setNewOptionKey(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                disabled={!newOptionKey.trim()}
                onClick={() => {
                  if (!newOptionKey.trim()) return;

                  const newOption: SingleSelectionUIElementItem = {
                    key: newOptionKey,
                    label: {
                      de: '',
                      en: ''
                    }
                  };

                  const updatedOptions = [...(selectionElement.options || []), newOption];

                  const updatedSelectionElement: SingleSelectionUIElement = {
                    ...selectionElement,
                    options: updatedOptions
                  };

                  const updatedElement = {
                    ...element,
                    element: updatedSelectionElement
                  };
                  onUpdate(updatedElement);
                  setNewOptionKey('');
                }}
              >
                Hinzufügen
              </Button>
            </Box>
          </>
        );
      }

      case 'CustomUIElement': {
        const customElement = element.element as import('../../models/uiElements').CustomUIElement;

        // Spezielle Behandlung für Scanner-Element
        if (customElement.type === 'SCANNER') {
          // Finde die Subflows POI und ROOM
          const poiSubflowIndex = customElement.sub_flows?.findIndex(sf => sf.type === 'POI') ?? -1;
          const roomSubflowIndex = customElement.sub_flows?.findIndex(sf => sf.type === 'ROOM') ?? -1;

          const poiSubflow = poiSubflowIndex !== -1 && customElement.sub_flows ? customElement.sub_flows[poiSubflowIndex] : null;
          const roomSubflow = roomSubflowIndex !== -1 && customElement.sub_flows ? customElement.sub_flows[roomSubflowIndex] : null;

          // Filtere die Subflows POI und ROOM aus der allgemeinen Liste
          const otherSubflows = customElement.sub_flows?.filter(sf => sf.type !== 'POI' && sf.type !== 'ROOM') || [];

          return (
            <>
              <SectionTitle variant="subtitle1">Scanner-Eigenschaften</SectionTitle>
              <Divider />

              <TextField
                label={<Typography style={{ fontStyle: 'italic' }}>ID</Typography>}
                size="small"
                value={customElement.id || 'model-edit'}
                onChange={(e) => {
                  const updatedCustomElement = {
                    ...customElement,
                    id: e.target.value
                  };
                  const updatedElement = {
                    ...element,
                    element: updatedCustomElement
                  };
                  onUpdate(updatedElement);
                }}
              />

              <TextField
                label={<Typography style={{ fontStyle: 'italic' }}>Verknüpftes Element-ID</Typography>}
                size="small"
                value={customElement.related_custom_ui_element_id || 'model-view'}
                onChange={(e) => {
                  const updatedCustomElement = {
                    ...customElement,
                    related_custom_ui_element_id: e.target.value
                  };
                  const updatedElement = {
                    ...element,
                    element: updatedCustomElement
                  };
                  onUpdate(updatedElement);
                }}
              />

              {/* POI Subflow als fester Unterpunkt */}
              {poiSubflow && (
                <Box sx={{ mt: 3 }}>
                  <SectionTitle variant="subtitle1">POI-Eigenschaften</SectionTitle>
                  <Divider />
                  {renderScannerPoiSubflow(poiSubflow, poiSubflowIndex)}
                </Box>
              )}

              {/* ROOM Subflow als fester Unterpunkt */}
              {roomSubflow && (
                <Box sx={{ mt: 3 }}>
                  <SectionTitle variant="subtitle1">Raum-Eigenschaften</SectionTitle>
                  <Divider />
                  {renderScannerRoomSubflow(roomSubflow, roomSubflowIndex)}
                </Box>
              )}

              {/* Andere Subflows in der allgemeinen Liste */}
              {otherSubflows.length > 0 && (
                <>
                  <SectionTitle variant="subtitle2" sx={{ mt: 3 }}>Weitere Subflows</SectionTitle>
                  <Divider />

                  {otherSubflows.map((subflow, index) => {
                    // Finde den ursprünglichen Index des Subflows in der vollständigen Liste
                    const originalIndex = customElement.sub_flows?.findIndex(sf => sf === subflow) ?? -1;

                    if (originalIndex === -1) return null;

                    return (
                      <Accordion key={index} sx={{ mt: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle2">
                            {subflow.type} ({subflow.elements.length} Elemente)
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <FormControl fullWidth size="small" margin="dense">
                            <InputLabel>Typ</InputLabel>
                            <Select
                              value={subflow.type}
                              label="Typ"
                              onChange={(e) => {
                                if (!customElement.sub_flows) return;

                                const updatedSubflows = [...customElement.sub_flows];
                                updatedSubflows[originalIndex] = {
                                  ...subflow,
                                  type: e.target.value as 'POI_PHOTO' | 'POI' | 'ROOM' | 'ROOM_GROUP' | 'WINDOW' | 'SLAB' | 'DOOR' | 'WALL'
                                };

                                const updatedCustomElement = {
                                  ...customElement,
                                  sub_flows: updatedSubflows
                                };

                                const updatedElement = {
                                  ...element,
                                  element: updatedCustomElement
                                };

                                onUpdate(updatedElement);
                              }}
                            >
                              <MenuItem value="POI_PHOTO">POI_PHOTO</MenuItem>
                              <MenuItem value="WINDOW">WINDOW</MenuItem>
                              <MenuItem value="SLAB">SLAB</MenuItem>
                              <MenuItem value="DOOR">DOOR</MenuItem>
                              <MenuItem value="WALL">WALL</MenuItem>
                            </Select>
                          </FormControl>

                          {/* Elemente innerhalb des Subflows anzeigen */}
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Elemente</Typography>

                            {subflow.elements.map((subElement, elementIndex) => (
                              <Accordion key={elementIndex} sx={{ mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Typography variant="body2">
                                    {subElement.element.pattern_type}
                                    {subElement.element.title?.de && ` - ${subElement.element.title.de}`}
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  {renderStandardElementProperties(subElement, originalIndex, [elementIndex])}
                                </AccordionDetails>
                              </Accordion>
                            ))}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </>
              )}
            </>
          );
        }

        // Standard-Behandlung für andere CustomUIElement-Typen
        return (
          <>
            <SectionTitle variant="subtitle1">Benutzerdefinierte Eigenschaften</SectionTitle>
            <Divider />

            <TextField
              label={<Typography style={{ fontStyle: 'italic' }}>ID</Typography>}
              size="small"
              value={customElement.id || 'model-edit'}
              onChange={(e) => {
                const updatedCustomElement = {
                  ...customElement,
                  id: e.target.value
                };
                const updatedElement = {
                  ...element,
                  element: updatedCustomElement
                };
                onUpdate(updatedElement);
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Typ</InputLabel>
              <Select
                value={customElement.type || ''}
                label="Typ"
                onChange={(e) => {
                  const updatedCustomElement = {
                    ...customElement,
                    type: e.target.value
                  };
                  const updatedElement = {
                    ...element,
                    element: updatedCustomElement
                  };
                  onUpdate(updatedElement);
                }}
              >
                <MenuItem value="SCANNER">Scanner (Doorbit Studio)</MenuItem>
                <MenuItem value="ADDRESS">Adresseingabe</MenuItem>
                <MenuItem value="LOCATION">Standort (Karte)</MenuItem>
                <MenuItem value="ADMIN_BOUNDARY">Umgebungsinfos (Nachbarschaft, Landkreis)</MenuItem>
                <MenuItem value="">Benutzerdefiniert</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={<Typography style={{ fontStyle: 'italic' }}>Verknüpftes Element-ID</Typography>}
              size="small"
              value={customElement.related_custom_ui_element_id || 'model-view'}
              onChange={(e) => {
                const updatedCustomElement = {
                  ...customElement,
                  related_custom_ui_element_id: e.target.value
                };
                const updatedElement = {
                  ...element,
                  element: updatedCustomElement
                };
                onUpdate(updatedElement);
              }}
            />

            {/* Subflow-Eigenschaften anzeigen, wenn vorhanden */}
            {customElement.sub_flows && customElement.sub_flows.length > 0 && (
              <>
                <SectionTitle variant="subtitle2" sx={{ mt: 2 }}>Subflows</SectionTitle>
                <Divider />

                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ mb: 2 }}
                >
                  {customElement.sub_flows.map((subflow, index) => (
                    <Tab key={index} label={subflow.type} />
                  ))}
                </Tabs>

                {customElement.sub_flows.map((subflow, subflowIndex) => (
                  <Box key={subflowIndex} sx={{ display: activeTab === subflowIndex ? 'block' : 'none' }}>
                    <FormControl fullWidth size="small" margin="dense">
                      <InputLabel>Typ</InputLabel>
                      <Select
                        value={subflow.type}
                        label="Typ"
                        onChange={(e) => {
                          const updatedSubflows = [...customElement.sub_flows!];
                          updatedSubflows[subflowIndex] = {
                            ...subflow,
                            type: e.target.value as 'POI_PHOTO' | 'POI' | 'ROOM' | 'ROOM_GROUP' | 'WINDOW' | 'SLAB' | 'DOOR' | 'WALL'
                          };

                          const updatedCustomElement = {
                            ...customElement,
                            sub_flows: updatedSubflows
                          };

                          const updatedElement = {
                            ...element,
                            element: updatedCustomElement
                          };

                          onUpdate(updatedElement);
                        }}
                      >
                        <MenuItem value="POI_PHOTO">POI_PHOTO</MenuItem>
                        <MenuItem value="POI">POI</MenuItem>
                        <MenuItem value="ROOM">ROOM</MenuItem>
                        <MenuItem value="ROOM_GROUP">ROOM_GROUP</MenuItem>
                        <MenuItem value="WINDOW">WINDOW</MenuItem>
                        <MenuItem value="SLAB">SLAB</MenuItem>
                        <MenuItem value="DOOR">DOOR</MenuItem>
                        <MenuItem value="WALL">WALL</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Elemente innerhalb des Subflows anzeigen */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Elemente</Typography>

                      {/* Rendere den entsprechenden Subflow basierend auf seinem Typ */}
                      {subflow.type === 'POI' && renderScannerPoiSubflow(subflow, subflowIndex)}
                      {subflow.type === 'ROOM' && renderScannerRoomSubflow(subflow, subflowIndex)}
                      {subflow.type === 'POI_PHOTO' && renderScannerPoiPhotoSubflow(subflow, subflowIndex)}

                      {/* Für andere Subflow-Typen verwende die Standard-Darstellung */}
                      {subflow.type !== 'POI' && subflow.type !== 'ROOM' && subflow.type !== 'POI_PHOTO' && (
                        <Box>
                          {subflow.elements.map((subElement, elementIndex) => (
                            <Accordion key={elementIndex} sx={{ mb: 1 }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="body2">
                                  {subElement.element.pattern_type}
                                  {subElement.element.title?.de && ` - ${subElement.element.title.de}`}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                {renderStandardElementProperties(subElement, subflowIndex, [elementIndex])}
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </>
            )}
          </>
        );
      }

      // Weitere Elementtypen...

      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Spezifische Eigenschaften für diesen Elementtyp sind noch nicht implementiert.
          </Typography>
        );
    }
  };

  return (
    <PropertyEditorContainer>
      <Typography variant="h6" gutterBottom>
        Eigenschaften
      </Typography>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        {element.element.pattern_type}
      </Typography>

      <Form>
        {renderCommonProperties()}
        {renderSpecificProperties()}
      </Form>
    </PropertyEditorContainer>
  );
};

export default PropertyEditor;
