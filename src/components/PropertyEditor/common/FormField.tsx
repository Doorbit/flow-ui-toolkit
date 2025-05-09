import React from 'react';
import {
  Box,
  Typography,
  Tooltip,
  FormHelperText
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface FormFieldProps {
  label: string;
  required?: boolean;
  tooltip?: string;
  helperText?: string;
  error?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Eine gemeinsame Komponente für Formularfelder mit konsistenter Darstellung.
 * Zeigt erforderliche Felder mit einem Sternchen an und bietet Platz für Hilfetexte und Tooltips.
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  tooltip,
  helperText,
  error = false,
  children,
  fullWidth = true
}) => {
  return (
    <Box 
      sx={{ 
        mb: 2,
        width: fullWidth ? '100%' : 'auto'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 0.5 
        }}
      >
        <Typography 
          variant="body2" 
          component="label" 
          sx={{ 
            fontWeight: 500,
            color: error ? 'error.main' : 'text.primary',
            '&::after': required ? {
              content: '" *"',
              color: 'error.main',
              ml: 0.5
            } : {}
          }}
        >
          {label}
        </Typography>
        
        {tooltip && (
          <Tooltip title={tooltip} arrow>
            <HelpOutlineIcon 
              fontSize="small" 
              color="action" 
              sx={{ ml: 0.5, fontSize: '1rem' }} 
            />
          </Tooltip>
        )}
      </Box>
      
      {children}
      
      {helperText && (
        <FormHelperText 
          error={error}
          sx={{ 
            mt: 0.5,
            ml: 0
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default FormField;
