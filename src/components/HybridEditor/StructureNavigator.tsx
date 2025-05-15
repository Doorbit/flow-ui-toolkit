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
import { getContainerType, getSubElements } from '../../context/EditorContext';

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
    // Verwende die getSubElements-Funktion, um die Unterelemente zu erhalten
    const subElements = getSubElements(element);

    // Bestimme den Container-Typ des Elements
    const containerType = getContainerType(element);

    // Zeige den Container-Typ in der Überschrift an
    const containerTypeTitle =
      containerType === 'group' ? 'Gruppe' :
      containerType === 'array' ? 'Array' :
      containerType === 'chipgroup' ? 'Chip-Gruppe' :
      containerType === 'custom' ? 'Custom-Element' :
      containerType === 'subflow' ? 'Subflow' :
      'Element';

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
        <Box sx={{ p: 1, bgcolor: 'rgba(0, 0, 0, 0.02)', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
            {containerTypeTitle}-Unterelemente ({subElements.length})
          </Typography>
        </Box>
        <List>
          {subElements.map((subElement, index) => {
            // Bestimme den Container-Typ des Unterelements
            const subElementContainerType = getContainerType(subElement);
            const hasChildren = getSubElements(subElement).length > 0;

            return (
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
                      secondary={
                        <>
                          {subElement.element?.pattern_type || 'SubFlow'}
                          {hasChildren && (
                            <Box component="span" sx={{
                              ml: 1,
                              color:
                                subElementContainerType === 'group' ? '#009F64' :
                                subElementContainerType === 'array' ? '#F05B29' :
                                subElementContainerType === 'chipgroup' ? '#3F51B5' :
                                subElementContainerType === 'custom' ? '#009F64' :
                                subElementContainerType === 'subflow' ? '#009F64' :
                                'inherit'
                            }}>
                              ({subElementContainerType})
                            </Box>
                          )}
                        </>
                      }
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
                          color={
                            subElementContainerType === 'group' ? 'success' :
                            subElementContainerType === 'array' ? 'warning' :
                            subElementContainerType === 'chipgroup' ? 'primary' :
                            subElementContainerType === 'custom' ? 'success' :
                            subElementContainerType === 'subflow' ? 'success' :
                            'success'
                          }
                        >
                          <ChevronRightIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                </Tooltip>
              </React.Fragment>
            );
          })}
        </List>
      </Paper>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AccountTreeIcon
          color={
            getContainerType(element) === 'group' ? 'success' :
            getContainerType(element) === 'array' ? 'warning' :
            getContainerType(element) === 'chipgroup' ? 'primary' :
            getContainerType(element) === 'custom' ? 'success' :
            getContainerType(element) === 'subflow' ? 'success' :
            'success'
          }
          sx={{ mr: 1 }}
        />
        <Typography variant="subtitle1">
          {getContainerType(element) === 'group' ? 'Gruppe' :
           getContainerType(element) === 'array' ? 'Array' :
           getContainerType(element) === 'chipgroup' ? 'Chip-Gruppe' :
           getContainerType(element) === 'custom' ? 'Custom-Element' :
           getContainerType(element) === 'subflow' ? 'Subflow' :
           'Element'}-Navigation
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Hier sehen Sie die Unterelemente dieses {
          getContainerType(element) === 'group' ? 'Gruppen' :
          getContainerType(element) === 'array' ? 'Array' :
          getContainerType(element) === 'chipgroup' ? 'Chip-Gruppen' :
          getContainerType(element) === 'custom' ? 'Custom-Elements' :
          getContainerType(element) === 'subflow' ? 'Subflows' :
          'Elements'
        } in der Hierarchie. Klicken Sie auf ein Element, um es auszuwählen und zu bearbeiten. Das ausgewählte Element wird hervorgehoben dargestellt.
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
