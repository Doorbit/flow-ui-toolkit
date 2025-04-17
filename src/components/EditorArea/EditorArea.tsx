import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import {
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  Collapse,
  Tooltip
} from '@mui/material';
import ElementTypeDialog from './ElementTypeDialog';
import {
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  DragIndicator as DragHandleIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { PatternLibraryElement } from '../../models/listingFlow';
import { UIElement } from '../../models/uiElements';
import { getElementByPath } from '../../context/EditorContext';
import { useFieldValues } from '../../context/FieldValuesContext';
import { evaluateVisibilityCondition } from '../../utils/visibilityUtils';
// Import der react-dnd Hooks
import { useDrag } from 'react-dnd';
import { useDrop } from 'react-dnd';

const EditorContainer = styled(Paper)`
  flex: 1;
  padding: 1rem;
  background-color: #f9f9f9;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const ElementContainer = styled(Card)<{
  selected?: boolean;
  depth: number;
  isDragging?: boolean;
}>`
  margin-bottom: 1rem;
  position: relative;
  background-color: ${props =>
    props.depth === 0
      ? 'white'
      : props.depth === 1
        ? '#f8f8f8'
        : props.depth === 2
          ? '#f0f0f0'
          : '#e8e8e8'};
  border: 1px solid ${props => props.selected ? '#1976d2' : '#e0e0e0'};
  box-shadow: ${props =>
    props.isDragging
      ? '0 5px 10px rgba(0, 0, 0, 0.2)'
      : props.selected
        ? '0 0 0 2px #1976d2'
        : 'none'};
  opacity: ${props => props.isDragging ? 0.6 : 1};
  cursor: ${props => props.isDragging ? 'grabbing' : 'default'};
`;

const ElementActions = styled(Box)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
`;

const ChildrenContainer = styled(Box)<{ depth: number }>`
  margin-left: ${props => props.depth === 0 ? '0' : '1rem'};
  padding-left: 1rem;
  border-left: ${props => props.depth === 0 ? 'none' : '1px dashed #ccc'};
  margin-top: 1rem;
`;

const EmptyState = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #757575;
  padding: 2rem;
`;

const DropZone = styled(Box)<{ isOver?: boolean }>`
  border: 2px dashed ${props => props.isOver ? '#1976d2' : '#ccc'};
  border-radius: 4px;
  padding: 1rem;
  margin: 0.5rem 0;
  text-align: center;
  color: #757575;
  background-color: ${props => props.isOver ? 'rgba(25, 118, 210, 0.05)' : 'transparent'};
  transition: all 0.2s ease;
`;

const ElementDropZoneWrapper = styled(Box)`
  height: 10px;
  margin: 4px 0;
`;

const ElementDropZoneLine = styled(Box)<{ canDrop: boolean }>`
  height: 2px;
  background-color: ${props => props.canDrop ? '#1976d2' : '#ff3d00'};
  width: 100%;
  transition: all 0.2s ease;
`;

const AddElementButton = styled(Button)`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`;

// Drag-Item-Typen für react-dnd
const ItemTypes = {
  ELEMENT: 'element',
  PALETTE_ITEM: 'palette_item'
};

// Interface für die Drag-Item-Daten
interface DragItem {
  type: string;
  id: string;
  path: number[];
  element: PatternLibraryElement;
}

interface EditorAreaProps {
  elements: PatternLibraryElement[];
  selectedElementPath?: number[];
  onSelectElement: (path: number[]) => void;
  onRemoveElement: (path: number[]) => void;
  onDuplicateElement: (path: number[]) => void;
  onAddSubElement?: (parentPath: number[], type: string) => void;
  onDropElement?: (type: string, parentPath?: number[]) => void;
  onMoveElement?: (sourceIndex: number, targetIndex: number, parentPath?: number[], sourcePath?: number[]) => void;
}

// Mock-Komponente zur Darstellung eines UI-Elements im Editor
const ElementPreview: React.FC<{ element: UIElement }> = ({ element }) => {
  let content;

  switch (element.pattern_type) {
    case 'TextUIElement':
      content = (
        <Box>
          <Typography variant="subtitle1">
            {element.title?.de || element.title?.en || 'Text'}
          </Typography>
          <Typography>
            {(element as any).text?.de || (element as any).text?.en || 'Text Inhalt'}
          </Typography>
        </Box>
      );
      break;
    case 'SingleSelectionUIElement':
      content = (
        <Box>
          <Typography variant="subtitle1">
            {element.title?.de || element.title?.en || 'Auswahl'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {(element as any).options?.map((option: any, index: number) => (
              <Button key={index} variant="outlined" size="small">
                {option.label?.de || option.label?.en || option.key}
              </Button>
            ))}
          </Box>
        </Box>
      );
      break;
    case 'GroupUIElement':
      content = (
        <Box>
          <Typography variant="subtitle1">
            {element.title?.de || element.title?.en || 'Gruppe'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gruppe enthält {(element as any).elements?.length || 0} Elemente
          </Typography>
        </Box>
      );
      break;
    case 'ArrayUIElement':
      content = (
        <Box>
          <Typography variant="subtitle1">
            {element.title?.de || element.title?.en || 'Array'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Array mit {(element as any).elements?.length || 0} Elementen (Min: {(element as any).min_count}, Max: {(element as any).max_count})
          </Typography>
        </Box>
      );
      break;
    default:
      content = (
        <Typography>
          {element.pattern_type}: {element.title?.de || element.title?.en || 'Element'}
        </Typography>
      );
  }

  return (
    <Box>
      {content}
    </Box>
  );
};

// Hilfsfunktion, um Fehlermeldungen für Drop-Operationen zu generieren
const getDropErrorMessage = (parentPath: number[] | undefined, elements: PatternLibraryElement[]): string => {
  if (parentPath && elements[parentPath[0]]?.element.pattern_type === 'ChipGroupUIElement') {
    return "Nur Boolean-Elemente können in ChipGroups abgelegt werden";
  }

  if (parentPath && elements[parentPath[0]]?.element.pattern_type === 'ArrayUIElement') {
    return "Arrays dürfen keine weiteren Arrays oder komplexe Elemente enthalten";
  }

  if (parentPath && elements[parentPath[0]]?.element.pattern_type === 'GroupUIElement') {
    return "Gruppen dürfen keine weiteren Gruppen enthalten";
  }

  return "Element kann hier nicht abgelegt werden";
};

// Drop-Zone-Komponente, die zwischen Elementen angezeigt wird
const ElementDropZone: React.FC<{
  index: number;
  parentPath?: number[];
  elements: PatternLibraryElement[];
  onMoveElement: (sourceIndex: number, targetIndex: number, targetParentPath?: number[], sourcePath?: number[]) => void;
}> = ({ index, parentPath, elements, onMoveElement }) => {
  // Erstellen eines Refs
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.ELEMENT,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    }),
  canDrop: (item: DragItem) => {
    // Prüfe, ob das Ziel eine ChipGroup ist
    if (parentPath && elements[parentPath[0]]?.element.pattern_type === 'ChipGroupUIElement') {
      // Nur BooleanUIElements in ChipGroups erlauben
      return item.element.element.pattern_type === 'BooleanUIElement';
    }

    // Prüfe, ob das Ziel ein Array-Element ist
    if (parentPath && elements[parentPath[0]]?.element.pattern_type === 'ArrayUIElement') {
      // Arrays dürfen keine weiteren Arrays oder komplexe Elemente enthalten
      const elementType = item.element.element.pattern_type;
      return !['ArrayUIElement', 'GroupUIElement', 'CustomUIElement', 'ChipGroupUIElement'].includes(elementType);
    }

    // Prüfe, ob das Ziel ein Gruppen-Element ist
    if (parentPath && elements[parentPath[0]]?.element.pattern_type === 'GroupUIElement') {
      // Gruppen dürfen keine weiteren Gruppen enthalten
      return item.element.element.pattern_type !== 'GroupUIElement';
    }

    return true;
  },
  drop: (item: DragItem) => {
    // Extrahiere den vollständigen Pfad der Quelle
    const sourcePath = item.path;
    // Der letzte Index im Pfad ist der Index des Elements im Eltern-Container
    const sourceIndex = sourcePath[sourcePath.length - 1];
    // Neuer Index, wo das Element abgelegt werden soll
    const targetIndex = index;

    // Übergeordneter Pfad, wo das Element hinzugefügt werden soll
    const targetParentPath = parentPath || [];

    // Wenn Quell- und Zielindex identisch sind und auf gleicher Ebene, nichts tun
    if (sourceIndex === targetIndex &&
        JSON.stringify(sourcePath.slice(0, -1)) === JSON.stringify(targetParentPath)) {
      return;
    }

    // Prüfe, ob das Ziel eine ChipGroup ist und das Element kein BooleanUIElement
    if (parentPath &&
        elements[parentPath[0]]?.element.pattern_type === 'ChipGroupUIElement' &&
        item.element.element.pattern_type !== 'BooleanUIElement') {
      console.log('Nur Boolean-Elemente können in ChipGroups abgelegt werden');
      return;
    }

    // Prüfe, ob die Quelle eine ChipGroup ist
    const sourceParentPath = sourcePath.slice(0, -1);
    const sourceParent = sourceParentPath.length > 0 ?
      getElementByPath(elements, sourceParentPath) : null;

    const isSourceInChipGroup = sourceParent &&
      sourceParent.element.pattern_type === 'ChipGroupUIElement';

    // Prüfe, ob das Ziel eine ChipGroup ist
    const isTargetChipGroup = parentPath &&
      elements[parentPath[0]]?.element.pattern_type === 'ChipGroupUIElement';

    console.log('Drag source path:', sourcePath);
    console.log('Drag target parent path:', targetParentPath, 'target index:', targetIndex);
    console.log('Source in ChipGroup:', isSourceInChipGroup, 'Target is ChipGroup:', isTargetChipGroup);

    // Hier übergeben wir nun den vollständigen Quellpfad an die App.tsx
    onMoveElement(sourceIndex, targetIndex, parentPath, sourcePath);
    },
  });

  // Verbinden des useDrop-Hooks mit dem Ref
  // Wichtig: useEffect verwenden, damit es nur einmal eingerichtet wird
  React.useEffect(() => {
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drop, elements, parentPath, index]);

  return (
    <ElementDropZoneWrapper>
      <div ref={dropRef} style={{ height: '100%' }}>
        {isOver && (
          <Tooltip
            title={!canDrop ? getDropErrorMessage(parentPath, elements) : ""}
            open={isOver && !canDrop}
            placement="top"
          >
            <ElementDropZoneLine canDrop={canDrop} />
          </Tooltip>
        )}
      </div>
    </ElementDropZoneWrapper>
  );
};

// Rekursive Komponente zum Rendern von Elementen und deren Kinder
const ElementRenderer: React.FC<{
  element: PatternLibraryElement;
  path: number[];
  depth: number;
  selectedPath?: number[];
  elements: PatternLibraryElement[];
  onSelectElement: (path: number[]) => void;
  onRemoveElement: (path: number[]) => void;
  onDuplicateElement: (path: number[]) => void;
  onAddSubElement?: (parentPath: number[], type: string) => void;
  onMoveElement?: (sourceIndex: number, targetIndex: number, parentPath?: number[], sourcePath?: number[]) => void;
  setShowElementTypeModal: React.Dispatch<React.SetStateAction<boolean>>;
  setTargetParentPath: React.Dispatch<React.SetStateAction<number[] | undefined>>;
}> = ({
  element,
  path,
  depth,
  selectedPath,
  elements,
  onSelectElement,
  onRemoveElement,
  onDuplicateElement,
  onAddSubElement,
  onMoveElement,
  setShowElementTypeModal,
  setTargetParentPath
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const dragRef = useRef(null);
  const { fieldValues } = useFieldValues();

  // Setup drag source - muss vor bedingten Rückgaben aufgerufen werden
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ELEMENT,
    item: {
      type: ItemTypes.ELEMENT,
      id: path.join('-'), // Erstelle eine eindeutige ID für das Element
      path,
      element,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Prüfe, ob das Element basierend auf seiner Visibility-Bedingung sichtbar sein sollte
  const isVisible = evaluateVisibilityCondition(element.element.visibility_condition, fieldValues);

  // Wenn das Element nicht sichtbar sein soll, rendere nichts
  if (!isVisible) {
    return null;
  }

  const isSelected = selectedPath &&
    selectedPath.length === path.length &&
    selectedPath.every((val, idx) => val === path[idx]);

  // Prüfen, ob das Element Kinder hat (für die Anzeige des Expand/Collapse-Buttons)
  const hasContainerType =
    element.element.pattern_type === 'GroupUIElement' ||
    element.element.pattern_type === 'ArrayUIElement' ||
    element.element.pattern_type === 'ChipGroupUIElement';

  const addButtonLabel =
    element.element.pattern_type === 'GroupUIElement'
      ? "Element zur Gruppe hinzufügen"
      : element.element.pattern_type === 'ArrayUIElement'
        ? "Element zum Array hinzufügen"
        : element.element.pattern_type === 'ChipGroupUIElement'
          ? "Boolean zur Chip-Gruppe hinzufügen"
          : "";



  // Wende den Ref auf das Element an
  drag(dragRef);

  return (
    <>
      <ElementContainer
        ref={dragRef}
        selected={isSelected}
        depth={depth}
        isDragging={isDragging}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <IconButton
              size="small"
              sx={{ mr: 1, cursor: 'grab' }}
            >
              <DragHandleIcon fontSize="small" />
            </IconButton>

            {hasContainerType && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                size="small"
                sx={{ mr: 1 }}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}

          <Box onClick={() => onSelectElement(path)} sx={{ flex: 1, cursor: 'pointer' }}>
            <ElementPreview element={element.element} />
          </Box>

            <ElementActions>
              {element.element.visibility_condition && (
                <Tooltip title="Element hat Sichtbarkeitsregeln">
                  <IconButton size="small" disabled>
                    <VisibilityIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Duplizieren">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateElement(path);
                  }}
                >
                  <DuplicateIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Löschen">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveElement(path);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ElementActions>
          </Box>

          {/* Render Kinder für GroupUIElement, ArrayUIElement und ChipGroupUIElement */}
          {hasContainerType && (
            <>
              <Collapse in={isExpanded}>
                <ChildrenContainer depth={depth}>
                  {/* Für Group/Array: elements, für ChipGroup: chips */}
                  {(() => {
                    // Extrahiere die Unterelemente basierend auf dem Elementtyp
                    let childElements: PatternLibraryElement[] = [];

                    if (element.element.pattern_type === 'ChipGroupUIElement') {
                      // Für ChipGroups: Konvertiere BooleanUIElements zu PatternLibraryElements
                      childElements = ((element.element as any).chips || []).map((chipElement: any) => ({
                        element: chipElement // Wrappen von BooleanUIElement in PatternLibraryElement-Struktur
                      }));
                    } else {
                      // Für Group/Array: Verwende elements-Array
                      childElements = (element.element as any).elements || [];
                    }

                    return childElements.map((childElement: PatternLibraryElement, index: number) => (
                      <React.Fragment key={`fragment-${index}`}>
                        {onMoveElement && (
                          <ElementDropZone
                            key={`drop-${index}`}
                            index={index}
                            parentPath={path}
                            elements={elements}
                            onMoveElement={onMoveElement}
                          />
                        )}
                        <ElementRenderer
                          key={`element-${index}`}
                          element={childElement}
                          path={[...path, index]}
                          depth={depth + 1}
                          selectedPath={selectedPath}
                          elements={elements}
                          onSelectElement={onSelectElement}
                          onRemoveElement={onRemoveElement}
                          onDuplicateElement={onDuplicateElement}
                          onAddSubElement={onAddSubElement}
                          onMoveElement={onMoveElement}
                          setShowElementTypeModal={setShowElementTypeModal}
                          setTargetParentPath={setTargetParentPath}
                        />
                      </React.Fragment>
                    ));
                  })()
                  }

                  {/* Button zum Hinzufügen von Unterelementen */}
                  {onAddSubElement && (
                    <AddElementButton
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        // Dialog öffnen und Elternpfad speichern
                        setTargetParentPath(path);
                        setShowElementTypeModal(true);
                      }}
                    >
                      {addButtonLabel}
                    </AddElementButton>
                  )}
                </ChildrenContainer>
              </Collapse>
            </>
          )}
        </CardContent>
      </ElementContainer>
    </>
  );
};

const EditorArea: React.FC<EditorAreaProps> = ({
  elements,
  selectedElementPath = [],
  onSelectElement,
  onRemoveElement,
  onDuplicateElement,
  onAddSubElement,
  onDropElement,
  onMoveElement
}) => {
  const [showElementTypeModal, setShowElementTypeModal] = useState(false);
  const [targetParentPath, setTargetParentPath] = useState<number[] | undefined>(undefined);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('element_type');
    if (elementType && onDropElement) {
      onDropElement(elementType, targetParentPath);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handler für die Auswahl eines Elementtyps aus dem Dialog
  const handleSelectElementType = (type: string) => {
    if (targetParentPath && onAddSubElement) {
      onAddSubElement(targetParentPath, type);
    }
    // Dialog schließen
    setShowElementTypeModal(false);
  };

  return (
    <EditorContainer>
      <Typography variant="h6" gutterBottom>
        Editor
      </Typography>

      {/* ElementTypeDialog für die Auswahl eines Elements zur Gruppe/Array hinzufügen */}
      <ElementTypeDialog
        open={showElementTypeModal}
        onClose={() => setShowElementTypeModal(false)}
        onSelectElementType={handleSelectElementType}
        parentElementType={targetParentPath ?
          elements[targetParentPath[0]]?.element.pattern_type : undefined}
      />

      {elements.length === 0 ? (
        <EmptyState onDrop={handleDrop} onDragOver={handleDragOver}>
          <Typography variant="body1" gutterBottom>
            Ziehen Sie Elemente aus der Palette hierher
          </Typography>
          <Typography variant="body2">
            Oder klicken Sie, um ein Element hinzuzufügen
          </Typography>
        </EmptyState>
      ) : (
        <Box>
          {elements.map((element, index) => (
            <>
              {onMoveElement && index > 0 && (
            <ElementDropZone
              key={`drop-${index}`}
              index={index}
              elements={elements}
              onMoveElement={onMoveElement}
                />
              )}
              <ElementRenderer
                key={`element-${index}`}
                element={element}
                path={[index]}
                depth={0}
                selectedPath={selectedElementPath}
                elements={elements}
                onSelectElement={onSelectElement}
                onRemoveElement={onRemoveElement}
                onDuplicateElement={onDuplicateElement}
                onAddSubElement={onAddSubElement}
                onMoveElement={onMoveElement}
                setShowElementTypeModal={setShowElementTypeModal}
                setTargetParentPath={setTargetParentPath}
              />
            </>
          ))}

          {/* Letzte DropZone für das Ende der Liste */}
          {onMoveElement && elements.length > 0 && (
            <ElementDropZone
              key={`drop-end`}
              index={elements.length}
              elements={elements}
              onMoveElement={onMoveElement}
            />
          )}

          <DropZone onDrop={handleDrop} onDragOver={handleDragOver}>
            <Typography>
              Element hier ablegen
            </Typography>
          </DropZone>
        </Box>
      )}
    </EditorContainer>
  );
};

export default EditorArea;
