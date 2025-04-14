import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Tabs, 
  Tab
} from '@mui/material';
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

interface ElementType {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: 'basic' | 'complex';
}

interface ElementTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectElementType: (type: string) => void;
  parentElementType?: string;
}

// Wiederverwendung der Elementtypen aus der ElementPalette
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

const ElementTypeDialog: React.FC<ElementTypeDialogProps> = ({ 
  open, 
  onClose, 
  onSelectElementType,
  parentElementType
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const basicElements = elements.filter(e => e.category === 'basic');
  const complexElements = elements.filter(e => e.category === 'complex');
  
  const handleElementSelect = (type: string) => {
    onSelectElementType(type);
    onClose();
  };

  const dialogTitle = parentElementType === 'GroupUIElement' 
    ? 'Element zur Gruppe hinzufügen'
    : parentElementType === 'ArrayUIElement'
      ? 'Element zum Array hinzufügen'
      : 'Element hinzufügen';

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Basis-Elemente" />
            <Tab label="Komplexe Elemente" />
          </Tabs>
        </Box>
        
        <Box>
          {tabIndex === 0 && (
            <List>
              {basicElements.map(element => (
                <ListItemButton 
                  key={element.type}
                  onClick={() => handleElementSelect(element.type)}
                >
                  <ListItemIcon>{element.icon}</ListItemIcon>
                  <ListItemText primary={element.label} />
                </ListItemButton>
              ))}
            </List>
          )}
          
          {tabIndex === 1 && (
            <List>
              {complexElements.map(element => (
                <ListItemButton 
                  key={element.type}
                  onClick={() => handleElementSelect(element.type)}
                >
                  <ListItemIcon>{element.icon}</ListItemIcon>
                  <ListItemText primary={element.label} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ElementTypeDialog;

// Leere export-Anweisung, um die Datei als Modul zu kennzeichnen
export {};
