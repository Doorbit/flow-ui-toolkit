import React from 'react';
import {
  Box,
  Typography,
  Tooltip,
  FormHelperText,
  TextField,
  TextFieldProps,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  SelectProps,
  Switch,
  SwitchProps,
  FormControlLabel,
  Checkbox,
  CheckboxProps,
  Radio,
  RadioProps,
  RadioGroup,
  RadioGroupProps,
  FormGroup,
  FormLabel,
  useTheme
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface AccessibleFieldBaseProps {
  id: string;
  label: string;
  required?: boolean;
  tooltip?: string;
  helperText?: string;
  error?: boolean;
  errorText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  labelProps?: React.HTMLAttributes<HTMLLabelElement>;
}

interface AccessibleTextFieldProps extends AccessibleFieldBaseProps {
  type: 'text';
  textFieldProps: Omit<TextFieldProps, 'id' | 'label' | 'required' | 'error' | 'helperText' | 'fullWidth' | 'disabled'>;
}

interface AccessibleSelectFieldProps extends AccessibleFieldBaseProps {
  type: 'select';
  selectProps: Omit<SelectProps, 'id' | 'label' | 'required' | 'error' | 'fullWidth' | 'disabled'>;
  options: Array<{ value: string | number; label: string }>;
}

interface AccessibleSwitchFieldProps extends AccessibleFieldBaseProps {
  type: 'switch';
  switchProps: Omit<SwitchProps, 'id' | 'required' | 'disabled'>;
}

interface AccessibleCheckboxFieldProps extends AccessibleFieldBaseProps {
  type: 'checkbox';
  checkboxProps: Omit<CheckboxProps, 'id' | 'required' | 'disabled'>;
}

interface AccessibleRadioFieldProps extends AccessibleFieldBaseProps {
  type: 'radio';
  radioGroupProps: Omit<RadioGroupProps, 'id' | 'required' | 'disabled'>;
  options: Array<{ value: string | number; label: string }>;
}

type AccessibleFieldProps =
  | AccessibleTextFieldProps
  | AccessibleSelectFieldProps
  | AccessibleSwitchFieldProps
  | AccessibleCheckboxFieldProps
  | AccessibleRadioFieldProps;

/**
 * Eine barrierefreie Komponente für Formularfelder mit konsistenter Darstellung.
 * Unterstützt verschiedene Feldtypen (Text, Select, Switch, Checkbox, Radio) und
 * bietet Barrierefreiheitsfunktionen wie ARIA-Labels, Kontrast und Tastaturnavigation.
 */
export const AccessibleField: React.FC<AccessibleFieldProps> = (props) => {
  const theme = useTheme();
  const {
    id,
    label,
    required = false,
    tooltip,
    helperText,
    error = false,
    errorText,
    fullWidth = true,
    disabled = false,
    className,
    style,
    labelProps
  } = props;

  // Generiere eindeutige IDs für verbundene Elemente
  const labelId = `${id}-label`;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  // Erstelle ARIA-Attribute für Barrierefreiheit
  const ariaProps = {
    'aria-labelledby': labelId,
    'aria-describedby': [
      helperText ? helperId : null,
      error && errorText ? errorId : null
    ].filter(Boolean).join(' ') || undefined
  };

  // Rendere das entsprechende Feld basierend auf dem Typ
  const renderField = () => {
    switch (props.type) {
      case 'text':
        return (
          <TextField
            id={id}
            {...ariaProps}
            label={label}
            required={required}
            error={error}
            helperText={error ? errorText : helperText}
            fullWidth={fullWidth}
            disabled={disabled}
            {...props.textFieldProps}
          />
        );

      case 'select':
        return (
          <FormControl
            fullWidth={fullWidth}
            required={required}
            error={error}
            disabled={disabled}
          >
            <InputLabel id={labelId}>{label}</InputLabel>
            <Select
              id={id}
              labelId={labelId}
              label={label}
              {...ariaProps}
              {...props.selectProps}
            >
              {props.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(helperText || (error && errorText)) && (
              <FormHelperText id={error ? errorId : helperId}>
                {error ? errorText : helperText}
              </FormHelperText>
            )}
          </FormControl>
        );

      case 'switch':
        return (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  id={id}
                  required={required}
                  disabled={disabled}
                  {...ariaProps}
                  {...props.switchProps}
                />
              }
              label={
                <Typography
                  component="span"
                  id={labelId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: disabled ? 'text.disabled' : 'text.primary'
                  }}
                  {...labelProps}
                >
                  {label}
                  {required && (
                    <Typography
                      component="span"
                      sx={{
                        ml: 0.5,
                        color: error ? 'error.main' : 'primary.main',
                        fontWeight: 'bold'
                      }}
                    >
                      *
                    </Typography>
                  )}
                </Typography>
              }
            />
            {(helperText || (error && errorText)) && (
              <FormHelperText
                id={error ? errorId : helperId}
                error={error}
                sx={{ ml: 0 }}
              >
                {error ? errorText : helperText}
              </FormHelperText>
            )}
          </Box>
        );

      case 'checkbox':
        return (
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  id={id}
                  required={required}
                  disabled={disabled}
                  {...ariaProps}
                  {...props.checkboxProps}
                />
              }
              label={
                <Typography
                  component="span"
                  id={labelId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: disabled ? 'text.disabled' : 'text.primary'
                  }}
                  {...labelProps}
                >
                  {label}
                  {required && (
                    <Typography
                      component="span"
                      sx={{
                        ml: 0.5,
                        color: error ? 'error.main' : 'primary.main',
                        fontWeight: 'bold'
                      }}
                    >
                      *
                    </Typography>
                  )}
                </Typography>
              }
            />
            {(helperText || (error && errorText)) && (
              <FormHelperText
                id={error ? errorId : helperId}
                error={error}
                sx={{ ml: 0 }}
              >
                {error ? errorText : helperText}
              </FormHelperText>
            )}
          </Box>
        );

      case 'radio':
        return (
          <FormControl
            component="fieldset"
            required={required}
            error={error}
            disabled={disabled}
            fullWidth={fullWidth}
          >
            <FormLabel
              id={labelId}
              component="legend"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: disabled ? 'text.disabled' : (error ? 'error.main' : 'text.primary'),
                '&.Mui-focused': {
                  color: error ? 'error.main' : 'primary.main'
                }
              }}
            >
              {label}
              {required && (
                <Typography
                  component="span"
                  sx={{
                    ml: 0.5,
                    color: error ? 'error.main' : 'primary.main',
                    fontWeight: 'bold'
                  }}
                >
                  *
                </Typography>
              )}
            </FormLabel>
            <RadioGroup
              id={id}
              {...ariaProps}
              {...props.radioGroupProps}
            >
              {props.options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  disabled={disabled}
                />
              ))}
            </RadioGroup>
            {(helperText || (error && errorText)) && (
              <FormHelperText
                id={error ? errorId : helperId}
                error={error}
              >
                {error ? errorText : helperText}
              </FormHelperText>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      className={className}
      style={style}
      sx={{
        mb: 2,
        width: fullWidth ? '100%' : 'auto'
      }}
    >
      {renderField()}
    </Box>
  );
};

export default AccessibleField;
