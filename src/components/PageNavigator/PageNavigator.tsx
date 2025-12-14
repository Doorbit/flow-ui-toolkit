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
  Typography
} from '@mui/material';
import {
  Add as AddIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { Page } from '../../models/listingFlow';
import { useEditor } from '../../context/EditorContext';
import { useFieldValues } from '../../context/FieldValuesContext';
import { evaluateVisibilityCondition } from '../../utils/visibilityUtils';
import PageTab from './PageTab';
import EditPageDialog from './EditPageDialog';

interface PageNavigatorProps {
  pages: Page[];
  selectedPageId: string | null;
}

const PageNavigator: React.FC<PageNavigatorProps> = ({ pages, selectedPageId }) => {
  const { dispatch } = useEditor();
  const { fieldValues } = useFieldValues();
  const [openNewPageDialog, setOpenNewPageDialog] = React.useState(false);
  const [newPageTitle, setNewPageTitle] = React.useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [pageToDelete, setPageToDelete] = React.useState<string | null>(null);
  const [editPageDialogOpen, setEditPageDialogOpen] = React.useState(false);
  const [pageToEdit, setPageToEdit] = React.useState<Page | null>(null);

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
  };

  const handleCreateNewPage = () => {
    const pageId = `edit-${uuidv4()}`;
    const pageTitleDe = newPageTitle || 'Neue Seite';
    const pageTitleEn = newPageTitle || 'New Page';
    const newPage: Page = {
      pattern_type: 'CustomUIElement',
      id: pageId,
      layout: '2_COL_RIGHT_FILL', // Default-Layout für Edit-Seiten
      title: { de: pageTitleDe, en: pageTitleEn },
      short_title: { de: pageTitleDe, en: pageTitleEn }, // short_title wird mit title synchronisiert
      elements: []
    };

    dispatch({ type: 'ADD_PAGE', page: newPage });
    setOpenNewPageDialog(false);
    setNewPageTitle('');
  };

  const handleConfirmDelete = () => {
    if (pageToDelete) {
      dispatch({ type: 'REMOVE_PAGE', pageId: pageToDelete });
      setDeleteConfirmOpen(false);
      setPageToDelete(null);
    }
  };

  // Handler für Seitenklick für den direkten Tab-Klick
  const handleTabClick = useCallback((pageId: string) => {
    dispatch({ type: 'SELECT_PAGE', pageId });
  }, [dispatch]);

  // Handler für Drag & Drop
  const handleMovePage = useCallback((dragIndex: number, hoverIndex: number) => {
    dispatch({ type: 'MOVE_PAGE', sourceIndex: dragIndex, targetIndex: hoverIndex });
  }, [dispatch]);

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setPageToDelete(null);
  };

  // Handler für Löschen einer Seite
  const handleDeletePage = (pageId: string) => {
    if (pages.length > 1) {
      setPageToDelete(pageId);
      setDeleteConfirmOpen(true);
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
    <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: '#F0F2F4' }}>
      <Tabs
        value={selectedPageId || (visiblePages.length > 0 ? visiblePages[0].id : false)}
        onChange={handlePageChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          flex: 1,
          '& .MuiTabs-indicator': {
            backgroundColor: '#009F64',
          },
          '& .MuiTab-root': {
            color: '#000000 !important',
            fontWeight: 500,
            '&.Mui-selected': {
              color: '#009F64 !important',
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

      <Tooltip title="Neue Seite hinzufügen">
        <IconButton
          onClick={handleAddPage}
          sx={{
            mx: 1,
            color: '#000000',
            bgcolor: '#43E77F',
            border: '1px solid #000000',
            '&:hover': {
              bgcolor: '#35D870',
            }
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      {/* Dialog für neue Seite */}
      <Dialog open={openNewPageDialog} onClose={handleCloseNewPageDialog}>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewPageDialog}>Abbrechen</Button>
          <Button onClick={handleCreateNewPage} variant="contained">Erstellen</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog für Seite löschen */}
      <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Seite löschen</DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie diese Seite löschen möchten? Alle Elemente auf dieser Seite werden gelöscht.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Abbrechen</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Löschen</Button>
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
          isEditPage={pageToEdit.id.startsWith('edit-') || !pageToEdit.id.includes('-')}
        />
      )}
    </Box>
  );
};

export default PageNavigator;
