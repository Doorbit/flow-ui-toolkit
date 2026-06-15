import React, { useState } from 'react';
import { TextField, Typography } from '@mui/material';
import DialogBase from '../common/DialogBase';

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
    <DialogBase
      open={open}
      onClose={onClose}
      title={isFirstTime ? 'Willkommen bei Flow UI Toolkit' : 'Workflow-Namen bearbeiten'}
      onConfirm={handleSave}
      confirmLabel="Speichern"
      confirmDisabled={!name.trim()}
      hideCancel={isFirstTime}
    >
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
    </DialogBase>
  );
};

export default WorkflowNameDialog;
