import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Typography,
  Alert,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import IosShareIcon from '@mui/icons-material/IosShare';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { ListingFlow, PatternLibraryElement } from '../../models/listingFlow';
import { normalizeElementTypes } from '../../utils/normalizeUtils';
import { deepCloneElement, findVisibilityFieldReferences } from '../../utils/deepCloneUtils';
import { ensureUUIDs } from '../../utils/uuidUtils';
import { tokens } from '../../theme/tokens';

interface ExportElementToFileDialogProps {
  open: boolean;
  onClose: () => void;
  elementToExport: PatternLibraryElement | null;
  elementTitle: string;
}

/**
 * Dialog zum Exportieren eines Elements in eine andere JSON-Datei.
 * Der Benutzer wählt eine Zieldatei, eine Zielseite und die Einfügeposition.
 * Die modifizierte Zieldatei wird als neuer Download angeboten.
 * Der aktuelle Flow wird NICHT verändert.
 */
const ExportElementToFileDialog: React.FC<ExportElementToFileDialogProps> = ({
  open,
  onClose,
  elementToExport,
  elementTitle,
}) => {
  const [targetFlow, setTargetFlow] = useState<ListingFlow | null>(null);
  const [targetFileName, setTargetFileName] = useState<string>('');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const [error, setError] = useState<string | null>(null);
  const [visibilityWarning, setVisibilityWarning] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog-Zustand zurücksetzen
  const resetState = useCallback(() => {
    setTargetFlow(null);
    setTargetFileName('');
    setSelectedPageId(null);
    setPosition('bottom');
    setError(null);
    setVisibilityWarning([]);
  }, []);

  // Dialog schließen und zurücksetzen
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  // Datei auswählen
  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Datei verarbeiten
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTargetFileName(file.name);
    setError(null);
    setSelectedPageId(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const normalizedFlow = normalizeElementTypes(json);
        const flowWithUUIDs = ensureUUIDs(normalizedFlow);

        if (!flowWithUUIDs.pages_edit || flowWithUUIDs.pages_edit.length === 0) {
          setError('Die Zieldatei enthält keine Seiten (pages_edit ist leer).');
          setTargetFlow(null);
          return;
        }

        setTargetFlow(flowWithUUIDs);
      } catch (parseError) {
        setError(`Ungültiges JSON-Format: ${parseError}`);
        setTargetFlow(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  // Visibility-Referenzen prüfen, wenn Dialog geöffnet wird
  React.useEffect(() => {
    if (open && elementToExport) {
      const refs = findVisibilityFieldReferences(elementToExport);
      setVisibilityWarning(refs);
    }
  }, [open, elementToExport]);

  // Export durchführen
  const handleExport = useCallback(() => {
    if (!targetFlow || !selectedPageId || !elementToExport) return;

    // Element klonen mit neuen UUIDs, field_ids beibehalten (anderer Flow-Kontext)
    const clonedElement = deepCloneElement(elementToExport, {
      preserveFieldIds: true,
      regenerateUUIDs: true,
    });

    // Zielseite in pages_edit finden und Element einfügen
    const modifiedFlow: ListingFlow = JSON.parse(JSON.stringify(targetFlow));
    const targetPageIndex = modifiedFlow.pages_edit.findIndex(p => p.id === selectedPageId);
    if (targetPageIndex === -1) return;

    if (position === 'top') {
      modifiedFlow.pages_edit[targetPageIndex].elements.unshift(clonedElement);
    } else {
      modifiedFlow.pages_edit[targetPageIndex].elements.push(clonedElement);
    }

    // UUIDs sicherstellen und für Export vorbereiten
    const finalFlow = ensureUUIDs(modifiedFlow);

    // Download auslösen
    const json = JSON.stringify(finalFlow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Dateiname: original_modified.json
    const baseName = targetFileName.replace(/\.json$/i, '');
    a.download = `${baseName}_modified.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    handleClose();
  }, [targetFlow, selectedPageId, elementToExport, position, targetFileName, handleClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { minHeight: 400 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IosShareIcon sx={{ color: tokens.accentBlue.main }} />
        Element in andere JSON-Datei exportieren
      </DialogTitle>

      <DialogContent dividers>
        {/* Versteckter File-Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Element-Info */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: tokens.surface.appBg, borderRadius: 1, border: `1px solid ${tokens.neutral.border}` }}>
          <Typography variant="subtitle2" color="text.secondary">
            Element: <strong>{elementTitle}</strong>
          </Typography>
        </Box>

        {/* Visibility-Warnung */}
        {visibilityWarning.length > 0 && (
          <Alert
            severity="warning"
            icon={<WarningAmberIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" gutterBottom>
              Dieses Element enthält Sichtbarkeitsbedingungen, die auf folgende Felder verweisen:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {visibilityWarning.map((ref, idx) => (
                <Chip key={idx} label={ref} size="small" variant="outlined" color="warning" />
              ))}
            </Box>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Diese Felder existieren möglicherweise nicht in der Zieldatei.
            </Typography>
          </Alert>
        )}

        {/* Dateiauswahl-Button */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FolderOpenIcon />}
            onClick={handleFileSelect}
            sx={{ borderColor: tokens.accentBlue.main, color: tokens.accentBlue.main }}
          >
            {targetFlow ? 'Andere Zieldatei wählen' : 'Ziel-JSON-Datei auswählen'}
          </Button>

          {targetFileName && (
            <Chip
              icon={<DescriptionIcon />}
              label={targetFileName}
              variant="outlined"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        {/* Fehlermeldung */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Zieldatei-Info + Seitenauswahl */}
        {targetFlow && (
          <>
            <Box sx={{ mb: 2, p: 1.5, bgcolor: tokens.accentIndigo.bg, borderRadius: 1, border: `1px solid ${tokens.neutral.borderCool}` }}>
              <Typography variant="subtitle2" color="text.secondary">
                Zieldatei: <strong>{targetFlow.name || targetFlow.id || targetFileName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {targetFlow.pages_edit.length} Seite{targetFlow.pages_edit.length !== 1 ? 'n' : ''}
              </Typography>
            </Box>

            {/* Zielseiten-Auswahl */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Zielseite auswählen:
            </Typography>

            <List dense sx={{ maxHeight: 200, overflow: 'auto', border: `1px solid ${tokens.neutral.border}`, borderRadius: 1, mb: 2 }}>
              {targetFlow.pages_edit.map((page) => {
                const isSelected = selectedPageId === page.id;
                const pageTitle = page.title?.de || page.short_title?.de || page.id;
                const elementCount = page.elements?.length || 0;

                return (
                  <ListItem key={page.id} disablePadding>
                    <ListItemButton
                      dense
                      onClick={() => setSelectedPageId(page.id)}
                      selected={isSelected}
                      sx={{
                        bgcolor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                        '&:hover': { bgcolor: isSelected ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)' },
                        '&.Mui-selected': { bgcolor: 'rgba(25, 118, 210, 0.08)' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Radio
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                          size="small"
                          sx={{
                            color: tokens.accentBlue.main,
                            '&.Mui-checked': { color: tokens.accentBlue.main },
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={pageTitle}
                        secondary={`${elementCount} Element${elementCount !== 1 ? 'e' : ''}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: isSelected ? 600 : 400 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            <Divider sx={{ mb: 2 }} />

            {/* Position auswählen */}
            <FormControl component="fieldset">
              <FormLabel
                component="legend"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'text.primary',
                  '&.Mui-focused': { color: 'text.primary' },
                }}
              >
                Einfügeposition:
              </FormLabel>
              <RadioGroup
                row
                value={position}
                onChange={(e) => setPosition(e.target.value as 'top' | 'bottom')}
              >
                <FormControlLabel
                  value="top"
                  control={<Radio size="small" sx={{ color: tokens.accentBlue.main, '&.Mui-checked': { color: tokens.accentBlue.main } }} />}
                  label={<Typography variant="body2">Am Anfang der Seite</Typography>}
                />
                <FormControlLabel
                  value="bottom"
                  control={<Radio size="small" sx={{ color: tokens.accentBlue.main, '&.Mui-checked': { color: tokens.accentBlue.main } }} />}
                  label={<Typography variant="body2">Am Ende der Seite</Typography>}
                />
              </RadioGroup>
            </FormControl>
          </>
        )}

        {/* Leerer Zustand */}
        {!targetFlow && !error && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 3,
              color: 'text.secondary',
            }}
          >
            <IosShareIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">
              Wählen Sie eine Ziel-JSON-Datei aus, in die das Element exportiert werden soll.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Abbrechen
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={!selectedPageId || !targetFlow}
          startIcon={<IosShareIcon />}
          sx={{
            bgcolor: tokens.accentBlue.main,
            '&:hover': { bgcolor: tokens.accentBlue.dark },
            '&.Mui-disabled': { bgcolor: tokens.neutral.border },
          }}
        >
          Exportieren & Herunterladen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportElementToFileDialog;
