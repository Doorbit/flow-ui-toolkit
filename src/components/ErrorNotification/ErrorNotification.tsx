import React from 'react';
import { Alert, Snackbar, Stack } from '@mui/material';
import { useErrorContext, ErrorMessage } from '../../context/ErrorContext';

const ErrorNotification: React.FC = () => {
  const { errors, removeError } = useErrorContext();

  const handleClose = (id: string) => {
    removeError(id);
  };

  // Show only the last 3 errors
  const visibleErrors = errors.slice(-3);

  return (
    <Stack spacing={2} sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }}>
      {visibleErrors.map((error: ErrorMessage) => (
        <Snackbar
          key={error.id}
          open={true}
          autoHideDuration={error.severity === 'error' ? 10000 : 6000}
          onClose={() => handleClose(error.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => handleClose(error.id)}
            severity={error.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {error.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default ErrorNotification;