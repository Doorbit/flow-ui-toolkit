import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Page, RelatedPage, VisibilityCondition, RelationalFieldOperator, LogicalOperator } from '../../models/listingFlow';
import IconSelector from '../IconSelector/IconSelector';
import * as Icons from '@mui/icons-material';
import { useFieldValues } from '../../context/FieldValuesContext';

interface EditPageDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (updatedPage: Page) => void;
  page: Page;
  pages: Page[]; // Alle Seiten für Referenzierung
  isEditPage: boolean; // Ob es sich um eine Edit- oder View-Seite handelt
}

const EditPageDialog: React.FC<EditPageDialogProps> = ({
  open,
  onClose,
  onSave,
  page,
  pages = [],
  isEditPage = true
}) => {
  const [titleDe, setTitleDe] = useState(page.title?.de || '');
  const [titleEn, setTitleEn] = useState(page.title?.en || '');
  const [shortTitleDe, setShortTitleDe] = useState(page.short_title?.de || '');
  const [shortTitleEn, setShortTitleEn] = useState(page.short_title?.en || '');
  const [icon, setIcon] = useState(page.icon || '');
  const [layout, setLayout] = useState(page.layout || (isEditPage ? '2_COL_RIGHT_FILL' : '2_COL_RIGHT_WIDER'));
  const [relatedPageId, setRelatedPageId] = useState(
    page.related_pages && page.related_pages.length > 0 ? page.related_pages[0].page_id : ''
  );
  const [iconSelectorOpen, setIconSelectorOpen] = useState(false);
  const [visibilityCondition, setVisibilityCondition] = useState<VisibilityCondition | undefined>(page.visibility_condition);

  const { availableFields } = useFieldValues();

  // Standardwerte für neue Seiten
  const getDefaultPatternType = () => isEditPage ? "CustomUIElement" : "CustomUIElement";

  const handleSave = () => {
    const relatedPages: RelatedPage[] = relatedPageId ? [{
      viewing_context: isEditPage ? 'VIEW' : 'EDIT',
      page_id: relatedPageId
    }] : [];

    const updatedPage: Page = {
      ...page,
      pattern_type: page.pattern_type || getDefaultPatternType(),
      title: {
        de: titleDe || page.id,
        en: titleEn || page.id
      },
      short_title: {
        de: shortTitleDe,
        en: shortTitleEn
      },
      icon: icon,
      layout: layout,
      related_pages: relatedPages,
      visibility_condition: visibilityCondition
    };

    onSave(updatedPage);
    onClose();
  };

  // Render the selected icon
  const renderSelectedIcon = () => {
    if (!icon) return null;

    const IconComponent = (Icons as any)[icon];
    return IconComponent ? <IconComponent /> : null;
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Seite bearbeiten</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {/* Grundlegende Seiteneinstellungen */}
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Grundlegende Einstellungen
            </Typography>

            <TextField
              autoFocus
              margin="dense"
              id="title-de"
              label="Seitentitel (Deutsch)"
              type="text"
              fullWidth
              variant="outlined"
              value={titleDe}
              onChange={(e) => setTitleDe(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              id="title-en"
              label="Seitentitel (Englisch)"
              type="text"
              fullWidth
              variant="outlined"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              id="shortTitle-de"
              label="Kurztitel (Deutsch)"
              type="text"
              fullWidth
              variant="outlined"
              value={shortTitleDe}
              onChange={(e) => setShortTitleDe(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              id="shortTitle-en"
              label="Kurztitel (Englisch)"
              type="text"
              fullWidth
              variant="outlined"
              value={shortTitleEn}
              onChange={(e) => setShortTitleEn(e.target.value)}
              sx={{ mb: 3 }}
            />

            {/* Layout-Auswahl */}
            <FormControl fullWidth margin="dense" sx={{ mb: 3 }}>
              <InputLabel id="layout-select-label">Layout</InputLabel>
              <Select
                labelId="layout-select-label"
                id="layout-select"
                value={layout}
                label="Layout"
                onChange={(e) => setLayout(e.target.value)}
              >
                <MenuItem value="2_COL_RIGHT_FILL">2-spaltig (rechts gefüllt)</MenuItem>
                <MenuItem value="2_COL_RIGHT_WIDER">2-spaltig (rechts breiter)</MenuItem>
                <MenuItem value="2_COL_LEFT_WIDER">2-spaltig (links breiter)</MenuItem>
                <MenuItem value="1_COL">1-spaltig</MenuItem>
              </Select>
              <FormHelperText>
                Wähle das Layout für diese Seite (empfohlen: 2_COL_RIGHT_FILL für Edit, 2_COL_RIGHT_WIDER für View)
              </FormHelperText>
            </FormControl>

            {/* Verknüpfte Seite */}
            {pages.length > 0 && (
              <FormControl fullWidth margin="dense" sx={{ mb: 3 }}>
                <InputLabel id="related-page-select-label">Verknüpfte Seite</InputLabel>
                <Select
                  labelId="related-page-select-label"
                  id="related-page-select"
                  value={relatedPageId}
                  label="Verknüpfte Seite"
                  onChange={(e) => setRelatedPageId(e.target.value)}
                >
                  <MenuItem value="">Keine Verknüpfung</MenuItem>
                  {pages
                    .filter(p => p.id !== page.id)
                    .filter(p => isEditPage ? p.pattern_type !== "CustomUIElement" : p.pattern_type === "CustomUIElement")
                    .map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.title?.de || p.id} {isEditPage ? "(View)" : "(Edit)"}
                      </MenuItem>
                    ))
                  }
                </Select>
                <FormHelperText>
                  Verbinde diese {isEditPage ? "Edit" : "View"}-Seite mit einer entsprechenden {isEditPage ? "View" : "Edit"}-Seite
                </FormHelperText>
              </FormControl>
            )}

            {/* Icon-Auswahl */}
            <Typography variant="subtitle1" gutterBottom>
              Icon
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}
              >
                {renderSelectedIcon()}
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {icon || 'Kein Icon ausgewählt'}
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIconSelectorOpen(true)}
                >
                  Icon auswählen
                </Button>
              </Box>
            </Box>

            {/* Visibility-Bedingungen */}
            <Accordion sx={{ mt: 3 }}>
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
                    <Tooltip title="Diese Seite hat aktive Sichtbarkeitsregeln">
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
                            setVisibilityCondition(newCondition);
                          } else {
                            // Entferne die Sichtbarkeitsregel
                            setVisibilityCondition(undefined);
                          }
                        }}
                      />
                    }
                    label="Sichtbarkeitsregel aktivieren"
                  />

                  {!!visibilityCondition && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Sichtbarkeitsregeln bestimmen, wann diese Seite angezeigt wird. Die Seite wird nur angezeigt, wenn die Bedingung erfüllt ist.
                    </Typography>
                  )}

                  {visibilityCondition && visibilityCondition.operator_type === 'RFO' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                            setVisibilityCondition(updatedCondition);
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
                              op: e.target.value as 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte'
                            };
                            setVisibilityCondition(updatedCondition);
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
                                  setVisibilityCondition(updatedCondition);
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
                                setVisibilityCondition(updatedCondition);
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
                                setVisibilityCondition(updatedCondition);
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
                                setVisibilityCondition(updatedCondition);
                              }}
                            />
                          );
                        }
                      })()}
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>

      <IconSelector
        open={iconSelectorOpen}
        onClose={() => setIconSelectorOpen(false)}
        onSelectIcon={setIcon}
        currentIcon={icon}
      />
    </>
  );
};

export default EditPageDialog;
