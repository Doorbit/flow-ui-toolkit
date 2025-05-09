import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  // Grid wird nicht mehr verwendet
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ListIcon from '@mui/icons-material/List';
import AppsIcon from '@mui/icons-material/Apps';
import LabelIcon from '@mui/icons-material/Label';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import NumbersIcon from '@mui/icons-material/Numbers';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { PatternLibraryElement } from '../../models/listingFlow';
import { arePathsEqual } from '../../utils/pathUtils';

const ContextViewContainer = styled(Box)`
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
`;

const ElementCard = styled(Card)<{ isSelected: boolean }>`
  margin-bottom: 1rem;
  border: 1px solid ${props => props.isSelected ? '#009F64' : '#E0E0E0'};
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.isSelected ? '#009F64' : '#009F64'};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

interface ElementHeaderProps {
  color?: string;
}

const ElementHeader = styled(Box)<ElementHeaderProps>`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: ${props => props.color || '#F8FAFC'};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom: 1px solid #E0E0E0;
`;

const ElementTitle = styled(Typography)`
  font-weight: 500;
  flex-grow: 1;
  color: #2A2E3F;
`;

const ElementContent = styled(CardContent)`
  padding: 1rem;
`;

const ElementActions = styled(CardActions)`
  padding: 0.5rem;
  justify-content: flex-end;
  background-color: #F8FAFC;
`;

const EmptyState = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #E0E0E0;
  border-radius: 8px;
  margin-top: 1rem;
  background-color: #F8FAFC;
  text-align: center;
`;

const AddElementButton = styled(Button)`
  margin-top: 1rem;
  background-color: #43E77F;
  color: #000000;
  border: 1px solid #000000;

  &:hover {
    background-color: #35D870;
  }
`;

interface ElementContextViewProps {
  elements: PatternLibraryElement[];
  selectedElementPath: number[];
  currentPath: number[];
  onSelectElement: (path: number[]) => void;
  onRemoveElement: (path: number[]) => void;
  onDuplicateElement: (path: number[]) => void;
  onAddSubElement?: (parentPath: number[], type?: string) => void;
  onDropElement?: (type: string, parentPath?: number[]) => void;
  onMoveElement?: (sourceIndex: number, targetIndex: number, parentPath?: number[], sourcePath?: number[]) => void;
  onDrillDown: (path: number[]) => void;
}

// Hilfsfunktion zum Ermitteln des Icons basierend auf dem Elementtyp
export const getElementIcon = (elementType: string | undefined) => {
  if (!elementType) {
    // Handle the case when elementType is undefined (SubFlow)
    return <ViewInArIcon />; // Use the same icon as for CustomUIElement_SCANNER
  }

  switch (elementType) {
    case 'TextUIElement':
      return <TextFieldsIcon />;
    case 'BooleanUIElement':
      return <CheckBoxIcon />;
    case 'SingleSelectionUIElement':
      return <RadioButtonCheckedIcon />;
    case 'NumberUIElement':
      return <NumbersIcon />;
    case 'DateUIElement':
      return <CalendarTodayIcon />;
    case 'FileUIElement':
      return <AttachFileIcon />;
    case 'GroupUIElement':
      return <ViewModuleIcon />;
    case 'ArrayUIElement':
      return <ListIcon />;
    case 'ChipGroupUIElement':
      return <LabelIcon />;
    case 'CustomUIElement':
      return <AppsIcon />;
    case 'CustomUIElement_SCANNER':
      return <ViewInArIcon />;
    case 'CustomUIElement_ADDRESS':
      return <HomeIcon />;
    case 'CustomUIElement_LOCATION':
      return <LocationOnIcon />;
    case 'CustomUIElement_ADMIN_BOUNDARY':
      return <ApartmentIcon />;
    default:
      return <ViewModuleIcon />;
  }
};

// Hilfsfunktion zum Ermitteln der Hintergrundfarbe basierend auf dem Elementtyp
const getElementColor = (elementType: string | undefined) => {
  if (!elementType) {
    // Handle the case when elementType is undefined (SubFlow)
    return 'rgba(0, 159, 100, 0.1)'; // Same color as CustomUIElement
  } else if (elementType.includes('CustomUIElement')) {
    return 'rgba(0, 159, 100, 0.1)';
  } else if (elementType === 'GroupUIElement') {
    return 'rgba(0, 159, 100, 0.05)';
  } else if (elementType === 'ArrayUIElement') {
    return 'rgba(240, 91, 41, 0.05)';
  } else if (elementType === 'ChipGroupUIElement') {
    return 'rgba(63, 81, 181, 0.05)';
  }
  return '#F8FAFC';
};

// Hilfsfunktion zum Ermitteln, ob ein Element Unterelemente haben kann
const canHaveChildren = (elementType: string | undefined) => {
  if (!elementType) {
    // SubFlow objects can have children
    return true;
  }
  return ['GroupUIElement', 'ArrayUIElement', 'ChipGroupUIElement', 'CustomUIElement'].includes(elementType) ||
         elementType.includes('CustomUIElement_');
};

// Elementtypen für den Dialog
interface ElementType {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: 'basic' | 'complex';
}

// Elementtypen-Liste
const elementTypes: ElementType[] = [
  { type: 'TextUIElement', label: 'Text', icon: <TextFieldsIcon />, category: 'basic' },
  { type: 'BooleanUIElement', label: 'Boolean', icon: <CheckBoxIcon />, category: 'basic' },
  { type: 'SingleSelectionUIElement', label: 'Auswahl', icon: <RadioButtonCheckedIcon />, category: 'basic' },
  { type: 'NumberUIElement', label: 'Nummer', icon: <NumbersIcon />, category: 'basic' },
  { type: 'DateUIElement', label: 'Datum', icon: <CalendarTodayIcon />, category: 'basic' },
  { type: 'FileUIElement', label: 'Datei', icon: <AttachFileIcon />, category: 'basic' },
  { type: 'GroupUIElement', label: 'Gruppe', icon: <ViewModuleIcon />, category: 'complex' },
  { type: 'ArrayUIElement', label: 'Array', icon: <ListIcon />, category: 'complex' },
  { type: 'ChipGroupUIElement', label: 'Chip-Gruppe', icon: <LabelIcon />, category: 'complex' },
  { type: 'CustomUIElement_SCANNER', label: 'Scanner', icon: <ViewInArIcon />, category: 'complex' },
  { type: 'CustomUIElement_ADDRESS', label: 'Adresseingabe', icon: <HomeIcon />, category: 'complex' },
  { type: 'CustomUIElement_LOCATION', label: 'Standort/Karte', icon: <LocationOnIcon />, category: 'complex' },
  { type: 'CustomUIElement_ADMIN_BOUNDARY', label: 'Umgebungsinfos', icon: <ApartmentIcon />, category: 'complex' }
];

// Element-Typ-Dialog-Komponente
const ElementTypeDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSelectElementType: (type: string) => void;
}> = ({ open, onClose, onSelectElementType }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const basicElements = elementTypes.filter(e => e.category === 'basic');
  const complexElements = elementTypes.filter(e => e.category === 'complex');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Element hinzufügen</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Basis-Elemente" />
            <Tab label="Komplexe Elemente" />
          </Tabs>
        </Box>

        <Box>
          {tabIndex === 0 && (
            <List>
              {basicElements.map(element => (
                <ListItemButton
                  key={element.type}
                  onClick={() => {
                    onSelectElementType(element.type);
                    onClose();
                  }}
                >
                  <ListItemIcon>{element.icon}</ListItemIcon>
                  <ListItemText primary={element.label} />
                </ListItemButton>
              ))}
            </List>
          )}

          {tabIndex === 1 && (
            <List>
              {complexElements.map(element => (
                <ListItemButton
                  key={element.type}
                  onClick={() => {
                    onSelectElementType(element.type);
                    onClose();
                  }}
                >
                  <ListItemIcon>{element.icon}</ListItemIcon>
                  <ListItemText primary={element.label} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
      </DialogActions>
    </Dialog>
  );
};

const ElementContextView: React.FC<ElementContextViewProps> = ({
  elements,
  selectedElementPath,
  currentPath,
  onSelectElement,
  onRemoveElement,
  onDuplicateElement,
  onAddSubElement,
  onDropElement,
  onMoveElement,
  onDrillDown
}) => {
  const [elementTypeDialogOpen, setElementTypeDialogOpen] = useState(false);
  const [selectedElementForDialog, setSelectedElementForDialog] = useState<number[]>([]);
  // Bestimme den vollständigen Pfad für ein Element in der aktuellen Ansicht
  const getFullPath = (index: number) => {
    return [...currentPath, index];
  };

  // Bestimme, ob ein Element ausgewählt ist
  const isSelected = (index: number) => {
    const fullPath = getFullPath(index);
    return arePathsEqual(fullPath, selectedElementPath);
  };

  // Bestimme, ob ein Element eine Visibility Condition hat
  const hasVisibilityCondition = (element: PatternLibraryElement) => {
    return !!element.element.visibility_condition;
  };

  // Bestimme den Anzeigenamen eines Elements
  const getDisplayName = (element: PatternLibraryElement, index: number) => {
    console.log('getDisplayName - element:', element);

    // Handle SubFlow objects
    if (!element.element.pattern_type && (element.element as any).type) {
      return (element.element as any).type || `SubFlow ${index}`;
    }

    return element.element.title?.de ||
           element.element.title?.en ||
           `${element.element.pattern_type || 'Element'} ${index}`;
  };

  // Bestimme, ob ein Element Unterelemente hat
  const hasChildren = (element: PatternLibraryElement) => {
    const elementType = element.element.pattern_type;
    console.log('hasChildren - element:', element);
    console.log('hasChildren - elementType:', elementType);

    // Handle SubFlow objects
    if (!elementType && (element.element as any).type) {
      console.log('hasChildren - SubFlow - checking elements');
      const hasElements = (element.element as any).elements?.length > 0;
      console.log('hasChildren - SubFlow - hasElements:', hasElements);
      return hasElements;
    }

    if (elementType === 'GroupUIElement') {
      const hasElements = (element.element as any).elements?.length > 0;
      console.log('hasChildren - GroupUIElement - hasElements:', hasElements);
      return hasElements;
    } else if (elementType === 'ArrayUIElement') {
      const hasElements = (element.element as any).elements?.length > 0;
      console.log('hasChildren - ArrayUIElement - hasElements:', hasElements);
      return hasElements;
    } else if (elementType === 'ChipGroupUIElement') {
      const hasChips = (element.element as any).chips?.length > 0;
      console.log('hasChildren - ChipGroupUIElement - hasChips:', hasChips);
      return hasChips;
    } else if (elementType === 'CustomUIElement' && (element.element as any).sub_flows) {
      const hasSubFlows = (element.element as any).sub_flows?.length > 0;
      console.log('hasChildren - CustomUIElement - hasSubFlows:', hasSubFlows);
      return hasSubFlows;
    }

    console.log('hasChildren - no children found');
    return false;
  };

  // Rendere die Elementkarten
  const renderElementCards = () => {
    console.log('renderElementCards - elements:', elements);

    if (elements.length === 0) {
      console.warn('renderElementCards - Keine Elemente zum Anzeigen');
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Keine Elemente zum Anzeigen
          </Typography>
        </Box>
      );
    }

    return elements.map((element, index) => {
      const fullPath = getFullPath(index);
      const elementType = element.element.pattern_type;

      console.log('renderElementCards - element:', element);
      console.log('renderElementCards - elementType:', elementType);

      return (
        <ElementCard
          key={index}
          isSelected={isSelected(index)}
          onClick={() => onSelectElement(fullPath)}
        >
          <ElementHeader color={getElementColor(elementType)}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              <DragIndicatorIcon sx={{ opacity: 0.5, mr: 1 }} />
              {getElementIcon(elementType)}
            </Box>
            <ElementTitle variant="subtitle2">
              {getDisplayName(element, index)}
            </ElementTitle>

            {hasVisibilityCondition(element) && (
              <Tooltip title="Hat Sichtbarkeitsregel">
                <VisibilityIcon
                  fontSize="small"
                  color="primary"
                  sx={{ mr: 1, opacity: 0.7 }}
                />
              </Tooltip>
            )}

            {/* Pfeil nach oben - nur anzeigen, wenn nicht das erste Element */}
            {index > 0 && onMoveElement && (
              <Tooltip title="Nach oben verschieben">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Verschieben des Elements eine Position nach oben
                    if (currentPath.length === 0) {
                      // Auf oberster Ebene
                      onMoveElement(index, index - 1);
                    } else {
                      // In verschachtelter Ebene
                      onMoveElement(index, index - 1, currentPath, fullPath);
                    }
                  }}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Pfeil nach unten - nur anzeigen, wenn nicht das letzte Element */}
            {index < elements.length - 1 && onMoveElement && (
              <Tooltip title="Nach unten verschieben">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Verschieben des Elements eine Position nach unten
                    if (currentPath.length === 0) {
                      // Auf oberster Ebene
                      onMoveElement(index, index + 1);
                    } else {
                      // In verschachtelter Ebene
                      onMoveElement(index, index + 1, currentPath, fullPath);
                    }
                  }}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Duplizieren">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateElement(fullPath);
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Löschen">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveElement(fullPath);
                }}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ElementHeader>

          <ElementContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Typ: {elementType}
                </Typography>
              </Box>

              {/* Bedingte Anzeige von ID-Feldern basierend auf dem Elementtyp */}
              {elementType === 'CustomUIElement' && (element.element as any).id && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Seiten-ID: {(element.element as any).id}
                  </Typography>
                </Box>
              )}

              {/* Für Datenelemente die Feld-ID anzeigen */}
              {(elementType === 'BooleanUIElement' ||
                elementType === 'StringUIElement' ||
                elementType === 'NumberUIElement' ||
                elementType === 'SingleSelectionUIElement' ||
                elementType === 'DateUIElement') &&
                (element.element as any).field_id && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Feld-ID: {(element.element as any).field_id.field_name || (element.element as any).field_id}
                  </Typography>
                </Box>
              )}

              {/* Für FileUIElement beide ID-Felder anzeigen */}
              {elementType === 'FileUIElement' && (
                <>
                  {(element.element as any).id_field_id && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ID-Feld-ID: {(element.element as any).id_field_id.field_name || (element.element as any).id_field_id}
                      </Typography>
                    </Box>
                  )}
                  {(element.element as any).caption_field_id && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Beschriftungs-Feld-ID: {(element.element as any).caption_field_id.field_name || (element.element as any).caption_field_id}
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              {element.element.description?.de && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Beschreibung: {element.element.description.de}
                  </Typography>
                </Box>
              )}

              {hasVisibilityCondition(element) && (
                <Box>
                  <Chip
                    icon={<VisibilityIcon />}
                    label="Sichtbarkeitsregel"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          </ElementContent>

          <ElementActions>
            {canHaveChildren(elementType) && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddSubElement) {
                    // Bei ChipGroup automatisch ein BooleanUIElement hinzufügen, ohne Dialog anzuzeigen
                    if (elementType === 'ChipGroupUIElement') {
                      onAddSubElement(fullPath, 'BooleanUIElement');
                    } else {
                      // Speichern des aktuell ausgewählten Elements für den Dialog
                      // Dies wird später in handleSelectElementType verwendet
                      setSelectedElementForDialog(fullPath);
                      // Bei anderen Element-Typen den Dialog anzeigen
                      setElementTypeDialogOpen(true);
                    }
                  }
                }}
              >
                Unterelement hinzufügen
              </Button>
            )}

            {hasChildren(element) && (
              <Tooltip title="Zeigt die Unterelemente dieses Elements in der Hierarchie an">
                <Button
                  size="small"
                  startIcon={<AccountTreeIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDrillDown(fullPath);
                  }}
                  color="success"
                  variant="outlined"
                  sx={{ borderColor: '#009F64', color: '#009F64' }}
                >
                  Unterelemente anzeigen
                </Button>
              </Tooltip>
            )}
          </ElementActions>
        </ElementCard>
      );
    });
  };

  // Handler für die Auswahl eines Elementtyps aus dem Dialog
  const handleSelectElementType = (type: string) => {
    // Prüfe, ob auf aktueller Ebene oder als Unterelement hinzugefügt werden soll
    if (selectedElementForDialog.length === 0) {
      // Auf aktueller Navigationsebene hinzufügen (ausgelöst durch "Element hinzufügen"-Button)
      if (onDropElement) {
        onDropElement(type, currentPath);
      }
    } else {
      // Unterelement zu ausgewähltem Element hinzufügen (ausgelöst durch "Unterelement hinzufügen"-Button)
      if (onAddSubElement) {
        onAddSubElement(selectedElementForDialog, type);
      }
    }
    setElementTypeDialogOpen(false);
  };

  return (
    <ContextViewContainer>
      {/* Element-Typ-Dialog */}
      <ElementTypeDialog
        open={elementTypeDialogOpen}
        onClose={() => setElementTypeDialogOpen(false)}
        onSelectElementType={handleSelectElementType}
      />

      {elements.length > 0 ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" color="#2A2E3F">
              Elemente in dieser Ebene
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                // Zurücksetzen des selectedElementForDialog, um anzuzeigen, dass auf aktueller Ebene hinzugefügt wird
                setSelectedElementForDialog([]);
                setElementTypeDialogOpen(true);
              }}
              sx={{
                bgcolor: '#43E77F',
                color: '#000000',
                border: '1px solid #000000',
                '&:hover': {
                  bgcolor: '#35D870',
                }
              }}
            >
              Element hinzufügen
            </Button>
          </Box>

          {renderElementCards()}
        </>
      ) : (
        <EmptyState>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Elemente in dieser Ebene
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Fügen Sie ein neues Element hinzu, um zu beginnen.
          </Typography>
          <AddElementButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              // Zurücksetzen des selectedElementForDialog, um anzuzeigen, dass auf aktueller Ebene hinzugefügt wird
              setSelectedElementForDialog([]);
              setElementTypeDialogOpen(true);
            }}
          >
            Element hinzufügen
          </AddElementButton>
        </EmptyState>
      )}
    </ContextViewContainer>
  );
};

export default ElementContextView;
