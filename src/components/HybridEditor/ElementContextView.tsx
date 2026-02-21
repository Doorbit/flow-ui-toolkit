import React, { useState, useRef, useCallback } from 'react';
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
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Divider
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
import LayersClearIcon from '@mui/icons-material/LayersClear';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useDrag, useDrop } from 'react-dnd';

import { PatternLibraryElement } from '../../models/listingFlow';
import { arePathsEqual } from '../../utils/pathUtils';
import { getContainerType } from '../../context/EditorContext';
import { logger } from '../../utils/logger';

const ContextViewContainer = styled(Box)`
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
`;

const ElementCard = styled(Card)<{ $isSelected: boolean }>`
  margin-bottom: 1rem;
  border: 1px solid ${props => props.$isSelected ? '#009F64' : '#E0E0E0'};
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.$isSelected ? '#009F64' : '#009F64'};
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

/** DnD ItemType für Element-Karten */
const ItemTypes = {
  ELEMENT_CARD: 'ELEMENT_CARD',
};

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
  onAddElement?: (type: string, elementPath?: number[]) => void;
  // Multi-Selektion Props
  isSelectionMode?: boolean;
  selectedElementPaths?: number[][];
  onMultiSelect?: (path: number[]) => void;
  onUngroup?: (path: number[]) => void;
  onCopyToPage?: (path: number[]) => void;
  onExportToFile?: (path: number[]) => void;
}

// Hilfsfunktion zum Ermitteln des Icons basierend auf dem Elementtyp
export const getElementIcon = (elementType: string | undefined) => {
  if (!elementType) {
    return <ViewInArIcon />;
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
    return 'rgba(0, 159, 100, 0.1)';
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
    return true;
  }
  return ['GroupUIElement', 'ArrayUIElement', 'ChipGroupUIElement', 'CustomUIElement'].includes(elementType) ||
         elementType.includes('CustomUIElement_');
};

/**
 * Mapping von pattern_type auf benutzerfreundlichen Label-Namen.
 * Wird in der Element-Karte anstelle des technischen Typnamens angezeigt.
 */
const getElementTypeName = (patternType: string | undefined): string => {
  if (!patternType) return 'SubFlow';
  const match = elementTypes.find(e => e.type === patternType);
  return match ? match.label : patternType;
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

/**
 * Interface für die DnD-Drag-Item-Daten einer Element-Karte.
 */
interface DragItem {
  type: string;
  index: number;
  path: number[];
}

/**
 * Draggable Element-Karte mit useDrag und useDrop für Reorder-Funktionalität.
 */
const DraggableElementCard: React.FC<{
  index: number;
  element: PatternLibraryElement;
  fullPath: number[];
  currentPath: number[];
  elementsCount: number;
  isCardSelected: boolean;
  isCardMultiSelected: boolean;
  isSelectionMode: boolean;
  onMoveElement?: (sourceIndex: number, targetIndex: number, parentPath?: number[], sourcePath?: number[]) => void;
  onSelectElement: (path: number[]) => void;
  onMultiSelect?: (path: number[]) => void;
  onRemoveElement: (path: number[]) => void;
  onDuplicateElement: (path: number[]) => void;
  onDrillDown: (path: number[]) => void;
  onAddSubElement?: (parentPath: number[], type?: string) => void;
  onUngroup?: (path: number[]) => void;
  onCopyToPage?: (path: number[]) => void;
  onExportToFile?: (path: number[]) => void;
  onOpenElementTypeDialog: (path: number[]) => void;
}> = ({
  index,
  element,
  fullPath,
  currentPath,
  elementsCount,
  isCardSelected,
  isCardMultiSelected,
  isSelectionMode,
  onMoveElement,
  onSelectElement,
  onMultiSelect,
  onRemoveElement,
  onDuplicateElement,
  onDrillDown,
  onAddSubElement,
  onUngroup,
  onCopyToPage,
  onExportToFile,
  onOpenElementTypeDialog,
}) => {
  const elementType = element.element.pattern_type;

  // Overflow-Menü State
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchorEl);

  // Delete-Bestätigungsdialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Ref für DnD
  const cardRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // DnD: useDrag
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.ELEMENT_CARD,
    item: (): DragItem => ({
      type: ItemTypes.ELEMENT_CARD,
      index,
      path: fullPath,
    }),
    canDrag: () => !isSelectionMode && !!onMoveElement,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // DnD: useDrop
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.ELEMENT_CARD,
    hover: (item: DragItem, monitor) => {
      if (!cardRef.current || !onMoveElement) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      // Nicht auf sich selbst verschieben
      if (dragIndex === hoverIndex) return;

      // Nur Elemente auf gleicher Ebene verschieben
      const dragParent = item.path.slice(0, -1);
      const hoverParent = fullPath.slice(0, -1);
      if (dragParent.length !== hoverParent.length || !arePathsEqual(dragParent, hoverParent)) return;

      // Mausposition relativ zum Hover-Element berechnen
      const hoverBoundingRect = cardRef.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Nach unten ziehen: nur verschieben wenn Cursor unter der Mitte ist
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      // Nach oben ziehen: nur verschieben wenn Cursor über der Mitte ist
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      // Element verschieben
      if (currentPath.length === 0) {
        onMoveElement(dragIndex, hoverIndex);
      } else {
        onMoveElement(dragIndex, hoverIndex, currentPath, item.path);
      }

      // Index im Drag-Item aktualisieren
      item.index = hoverIndex;
      item.path = [...currentPath, hoverIndex];
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Refs verbinden: preview auf die Karte, drag auf den Handle
  preview(drop(cardRef));
  drag(dragHandleRef);

  // Bestimme, ob ein Element eine Visibility Condition hat
  const hasVisibilityCondition = (el: PatternLibraryElement) => {
    return !!el.element.visibility_condition;
  };

  // Bestimme den Anzeigenamen eines Elements
  const getDisplayName = (el: PatternLibraryElement, idx: number) => {
    if (!el.element.pattern_type && (el.element as any).type) {
      return (el.element as any).type || `SubFlow ${idx}`;
    }
    return el.element.title?.de ||
           el.element.title?.en ||
           `${el.element.pattern_type || 'Element'} ${idx}`;
  };

  // Bestimme, ob ein Element Unterelemente hat
  const hasChildren = (el: PatternLibraryElement) => {
    const containerType = getContainerType(el);

    if (containerType === 'subflow') {
      return (el.element as any).elements?.length > 0 || (el.element as any).sub_elements?.length > 0;
    }
    if (containerType === 'group' || containerType === 'array') {
      return (el.element as any).elements?.length > 0;
    }
    if (containerType === 'chipgroup') {
      return (el.element as any).chips?.length > 0;
    }
    if (containerType === 'custom') {
      if ((el.element as any).sub_flows) {
        return (el.element as any).sub_flows?.length > 0;
      }
      if ((el.element as any).elements) {
        return (el.element as any).elements?.length > 0;
      }
    }
    return false;
  };

  /** Anzahl der Unterelemente berechnen */
  const getChildCount = (el: PatternLibraryElement): number => {
    const containerType = getContainerType(el);
    if (containerType === 'group' || containerType === 'array') {
      return (el.element as any).elements?.length || 0;
    }
    if (containerType === 'chipgroup') {
      return (el.element as any).chips?.length || 0;
    }
    if (containerType === 'custom' && (el.element as any).sub_flows) {
      return (el.element as any).sub_flows?.length || 0;
    }
    if (containerType === 'subflow') {
      return (el.element as any).elements?.length || 0;
    }
    return 0;
  };

  // Overflow-Menü Handler
  const handleMenuOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  // Delete-Bestätigungsdialog Handler
  const handleDeleteClick = useCallback(() => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  }, [handleMenuClose]);

  const handleDeleteConfirm = useCallback(() => {
    setDeleteDialogOpen(false);
    onRemoveElement(fullPath);
  }, [onRemoveElement, fullPath]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  // Doppelklick auf Container → Drill-Down
  const handleDoubleClick = useCallback(() => {
    if (canHaveChildren(elementType) && hasChildren(element)) {
      onDrillDown(fullPath);
    }
  }, [elementType, element, fullPath, onDrillDown]);

  const containerType = getContainerType(element);
  const childCount = getChildCount(element);
  const displayName = getDisplayName(element, index);
  const isContainer = canHaveChildren(elementType);
  const elementHasChildren = hasChildren(element);

  return (
    <>
      <ElementCard
        ref={cardRef}
        $isSelected={isSelectionMode ? isCardMultiSelected : isCardSelected}
        onClick={() => {
          if (isSelectionMode && onMultiSelect) {
            onMultiSelect(fullPath);
          } else {
            onSelectElement(fullPath);
          }
        }}
        onDoubleClick={handleDoubleClick}
        sx={{
          opacity: isDragging ? 0.4 : 1,
          cursor: isContainer && elementHasChildren ? 'pointer' : 'default',
          ...(isOver ? {
            borderTop: '3px solid #009F64',
          } : {}),
          ...(isSelectionMode && isCardMultiSelected ? {
            outline: '2px solid #1976d2',
            outlineOffset: '1px',
            backgroundColor: 'rgba(25, 118, 210, 0.04)'
          } : {}),
        }}
      >
        <ElementHeader color={getElementColor(elementType)}>
          {/* Drag-Handle oder Checkbox */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'action.active' }}>
            {isSelectionMode ? (
              <Checkbox
                checked={isCardMultiSelected}
                onChange={() => onMultiSelect && onMultiSelect(fullPath)}
                onClick={(e) => e.stopPropagation()}
                size="small"
                sx={{ p: 0, mr: 0.5 }}
              />
            ) : (
              <Box
                ref={dragHandleRef}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: onMoveElement ? 'grab' : 'default',
                  '&:active': { cursor: 'grabbing' },
                }}
              >
                <DragIndicatorIcon sx={{ opacity: onMoveElement ? 0.5 : 0.2, mr: 1 }} />
              </Box>
            )}
            {React.cloneElement(getElementIcon(elementType), { sx: { color: 'inherit' } })}
          </Box>

          {/* Titel */}
          <ElementTitle variant="subtitle2">
            {displayName}
          </ElementTitle>

          {/* Container-Typ-Badge (nur im Header) */}
          {isContainer && (
            <Tooltip title={`Container-Typ: ${containerType}`}>
              <Chip
                size="small"
                label={containerType}
                sx={{
                  height: '20px',
                  fontSize: '0.6rem',
                  mr: 1,
                  backgroundColor:
                    containerType === 'group' ? 'rgba(0, 159, 100, 0.1)' :
                    containerType === 'array' ? 'rgba(240, 91, 41, 0.1)' :
                    containerType === 'chipgroup' ? 'rgba(63, 81, 181, 0.1)' :
                    containerType === 'custom' ? 'rgba(0, 159, 100, 0.1)' :
                    containerType === 'subflow' ? 'rgba(0, 159, 100, 0.1)' :
                    'rgba(0, 0, 0, 0.1)'
                }}
              />
            </Tooltip>
          )}

          {/* Visibility-Icon (nur im Header) */}
          {hasVisibilityCondition(element) && (
            <Tooltip title="Hat Sichtbarkeitsregel">
              <VisibilityIcon
                fontSize="small"
                sx={{ mr: 1, opacity: 0.7, color: 'primary.main' }}
              />
            </Tooltip>
          )}

          {/* Verschiebe-Pfeile (nur wenn nicht in Selektionsmodus) */}
          {!isSelectionMode && onMoveElement && (
            <>
              {index > 0 && (
                <Tooltip title="Nach oben verschieben">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentPath.length === 0) {
                        onMoveElement(index, index - 1);
                      } else {
                        onMoveElement(index, index - 1, currentPath, fullPath);
                      }
                    }}
                    aria-label="Nach oben"
                    sx={{ color: 'action.active' }}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {index < elementsCount - 1 && (
                <Tooltip title="Nach unten verschieben">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentPath.length === 0) {
                        onMoveElement(index, index + 1);
                      } else {
                        onMoveElement(index, index + 1, currentPath, fullPath);
                      }
                    }}
                    aria-label="Nach unten"
                    sx={{ color: 'action.active' }}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}

          {/* Overflow-Menü (⋮) */}
          <Tooltip title="Aktionen">
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              aria-label={`Aktionen für ${displayName}`}
              sx={{ color: 'action.active' }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ElementHeader>

        <ElementContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Benutzerfreundlicher Typ-Name (ersetzt den technischen pattern_type-Chip) */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={getElementTypeName(elementType) || (element.element as any).type || 'Unknown'}
                sx={{
                  height: '20px',
                  fontSize: '0.6rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)'
                }}
              />
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
            {elementHasChildren && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  <strong>Unterelemente:</strong> {childCount}
                </Typography>
              </Box>
            )}
          </Box>
        </ElementContent>

        <ElementActions>
          {isContainer && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                if (onAddSubElement) {
                  logger.log('[ElementContextView] "Unterelement hinzufügen" Button geklickt, fullPath:', fullPath, 'currentPath:', currentPath);
                  if (elementType === 'ChipGroupUIElement') {
                    onAddSubElement(fullPath, 'BooleanUIElement');
                  } else {
                    onOpenElementTypeDialog(fullPath);
                  }
                }
              }}
            >
              Unterelement hinzufügen
            </Button>
          )}

          {elementHasChildren && (
            <Tooltip title="Zeigt die Unterelemente dieses Elements in der Hierarchie an">
              <Button
                size="small"
                startIcon={<AccountTreeIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDrillDown(fullPath);
                }}
                variant="contained"
                sx={{
                  backgroundColor:
                    containerType === 'group' ? '#009F64' :
                    containerType === 'array' ? '#F05B29' :
                    containerType === 'chipgroup' ? '#3F51B5' :
                    containerType === 'custom' ? '#009F64' :
                    containerType === 'subflow' ? '#009F64' :
                    '#009F64',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor:
                      containerType === 'group' ? '#008555' :
                      containerType === 'array' ? '#D04E24' :
                      containerType === 'chipgroup' ? '#303F9F' :
                      '#008555',
                  }
                }}
              >
                {containerType === 'group' ? 'Gruppe öffnen' :
                 containerType === 'array' ? 'Array öffnen' :
                 containerType === 'chipgroup' ? 'Chips anzeigen' :
                 containerType === 'custom' ? 'Custom-Element öffnen' :
                 containerType === 'subflow' ? 'Subflow öffnen' :
                 'Unterelemente anzeigen'}
              </Button>
            </Tooltip>
          )}

          {containerType === 'group' && onUngroup && (
            <Tooltip title="Löst die Gruppe auf und verschiebt die Unterelemente an die Stelle der Gruppe">
              <Button
                size="small"
                startIcon={<LayersClearIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onUngroup(fullPath);
                }}
                color="warning"
                variant="outlined"
                sx={{
                  borderColor: '#ED6C02',
                  color: '#ED6C02',
                }}
              >
                Gruppierung auflösen
              </Button>
            </Tooltip>
          )}
        </ElementActions>
      </ElementCard>

      {/* Overflow-Menü */}
      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { minWidth: 220 }
          }
        }}
      >
        {/* Verschieben-Aktionen */}
        {/* Copy-Aktionen */}
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onDuplicateElement(fullPath);
          }}
        >
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplizieren</ListItemText>
        </MenuItem>

        {onCopyToPage && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onCopyToPage(fullPath);
            }}
          >
            <ListItemIcon><DriveFileMoveOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Zu anderer Seite kopieren</ListItemText>
          </MenuItem>
        )}

        {onExportToFile && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onExportToFile(fullPath);
            }}
          >
            <ListItemIcon><FileDownloadIcon fontSize="small" /></ListItemIcon>
            <ListItemText>In Datei exportieren</ListItemText>
          </MenuItem>
        )}

        <Divider />

        {/* Delete-Aktion (rot) */}
        <MenuItem
          onClick={handleDeleteClick}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Löschen</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete-Bestätigungsdialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="error" />
          Element löschen?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie das Element <strong>„{displayName}"</strong> ({getElementTypeName(elementType)}) wirklich löschen?
          </DialogContentText>
          {isContainer && elementHasChildren && (
            <DialogContentText sx={{ mt: 1, color: 'error.main', fontWeight: 500 }}>
              ⚠ Dieses Element enthält {childCount} Unterelement{childCount !== 1 ? 'e' : ''}, die ebenfalls gelöscht werden.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            Abbrechen
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
  onAddElement,
  // Multi-Selektion Props
  isSelectionMode = false,
  selectedElementPaths = [],
  onMultiSelect,
  onUngroup,
  onCopyToPage,
  onExportToFile
}) => {
  const [elementTypeDialogOpen, setElementTypeDialogOpen] = useState(false);
  const [selectedElementForDialog, setSelectedElementForDialog] = useState<number[] | null>([]);

  // Bestimme den vollständigen Pfad für ein Element in der aktuellen Ansicht
  const getFullPath = (index: number) => {
    return [...currentPath, index];
  };

  // Bestimme, ob ein Element ausgewählt ist (Einzelselektion)
  const isSelected = (index: number) => {
    const fullPath = getFullPath(index);
    return arePathsEqual(fullPath, selectedElementPath);
  };

  // Bestimme, ob ein Element multi-selektiert ist
  const isMultiSelected = (index: number) => {
    const fullPath = getFullPath(index);
    return selectedElementPaths.some(p => arePathsEqual(p, fullPath));
  };

  // Handler für die Auswahl eines Elementtyps aus dem Dialog
  const handleSelectElementType = (type: string) => {
    logger.log('[ElementContextView handleSelectElementType] type:', type, 'selectedElementForDialog:', selectedElementForDialog, 'currentPath:', currentPath);

    if (onAddElement) {
      logger.log('[ElementContextView handleSelectElementType] Verwende onAddElement, selectedElementForDialog:', selectedElementForDialog);

      if (selectedElementForDialog === null) {
        logger.log('[ElementContextView handleSelectElementType] Füge Element auf aktueller Ebene hinzu, currentPath:', currentPath);
        onAddElement(type, currentPath);
      } else {
        onAddElement(type, selectedElementForDialog);
      }
    } else {
      if (selectedElementForDialog === null || (selectedElementForDialog && selectedElementForDialog.length === 0)) {
        if (onDropElement) {
          logger.log('[ElementContextView handleSelectElementType] Füge Element auf aktueller Ebene hinzu, currentPath:', currentPath);
          onDropElement(type, currentPath);
        }
      } else if (selectedElementForDialog) {
        if (onAddSubElement) {
          logger.log('[ElementContextView handleSelectElementType] Füge Unterelement hinzu, selectedElementForDialog:', selectedElementForDialog);
          onAddSubElement(selectedElementForDialog, type);
        }
      }
    }
    setElementTypeDialogOpen(false);
  };

  /** Handler für das Öffnen des Element-Typ-Dialogs von einer Unterkarte */
  const handleOpenElementTypeDialog = useCallback((path: number[]) => {
    setSelectedElementForDialog(path);
    setElementTypeDialogOpen(true);
  }, []);

  // Rendere die Elementkarten
  const renderElementCards = () => {
    logger.log('renderElementCards - elements:', elements);

    if (elements.length === 0) {
      logger.warn('renderElementCards - Keine Elemente zum Anzeigen');
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

      return (
        <DraggableElementCard
          key={index}
          index={index}
          element={element}
          fullPath={fullPath}
          currentPath={currentPath}
          elementsCount={elements.length}
          isCardSelected={isSelected(index)}
          isCardMultiSelected={isMultiSelected(index)}
          isSelectionMode={isSelectionMode}
          onMoveElement={onMoveElement}
          onSelectElement={onSelectElement}
          onMultiSelect={onMultiSelect}
          onRemoveElement={onRemoveElement}
          onDuplicateElement={onDuplicateElement}
          onDrillDown={onDrillDown}
          onAddSubElement={onAddSubElement}
          onUngroup={onUngroup}
          onCopyToPage={onCopyToPage}
          onExportToFile={onExportToFile}
          onOpenElementTypeDialog={handleOpenElementTypeDialog}
        />
      );
    });
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
                logger.log('[ElementContextView] "Element hinzufügen" Button geklickt, currentPath:', currentPath);
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
              logger.log('[ElementContextView] "Element hinzufügen" Button (EmptyState) geklickt, currentPath:', currentPath);
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
