// Mock für @mui/material
const React = require('react');

// Verbesserte mockTabsComponent - löst das Problem mit value-Vergleichen
const mockTabsComponent = ({ children, value, onChange, variant, scrollButtons, sx, ...props }) => {
  // Tabs in Array umwandeln, damit wir sie durchlaufen können
  const tabsArray = React.Children.toArray(children);

  // Prüfen, ob value einem der Tab-Werte entspricht
  const processedChildren = React.Children.map(children, (child, index) => {
    // Default-mäßig den Index als Wert verwenden, wenn nicht anders angegeben
    const childValue = child.props.value !== undefined ? child.props.value : index;

    // Klonen mit aktualisierten Props
    return React.cloneElement(child, {
      selected: childValue === value,
      // Simulieren, dass jedes Tab einen onClick hat, der den Tabwechsel auslöst
      onClick: (e) => {
        if (onChange) {
          onChange(e, childValue);
        }
        if (child.props.onClick) {
          child.props.onClick(e);
        }
      }
    });
  });

  return React.createElement('div', {
    className: `MuiTabs-root MuiTabs-${variant || 'standard'}`,
    'data-testid': 'mock-tabs',
    'data-value': value,
    ...props
  }, processedChildren);
};

// Verbesserte Tab-Komponente
const mockTabComponent = ({ children, value, label, onClick, selected, disabled, iconPosition, ...props }) => {
  // Verwenden wir Button statt div, damit es sich wie ein echtes Tab verhält
  return React.createElement('div', {
    role: 'tab',
    'aria-selected': selected,
    className: `MuiTab-root ${selected ? 'Mui-selected' : ''} ${disabled ? 'Mui-disabled' : ''}`,
    'data-testid': 'mock-tab',
    'data-value': value,
    value: value,
    disabled: disabled,
    onClick: onClick,
    ...props
  }, label || children);
};

const mockBox = React.forwardRef(({ children, sx, ...props }, ref) => {
  return React.createElement('div', {
    ref,
    className: 'MuiBox-root',
    ...props
  }, children);
});

const mockButton = ({ children, onClick, variant, color, startIcon, endIcon, disabled, ...props }) => {
  return React.createElement('button', {
    className: `MuiButton-root MuiButton-${variant || 'text'} MuiButton-${color || 'primary'} ${disabled ? 'Mui-disabled' : ''}`,
    onClick,
    disabled,
    type: 'button',
    ...props
  }, [
    startIcon && React.createElement('span', { className: 'MuiButton-startIcon', key: 'start-icon' }, startIcon),
    children,
    endIcon && React.createElement('span', { className: 'MuiButton-endIcon', key: 'end-icon' }, endIcon)
  ]);
};

const mockIconButton = ({ children, onClick, 'aria-label': ariaLabel, size, disabled, ...props }) => {
  return React.createElement('button', {
    className: `MuiIconButton-root MuiIconButton-${size || 'medium'} ${disabled ? 'Mui-disabled' : ''}`,
    onClick,
    'aria-label': ariaLabel,
    disabled,
    type: 'button',
    ...props
  }, children);
};

const mockDialog = ({ children, open, onClose, ...props }) => {
  if (!open) return null;

  return React.createElement('div', {
    className: 'MuiDialog-root MuiModal-root',
    'data-testid': 'mock-dialog',
    role: 'dialog',
    'aria-modal': true,
    ...props
  },
    React.createElement('div', {
      className: 'MuiDialog-container',
      onClick: (e) => {
        // Klick auf den Container schließt den Dialog (außerhalb des Papiers)
        if (e.target === e.currentTarget && onClose) {
          onClose(e, 'backdropClick');
        }
      }
    },
      React.createElement('div', {
        className: 'MuiDialog-paper',
        onClick: (e) => e.stopPropagation() // Verhindert Schließen bei Klick auf Papier
      }, children)
    )
  );
};

const mockTooltip = ({ children, title, placement, ...props }) => {
  return React.createElement('div', {
    className: 'MuiTooltip-root',
    'data-tooltip': title,
    'aria-label': title,
    'data-placement': placement || 'bottom',
    ...props
  }, children);
};

// Appbar und Toolbar für Navigation.tsx
const mockAppBar = ({ children, position, color, ...props }) => {
  return React.createElement('header', {
    className: `MuiAppBar-root MuiAppBar-position${position || 'fixed'} MuiAppBar-color${color || 'primary'}`,
    ...props
  }, children);
};

const mockToolbar = ({ children, variant, ...props }) => {
  return React.createElement('div', {
    className: `MuiToolbar-root ${variant ? `MuiToolbar-${variant}` : ''}`,
    ...props
  }, children);
};

// Weitere häufig verwendete Komponenten
const mockGrid = ({ children, container, item, xs, sm, md, lg, spacing, ...props }) => {
  const className = [
    'MuiGrid-root',
    container ? 'MuiGrid-container' : '',
    item ? 'MuiGrid-item' : '',
    xs !== undefined ? `MuiGrid-grid-xs-${xs}` : '',
    sm !== undefined ? `MuiGrid-grid-sm-${sm}` : '',
    md !== undefined ? `MuiGrid-grid-md-${md}` : '',
    lg !== undefined ? `MuiGrid-grid-lg-${lg}` : '',
    spacing !== undefined ? `MuiGrid-spacing-xs-${spacing}` : ''
  ].filter(Boolean).join(' ');

  return React.createElement('div', {
    className,
    ...props
  }, children);
};

const mockPaper = React.forwardRef(({ children, elevation, variant, ...props }, ref) => {
  return React.createElement('div', {
    ref,
    className: `MuiPaper-root MuiPaper-elevation${elevation || 1} MuiPaper-variant${variant || 'elevation'}`,
    ...props
  }, children);
});

const mockMenuItem = ({ children, value, selected, onClick, ...props }) => {
  return React.createElement('li', {
    className: `MuiMenuItem-root ${selected ? 'Mui-selected' : ''}`,
    role: 'menuitem',
    'data-value': value,
    onClick,
    ...props
  }, children);
};

const mockSelect = ({ children, value, onChange, label, ...props }) => {
  return React.createElement('div', {
    className: 'MuiSelect-root',
    'data-value': value,
    'aria-label': label,
    ...props
  }, [
    React.createElement('select', {
      value,
      onChange,
      className: 'MuiSelect-nativeInput',
      'aria-hidden': 'true',
      key: 'select'
    }, children),
    React.createElement('div', {
      className: 'MuiSelect-select',
      key: 'display'
    }, value)
  ]);
};

// Export aller gemockten Komponenten
module.exports = {
  // Basis Komponenten
  Box: mockBox,
  Button: mockButton,
  IconButton: mockIconButton,

  // Dialog Komponenten
  Dialog: mockDialog,
  DialogTitle: ({ children, ...props }) => React.createElement('div', { className: 'MuiDialogTitle-root', ...props }, children),
  DialogContent: ({ children, ...props }) => React.createElement('div', { className: 'MuiDialogContent-root', ...props }, children),
  DialogActions: ({ children, ...props }) => React.createElement('div', { className: 'MuiDialogActions-root', ...props }, children),
  DialogContentText: ({ children, ...props }) => React.createElement('p', { className: 'MuiDialogContentText-root', ...props }, children),

  // Form Komponenten
  TextField: ({ label, value, onChange, error, helperText, variant, fullWidth, ...props }) =>
    React.createElement('div', {
      className: `MuiTextField-root ${fullWidth ? 'MuiTextField-fullWidth' : ''}`,
      'data-variant': variant || 'outlined'
    }, [
      label && React.createElement('label', { className: 'MuiInputLabel-root', key: 'label' }, label),
      React.createElement('input', {
        className: `MuiInput-root ${error ? 'Mui-error' : ''}`,
        value,
        onChange,
        'aria-label': label,
        key: 'input',
        ...props
      }),
      helperText && React.createElement('p', {
        className: `MuiFormHelperText-root ${error ? 'Mui-error' : ''}`,
        key: 'helper'
      }, helperText)
    ]),

  // Navigation Komponenten
  Tabs: mockTabsComponent,
  Tab: mockTabComponent,
  AppBar: mockAppBar,
  Toolbar: mockToolbar,

  // Tooltip
  Tooltip: mockTooltip,

  // Grid System
  Grid: mockGrid,

// Surfaces
  Paper: ({ children, elevation, variant, gutterBottom, ...props }) => {
    return React.createElement('div', {
      className: `MuiPaper-root MuiPaper-elevation${elevation || 1} MuiPaper-variant${variant || 'elevation'}`,
      ...props
    }, children);
  },
  Card: React.forwardRef(({ children, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      className: 'MuiCard-root',
      ...props
    }, children);
  }),
  CardContent: React.forwardRef(({ children, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      className: 'MuiCardContent-root',
      ...props
    }, children);
  }),

  // Data Display - Typography mit korrekter gutterBottom Behandlung
  Typography: ({ children, variant, component, align, gutterBottom, color, sx, ...props }) => {
    const Component = component || 'p';
    const className = [
      'MuiTypography-root',
      `MuiTypography-${variant || 'body1'}`,
      align ? `MuiTypography-align${align}` : '',
      gutterBottom ? 'MuiTypography-gutterBottom' : ''
    ].filter(Boolean).join(' ');

    // Filtere MUI-spezifische Props heraus, die nicht an DOM-Elemente weitergegeben werden dürfen
    // gutterBottom, color, sx sind bereits aus ...props entfernt
    return React.createElement(Component, {
      className,
      ...props
    }, children);
  },

  // Selection Controls
  Select: mockSelect,
  MenuItem: mockMenuItem,
  FormControl: ({ children, fullWidth, variant, error, disabled, ...props }) =>
    React.createElement('div', {
      className: `MuiFormControl-root ${fullWidth ? 'MuiFormControl-fullWidth' : ''} ${error ? 'Mui-error' : ''} ${disabled ? 'Mui-disabled' : ''}`,
      ...props
    }, children),
  FormLabel: ({ children, error, disabled, ...props }) =>
    React.createElement('label', {
      className: `MuiFormLabel-root ${error ? 'Mui-error' : ''} ${disabled ? 'Mui-disabled' : ''}`,
      ...props
    }, children),
  InputLabel: ({ children, shrink, error, disabled, ...props }) =>
    React.createElement('label', {
      className: `MuiInputLabel-root ${shrink ? 'MuiInputLabel-shrink' : ''} ${error ? 'Mui-error' : ''} ${disabled ? 'Mui-disabled' : ''}`,
      ...props
    }, children),
  FormHelperText: ({ children, error, ...props }) =>
    React.createElement('p', {
      className: `MuiFormHelperText-root ${error ? 'Mui-error' : ''}`,
      ...props
    }, children),

  // Input Components
  TextField: React.forwardRef(({
    label,
    value,
    onChange,
    error,
    helperText,
    fullWidth,
    variant,
    type,
    placeholder,
    disabled,
    multiline,
    rows,
    InputProps,
    InputLabelProps,
    ...props
  }, ref) => {
    return React.createElement('div', {
      ref,
      className: `MuiTextField-root ${fullWidth ? 'MuiTextField-fullWidth' : ''} ${error ? 'Mui-error' : ''}`,
    }, [
      label && React.createElement('label', {
        key: 'label',
        className: 'MuiInputLabel-root'
      }, label),
      React.createElement(multiline ? 'textarea' : 'input', {
        key: 'input',
        className: 'MuiInputBase-input',
        type: type || 'text',
        value,
        onChange,
        placeholder,
        disabled,
        rows: multiline ? rows : undefined,
        ...props
      }),
      helperText && React.createElement('p', {
        key: 'helper',
        className: `MuiFormHelperText-root ${error ? 'Mui-error' : ''}`
      }, helperText)
    ]);
  }),

  InputAdornment: ({ children, position, ...props }) =>
    React.createElement('div', {
      className: `MuiInputAdornment-root MuiInputAdornment-position${position || 'end'}`,
      ...props
    }, children),

  // Miscellaneous
  Divider: (props) => React.createElement('hr', { className: 'MuiDivider-root', ...props }),
  Container: ({ children, maxWidth, ...props }) =>
    React.createElement('div', {
      className: `MuiContainer-root ${maxWidth ? `MuiContainer-maxWidth${maxWidth}` : ''}`,
      ...props
    }, children),

  // Icons
  SvgIcon: ({ children, ...props }) => React.createElement('span', { className: 'MuiSvgIcon-root', ...props }, children || '□'),

  // Form Controls
  Switch: React.forwardRef(({ checked, onChange, disabled, size, ...props }, ref) => {
    return React.createElement('span', {
      ref,
      className: `MuiSwitch-root ${disabled ? 'Mui-disabled' : ''}`,
      role: 'switch',
      'aria-checked': checked,
      ...props
    });
  }),

  FormControlLabel: React.forwardRef(({ control, label, checked, disabled, ...props }, ref) => {
    return React.createElement('label', {
      ref,
      className: `MuiFormControlLabel-root ${disabled ? 'Mui-disabled' : ''}`,
      ...props
    }, [
      React.cloneElement(control, { checked, disabled }),
      React.createElement('span', { key: 'label', className: 'MuiFormControlLabel-label' }, label)
    ]);
  }),

  Radio: React.forwardRef(({ checked, onChange, disabled, size, ...props }, ref) => {
    return React.createElement('span', {
      ref,
      className: `MuiRadio-root ${checked ? 'Mui-checked' : ''} ${disabled ? 'Mui-disabled' : ''}`,
      role: 'radio',
      'aria-checked': checked,
      ...props
    });
  }),

  Collapse: React.forwardRef(({ in: inProp, children, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      className: `MuiCollapse-root ${inProp ? 'MuiCollapse-entered' : ''}`,
      style: { display: inProp ? 'block' : 'none' },
      ...props
    }, children);
  }),

  Chip: React.forwardRef(({ label, onDelete, onClick, color, size, variant, icon, deleteIcon, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      className: `MuiChip-root MuiChip-${variant || 'filled'} MuiChip-${size || 'medium'} ${color ? `MuiChip-color${color}` : ''}`,
      onClick,
      ...props
    }, [
      icon && React.createElement('span', { key: 'icon', className: 'MuiChip-icon' }, icon),
      React.createElement('span', { key: 'label', className: 'MuiChip-label' }, label),
      onDelete && React.createElement('span', {
        key: 'delete',
        className: 'MuiChip-deleteIcon',
        onClick: onDelete
      }, deleteIcon || '×')
    ]);
  }),

  Breadcrumbs: ({ children, separator, maxItems, itemsBeforeCollapse, itemsAfterCollapse, ...props }) => {
    return React.createElement('nav', {
      className: 'MuiBreadcrumbs-root',
      'aria-label': 'breadcrumb',
      ...props
    }, React.createElement('ol', {
      className: 'MuiBreadcrumbs-ol'
    }, React.Children.map(children, (child, index) => {
      return React.createElement('li', {
        key: index,
        className: 'MuiBreadcrumbs-li'
      }, [
        child,
        index < React.Children.count(children) - 1 && separator && React.createElement('span', {
          key: 'separator',
          className: 'MuiBreadcrumbs-separator'
        }, separator)
      ]);
    })));
  },

  Link: React.forwardRef(({ children, href, onClick, component, variant, color, underline, ...props }, ref) => {
    const Component = component || 'a';
    return React.createElement(Component, {
      ref,
      href,
      onClick,
      className: `MuiLink-root MuiLink-underline${underline || 'hover'}`,
      ...props
    }, children);
  }),

  List: React.forwardRef(({ children, dense, disablePadding, ...props }, ref) => {
    return React.createElement('ul', {
      ref,
      className: `MuiList-root ${dense ? 'MuiList-dense' : ''} ${disablePadding ? 'MuiList-padding' : ''}`,
      ...props
    }, children);
  }),

  ListItem: React.forwardRef(({ children, button, selected, disabled, ...props }, ref) => {
    return React.createElement('li', {
      ref,
      className: `MuiListItem-root ${button ? 'MuiListItem-button' : ''} ${selected ? 'Mui-selected' : ''} ${disabled ? 'Mui-disabled' : ''}`,
      ...props
    }, children);
  }),

  ListItemButton: React.forwardRef(({ children, selected, disabled, onClick, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      role: 'button',
      className: `MuiListItemButton-root ${selected ? 'Mui-selected' : ''} ${disabled ? 'Mui-disabled' : ''}`,
      onClick,
      ...props
    }, children);
  }),

  ListItemIcon: React.forwardRef(({ children, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      className: 'MuiListItemIcon-root',
      ...props
    }, children);
  }),

  ListItemText: React.forwardRef(({ primary, secondary, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      className: 'MuiListItemText-root',
      ...props
    }, [
      primary && React.createElement('span', { key: 'primary', className: 'MuiListItemText-primary' }, primary),
      secondary && React.createElement('span', { key: 'secondary', className: 'MuiListItemText-secondary' }, secondary)
    ]);
  }),

  ListItemSecondaryAction: React.forwardRef(({ children, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      className: 'MuiListItemSecondaryAction-root',
      ...props
    }, children);
  }),

  // Theme-Funktionen
  createTheme: (options) => ({
    palette: options?.palette || {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' }
    },
    typography: options?.typography || {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    },
    ...options
  }),

  // Theme-Provider
  ThemeProvider: ({ theme, children }) => React.createElement('div', {
    className: 'MuiThemeProvider',
    'data-theme': JSON.stringify(theme)
  }, children),

  // CSS Baseline
  CssBaseline: () => null,
};
