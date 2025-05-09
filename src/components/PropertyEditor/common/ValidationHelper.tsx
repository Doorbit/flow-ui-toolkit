import React from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Paper,
  Tooltip
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';

export interface ValidationMessage {
  message: string;
  severity: ValidationSeverity;
  field?: string;
  suggestion?: string;
  helpLink?: string;
}

interface ValidationHelperProps {
  messages: ValidationMessage[];
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  showIcon?: boolean;
  onMessageClick?: (message: ValidationMessage) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Eine Komponente zur Anzeige von Validierungsmeldungen mit hilfreichen Vorschlägen.
 * Unterstützt verschiedene Schweregrade (Fehler, Warnung, Info, Erfolg) und
 * bietet Vorschläge zur Behebung von Problemen.
 */
export const ValidationHelper: React.FC<ValidationHelperProps> = ({
  messages,
  title,
  collapsible = true,
  defaultExpanded = true,
  showIcon = true,
  onMessageClick,
  className,
  style
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  // Gruppiere Nachrichten nach Schweregrad
  const groupedMessages = messages.reduce<Record<ValidationSeverity, ValidationMessage[]>>(
    (acc, message) => {
      if (!acc[message.severity]) {
        acc[message.severity] = [];
      }
      acc[message.severity].push(message);
      return acc;
    },
    { error: [], warning: [], info: [], success: [] }
  );

  // Bestimme den höchsten Schweregrad
  const getHighestSeverity = (): ValidationSeverity => {
    if (groupedMessages.error.length > 0) return 'error';
    if (groupedMessages.warning.length > 0) return 'warning';
    if (groupedMessages.info.length > 0) return 'info';
    return 'success';
  };

  const highestSeverity = getHighestSeverity();

  // Rendere das Icon basierend auf dem Schweregrad
  const renderIcon = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return <ErrorOutlineIcon color="error" />;
      case 'warning':
        return <WarningAmberIcon color="warning" />;
      case 'info':
        return <InfoOutlinedIcon color="info" />;
      case 'success':
        return <CheckCircleOutlineIcon color="success" />;
    }
  };

  // Wenn keine Nachrichten vorhanden sind, nichts rendern
  if (messages.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      className={className}
      style={style}
      sx={{
        mb: 2,
        border: '1px solid',
        borderColor: theme => theme.palette[highestSeverity].light,
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
          backgroundColor: theme => `${theme.palette[highestSeverity].light}20`,
          borderBottom: expanded ? '1px solid' : 'none',
          borderBottomColor: theme => theme.palette[highestSeverity].light
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {showIcon && (
            <Box sx={{ mr: 1 }}>
              {renderIcon(highestSeverity)}
            </Box>
          )}
          <Typography variant="subtitle2">
            {title || `${messages.length} Validierungsmeldung${messages.length !== 1 ? 'en' : ''}`}
          </Typography>
        </Box>

        {collapsible && (
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

      <Collapse in={expanded || !collapsible}>
        <Box sx={{ p: 1 }}>
          <List dense disablePadding>
            {Object.entries(groupedMessages).map(([severity, msgs]) =>
              msgs.map((msg, index) =>
                onMessageClick ? (
                  <ListItemButton
                    key={`${severity}-${index}`}
                    onClick={() => onMessageClick(msg)}
                    sx={{
                      borderRadius: '4px',
                      mb: 0.5,
                      '&:hover': {
                        backgroundColor: theme => `${theme.palette[severity as ValidationSeverity].light}20`
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {renderIcon(severity as ValidationSeverity)}
                    </ListItemIcon>
                    <ListItemText
                      primary={msg.message}
                      secondary={msg.suggestion && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Vorschlag: {msg.suggestion}
                          </Typography>
                          {msg.helpLink && (
                            <Tooltip title="Weitere Informationen">
                              <IconButton
                                size="small"
                                href={msg.helpLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <HelpOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    />
                  </ListItemButton>
                ) : (
                  <ListItem
                    key={`${severity}-${index}`}
                    sx={{
                      borderRadius: '4px',
                      mb: 0.5
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {renderIcon(severity as ValidationSeverity)}
                    </ListItemIcon>
                    <ListItemText
                      primary={msg.message}
                      secondary={msg.suggestion && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Vorschlag: {msg.suggestion}
                          </Typography>
                          {msg.helpLink && (
                            <Tooltip title="Weitere Informationen">
                              <IconButton
                                size="small"
                                href={msg.helpLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <HelpOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    />
                  </ListItem>
                )
              )
            )}
          </List>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ValidationHelper;
