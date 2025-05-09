import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  useTheme,
  Link
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DocumentationLink from './DocumentationLink';

interface ElementTypeIndicatorProps {
  type: string;
  icon: React.ReactNode;
  description: string;
  documentationUrl?: string;
  ariaLabel?: string;
}

/**
 * Verbesserte Komponente zur Anzeige des Elementtyps mit Icon und Beschreibung.
 * Wird am Anfang jedes Element-Editors angezeigt.
 * Unterstützt Barrierefreiheit und optionale Dokumentationslinks.
 */
export const ElementTypeIndicator: React.FC<ElementTypeIndicatorProps> = ({
  type,
  icon,
  description,
  documentationUrl,
  ariaLabel
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '4px'
      }}
      role="region"
      aria-label={ariaLabel || `Elementtyp: ${type}`}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 1,
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              mr: 1.5,
              color: theme.palette.primary.main
            }}
            aria-hidden="true" // Icon ist dekorativ, Text enthält die relevante Information
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {type}
          </Typography>
        </Box>

        {documentationUrl && (
          <DocumentationLink
            href={documentationUrl}
            variant="icon"
            tooltip={`Dokumentation zu ${type}`}
            aria-label={`Dokumentation zu ${type} öffnen`}
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mr: 1,
            flex: 1,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {description}
        </Typography>
        <Tooltip
          title="Dieses Element hat spezifische Eigenschaften und Verhaltensweisen"
          aria-label="Weitere Informationen zu diesem Elementtyp"
        >
          <InfoIcon fontSize="small" color="info" />
        </Tooltip>
      </Box>
    </Paper>
  );
};
