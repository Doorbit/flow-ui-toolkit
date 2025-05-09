import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Collapse,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TabletIcon from '@mui/icons-material/Tablet';
import { useUserPreferences } from '../../../context/UserPreferencesContext';

interface ElementPreviewProps {
  title?: string;
  children: React.ReactNode;
  id?: string;
}

/**
 * Erweiterte Komponente zur Anzeige einer Vorschau des Elements.
 * Unterstützt verschiedene Vorschaumodi (Mobile, Tablet, Desktop) und
 * speichert den Zustand in den Benutzerpräferenzen.
 */
export const ElementPreview: React.FC<ElementPreviewProps> = ({
  title = 'Vorschau',
  children,
  id = 'element-preview'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { preferences, setPreviewMode, setShowPreview } = useUserPreferences();
  const [expanded, setExpanded] = useState(preferences.showPreview);
  const [previewMode, setPreviewModeLocal] = useState<'mobile' | 'tablet' | 'desktop'>(
    preferences.previewMode === 'desktop' ? 'desktop' : 'mobile'
  );

  // Aktualisiere den lokalen Zustand, wenn sich die Präferenzen ändern
  useEffect(() => {
    setExpanded(preferences.showPreview);
  }, [preferences.showPreview]);

  useEffect(() => {
    setPreviewModeLocal(preferences.previewMode === 'desktop' ? 'desktop' : 'mobile');
  }, [preferences.previewMode]);

  const handleExpandToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    setShowPreview(newExpanded);
  };

  const handlePreviewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'mobile' | 'tablet' | 'desktop' | null
  ) => {
    if (newMode !== null) {
      setPreviewModeLocal(newMode);
      setPreviewMode(newMode === 'desktop' ? 'desktop' : 'mobile');
    }
  };

  // Berechne die Breite basierend auf dem Vorschaumodus
  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return '320px';
      case 'tablet':
        return '768px';
      case 'desktop':
        return '100%';
      default:
        return '100%';
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          pl: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          borderBottom: expanded ? '1px solid rgba(0, 0, 0, 0.12)' : 'none'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {previewMode === 'mobile' && <PhoneAndroidIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
          {previewMode === 'tablet' && <TabletIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
          {previewMode === 'desktop' && <DesktopWindowsIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
          <Typography variant="subtitle2">{title}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!isMobile && (
            <ToggleButtonGroup
              size="small"
              value={previewMode}
              exclusive
              onChange={handlePreviewModeChange}
              aria-label="Vorschaumodus"
              sx={{ mr: 1 }}
            >
              <ToggleButton value="mobile" aria-label="Mobil">
                <Tooltip title="Mobile Ansicht">
                  <PhoneAndroidIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="tablet" aria-label="Tablet">
                <Tooltip title="Tablet Ansicht">
                  <TabletIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="desktop" aria-label="Desktop">
                <Tooltip title="Desktop Ansicht">
                  <DesktopWindowsIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          )}

          <Tooltip title={expanded ? "Vorschau ausblenden" : "Vorschau anzeigen"}>
            <IconButton size="small" onClick={handleExpandToggle}>
              {expanded ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              width: getPreviewWidth(),
              maxWidth: '100%',
              mx: 'auto',
              p: 2,
              backgroundColor: '#fff',
              border: '1px dashed rgba(0, 0, 0, 0.12)',
              borderRadius: '4px',
              ...(previewMode === 'mobile' && {
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                height: 'auto',
                minHeight: '200px',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40%',
                  height: '12px',
                  backgroundColor: '#111',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                }
              }),
              ...(previewMode === 'tablet' && {
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                height: 'auto',
                minHeight: '300px',
              })
            }}
          >
            {children}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};
