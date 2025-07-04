import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { useEditor } from '../../context/EditorContext';

const BuilderContainer = styled(Box)`
  margin-top: 1rem;
`;

const ConditionCard = styled(Card)`
  margin-bottom: 1rem;
  border: 1px solid #E0E0E0;
  border-radius: 8px;

  &:hover {
    border-color: #009F64;
  }
`;

const ConditionCardContent = styled(CardContent)`
  padding: 1rem;
`;

const OperatorSelect = styled(FormControl)`
  min-width: 120px;
`;

const FieldSelect = styled(FormControl)`
  min-width: 200px;
`;

const ValueField = styled(TextField)`
  min-width: 200px;
`;

const AddConditionButton = styled(Button)`
  margin-top: 1rem;
  background-color: #43E77F;
  color: #000000;
  border: 1px solid #000000;

  &:hover {
    background-color: #35D870;
  }
`;

const LogicOperatorChip = styled(Chip)`
  margin: 0.5rem 0;
  font-weight: 500;
`;

const PreviewContainer = styled(Box)`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
`;

interface VisibilityConditionBuilderProps {
  condition: any;
  onChange: (condition: any) => void;
}

const VisibilityConditionBuilder: React.FC<VisibilityConditionBuilderProps> = ({
  condition,
  onChange
}) => {
  const { state } = useEditor();
  const [localCondition, setLocalCondition] = useState<any>(condition || { operator: 'AND', conditions: [] });
  const [availableFields, setAvailableFields] = useState<any[]>([]);

  // Rekursive Funktion zum Sammeln aller Felder
  const collectFields = React.useCallback((elements: any[], fields: any[], pageName: string) => {
    elements.forEach(element => {
      // Prüfe, ob es sich um ein PatternLibraryElement handelt
      const elementData = element.element ? element.element : element;

      if (elementData.field_id) {
        const fieldName = elementData.field_id.field_name || elementData.field_id;
        const fieldTitle = elementData.title?.de || elementData.title?.en || fieldName;
        fields.push({
          fieldName: fieldName,
          elementType: elementData.pattern_type,
          title: fieldTitle,
          pageName
        });
      }

      // Rekursiv Unterelemente durchsuchen
      if (elementData.elements) {
        collectFields(elementData.elements, fields, pageName);
      }

      if (elementData.chips) {
        collectFields(elementData.chips, fields, pageName);
      }

      if (elementData.sub_flows) {
        elementData.sub_flows.forEach((subflow: any) => {
          if (subflow.elements) {
            collectFields(subflow.elements, fields, pageName);
          }
        });
      }
    });
  }, []);

  // Sammle alle verfügbaren Felder aus allen Seiten
  useEffect(() => {
    const fields: any[] = [];

    if (state.currentFlow && state.currentFlow.pages_edit) {
      state.currentFlow.pages_edit.forEach(page => {
        if (page.elements) {
          collectFields(page.elements, fields, page.id);
        }
      });
    }

    setAvailableFields(fields);
  }, [state.currentFlow, collectFields]);

  // Aktualisiere die übergeordnete Komponente, wenn sich die lokale Bedingung ändert
  useEffect(() => {
    onChange(localCondition);
  }, [localCondition, onChange]);

  // Handler für Änderungen am logischen Operator (AND/OR)
  const handleLogicOperatorChange = (event: any) => {
    setLocalCondition({
      ...localCondition,
      operator: event.target.value
    });
  };

  // Handler für Änderungen an einer einzelnen Bedingung
  const handleConditionChange = (index: number, field: string, value: any) => {
    const updatedConditions = [...localCondition.conditions];
    updatedConditions[index] = {
      ...updatedConditions[index],
      [field]: value
    };

    setLocalCondition({
      ...localCondition,
      conditions: updatedConditions
    });
  };

  // Handler für das Hinzufügen einer neuen Bedingung
  const handleAddCondition = () => {
    const newCondition = {
      field: availableFields.length > 0 ? availableFields[0].fieldName : '',
      operator: '==',
      value: ''
    };

    setLocalCondition({
      ...localCondition,
      conditions: [...localCondition.conditions, newCondition]
    });
  };

  // Handler für das Entfernen einer Bedingung
  const handleRemoveCondition = (index: number) => {
    const updatedConditions = [...localCondition.conditions];
    updatedConditions.splice(index, 1);

    setLocalCondition({
      ...localCondition,
      conditions: updatedConditions
    });
  };

  // Rendere eine einzelne Bedingung
  const renderCondition = (condition: any, index: number) => {
    return (
      <ConditionCard key={index}>
        <ConditionCardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FieldSelect size="small" fullWidth>
                <InputLabel>Feld</InputLabel>
                <Select
                  value={condition.field || ''}
                  onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                  label="Feld"
                >
                  {availableFields.map((field, i) => (
                    <MenuItem key={i} value={field.fieldName}>
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
              </FieldSelect>


            </Box>

            <Box sx={{ flex: 3 }}>
              <OperatorSelect size="small" fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={condition.operator || '=='}
                  onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                  label="Operator"
                >
                  <MenuItem value="==">ist gleich (==)</MenuItem>
                  <MenuItem value="!=">ist nicht gleich (!=)</MenuItem>
                  <MenuItem value=">">ist größer als (&gt;)</MenuItem>
                  <MenuItem value="<">ist kleiner als (&lt;)</MenuItem>
                  <MenuItem value=">=">ist größer oder gleich (&gt;=)</MenuItem>
                  <MenuItem value="<=">ist kleiner oder gleich (&lt;=)</MenuItem>
                  <MenuItem value="contains">enthält</MenuItem>
                  <MenuItem value="startsWith">beginnt mit</MenuItem>
                  <MenuItem value="endsWith">endet mit</MenuItem>
                </Select>
              </OperatorSelect>
            </Box>

            <Box sx={{ flex: 4 }}>
              <ValueField
                label="Wert"
                value={condition.value || ''}
                onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                size="small"
                fullWidth
              />
            </Box>

            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <Tooltip title="Bedingung entfernen">
                <IconButton
                  color="error"
                  onClick={() => handleRemoveCondition(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </ConditionCardContent>
      </ConditionCard>
    );
  };

  // Generiere eine menschenlesbare Vorschau der Bedingung
  const generatePreview = () => {
    if (!localCondition || !localCondition.conditions || localCondition.conditions.length === 0) {
      return 'Keine Bedingung definiert';
    }

    const conditionTexts = localCondition.conditions.map((cond: any) => {
      const fieldInfo = availableFields.find(f => f.fieldName === cond.field);
      const fieldName = fieldInfo ? fieldInfo.title : cond.field;

      let operatorText = '';
      switch (cond.operator) {
        case '==': operatorText = 'ist gleich'; break;
        case '!=': operatorText = 'ist nicht gleich'; break;
        case '>': operatorText = 'ist größer als'; break;
        case '<': operatorText = 'ist kleiner als'; break;
        case '>=': operatorText = 'ist größer oder gleich'; break;
        case '<=': operatorText = 'ist kleiner oder gleich'; break;
        case 'contains': operatorText = 'enthält'; break;
        case 'startsWith': operatorText = 'beginnt mit'; break;
        case 'endsWith': operatorText = 'endet mit'; break;
        default: operatorText = cond.operator;
      }

      return `"${fieldName}" ${operatorText} "${cond.value}"`;
    });

    return conditionTexts.join(` ${localCondition.operator} `);
  };

  // Überprüfe, ob die Bedingung gültig ist
  const isConditionValid = () => {
    if (!localCondition || !localCondition.conditions || localCondition.conditions.length === 0) {
      return false;
    }

    return localCondition.conditions.every((cond: any) =>
      cond.field && cond.operator && cond.value !== undefined && cond.value !== null
    );
  };

  return (
    <BuilderContainer>
      {/* Logischer Operator (AND/OR) */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Logischer Operator
        </Typography>
        <OperatorSelect size="small">
          <InputLabel>Operator</InputLabel>
          <Select
            value={localCondition.operator || 'AND'}
            onChange={handleLogicOperatorChange}
            label="Operator"
          >
            <MenuItem value="AND">UND (alle Bedingungen müssen erfüllt sein)</MenuItem>
            <MenuItem value="OR">ODER (mindestens eine Bedingung muss erfüllt sein)</MenuItem>
          </Select>
        </OperatorSelect>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Bedingungen */}
      <Typography variant="subtitle2" gutterBottom>
        Bedingungen
      </Typography>

      {localCondition.conditions && localCondition.conditions.length > 0 ? (
        <>
          {localCondition.conditions.map((condition: any, index: number) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <LogicOperatorChip
                    label={localCondition.operator}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
              {renderCondition(condition, index)}
            </React.Fragment>
          ))}
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Keine Bedingungen definiert. Fügen Sie eine Bedingung hinzu, um zu beginnen.
        </Typography>
      )}

      <AddConditionButton
        startIcon={<AddIcon />}
        variant="contained"
        onClick={handleAddCondition}
      >
        Bedingung hinzufügen
      </AddConditionButton>

      {/* Vorschau */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Vorschau
        </Typography>
        <PreviewContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {isConditionValid() ? (
              <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
            ) : (
              <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
            )}
            <Typography variant="body2" fontWeight={500}>
              {isConditionValid() ? 'Gültige Bedingung' : 'Unvollständige Bedingung'}
            </Typography>
          </Box>
          <Typography variant="body2" fontFamily="monospace">
            {generatePreview()}
          </Typography>
        </PreviewContainer>
      </Box>

      {/* Hilfe */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 159, 100, 0.05)', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
          <HelpOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          Hilfe zu Sichtbarkeitsregeln
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Sichtbarkeitsregeln bestimmen, wann ein Element angezeigt wird. Das Element wird nur angezeigt, wenn die Regel erfüllt ist.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Beispiel: Ein Element soll nur angezeigt werden, wenn ein Checkbox-Feld mit der ID "show_details" aktiviert ist.
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <HelpOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          Hinweis zu Feld-IDs
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          In der Dropdown-Liste werden die benutzerfreundlichen Feldtitel angezeigt, während im JSON die entsprechenden Feld-IDs verwendet werden.
          Die Feld-ID (z.B. "building_poi_is_todo") wird unter jedem Feldtitel angezeigt.
        </Typography>
      </Box>
    </BuilderContainer>
  );
};

export default VisibilityConditionBuilder;
