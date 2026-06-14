import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
} from '@mui/material';
import { PatternLibraryElement } from '../../../models/listingFlow';
import { ContactUIElement } from '../../../models/uiElements';
import TabbedTranslatableFields from '../common/TabbedTranslatableFields';
import { AccordionSection } from '../common/AccordionSection';
import { ElementTypeIndicator } from '../common/ElementTypeIndicator';
import IconField from '../common/IconField';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import TitleIcon from '@mui/icons-material/Title';
import TuneIcon from '@mui/icons-material/Tune';

interface ContactElementEditorProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}

/**
 * Editor-Komponente für ContactUIElement (Kontakt-/Identitäts-Karte).
 */
const ContactElementEditor: React.FC<ContactElementEditorProps> = ({ element, onUpdate }) => {
  const contactElement = element.element as ContactUIElement;
  const [languageTab, setLanguageTab] = useState(0);

  const update = (updates: Partial<ContactUIElement>) => {
    onUpdate({ ...element, element: { ...contactElement, ...updates } });
  };

  return (
    <>
      <ElementTypeIndicator
        type="Kontakt"
        icon={<ContactMailIcon fontSize="large" color="primary" />}
        description="Zeigt eine Kontakt-/Identitäts-Karte an (z. B. den zuständigen Berater)"
      />

      <AccordionSection title="Grundlegende Informationen" icon={<TitleIcon />} defaultExpanded={true}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TabbedTranslatableFields
            fields={[
              {
                id: 'title',
                label: 'Titel',
                value: contactElement.title,
                onChange: (value) => update({ title: value }),
              },
              {
                id: 'description',
                label: 'Beschreibung',
                value: contactElement.description,
                onChange: (value) => update({ description: value }),
                multiline: true,
                rows: 2,
              },
            ]}
            languageTab={languageTab}
            onLanguageTabChange={(newValue) => setLanguageTab(newValue)}
          />

          <IconField value={contactElement.icon || ''} onChange={(value) => update({ icon: value })} />
        </Box>
      </AccordionSection>

      <AccordionSection title="Inhalt & Verhalten" icon={<TuneIcon />} defaultExpanded={true}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="contact-identity-type-label">Identitätstyp</InputLabel>
            <Select
              labelId="contact-identity-type-label"
              label="Identitätstyp"
              value={contactElement.identity_type || 'USER_ID'}
              onChange={(e: SelectChangeEvent) => update({ identity_type: e.target.value })}
            >
              <MenuItem value="USER_ID">Benutzer (USER_ID)</MenuItem>
              <MenuItem value="EDITOR_ID">Bearbeiter (EDITOR_ID)</MenuItem>
              <MenuItem value="BILLING_GROUP_ID">Abrechnungsgruppe (BILLING_GROUP_ID)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Feld-ID (field_value)"
            size="small"
            fullWidth
            value={contactElement.field_value?.field_id?.field_name || ''}
            onChange={(e) =>
              update({ field_value: { field_id: { field_name: e.target.value } } })
            }
            helperText="Feld, das die anzuzeigende Identität referenziert."
          />

          <FormControlLabel
            control={
              <Switch
                checked={!!contactElement.show_name}
                onChange={(e) => update({ show_name: e.target.checked })}
              />
            }
            label="Name anzeigen"
          />
          <FormControlLabel
            control={
              <Switch
                checked={!!contactElement.show_picture}
                onChange={(e) => update({ show_picture: e.target.checked })}
              />
            }
            label="Bild anzeigen"
          />
          <FormControlLabel
            control={
              <Switch
                checked={!!contactElement.show_details}
                onChange={(e) => update({ show_details: e.target.checked })}
              />
            }
            label="Details anzeigen"
          />
        </Box>
      </AccordionSection>
    </>
  );
};

export default ContactElementEditor;
