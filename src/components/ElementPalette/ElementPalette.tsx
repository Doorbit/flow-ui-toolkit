import React, { useState } from 'react';
import styled from 'styled-components';
import { Paper, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Button } from '@mui/material';
import {
  TextFields as TextIcon,
  CheckBox as BooleanIcon,
  RadioButtonChecked as SingleSelectionIcon,
  Numbers as NumberIcon,
  CalendarToday as DateIcon,
  AttachFile as FileIcon,
  ViewModule as GroupIcon,
  List as ArrayIcon,
  Apps as CustomIcon,
  Label as ChipGroupIcon,
  ViewInAr as ScannerIcon,
  LocationOn as LocationIcon,
  Home as AddressIcon,
  Apartment as AdminBoundaryIcon
} from '@mui/icons-material';

const PaletteContainer = styled(Paper)`
  width: 250px;
  height: 100vh;
  background-color: #F0F2F4;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid #E0E0E0;
`;

const ScrollableSection = styled.div`
  overflow-y: auto;
  height: calc(100vh - 70px);
`;

const ElementsSection = styled.div`
  margin-bottom: 16px;
`;

const ComplexElementsSection = styled.div`
  margin-bottom: 16px;
  background-color: rgba(0, 159, 100, 0.05);
  padding-bottom: 8px;
  border: 1px solid rgba(0, 159, 100, 0.2);
  margin: 8px;
  border-radius: 8px;
`;

const PaletteHeader = styled(Typography)`
  padding: 16px;
  background-color: #F0F2F4;
  color: #2A2E3F;
  font-weight: 500;
`;

const StyledListItemButton = styled(ListItemButton)`
  &:hover {
    background-color: rgba(0, 159, 100, 0.08);
  }
  border-radius: 4px;
  margin: 2px 8px;
  padding: 8px 16px;
  color: #2A2E3F;

  .MuiListItemIcon-root {
    color: #2A2E3F;
  }

  &[draggable="true"] {
    cursor: grab;
  }
`;

interface ElementType {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: 'basic' | 'complex';
}

interface ElementPaletteProps {
  onElementClick: (type: string) => void;
}

const elements: ElementType[] = [
  { type: 'TextUIElement', label: 'Text', icon: <TextIcon />, category: 'basic' },
  { type: 'BooleanUIElement', label: 'Boolean', icon: <BooleanIcon />, category: 'basic' },
  { type: 'SingleSelectionUIElement', label: 'Auswahl', icon: <SingleSelectionIcon />, category: 'basic' },
  { type: 'NumberUIElement', label: 'Nummer', icon: <NumberIcon />, category: 'basic' },
  { type: 'DateUIElement', label: 'Datum', icon: <DateIcon />, category: 'basic' },
  { type: 'FileUIElement', label: 'Datei', icon: <FileIcon />, category: 'basic' },
  { type: 'GroupUIElement', label: 'Gruppe', icon: <GroupIcon />, category: 'complex' },
  { type: 'ArrayUIElement', label: 'Array', icon: <ArrayIcon />, category: 'complex' },
  { type: 'ChipGroupUIElement', label: 'Chip-Gruppe', icon: <ChipGroupIcon />, category: 'complex' },
  // Spezifische CustomUIElement-Typen
  { type: 'CustomUIElement_SCANNER', label: 'Scanner', icon: <ScannerIcon />, category: 'complex' },
  { type: 'CustomUIElement_ADDRESS', label: 'Adresseingabe', icon: <AddressIcon />, category: 'complex' },
  { type: 'CustomUIElement_LOCATION', label: 'Standort/Karte', icon: <LocationIcon />, category: 'complex' },
  { type: 'CustomUIElement_ADMIN_BOUNDARY', label: 'Umgebungsinfos', icon: <AdminBoundaryIcon />, category: 'complex' }
];

// Implementierung mit Drag-and-Drop
const ElementItem: React.FC<{ element: ElementType, onClick: () => void }> = ({ element, onClick }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('element_type', element.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <StyledListItemButton
      onClick={onClick}
      draggable={true}
      onDragStart={handleDragStart}
    >
      <ListItemIcon>{element.icon}</ListItemIcon>
      <ListItemText primary={element.label} />
    </StyledListItemButton>
  );
};

const ElementPalette: React.FC<ElementPaletteProps> = ({ onElementClick }) => {
  const basicElements = elements.filter(e => e.category === 'basic');
  const complexElements = elements.filter(e => e.category === 'complex');
  const [activeTab, setActiveTab] = useState<'basic' | 'complex'>('basic');

  return (
    <PaletteContainer elevation={2}>
      <PaletteHeader variant="h6">
        Element-Palette
      </PaletteHeader>

      {/* Tabs */}
      <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
        <Button
          sx={{
            flex: 1,
            py: 1,
            borderRadius: 0,
            backgroundColor: activeTab === 'basic' ? 'rgba(0, 159, 100, 0.1)' : 'transparent',
            fontWeight: activeTab === 'basic' ? 'bold' : 'normal',
            color: activeTab === 'basic' ? '#009F64' : '#2A2E3F',
            '&:hover': {
              backgroundColor: activeTab === 'basic' ? 'rgba(0, 159, 100, 0.15)' : 'rgba(0, 159, 100, 0.05)'
            }
          }}
          onClick={() => setActiveTab('basic')}
        >
          Basis-Elemente
        </Button>
        <Button
          sx={{
            flex: 1,
            py: 1,
            borderRadius: 0,
            backgroundColor: activeTab === 'complex' ? 'rgba(0, 159, 100, 0.1)' : 'transparent',
            fontWeight: activeTab === 'complex' ? 'bold' : 'normal',
            color: activeTab === 'complex' ? '#009F64' : '#2A2E3F',
            '&:hover': {
              backgroundColor: activeTab === 'complex' ? 'rgba(0, 159, 100, 0.15)' : 'rgba(0, 159, 100, 0.05)'
            }
          }}
          onClick={() => setActiveTab('complex')}
        >
          Komplexe Elemente
        </Button>
      </Box>

      <ScrollableSection>
        {activeTab === 'basic' && (
          <ElementsSection>
            <List>
              {basicElements.map((element) => (
                <ElementItem
                  key={element.type}
                  element={element}
                  onClick={() => onElementClick(element.type)}
                />
              ))}
            </List>
          </ElementsSection>
        )}

        {activeTab === 'complex' && (
          <ComplexElementsSection>
            <List>
              {complexElements.map((element) => (
                <ElementItem
                  key={element.type}
                  element={element}
                  onClick={() => onElementClick(element.type)}
                />
              ))}
            </List>
          </ComplexElementsSection>
        )}
      </ScrollableSection>
    </PaletteContainer>
  );
};

export default ElementPalette;
