import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import IconSelector from '../../IconSelector/IconSelector';
import Icon from '@mdi/react';
import { getIconPath } from '../../../utils/mdiIcons';

interface IconFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
}

/**
 * Eine wiederverwendbare Komponente für die Auswahl von Icons.
 * Kombiniert ein TextField mit einem Button zum Öffnen des IconSelectors.
 */
const IconField: React.FC<IconFieldProps> = ({
  value,
  onChange,
  label = 'Icon',
  size = 'small',
  fullWidth = false,
  required = false,
  disabled = false,
  placeholder = '',
  helperText,
  error = false
}) => {
  const [iconSelectorOpen, setIconSelectorOpen] = useState(false);

  // Render the selected icon
  const renderSelectedIcon = () => {
    if (!value) return null;

    // Prüfen, ob es sich um ein MDI-Icon handelt
    if (value.startsWith('mdi')) {
      const iconPath = getIconPath(value);
      return iconPath ? <Icon path={iconPath} size={1} /> : null;
    }

    // Fallback für alte Material UI Icons (sollte nicht mehr vorkommen)
    console.warn(`Non-MDI icon found: ${value}. Please use MDI icons instead.`);
    return null;
  };

  return (
    <>
      <TextField
        label={label}
        size={size}
        fullWidth={fullWidth}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        helperText={helperText}
        error={error}
        InputProps={{
          startAdornment: value ? (
            <InputAdornment position="start">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                {renderSelectedIcon()}
              </Box>
            </InputAdornment>
          ) : undefined,
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Icon auswählen">
                <IconButton
                  edge="end"
                  onClick={() => setIconSelectorOpen(true)}
                  disabled={disabled}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }}
      />

      <IconSelector
        open={iconSelectorOpen}
        onClose={() => setIconSelectorOpen(false)}
        onSelectIcon={onChange}
        currentIcon={value}
      />
    </>
  );
};

export default IconField;
