import React, { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
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
  FormControlLabel,
  Alert,
  DialogContentText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InfoIcon from '@mui/icons-material/Info';
import { Page, VisibilityCondition, RelationalFieldOperator, LogicalOperator } from '../../models/listingFlow';
import IconSelector from '../IconSelector/IconSelector';
import Icon from '@mdi/react';
import { getIconPath } from '../../utils/mdiIcons';
import { useFieldValues } from '../../context/FieldValuesContext';
import { useEditor } from '../../context/EditorContext';
import VisibilityConditionBuilder from '../HybridEditor/VisibilityConditionBuilder';
import { toBuilderFormat, fromBuilderFormat, BuilderCondition } from '../../utils/visibilityConverters';
import { transformEditPageToViewPage } from '../../utils/viewModeTransformer';
import { tokens } from '../../theme/tokens';
import LayoutPreview from './LayoutPreview';
import {
  SUPPORTED_PAGE_LAYOUTS,
  PAGE_LAYOUT_STANDARD,
  isSupportedLayout,
  layoutForPersistence,
} from './pageLayouts';

interface EditPageDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (updatedPage: Page, viewPage?: Page) => void;
  page: Page;
  pages: Page[]; // Alle Edit-Seiten für Referenzierung
  viewPages: Page[]; // Alle View-Seiten für Toggle-Initialisierung
  isEditPage: boolean; // Ob es sich um eine Edit- oder View-Seite handelt
}

const EditPageDialog: React.FC<EditPageDialogProps> = ({
  open,
  onClose,
  onSave,
  page,
  pages: _pages = [],
  viewPages: _viewPages = [],
  isEditPage = true
}) => {
  const [titleDe, setTitleDe] = useState(page.title?.de || '');
  const [titleEn, setTitleEn] = useState(page.title?.en || '');
  const [icon, setIcon] = useState(page.icon || '');
  // Layout treu zum gespeicherten Wert; abwesendes layout = Standard (leerer String im Select).
  const [layout, setLayout] = useState<string>(page.layout ?? PAGE_LAYOUT_STANDARD);
  const [moduleId, setModuleId] = useState(page.module_id || '');
  const [iconSelectorOpen, setIconSelectorOpen] = useState(false);
  const [visibilityCondition, setVisibilityCondition] = useState<VisibilityCondition | undefined>(page.visibility_condition);
  const [builderCondition, setBuilderCondition] = useState<BuilderCondition | undefined>(toBuilderFormat(page.visibility_condition));
  const [childElementsHaveVisibilityConditions, setChildElementsHaveVisibilityConditions] = useState<boolean>(false);
  const [childVisibilityConditions, setChildVisibilityConditions] = useState<VisibilityCondition[]>([]);

  // Neuer State für "Im View-Modus anzeigen" Toggle
  const [includeInViewMode, setIncludeInViewMode] = useState(() => {
    // Prüfe, ob eine View-Page existiert UND Elemente hat
    const viewPageId = page.id.replace('edit-', 'view-');
    const viewPage = _viewPages.find(p => p.id === viewPageId);
    return viewPage && viewPage.elements && viewPage.elements.length > 0;
  });

  // State für den Überschreib-Warnungsdialog
  const [overwriteWarningOpen, setOverwriteWarningOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { availableFields: _ } = useFieldValues();

  // Theme und Responsive Handling
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Funktion zum Prüfen, ob Unterelemente Sichtbarkeitsbedingungen haben
  const checkChildElementsForVisibilityConditions = React.useCallback((elements: any[]): VisibilityCondition[] => {
    const conditions: VisibilityCondition[] = [];

    if (!elements || elements.length === 0) return conditions;

    const checkElements = (elementsToCheck: any[]): VisibilityCondition[] => {
      const foundConditions: VisibilityCondition[] = [];

      elementsToCheck.forEach(element => {
        const elementData = element.element ? element.element : element;

        // Prüfe, ob das Element eine Sichtbarkeitsbedingung hat
        if (elementData.visibility_condition) {
          foundConditions.push(elementData.visibility_condition);
        }

        // Rekursiv für Unterelemente prüfen
        if (elementData.elements) {
          const childConditions = checkElements(elementData.elements);
          foundConditions.push(...childConditions);
        }

        // Prüfe auch Chips (für ChipGroupUIElement)
        if (elementData.chips) {
          const chipConditions = checkElements(elementData.chips);
          foundConditions.push(...chipConditions);
        }
      });

      return foundConditions;
    };

    return checkElements(elements);
  }, []);

  // Funktion zum Erstellen einer kombinierten Sichtbarkeitsbedingung aus Unterelementen
  const createCombinedVisibilityCondition = React.useCallback((conditions: VisibilityCondition[]): VisibilityCondition | undefined => {
    if (conditions.length === 0) return undefined;
    if (conditions.length === 1) return conditions[0];

    // Erstelle eine logische ODER-Verknüpfung aller Bedingungen
    return {
      operator_type: 'LO',
      operator: 'OR',
      conditions: conditions
    } as LogicalOperator;
  }, []);

  // Funktion zum Übernehmen der Sichtbarkeitsbedingungen von Unterelementen
  const promoteChildVisibilityConditionsToPage = React.useCallback(() => {
    const combinedCondition = createCombinedVisibilityCondition(childVisibilityConditions);
    setVisibilityCondition(combinedCondition);

    // Aktualisiere auch die Builder-Condition
    if (combinedCondition) {
      setTimeout(() => {
        setBuilderCondition(toBuilderFormat(combinedCondition));
      }, 0);
    }
  }, [childVisibilityConditions, createCombinedVisibilityCondition, setVisibilityCondition, setBuilderCondition]);

  // Prüfe beim Öffnen des Dialogs, ob Unterelemente Sichtbarkeitsbedingungen haben
  useEffect(() => {
    if (page.elements) {
      const conditions = checkChildElementsForVisibilityConditions(page.elements);
      setChildVisibilityConditions(conditions);
      setChildElementsHaveVisibilityConditions(conditions.length > 0);
    }
  }, [page, checkChildElementsForVisibilityConditions]);

  // Synchronisiere die Builder-Kondition mit der Visibility-Kondition
  useEffect(() => {
    if (visibilityCondition) {
      setBuilderCondition(toBuilderFormat(visibilityCondition));
    } else {
      setBuilderCondition(undefined);
    }
  }, [visibilityCondition]);

  // Handler für Änderungen an der Builder-Kondition
  const handleBuilderConditionChange = (newBuilderCondition: BuilderCondition) => {
    setBuilderCondition(newBuilderCondition);
    setVisibilityCondition(fromBuilderFormat(newBuilderCondition));
  };

  // Suche nach verfügbaren Feldern aus allen Seiten für die Standardbedingung
  const { state } = useEditor();
  const [availableFormFields, setAvailableFormFields] = useState<string[]>([]);

  // Sammle verfügbare Felder aus allen Seiten
  useEffect(() => {
    const fields: string[] = [];
    if (state.currentFlow && state.currentFlow.pages_edit) {
      state.currentFlow.pages_edit.forEach((page: Page) => {
        const collectFields = (elements: any[]) => {
          elements.forEach(element => {
            const elementData = element.element ? element.element : element;
            if (elementData.field_id && elementData.field_id.field_name) {
              fields.push(elementData.field_id.field_name);
            }
            // Rekursiv für Unterelemente
            if (elementData.elements) {
              collectFields(elementData.elements);
            }
            if (elementData.chips) {
              collectFields(elementData.chips);
            }
          });
        };

        if (page.elements) {
          collectFields(page.elements);
        }
      });
    }
    setAvailableFormFields(fields);
  }, [state.currentFlow]);

  // Handler für den Toggle der Sichtbarkeitsregel
  const handleVisibilityToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    logger.log("Toggle clicked:", event.target.checked);

    if (event.target.checked) {
      // Erstelle eine einfache Sichtbarkeitsregel mit einem gültigen Feldnamen, falls verfügbar
      const fieldName = availableFormFields.length > 0 ? availableFormFields[0] : 'pv_installed';

      const newCondition: RelationalFieldOperator = {
        operator_type: 'RFO',
        field_id: { field_name: fieldName },
        op: 'eq',
        value: true
      };

      // Setze erst die Visibility-Condition
      setVisibilityCondition(newCondition);
      // Dann die Builder-Condition, aber in einem separaten Update-Zyklus
      setTimeout(() => {
        setBuilderCondition(toBuilderFormat(newCondition));
      }, 0);
    } else {
      // Entferne die Sichtbarkeitsregel
      setVisibilityCondition(undefined);
      setBuilderCondition(undefined);
    }
  };

  // Default-Werte für neue Seiten
  const getDefaultPatternType = () => isEditPage ? "CustomUIElement" : "CustomUIElement";

  const handleSave = () => {
    const finalTitleDe = titleDe || page.id;
    const finalTitleEn = titleEn || page.id;

    const updatedPage: Page = {
      ...page,
      pattern_type: page.pattern_type || getDefaultPatternType(),
      title: {
        de: finalTitleDe,
        en: finalTitleEn
      },
      short_title: {
        de: finalTitleDe, // short_title wird automatisch mit title synchronisiert
        en: finalTitleEn  // short_title wird automatisch mit title synchronisiert
      },
      icon: icon,
      layout: layoutForPersistence(layout),
      module_id: moduleId || undefined,
      visibility_condition: visibilityCondition
    };

    // Generiere View-Page basierend auf Toggle
    let viewPage: Page | undefined;

    if (isEditPage && includeInViewMode) {
      // Automatische Transformation!
      viewPage = transformEditPageToViewPage(updatedPage);
    } else if (isEditPage && !includeInViewMode) {
      // Leere View-Page (wie bisher)
      viewPage = {
        ...updatedPage,
        id: updatedPage.id.replace('edit-', 'view-'),
        elements: [],
        related_pages: [{
          viewing_context: 'EDIT',
          page_id: updatedPage.id
        }]
      };
    }

    onSave(updatedPage, viewPage);
    onClose();
  };

  // Render the selected icon
  const renderSelectedIcon = () => {
    if (!icon) return null;

    // Prüfen, ob es sich um ein MDI-Icon handelt
    if (icon.startsWith('mdi')) {
      const iconPath = getIconPath(icon);
      return iconPath ? <Icon path={iconPath} size={1} /> : null;
    }

    // Fallback für alte Material UI Icons (sollte nicht mehr vorkommen)
    logger.warn(`Non-MDI icon found: ${icon}. Please use MDI icons instead.`);
    return null;
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle>Seite bearbeiten</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ mt: 1 }}>
            {/* Sichtbarkeitsregeln - jetzt vor den grundlegenden Einstellungen */}
            <Accordion sx={{ mt: 3, mb: 3 }} defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: !!visibilityCondition
                    ? tokens.accentBlue.bg
                    : (childElementsHaveVisibilityConditions ? tokens.status.warningBg : 'inherit'),
                  '&:hover': {
                    backgroundColor: !!visibilityCondition
                      ? tokens.accentBlue.border
                      : (childElementsHaveVisibilityConditions ? tokens.status.warningBorder : tokens.surface.subtle)
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography sx={{ flex: 1 }}>Bedingte Sichtbarkeit</Typography>
                  {!!visibilityCondition && (
                    <Tooltip title="Diese Seite hat eine bedingte Sichtbarkeitsregel, die bestimmt, wann sie angezeigt wird">
                      <VisibilityIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    </Tooltip>
                  )}
                  {!visibilityCondition && childElementsHaveVisibilityConditions && (
                    <Tooltip title="Unterelemente dieser Seite haben Sichtbarkeitsbedingungen, aber die Seite selbst nicht">
                      <InfoIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                    </Tooltip>
                  )}
                  {page.elements && page.elements.length > 0 && (
                    <Tooltip title="Diese Seite hat Unterelemente in der Hierarchie">
                      <AccountTreeIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                    </Tooltip>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!visibilityCondition}
                          onChange={handleVisibilityToggle}
                        />
                      }
                      label="Bedingte Sichtbarkeit aktivieren"
                    />

                    {/* Löschen-Button für Sichtbarkeitsregel */}
                    {!!visibilityCondition && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => {
                          setVisibilityCondition(undefined);
                          setBuilderCondition(undefined);
                        }}
                      >
                        Bedingte Sichtbarkeit löschen
                      </Button>
                    )}
                  </Box>

                  {/* Hinweis auf Sichtbarkeitsbedingungen in Unterelementen */}
                  {childElementsHaveVisibilityConditions && !visibilityCondition && (
                    <Alert
                      severity="info"
                      sx={{ mb: 2 }}
                      action={
                        <Button
                          color="primary"
                          size="small"
                          onClick={promoteChildVisibilityConditionsToPage}
                        >
                          Übernehmen
                        </Button>
                      }
                    >
                      <Typography variant="body2">
                        Diese Seite hat Unterelemente mit Sichtbarkeitsbedingungen, aber keine eigene Seitenbedingung.
                        Sie können die Bedingungen der Unterelemente auf die Seitenebene übernehmen.
                      </Typography>
                    </Alert>
                  )}

                  {!!visibilityCondition && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Bedingte Sichtbarkeitsregeln bestimmen, wann diese Seite angezeigt wird. Die Seite wird nur angezeigt, wenn die Bedingung erfüllt ist. Dies ist nicht zu verwechseln mit der Strukturnavigation, die es ermöglicht, durch die Hierarchie der Elemente zu navigieren.
                    </Typography>
                  )}

                  {!!visibilityCondition && (
                    <Box mt={2} sx={{ width: '100%', overflowX: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Erweiterte bedingte Sichtbarkeit
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Hier können Sie komplexe Bedingungen erstellen, z.B. wenn mindestens eine von mehreren Bedingungen erfüllt sein soll (ODER-Verknüpfung).
                      </Typography>

                      <VisibilityConditionBuilder
                        condition={builderCondition || {
                          operator: 'AND',
                          conditions: []
                        }}
                        onChange={handleBuilderConditionChange}
                      />
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Grundlegende Seiteneinstellungen */}
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Grundlegende Einstellungen
            </Typography>

            {/* Seiten-ID anzeigen (nicht editierbar) */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Seiten-ID
              </Typography>
              <Typography variant="body1">
                {page.id || 'Keine ID vorhanden'}
              </Typography>
            </Box>

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

            {/* Kurztitel ausgeblendet, um die UI nicht zu überfrachten */}

            {/* Layout-Auswahl mit Vorschau */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start',
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <FormControl fullWidth margin="dense" sx={{ flex: 1, mt: 0 }}>
                <InputLabel id="layout-select-label">Layout</InputLabel>
                <Select
                  labelId="layout-select-label"
                  id="layout-select"
                  value={layout}
                  label="Layout"
                  onChange={(e) => setLayout(e.target.value)}
                >
                  {SUPPORTED_PAGE_LAYOUTS.map((opt) => (
                    <MenuItem key={opt.value || 'standard'} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                  {!isSupportedLayout(layout) && (
                    <MenuItem value={layout} disabled>
                      {`⚠ Nicht unterstützt: ${layout}`}
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>
                  {SUPPORTED_PAGE_LAYOUTS.find((o) => o.value === layout)?.description ||
                    'Dieses Layout wird vom portal nicht gerendert — bitte ein unterstütztes Layout wählen.'}
                </FormHelperText>
              </FormControl>
              <Box sx={{ flexShrink: 0, pt: { xs: 0, sm: 1 } }}>
                <LayoutPreview layout={isSupportedLayout(layout) ? layout : PAGE_LAYOUT_STANDARD} />
              </Box>
            </Box>

            {/* Modul-Zuordnung — immer sichtbar, damit das modulare-Flows-Feature auffindbar ist */}
            <FormControl fullWidth margin="dense" sx={{ mb: 3 }}>
              <InputLabel id="page-module-select-label">Modul-Zuordnung</InputLabel>
              <Select
                labelId="page-module-select-label"
                id="page-module-select"
                value={moduleId}
                label="Modul-Zuordnung"
                onChange={(e) => setModuleId(e.target.value)}
              >
                <MenuItem value="">
                  <em>— Kein Modul —</em>
                </MenuItem>
                {(state.currentFlow?.modules ?? []).map((module) => (
                  <MenuItem key={module.id} value={module.id}>
                    {module.name?.de || module.name?.en || module.id}
                  </MenuItem>
                ))}
                {moduleId &&
                  !(state.currentFlow?.modules ?? []).some((m) => m.id === moduleId) && (
                    <MenuItem value={moduleId}>{`⚠ Unbekannt: ${moduleId}`}</MenuItem>
                  )}
              </Select>
              <FormHelperText>
                {(state.currentFlow?.modules?.length ?? 0) === 0
                  ? 'Noch keine Module definiert — über „Module" in der Kopfzeile anlegen.'
                  : 'Seite nur sichtbar, wenn das zugeordnete Modul aktiv ist.'}
              </FormHelperText>
            </FormControl>

            {/* Icon-Auswahl */}
            <Typography variant="subtitle1" gutterBottom>
              Icon
            </Typography>

            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 2
            }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  border: `1px solid ${tokens.neutral.border}`,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: { xs: 0, sm: 2 },
                  mb: { xs: 1, sm: 0 }
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

            {/* View-Modus Toggle - nur für Edit-Pages */}
            {isEditPage && (
              <Box sx={{ mt: 3, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!includeInViewMode}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Prüfe, ob die View-Page bereits manuell erstellte Inhalte hat
                          const viewPageId = page.id.replace('edit-', 'view-');
                          const existingViewPage = _viewPages.find(p => p.id === viewPageId);
                          const hasExistingContent =
                            existingViewPage &&
                            existingViewPage.elements &&
                            existingViewPage.elements.length > 0;

                          if (hasExistingContent) {
                            // Warnung anzeigen statt direkt zu überschreiben
                            setOverwriteWarningOpen(true);
                          } else {
                            setIncludeInViewMode(true);
                          }
                        } else {
                          setIncludeInViewMode(false);
                        }
                      }}
                      color="primary"
                    />
                  }
                  label="Im View-Modus anzeigen"
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block', mt: 0.5 }}>
                  Wenn aktiviert, werden die Elemente dieser Seite automatisch für den View-Modus transformiert
                  und als Tabellen/Galerien angezeigt. Sie müssen keine View-Elemente manuell erstellen!
                </Typography>
                {includeInViewMode && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Automatische Transformation:</strong> Ihre Input-Felder werden automatisch in
                      Anzeige-Elemente umgewandelt:
                    </Typography>
                    <Typography variant="body2" component="ul" sx={{ mt: 1, mb: 0 }}>
                      <li>Eingabefelder → Tabellen mit Schlüssel-Wert-Paaren</li>
                      <li>Datei-Uploads → Bildergalerien</li>
                      <li>Gruppen → Überschriften mit Tabellen</li>
                      <li>Scanner → Scanner-Referenz</li>
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}

            {/* Gelöscht: Duplikat der Sichtbarkeitsregeln, da diese bereits am Anfang eingefügt wurden */}
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

      {/* Warnungsdialog: Manuelle View-Page-Inhalte würden überschrieben */}
      <Dialog
        open={overwriteWarningOpen}
        onClose={() => setOverwriteWarningOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Vorhandene View-Inhalte überschreiben?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Diese View-Seite enthält bereits manuell erstellte Elemente. Wenn Sie die automatische
            Transformation aktivieren, werden diese Inhalte beim Speichern durch die automatisch
            generierten Elemente ersetzt.
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Manuell angepasste View-Elemente gehen dabei verloren und können nicht
            wiederhergestellt werden.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOverwriteWarningOpen(false)}>
            Abbrechen (Inhalte behalten)
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setIncludeInViewMode(true);
              setOverwriteWarningOpen(false);
            }}
          >
            Ja, automatisch transformieren
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditPageDialog;
