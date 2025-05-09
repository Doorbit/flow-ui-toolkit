import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography
} from '@mui/material';

interface WorkflowNameDialogProps {
  open: boolean;
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => void;
  isFirstTime?: boolean;
}

const WorkflowNameDialog: React.FC<WorkflowNameDialogProps> = ({
  open,
  initialName,
  onClose,
  onSave,
  isFirstTime = false
}) => {
  const [name, setName] = useState(initialName);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isFirstTime ? 'Willkommen bei Flow UI Toolkit' : 'Workflow-Namen bearbeiten'}
      </DialogTitle>
      <DialogContent>
        {isFirstTime && (
          <Typography variant="body1" paragraph>
            Bitte geben Sie einen Namen für Ihren neuen Workflow ein.
          </Typography>
        )}
        <TextField
          autoFocus
          margin="dense"
          id="workflow-name"
          label="Workflow-Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSave();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        {!isFirstTime && (
          <Button onClick={onClose}>Abbrechen</Button>
        )}
        <Button onClick={handleSave} variant="contained" color="primary">
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkflowNameDialog;
