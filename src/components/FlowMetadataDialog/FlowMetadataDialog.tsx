import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DialogBase from '../common/DialogBase';
import IconField from '../PropertyEditor/common/IconField';
import { slugify, validateSlug, validateRequired } from '../../utils/flowMetadata';

export interface FlowMetadata {
  name: string;
  id: string;
  urlKey: string;
  titleDe: string;
  titleEn: string;
  icon: string;
}

interface FlowMetadataDialogProps {
  open: boolean;
  initial: FlowMetadata;
  onClose: () => void;
  onSave: (meta: FlowMetadata) => void;
}

/**
 * Editor für die Flow-Metadaten (`id`, `url-key`, `name`, `title` de/en, `icon`).
 * Löst den früheren reinen Namens-Dialog ab, der `id`/`url-key`/`title` still aus dem
 * Namen ableitete und das Icon gar nicht editierbar machte. `id`/`url-key` werden als
 * slug-artige Identifier validiert.
 */
const FlowMetadataDialog: React.FC<FlowMetadataDialogProps> = ({ open, initial, onClose, onSave }) => {
  const [name, setName] = useState(initial.name);
  const [id, setId] = useState(initial.id);
  const [urlKey, setUrlKey] = useState(initial.urlKey);
  const [titleDe, setTitleDe] = useState(initial.titleDe);
  const [titleEn, setTitleEn] = useState(initial.titleEn);
  const [icon, setIcon] = useState(initial.icon);

  // Felder beim Öffnen auf den aktuellen Flow-Zustand zurücksetzen.
  useEffect(() => {
    if (open) {
      setName(initial.name);
      setId(initial.id);
      setUrlKey(initial.urlKey);
      setTitleDe(initial.titleDe);
      setTitleEn(initial.titleEn);
      setIcon(initial.icon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const nameError = validateRequired(name, 'Name');
  const idError = validateSlug(id, 'ID');
  const urlKeyError = validateSlug(urlKey, 'URL-Key');
  const titleDeError = validateRequired(titleDe, 'Titel (Deutsch)');
  const hasError = !!(nameError || idError || urlKeyError || titleDeError);

  const handleConfirm = () => {
    if (hasError) return;
    onSave({
      name: name.trim(),
      id: id.trim(),
      urlKey: urlKey.trim(),
      titleDe: titleDe.trim(),
      titleEn: titleEn.trim(),
      icon,
    });
    onClose();
  };

  return (
    <DialogBase
      open={open}
      onClose={onClose}
      title="Flow-Eigenschaften"
      onConfirm={handleConfirm}
      confirmLabel="Speichern"
      confirmDisabled={hasError}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          autoFocus
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!nameError}
          helperText={nameError || 'Interner Anzeigename des Flows.'}
        />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            label="ID"
            fullWidth
            value={id}
            onChange={(e) => setId(e.target.value)}
            error={!!idError}
            helperText={idError || 'Technischer Identifier (z. B. doorbit_esg).'}
          />
          <Button
            size="small"
            startIcon={<AutoFixHighIcon />}
            onClick={() => setId(slugify(name))}
            sx={{ mt: 1, flexShrink: 0 }}
          >
            aus Name
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            label="URL-Key"
            fullWidth
            value={urlKey}
            onChange={(e) => setUrlKey(e.target.value)}
            error={!!urlKeyError}
            helperText={urlKeyError || 'Identifier in der URL (z. B. new-flow).'}
          />
          <Button
            size="small"
            startIcon={<AutoFixHighIcon />}
            onClick={() => setUrlKey(slugify(name))}
            sx={{ mt: 1, flexShrink: 0 }}
          >
            aus Name
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mt: 1 }}>
          Titel (nutzersichtbar)
        </Typography>
        <TextField
          label="Titel (Deutsch)"
          fullWidth
          value={titleDe}
          onChange={(e) => setTitleDe(e.target.value)}
          error={!!titleDeError}
          helperText={titleDeError || undefined}
        />
        <TextField
          label="Titel (Englisch)"
          fullWidth
          value={titleEn}
          onChange={(e) => setTitleEn(e.target.value)}
        />

        <IconField value={icon} onChange={setIcon} label="Flow-Icon" fullWidth />
      </Box>
    </DialogBase>
  );
};

export default FlowMetadataDialog;
