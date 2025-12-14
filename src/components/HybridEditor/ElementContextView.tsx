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
import InputIcon from '@mui/icons-material/Input';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { PatternLibraryElement } from '../../models/listingFlow';
import { arePathsEqual } from '../../utils/pathUtils';
import { getContainerType } from '../../context/EditorContext';

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
  onAddElement?: (type: string, elementPath?: number[]) => void; // Neue einheitliche Funktion für das Hinzufügen von Elementen
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
  { type: 'TextUIElement', label: 'Text (Anzeige)', icon: <TextFieldsIcon />, category: 'basic' },
  { type: 'StringUIElement', label: 'Texteingabe', icon: <InputIcon />, category: 'basic' },
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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
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
  onDrillDown,
  onAddElement
}) => {
  const [elementTypeDialogOpen, setElementTypeDialogOpen] = useState(false);
  const [selectedElementForDialog, setSelectedElementForDialog] = useState<number[] | null>([]);
  // Bestimme den vollständigen Pfad für ein Element in der aktuellen Ansicht
  const getFullPath = (index: number) => {
    return [...currentPath, index];
  };

  // Bestimme, ob ein Element ausgewählt ist
  const isSelected = (index: number) => {
    const fullPath = getFullPath(index);
    return arePathsEqual(fullPath, selectedElementPath);
  };

  // Hilfsfunktion, um zu prüfen, ob wir uns in einer tieferen Ebene befinden
  // Diese Funktion kann für zukünftige Erweiterungen verwendet werden
  // const isInNestedLevel = () => {
  //   return currentPath.length > 0;
  // };

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

    // Verwende getContainerType für eine einheitliche Erkennung
    const containerType = getContainerType(element);
    console.log('hasChildren - containerType:', containerType);

    // Handle SubFlow objects
    if (containerType === 'subflow') {
      console.log('hasChildren - SubFlow - checking elements and sub_elements');
      const hasElements = (element.element as any).elements?.length > 0;
      const hasSubElements = (element.element as any).sub_elements?.length > 0;
      console.log('hasChildren - SubFlow - hasElements:', hasElements, 'hasSubElements:', hasSubElements);
      return hasElements || hasSubElements;
    }

    // Handle Group and Array
    if (containerType === 'group' || containerType === 'array') {
      const hasElements = (element.element as any).elements?.length > 0;
      console.log(`hasChildren - ${containerType} - hasElements:`, hasElements);
      return hasElements;
    }

    // Handle ChipGroup
    if (containerType === 'chipgroup') {
      const hasChips = (element.element as any).chips?.length > 0;
      console.log('hasChildren - ChipGroupUIElement - hasChips:', hasChips);
      return hasChips;
    }

    // Handle CustomUIElement
    if (containerType === 'custom') {
      // Prüfe auf sub_flows
      if ((element.element as any).sub_flows) {
        const hasSubFlows = (element.element as any).sub_flows?.length > 0;
        console.log('hasChildren - CustomUIElement - hasSubFlows:', hasSubFlows);
        return hasSubFlows;
      }

      // Prüfe auf elements
      if ((element.element as any).elements) {
        const hasElements = (element.element as any).elements?.length > 0;
        console.log('hasChildren - CustomUIElement - hasElements:', hasElements);
        return hasElements;
      }
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
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'action.active' }}> {/* Standard Icon Farbe */}
              <DragIndicatorIcon sx={{ opacity: 0.5, mr: 1 }} />
              {React.cloneElement(getElementIcon(elementType), { sx: { color: 'inherit' } })}
            </Box>
            <ElementTitle variant="subtitle2">
              {getDisplayName(element, index)}
            </ElementTitle>

            {/* Container-Typ-Badge */}
            {canHaveChildren(elementType) && (
              <Tooltip title={`Container-Typ: ${getContainerType(element)}`}>
                <Chip
                  size="small"
                  label={getContainerType(element)}
                  sx={{
                    height: '20px',
                    fontSize: '0.6rem',
                    mr: 1,
                    backgroundColor:
                      getContainerType(element) === 'group' ? 'rgba(0, 159, 100, 0.1)' :
                      getContainerType(element) === 'array' ? 'rgba(240, 91, 41, 0.1)' :
                      getContainerType(element) === 'chipgroup' ? 'rgba(63, 81, 181, 0.1)' :
                      getContainerType(element) === 'custom' ? 'rgba(0, 159, 100, 0.1)' :
                      getContainerType(element) === 'subflow' ? 'rgba(0, 159, 100, 0.1)' :
                      'rgba(0, 0, 0, 0.1)'
                  }}
                />
              </Tooltip>
            )}

            {hasVisibilityCondition(element) && (
              <Tooltip title="Hat Sichtbarkeitsregel">
                <VisibilityIcon
                  fontSize="small"
                  sx={{ mr: 1, opacity: 0.7, color: 'primary.main' }} // Spezifische Farbe für dieses Icon beibehalten oder anpassen
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
                  sx={{ color: 'action.active' }} // Standard Icon Farbe
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
                  sx={{ color: 'action.active' }} // Standard Icon Farbe
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
                sx={{ color: 'action.active' }} // Standard Icon Farbe
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
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={elementType || (element.element as any).type || 'Unknown'}
                  sx={{
                    height: '20px',
                    fontSize: '0.6rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)'
                  }}
                />

                {/* Container-Typ anzeigen */}
                {canHaveChildren(elementType) && (
                  <Chip
                    size="small"
                    label={`Container: ${getContainerType(element)}`}
                    sx={{
                      height: '20px',
                      fontSize: '0.6rem',
                      backgroundColor:
                        getContainerType(element) === 'group' ? 'rgba(0, 159, 100, 0.1)' :
                        getContainerType(element) === 'array' ? 'rgba(240, 91, 41, 0.1)' :
                        getContainerType(element) === 'chipgroup' ? 'rgba(63, 81, 181, 0.1)' :
                        getContainerType(element) === 'custom' ? 'rgba(0, 159, 100, 0.1)' :
                        getContainerType(element) === 'subflow' ? 'rgba(0, 159, 100, 0.1)' :
                        'rgba(0, 0, 0, 0.1)'
                    }}
                  />
                )}

                {/* Sichtbarkeitsregel anzeigen */}
                {hasVisibilityCondition(element) && (
                  <Chip
                    size="small"
                    icon={<VisibilityIcon sx={{ fontSize: '0.8rem' }} />}
                    label="Sichtbarkeitsregel"
                    sx={{
                      height: '20px',
                      fontSize: '0.6rem',
                      backgroundColor: 'rgba(63, 81, 181, 0.1)'
                    }}
                  />
                )}
              </Box>

              {/* Bedingte Anzeige von ID-Feldern basierend auf dem Elementtyp */}
              <Box>
                {/* Für CustomUIElement die ID anzeigen */}
                {elementType === 'CustomUIElement' && (element.element as any).id && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    <strong>Seiten-ID:</strong> {(element.element as any).id}
                  </Typography>
                )}

                {/* Für Subflow den Typ anzeigen */}
                {!elementType && (element.element as any).type && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    <strong>Subflow-Typ:</strong> {(element.element as any).type}
                  </Typography>
                )}

                {/* Für Datenelemente die Feld-ID anzeigen */}
                {(elementType === 'BooleanUIElement' ||
                  elementType === 'StringUIElement' ||
                  elementType === 'NumberUIElement' ||
                  elementType === 'SingleSelectionUIElement' ||
                  elementType === 'DateUIElement') &&
                  (element.element as any).field_id && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    <strong>Feld-ID:</strong> {(element.element as any).field_id.field_name || (element.element as any).field_id}
                  </Typography>
                )}

                {/* Für FileUIElement beide ID-Felder anzeigen */}
                {elementType === 'FileUIElement' && (
                  <>
                    {(element.element as any).id_field_id && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        <strong>ID-Feld-ID:</strong> {(element.element as any).id_field_id.field_name || (element.element as any).id_field_id}
                      </Typography>
                    )}
                    {(element.element as any).caption_field_id && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        <strong>Beschriftungs-Feld-ID:</strong> {(element.element as any).caption_field_id.field_name || (element.element as any).caption_field_id}
                      </Typography>
                    )}
                  </>
                )}
              </Box>

              {/* Beschreibung anzeigen */}
              {element.element.description?.de && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    <strong>Beschreibung:</strong> {element.element.description.de}
                  </Typography>
                </Box>
              )}

              {/* Anzahl der Unterelemente anzeigen */}
              {hasChildren(element) && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    <strong>Unterelemente:</strong> {
                      getContainerType(element) === 'group' || getContainerType(element) === 'array' ?
                        ((element.element as any).elements?.length || 0) :
                      getContainerType(element) === 'chipgroup' ?
                        ((element.element as any).chips?.length || 0) :
                      getContainerType(element) === 'custom' && (element.element as any).sub_flows ?
                        ((element.element as any).sub_flows?.length || 0) :
                      getContainerType(element) === 'subflow' ?
                        ((element.element as any).elements?.length || 0) :
                        0
                    }
                  </Typography>
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
                    console.log('[ElementContextView] "Unterelement hinzufügen" Button geklickt, fullPath:', fullPath, 'currentPath:', currentPath);
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
                  sx={{
                    borderColor:
                      getContainerType(element) === 'group' ? '#009F64' :
                      getContainerType(element) === 'array' ? '#F05B29' :
                      getContainerType(element) === 'chipgroup' ? '#3F51B5' :
                      getContainerType(element) === 'custom' ? '#009F64' :
                      getContainerType(element) === 'subflow' ? '#009F64' :
                      '#009F64',
                    color:
                      getContainerType(element) === 'group' ? '#009F64' :
                      getContainerType(element) === 'array' ? '#F05B29' :
                      getContainerType(element) === 'chipgroup' ? '#3F51B5' :
                      getContainerType(element) === 'custom' ? '#009F64' :
                      getContainerType(element) === 'subflow' ? '#009F64' :
                      '#009F64'
                  }}
                >
                  {getContainerType(element) === 'group' ? 'Gruppe öffnen' :
                   getContainerType(element) === 'array' ? 'Array öffnen' :
                   getContainerType(element) === 'chipgroup' ? 'Chips anzeigen' :
                   getContainerType(element) === 'custom' ? 'Custom-Element öffnen' :
                   getContainerType(element) === 'subflow' ? 'Subflow öffnen' :
                   'Unterelemente anzeigen'}
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
    console.log('[ElementContextView handleSelectElementType] type:', type, 'selectedElementForDialog:', selectedElementForDialog, 'currentPath:', currentPath);

    // Wenn die neue einheitliche Funktion verfügbar ist, verwenden wir diese
    if (onAddElement) {
      console.log('[ElementContextView handleSelectElementType] Verwende onAddElement, selectedElementForDialog:', selectedElementForDialog);

      // Wenn selectedElementForDialog null ist, bedeutet das, dass wir auf der aktuellen Ebene hinzufügen wollen
      // In diesem Fall übergeben wir currentPath als elementPath
      if (selectedElementForDialog === null) {
        console.log('[ElementContextView handleSelectElementType] Füge Element auf aktueller Ebene hinzu, currentPath:', currentPath);
        onAddElement(type, currentPath);
      } else {
        // Ansonsten übergeben wir selectedElementForDialog als elementPath
        onAddElement(type, selectedElementForDialog);
      }
    }
    // Fallback auf die alten Funktionen, wenn onAddElement nicht verfügbar ist
    else {
      // Prüfe, ob auf aktueller Ebene oder als Unterelement hinzugefügt werden soll
      if (selectedElementForDialog === null || (selectedElementForDialog && selectedElementForDialog.length === 0)) {
        // Auf aktueller Navigationsebene hinzufügen (ausgelöst durch "Element hinzufügen"-Button)
        if (onDropElement) {
          // Hier wird der currentPath direkt an onDropElement übergeben
          console.log('[ElementContextView handleSelectElementType] Füge Element auf aktueller Ebene hinzu, currentPath:', currentPath);
          onDropElement(type, currentPath);
        }
      } else if (selectedElementForDialog) {
        // Unterelement zu ausgewähltem Element hinzufügen (ausgelöst durch "Unterelement hinzufügen"-Button)
        if (onAddSubElement) {
          // Hier wird der selectedElementForDialog an onAddSubElement übergeben
          console.log('[ElementContextView handleSelectElementType] Füge Unterelement hinzu, selectedElementForDialog:', selectedElementForDialog);
          onAddSubElement(selectedElementForDialog, type);
        }
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
                console.log('[ElementContextView] "Element hinzufügen" Button geklickt, currentPath:', currentPath);
                // Wir setzen selectedElementForDialog auf null, um anzuzeigen, dass auf aktueller Ebene hinzugefügt wird
                // Null ist ein spezieller Wert, der in handleSelectElementType erkannt wird
                setSelectedElementForDialog(null);
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fügen Sie ein neues Element hinzu, um zu beginnen.
          </Typography>
          <AddElementButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              console.log('[ElementContextView] "Element hinzufügen" Button (EmptyState) geklickt, currentPath:', currentPath);
              // Wir setzen selectedElementForDialog auf null, um anzuzeigen, dass auf aktueller Ebene hinzugefügt wird
              setSelectedElementForDialog(null);
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
