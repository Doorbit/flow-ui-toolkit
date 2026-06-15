import React, { useMemo, useState } from 'react';
import { Chip, Typography } from '@mui/material';
import type { ErrorObject } from 'ajv';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useEditor } from '../../context/EditorContext';
import { useSchema } from '../../context/SchemaContext';
import DialogBase from './DialogBase';
import ValidationHelper, { ValidationMessage } from '../PropertyEditor/common/ValidationHelper';
import { tokens } from '../../theme/tokens';

/**
 * Wandelt AJV-Fehler in lesbare Validierungsmeldungen um. Filtert das if/then-Wrapper-
 * Rauschen heraus und dedupliziert. Der Instanz-Pfad gibt grob an, wo das Problem sitzt.
 */
function errorsToMessages(errors: ErrorObject[] | null): ValidationMessage[] {
  if (!errors) return [];
  const seen = new Set<string>();
  const out: ValidationMessage[] = [];
  for (const e of errors) {
    if (e.keyword === 'if') continue; // Wrapper der bedingten Typ-Regeln – kein eigener Fehler
    const path = e.instancePath || '';
    const detail =
      e.keyword === 'required'
        ? `Pflichtfeld fehlt: „${(e.params as { missingProperty?: string }).missingProperty}"`
        : e.message || 'ungültig';
    const message = path ? `${path} — ${detail}` : detail;
    if (seen.has(message)) continue;
    seen.add(message);
    out.push({ severity: 'error', message });
  }
  return out;
}

/**
 * Toolbar-Indikator für die Schema-Gültigkeit des aktuellen Flows.
 * Grün „Gültig" oder rot „N Probleme" → Klick öffnet die Fehlerliste.
 * Validiert lenient gegen `listingFlowSchema` (keine False-Positives auf echten Flows).
 */
const ValidationStatus: React.FC = () => {
  const { state } = useEditor();
  const { validateFlow } = useSchema();
  const [open, setOpen] = useState(false);

  const messages = useMemo(() => {
    if (!state.currentFlow) return [];
    const res = validateFlow(state.currentFlow);
    return res.isValid ? [] : errorsToMessages(res.errors);
  }, [state.currentFlow, validateFlow]);

  if (!state.currentFlow) return null;

  const count = messages.length;

  if (count === 0) {
    return (
      <Chip
        size="small"
        variant="outlined"
        icon={<CheckCircleOutlineIcon />}
        label="Gültig"
        aria-label="Flow ist schema-gültig"
        sx={{ color: tokens.surface.paper, borderColor: 'rgba(255,255,255,0.5)', '& .MuiChip-icon': { color: tokens.brand.greenBrightSoft } }}
      />
    );
  }

  return (
    <>
      <Chip
        size="small"
        color="warning"
        clickable
        onClick={() => setOpen(true)}
        icon={<ErrorOutlineIcon />}
        label={`${count} ${count === 1 ? 'Problem' : 'Probleme'}`}
        aria-label={`${count} Schema-Probleme anzeigen`}
      />
      <DialogBase
        open={open}
        onClose={() => setOpen(false)}
        title="Schema-Validierung"
        maxWidth="sm"
        onConfirm={() => setOpen(false)}
        confirmLabel="Schließen"
        hideCancel
      >
        <ValidationHelper
          messages={messages}
          collapsible={false}
          title={`${count} ${count === 1 ? 'Problem' : 'Probleme'} gefunden`}
        />
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
          Prüft Pflichtfelder und Struktur gegen das Flow-Schema. Unbekannte Zusatzfelder sind erlaubt.
        </Typography>
      </DialogBase>
    </>
  );
};

export default ValidationStatus;
