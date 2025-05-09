import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
  Badge,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useUserPreferences } from '../../../context/UserPreferencesContext';

interface AccordionSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  id?: string;
  badge?: number;
  badgeTooltip?: string;
  important?: boolean;
}

/**
 * Eine einklappbare Accordion-Komponente für die Gruppierung von Eigenschaften.
 * Wird verwendet, um die Eigenschaften in logische Abschnitte zu unterteilen.
 * Speichert den Zustand (eingeklappt/ausgeklappt) in den Benutzerpräferenzen.
 */
export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  defaultExpanded = true,
  children,
  icon,
  id = title.toLowerCase().replace(/\s+/g, '-'),
  badge,
  badgeTooltip,
  important = false
}) => {
  const { preferences, setSectionExpanded } = useUserPreferences();
  const [expanded, setExpanded] = useState<boolean>(() => {
    // Wenn eine gespeicherte Präferenz existiert, verwende diese, sonst den defaultExpanded-Wert
    return preferences.expandedSections[id] !== undefined
      ? preferences.expandedSections[id]
      : defaultExpanded;
  });

  // Aktualisiere den lokalen Zustand, wenn sich die Präferenzen ändern
  useEffect(() => {
    if (preferences.expandedSections[id] !== undefined) {
      setExpanded(preferences.expandedSections[id]);
    }
  }, [preferences.expandedSections, id]);

  const handleChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
    setSectionExpanded(id, isExpanded);
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange}
      sx={{
        mb: 2,
        '&:before': { display: 'none' }, // Entfernt die Trennlinie
        boxShadow: 'none',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '4px',
        overflow: 'hidden',
        ...(important && {
          borderLeft: '3px solid primary.main',
        })
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          borderBottom: expanded ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
          ...(important && {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          })
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: important ? 500 : 400,
              }}
            >
              {title}
            </Typography>
          </Box>

          {badge !== undefined && badge > 0 && (
            <Tooltip title={badgeTooltip || `${badge} Einträge`}>
              <Badge
                badgeContent={badge}
                color="primary"
                sx={{ ml: 2 }}
              />
            </Tooltip>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};
