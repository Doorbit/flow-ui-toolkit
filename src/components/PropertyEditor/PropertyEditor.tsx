import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useFieldValues } from '../../context/FieldValuesContext';
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
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { PatternLibraryElement, VisibilityCondition, RelationalFieldOperator, LogicalOperator, FieldId } from '../../models/listingFlow';
import {
  TextUIElement,
  BooleanUIElement,
  SingleSelectionUIElement,
  SingleSelectionUIElementItem
} from '../../models/uiElements';

const PropertyEditorContainer = styled(Paper)`
  width: 100%;
  height: 100%;
  padding: 1rem;
  background-color: #f5f5f5;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled(Typography)`
  font-weight: 500;
  margin-top: 1rem;
`;

const OptionCard = styled(Card)`
  margin-bottom: 10px;
`;

interface PropertyEditorProps {
  element: PatternLibraryElement | null;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

// Komponente für mehrsprachige Textfelder
const TranslatableField: React.FC<{
  label: string;
  value: { [key: string]: string } | undefined;
  onChange: (value: { [key: string]: string }) => void;
}> = ({ label, value = {}, onChange }) => {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          label="Deutsch"
          size="small"
          value={value.de || ''}
          onChange={(e) => onChange({ ...value, de: e.target.value })}
        />
        <TextField
          label="Englisch"
          size="small"
          value={value.en || ''}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
        />
      </Box>
    </Box>
  );
};

const PropertyEditor: React.FC<PropertyEditorProps> = ({ element, onUpdate }) => {
  const [newOptionKey, setNewOptionKey] = useState('');
  const { setFieldValue, availableFields } = useFieldValues();

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

                      // Standardwert
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
                        // Standardfall: Textfeld mit JSON-Eingabe
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

                                  // Standardwert
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
                                    // Standardfall: Textfeld mit JSON-Eingabe
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

      <TranslatableField
        label="Kurztitel"
        value={element.element.short_title}
        onChange={(value) => {
          const updatedElement = {
            ...element,
            element: {
              ...element.element,
              short_title: value
            }
          };
          onUpdate(updatedElement);
        }}
      />

      <TranslatableField
        label="Beschreibung"
        value={element.element.description}
        onChange={(value) => {
          const updatedElement = {
            ...element,
            element: {
              ...element.element,
              description: value
            }
          };
          onUpdate(updatedElement);
        }}
      />

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
      case 'TextUIElement': {
        const textElement = element.element as TextUIElement;
        return (
          <>
            <SectionTitle variant="subtitle1">Text-Eigenschaften</SectionTitle>
            <Divider />

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
              label="Standardwert"
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
              label="Standardwert"
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
