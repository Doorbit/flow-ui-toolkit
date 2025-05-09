import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Divider,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { PatternLibraryElement } from '../../models/listingFlow';
import { useEditor, getElementByPath } from '../../context/EditorContext';
import ElementHierarchyTree from './ElementHierarchyTree';
import ElementContextView from './ElementContextView';
import EnhancedPropertyEditor from './EnhancedPropertyEditor';
import VisibilityLegend from './VisibilityLegend';
// import { arePathsEqual, getParentPath } from '../../utils/pathUtils';

// Styled Components für das Layout
const EditorContainer = styled(Box)`
  display: flex;
  flex: 1;
  height: calc(100vh - 120px); /* Abzüglich Navigation und PageNavigator */
  overflow: hidden;
`;

const LeftColumn = styled.div`
  width: 250px;
  height: 100%;
  overflow-y: auto;
  background-color: #F0F2F4;
  border-right: 1px solid #E0E0E0;
  display: flex;
  flex-direction: column;
`;

const MiddleColumn = styled.div`
  width: calc((100% - 250px) / 2);
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
  background-color: #F8FAFC;
  display: flex;
  flex-direction: column;
`;

const RightColumn = styled.div`
  width: calc((100% - 250px) / 2);
  height: 100%;
  overflow-y: auto;
  background-color: #F8FAFC;
  border-left: 1px solid #E0E0E0;
  padding: 1rem;
`;

const BreadcrumbContainer = styled(Box)`
  padding: 0.5rem 1rem;
  background-color: #F8FAFC;
  border-bottom: 1px solid #E0E0E0;
  display: flex;
  align-items: center;
`;

interface HybridEditorProps {
  elements: PatternLibraryElement[];
  selectedElementPath?: number[];
  onSelectElement: (path: number[]) => void;
  onRemoveElement: (path: number[]) => void;
  onDuplicateElement: (path: number[]) => void;
  onAddSubElement?: (parentPath: number[], type?: string) => void;
  onDropElement?: (type: string, parentPath?: number[]) => void;
  onMoveElement?: (sourceIndex: number, targetIndex: number, parentPath?: number[], sourcePath?: number[]) => void;
}

const HybridEditor: React.FC<HybridEditorProps> = ({
  elements,
  selectedElementPath = [],
  onSelectElement,
  onRemoveElement,
  onDuplicateElement,
  onAddSubElement,
  onDropElement,
  onMoveElement
}) => {
  const { state, dispatch } = useEditor();
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [currentElements, setCurrentElements] = useState<PatternLibraryElement[]>(elements);
  // Definiere den Typ für Breadcrumb-Items
  interface BreadcrumbItem {
    label: string;
    path: number[];
  }

  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([{ label: 'Hauptebene', path: [] }]);

  // Aktualisiere currentPath wenn selectedElementPath sich ändert
  useEffect(() => {
    if (selectedElementPath.length > 0) {
      // Hole den Elternpfad (alle Elemente außer dem letzten)
      const parentPath = selectedElementPath.slice(0, -1);
      setCurrentPath(parentPath);
    }
  }, [selectedElementPath]);

  // Hilfsfunktion zum Extrahieren von Unterelementen basierend auf dem Elementtyp
  const getChildElements = React.useCallback((parentElement: PatternLibraryElement, path: number[]): PatternLibraryElement[] => {
    if (!parentElement) return [];

    console.log('getChildElements - parentElement:', parentElement);
    console.log('getChildElements - path:', path);
    console.log('arg1:', parentElement);
    console.log('arg1:', path);

    // Prüfen, ob es sich um ein Subflow-Element handelt (kein pattern_type, aber type vorhanden)
    if (!parentElement.element.pattern_type && (parentElement.element as any).type) {
      console.log('getChildElements - Subflow Element - type:', (parentElement.element as any).type);
      // Für Subflow-Elemente
      const elements = (parentElement.element as any).elements || [];
      console.log('getChildElements - Subflow Element - elements:', elements);
      return elements;
    }

    const elementType = parentElement.element.pattern_type;
    let childElements: PatternLibraryElement[] = [];

    console.log('getChildElements - elementType:', elementType);

    if (elementType === 'GroupUIElement') {
      // Für GroupUIElement
      childElements = (parentElement.element as any).elements || [];
      console.log('getChildElements - GroupUIElement - childElements:', childElements);
    } else if (elementType === 'ArrayUIElement') {
      // Für ArrayUIElement
      childElements = (parentElement.element as any).elements || [];
      console.log('getChildElements - ArrayUIElement - childElements:', childElements);
    } else if (elementType === 'ChipGroupUIElement') {
      // Für ChipGroupUIElement
      const chips = (parentElement.element as any).chips || [];
      childElements = chips.map((chip: any) => ({
        element: chip
      }));
      console.log('getChildElements - ChipGroupUIElement - childElements:', childElements);
    } else if (elementType === 'CustomUIElement') {
      // Für CustomUIElement mit Subflows
      const subFlows = (parentElement.element as any).sub_flows || [];
      console.log('getChildElements - CustomUIElement - subFlows:', subFlows);

      if (path.length === 1) {
        // Auf der ersten Ebene zeigen wir die Subflows an
        childElements = subFlows.map((subflow: any) => ({
          element: subflow
        }));
        console.log('getChildElements - CustomUIElement - path.length === 1 - childElements:', childElements);
      } else if (path.length > 1 && subFlows[path[1]]) {
        console.log('getChildElements - CustomUIElement - path.length > 1 - subFlows[path[1]]:', subFlows[path[1]]);
        // Auf der zweiten Ebene zeigen wir die Elemente des ausgewählten Subflows an
        if (path.length === 2) {
          childElements = subFlows[path[1]].elements || [];
          console.log('getChildElements - CustomUIElement - path.length === 2 - childElements:', childElements);

          // Sicherstellen, dass die Elemente korrekt formatiert sind
          if (childElements.length === 0) {
            console.warn('getChildElements - CustomUIElement - path.length === 2 - Keine Elemente gefunden');
          }
        } else {
          // Für tiefere Verschachtelungen innerhalb eines Subflows
          const subflowElements = subFlows[path[1]].elements || [];
          console.log('getChildElements - CustomUIElement - path.length > 2 - subflowElements:', subflowElements);
          const subPath = path.slice(2); // Entferne die ersten beiden Pfadteile (CustomUIElement und Subflow)
          console.log('getChildElements - CustomUIElement - path.length > 2 - subPath:', subPath);

          // Navigiere durch die Unterelemente
          let currentElements = subflowElements;
          let currentElement = null;

          for (let i = 0; i < subPath.length - 1; i++) {
            if (currentElements.length <= subPath[i]) {
              console.log('getChildElements - CustomUIElement - path.length > 2 - currentElements.length <= subPath[i]');
              return [];
            }

            currentElement = currentElements[subPath[i]];
            console.log('getChildElements - CustomUIElement - path.length > 2 - currentElement:', currentElement);

            // Prüfen, ob es sich um ein Subflow-Element handelt (kein pattern_type, aber type vorhanden)
            if (!currentElement.element.pattern_type && (currentElement.element as any).type) {
              console.log('getChildElements - CustomUIElement - path.length > 2 - Subflow Element - type:', (currentElement.element as any).type);
              currentElements = (currentElement.element as any).elements || [];
              console.log('getChildElements - CustomUIElement - path.length > 2 - Subflow Element - currentElements:', currentElements);
            } else if (currentElement.element.pattern_type === 'GroupUIElement') {
              currentElements = (currentElement.element as any).elements || [];
              console.log('getChildElements - CustomUIElement - path.length > 2 - GroupUIElement - currentElements:', currentElements);
            } else if (currentElement.element.pattern_type === 'ArrayUIElement') {
              currentElements = (currentElement.element as any).elements || [];
              console.log('getChildElements - CustomUIElement - path.length > 2 - ArrayUIElement - currentElements:', currentElements);
            } else if (currentElement.element.pattern_type === 'ChipGroupUIElement') {
              // Für ChipGroupUIElement
              const chips = (currentElement.element as any).chips || [];
              currentElements = chips.map((chip: any) => ({
                element: chip
              }));
              console.log('getChildElements - CustomUIElement - path.length > 2 - ChipGroupUIElement - currentElements:', currentElements);
            } else if (currentElement.element.pattern_type === 'CustomUIElement' && (currentElement.element as any).sub_flows) {
              // Für CustomUIElement mit Subflows
              const subFlows = (currentElement.element as any).sub_flows || [];
              currentElements = subFlows.map((subflow: any) => ({
                element: subflow
              }));
              console.log('getChildElements - CustomUIElement - path.length > 2 - CustomUIElement - currentElements:', currentElements);
            } else {
              console.log('getChildElements - CustomUIElement - path.length > 2 - Unsupported element type');
              return [];
            }
          }

          childElements = currentElements;
          console.log('getChildElements - CustomUIElement - path.length > 2 - childElements:', childElements);
        }
      }
    }

    console.log('getChildElements - returning childElements:', childElements);
    console.log('arg1:', childElements);
    return childElements;
  }, []);

  // Aktualisiere die aktuellen Elemente basierend auf dem Pfad
  useEffect(() => {
    if (currentPath.length === 0) {
      // Wir sind auf der obersten Ebene
      setCurrentElements(elements);
    } else {
      // Wir sind in einem Unterelement
      const parentElement = getElementByPath(elements, currentPath);
      if (parentElement) {
        const childElements = getChildElements(parentElement, currentPath);
        setCurrentElements(childElements);
      }
    }
  }, [currentPath, elements, getChildElements]);

  // Hilfsfunktion zum Generieren eines Labels für ein Element
  const getElementLabel = React.useCallback((element: PatternLibraryElement, index: number): string => {
    if (!element) return `Element ${index}`;

    // Für Subflows in CustomUIElement
    if ((element.element as any).type && !(element.element as any).pattern_type) {
      // Dies ist wahrscheinlich ein Subflow
      const subflowType = (element.element as any).type || 'Subflow';
      const title = (element.element as any).title?.de || (element.element as any).title?.en;
      return title || `${subflowType} ${index}`;
    }

    // Für normale Elemente
    return element.element.title?.de ||
           element.element.title?.en ||
           `${element.element.pattern_type} ${index}`;
  }, []);

  // Aktualisiere die Breadcrumb-Items basierend auf dem Pfad
  useEffect(() => {
    const items: BreadcrumbItem[] = [{ label: 'Hauptebene', path: [] }];

    if (currentPath.length > 0) {
      let currentPathSegment: number[] = [];

      for (let i = 0; i < currentPath.length; i++) {
        currentPathSegment = [...currentPathSegment, currentPath[i]];
        const element = getElementByPath(elements, currentPathSegment);

        if (element) {
          const label = getElementLabel(element, currentPath[i]);

          const newItem: BreadcrumbItem = {
            label,
            path: [...currentPathSegment]
          };
          items.push(newItem);
        }
      }
    }

    setBreadcrumbItems(items);
  }, [currentPath, elements, getElementLabel]);

  // Handler für die Navigation in der Hierarchie
  const handleNavigateTo = (path: number[]) => {
    setCurrentPath(path);
  };

  // Handler für "Tiefer gehen" in ein Element
  const handleDrillDown = (path: number[]) => {
    setCurrentPath(path);

    // Aktualisiere auch das ausgewählte Element
    onSelectElement(path);
  };

  // Handler für die Navigation zu einem Element (für StructureNavigator)
  const handleNavigateToElement = (path: number[]) => {
    // Aktualisiere den aktuellen Pfad
    setCurrentPath(path);
    // Aktualisiere auch das ausgewählte Element
    onSelectElement(path);
  };

  // Handler für "Zurück" zur übergeordneten Ebene
  const handleGoBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  return (
    <EditorContainer>
      {/* Linke Spalte: Hierarchische Baumansicht */}
      <LeftColumn>
        <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 'bold', color: '#2A2E3F' }}>
          Element-Hierarchie
        </Typography>
        <Divider />
        <ElementHierarchyTree
          elements={elements}
          selectedPath={selectedElementPath}
          onSelectElement={onSelectElement}
          onDrillDown={handleDrillDown}
          currentPath={currentPath}
        />
      </LeftColumn>

      {/* Mittlere Spalte: Kontextbezogene Elementansicht */}
      <MiddleColumn>
        <Box sx={{ mb: 2 }}>
          <VisibilityLegend compact />
        </Box>

        <BreadcrumbContainer>
          <Tooltip title="Zurück">
            <span>
              <IconButton
                size="small"
                onClick={handleGoBack}
                disabled={currentPath.length === 0}
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Hauptebene">
            <span>
              <IconButton
                size="small"
                onClick={() => handleNavigateTo([])}
                disabled={currentPath.length === 0}
                sx={{ mr: 1 }}
              >
                <HomeIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            maxItems={4}
            itemsBeforeCollapse={1}
            itemsAfterCollapse={2}
          >
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;

              return isLast ? (
                <Typography key={index} color="text.primary" sx={{ fontWeight: 'bold' }}>
                  {item.label}
                </Typography>
              ) : (
                <Link
                  key={index}
                  component="button"
                  variant="body2"
                  onClick={() => handleNavigateTo(item.path)}
                  sx={{ cursor: 'pointer' }}
                >
                  {item.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </BreadcrumbContainer>

        <ElementContextView
          elements={currentElements}
          selectedElementPath={selectedElementPath}
          currentPath={currentPath}
          onSelectElement={onSelectElement}
          onRemoveElement={onRemoveElement}
          onDuplicateElement={onDuplicateElement}
          onAddSubElement={onAddSubElement}
          onDropElement={onDropElement}
          onMoveElement={onMoveElement}
          onDrillDown={handleDrillDown}
        />
      </MiddleColumn>

      {/* Rechte Spalte: Eigenschaftspanel */}
      <RightColumn>
        <EnhancedPropertyEditor
          element={selectedElementPath && selectedElementPath.length > 0
            ? getElementByPath(elements, selectedElementPath)
            : null}
          currentPath={currentPath}
          selectedElementPath={selectedElementPath}
          onNavigateToElement={handleNavigateToElement}
          onUpdate={(updatedElement) => {
            if (!state.selectedPageId || !selectedElementPath || selectedElementPath.length === 0) {
              console.error('Kein Element ausgewählt oder keine Seite ausgewählt');
              return;
            }

            // Erstelle eine Kopie des aktuellen Flows
            const updatedFlow = JSON.parse(JSON.stringify(state.currentFlow));
            if (!updatedFlow) return;

            // Finde die aktuelle Seite
            const pageIndex = updatedFlow.pages_edit.findIndex((page: { id: string }) => page.id === state.selectedPageId);
            if (pageIndex === -1) return;

            // Hole die aktuelle Seite
            const currentPage = updatedFlow.pages_edit[pageIndex];

            // Hilfsfunktion zum Aktualisieren eines Elements an einem bestimmten Pfad
            const updateElementAtPath = (
              elements: PatternLibraryElement[],
              path: number[],
              updatedElement: PatternLibraryElement
            ): PatternLibraryElement[] => {
              if (path.length === 0) return elements;

              const [index, ...restPath] = path;
              if (index >= elements.length) return elements;

              return elements.map((element, i) => {
                if (i !== index) return element;

                if (restPath.length === 0) {
                  // Letzter Pfadteil erreicht, Element aktualisieren
                  return updatedElement;
                }

                // In die Tiefe gehen
                if (element.element.pattern_type === 'GroupUIElement' && (element.element as any).elements) {
                  const subElements = [...((element.element as any).elements || [])];
                  const updatedSubElements = updateElementAtPath(subElements, restPath, updatedElement);

                  return {
                    ...element,
                    element: {
                      ...(element.element as any),
                      elements: updatedSubElements
                    }
                  };
                } else if (element.element.pattern_type === 'ArrayUIElement' && (element.element as any).elements) {
                  const subElements = [...((element.element as any).elements || [])];
                  const updatedSubElements = updateElementAtPath(subElements, restPath, updatedElement);

                  return {
                    ...element,
                    element: {
                      ...(element.element as any),
                      elements: updatedSubElements
                    }
                  };
                } else if (element.element.pattern_type === 'ChipGroupUIElement' && (element.element as any).chips) {
                  // Für ChipGroup müssen wir die BooleanUIElements in PatternLibraryElements konvertieren
                  const chipElements = ((element.element as any).chips || []).map((chip: any) => ({
                    element: chip
                  }));

                  const updatedChipElements = updateElementAtPath(chipElements, restPath, updatedElement);

                  // Extrahiere die BooleanUIElements aus den PatternLibraryElements zurück
                  const updatedChips = updatedChipElements.map((chipElement: any) => chipElement.element);

                  return {
                    ...element,
                    element: {
                      ...(element.element as any),
                      chips: updatedChips
                    }
                  };
                } else if (element.element.pattern_type === 'CustomUIElement' && (element.element as any).sub_flows) {
                  // Für CustomUIElement mit sub_flows
                  const subFlows = [...((element.element as any).sub_flows || [])];

                  if (restPath.length > 0) {
                    const subFlowIndex = restPath[0];

                    if (subFlowIndex < subFlows.length) {
                      if (restPath.length === 1) {
                        // Aktualisiere den Subflow selbst
                        subFlows[subFlowIndex] = updatedElement.element;
                      } else {
                        // Aktualisiere ein Element innerhalb des Subflows
                        const subflowElements = [...(subFlows[subFlowIndex].elements || [])];
                        const updatedSubflowElements = updateElementAtPath(
                          subflowElements,
                          restPath.slice(1),
                          updatedElement
                        );

                        subFlows[subFlowIndex] = {
                          ...subFlows[subFlowIndex],
                          elements: updatedSubflowElements
                        };
                      }
                    }
                  }

                  return {
                    ...element,
                    element: {
                      ...(element.element as any),
                      sub_flows: subFlows
                    }
                  };
                }

                return element;
              });
            };

            // Aktualisiere das Element im Flow anhand des Pfads
            const updatedElements = updateElementAtPath(currentPage.elements, selectedElementPath, updatedElement);

            // Aktualisiere die Seite mit den aktualisierten Elementen
            currentPage.elements = updatedElements;

            // Dispatch mit dem aktualisierten Flow
            dispatch({
              type: 'UPDATE_FLOW',
              flow: updatedFlow
            });

            console.log('Element aktualisiert:', updatedElement);
          }}
        />
      </RightColumn>
    </EditorContainer>
  );
};

export default HybridEditor;
