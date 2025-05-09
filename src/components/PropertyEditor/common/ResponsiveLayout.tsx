import React from 'react';
import { Box, Grid, useTheme, useMediaQuery } from '@mui/material';

type LayoutType = 'single' | 'two-column' | 'three-column' | 'sidebar-right' | 'sidebar-left';

interface ResponsiveLayoutProps {
  layout?: LayoutType;
  children: React.ReactNode;
  spacing?: number;
  sidebarWidth?: string | number;
  mainWidth?: string | number;
  reverseOnMobile?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Eine responsive Layout-Komponente, die sich an verschiedene Bildschirmgrößen anpasst.
 * Unterstützt verschiedene Layout-Typen und passt sich automatisch an mobile Geräte an.
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  layout = 'single',
  children,
  spacing = 2,
  sidebarWidth = '30%',
  mainWidth = '70%',
  reverseOnMobile = false,
  className,
  style
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Konvertiere children zu einem Array
  const childrenArray = React.Children.toArray(children);

  // Rendere das Layout basierend auf dem Typ
  const renderLayout = () => {
    // Auf mobilen Geräten immer ein einspaltiges Layout verwenden
    if (isMobile) {
      return (
        <Box sx={{ width: '100%' }}>
          {reverseOnMobile ? [...childrenArray].reverse() : childrenArray}
        </Box>
      );
    }

    switch (layout) {
      case 'two-column':
        // Zweispaltiges Layout mit gleicher Breite
        return (
          <Grid container spacing={spacing}>
            {childrenArray.map((child, index) => (
              <Grid
                size={{ xs: 12, md: 6 }}
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {child}
              </Grid>
            ))}
          </Grid>
        );

      case 'three-column':
        // Dreispaltiges Layout mit gleicher Breite
        return (
          <Grid container spacing={spacing}>
            {childrenArray.map((child, index) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4 }}
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {child}
              </Grid>
            ))}
          </Grid>
        );

      case 'sidebar-right':
        // Hauptinhalt links, Seitenleiste rechts
        return (
          <Box sx={{ display: 'flex', flexDirection: isTablet ? 'column' : 'row', gap: spacing }}>
            <Box sx={{
              flex: isTablet ? 'auto' : `0 0 ${mainWidth}`,
              width: isTablet ? '100%' : mainWidth
            }}>
              {childrenArray[0]}
            </Box>
            {childrenArray.length > 1 && (
              <Box sx={{
                flex: isTablet ? 'auto' : `0 0 ${sidebarWidth}`,
                width: isTablet ? '100%' : sidebarWidth
              }}>
                {childrenArray.slice(1)}
              </Box>
            )}
          </Box>
        );

      case 'sidebar-left':
        // Seitenleiste links, Hauptinhalt rechts
        return (
          <Box sx={{ display: 'flex', flexDirection: isTablet ? 'column' : 'row', gap: spacing }}>
            <Box sx={{
              flex: isTablet ? 'auto' : `0 0 ${sidebarWidth}`,
              width: isTablet ? '100%' : sidebarWidth
            }}>
              {childrenArray[0]}
            </Box>
            {childrenArray.length > 1 && (
              <Box sx={{
                flex: isTablet ? 'auto' : `0 0 ${mainWidth}`,
                width: isTablet ? '100%' : mainWidth
              }}>
                {childrenArray.slice(1)}
              </Box>
            )}
          </Box>
        );

      case 'single':
      default:
        // Einspaltiges Layout
        return (
          <Box sx={{ width: '100%' }}>
            {childrenArray}
          </Box>
        );
    }
  };

  return (
    <Box
      className={className}
      style={style}
      sx={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}
    >
      {renderLayout()}
    </Box>
  );
};

export default ResponsiveLayout;
