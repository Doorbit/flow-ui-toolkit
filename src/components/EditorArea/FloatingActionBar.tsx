import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ClearIcon from '@mui/icons-material/Clear';

interface FloatingActionBarProps {
  selectedCount: number;
  onWrapInGroup: () => void;
  onClearSelection: () => void;
}

/**
 * Schwebender Aktionsbalken, der erscheint, wenn 1 oder mehr Elemente multi-selektiert sind.
 * Zeigt die Anzahl der selektierten Elemente und bietet Aktionen wie "Zusammenfassen" und "Aufheben".
 */
const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  selectedCount,
  onWrapInGroup,
  onClearSelection
}) => {
  if (selectedCount < 1) return null;

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 1.5,
        borderRadius: 3,
        backgroundColor: '#fff',
        border: '1px solid #E0E0E0',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2', whiteSpace: 'nowrap' }}>
        {selectedCount} {selectedCount === 1 ? 'Element' : 'Elemente'} ausgewählt
      </Typography>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<GroupWorkIcon />}
          onClick={onWrapInGroup}
          sx={{
            backgroundColor: '#009F64',
            '&:hover': { backgroundColor: '#007A4D' },
            textTransform: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Zu Gruppe zusammenfassen
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<ClearIcon />}
          onClick={onClearSelection}
          sx={{
            textTransform: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Auswahl aufheben
        </Button>
      </Box>
    </Paper>
  );
};

export default FloatingActionBar;
