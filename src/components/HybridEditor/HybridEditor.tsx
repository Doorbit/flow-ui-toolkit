import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

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

  useEffect(() => {
    if (selectedElementPath) { // selectedElementPath kann initial undefined sein, wenn es als optionale Prop kommt
      const parentOfSelected = selectedElementPath.slice(0, -1);

      // Prüfen, ob selectedElementPath ein Kind des aktuellen currentPath ist oder gleich currentPath.
      // Dies deutet darauf hin, dass die Auswahl/Navigation innerhalb des aktuellen Kontexts stattgefunden hat
      // (z.B. durch Drilldown im ElementContextView oder Auswahl eines Elements in der aktuellen Liste).
      // In diesem Fall soll der currentPath nicht durch diesen Hook geändert werden, da er bereits korrekt ist
      // oder durch handleDrillDown/handleNavigateTo gesetzt wurde.
      const isSelectionWithinCurrentContextOrDeeper =
        selectedElementPath.length >= currentPath.length &&
        currentPath.every((val, idx) => val === selectedElementPath[idx]);

      if (!isSelectionWithinCurrentContextOrDeeper) {
        // Die Auswahl kam von "außerhalb" des aktuellen Kontexts des ElementContextView
        // (z.B. Klick im ElementHierarchyTree auf einen anderen Zweig oder eine andere Ebene).
        // In diesem Fall soll der ElementContextView den Kontext des neu ausgewählten Elements anzeigen.
        // Der Kontext ist die Elternebene des ausgewählten Elements.
        if (JSON.stringify(parentOfSelected) !== JSON.stringify(currentPath)) {
          setCurrentPath(parentOfSelected);
        }
      }
      // Wenn die Auswahl innerhalb des aktuellen Kontexts oder tiefer ist (isSelectionWithinCurrentContextOrDeeper === true),
      // wird currentPath nicht geändert, da angenommen wird, dass er bereits korrekt ist oder
      // durch eine andere Aktion (z.B. handleDrillDown) gesetzt wurde.
    }
  }, [selectedElementPath, currentPath]); // currentPath ist hier als Dependency wichtig für den Vergleich

  /**
   * Konvertiert ein Element in ein PatternLibraryElement wenn nötig
   */
  const ensurePatternLibraryElement = React.useCallback((element: any): PatternLibraryElement => {
    if (element && element.element) {
      return element;
    }
    return { element };
  }, []);

  /**
   * Holt Unterelemente eines Elements basierend auf seinem Typ
   */
  const getChildElements = React.useCallback((parentElement: PatternLibraryElement): PatternLibraryElement[] => {
    if (!parentElement || !parentElement.element) return [];

    // Für Subflow-Objekte (die als parentElement übergeben werden, wenn currentPath auf sie zeigt)
    // Ein Subflow-Objekt selbst hat keinen pattern_type, aber einen 'type' (z.B. 'POI')
    // und enthält 'elements'.
    if (!parentElement.element.pattern_type && (parentElement.element as any).type) {
      // Die Kinder eines Subflow-Objekts sind dessen 'elements'-Array.
      const elementsInSubFlow = (parentElement.element as any).elements || [];
      // Annahme: sub_elements ist hier nicht relevant, da SubFlow-Definition nur 'elements' hat.
      return elementsInSubFlow.map(ensurePatternLibraryElement);
    }

    // Für reguläre UIElemente mit pattern_type
    switch (parentElement.element.pattern_type) {
      case 'GroupUIElement':
      case 'ArrayUIElement':
        return ((parentElement.element as any).elements || []).map(ensurePatternLibraryElement);
      case 'ChipGroupUIElement':
        // Chips sind BooleanUIElements, müssen aber als PatternLibraryElement behandelt werden
        return ((parentElement.element as any).chips || []).map((chip: any) => ensurePatternLibraryElement(chip));
      case 'CustomUIElement':
        // Wenn ein CustomUIElement das parentElement ist, sind seine "Kinder" im Kontext des Drilldowns
        // zunächst seine sub_flows. Das Navigieren IN einen Subflow (um dessen Elemente anzuzeigen)
        // wird dadurch gehandhabt, dass getElementByPath das Subflow-Objekt als neues parentElement liefert.
        if ((parentElement.element as any).sub_flows) {
          return ((parentElement.element as any).sub_flows || []).map(ensurePatternLibraryElement);
        }
        // Hat ein CustomUIElement keine sub_flows, könnte es direkte 'elements' haben.
        if (Array.isArray((parentElement.element as any).elements)) {
          return ((parentElement.element as any).elements || []).map(ensurePatternLibraryElement);
        }
        return []; // CustomUIElement ohne sub_flows und ohne elements hat keine Kinder in diesem Kontext
    }

    // Generische Fallbacks für andere Typen, die möglicherweise Kinder haben könnten
    // (z.B. SingleSelectionUIElement mit 'options', KeyValueListUIElement mit 'items')
    // Diese werden typischerweise nicht als "drilldown-fähig" im ElementContextView betrachtet,
    // aber die Logik kann hier zur Vollständigkeit stehen bleiben.
    const potentialChildArrays = ['elements', 'items', 'options'];
    for (const key of potentialChildArrays) {
      const childArray = (parentElement.element as any)[key];
      if (Array.isArray(childArray) && childArray.length > 0) {
        // Prüfen, ob die Elemente der Arrays bereits PatternLibraryElement sind oder rohe Objekte
        return childArray.map((item: any) => ensurePatternLibraryElement(item));
      }
    }

    // Fallback: Wenn kein spezifischer Kind-Array-Typ gefunden wurde, aber eine beliebige Array-Eigenschaft existiert,
    // die Objekte enthält (weniger wahrscheinlich für Drilldown, aber zur Sicherheit)
    for (const key in parentElement.element) {
        const value = (parentElement.element as any)[key];
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
            // Hier ist Vorsicht geboten, da nicht jedes Array von Objekten navigierbare Kinder darstellt.
            // Für den Drilldown sind primär 'elements' in Group/Array/SubFlow und 'sub_flows' in CustomUIElement relevant.
            // Diese sollten von den obigen spezifischen Fällen abgedeckt sein.
        }
    }

    return [];
  }, [ensurePatternLibraryElement]);

  // Die getSubElements Funktion wurde entfernt, da sie redundant zum neuen getChildElements ist

  // Aktualisiere die aktuellen Elemente basierend auf dem Pfad
  useEffect(() => {
    if (currentPath.length === 0) {
      // Wir sind auf der obersten Ebene
      setCurrentElements(elements);
    } else {
      // Wir sind in einem Unterelement
      const parentElement = getElementByPath(elements, currentPath);
      if (parentElement) {
        // Das neue getChildElements benötigt den Pfad nicht mehr direkt,
        // da getElementByPath bereits das korrekte Elternelement liefert.
        const childElements = getChildElements(parentElement);
        setCurrentElements(childElements);
      } else {
        // Wenn kein parentElement für den currentPath gefunden wird, leere Liste anzeigen
        setCurrentElements([]);
      }
    }
  }, [currentPath, elements, getChildElements]); // getElementByPath ist eine importierte Funktion, keine lokale Abhängigkeit

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
  }, [currentPath, elements, getElementLabel]); // getElementByPath ist eine importierte Funktion, keine lokale Abhängigkeit

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
                        if (subFlows[subFlowIndex].elements) {
                          // Wenn das Subflow-Element elements enthält
                          const subflowElements = [...(subFlows[subFlowIndex].elements || [])];

                          // Stelle sicher, dass alle Elemente im korrekten Format sind
                          const normalizedSubflowElements = subflowElements.map((element: any) => {
                            // Wenn das Element bereits ein PatternLibraryElement ist, verwende es direkt
                            if (element.element) {
                              return element;
                            }
                            // Ansonsten konvertiere es zu einem PatternLibraryElement
                            return {
                              element: element
                            };
                          });

                          const updatedSubflowElements = updateElementAtPath(
                            normalizedSubflowElements,
                            restPath.slice(1),
                            updatedElement
                          );

                          // Konvertiere zurück zum ursprünglichen Format, falls nötig
                          const finalSubflowElements = updatedSubflowElements.map((element: any) => {
                            // Wenn das ursprüngliche Format kein PatternLibraryElement war, extrahiere das element
                            if (subflowElements[0] && !subflowElements[0].element) {
                              return element.element;
                            }
                            return element;
                          });

                          subFlows[subFlowIndex] = {
                            ...subFlows[subFlowIndex],
                            elements: finalSubflowElements
                          };
                        } else if (subFlows[subFlowIndex].sub_elements) {
                          // Wenn das Subflow-Element sub_elements enthält
                          // Konvertiere sub_elements zu PatternLibraryElements für updateElementAtPath
                          const subElements = (subFlows[subFlowIndex].sub_elements || []).map((subElement: any) => {
                            // Wenn das Element bereits ein PatternLibraryElement ist, verwende es direkt
                            if (subElement.element) {
                              return subElement;
                            }
                            // Ansonsten konvertiere es zu einem PatternLibraryElement
                            return {
                              element: subElement
                            };
                          });

                          const updatedSubElements = updateElementAtPath(
                            subElements,
                            restPath.slice(1),
                            updatedElement
                          );

                          // Konvertiere zurück zum ursprünglichen Format
                          const updatedSubElementsArray = updatedSubElements.map((subElement: any) => {
                            // Wenn das ursprüngliche Format kein PatternLibraryElement war, extrahiere das element
                            if (subFlows[subFlowIndex].sub_elements[0] && !subFlows[subFlowIndex].sub_elements[0].element) {
                              return subElement.element;
                            }
                            return subElement;
                          });

                          subFlows[subFlowIndex] = {
                            ...subFlows[subFlowIndex],
                            sub_elements: updatedSubElementsArray
                          };
                        } else {
                          console.warn('Subflow hat weder elements noch sub_elements:', subFlows[subFlowIndex]);
                        }
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
                } else {
                  // Prüfe auf andere Arten von Unterelementen
                  if ((element.element as any).elements) {
                    const subElements = [...((element.element as any).elements || [])];

                    // Stelle sicher, dass alle Elemente im korrekten Format sind
                    const normalizedSubElements = subElements.map((subElement: any) => {
                      // Wenn das Element bereits ein PatternLibraryElement ist, verwende es direkt
                      if (subElement.element) {
                        return subElement;
                      }
                      // Ansonsten konvertiere es zu einem PatternLibraryElement
                      return {
                        element: subElement
                      };
                    });

                    const updatedSubElements = updateElementAtPath(
                      normalizedSubElements,
                      restPath,
                      updatedElement
                    );

                    // Konvertiere zurück zum ursprünglichen Format, falls nötig
                    const finalSubElements = updatedSubElements.map((subElement: any) => {
                      // Wenn das ursprüngliche Format kein PatternLibraryElement war, extrahiere das element
                      if (subElements[0] && !subElements[0].element) {
                        return subElement.element;
                      }
                      return subElement;
                    });

                    return {
                      ...element,
                      element: {
                        ...(element.element as any),
                        elements: finalSubElements
                      }
                    };
                  } else if ((element.element as any).items) {
                    // Für Elemente mit items-Array (z.B. KeyValueListUIElement)
                    const items = [...((element.element as any).items || [])];

                    // Konvertiere items zu PatternLibraryElements für updateElementAtPath
                    const itemElements = items.map((item: any) => {
                      // Wenn das Element bereits ein PatternLibraryElement ist, verwende es direkt
                      if (item.element) {
                        return item;
                      }
                      // Ansonsten konvertiere es zu einem PatternLibraryElement
                      return {
                        element: item
                      };
                    });

                    const updatedItemElements = updateElementAtPath(
                      itemElements,
                      restPath,
                      updatedElement
                    );

                    // Konvertiere zurück zum ursprünglichen Format
                    const updatedItems = updatedItemElements.map((itemElement: any) => {
                      // Wenn das ursprüngliche Format kein PatternLibraryElement war, extrahiere das element
                      if (items[0] && !items[0].element) {
                        return itemElement.element;
                      }
                      return itemElement;
                    });

                    return {
                      ...element,
                      element: {
                        ...(element.element as any),
                        items: updatedItems
                      }
                    };
                  } else if ((element.element as any).options) {
                    // Für Elemente mit options-Array (z.B. SingleSelectionUIElement)
                    const options = [...((element.element as any).options || [])];

                    // Konvertiere options zu PatternLibraryElements für updateElementAtPath
                    const optionElements = options.map((option: any) => {
                      // Wenn das Element bereits ein PatternLibraryElement ist, verwende es direkt
                      if (option.element) {
                        return option;
                      }
                      // Ansonsten konvertiere es zu einem PatternLibraryElement
                      return {
                        element: option
                      };
                    });

                    const updatedOptionElements = updateElementAtPath(
                      optionElements,
                      restPath,
                      updatedElement
                    );

                    // Konvertiere zurück zum ursprünglichen Format
                    const updatedOptions = updatedOptionElements.map((optionElement: any) => {
                      // Wenn das ursprüngliche Format kein PatternLibraryElement war, extrahiere das element
                      if (options[0] && !options[0].element) {
                        return optionElement.element;
                      }
                      return optionElement;
                    });

                    return {
                      ...element,
                      element: {
                        ...(element.element as any),
                        options: updatedOptions
                      }
                    };
                  }

                  // Versuche, alle Eigenschaften zu durchsuchen, die Arrays sein könnten und Unterelemente enthalten könnten
                  for (const key in element.element) {
                    if (Array.isArray((element.element as any)[key]) &&
                        (element.element as any)[key].length > 0 &&
                        typeof (element.element as any)[key][0] === 'object') {
                      // Wir haben ein Array von Objekten gefunden, das Unterelemente sein könnten
                      const arrayItems = [...((element.element as any)[key] || [])];

                      // Konvertiere Array-Items zu PatternLibraryElements für updateElementAtPath
                      const arrayItemElements = arrayItems.map((item: any) => {
                        // Wenn das Element bereits ein PatternLibraryElement ist, verwende es direkt
                        if (item.element) {
                          return item;
                        }
                        // Ansonsten konvertiere es zu einem PatternLibraryElement
                        return {
                          element: item
                        };
                      });

                      const updatedArrayItemElements = updateElementAtPath(
                        arrayItemElements,
                        restPath,
                        updatedElement
                      );

                      // Konvertiere zurück zum ursprünglichen Format
                      const updatedArrayItems = updatedArrayItemElements.map((itemElement: any) => {
                        // Wenn das ursprüngliche Format kein PatternLibraryElement war, extrahiere das element
                        if (arrayItems[0] && !arrayItems[0].element) {
                          return itemElement.element;
                        }
                        return itemElement;
                      });

                      return {
                        ...element,
                        element: {
                          ...(element.element as any),
                          [key]: updatedArrayItems
                        }
                      };
                    }
                  }
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
