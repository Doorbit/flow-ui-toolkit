import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { PatternLibraryElement } from '../../../models/listingFlow';
import { TranslatableField } from '../common/TranslatableField';

interface CustomElementEditorProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Spezialisierte Komponente für die Bearbeitung von CustomUIElement-Eigenschaften.
 * Unterstützt die Bearbeitung von Eigenschaften wie Typ, Titel und Beschreibung.
 */
const CustomElementEditor: React.FC<CustomElementEditorProps> = ({ element, onUpdate }) => {
  // Handler für Änderungen an Textfeldern
  const handleTextChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedElement = { ...element };
    const elementAny = updatedElement.element as any;
    elementAny[field] = event.target.value;

    onUpdate(updatedElement);
  };

  // Handler für Änderungen an Auswahlfeldern
  const handleSelectChange = (field: string) => (event: SelectChangeEvent) => {
    const updatedElement = { ...element };
    const elementAny = updatedElement.element as any;
    elementAny[field] = event.target.value;

    onUpdate(updatedElement);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1">Benutzerdefinierte Komponente</Typography>

      <FormControl fullWidth size="small">
        <InputLabel>Typ</InputLabel>
        <Select
          value={(element.element as any).custom_type || ''}
          onChange={handleSelectChange('custom_type')}
          label="Typ"
        >
          <MenuItem value="Scanner">Scanner</MenuItem>
          <MenuItem value="Address">Adresse</MenuItem>
          <MenuItem value="Location">Standort</MenuItem>
          <MenuItem value="Environment">Umgebung</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="ID"
        value={(element.element as any).id || ''}
        onChange={handleTextChange('id')}
        fullWidth
        variant="outlined"
        size="small"
      />

      <TranslatableField
        label="Titel"
        value={(element.element as any).title || { de: '', en: '' }}
        onChange={(value) => {
          const updatedElement = { ...element };
          const elementAny = updatedElement.element as any;
          elementAny.title = value;
          onUpdate(updatedElement);
        }}
      />

      <TranslatableField
        label="Beschreibung"
        value={(element.element as any).description || { de: '', en: '' }}
        onChange={(value) => {
          const updatedElement = { ...element };
          const elementAny = updatedElement.element as any;
          elementAny.description = value;
          onUpdate(updatedElement);
        }}
        multiline
        rows={2}
      />

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Hinweis: Unterelemente (sub_flows) können über den Tab "Unterelemente" bearbeitet werden.
      </Typography>
    </Box>
  );
};

export default CustomElementEditor;
