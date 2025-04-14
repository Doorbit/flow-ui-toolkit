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
  Label as ChipGroupIcon
} from '@mui/icons-material';

const PaletteContainer = styled(Paper)`
  width: 250px;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  background-color: #edf7ff;
  padding-bottom: 8px;
  border: 1px solid #c0d8f0;
  margin: 8px;
  border-radius: 4px;
`;

const PaletteHeader = styled(Typography)`
  padding: 16px;
  background-color: #2c2c2c;
  color: white;
`;

const StyledListItemButton = styled(ListItemButton)`
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
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
  { type: 'CustomUIElement', label: 'Benutzerdefiniert', icon: <CustomIcon />, category: 'complex' },
  { type: 'ChipGroupUIElement', label: 'Chip-Gruppe', icon: <ChipGroupIcon />, category: 'complex' }
];

// Vereinfachte Version ohne Drag-and-Drop für die erste Implementation
const ElementItem: React.FC<{ element: ElementType, onClick: () => void }> = ({ element, onClick }) => {
  return (
    <StyledListItemButton onClick={onClick}>
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
            backgroundColor: activeTab === 'basic' ? '#e3f2fd' : 'transparent',
            fontWeight: activeTab === 'basic' ? 'bold' : 'normal',
            color: 'black'
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
            backgroundColor: activeTab === 'complex' ? '#e3f2fd' : 'transparent',
            fontWeight: activeTab === 'complex' ? 'bold' : 'normal',
            color: 'black'
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
