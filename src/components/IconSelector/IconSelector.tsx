import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Box,
  InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import SearchIcon from '@mui/icons-material/Search';
import Icon from '@mdi/react';
import { getCategorizedIcons, getIconPath, getMdiIconNames } from '../../utils/mdiIcons';

// Kategorisierung der Icons basierend auf MDI-Icons
const ICON_CATEGORIES = getCategorizedIcons();

interface IconSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  currentIcon?: string;
}

const IconSelector: React.FC<IconSelectorProps> = ({
  open,
  onClose,
  onSelectIcon,
  currentIcon
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('home'); // Default to 'home' instead of 'all'
  const [filteredIcons, setFilteredIcons] = useState<string[]>([]);

  // Theme und Responsive Handling
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Vereinfachte, direkte Filterung ohne Cache mit Deduplizierung
  const getIconsForCategory = React.useCallback((category: string) => {
    // Finde die Kategorie und hole die Icons
    const icons = ICON_CATEGORIES.find(cat => cat.id === category)?.icons || [];
    // Dedupliziere die Icons für die Kategorie mit Array.filter
    return icons.filter((value, index, self) => self.indexOf(value) === index);
  }, []);

  // Verbesserte Suchfunktion mit ODER-Logik und Deduplizierung
  const filterIcons = React.useCallback((icons: string[], search: string, isGlobalSearch: boolean = false) => {
    if (!search.trim()) return icons;

    // Bei globaler Suche alle Icons durchsuchen, nicht nur die der aktuellen Kategorie
    const iconsToSearch = isGlobalSearch
      ? getMdiIconNames()
      : icons;

    const terms = search.toLowerCase().trim().split(/\s+/);

    // Filtere Icons basierend auf Suchbegriffen
    const filteredIcons = iconsToSearch.filter(icon => {
      const name = icon.toLowerCase();
      return terms.some(term => name.includes(term));
    });

    // Dedupliziere die gefilterten Icons mit Array.filter
    return filteredIcons.filter((value, index, self) => self.indexOf(value) === index);
  }, []);

  useEffect(() => {
    setFilteredIcons(getIconsForCategory(selectedCategory));
  }, [selectedCategory, getIconsForCategory]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredIcons(getIconsForCategory(selectedCategory));
      return;
    }

    // Längeres Debouncing für bessere Performance (300ms statt 150ms)
    const handle = setTimeout(() => {
      // Wenn ein Suchbegriff eingegeben wurde, führe eine globale Suche durch
      const filtered = filterIcons([], searchTerm, true);

      // Begrenze die Anzahl der angezeigten Icons auf maximal 500 für bessere Performance
      const limitedResults = filtered.slice(0, 500);

      setFilteredIcons(limitedResults);
    }, 300);

    return () => clearTimeout(handle);
  }, [searchTerm, selectedCategory, getIconsForCategory, filterIcons]);

  // Zurücksetzen beim Öffnen
  useEffect(() => {
    if (open) {
      setSearchTerm('');
      setSelectedCategory('home'); // Standardmäßig 'home' Kategorie anzeigen
      // Deduplizierte Icons für die Home-Kategorie laden
      setFilteredIcons(getIconsForCategory('home'));
    }
  }, [open, getIconsForCategory]);

  // Hinweis: Die Deduplizierung verhindert, dass Icons mehrfach angezeigt werden,
  // auch wenn sie in mehreren Kategorien vorkommen oder mehrere Suchbegriffe erfüllen


  // Handle icon selection
  const handleIconSelect = (iconName: string) => {
    onSelectIcon(iconName);
    onClose();
  };

  // Verbesserte Icon-Rendering-Funktion mit Fehlerbehandlung
  const renderIcon = (iconName: string) => {
    try {
      // Prüfen, ob es sich um ein MDI-Icon handelt
      if (iconName.startsWith('mdi')) {
        const iconPath = getIconPath(iconName);
        return iconPath ? (
          <Icon path={iconPath} size={1} />
        ) : (
          <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="error">?</Typography>
          </Box>
        );
      }

      // Konvertiere Material UI Icon-Namen zu MDI-Icon-Namen
      const mdiIconName = `mdi${iconName}`;
      const iconPath = getIconPath(mdiIconName);

      return iconPath ? (
        <Icon path={iconPath} size={1} />
      ) : (
        <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" color="error">?</Typography>
        </Box>
      );
    } catch (error) {
      console.warn(`Error rendering icon: ${iconName}`, error);
      return (
        <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" color="error">!</Typography>
        </Box>
      );
    }
  };

  // Get current category label
  const getCurrentCategoryLabel = () => {
    return ICON_CATEGORIES.find(cat => cat.id === selectedCategory)?.label || 'Alle';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle>Material Design Icon auswählen</DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Icon suchen"
            type="text"
            fullWidth
            variant="outlined"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {ICON_CATEGORIES.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setSelectedCategory(category.id)}
                sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
              >
                {category.label} ({category.icons.length})
              </Button>
            ))}
          </Box>
        </Box>

        {filteredIcons.length > 0 ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {searchTerm
                ? `${filteredIcons.length} Ergebnisse gefunden für "${searchTerm}" (in allen Kategorien)${
                    filteredIcons.length === 500 ? ' - Zeige die ersten 500 Ergebnisse' : ''
                  }`
                : `${filteredIcons.length} Icons in Kategorie "${getCurrentCategoryLabel()}"`}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {filteredIcons.map((iconName) => (
              <Box key={iconName} sx={{ width: { xs: 'calc(16.66% - 8px)', sm: 'calc(12.5% - 8px)', md: 'calc(10% - 8px)' } }}>
                <IconButton
                  onClick={() => handleIconSelect(iconName)}
                  sx={{
                    width: '100%',
                    height: '64px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 1,
                    border: currentIcon === iconName ? '2px solid #1976d2' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      border: '1px solid #1976d2'
                    }
                  }}
                >
                  {renderIcon(iconName)}
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', mt: 0.5, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {iconName}
                  </Typography>
                </IconButton>
              </Box>
            ))}
          </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Keine Icons gefunden
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Versuchen Sie andere Suchbegriffe oder wählen Sie eine andere Kategorie.
              {searchTerm && selectedCategory !== 'all' && (
                <Button
                  size="small"
                  onClick={() => setSelectedCategory('all')}
                  sx={{ ml: 1 }}
                >
                  In allen Kategorien suchen
                </Button>
              )}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IconSelector;
