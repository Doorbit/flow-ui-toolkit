import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Divider,
  Paper
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { PatternLibraryElement } from '../../models/listingFlow';
import { getElementIcon } from './ElementContextView';

interface StructureNavigatorProps {
  element: PatternLibraryElement;
  onNavigateToElement: (path: number[]) => void;
  currentPath: number[];
  selectedElementPath?: number[];
}

/**
 * Eine Komponente zur Navigation durch die Hierarchie der Elemente.
 * Zeigt die Unterelemente eines Elements in einer Baumstruktur an und
 * ermöglicht die Navigation zu diesen Unterelementen.
 */
const StructureNavigator: React.FC<StructureNavigatorProps> = ({
  element,
  onNavigateToElement,
  currentPath,
  selectedElementPath = []
}) => {
  // Funktion zum Ermitteln des Anzeigenamens eines Elements
  const getDisplayName = (element: any, index: number) => {
    // Handle SubFlow objects
    if (!element.element?.pattern_type && element.element?.type) {
      return element.element.type || `SubFlow ${index}`;
    }

    return element.element?.title?.de ||
           element.element?.title?.en ||
           `${element.element?.pattern_type || 'Element'} ${index}`;
  };

  // Hilfsfunktion zum Überprüfen, ob zwei Pfade gleich sind
  const arePathsEqual = (path1: number[], path2: number[]): boolean => {
    if (path1.length !== path2.length) return false;
    return path1.every((value, index) => value === path2[index]);
  };

  // Funktion zum Rendern der Unterelemente
  const renderSubElements = () => {
    const elementType = element.element.pattern_type;
    let subElements: any[] = [];

    if (elementType === 'GroupUIElement' || elementType === 'ArrayUIElement') {
      subElements = (element.element as any).elements || [];
    } else if (elementType === 'ChipGroupUIElement') {
      subElements = (element.element as any).chips || [];
    } else if (elementType === 'CustomUIElement' && (element.element as any).sub_flows) {
      subElements = (element.element as any).sub_flows || [];
    } else if (!elementType && (element.element as any).elements) {
      // Handle SubFlow objects
      subElements = (element.element as any).elements || [];
    } else if ((element.element as any).elements) {
      // Für andere Elemente mit elements-Array
      subElements = (element.element as any).elements || [];
    } else if ((element.element as any).items) {
      // Für Elemente mit items-Array (z.B. KeyValueListUIElement)
      subElements = (element.element as any).items || [];
    } else if ((element.element as any).options) {
      // Für Elemente mit options-Array (z.B. SingleSelectionUIElement)
      subElements = (element.element as any).options || [];
    } else {
      // Versuche, alle Eigenschaften zu durchsuchen, die Arrays sein könnten und Unterelemente enthalten könnten
      for (const key in element.element) {
        if (Array.isArray((element.element as any)[key]) &&
            (element.element as any)[key].length > 0 &&
            typeof (element.element as any)[key][0] === 'object') {
          // Wir haben ein Array von Objekten gefunden, das Unterelemente sein könnten
          subElements = (element.element as any)[key] || [];
          break;
        }
      }
    }

    if (subElements.length === 0) {
      return (
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Dieses Element hat keine Unterelemente.
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper variant="outlined">
        <List>
          {subElements.map((subElement, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider />}
              <Tooltip title="Klicken Sie, um dieses Element auszuwählen und zu bearbeiten">
                <ListItemButton
                  onClick={() => {
                    const newPath = [...currentPath, index];
                    onNavigateToElement(newPath);
                  }}
                  selected={arePathsEqual([...currentPath, index], selectedElementPath)}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(0, 159, 100, 0.08)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(0, 159, 100, 0.12)',
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: 'rgba(0, 159, 100, 0.16)',
                    },
                  }}

              >
                <ListItemIcon>
                  {getElementIcon(subElement.element?.pattern_type || 'default')}
                </ListItemIcon>
                <ListItemText
                  primary={getDisplayName(subElement, index)}
                  secondary={subElement.element?.pattern_type || 'SubFlow'}
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Zu diesem Element navigieren">
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newPath = [...currentPath, index];
                        onNavigateToElement(newPath);
                      }}
                      color="success"
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItemButton>
            </Tooltip>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AccountTreeIcon color="success" sx={{ mr: 1 }} />
        <Typography variant="subtitle1">
          Strukturnavigation
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Hier sehen Sie die Unterelemente dieses Elements in der Hierarchie. Klicken Sie auf ein Element, um es auszuwählen und zu bearbeiten. Das ausgewählte Element wird hervorgehoben dargestellt.
      </Typography>

      {renderSubElements()}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 159, 100, 0.05)', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          Hinweis zur Strukturnavigation:
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Die Strukturnavigation ermöglicht es Ihnen, durch die Hierarchie der Elemente zu navigieren. Dies ist nicht zu verwechseln mit der bedingten Sichtbarkeit, die bestimmt, wann ein Element angezeigt wird.
        </Typography>
      </Box>
    </Box>
  );
};

export default StructureNavigator;
