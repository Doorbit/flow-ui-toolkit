import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Tab, IconButton, Tooltip, Box, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as VisibilityIcon, AccountTree as AccountTreeIcon, MoreVert as MoreVertIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import Icon from '@mdi/react';
import { getIconPath } from '../../utils/mdiIcons';
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
  onEdit: (page: Page) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  isVisible?: boolean; // Ob die Seite basierend auf ihrer Visibility-Bedingung sichtbar wäre
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const PageTab: React.FC<PageTabProps> = ({
  page,
  index,
  selectedPageId: _selectedPageId,
  isLastPage,
  onDelete,
  onEdit,
  onMove,
  onClick,
  isVisible = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onEdit(page);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onDelete(page.id);
  };

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

  // Render icon if it exists
  const renderIcon = () => {
    if (!page.icon) return null;

    // Prüfen, ob es sich um ein MDI-Icon handelt
    if (page.icon.startsWith('mdi')) {
      const iconPath = getIconPath(page.icon);
      return iconPath ? <Icon path={iconPath} size={0.8} color="#000000" /> : null;
    }

    // Fallback für alte Material UI Icons (sollte nicht mehr vorkommen)
    console.warn(`Non-MDI icon found: ${page.icon}. Please use MDI icons instead.`);
    return null;
  };

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
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#000000' }}>
            {renderIcon()}
            <span style={{ color: '#000000', fontWeight: 500 }}>{page.title?.de || page.id}</span>
            {/* Zeige Sichtbarkeitssymbol nur wenn tatsächlich eine Bedingung vorliegt */}
            {page.visibility_condition && (
              <Tooltip title="Diese Seite hat eine bedingte Sichtbarkeitsregel, die bestimmt, wann sie angezeigt wird">
                <VisibilityIcon
                  fontSize="small"
                  color={isVisible ? "primary" : "disabled"}
                  sx={{ ml: 0.5, opacity: 0.7 }}
                />
              </Tooltip>
            )}
            {page.elements && page.elements.length > 0 && (
              <Tooltip title="Diese Seite hat Unterelemente in der Hierarchie">
                <AccountTreeIcon
                  fontSize="small"
                  color="success"
                  sx={{ ml: 0.5, opacity: 0.7 }}
                />
              </Tooltip>
            )}
          </Box>
        }
        sx={{
          cursor: 'move',
          color: '#000000',
          '&:hover .page-menu-icon': {
            opacity: 1,
          },
        }}
        iconPosition="end"
        icon={
          !isLastPage ? (
            <Tooltip title="Seitenaktionen">
              <IconButton
                size="small"
                className="page-menu-icon"
                onClick={handleMenuOpen}
                sx={{
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  color: '#000000',
                  '&:hover': {
                    opacity: 1,
                    color: '#009F64'
                  }
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : undefined
        }
      />

      {/* Context Menu for page actions */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: '#009F64' }} />
          </ListItemIcon>
          <ListItemText>Seite bearbeiten</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#F05B29' }} />
          </ListItemIcon>
          <ListItemText>Seite löschen</ListItemText>
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon>
            <DragIndicatorIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText secondary="Zum Verschieben ziehen">Seite verschieben</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default PageTab;
