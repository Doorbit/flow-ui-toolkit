import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Paper,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  VisibilityCondition,
  LogicalOperator,
  RelationalFieldOperator,
  RelationalContextOperator
} from '../../../models/listingFlow';
import { useFieldValues } from '../../../context/FieldValuesContext';

interface VisibilityConditionEditorProps {
  visibilityCondition: VisibilityCondition | undefined;
  onChange: (newCondition: VisibilityCondition | undefined) => void;
  showToggle?: boolean;
  showAsAccordion?: boolean;
}

/**
 * Eine verbesserte Komponente für die Bearbeitung von Visibility-Bedingungen.
 * Unterstützt komplexe verschachtelte logische Operatoren und bietet eine
 * benutzerfreundliche Oberfläche für die Auswahl von Feldern aus allen Subflows.
 */
export const VisibilityConditionEditor: React.FC<VisibilityConditionEditorProps> = ({
  visibilityCondition,
  onChange,
  showToggle = true,
  showAsAccordion = true
}) => {
  const { availableFields } = useFieldValues();

  // Funktion zum Rendern eines relationalen Feldoperators
  const renderRelationalFieldOperator = (condition: RelationalFieldOperator) => {
    const { field_id, op } = condition;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Feld-ID</InputLabel>
          <Select
            value={field_id?.field_name || ''}
            label="Feld-ID"
            onChange={(e: SelectChangeEvent) => {
              const updatedCondition: RelationalFieldOperator = {
                ...condition,
                field_id: { field_name: e.target.value as string }
              };

              onChange(updatedCondition);
            }}
          >
            {availableFields.map((field) => (
              <MenuItem key={field.fieldName} value={field.fieldName}>
                <Tooltip title={`Technische Feld-ID: ${field.fieldName}`} placement="right">
                  <Box>
                    <Typography variant="body2">
                      {field.title} ({field.pageName})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Feld-ID: {field.fieldName}
                    </Typography>
                  </Box>
                </Tooltip>
              </MenuItem>
            ))}
          </Select>
        </FormControl>



        <FormControl fullWidth size="small">
          <InputLabel>Operator</InputLabel>
          <Select
            value={op || 'eq'}
            label="Operator"
            onChange={(e: SelectChangeEvent) => {
              const updatedCondition: RelationalFieldOperator = {
                ...condition,
                op: e.target.value as 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin'
              };

              onChange(updatedCondition);
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
            onChange={(e: SelectChangeEvent) => {
              const updatedCondition: LogicalOperator = {
                ...condition,
                operator: e.target.value as 'AND' | 'OR' | 'NOT'
              };

              onChange(updatedCondition);
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
                    onChange={(e: SelectChangeEvent) => {
                      const newType = e.target.value;
                      let newSubCondition: VisibilityCondition;

                      if (newType === 'LO') {
                        // Logischer Operator
                        newSubCondition = {
                          operator_type: 'LO',
                          operator: 'AND',
                          conditions: []
                        };
                      } else if (newType === 'RCO') {
                        // Relationaler Kontextoperator
                        newSubCondition = {
                          operator_type: 'RCO',
                          context: 'EDIT'
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

                      onChange(updatedCondition);
                    }}
                  >
                    <MenuItem value="RFO">Einfache Bedingung</MenuItem>
                    <MenuItem value="LO">Logische Verknüpfung</MenuItem>
                    <MenuItem value="RCO">Kontextbedingung</MenuItem>
                  </Select>
                </FormControl>

                {subCondition.operator_type === 'RFO' && renderRelationalFieldOperator(subCondition as RelationalFieldOperator)}
                {subCondition.operator_type === 'LO' && renderLogicalOperator(subCondition as LogicalOperator)}
                {subCondition.operator_type === 'RCO' && renderRelationalContextOperator(subCondition as RelationalContextOperator)}

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

                    onChange(updatedCondition);
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

              onChange(updatedCondition);
            }}
          >
            Bedingung hinzufügen
          </Button>
        </Box>
      </Box>
    );
  };

  // Funktion zum Rendern eines relationalen Kontextoperators
  const renderRelationalContextOperator = (contextCondition: RelationalContextOperator) => {
    const { context } = contextCondition;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Kontext</InputLabel>
          <Select
            value={context || 'EDIT'}
            label="Kontext"
            onChange={(e: SelectChangeEvent) => {
              const updatedCondition: RelationalContextOperator = {
                ...contextCondition,
                context: e.target.value as 'CREATE' | 'EDIT' | 'VIEW' | 'BACK_OFFICE'
              };

              onChange(updatedCondition);
            }}
          >
            <MenuItem value="CREATE">Erstellen</MenuItem>
            <MenuItem value="EDIT">Bearbeiten</MenuItem>
            <MenuItem value="VIEW">Ansicht</MenuItem>
            <MenuItem value="BACK_OFFICE">Back Office</MenuItem>
          </Select>
        </FormControl>
      </Box>
    );
  };

  // Funktion zum Rendern der Wert-Eingabe basierend auf dem Feldtyp
  const renderValueInput = (condition: RelationalFieldOperator) => {
    const { field_id, op } = condition;

    if (!field_id || !field_id.field_name) {
      return null;
    }

    // Finde den Feldtyp basierend auf der field_id
    const fieldInfo = availableFields.find(f => f.fieldName === field_id.field_name);
    const fieldType = fieldInfo?.elementType || 'unknown';

    // Für Operatoren, die eine Liste von Werten verwenden
    if (op === 'in' || op === 'nin') {
      return (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Werte (durch Komma getrennt)
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Wert1, Wert2, Wert3"
            value={condition.value_list ? condition.value_list.join(', ') : ''}
            onChange={(e) => {
              const valueList = e.target.value.split(',').map(v => v.trim());

              const updatedCondition: RelationalFieldOperator = {
                ...condition,
                value_list: valueList.length > 0 ? valueList : undefined
              };

              onChange(updatedCondition);
            }}
          />
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {condition.value_list && condition.value_list.map((val, index) => (
              <Chip
                key={index}
                label={val}
                onDelete={() => {
                  const newValueList = [...condition.value_list!];
                  newValueList.splice(index, 1);

                  const updatedCondition: RelationalFieldOperator = {
                    ...condition,
                    value_list: newValueList.length > 0 ? newValueList : undefined
                  };

                  onChange(updatedCondition);
                }}
              />
            ))}
          </Box>
        </Box>
      );
    }

    // Rendere die Wert-Eingabe basierend auf dem Feldtyp
    switch (fieldType) {
      case 'BooleanUIElement':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>Wert</InputLabel>
            <Select
              value={condition.value === true ? 'true' : condition.value === false ? 'false' : ''}
              label="Wert"
              onChange={(e: SelectChangeEvent) => {
                const newValue = e.target.value === 'true' ? true : e.target.value === 'false' ? false : null;

                const updatedCondition: RelationalFieldOperator = {
                  ...condition,
                  value: newValue
                };

                onChange(updatedCondition);
              }}
            >
              <MenuItem value="true">Wahr</MenuItem>
              <MenuItem value="false">Falsch</MenuItem>
            </Select>
          </FormControl>
        );

      case 'SingleSelectionUIElement':
        // Für SingleSelectionUIElement sollten wir idealerweise die verfügbaren Optionen anzeigen
        // Da wir diese Information hier nicht haben, verwenden wir ein einfaches Textfeld
        return (
          <TextField
            label="Wert (Schlüssel der Option)"
            size="small"
            fullWidth
            value={condition.value || ''}
            onChange={(e) => {
              const updatedCondition: RelationalFieldOperator = {
                ...condition,
                value: e.target.value
              };

              onChange(updatedCondition);
            }}
          />
        );

      case 'StringUIElement':
        return (
          <TextField
            label="Wert"
            size="small"
            fullWidth
            value={condition.value || ''}
            onChange={(e) => {
              const updatedCondition: RelationalFieldOperator = {
                ...condition,
                value: e.target.value
              };

              onChange(updatedCondition);
            }}
          />
        );

      case 'NumberUIElement':
        return (
          <TextField
            label="Wert"
            size="small"
            fullWidth
            type="number"
            value={condition.value || ''}
            onChange={(e) => {
              const updatedCondition: RelationalFieldOperator = {
                ...condition,
                value: parseFloat(e.target.value)
              };

              onChange(updatedCondition);
            }}
          />
        );

      case 'DateUIElement':
        return (
          <TextField
            label="Wert (YYYY-MM-DD)"
            size="small"
            fullWidth
            value={condition.value || ''}
            onChange={(e) => {
              const updatedCondition: RelationalFieldOperator = {
                ...condition,
                value: e.target.value
              };

              onChange(updatedCondition);
            }}
          />
        );

      default:
        return (
          <TextField
            label="Wert"
            size="small"
            fullWidth
            value={condition.value || ''}
            onChange={(e) => {
              const updatedCondition: RelationalFieldOperator = {
                ...condition,
                value: e.target.value
              };

              onChange(updatedCondition);
            }}
          />
        );
    }
  };

  // Rendere entweder als Accordion oder als Paper, je nach showAsAccordion
  const renderContent = () => {
    const content = (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {showToggle && (
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

                    onChange(newCondition);
                  } else {
                    // Entferne die Sichtbarkeitsregel
                    onChange(undefined);
                  }
                }}
              />
            }
            label="Bedingte Sichtbarkeit aktivieren"
          />
        )}

        {!!visibilityCondition && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Bedingte Sichtbarkeitsregeln bestimmen, wann dieses Element angezeigt wird. Das Element wird nur angezeigt, wenn die Bedingung erfüllt ist. Dies ist nicht zu verwechseln mit der Strukturnavigation, die es ermöglicht, durch die Hierarchie der Elemente zu navigieren.
            </Typography>

            <Box sx={{ p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Hinweis zu Feld-IDs
              </Typography>
              <Typography variant="body2">
                In der Dropdown-Liste werden die benutzerfreundlichen Feldtitel angezeigt, während im JSON die entsprechenden Feld-IDs verwendet werden.
                Die Feld-ID (z.B. "building_poi_is_todo") wird unter jedem Feldtitel angezeigt.
              </Typography>
            </Box>
          </>
        )}

        {visibilityCondition && (
          <>
            <FormControl fullWidth size="small">
              <InputLabel>Bedingungstyp</InputLabel>
              <Select
                value={visibilityCondition.operator_type || 'RFO'}
                label="Bedingungstyp"
                onChange={(e: SelectChangeEvent) => {
                  const newType = e.target.value;
                  let newCondition: VisibilityCondition;

                  if (newType === 'LO') {
                    // Logischer Operator
                    newCondition = {
                      operator_type: 'LO',
                      operator: 'AND',
                      conditions: []
                    };
                  } else if (newType === 'RCO') {
                    // Relationaler Kontextoperator
                    newCondition = {
                      operator_type: 'RCO',
                      context: 'EDIT'
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

                  onChange(newCondition);
                }}
              >
                <MenuItem value="RFO">Einfache Bedingung</MenuItem>
                <MenuItem value="LO">Logische Verknüpfung</MenuItem>
                <MenuItem value="RCO">Kontextbedingung</MenuItem>
              </Select>
            </FormControl>

            {visibilityCondition.operator_type === 'RFO' && renderRelationalFieldOperator(visibilityCondition as RelationalFieldOperator)}
            {visibilityCondition.operator_type === 'LO' && renderLogicalOperator(visibilityCondition as LogicalOperator)}
            {visibilityCondition.operator_type === 'RCO' && renderRelationalContextOperator(visibilityCondition as RelationalContextOperator)}
          </>
        )}
      </Box>
    );

    if (showAsAccordion) {
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
            {content}
          </AccordionDetails>
        </Accordion>
      );
    } else {
      return (
        <Paper sx={{ p: 2, mb: 2 }}>
          {content}
        </Paper>
      );
    }
  };

  return renderContent();
};
