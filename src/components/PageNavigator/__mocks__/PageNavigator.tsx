import React from 'react';
import { Box } from '@mui/material';

interface PageNavigatorProps {
  pages: any[];
  selectedPageId: string | null;
}

// Mock-Implementation für Tests
const PageNavigator: React.FC<PageNavigatorProps> = ({ pages, selectedPageId }) => {
  return (
    <Box data-testid="mock-page-navigator">
      Mock PageNavigator: {pages.length} Seiten, 
      Selected: {selectedPageId || 'Keine'}
    </Box>
  );
};

export default PageNavigator;
