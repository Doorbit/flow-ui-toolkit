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
import { useEditor, getElementByPath, getContainerType, getPathContext } from '../../context/EditorContext';
import ElementHierarchyTree from './ElementHierarchyTree';
import ElementContextView from './ElementContextView';
import EnhancedPropertyEditor from './EnhancedPropertyEditor';
import VisibilityLegend from './VisibilityLegend';
import FolderIcon from '@mui/icons-material/Folder';
import ViewArrayIcon from '@mui/icons-material/ViewArray';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CodeIcon from '@mui/icons-material/Code';
// import { arePathsEqual, getParentPath } from '../../utils/pathUtils';

// Styled Components für das Layout
const EditorContainer = styled(Box)`
  display: flex;
  flex: 1;
  height: calc(100vh - 120px); /* Abzüglich Navigation und PageNavigator */
  overflow: hidden;
`;

const LeftColumn = styled.div`
  width: 260px; // Erhöht um 10px
  height: 100%;
  overflow-y: auto;
  background-color: #F0F2F4;
  border-right: 1px solid #E0E0E0;
  display: flex;
  flex-direction: column;
`;

const MiddleColumn = styled.div`
  width: calc((100% - 260px) / 2); // Anpassung an neue Breite der LeftColumn
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
  background-color: #F8FAFC;
  display: flex;
  flex-direction: column;
`;

const RightColumn = styled.div`
  width: calc((100% - 260px) / 2); // Anpassung an neue Breite der LeftColumn
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
  onAddElement?: (type: string, elementPath?: number[]) => void; // Neue einheitliche Funktion für das Hinzufügen von Elementen
}

const HybridEditor: React.FC<HybridEditorProps> = ({
  elements,
  selectedElementPath = [],
  onSelectElement,
  onRemoveElement,
  onDuplicateElement,
  onAddSubElement,
  onDropElement,
  onMoveElement,
  onAddElement
}) => {
  const { state, dispatch } = useEditor();
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [currentElements, setCurrentElements] = useState<PatternLibraryElement[]>(elements);
  // Definiere den Typ für Breadcrumb-Items
  interface BreadcrumbItem {
    label: string;
    path: number[];
    containerType?: string; // Der Typ des Containers (group, array, chipgroup, custom, subflow)
  }

  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([{ label: 'Hauptebene', path: [], containerType: 'root' }]);

  useEffect(() => {
    console.log('[HybridEditor useEffect] Triggered. selectedElementPath:', selectedElementPath, 'currentPath:', currentPath);

    // Da selectedElementPath einen Default-Wert von [] hat, sollte es immer ein Array sein.
    // Wir prüfen die Länge, um zwischen Hauptebenen-Auswahl und spezifischer Element-Auswahl zu unterscheiden.
    if (selectedElementPath.length === 0) {
      // Fall: Hauptebene ist ausgewählt (oder keine spezifische Auswahl)
      if (JSON.stringify([]) !== JSON.stringify(currentPath)) {
        console.log('[HybridEditor useEffect] Hauptebene ausgewählt: Setze currentPath auf [].');
        setCurrentPath([]);
      }
    } else {
      // Fall: Ein spezifisches Element ist ausgewählt (selectedElementPath hat Länge > 0)
      const parentOfSelected = selectedElementPath.slice(0, -1);
      console.log('[HybridEditor useEffect] Spezifisches Element ausgewählt. parentOfSelected:', parentOfSelected);

      // Wenn currentPath NICHT identisch zu selectedElementPath ist:
      // Dies bedeutet, dass die Auswahl (selectedElementPath) nicht das Ergebnis eines direkten Drilldowns
      // auf dieses Element war (wobei currentPath auf selectedElementPath gesetzt worden wäre).
      // Typischerweise ist dies ein Klick im linken Baum.
      // In diesem Fall soll der ElementContextView den Elternkontext des ausgewählten Elements anzeigen.
      if (JSON.stringify(currentPath) !== JSON.stringify(selectedElementPath)) {
        if (JSON.stringify(parentOfSelected) !== JSON.stringify(currentPath)) {
          console.log('[HybridEditor useEffect] Auswahl extern/anderer Zweig: Setze currentPath auf parentOfSelected:', parentOfSelected);
          setCurrentPath(parentOfSelected);
        } else {
          // currentPath ist bereits der parentOfSelected.
          // z.B. currentPath = [0], selectedElementPath = [0,1]. parentOfSelected ist [0].
          // Keine Änderung an currentPath nötig.
          console.log('[HybridEditor useEffect] Auswahl Kind im aktuellen Kontext: currentPath bleibt (ist parentOfSelected). currentPath:', currentPath);
        }
      } else {
        // currentPath IST identisch zu selectedElementPath.
        // Dies geschieht direkt nach einem handleDrillDown, wo beide auf denselben Pfad gesetzt wurden.
        // currentPath soll so bleiben, damit die Kinder des gedrillten Elements angezeigt werden.
        console.log('[HybridEditor useEffect] Nach Drilldown: currentPath ist selectedElementPath. currentPath bleibt. currentPath:', currentPath);
      }
    }
  }, [selectedElementPath, currentPath]);

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

  // Hilfsfunktion zum Generieren eines Icons für einen Containertyp
  const getContainerIcon = React.useCallback((element: PatternLibraryElement) => {
    const containerType = getContainerType(element);

    switch (containerType) {
      case 'group':
        return <FolderIcon fontSize="small" />;
      case 'array':
        return <ViewArrayIcon fontSize="small" />;
      case 'chipgroup':
        return <ToggleOnIcon fontSize="small" />;
      case 'custom':
        return <ViewModuleIcon fontSize="small" />;
      case 'subflow':
        return <CodeIcon fontSize="small" />;
      default:
        return null;
    }
  }, []);

  // Aktualisiere die Breadcrumb-Items basierend auf dem Pfad
  useEffect(() => {
    const items: BreadcrumbItem[] = [{ label: 'Hauptebene', path: [], containerType: 'root' }];

    if (currentPath.length > 0) {
      let currentPathSegment: number[] = [];

      for (let i = 0; i < currentPath.length; i++) {
        currentPathSegment = [...currentPathSegment, currentPath[i]];
        const element = getElementByPath(elements, currentPathSegment);

        if (element) {
          const label = getElementLabel(element, currentPath[i]);
          const containerType = getContainerType(element);

          const newItem: BreadcrumbItem = {
            label,
            path: [...currentPathSegment],
            containerType
          };
          items.push(newItem);
        }
      }
    }

    console.log('[HybridEditor updateBreadcrumbs] Neue Breadcrumb-Items:', items);
    setBreadcrumbItems(items);
  }, [currentPath, elements, getElementLabel]); // getElementByPath ist eine importierte Funktion, keine lokale Abhängigkeit

  // Handler für die Navigation in der Hierarchie
  const handleNavigateTo = (path: number[]) => {
    setCurrentPath(path);
  };

  // Handler für "Tiefer gehen" in ein Element
  const handleDrillDown = (path: number[]) => {
    console.log('[HybridEditor handleDrillDown] path:', path);
    setCurrentPath(path);

    // Aktualisiere auch das ausgewählte Element
    onSelectElement(path);
  };

  // Handler für die Navigation zu einem Element (für StructureNavigator)
  const handleNavigateToElement = (path: number[]) => {
    console.log('[HybridEditor handleNavigateToElement] path:', path);
    // Aktualisiere den aktuellen Pfad
    setCurrentPath(path);
    // Aktualisiere auch das ausgewählte Element
    onSelectElement(path);
  };

  // Handler für "Zurück" zur übergeordneten Ebene
  const handleGoBack = () => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1);
      console.log('[HybridEditor handleGoBack] newPath:', newPath);
      setCurrentPath(newPath);
    }
  };
  console.log('[HybridEditor Render] selectedElementPath (prop):', selectedElementPath, 'currentPath (state):', currentPath);
  // Einheitliche Funktion für das Hinzufügen von Elementen, die den currentPath und Pfadkontext korrekt berücksichtigt
  const handleAddElement = React.useCallback((type: string, elementPath?: number[]) => {
    console.log('[HybridEditor handleAddElement] type:', type, 'elementPath:', elementPath, 'currentPath:', currentPath);

    // Wenn elementPath null ist, verwenden wir currentPath
    const targetPath = elementPath || currentPath;

    // Bestimme den Pfadkontext für den Zielpfad
    const pathContext = elements.length > 0 ? getPathContext(elements, targetPath) : null;
    console.log('[HybridEditor handleAddElement] pathContext:', pathContext);

    // Wenn die externe onAddElement-Funktion verfügbar ist, verwenden wir diese
    if (onAddElement) {
      // Wichtig: Wenn elementPath gleich currentPath ist, bedeutet das, dass wir ein Element auf der aktuellen Ebene hinzufügen wollen
      // In diesem Fall müssen wir sicherstellen, dass das Element auch wirklich auf der aktuellen Ebene hinzugefügt wird
      if (elementPath && JSON.stringify(elementPath) === JSON.stringify(currentPath)) {
        console.log('[HybridEditor handleAddElement] Element auf aktueller Ebene hinzufügen, currentPath:', currentPath);
        onAddElement(type, currentPath);
      } else {
        console.log('[HybridEditor handleAddElement] Verwende externe onAddElement-Funktion');

        // Wenn wir einen Pfadkontext haben, berücksichtigen wir den Containertyp
        if (pathContext && pathContext.isValid) {
          console.log('[HybridEditor handleAddElement] Containertyp:', pathContext.containerType);

          // Spezielle Behandlung für verschiedene Containertypen
          switch (pathContext.containerType) {
            case 'chipgroup':
              // Bei ChipGroup immer ein BooleanUIElement hinzufügen
              if (type !== 'BooleanUIElement') {
                console.log('[HybridEditor handleAddElement] Erzwinge BooleanUIElement für ChipGroup');
                onAddElement('BooleanUIElement', elementPath);
                return;
              }
              break;

            case 'custom':
              // Bei CustomUIElement mit sub_flows spezielle Behandlung für CustomUIElement_*
              if (type.startsWith('CustomUIElement_')) {
                console.log('[HybridEditor handleAddElement] Spezielle Behandlung für CustomUIElement_* in CustomUIElement');
                // Hier könnten wir weitere spezielle Logik hinzufügen
              }
              break;

            case 'subflow':
              // Bei Subflow spezielle Behandlung
              console.log('[HybridEditor handleAddElement] Spezielle Behandlung für Subflow');
              // Hier könnten wir weitere spezielle Logik hinzufügen
              break;
          }
        }

        onAddElement(type, elementPath);
      }
      return;
    }

    // Fallback auf die alten Funktionen, wenn onAddElement nicht verfügbar ist
    // Fall 1: Kein elementPath angegeben - Element auf der aktuellen Navigationsebene hinzufügen
    if (!elementPath || elementPath.length === 0) {
      console.log('[HybridEditor handleAddElement] Fall 1: Element auf aktueller Ebene hinzufügen, currentPath:', currentPath);
      if (onDropElement) {
        onDropElement(type, currentPath);
      }
    }
    // Fall 1b: elementPath ist gleich currentPath - Element auf der aktuellen Navigationsebene hinzufügen
    else if (JSON.stringify(elementPath) === JSON.stringify(currentPath)) {
      console.log('[HybridEditor handleAddElement] Fall 1b: Element auf aktueller Ebene hinzufügen, currentPath:', currentPath);
      if (onDropElement) {
        onDropElement(type, currentPath);
      }
    }
    // Fall 2: elementPath ist ein Index innerhalb der aktuellen Ansicht - Unterelement hinzufügen
    else if (elementPath.length === 1 && currentPath.length > 0) {
      const fullPath = [...currentPath, elementPath[0]];
      console.log('[HybridEditor handleAddElement] Fall 2: Unterelement hinzufügen, fullPath:', fullPath);
      if (onAddSubElement) {
        onAddSubElement(fullPath, type);
      }
    }
    // Fall 3: elementPath ist ein vollständiger Pfad - direkt verwenden
    else {
      console.log('[HybridEditor handleAddElement] Fall 3: Vollständigen Pfad verwenden, elementPath:', elementPath);

      // Wenn wir einen Pfadkontext haben, berücksichtigen wir den Containertyp
      if (pathContext && pathContext.isValid && onAddSubElement) {
        console.log('[HybridEditor handleAddElement] Containertyp:', pathContext.containerType);

        // Spezielle Behandlung für verschiedene Containertypen
        switch (pathContext.containerType) {
          case 'chipgroup':
            // Bei ChipGroup immer ein BooleanUIElement hinzufügen
            if (type !== 'BooleanUIElement') {
              console.log('[HybridEditor handleAddElement] Erzwinge BooleanUIElement für ChipGroup');
              onAddSubElement(elementPath, 'BooleanUIElement');
              return;
            }
            break;
        }
      }

      if (onAddSubElement) {
        onAddSubElement(elementPath, type);
      }
    }
  }, [currentPath, onDropElement, onAddSubElement, onAddElement, elements]);

  // Wrapper-Funktion für onAddSubElement, die den currentPath berücksichtigt
  const handleAddSubElement = React.useCallback((parentPath: number[], type?: string) => {
    console.log('[HybridEditor handleAddSubElement] parentPath:', parentPath, 'currentPath:', currentPath, 'type:', type);

    // Wir verwenden jetzt die einheitliche handleAddElement-Funktion
    if (type) {
      handleAddElement(type, parentPath);
    } else {
      // Fallback für den Fall, dass kein Typ angegeben ist
      handleAddElement('TextUIElement', parentPath);
    }
  }, [handleAddElement, currentPath]);

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

              // Icon basierend auf dem Containertyp
              let icon = null;
              switch (item.containerType) {
                case 'group':
                  icon = <FolderIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />;
                  break;
                case 'array':
                  icon = <ViewArrayIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />;
                  break;
                case 'chipgroup':
                  icon = <ToggleOnIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />;
                  break;
                case 'custom':
                  icon = <ViewModuleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />;
                  break;
                case 'subflow':
                  icon = <CodeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />;
                  break;
                case 'root':
                  icon = <HomeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />;
                  break;
              }

              return isLast ? (
                <Typography key={index} color="text.primary" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  {icon}
                  {item.label}
                  {item.containerType && item.containerType !== 'root' && (
                    <Tooltip title={`Container-Typ: ${item.containerType}`}>
                      <Box component="span" sx={{ ml: 0.5, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#f0f0f0', px: 0.5, borderRadius: 1 }}>
                        {item.containerType}
                      </Box>
                    </Tooltip>
                  )}
                </Typography>
              ) : (
                <Link
                  key={index}
                  component="button"
                  variant="body2"
                  onClick={() => handleNavigateTo(item.path)}
                  sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {icon}
                  {item.label}
                  {item.containerType && item.containerType !== 'root' && (
                    <Tooltip title={`Container-Typ: ${item.containerType}`}>
                      <Box component="span" sx={{ ml: 0.5, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#f0f0f0', px: 0.5, borderRadius: 1 }}>
                        {item.containerType}
                      </Box>
                    </Tooltip>
                  )}
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
          onAddSubElement={handleAddSubElement}
          onDropElement={onDropElement}
          onMoveElement={onMoveElement}
          onDrillDown={handleDrillDown}
          onAddElement={handleAddElement} // Neue einheitliche Funktion für das Hinzufügen von Elementen
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
