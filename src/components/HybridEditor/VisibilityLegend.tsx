import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface VisibilityLegendProps {
  compact?: boolean; // Wenn true, wird eine kompaktere Version angezeigt
}

/**
 * Eine Komponente, die die beiden Sichtbarkeitskonzepte erklärt:
 * 1. Bedingte Sichtbarkeit (wann ein Element angezeigt wird)
 * 2. Strukturnavigation (wie man durch die Hierarchie navigiert)
 */
const VisibilityLegend: React.FC<VisibilityLegendProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title="Bedingte Sichtbarkeit: Bestimmt, wann ein Element angezeigt wird">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <VisibilityIcon fontSize="small" color="primary" />
            <Typography variant="body2">Bedingte Sichtbarkeit</Typography>
          </Box>
        </Tooltip>
        <Tooltip title="Strukturnavigation: Ermöglicht die Navigation durch die Hierarchie der Elemente">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccountTreeIcon fontSize="small" color="success" />
            <Typography variant="body2">Strukturnavigation</Typography>
          </Box>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <HelpOutlineIcon color="info" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Sichtbarkeitskonzepte
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        In dieser Anwendung gibt es zwei verschiedene Konzepte, die mit der "Sichtbarkeit" von Elementen zu tun haben:
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <VisibilityIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" color="primary">
            Bedingte Sichtbarkeit
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ ml: 4 }}>
          Bestimmt, <strong>wann</strong> ein Element angezeigt wird, basierend auf Bedingungen.
          Ein Element mit bedingter Sichtbarkeit wird nur angezeigt, wenn die definierte Bedingung erfüllt ist.
          Beispiel: "Zeige dieses Feld nur an, wenn 'Hat PV-Anlage' = Ja."
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccountTreeIcon color="success" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" color="success.main">
            Strukturnavigation
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ ml: 4 }}>
          Ermöglicht die Navigation durch die <strong>Hierarchie</strong> der Elemente.
          Elemente können Unterelemente enthalten, zu denen Sie navigieren können.
          Die Strukturnavigation hat nichts mit der bedingten Anzeige zu tun, sondern hilft Ihnen,
          durch die verschachtelte Struktur der Elemente zu navigieren.
          Beispiel: Eine Gruppe enthält mehrere Felder, zu denen Sie navigieren können.
        </Typography>
      </Box>
    </Paper>
  );
};

export default VisibilityLegend;
