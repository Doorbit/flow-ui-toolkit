import React, { useId } from 'react';
import {
  Box,
  Breakpoint,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@mui/material';

/**
 * Einheitliche Dialog-Basis: konsistente Titel/Actions, automatisches `fullScreen`
 * auf kleinen Screens, Fokus auf der Primär-Aktion und `aria-labelledby` für
 * Screenreader. Vereinheitlicht die bislang bespoke gebauten Dialoge.
 *
 * Zwei Nutzungsformen:
 *  - Bequem: `onConfirm` + `confirmLabel` → Standard-Actionbar (Abbrechen + Bestätigen).
 *  - Frei: `actions` (eigene Buttons) überschreibt die Standard-Actionbar.
 */
export interface DialogBaseProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  /** Zusätzliches Element rechts neben dem Titel (z. B. ein Info-Tooltip). */
  titleAdornment?: React.ReactNode;
  maxWidth?: Breakpoint | false;
  fullWidth?: boolean;
  /** Bestätigungs-Handler für die Standard-Actionbar. */
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  /** Färbt die Bestätigen-Schaltfläche rot (löschende/überschreibende Aktionen). */
  destructive?: boolean;
  /** Blendet den Abbrechen-Button aus (z. B. erzwungener Erst-Dialog). */
  hideCancel?: boolean;
  /** Eigene Actionbar; überschreibt onConfirm/confirm/cancel. */
  actions?: React.ReactNode;
}

const DialogBase: React.FC<DialogBaseProps> = ({
  open,
  onClose,
  title,
  children,
  titleAdornment,
  maxWidth = 'sm',
  fullWidth = true,
  onConfirm,
  confirmLabel = 'Speichern',
  cancelLabel = 'Abbrechen',
  confirmDisabled = false,
  destructive = false,
  hideCancel = false,
  actions,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const titleId = useId();

  const defaultActions = onConfirm ? (
    <>
      {!hideCancel && <Button onClick={onClose}>{cancelLabel}</Button>}
      <Button
        onClick={onConfirm}
        variant="contained"
        color={destructive ? 'error' : 'primary'}
        disabled={confirmDisabled}
        autoFocus
      >
        {confirmLabel}
      </Button>
    </>
  ) : null;

  const renderedActions = actions ?? defaultActions;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      aria-labelledby={titleId}
    >
      <DialogTitle id={titleId}>
        {titleAdornment ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {title}
            {titleAdornment}
          </Box>
        ) : (
          title
        )}
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      {renderedActions && <DialogActions>{renderedActions}</DialogActions>}
    </Dialog>
  );
};

export default DialogBase;
