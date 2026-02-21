import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';

import { Page } from '../../models/listingFlow';

interface CopyElementToPageDialogProps {
  open: boolean;
  onClose: () => void;
  onCopy: (targetPageId: string, position: 'top' | 'bottom') => void;
  pages: Page[];
  currentPageId: string;
  elementTitle: string;
}

/**
 * Dialog zum Kopieren eines Elements auf eine andere Seite innerhalb des gleichen Flows.
 * Der Benutzer wählt die Zielseite und die Einfügeposition (oben/unten).
 */
const CopyElementToPageDialog: React.FC<CopyElementToPageDialogProps> = ({
  open,
  onClose,
  onCopy,
  pages,
  currentPageId,
  elementTitle,
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');

  const handleClose = useCallback(() => {
    setSelectedPageId(null);
    setPosition('bottom');
    onClose();
  }, [onClose]);

  const handleCopy = useCallback(() => {
    if (!selectedPageId) return;
    onCopy(selectedPageId, position);
    handleClose();
  }, [selectedPageId, position, onCopy, handleClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { minHeight: 350 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FileCopyIcon sx={{ color: '#009F64' }} />
        Element auf andere Seite kopieren
      </DialogTitle>

      <DialogContent dividers>
        {/* Element-Info */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1, border: '1px solid #E0E0E0' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Element: <strong>{elementTitle}</strong>
          </Typography>
        </Box>

        {/* Zielseiten-Auswahl */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Zielseite auswählen:
        </Typography>

        <List dense sx={{ maxHeight: 250, overflow: 'auto', border: '1px solid #E0E0E0', borderRadius: 1, mb: 2 }}>
          {pages.map((page) => {
            const isSelected = selectedPageId === page.id;
            const isCurrent = page.id === currentPageId;
            const pageTitle = page.title?.de || page.short_title?.de || page.id;
            const elementCount = page.elements?.length || 0;

            return (
              <ListItem key={page.id} disablePadding>
                <ListItemButton
                  dense
                  onClick={() => setSelectedPageId(page.id)}
                  selected={isSelected}
                  sx={{
                    bgcolor: isSelected ? 'rgba(0, 159, 100, 0.08)' : 'transparent',
                    '&:hover': { bgcolor: isSelected ? 'rgba(0, 159, 100, 0.12)' : 'rgba(0, 0, 0, 0.04)' },
                    '&.Mui-selected': { bgcolor: 'rgba(0, 159, 100, 0.08)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Radio
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                      size="small"
                      sx={{
                        color: '#009F64',
                        '&.Mui-checked': { color: '#009F64' },
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span>{pageTitle}</span>
                        {isCurrent && (
                          <Chip
                            label="aktuelle Seite"
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.65rem', height: 18, color: '#666' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={`${elementCount} Element${elementCount !== 1 ? 'e' : ''}`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: isSelected ? 600 : 400 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ mb: 2 }} />

        {/* Position auswählen */}
        <FormControl component="fieldset">
          <FormLabel
            component="legend"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.primary',
              '&.Mui-focused': { color: 'text.primary' },
            }}
          >
            Einfügeposition:
          </FormLabel>
          <RadioGroup
            row
            value={position}
            onChange={(e) => setPosition(e.target.value as 'top' | 'bottom')}
          >
            <FormControlLabel
              value="top"
              control={<Radio size="small" sx={{ color: '#009F64', '&.Mui-checked': { color: '#009F64' } }} />}
              label={<Typography variant="body2">Am Anfang der Seite</Typography>}
            />
            <FormControlLabel
              value="bottom"
              control={<Radio size="small" sx={{ color: '#009F64', '&.Mui-checked': { color: '#009F64' } }} />}
              label={<Typography variant="body2">Am Ende der Seite</Typography>}
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Abbrechen
        </Button>
        <Button
          variant="contained"
          onClick={handleCopy}
          disabled={!selectedPageId}
          startIcon={<FileCopyIcon />}
          sx={{
            bgcolor: '#009F64',
            '&:hover': { bgcolor: '#008755' },
            '&.Mui-disabled': { bgcolor: '#E0E0E0' },
          }}
        >
          Kopieren
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CopyElementToPageDialog;
