import React, { useCallback, useEffect } from 'react';
import {
  Box,
  Tabs,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { Page } from '../../models/listingFlow';
import { useEditor } from '../../context/EditorContext';
import { useFieldValues } from '../../context/FieldValuesContext';
import { useFeedback } from '../../context/FeedbackContext';
import { evaluateVisibilityCondition } from '../../utils/visibilityUtils';
import PageTab from './PageTab';
import EditPageDialog from './EditPageDialog';
import ImportPagesDialog from './ImportPagesDialog';
import LayoutPreview from './LayoutPreview';
import { SUPPORTED_PAGE_LAYOUTS, layoutForPersistence } from './pageLayouts';
import { tokens } from '../../theme/tokens';

interface PageNavigatorProps {
  pages: Page[];
  selectedPageId: string | null;
}

const PageNavigator: React.FC<PageNavigatorProps> = ({ pages, selectedPageId }) => {
  const { dispatch, state } = useEditor();
  const { fieldValues } = useFieldValues();
  const { confirm, showWarning } = useFeedback();
  const [openNewPageDialog, setOpenNewPageDialog] = React.useState(false);
  const [newPageTitle, setNewPageTitle] = React.useState('');
  const [newPageLayout, setNewPageLayout] = React.useState<string>('2_COL_RIGHT_FILL');
  const [editPageDialogOpen, setEditPageDialogOpen] = React.useState(false);
  const [pageToEdit, setPageToEdit] = React.useState<Page | null>(null);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = React.useState<string | null>(null);

  // HINWEIS: Wir zeigen alle Seiten an, unabhängig von ihrer Visibility-Bedingung
  // Wir verwenden die Visibility-Bedingung nur noch für das Augensymbol, nicht zum Filtern
  const visiblePages = pages;

  // Hilfsfunktion, um zu prüfen, ob eine Seite gemäß Visibility-Bedingung sichtbar wäre
  const isPageVisible = (page: Page) => {
    if (!page.visibility_condition) {
      return true; // Wenn keine Bedingung, immer sichtbar
    }
    return evaluateVisibilityCondition(page.visibility_condition, fieldValues);
  };

  const handlePageChange = (_: React.SyntheticEvent, newPageId: string) => {
    dispatch({ type: 'SELECT_PAGE', pageId: newPageId });
  };

  const handleAddPage = () => {
    setOpenNewPageDialog(true);
  };

  const handleCloseNewPageDialog = () => {
    setOpenNewPageDialog(false);
    setNewPageTitle('');
    setNewPageLayout('2_COL_RIGHT_FILL');
  };

  const handleCreateNewPage = () => {
    const pageId = `edit-${uuidv4()}`;
    const pageTitleDe = newPageTitle || 'Neue Seite';
    const pageTitleEn = newPageTitle || 'New Page';
    const newPage: Page = {
      pattern_type: 'CustomUIElement',
      id: pageId,
      layout: layoutForPersistence(newPageLayout), // gewähltes Layout (Standard = kein Feld)
      title: { de: pageTitleDe, en: pageTitleEn },
      short_title: { de: pageTitleDe, en: pageTitleEn }, // short_title wird mit title synchronisiert
      elements: []
    };

    dispatch({ type: 'ADD_PAGE', page: newPage });
    handleCloseNewPageDialog();
  };

  const handleImportPages = useCallback((editPages: Page[], viewPages: Page[]) => {
    dispatch({ type: 'IMPORT_PAGES', payload: { editPages, viewPages } });
    setImportDialogOpen(false);
    setImportSuccessMessage(`${editPages.length} Seite(n) erfolgreich importiert.`);
  }, [dispatch]);

  // Handler für Seitenklick für den direkten Tab-Klick
  const handleTabClick = useCallback((pageId: string) => {
    dispatch({ type: 'SELECT_PAGE', pageId });
  }, [dispatch]);

  // Handler für Drag & Drop
  const handleMovePage = useCallback((dragIndex: number, hoverIndex: number) => {
    dispatch({ type: 'MOVE_PAGE', sourceIndex: dragIndex, targetIndex: hoverIndex });
  }, [dispatch]);

  // Handler für Löschen einer Seite
  const handleDeletePage = async (pageId: string) => {
    if (pages.length <= 1) {
      showWarning('Die letzte Seite kann nicht gelöscht werden.');
      return;
    }
    const ok = await confirm({
      title: 'Seite löschen?',
      message: 'Alle Elemente auf dieser Seite werden gelöscht.',
      confirmLabel: 'Löschen',
      destructive: true,
    });
    if (ok) {
      dispatch({ type: 'REMOVE_PAGE', pageId });
    }
  };

  // Handler für Bearbeiten einer Seite
  const handleEditPage = (page: Page) => {
    setPageToEdit(page);
    setEditPageDialogOpen(true);
  };

  // Handler für Speichern der bearbeiteten Seite
  const handleSaveEditedPage = (updatedPage: Page, viewPage?: Page) => {
    dispatch({ type: 'UPDATE_PAGE', page: updatedPage, viewPage });
    setEditPageDialogOpen(false);
    setPageToEdit(null);
  };

  // Handler für Schließen des Bearbeitungsdialogs
  const handleCloseEditDialog = () => {
    setEditPageDialogOpen(false);
    setPageToEdit(null);
  };

  // Wenn die aktuell ausgewählte Seite nicht mehr sichtbar ist, wähle die erste sichtbare Seite aus
  useEffect(() => {
    if (selectedPageId && visiblePages.length > 0) {
      const selectedPageVisible = visiblePages.some(page => page.id === selectedPageId);
      if (!selectedPageVisible) {
        dispatch({ type: 'SELECT_PAGE', pageId: visiblePages[0].id });
      }
    }
  }, [selectedPageId, visiblePages, dispatch]);

  // Bei leerer Seitenliste Hinweis anzeigen
  if (visiblePages.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Keine Seiten vorhanden
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddPage}
        >
          Erste Seite erstellen
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: tokens.surface.subtleAlt, gap: 1, px: 1 }}>
      <Tabs
        value={
          selectedPageId && visiblePages.some(p => p.id === selectedPageId)
            ? selectedPageId
            : (visiblePages.length > 0 ? visiblePages[0].id : false)
        }
        onChange={handlePageChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          flexGrow: 1,
          minWidth: 0, // Erlaubt Schrumpfen unter Flex-Kontext
          '& .MuiTabs-indicator': {
            backgroundColor: tokens.brand.green,
          },
          '& .MuiTab-root': {
            color: `${tokens.neutral.black} !important`,
            fontWeight: 500,
            maxWidth: 180, // Verhindert extrem breite Tabs
            minWidth: 100,
            '&.Mui-selected': {
              color: `${tokens.brand.green} !important`,
            }
          }
        }}
      >
        {visiblePages.map((page, index) => (
          <PageTab
            key={page.id}
            page={page}
            index={index}
            selectedPageId={selectedPageId}
            isLastPage={false}
            onDelete={handleDeletePage}
            onEdit={handleEditPage}
            onMove={handleMovePage}
            onClick={() => handleTabClick(page.id)}
            isVisible={isPageVisible(page)}
          />
        ))}
      </Tabs>

      {/* Fixierte Buttons RECHTS (immer sichtbar) */}
      <Tooltip title="Neue Seite hinzufügen">
        <IconButton
          onClick={handleAddPage}
          sx={{
            flexShrink: 0,
            color: tokens.neutral.black,
            bgcolor: tokens.brand.greenBright,
            border: `1px solid ${tokens.neutral.black}`,
            '&:hover': {
              bgcolor: tokens.brand.greenBrightStrong,
            }
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Seiten aus anderer JSON-Datei importieren">
        <IconButton
          onClick={() => setImportDialogOpen(true)}
          sx={{
            flexShrink: 0,
            color: tokens.neutral.black,
            bgcolor: tokens.accentBlue.lightSoft,
            border: `1px solid ${tokens.neutral.black}`,
            '&:hover': {
              bgcolor: tokens.accentBlue.light,
            }
          }}
        >
          <FileUploadIcon />
        </IconButton>
      </Tooltip>

      {/* Dialog für Seiten importieren */}
      <ImportPagesDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImportPages}
      />

      {/* Erfolgs-Snackbar für Import */}
      <Snackbar
        open={!!importSuccessMessage}
        autoHideDuration={4000}
        onClose={() => setImportSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setImportSuccessMessage(null)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {importSuccessMessage}
        </Alert>
      </Snackbar>

      {/* Dialog für neue Seite */}
      <Dialog open={openNewPageDialog} onClose={handleCloseNewPageDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Neue Seite erstellen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="page-title"
            label="Seitentitel"
            type="text"
            fullWidth
            variant="outlined"
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
          />

          {/* Layout-Auswahl mit Vorschau bereits bei der Anlage */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              mt: 2,
              flexDirection: { xs: 'column', sm: 'row' }
            }}
          >
            <FormControl fullWidth margin="dense" sx={{ flex: 1, mt: 0 }}>
              <InputLabel id="new-page-layout-label">Layout</InputLabel>
              <Select
                labelId="new-page-layout-label"
                id="new-page-layout"
                value={newPageLayout}
                label="Layout"
                onChange={(e) => setNewPageLayout(e.target.value)}
              >
                {SUPPORTED_PAGE_LAYOUTS.map((opt) => (
                  <MenuItem key={opt.value || 'standard'} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {SUPPORTED_PAGE_LAYOUTS.find((o) => o.value === newPageLayout)?.description}
              </FormHelperText>
            </FormControl>
            <Box sx={{ flexShrink: 0, pt: { xs: 0, sm: 1 } }}>
              <LayoutPreview layout={newPageLayout} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewPageDialog}>Abbrechen</Button>
          <Button onClick={handleCreateNewPage} variant="contained">Erstellen</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog für Seite bearbeiten */}
      {pageToEdit && (
        <EditPageDialog
          open={editPageDialogOpen}
          onClose={handleCloseEditDialog}
          onSave={handleSaveEditedPage}
          page={pageToEdit}
          pages={pages}
          viewPages={state.currentFlow?.pages_view || []}
          isEditPage={pageToEdit.id.startsWith('edit-') || !pageToEdit.id.includes('-')}
        />
      )}
    </Box>
  );
};

export default PageNavigator;
