import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box,
  Typography,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Page, RelatedPage } from '../../models/listingFlow';
import IconSelector from '../IconSelector/IconSelector';
import * as Icons from '@mui/icons-material';

interface EditPageDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (updatedPage: Page) => void;
  page: Page;
  pages: Page[]; // Alle Seiten für Referenzierung
  isEditPage: boolean; // Ob es sich um eine Edit- oder View-Seite handelt
}

const EditPageDialog: React.FC<EditPageDialogProps> = ({ 
  open, 
  onClose, 
  onSave,
  page,
  pages = [], 
  isEditPage = true
}) => {
  const [titleDe, setTitleDe] = useState(page.title?.de || '');
  const [titleEn, setTitleEn] = useState(page.title?.en || '');
  const [shortTitleDe, setShortTitleDe] = useState(page.short_title?.de || '');
  const [shortTitleEn, setShortTitleEn] = useState(page.short_title?.en || '');
  const [icon, setIcon] = useState(page.icon || '');
  const [layout, setLayout] = useState(page.layout || (isEditPage ? '2_COL_RIGHT_FILL' : '2_COL_RIGHT_WIDER'));
  const [relatedPageId, setRelatedPageId] = useState(
    page.related_pages && page.related_pages.length > 0 ? page.related_pages[0].page_id : ''
  );
  const [iconSelectorOpen, setIconSelectorOpen] = useState(false);
  
  // Standardwerte für neue Seiten
  const getDefaultPatternType = () => isEditPage ? "CustomUIElement" : "CustomUIElement";
  
  const handleSave = () => {
    const relatedPages: RelatedPage[] = relatedPageId ? [{
      viewing_context: isEditPage ? 'VIEW' : 'EDIT',
      page_id: relatedPageId
    }] : [];
    
    const updatedPage: Page = {
      ...page,
      pattern_type: page.pattern_type || getDefaultPatternType(),
      title: {
        de: titleDe || page.id,
        en: titleEn || page.id
      },
      short_title: {
        de: shortTitleDe,
        en: shortTitleEn
      },
      icon: icon,
      layout: layout,
      related_pages: relatedPages,
    };
    
    onSave(updatedPage);
    onClose();
  };
  
  // Render the selected icon
  const renderSelectedIcon = () => {
    if (!icon) return null;
    
    const IconComponent = (Icons as any)[icon];
    return IconComponent ? <IconComponent /> : null;
  };
  
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Seite bearbeiten</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {/* Grundlegende Seiteneinstellungen */}
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Grundlegende Einstellungen
            </Typography>
            
            <TextField
              autoFocus
              margin="dense"
              id="title-de"
              label="Seitentitel (Deutsch)"
              type="text"
              fullWidth
              variant="outlined"
              value={titleDe}
              onChange={(e) => setTitleDe(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              id="title-en"
              label="Seitentitel (Englisch)"
              type="text"
              fullWidth
              variant="outlined"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              id="shortTitle-de"
              label="Kurztitel (Deutsch)"
              type="text"
              fullWidth
              variant="outlined"
              value={shortTitleDe}
              onChange={(e) => setShortTitleDe(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              id="shortTitle-en"
              label="Kurztitel (Englisch)"
              type="text"
              fullWidth
              variant="outlined"
              value={shortTitleEn}
              onChange={(e) => setShortTitleEn(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            {/* Layout-Auswahl */}
            <FormControl fullWidth margin="dense" sx={{ mb: 3 }}>
              <InputLabel id="layout-select-label">Layout</InputLabel>
              <Select
                labelId="layout-select-label"
                id="layout-select"
                value={layout}
                label="Layout"
                onChange={(e) => setLayout(e.target.value)}
              >
                <MenuItem value="2_COL_RIGHT_FILL">2-spaltig (rechts gefüllt)</MenuItem>
                <MenuItem value="2_COL_RIGHT_WIDER">2-spaltig (rechts breiter)</MenuItem>
                <MenuItem value="2_COL_LEFT_WIDER">2-spaltig (links breiter)</MenuItem>
                <MenuItem value="1_COL">1-spaltig</MenuItem>
              </Select>
              <FormHelperText>
                Wähle das Layout für diese Seite (empfohlen: 2_COL_RIGHT_FILL für Edit, 2_COL_RIGHT_WIDER für View)
              </FormHelperText>
            </FormControl>
            
            {/* Verknüpfte Seite */}
            {pages.length > 0 && (
              <FormControl fullWidth margin="dense" sx={{ mb: 3 }}>
                <InputLabel id="related-page-select-label">Verknüpfte Seite</InputLabel>
                <Select
                  labelId="related-page-select-label"
                  id="related-page-select"
                  value={relatedPageId}
                  label="Verknüpfte Seite"
                  onChange={(e) => setRelatedPageId(e.target.value)}
                >
                  <MenuItem value="">Keine Verknüpfung</MenuItem>
                  {pages
                    .filter(p => p.id !== page.id)
                    .filter(p => isEditPage ? p.pattern_type !== "CustomUIElement" : p.pattern_type === "CustomUIElement")
                    .map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.title?.de || p.id} {isEditPage ? "(View)" : "(Edit)"}
                      </MenuItem>
                    ))
                  }
                </Select>
                <FormHelperText>
                  Verbinde diese {isEditPage ? "Edit" : "View"}-Seite mit einer entsprechenden {isEditPage ? "View" : "Edit"}-Seite
                </FormHelperText>
              </FormControl>
            )}
            
            {/* Icon-Auswahl */}
            <Typography variant="subtitle1" gutterBottom>
              Icon
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  border: '1px solid #ddd', 
                  borderRadius: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2
                }}
              >
                {renderSelectedIcon()}
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {icon || 'Kein Icon ausgewählt'}
                </Typography>
                
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => setIconSelectorOpen(true)}
                >
                  Icon auswählen
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>
      
      <IconSelector
        open={iconSelectorOpen}
        onClose={() => setIconSelectorOpen(false)}
        onSelectIcon={setIcon}
        currentIcon={icon}
      />
    </>
  );
};

export default EditPageDialog;
