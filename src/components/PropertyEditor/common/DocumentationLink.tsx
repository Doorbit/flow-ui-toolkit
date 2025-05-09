import React from 'react';
import {
  Box,
  Link,
  Tooltip,
  IconButton,
  Typography,
  Chip,
  useTheme
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MenuBookIcon from '@mui/icons-material/MenuBook';

interface DocumentationLinkProps {
  href: string;
  label?: string;
  tooltip?: string;
  variant?: 'icon' | 'link' | 'chip';
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'default';
  openInNewTab?: boolean;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Eine Komponente für Dokumentationslinks mit verschiedenen Darstellungsvarianten.
 * Unterstützt Icon-Buttons, Text-Links und Chips mit optionalen Tooltips.
 */
export const DocumentationLink: React.FC<DocumentationLinkProps> = ({
  href,
  label = 'Dokumentation',
  tooltip = 'Zur Dokumentation',
  variant = 'icon',
  color = 'info',
  openInNewTab = true,
  icon = <HelpOutlineIcon />,
  className,
  style
}) => {
  const theme = useTheme();

  // Gemeinsame Link-Eigenschaften
  const linkProps = {
    href,
    target: openInNewTab ? '_blank' : undefined,
    rel: openInNewTab ? 'noopener noreferrer' : undefined,
    className,
    style
  };

  // Rendere die Komponente basierend auf der Variante
  const renderLink = () => {
    switch (variant) {
      case 'icon':
        return (
          <Tooltip title={tooltip || label}>
            <IconButton
              size="small"
              color={color === 'default' ? undefined : color}
              {...linkProps}
              aria-label={label}
            >
              {icon}
            </IconButton>
          </Tooltip>
        );

      case 'link':
        return (
          <Link
            color={color === 'default' ? 'primary' : color}
            {...linkProps}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              {icon && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    mr: 0.5,
                    color: theme.palette[color === 'default' ? 'primary' : color].main
                  }}
                >
                  {icon}
                </Box>
              )}
              <Typography
                component="span"
                variant="body2"
                sx={{ mr: openInNewTab ? 0.5 : 0 }}
              >
                {label}
              </Typography>
              {openInNewTab && (
                <OpenInNewIcon
                  fontSize="small"
                  sx={{
                    fontSize: '0.875rem',
                    color: theme.palette[color === 'default' ? 'primary' : color].main
                  }}
                />
              )}
            </Box>
          </Link>
        );

      case 'chip':
        return (
          <Tooltip title={tooltip}>
            <Chip
              component="a"
              {...linkProps}
              icon={React.isValidElement(icon) ? icon : <MenuBookIcon />}
              label={label}
              color={color === 'default' ? undefined : color}
              clickable
              size="small"
              deleteIcon={openInNewTab ? <OpenInNewIcon /> : undefined}
              onDelete={openInNewTab ? () => {} : undefined}
            />
          </Tooltip>
        );

      default:
        return null;
    }
  };

  return renderLink();
};

export default DocumentationLink;
