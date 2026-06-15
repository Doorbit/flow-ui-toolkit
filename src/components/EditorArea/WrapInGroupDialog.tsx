import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import { v4 as uuidv4 } from 'uuid';
import { tokens } from '../../theme/tokens';

interface WrapInGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (groupTitle: string, groupFieldId: string) => void;
  selectedCount: number;
}

/**
 * Dialog zur Eingabe des Gruppennamens und der field_id beim Zusammenfassen
 * von selektierten Elementen in eine neue Gruppe.
 */
const WrapInGroupDialog: React.FC<WrapInGroupDialogProps> = ({
  open,
  onClose,
  onConfirm,
  selectedCount
}) => {
  const [groupTitle, setGroupTitle] = useState('');
  const [groupFieldId, setGroupFieldId] = useState('');

  // Bei jedem Öffnen des Dialogs: Neue Standard-field_id generieren
  useEffect(() => {
    if (open) {
      setGroupTitle('');
      setGroupFieldId(`groupuielement_${uuidv4()}`);
    }
  }, [open]);

  const handleConfirm = () => {
    if (!groupTitle.trim()) return;
    onConfirm(groupTitle.trim(), groupFieldId.trim());
  };

  const isValid = groupTitle.trim().length > 0 && groupFieldId.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GroupWorkIcon sx={{ color: tokens.brand.green }} />
        Zu Gruppe zusammenfassen
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          {selectedCount} Elemente werden in eine neue Gruppe zusammengefasst.
          Die Elemente behalten ihre bestehenden Eigenschaften und field_ids.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Gruppenname (Title)"
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
            placeholder="z.B. Aufnahmevorgaben"
            fullWidth
            autoFocus
            required
            helperText="Der Anzeigename der neuen Gruppe"
          />

          <Accordion
            disableGutters
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px !important',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2" color="text.secondary">
                Erweiterte Einstellungen
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="Field ID"
                value={groupFieldId}
                onChange={(e) => setGroupFieldId(e.target.value)}
                fullWidth
                size="small"
                helperText="Eindeutige Kennung für die Gruppe (auto-generiert)"
                InputProps={{
                  sx: { fontFamily: 'monospace', fontSize: '0.85rem' }
                }}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Abbrechen
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!isValid}
          sx={{
            backgroundColor: tokens.brand.green,
            '&:hover': { backgroundColor: tokens.brand.greenDeep },
            textTransform: 'none',
          }}
        >
          Zusammenfassen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WrapInGroupDialog;
