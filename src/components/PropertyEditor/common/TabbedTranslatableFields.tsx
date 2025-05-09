import React, { useState } from 'react';
import { Box, Typography, TextField, Tabs, Tab } from '@mui/material';

interface TabbedTranslatableFieldsProps {
  fields: {
    id: string;
    label: string;
    value: { [key: string]: string } | undefined;
    onChange: (value: { [key: string]: string }) => void;
    multiline?: boolean;
    rows?: number;
    placeholder?: string;
  }[];
  title?: string;
  languageTab?: number;
  onLanguageTabChange?: (newValue: number) => void;
}

/**
 * Komponente für mehrsprachige Textfelder mit Tab-basierter Sprachauswahl.
 * Unterstützt die Bearbeitung mehrerer Felder in verschiedenen Sprachen.
 * 
 * @param fields Array von Felddefinitionen (id, label, value, onChange)
 * @param title Optionaler Titel für die Feldgruppe
 * @param languageTab Externer State für den ausgewählten Sprachtab
 * @param onLanguageTabChange Callback für Änderungen am ausgewählten Sprachtab
 */
export const TabbedTranslatableFields: React.FC<TabbedTranslatableFieldsProps> = ({
  fields,
  title,
  languageTab: externalLanguageTab,
  onLanguageTabChange
}) => {
  const [internalLanguageTab, setInternalLanguageTab] = useState(0);
  
  // Verwende entweder externen oder internen Sprachtab-State
  const languageTab = externalLanguageTab !== undefined ? externalLanguageTab : internalLanguageTab;
  const handleLanguageTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (onLanguageTabChange) {
      onLanguageTabChange(newValue);
    } else {
      setInternalLanguageTab(newValue);
    }
  };

  return (
    <Box>
      {title && (
        <Typography variant="subtitle2" gutterBottom>
          {title}
        </Typography>
      )}
      
      <Tabs
        value={languageTab}
        onChange={handleLanguageTabChange}
        sx={{ mb: 2 }}
      >
        <Tab label="Deutsch" />
        <Tab label="Englisch" />
      </Tabs>

      {languageTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {fields.map((field) => (
            <TextField
              key={field.id}
              label={field.label}
              size="small"
              fullWidth
              value={field.value?.de || ''}
              onChange={(e) => {
                field.onChange({
                  ...(field.value || {}),
                  de: e.target.value
                });
              }}
              multiline={field.multiline}
              rows={field.rows}
              placeholder={field.placeholder}
            />
          ))}
        </Box>
      )}

      {languageTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {fields.map((field) => (
            <TextField
              key={field.id}
              label={field.label}
              size="small"
              fullWidth
              value={field.value?.en || ''}
              onChange={(e) => {
                field.onChange({
                  ...(field.value || {}),
                  en: e.target.value
                });
              }}
              multiline={field.multiline}
              rows={field.rows}
              placeholder={field.placeholder}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TabbedTranslatableFields;
