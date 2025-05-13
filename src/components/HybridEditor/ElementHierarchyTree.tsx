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

const TreeItem = styled(ListItem)<{ depth: number; isSelected: boolean }>`
  padding-left: ${props => props.depth * 16 + 8}px;
  background-color: ${props => props.isSelected ? 'rgba(0, 159, 100, 0.1)' : 'transparent'};
  border-left: ${props => props.isSelected ? '3px solid #009F64' : '3px solid transparent'};

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
}> = ({
  element,
  path,
  depth,
  selectedPath,
  onSelectElement,
  onDrillDown,
  currentPath
}) => {
  const [expanded, setExpanded] = useState(false);
  const isSelected = arePathsEqual(path, selectedPath);
  const isInCurrentPath = path.length <= currentPath.length &&
                          path.every((value, index) => value === currentPath[index]);

  // Bestimme, ob das Element Kinder hat
  const hasChildren = () => {
    // Sicherer Zugriff auf element.element und pattern_type
    if (!element || !element.element) {
      return false;
    }

    const elementType = element.element.pattern_type;

    if (!elementType) {
      // Für Subflow-Elemente ohne pattern_type, aber mit type
      if ((element.element as any).type) {
        const hasElements = (element.element as any).elements?.length > 0;
        const hasSubElements = (element.element as any).sub_elements?.length > 0;
        return hasElements || hasSubElements;
      }
      return false;
    }

    if (elementType === 'GroupUIElement') {
      return (element.element as any).elements?.length > 0;
    } else if (elementType === 'ArrayUIElement') {
      return (element.element as any).elements?.length > 0;
    } else if (elementType === 'ChipGroupUIElement') {
      return (element.element as any).chips?.length > 0;
    } else if (elementType === 'CustomUIElement' && (element.element as any).sub_flows) {
      return (element.element as any).sub_flows?.length > 0;
    }

    // Prüfe auf andere Arten von Unterelementen
    if ((element.element as any).elements && (element.element as any).elements.length > 0) {
      return true;
    } else if ((element.element as any).items && (element.element as any).items.length > 0) {
      return true;
    } else if ((element.element as any).options && (element.element as any).options.length > 0) {
      return true;
    }

    // Prüfe auf beliebige Array-Eigenschaften, die Unterelemente sein könnten
    for (const key in element.element) {
      if (Array.isArray((element.element as any)[key]) &&
          (element.element as any)[key].length > 0 &&
          typeof (element.element as any)[key][0] === 'object') {
        return true;
      }
    }

    return false;
  };

  // Hole die Kinder des Elements
  const getChildren = () => {
    // Sicherer Zugriff auf element.element und pattern_type
    if (!element || !element.element) {
      return [];
    }

    const elementType = element.element.pattern_type;

    if (!elementType) {
      // Für Subflow-Elemente ohne pattern_type, aber mit type
      if ((element.element as any).type) {
        if ((element.element as any).elements) {
          return (element.element as any).elements.map((subElement: any) => ({
            element: subElement
          }));
        } else if ((element.element as any).sub_elements) {
          return (element.element as any).sub_elements.map((subElement: any) => ({
            element: subElement
          }));
        }
      }
      return [];
    }

    if (elementType === 'GroupUIElement') {
      return (element.element as any).elements || [];
    } else if (elementType === 'ArrayUIElement') {
      return (element.element as any).elements || [];
    } else if (elementType === 'ChipGroupUIElement') {
      return (element.element as any).chips || [];
    } else if (elementType === 'CustomUIElement' && (element.element as any).sub_flows) {
      return (element.element as any).sub_flows.map((subflow: any) => ({
        element: subflow
      }));
    }

    // Prüfe auf andere Arten von Unterelementen
    if ((element.element as any).elements) {
      return (element.element as any).elements.map((subElement: any) => ({
        element: subElement
      }));
    } else if ((element.element as any).items) {
      // Für Elemente mit items-Array (z.B. KeyValueListUIElement)
      return (element.element as any).items.map((item: any) => ({
        element: item
      }));
    } else if ((element.element as any).options) {
      // Für Elemente mit options-Array (z.B. SingleSelectionUIElement)
      return (element.element as any).options.map((option: any) => ({
        element: option
      }));
    }

    // Versuche, alle Eigenschaften zu durchsuchen, die Arrays sein könnten und Unterelemente enthalten könnten
    for (const key in element.element) {
      if (Array.isArray((element.element as any)[key]) &&
          (element.element as any)[key].length > 0 &&
          typeof (element.element as any)[key][0] === 'object') {
        // Wir haben ein Array von Objekten gefunden, das Unterelemente sein könnten
        return (element.element as any)[key].map((item: any) => ({
          element: item
        }));
      }
    }

    return [];
  };

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
    if (isInCurrentPath) {
      setExpanded(true);
    }
  }, [isInCurrentPath]);

  return (
    <>
      <TreeItem
        depth={depth}
        isSelected={isSelected}
        onClick={() => onSelectElement(path)}
      >
        <TreeItemContent>
          {hasChildren() ? (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          ) : (
            <Box sx={{ width: 28 }} /> // Platzhalter für konsistenten Einzug
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
            primary={getDisplayName()}
            slotProps={{
              primary: {
                noWrap: true,
                title: getDisplayName() // Tooltip bei Überlauf
              }
            }}
          />

          {hasChildren() && (
            <Tooltip title="Zeigt die Unterelemente dieses Elements in der Hierarchie an">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDrillDown(path);
                }}
                sx={{ ml: 'auto' }}
                color="success"
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
                sx={{ ml: hasChildren() ? 0 : 'auto', opacity: 0.7 }}
              />
            </Tooltip>
          )}
        </TreeItemContent>
      </TreeItem>

      {hasChildren() && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {getChildren().map((child: PatternLibraryElement, index: number) => (
              <TreeNode
                key={index}
                element={child}
                path={[...path, index]}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelectElement={onSelectElement}
                onDrillDown={onDrillDown}
                currentPath={currentPath}
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
          key={index}
          element={element}
          path={[index]}
          depth={0}
          selectedPath={selectedPath}
          onSelectElement={onSelectElement}
          onDrillDown={onDrillDown}
          currentPath={currentPath}
        />
      ))}
    </List>
  );
};

export default ElementHierarchyTree;
