import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import ViewListIcon from '@mui/icons-material/ViewList';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NumbersIcon from '@mui/icons-material/Numbers';
import ImageIcon from '@mui/icons-material/Image';
import MenuIcon from '@mui/icons-material/Menu';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { PatternLibraryElement } from '../../../models/listingFlow';
import { useSubflow } from '../../../context/SubflowContext';

/**
 * Komponente für die Navigation durch verschachtelte Elemente in Subflows.
 * Zeigt Breadcrumbs für die Navigation zurück zu übergeordneten Elementen und
 * eine Liste der verfügbaren Elemente auf der aktuellen Ebene.
 */
const SubflowNavigator: React.FC = () => {
  const {
    state: {
      customElement,
      selectedSubflowIndex,
      selectedSubflowType,
      selectedElementPath,
      navigationPath,
    },
    navigateToElement,
    navigateUp,
    navigateToRoot,
  } = useSubflow();

  // Funktion zum Rendern eines Icons basierend auf dem Elementtyp
  const renderElementIcon = (elementType: string) => {
    switch (elementType) {
      case 'GroupUIElement':
        return <GroupIcon />;
      case 'ArrayUIElement':
        return <ViewListIcon />;
      case 'BooleanUIElement':
        return <CheckBoxIcon />;
      case 'StringUIElement':
        return <TextFieldsIcon />;
      case 'DateUIElement':
        return <CalendarTodayIcon />;
      case 'NumberUIElement':
        return <NumbersIcon />;
      case 'FileUIElement':
        return <ImageIcon />;
      case 'ChipGroupUIElement':
        return <MenuIcon />;
      default:
        return <NavigateNextIcon />;
    }
  };

  // Funktion zum Rendern der Breadcrumbs
  const renderBreadcrumbs = () => {
    return (
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="Navigationspfad"
      >
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigateToRoot();
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          {selectedSubflowType || 'Subflow'}
        </Link>

        {navigationPath.slice(1).map((entry, index) => {
          const isLast = index === navigationPath.length - 2;

          return isLast ? (
            <Typography
              key={index}
              color="text.primary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {entry.label}
            </Typography>
          ) : (
            <Link
              key={index}
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // Navigiere zum entsprechenden Element
                if (customElement && selectedSubflowIndex !== null) {
                  const element = customElement.sub_flows?.[selectedSubflowIndex]?.elements?.find(
                    (_, i) => i === entry.path[0]
                  );
                  if (element) {
                    navigateToElement(entry.path, element);
                  }
                }
              }}
            >
              {entry.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  // Funktion zum Rendern der Elementliste
  const renderElementList = () => {
    if (!customElement || selectedSubflowIndex === null) {
      return (
        <Typography variant="body2" color="text.secondary">
          Kein Subflow ausgewählt.
        </Typography>
      );
    }

    const subflow = customElement.sub_flows?.[selectedSubflowIndex];
    if (!subflow) {
      return (
        <Typography variant="body2" color="text.secondary">
          Subflow nicht gefunden.
        </Typography>
      );
    }

    // Wenn ein Element ausgewählt ist, zeige seine untergeordneten Elemente
    if (selectedElementPath && selectedElementPath.length > 0) {
      // Finde das ausgewählte Element
      let currentElements = subflow.elements;
      let currentElement = null;

      for (let i = 0; i < selectedElementPath.length; i++) {
        const index = selectedElementPath[i];

        if (!currentElements || !currentElements[index]) {
          return (
            <Typography variant="body2" color="text.secondary">
              Element nicht gefunden.
            </Typography>
          );
        }

        currentElement = currentElements[index];

        // Wenn wir am Ende des Pfads sind, zeige die untergeordneten Elemente
        if (i === selectedElementPath.length - 1) {
          // Je nach Elementtyp zeige die entsprechenden untergeordneten Elemente
          if (currentElement.element.pattern_type === 'GroupUIElement') {
            currentElements = currentElement.element.elements || [];
          } else if (currentElement.element.pattern_type === 'ArrayUIElement') {
            currentElements = currentElement.element.elements || [];
          } else if (currentElement.element.pattern_type === 'ChipGroupUIElement') {
            // ChipGroupUIElement hat keine elements, sondern chips
            // Wir müssen die chips als "Elemente" behandeln
            const chipGroup = currentElement.element;
            currentElements = (chipGroup.chips || []).map((chip: any) => ({
              element: chip
            }));
          } else if (currentElement.element.pattern_type === 'CustomUIElement' && (currentElement.element as any).sub_flows) {
            // CustomUIElement mit sub_flows
            // Wir müssen die sub_flows als "Elemente" behandeln
            const customElement = currentElement.element;
            currentElements = (customElement.sub_flows || []).map((subflow: any) => ({
              element: {
                ...subflow,
                pattern_type: subflow.type || 'SubFlow',
                title: { de: subflow.type || 'SubFlow' }
              }
            }));
          } else {
            // Prüfe, ob das Element Unterelemente hat, auch wenn es kein spezieller Container-Typ ist
            // Dies ist wichtig für Elemente wie POI mit Heizkörper-Unterelementen
            let foundSubElements = false;

            if ((currentElement.element as any).elements) {
              currentElements = (currentElement.element as any).elements;
              foundSubElements = true;
            } else if ((currentElement.element as any).items) {
              // Für Elemente mit items-Array (z.B. KeyValueListUIElement)
              currentElements = (currentElement.element as any).items.map((item: any) => ({ element: item }));
              foundSubElements = true;
            } else if ((currentElement.element as any).options) {
              // Für Elemente mit options-Array (z.B. SingleSelectionUIElement)
              currentElements = (currentElement.element as any).options.map((option: any) => ({ element: option }));
              foundSubElements = true;
            } else {
              // Versuche, alle Eigenschaften zu durchsuchen, die Arrays sein könnten und Unterelemente enthalten könnten
              for (const key in currentElement.element) {
                if (Array.isArray((currentElement.element as any)[key]) &&
                    (currentElement.element as any)[key].length > 0 &&
                    typeof (currentElement.element as any)[key][0] === 'object') {
                  // Wir haben ein Array von Objekten gefunden, das Unterelemente sein könnten
                  currentElements = (currentElement.element as any)[key].map((item: any) => ({ element: item }));
                  foundSubElements = true;
                  break;
                }
              }
            }

            if (!foundSubElements) {
              // Das Element hat keine erkennbaren verschachtelten Elemente
              return (
                <Typography variant="body2" color="text.secondary">
                  Dieses Element hat keine untergeordneten Elemente.
                </Typography>
              );
            }
          }
        } else {
          // Gehe tiefer
          if (currentElement.element.pattern_type === 'GroupUIElement') {
            currentElements = currentElement.element.elements || [];
          } else if (currentElement.element.pattern_type === 'ArrayUIElement') {
            currentElements = currentElement.element.elements || [];
          } else if (currentElement.element.pattern_type === 'ChipGroupUIElement') {
            // ChipGroupUIElement hat keine elements, sondern chips
            const chipGroup = currentElement.element;
            currentElements = (chipGroup.chips || []).map((chip: any) => ({
              element: chip
            }));
          } else if (currentElement.element.pattern_type === 'CustomUIElement' && (currentElement.element as any).sub_flows) {
            // CustomUIElement mit sub_flows
            const customElement = currentElement.element;
            currentElements = (customElement.sub_flows || []).map((subflow: any) => ({
              element: {
                ...subflow,
                pattern_type: subflow.type || 'SubFlow',
                title: { de: subflow.type || 'SubFlow' }
              }
            }));
          } else {
            // Prüfe, ob das Element Unterelemente hat, auch wenn es kein spezieller Container-Typ ist
            // Dies ist wichtig für Elemente wie POI mit Heizkörper-Unterelementen
            let foundSubElements = false;

            if ((currentElement.element as any).elements) {
              currentElements = (currentElement.element as any).elements;
              foundSubElements = true;
            } else if ((currentElement.element as any).items) {
              // Für Elemente mit items-Array (z.B. KeyValueListUIElement)
              currentElements = (currentElement.element as any).items.map((item: any) => ({ element: item }));
              foundSubElements = true;
            } else if ((currentElement.element as any).options) {
              // Für Elemente mit options-Array (z.B. SingleSelectionUIElement)
              currentElements = (currentElement.element as any).options.map((option: any) => ({ element: option }));
              foundSubElements = true;
            } else {
              // Versuche, alle Eigenschaften zu durchsuchen, die Arrays sein könnten und Unterelemente enthalten könnten
              for (const key in currentElement.element) {
                if (Array.isArray((currentElement.element as any)[key]) &&
                    (currentElement.element as any)[key].length > 0 &&
                    typeof (currentElement.element as any)[key][0] === 'object') {
                  // Wir haben ein Array von Objekten gefunden, das Unterelemente sein könnten
                  currentElements = (currentElement.element as any)[key].map((item: any) => ({ element: item }));
                  foundSubElements = true;
                  break;
                }
              }
            }

            if (!foundSubElements) {
              // Das Element hat keine erkennbaren verschachtelten Elemente
              return (
                <Typography variant="body2" color="text.secondary">
                  Element nicht gefunden.
                </Typography>
              );
            }
          }
        }
      }

      // Zeige die untergeordneten Elemente
      return renderElements(currentElements);
    }

    // Wenn kein Element ausgewählt ist, zeige die Elemente des Subflows
    return renderElements(subflow.elements);
  };

  // Hilfsfunktion zum Rendern einer Liste von Elementen
  const renderElements = (elements: PatternLibraryElement[]) => {
    if (!elements || elements.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          Keine Elemente vorhanden.
        </Typography>
      );
    }

    return (
      <List>
        {elements.map((element, index) => {
          const elementType = element.element.pattern_type;
          const title = element.element.title?.de || elementType;
          const hasVisibilityCondition = !!element.element.visibility_condition;

          // Prüfe, ob das Element untergeordnete Elemente hat
          let hasChildren =
            elementType === 'GroupUIElement' ||
            elementType === 'ArrayUIElement' ||
            (elementType === 'ChipGroupUIElement' && (element.element as any).chips?.length > 0) ||
            (elementType === 'CustomUIElement' && (element.element as any).sub_flows?.length > 0);

          // Prüfe auch auf andere Arten von Unterelementen
          if (!hasChildren) {
            if ((element.element as any).elements && (element.element as any).elements.length > 0) {
              hasChildren = true;
            } else if ((element.element as any).items && (element.element as any).items.length > 0) {
              hasChildren = true;
            } else if ((element.element as any).options && (element.element as any).options.length > 0) {
              hasChildren = true;
            } else {
              // Prüfe auf beliebige Array-Eigenschaften, die Unterelemente sein könnten
              for (const key in element.element) {
                if (Array.isArray((element.element as any)[key]) &&
                    (element.element as any)[key].length > 0 &&
                    typeof (element.element as any)[key][0] === 'object') {
                  hasChildren = true;
                  break;
                }
              }
            }
          }

          return (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  // Berechne den neuen Pfad
                  const newPath = selectedElementPath
                    ? [...selectedElementPath, index]
                    : [index];

                  // Navigiere zum Element
                  navigateToElement(newPath, element);
                }}
              >
                <ListItemIcon>{renderElementIcon(elementType)}</ListItemIcon>
                <ListItemText
                  primary={title}
                  secondary={elementType}
                />
                {hasVisibilityCondition && (
                  <Tooltip title="Dieses Element hat Sichtbarkeitsregeln">
                    <VisibilityIcon fontSize="small" color="primary" />
                  </Tooltip>
                )}
                {hasChildren && <NavigateNextIcon />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    );
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Navigation
        </Typography>

        {renderBreadcrumbs()}

        <Divider />

        <Typography variant="subtitle1">
          {selectedElementPath && selectedElementPath.length > 0
            ? 'Untergeordnete Elemente'
            : 'Elemente'}
        </Typography>

        {renderElementList()}

        {selectedElementPath && selectedElementPath.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Chip
              label="Zurück"
              icon={<NavigateNextIcon sx={{ transform: 'rotate(180deg)' }} />}
              onClick={navigateUp}
              clickable
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SubflowNavigator;
