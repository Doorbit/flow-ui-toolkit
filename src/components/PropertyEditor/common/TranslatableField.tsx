import React from 'react';
import { Box, Typography, TextField } from '@mui/material';

interface TranslatableFieldProps {
  label: string;
  value: { [key: string]: string } | undefined;
  onChange: (value: { [key: string]: string }) => void;
  multiline?: boolean;
  rows?: number;
}

/**
 * Komponente für mehrsprachige Textfelder.
 * Unterstützt die Bearbeitung von Texten in verschiedenen Sprachen.
 */
export const TranslatableField: React.FC<TranslatableFieldProps> = ({
  label,
  value = {},
  onChange,
  multiline = false,
  rows = 1
}) => {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          label="Deutsch"
          size="small"
          fullWidth
          value={value.de || ''}
          onChange={(e) => onChange({ ...value, de: e.target.value })}
          multiline={multiline}
          rows={rows}
        />
        <TextField
          label="Englisch"
          size="small"
          fullWidth
          value={value.en || ''}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          multiline={multiline}
          rows={rows}
        />
      </Box>
    </Box>
  );
};
