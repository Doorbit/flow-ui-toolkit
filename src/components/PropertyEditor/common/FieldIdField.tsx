import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';

interface FieldIdFieldProps {
  /** Aktueller field_name (Wert von field_id.field_name). */
  value: string;
  /** Liefert den neuen field_name. */
  onChange: (fieldName: string) => void;
  required?: boolean;
  helpText?: string;
}

/**
 * Prominentes, einheitliches Editierfeld für die Feld-ID (`field_id.field_name`).
 * Eingabe-Elemente brauchen eine Feld-ID — dort landet der erfasste Wert. Früher war
 * dieses Feld in den Editoren uneinheitlich, versteckt oder gar nicht vorhanden;
 * hier zentral mit Pflicht-Markierung, Hilfetext und Leer-Warnung.
 */
const FieldIdField: React.FC<FieldIdFieldProps> = ({ value, onChange, required = true, helpText }) => {
  const empty = required && !value.trim();

  return (
    <Box
      sx={{
        mb: 2,
        p: 1.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: empty ? 'error.light' : 'rgba(0,0,0,0.12)',
        bgcolor: 'rgba(0,159,100,0.04)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
        <KeyOutlinedIcon fontSize="small" sx={{ color: 'action.active' }} />
        <Typography variant="subtitle2">Feld-ID{required ? ' *' : ''}</Typography>
      </Box>
      <TextField
        fullWidth
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="z. B. heating_type"
        error={empty}
        helperText={
          empty
            ? 'Pflichtfeld — ohne Feld-ID wird der erfasste Wert nicht gespeichert.'
            : helpText ?? 'Eindeutiger Name, unter dem der erfasste Wert gespeichert wird (snake_case).'
        }
      />
    </Box>
  );
};

export default FieldIdField;
