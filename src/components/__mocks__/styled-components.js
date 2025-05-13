import React from 'react';

// Mockimplementierung von styled-components
const mockSvgIcon = (props) => React.createElement('span', {
  className: 'MuiSvgIcon-root',
  ...props
}, props.children || '□');

const createStyledComponent = (Component) => {
  const StyledComponent = React.forwardRef(function StyledComponent({ children, ...props }, ref) {
    const ComponentToRender = typeof Component === 'string' ? Component : Component;
    if (Component.muiName === 'SvgIcon') {
      return mockSvgIcon({ ref, ...props, children });
    }
    return <ComponentToRender data-testid="styled-component" ref={ref} {...props}>{children}</ComponentToRender>;
  });
  
  // Mock für Template Literals
  const templateFunction = () => StyledComponent;
  templateFunction.attrs = () => templateFunction;
  templateFunction.withConfig = () => templateFunction;
  
  return templateFunction;
};

const styled = (Component) => {
  return createStyledComponent(Component);
};

// Mock für Template Literals und andere styled-components Features
styled.attrs = () => styled;
styled.withConfig = () => styled;

// Füge die üblichen styled-Methoden hinzu
styled.div = (props) => <div data-testid="styled-div" {...props} />;
styled.span = (props) => <span data-testid="styled-span" {...props} />;
styled.p = (props) => <p data-testid="styled-p" {...props} />;
styled.button = (props) => <button data-testid="styled-button" {...props} />;
styled.a = (props) => <a data-testid="styled-a" {...props} />;

// Das ist wichtig für CommonJS-Module wie Jest
module.exports = styled;
module.exports.default = styled;
