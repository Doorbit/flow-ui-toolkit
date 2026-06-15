import React from 'react';
import { Box, Typography } from '@mui/material';
import DialogBase from '../common/DialogBase';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['Strg', 'Z'], description: 'Rückgängig' },
  { keys: ['Strg', 'Y'], description: 'Wiederherstellen' },
  { keys: ['Strg', 'S'], description: 'Als Datei speichern' },
  { keys: ['Esc'], description: 'Mehrfachauswahl-Modus beenden' },
];

const KeyCap: React.FC<{ label: string }> = ({ label }) => (
  <Box
    component="kbd"
    sx={{
      display: 'inline-block',
      minWidth: 24,
      px: 1,
      py: 0.25,
      textAlign: 'center',
      fontFamily: 'inherit',
      fontSize: '0.8rem',
      lineHeight: 1.6,
      color: 'text.primary',
      backgroundColor: 'grey.100',
      border: '1px solid',
      borderColor: 'grey.400',
      borderRadius: 1,
      boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.15)',
    }}
  >
    {label}
  </Box>
);

/**
 * Listet die verfügbaren Tastaturkürzel des Editors auf. Die Kürzel sind in
 * App.tsx (globaler keydown-Handler) implementiert; dieser Dialog macht sie
 * auffindbar (sie waren bislang undokumentiert).
 */
const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({ open, onClose }) => {
  return (
    <DialogBase
      open={open}
      onClose={onClose}
      title="Tastaturkürzel"
      maxWidth="xs"
      onConfirm={onClose}
      confirmLabel="Schließen"
      hideCancel
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 0.5 }}>
        {SHORTCUTS.map((sc) => (
          <Box
            key={sc.description}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
          >
            <Typography variant="body2">{sc.description}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              {sc.keys.map((key, i) => (
                <React.Fragment key={key}>
                  {i > 0 && <Typography variant="caption" sx={{ color: 'text.secondary' }}>+</Typography>}
                  <KeyCap label={key} />
                </React.Fragment>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
      <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
        Kürzel greifen nicht, während ein Eingabefeld fokussiert ist.
      </Typography>
    </DialogBase>
  );
};

export default KeyboardShortcutsDialog;
