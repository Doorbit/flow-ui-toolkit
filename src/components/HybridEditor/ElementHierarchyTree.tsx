import React, { useState } from 'react';
import styled from 'styled-components';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  Box,
  Tooltip,
  Badge
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

import { PatternLibraryElement } from '../../models/listingFlow';
import { arePathsEqual } from '../../utils/pathUtils';
import { getSubElements, getContainerType } from '../../context/EditorContext'; // Importiere getSubElements und getContainerType

const LINE_COLOR = 'rgba(0, 0, 0, 0.23)'; // Farbe für die Verbindungslinien, ähnlich wie Divider

const TreeItem = styled(ListItem)<{ depth: number; isSelected: boolean; isLastChild?: boolean; hasChildren?: boolean }>`
  padding-left: ${props => props.depth * 20 + 8}px; // Erhöhte Einrückung
  background-color: ${props => props.isSelected ? 'rgba(0, 159, 100, 0.1)' : 'transparent'};
  border-left: ${props => props.isSelected ? '3px solid #009F64' : '3px solid transparent'};
  position: relative; // Für Pseudoelemente

  // Vertikale Linie von oben zum aktuellen Element
  &::before {
    content: '';
    position: absolute;
    left: ${props => props.depth * 20 - 10}px; // Positioniert auf der Höhe des Einzugs-Icons
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: ${LINE_COLOR};
    // Verstecke die Linie für das erste Element auf jeder Ebene, wenn es keine Geschwister darüber hat
    // oder wenn depth === 0 (oberste Ebene)
    display: ${props => props.depth === 0 ? 'none' : 'block'};
    height: ${props => props.isLastChild ? 'calc(50% - 0px)' : '100%'}; // Linie bis zur Mitte, wenn letztes Kind
  }

  // Horizontale Linie vom vertikalen Strich zum Inhalt (oder zum Aufklapp-Icon)
  // Diese Linie wird vor dem Aufklapp-Icon platziert
  .MuiIconButton-root:first-of-type::before {
    content: '';
    position: absolute;
    left: -10px; // Von der Mitte des Icons nach links
    top: 50%;
    width: 10px;
    height: 1px;
    background-color: ${LINE_COLOR};
    display: ${props => props.depth === 0 ? 'none' : 'block'};
  }

  // Spezielle Anpassung für den Platzhalter-Box, wenn keine Kinder da sind, um die Linie zu zeichnen
  .placeholder-for-line::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 50%;
    width: 10px;
    height: 1px;
    background-color: ${LINE_COLOR};
    display: ${props => props.depth === 0 ? 'none' : 'block'};
  }

  &:hover {
    background-color: ${props => props.isSelected ? 'rgba(0, 159, 100, 0.15)' : 'rgba(0, 159, 100, 0.05)'};
  }
`;

const TreeItemContent = styled(Box)`
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
`;

const TreeItemText = styled(ListItemText)`
  margin: 0;

  .MuiListItemText-primary {
    font-size: 0.875rem;
    color: #2A2E3F;
    font-weight: ${props => props.primary === 'true' ? 'bold' : 'normal'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

interface ElementHierarchyTreeProps {
  elements: PatternLibraryElement[];
  selectedPath: number[];
  onSelectElement: (path: number[]) => void;
  onDrillDown: (path: number[]) => void;
  currentPath: number[];
}

// Hilfsfunktion zum Ermitteln des Icons basierend auf dem Elementtyp
const getElementIcon = (elementType: string) => {
  switch (elementType) {
    case 'TextUIElement':
      return <TextFieldsIcon fontSize="small" />;
    case 'BooleanUIElement':
      return <CheckBoxIcon fontSize="small" />;
    case 'SingleSelectionUIElement':
      return <RadioButtonCheckedIcon fontSize="small" />;
    case 'NumberUIElement':
      return <NumbersIcon fontSize="small" />;
    case 'DateUIElement':
      return <CalendarTodayIcon fontSize="small" />;
    case 'FileUIElement':
      return <AttachFileIcon fontSize="small" />;
    case 'GroupUIElement':
      return <ViewModuleIcon fontSize="small" />;
    case 'ArrayUIElement':
      return <ListIcon fontSize="small" />;
    case 'ChipGroupUIElement':
      return <LabelIcon fontSize="small" />;
    case 'CustomUIElement':
      return <AppsIcon fontSize="small" />;
    case 'CustomUIElement_SCANNER':
      return <ViewInArIcon fontSize="small" />;
    case 'CustomUIElement_ADDRESS':
      return <HomeIcon fontSize="small" />;
    case 'CustomUIElement_LOCATION':
      return <LocationOnIcon fontSize="small" />;
    case 'CustomUIElement_ADMIN_BOUNDARY':
      return <ApartmentIcon fontSize="small" />;
    default:
      return <ChevronRightIcon fontSize="small" />;
  }
};

// Rekursive Komponente für Baumknoten
const TreeNode: React.FC<{
  element: PatternLibraryElement;
  path: number[];
  depth: number;
  selectedPath: number[];
  onSelectElement: (path: number[]) => void;
  onDrillDown: (path: number[]) => void;
  currentPath: number[];
  isLastChildInLevel: boolean; // Neue Prop
}> = ({
  element,
  path,
  depth,
  selectedPath,
  onSelectElement,
  onDrillDown,
  currentPath,
  isLastChildInLevel
}) => {
  const [expanded, setExpanded] = useState(false);
  const isSelected = arePathsEqual(path, selectedPath);
  const isInCurrentPath = path.length <= currentPath.length &&
                          path.every((value, index) => value === currentPath[index]);

  // Verwende die importierte getSubElements Funktion
  const children = React.useMemo(() => getSubElements(element), [element]);
  const hasActualChildren = children.length > 0;

  // Bestimme den Container-Typ des Elements
  const containerType = React.useMemo(() => getContainerType(element), [element]);

  // Bestimme, ob das Element eine Visibility Condition hat
  const hasVisibilityCondition = () => {
    // Sicherer Zugriff auf visibility_condition
    // Bei BooleanUIElements aus ChipGroups fehlt manchmal die normale PatternLibraryElement-Struktur
    if (!element || !element.element) {
      return false;
    }

    return !!element.element.visibility_condition;
  };

  const isVisible = hasVisibilityCondition();

  // Bestimme den Anzeigenamen des Elements
  const getDisplayName = () => {
    if (!element || !element.element) {
      return `Element ${path[path.length - 1]}`;
    }

    // Für Subflow-Elemente ohne pattern_type, aber mit type
    if (!element.element.pattern_type && (element.element as any).type) {
      return (element.element as any).title?.de ||
             (element.element as any).title?.en ||
             (element.element as any).type ||
             `SubFlow ${path[path.length - 1]}`;
    }

    return element.element.title?.de ||
           element.element.title?.en ||
           `${element.element.pattern_type || 'Element'} ${path[path.length - 1]}`;
  };

  // Automatisch expandieren, wenn das Element im aktuellen Pfad ist
  React.useEffect(() => {
    if (isInCurrentPath && hasActualChildren) { // Nur expandieren, wenn Kinder vorhanden sind
      setExpanded(true);
    }
  }, [isInCurrentPath, hasActualChildren]);

  // Automatisch expandieren, wenn der Knoten Teil des selectedPath ist oder ein Vorfahre davon
  React.useEffect(() => {
    if (selectedPath && selectedPath.length > 0 && hasActualChildren && !expanded) {
      const isNodeOrAncestorOfSelected =
        selectedPath.length >= path.length &&
        path.every((val, idx) => val === selectedPath[idx]);

      if (isNodeOrAncestorOfSelected) {
        setExpanded(true);
      }
    }
  }, [selectedPath, path, expanded, hasActualChildren]);


  return (
    <>
      <TreeItem
        depth={depth}
        isSelected={isSelected}
        isLastChild={isLastChildInLevel} // Prop für Styling der Linie
        hasChildren={hasActualChildren} // Prop für Styling der Linie
        onClick={() => onSelectElement(path)}
      >
        <TreeItemContent>
          {hasActualChildren ? (
            <IconButton
              size="small"
              sx={{ position: 'relative' }} // Für ::before Pseudoelement
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          ) : (
            // Platzhalter-Box, wenn keine Kinder, aber Linie benötigt wird
            <Box className="placeholder-for-line" sx={{ width: 28, position: 'relative' }} />
          )}

          <ListItemIcon sx={{ minWidth: 36 }}>
            {isVisible ? (
              <Badge
                color="primary"
                variant="dot"
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {getElementIcon(element?.element?.pattern_type || 'default')}
              </Badge>
            ) : (
              getElementIcon(element?.element?.pattern_type || 'default')
            )}
          </ListItemIcon>

          <TreeItemText
            primary={`${getDisplayName()}${hasActualChildren ? ` (${containerType})` : ''}`}
            slotProps={{
              primary: {
                noWrap: true,
                title: `${getDisplayName()}${hasActualChildren ? ` (${containerType})` : ''}` // Tooltip bei Überlauf
              }
            }}
          />

          {hasActualChildren && ( // Verwende hasActualChildren
            <Tooltip title={`${containerType === 'group' ? 'Gruppe öffnen' :
                             containerType === 'array' ? 'Array öffnen' :
                             containerType === 'chipgroup' ? 'Chips anzeigen' :
                             containerType === 'custom' ? 'Custom-Element öffnen' :
                             containerType === 'subflow' ? 'Subflow öffnen' :
                             'Unterelemente anzeigen'}`}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDrillDown(path);
                }}
                sx={{
                  ml: 'auto',
                  color: containerType === 'group' ? '#009F64' :
                         containerType === 'array' ? '#F05B29' :
                         containerType === 'chipgroup' ? '#3F51B5' :
                         containerType === 'custom' ? '#009F64' :
                         containerType === 'subflow' ? '#009F64' :
                         '#009F64'
                }}
              >
                <AccountTreeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {isVisible && (
            <Tooltip title="Hat Sichtbarkeitsregel">
              <VisibilityIcon
                fontSize="small"
                color="primary"
                sx={{ ml: hasActualChildren ? 0 : 'auto', opacity: 0.7 }} // Verwende hasActualChildren
              />
            </Tooltip>
          )}
        </TreeItemContent>
      </TreeItem>

      {hasActualChildren && ( // Verwende hasActualChildren
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((child: PatternLibraryElement, index: number) => ( // Verwende children
              <TreeNode
                key={child.element.uuid || index}
                element={child}
                path={[...path, index]}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelectElement={onSelectElement}
                onDrillDown={onDrillDown}
                currentPath={currentPath}
                isLastChildInLevel={index === children.length - 1} // Übergebe isLastChild
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const ElementHierarchyTree: React.FC<ElementHierarchyTreeProps> = ({
  elements,
  selectedPath,
  onSelectElement,
  onDrillDown,
  currentPath
}) => {
  return (
    <List component="nav" aria-label="element hierarchy" dense sx={{ p: 0 }}>
      {elements.map((element, index) => (
        <TreeNode
          key={element.element.uuid || index}
          element={element}
          path={[index]}
          depth={0}
          selectedPath={selectedPath}
          onSelectElement={onSelectElement}
          onDrillDown={onDrillDown}
          currentPath={currentPath}
          isLastChildInLevel={index === elements.length - 1} // Übergebe isLastChild für Top-Level
        />
      ))}
    </List>
  );
};

export default ElementHierarchyTree;
