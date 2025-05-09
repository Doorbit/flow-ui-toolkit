import React from 'react';
import Icon from '@mdi/react';
import * as Icons from '@mui/icons-material';
import { getIconPath } from '../../utils/mdiIcons';
import { Box, Typography } from '@mui/material';

interface IconRendererProps {
  iconName: string;
  size?: number;
  color?: string;
}

const IconRenderer: React.FC<IconRendererProps> = ({ iconName, size = 1, color }) => {
  if (!iconName) return null;

  try {
    // Prüfen, ob es sich um ein MDI-Icon handelt
    if (iconName.startsWith('mdi')) {
      const iconPath = getIconPath(iconName);
      return iconPath ? <Icon path={iconPath} size={size} color={color} /> : null;
    }
    
    // Fallback für alte Material UI Icons
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent style={{ fontSize: `${size * 24}px`, color }} /> : null;
  } catch (error) {
    console.warn(`Error rendering icon: ${iconName}`, error);
    return (
      <Box sx={{ width: 24 * size, height: 24 * size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" color="error">?</Typography>
      </Box>
    );
  }
};

export default IconRenderer;
