import React from 'react';
import { Box, Stack, Typography, Divider } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import DialogBase from './DialogBase';

interface OnboardingDialogProps {
  open: boolean;
  onClose: () => void;
}

const columns: { icon: React.ReactNode; title: string; text: string }[] = [
  {
    icon: <AccountTreeOutlinedIcon color="primary" />,
    title: 'Struktur (links)',
    text: 'Der Baum aller Elemente der aktuellen Seite. Hier navigierst du und wählst ein Element aus.',
  },
  {
    icon: <WidgetsOutlinedIcon color="primary" />,
    title: 'Elemente (Mitte)',
    text: 'Der Inhalt der aktuellen Ebene. Hier fügst du Elemente hinzu und gehst in Gruppen hinein.',
  },
  {
    icon: <TuneOutlinedIcon color="primary" />,
    title: 'Eigenschaften (rechts)',
    text: 'Bearbeitet das ausgewählte Element — Titel, Feld-ID, Optionen, Sichtbarkeit usw.',
  },
];

const steps = [
  'Seite anlegen oder auswählen (Leiste oben).',
  'In der Mitte Elemente hinzufügen — Eingaben brauchen eine Feld-ID, dort landet der Wert.',
  'Rechts die Eigenschaften setzen. Speichern exportiert den Flow als JSON.',
];

/**
 * Erstkontakt-Onboarding: erklärt das 3-Spalten-Modell und den Grundablauf.
 * Wird beim ersten Start automatisch gezeigt (localStorage) und ist über das
 * Toolbar-Icon „Erste Schritte" jederzeit erneut aufrufbar.
 */
const OnboardingDialog: React.FC<OnboardingDialogProps> = ({ open, onClose }) => (
  <DialogBase
    open={open}
    onClose={onClose}
    title="Willkommen im Flow-Editor"
    maxWidth="sm"
    onConfirm={onClose}
    confirmLabel="Los geht's"
    hideCancel
  >
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Mit dem Flow-Editor baust du mehrseitige Formular-Workflows („Flows"), die später in der
      doorbit-App gerendert werden. Der Editor hat drei Spalten:
    </Typography>

    <Stack spacing={1.5} sx={{ mb: 2 }}>
      {columns.map((c) => (
        <Box key={c.title} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Box sx={{ mt: '2px' }}>{c.icon}</Box>
          <Box>
            <Typography variant="subtitle2">{c.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {c.text}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>

    <Divider sx={{ my: 2 }} />

    <Typography variant="subtitle2" sx={{ mb: 1 }}>
      In drei Schritten zum Flow
    </Typography>
    <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
      {steps.map((s) => (
        <Typography key={s} component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {s}
        </Typography>
      ))}
    </Box>

    <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
      Diese Tour findest du jederzeit über das Symbol „Erste Schritte" oben rechts.
    </Typography>
  </DialogBase>
);

export default OnboardingDialog;
