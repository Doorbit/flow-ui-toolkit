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
  DragIndicator as DragHandleIcon
} from '@mui/icons-material';
import { PatternLibraryElement } from '../../models/listingFlow';
import { UIElement } from '../../models/uiElements';
import { getElementByPath } from '../../context/EditorContext';
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

const ElementDropZoneLine = styled(Box)`
  height: 2px;
  background-color: #1976d2;
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

// Drop-Zone-Komponente, die zwischen Elementen angezeigt wird
const ElementDropZone: React.FC<{
  index: number;
  parentPath?: number[];
  onMoveElement: (sourceIndex: number, targetIndex: number, targetParentPath?: number[], sourcePath?: number[]) => void;
}> = ({ index, parentPath, onMoveElement }) => {
  // Erstellen eines Refs
  const dropRef = useRef<HTMLDivElement>(null);
  
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.ELEMENT,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
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
      
      console.log('Drag source path:', sourcePath);
      console.log('Drag target parent path:', targetParentPath, 'target index:', targetIndex);
      
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
  }, [drop]);

  return (
    <ElementDropZoneWrapper>
      <div ref={dropRef} style={{ height: '100%' }}>
        {isOver && <ElementDropZoneLine />}
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
  
  const isSelected = selectedPath && 
    selectedPath.length === path.length && 
    selectedPath.every((val, idx) => val === path[idx]);

  const hasChildren = 
    (element.element.pattern_type === 'GroupUIElement' || element.element.pattern_type === 'ArrayUIElement') && 
    (element.element as any).elements && 
    (element.element as any).elements.length > 0;

  const addButtonLabel = element.element.pattern_type === 'GroupUIElement' 
    ? "Element zur Gruppe hinzufügen" 
    : element.element.pattern_type === 'ArrayUIElement'
      ? "Element zum Array hinzufügen"
      : "";

  // Setup drag source
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
            
            {(element.element.pattern_type === 'GroupUIElement' || element.element.pattern_type === 'ArrayUIElement') && (
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

          {/* Render Kinder für GroupUIElement und ArrayUIElement */}
          {(element.element.pattern_type === 'GroupUIElement' || element.element.pattern_type === 'ArrayUIElement') && (
            <>
              <Collapse in={isExpanded}>
                <ChildrenContainer depth={depth}>
                  {(element.element as any).elements?.map((childElement: PatternLibraryElement, index: number) => (
                    <>
                      {onMoveElement && (
                        <ElementDropZone
                          key={`drop-${index}`}
                          index={index}
                          parentPath={path}
                          onMoveElement={onMoveElement}
                        />
                      )}
                      <ElementRenderer
                        key={`element-${index}`}
                        element={childElement}
                        path={[...path, index]}
                        depth={depth + 1}
                        selectedPath={selectedPath}
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
                  onMoveElement={onMoveElement}
                />
              )}
              <ElementRenderer
                key={`element-${index}`}
                element={element}
                path={[index]}
                depth={0}
                selectedPath={selectedElementPath}
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
