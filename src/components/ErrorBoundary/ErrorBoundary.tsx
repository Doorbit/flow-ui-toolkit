import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const ErrorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#fff8f8',
  border: '1px solid #ffcdd2',
  borderRadius: theme.shape.borderRadius,
  maxWidth: '800px',
  marginLeft: 'auto',
  marginRight: 'auto',
}));

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console or error tracking service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorContainer>
          <Typography variant="h5" color="error" gutterBottom>
            Etwas ist schiefgelaufen
          </Typography>
          <Typography variant="body1" paragraph>
            Es ist ein Fehler aufgetreten. Bitte speichern Sie Ihre Arbeit und laden Sie die Anwendung neu.
          </Typography>
          <Box mt={2}>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Fehlerdetails</summary>
              <Typography variant="body2" component="pre" style={{ marginTop: 10 }}>
                {this.state.error?.toString()}
              </Typography>
              <Typography variant="body2" component="pre" style={{ marginTop: 10 }}>
                {this.state.errorInfo?.componentStack}
              </Typography>
            </details>
          </Box>
          <Box mt={3} display="flex" gap={2}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={this.resetError}
            >
              Zurücksetzen
            </Button>
            <Button 
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Seite neu laden
            </Button>
          </Box>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;







