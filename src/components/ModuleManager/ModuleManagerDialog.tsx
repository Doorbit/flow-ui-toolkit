import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Icon from '@mdi/react';
import { getIconPath } from '../../utils/mdiIcons';
import { TabbedTranslatableFields } from '../PropertyEditor/common/TabbedTranslatableFields';
import IconField from '../PropertyEditor/common/IconField';
import { useEditor } from '../../context/EditorContext';
import { Module } from '../../models/listingFlow';

interface ModuleManagerDialogProps {
  open: boolean;
  onClose: () => void;
}

const SLUG_PATTERN = /^[a-z0-9_]+$/;

const emptyModule = (): Module => ({
  id: '',
  name: { de: '', en: '' },
  description: { de: '', en: '' },
  icon: '',
  default_active: false,
  delivery: 'INLINE',
});

/**
 * Verwaltet den Modul-Katalog des aktuellen Flows (ListingFlow.modules):
 * Module anlegen, bearbeiten und löschen. Module sind optional pro Projekt aktivierbar
 * (Aktivierungsfeld `module_<id>_active`); mit `module_id` getaggte Seiten/Elemente
 * werden nur sichtbar, wenn ihr Modul aktiv ist.
 */
const ModuleManagerDialog: React.FC<ModuleManagerDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { state, dispatch } = useEditor();

  const modules = state.currentFlow?.modules ?? [];

  // Editor-Sub-Dialog (Anlegen/Bearbeiten)
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editModule, setEditModule] = useState<Module>(emptyModule());
  const [languageTab, setLanguageTab] = useState(0);

  // Lösch-Bestätigung
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingId(null);
    setEditModule(emptyModule());
    setLanguageTab(0);
    setEditorOpen(true);
  };

  const handleOpenEdit = (module: Module) => {
    setEditingId(module.id);
    setEditModule({ ...module });
    setLanguageTab(0);
    setEditorOpen(true);
  };

  const idError = (() => {
    const id = editModule.id.trim();
    if (!id) return 'ID erforderlich';
    if (!SLUG_PATTERN.test(id)) return 'Nur Kleinbuchstaben, Ziffern und Unterstrich';
    if (modules.some(m => m.id === id && m.id !== editingId)) return 'ID bereits vergeben';
    return null;
  })();

  const handleSaveModule = () => {
    if (idError) return;
    const moduleToSave: Module = { ...editModule, id: editModule.id.trim() };
    if (editingId === null) {
      dispatch({ type: 'ADD_MODULE', module: moduleToSave });
    } else {
      dispatch({ type: 'UPDATE_MODULE', moduleId: editingId, updates: moduleToSave });
    }
    setEditorOpen(false);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      dispatch({ type: 'REMOVE_MODULE', moduleId: confirmDeleteId });
    }
    setConfirmDeleteId(null);
  };

  const renderModuleIcon = (iconName?: string) => {
    if (!iconName || !iconName.startsWith('mdi')) return null;
    const path = getIconPath(iconName);
    return path ? <Icon path={path} size={1} /> : null;
  };

  const isCatalog = editModule.delivery === 'CATALOG';

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
        <DialogTitle>Module verwalten</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Module sind optionale, pro Projekt aktivierbare Bausteine. Seiten und Elemente werden
            später per Modul-Zuordnung einem Modul zugewiesen und sind nur sichtbar, wenn das Projekt
            das Modul aktiviert hat.
          </Typography>

          {modules.length === 0 ? (
            <Box
              sx={{
                py: 4,
                textAlign: 'center',
                color: 'text.secondary',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">Noch keine Module angelegt.</Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {modules.map(module => (
                <Card key={module.id} variant="outlined">
                  <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        {renderModuleIcon(module.icon)}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" noWrap>
                            {module.name?.de || module.id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {module.id}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                        <Chip
                          size="small"
                          label={module.delivery || 'INLINE'}
                          color={module.delivery === 'CATALOG' ? 'info' : 'default'}
                          variant="outlined"
                        />
                        {module.default_active && (
                          <Chip size="small" label="Standard aktiv" color="success" variant="outlined" />
                        )}
                        <IconButton size="small" onClick={() => handleOpenEdit(module)} aria-label="Bearbeiten">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setConfirmDeleteId(module.id)}
                          aria-label="Löschen"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}

          <Button startIcon={<AddIcon />} onClick={handleOpenAdd} sx={{ mt: 2 }}>
            Modul hinzufügen
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Schließen</Button>
        </DialogActions>
      </Dialog>

      {/* Sub-Dialog: Modul anlegen / bearbeiten */}
      <Dialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle>{editingId === null ? 'Neues Modul' : 'Modul bearbeiten'}</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Modul-ID"
              size="small"
              fullWidth
              value={editModule.id}
              onChange={e => setEditModule({ ...editModule, id: e.target.value })}
              error={!!idError}
              helperText={idError || `Aktivierungsfeld: module_${editModule.id || '<id>'}_active`}
            />
            {editingId !== null && (
              <Typography variant="caption" color="warning.main">
                Achtung: Die ID ist der Schlüssel des Moduls. Beim Ändern werden bestehende
                Zuordnungen (module_id) automatisch mit-migriert.
              </Typography>
            )}

            <TabbedTranslatableFields
              fields={[
                {
                  id: 'name',
                  label: 'Name',
                  value: editModule.name,
                  onChange: value => setEditModule({ ...editModule, name: value }),
                },
                {
                  id: 'description',
                  label: 'Beschreibung',
                  value: editModule.description,
                  onChange: value => setEditModule({ ...editModule, description: value }),
                  multiline: true,
                  rows: 2,
                },
              ]}
              languageTab={languageTab}
              onLanguageTabChange={setLanguageTab}
            />

            <IconField
              value={editModule.icon || ''}
              onChange={value => setEditModule({ ...editModule, icon: value })}
              label="Icon"
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={!!editModule.default_active}
                  onChange={e => setEditModule({ ...editModule, default_active: e.target.checked })}
                />
              }
              label="Bei Projektanlage vorausgewählt"
            />

            <Divider />

            <FormControl size="small" fullWidth>
              <InputLabel id="module-delivery-label">Auslieferung</InputLabel>
              <Select
                labelId="module-delivery-label"
                label="Auslieferung"
                value={editModule.delivery || 'INLINE'}
                onChange={e =>
                  setEditModule({ ...editModule, delivery: e.target.value as 'INLINE' | 'CATALOG' })
                }
              >
                <MenuItem value="INLINE">INLINE (im Flow enthalten)</MenuItem>
                <MenuItem value="CATALOG">CATALOG (separat nachladbar)</MenuItem>
              </Select>
            </FormControl>

            {isCatalog && (
              <TextField
                label="Version"
                size="small"
                fullWidth
                value={editModule.version || ''}
                onChange={e => setEditModule({ ...editModule, version: e.target.value })}
                placeholder="z. B. 1.0.0"
                helperText="Semver-artige Version des CATALOG-Modul-Artefakts"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSaveModule} variant="contained" disabled={!!idError}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lösch-Bestätigung */}
      <Dialog open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Modul löschen?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Das Modul wird aus dem Katalog entfernt. Bestehende Zuordnungen (module_id) an Seiten und
            Elementen werden dabei gelöst — die betroffenen Inhalte bleiben erhalten und sind wieder
            modul-unabhängig sichtbar.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Abbrechen</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModuleManagerDialog;
