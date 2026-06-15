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
  Checkbox,
  Typography,
  Alert,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DescriptionIcon from '@mui/icons-material/Description';

import { ListingFlow, Page } from '../../models/listingFlow';
import { normalizeElementTypes } from '../../utils/normalizeUtils';
import { deepClonePagePair, findCorrespondingViewPage } from '../../utils/deepCloneUtils';
import { ensureUUIDs } from '../../utils/uuidUtils';
import { tokens } from '../../theme/tokens';

interface ImportPagesDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (editPages: Page[], viewPages: Page[]) => void;
}

/**
 * Dialog zum Importieren von Seiten aus einer externen JSON-Datei.
 * Der Benutzer wählt eine Quelldatei, sieht die enthaltenen Seiten,
 * markiert die gewünschten Seiten und importiert sie in den aktuellen Flow.
 */
const ImportPagesDialog: React.FC<ImportPagesDialogProps> = ({
  open,
  onClose,
  onImport,
}) => {
  const [sourceFlow, setSourceFlow] = useState<ListingFlow | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string>('');
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog-Zustand zurücksetzen
  const resetState = useCallback(() => {
    setSourceFlow(null);
    setSourceFileName('');
    setSelectedPageIds([]);
    setError(null);
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

    setSourceFileName(file.name);
    setError(null);
    setSelectedPageIds([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        // JSON normalisieren (Element-Typen, field_ids etc.)
        const normalizedFlow = normalizeElementTypes(json);

        // UUIDs sicherstellen
        const flowWithUUIDs = ensureUUIDs(normalizedFlow);

        // Prüfen ob pages_edit vorhanden
        if (!flowWithUUIDs.pages_edit || flowWithUUIDs.pages_edit.length === 0) {
          setError('Die ausgewählte Datei enthält keine Seiten (pages_edit ist leer).');
          setSourceFlow(null);
          return;
        }

        setSourceFlow(flowWithUUIDs);
      } catch (parseError) {
        setError(`Ungültiges JSON-Format: ${parseError}`);
        setSourceFlow(null);
      }
    };
    reader.readAsText(file);

    // File-Input zurücksetzen für erneute Auswahl derselben Datei
    e.target.value = '';
  }, []);

  // Seitenauswahl togglen
  const handleTogglePage = useCallback((pageId: string) => {
    setSelectedPageIds(prev =>
      prev.includes(pageId)
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  }, []);

  // Alle auswählen / Auswahl aufheben
  const handleToggleAll = useCallback(() => {
    if (!sourceFlow) return;
    if (selectedPageIds.length === sourceFlow.pages_edit.length) {
      setSelectedPageIds([]);
    } else {
      setSelectedPageIds(sourceFlow.pages_edit.map(p => p.id));
    }
  }, [sourceFlow, selectedPageIds.length]);

  // Import durchführen
  const handleImport = useCallback(() => {
    if (!sourceFlow || selectedPageIds.length === 0) return;

    const clonedEditPages: Page[] = [];
    const clonedViewPages: Page[] = [];

    for (const editPageId of selectedPageIds) {
      const editPage = sourceFlow.pages_edit.find(p => p.id === editPageId);
      if (!editPage) continue;

      // Zugehörige View-Seite finden
      const viewPage = findCorrespondingViewPage(editPage, sourceFlow.pages_view || []);

      // Seitenpaar klonen (neue IDs, neue Element-UUIDs, field_ids beibehalten)
      const cloned = deepClonePagePair(editPage, viewPage);
      clonedEditPages.push(cloned.editPage);
      clonedViewPages.push(cloned.viewPage);
    }

    onImport(clonedEditPages, clonedViewPages);
    handleClose();
  }, [sourceFlow, selectedPageIds, onImport, handleClose]);

  const allSelected = sourceFlow ? selectedPageIds.length === sourceFlow.pages_edit.length : false;
  const someSelected = selectedPageIds.length > 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { minHeight: 400 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <UploadFileIcon sx={{ color: tokens.brand.green }} />
        Seiten importieren
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

        {/* Dateiauswahl-Button */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FolderOpenIcon />}
            onClick={handleFileSelect}
            sx={{ borderColor: tokens.brand.green, color: tokens.brand.green }}
          >
            {sourceFlow ? 'Andere Datei wählen' : 'JSON-Datei auswählen'}
          </Button>

          {sourceFileName && (
            <Chip
              icon={<DescriptionIcon />}
              label={sourceFileName}
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

        {/* Quelldatei-Info */}
        {sourceFlow && (
          <>
            <Box sx={{ mb: 2, p: 1.5, bgcolor: tokens.surface.appBg, borderRadius: 1, border: `1px solid ${tokens.neutral.border}` }}>
              <Typography variant="subtitle2" color="text.secondary">
                Quelldatei: <strong>{sourceFlow.name || sourceFlow.id || sourceFileName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sourceFlow.pages_edit.length} Seite{sourceFlow.pages_edit.length !== 1 ? 'n' : ''} gefunden
              </Typography>
            </Box>

            <Divider sx={{ mb: 1 }} />

            {/* Alle auswählen / Auswahl aufheben */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">
                Seiten zum Importieren auswählen:
              </Typography>
              <Button
                size="small"
                onClick={handleToggleAll}
                sx={{ color: tokens.brand.green }}
              >
                {allSelected ? 'Auswahl aufheben' : 'Alle auswählen'}
              </Button>
            </Box>

            {/* Seitenliste */}
            <List dense sx={{ maxHeight: 300, overflow: 'auto', border: `1px solid ${tokens.neutral.border}`, borderRadius: 1 }}>
              {sourceFlow.pages_edit.map((page) => {
                const isSelected = selectedPageIds.includes(page.id);
                const pageTitle = page.title?.de || page.short_title?.de || page.id;
                const elementCount = page.elements?.length || 0;

                return (
                  <ListItem key={page.id} disablePadding>
                    <ListItemButton
                      dense
                      onClick={() => handleTogglePage(page.id)}
                      sx={{
                        bgcolor: isSelected ? 'rgba(0, 159, 100, 0.05)' : 'transparent',
                        '&:hover': { bgcolor: isSelected ? 'rgba(0, 159, 100, 0.1)' : 'rgba(0, 0, 0, 0.04)' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                          sx={{
                            color: tokens.brand.green,
                            '&.Mui-checked': { color: tokens.brand.green },
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={pageTitle}
                        secondary={`${elementCount} Element${elementCount !== 1 ? 'e' : ''}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: isSelected ? 600 : 400 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      {page.icon && (
                        <Chip label={page.icon} size="small" variant="outlined" sx={{ ml: 1, fontSize: '0.7rem' }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            {someSelected && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {selectedPageIds.length} von {sourceFlow.pages_edit.length} Seite{selectedPageIds.length !== 1 ? 'n' : ''} ausgewählt
              </Typography>
            )}
          </>
        )}

        {/* Leerer Zustand: Keine Datei geladen */}
        {!sourceFlow && !error && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <UploadFileIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">
              Wählen Sie eine JSON-Datei aus, um Seiten zu importieren.
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
          onClick={handleImport}
          disabled={selectedPageIds.length === 0}
          sx={{
            bgcolor: tokens.brand.green,
            '&:hover': { bgcolor: tokens.brand.greenHoverAlt },
            '&.Mui-disabled': { bgcolor: tokens.neutral.border },
          }}
        >
          {selectedPageIds.length > 0
            ? `${selectedPageIds.length} Seite${selectedPageIds.length !== 1 ? 'n' : ''} importieren`
            : 'Importieren'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportPagesDialog;
