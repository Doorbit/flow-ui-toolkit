import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  Alert,
  AlertColor,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material';

/**
 * Zentrales Feedback-System: vereinheitlicht Erfolg-/Fehler-/Warn-Toasts und
 * Bestätigungsdialoge an einer Stelle. Ersetzt verstreute `alert()`/`window.confirm()`
 * und doppelte ad-hoc Snackbars. Komponenten nutzen `useFeedback()`.
 */
export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Färbt die Bestätigen-Schaltfläche rot (für löschende/überschreibende Aktionen). */
  destructive?: boolean;
}

interface FeedbackContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  /** Promise-basierter Ersatz für window.confirm — löst zu true (bestätigt) / false (abgebrochen). */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

export const useFeedback = (): FeedbackContextValue => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback muss innerhalb eines FeedbackProvider verwendet werden');
  }
  return ctx;
};

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'success' });
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { open: boolean }) | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const showSuccess = useCallback((message: string) => setToast({ open: true, message, severity: 'success' }), []);
  const showError = useCallback((message: string) => setToast({ open: true, message, severity: 'error' }), []);
  const showWarning = useCallback((message: string) => setToast({ open: true, message, severity: 'warning' }), []);
  const showInfo = useCallback((message: string) => setToast({ open: true, message, severity: 'info' }), []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setConfirmState({ ...options, open: true });
    });
  }, []);

  const closeConfirm = useCallback((result: boolean) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
    setConfirmState((prev) => (prev ? { ...prev, open: false } : null));
  }, []);

  const closeToast = useCallback((_event?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <FeedbackContext.Provider value={{ showSuccess, showError, showWarning, showInfo, confirm }}>
      {children}

      <Snackbar
        open={toast.open}
        autoHideDuration={toast.severity === 'error' ? 8000 : 4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => closeToast()} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

      <Dialog open={!!confirmState?.open} onClose={() => closeConfirm(false)} maxWidth="xs" fullWidth>
        {confirmState?.title && <DialogTitle>{confirmState.title}</DialogTitle>}
        <DialogContent>
          <DialogContentText sx={{ whiteSpace: 'pre-line' }}>{confirmState?.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeConfirm(false)}>{confirmState?.cancelLabel || 'Abbrechen'}</Button>
          <Button
            onClick={() => closeConfirm(true)}
            variant="contained"
            color={confirmState?.destructive ? 'error' : 'primary'}
            autoFocus
          >
            {confirmState?.confirmLabel || 'Bestätigen'}
          </Button>
        </DialogActions>
      </Dialog>
    </FeedbackContext.Provider>
  );
};
