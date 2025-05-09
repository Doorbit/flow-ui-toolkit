import React from 'react';

// Mockimplementierung von styled-components
const styled = (Component) => {
  return function StyledComponent(props) {
    return <div data-testid="styled-component" {...props} />;
  };
};

// Füge die üblichen styled-Methoden hinzu
styled.div = (props) => <div data-testid="styled-div" {...props} />;
styled.span = (props) => <span data-testid="styled-span" {...props} />;
styled.p = (props) => <p data-testid="styled-p" {...props} />;
styled.button = (props) => <button data-testid="styled-button" {...props} />;
styled.a = (props) => <a data-testid="styled-a" {...props} />;

// Das ist wichtig für CommonJS-Module wie Jest
module.exports = styled;
module.exports.default = styled;
