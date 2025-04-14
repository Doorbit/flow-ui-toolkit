import React, { useRef, forwardRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Tab, IconButton, Tooltip, TabProps } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Page } from '../../models/listingFlow';

// Konstanten für DnD
export const ItemTypes = {
  PAGE_TAB: 'page-tab'
};

interface PageTabProps {
  page: Page;
  index: number;
  selectedPageId: string | null;
  isLastPage: boolean;
  onDelete: (pageId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const PageTab: React.FC<PageTabProps> = ({ 
  page, 
  index, 
  selectedPageId, 
  isLastPage,
  onDelete,
  onMove,
  onClick
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PAGE_TAB,
    item: () => {
      return { index, id: page.id, type: ItemTypes.PAGE_TAB };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: ItemTypes.PAGE_TAB,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Nicht auf sich selbst droppen
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Bestimme Rechteck des Hover-Elements
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Bestimme horizontale Mitte
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      
      // Bestimme Mausposition
      const clientOffset = monitor.getClientOffset();
      
      // Horizontale Position relativ zum Tab
      const hoverClientX = (clientOffset as { x: number }).x - hoverBoundingRect.left;
      
      // Verschieben nur, wenn Maus über die Mitte geht
      // Nach links verschieben
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }
      
      // Nach rechts verschieben
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }
      
      // Zeit zum Verschieben
      onMove(dragIndex, hoverIndex);
      
      // Anpassen des Monitor-Items für korrekte Positionierung
      item.index = hoverIndex;
    },
  });
  
  // Setzen der Drag-and-Drop-Referenzen
  drag(drop(ref));
  
  // CSS für Drag-and-Drop
  const opacity = isDragging ? 0.4 : 1;
  
  return (
    <div 
      ref={ref} 
      style={{ 
        opacity, 
        cursor: 'move',
        display: 'inline-flex',
        alignItems: 'center'
      }}
      data-handler-id={handlerId}
      onClick={onClick}
      // Um das onClick-Event von eventuellen Parent-Elementen zu empfangen
      className="MuiButtonBase-root MuiTab-root MuiTab-textColorPrimary"
    >
      <Tab 
        value={page.id} 
        label={page.title?.de || page.id}
        sx={{
          cursor: 'move',
          '&:hover .delete-icon': {
            opacity: 1,
          },
        }}
        iconPosition="end"
        icon={
          !isLastPage ? (
            <Tooltip title="Seite löschen">
              <IconButton
                size="small"
                className="delete-icon"
                onClick={(e) => {
                  e.stopPropagation(); // Verhindern, dass der Tab ausgewählt wird
                  onDelete(page.id);
                }}
                sx={{
                  opacity: 0.5,
                  transition: 'opacity 0.2s',
                  '&:hover': {
                    opacity: 1,
                    color: 'error.main'
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : undefined
        }
      />
    </div>
  );
};

export default PageTab;
