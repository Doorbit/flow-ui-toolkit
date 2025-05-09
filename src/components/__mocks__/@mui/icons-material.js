// Mock für @mui/icons-material
const React = require('react');

// Generische Icon-Mock-Funktion
const createIconMock = (displayName) => {
  const IconComponent = (props) => {
    return React.createElement('svg', {
      ...props,
      'data-testid': displayName,
      'aria-hidden': 'true',
      'focusable': 'false',
      'viewBox': '0 0 24 24',
      'className': `MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-1umw9bq-MuiSvgIcon-root`
    }, React.createElement('path', {
      d: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z'
    }));
  };
  
  IconComponent.displayName = displayName;
  return IconComponent;
};

// Mock für alle häufig verwendeten Icons
module.exports = {
  Add: createIconMock('AddIcon'),
  Delete: createIconMock('DeleteIcon'),
  Edit: createIconMock('EditIcon'),
  Menu: createIconMock('MenuIcon'),
  ArrowBack: createIconMock('ArrowBackIcon'),
  ArrowForward: createIconMock('ArrowForwardIcon'),
  Close: createIconMock('CloseIcon'),
  Save: createIconMock('SaveIcon'),
  Settings: createIconMock('SettingsIcon'),
  MoreVert: createIconMock('MoreVertIcon'),
  CheckCircle: createIconMock('CheckCircleIcon'),
  Error: createIconMock('ErrorIcon'),
  Warning: createIconMock('WarningIcon'),
  Info: createIconMock('InfoIcon'),
  Person: createIconMock('PersonIcon')
};
