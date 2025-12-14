// Mock für @mdi/react
const React = require('react');

// Mock für Icon-Komponente
const Icon = ({ path, size, color, ...props }) => {
  return React.createElement('svg', {
    className: 'mdi-icon',
    'data-testid': 'mdi-icon',
    'data-path': path,
    width: size || 24,
    height: size || 24,
    viewBox: '0 0 24 24',
    fill: color || 'currentColor',
    ...props
  }, React.createElement('path', { d: path || 'M0 0h24v24H0z' }));
};

module.exports = Icon;
module.exports.default = Icon;

