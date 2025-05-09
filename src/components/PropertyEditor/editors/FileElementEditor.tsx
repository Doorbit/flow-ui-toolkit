import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Chip,
  Paper,
  Divider,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { FileUIElement } from '../../../models/uiElements';
import { TranslatableField } from '../common/TranslatableField';
import { VisibilityConditionEditor } from './VisibilityConditionEditor';
import { useSubflow } from '../../../context/SubflowContext';
import IconField from '../common/IconField';

interface FileElementEditorProps {
  element: FileUIElement;
  onChange: (updatedElement: FileUIElement) => void;
}

/**
 * Spezialisierte Komponente für die Bearbeitung von FileUIElements.
 * Unterstützt die Bearbeitung von Eigenschaften wie Titel, Mindest- und Höchstanzahl von Dateien,
 * erlaubte Dateitypen, etc.
 */
const FileElementEditor: React.FC<FileElementEditorProps> = ({ element, onChange }) => {
  const [newFileType, setNewFileType] = useState('');
  const { state: subflowState } = useSubflow();

  // Funktion zum Hinzufügen eines neuen erlaubten Dateityps
  const handleAddFileType = () => {
    if (!newFileType) return;

    const updatedElement = {
      ...element,
      allowed_file_types: [...(element.allowed_file_types || []), newFileType],
    };

    onChange(updatedElement);
    setNewFileType('');
  };

  // Funktion zum Entfernen eines erlaubten Dateityps
  const handleRemoveFileType = (fileType: string) => {
    const updatedElement = {
      ...element,
      allowed_file_types: (element.allowed_file_types || []).filter(
        (type) => type !== fileType
      ),
    };

    onChange(updatedElement);
  };

  // Funktion zum Aktualisieren der Visibility-Bedingung
  const handleVisibilityChange = (newCondition: any) => {
    if (newCondition) {
      onChange({
        ...element,
        visibility_condition: newCondition,
      });
    } else {
      // Entferne die Visibility-Bedingung
      const { visibility_condition, ...restElement } = element;
      onChange(restElement as FileUIElement);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Datei-Element bearbeiten
        </Typography>

        <Divider />

        <TranslatableField
          label="Titel"
          value={element.title}
          onChange={(value) => {
            onChange({
              ...element,
              title: value,
            });
          }}
        />

        <TranslatableField
          label="Beschreibung"
          value={element.description}
          onChange={(value) => {
            onChange({
              ...element,
              description: value,
            });
          }}
        />

        <IconField
          value={element.icon || ''}
          onChange={(value) => {
            onChange({
              ...element,
              icon: value,
            });
          }}
          fullWidth
        />

        <FormControl fullWidth size="small">
          <InputLabel>Dateityp</InputLabel>
          <Select
            value={element.file_type || 'IMAGE'}
            label="Dateityp"
            onChange={(e) => {
              onChange({
                ...element,
                file_type: e.target.value as 'IMAGE' | 'FILE',
              });
            }}
          >
            <MenuItem value="IMAGE">Bild</MenuItem>
            <MenuItem value="FILE">Datei</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Feld-ID für Datei-IDs"
          size="small"
          fullWidth
          value={element.id_field_id?.field_name || ''}
          onChange={(e) => {
            onChange({
              ...element,
              id_field_id: {
                field_name: e.target.value,
              },
            });
          }}
        />

        <TextField
          label="Feld-ID für Beschriftungen"
          size="small"
          fullWidth
          value={element.caption_field_id?.field_name || ''}
          onChange={(e) => {
            onChange({
              ...element,
              caption_field_id: {
                field_name: e.target.value,
              },
            });
          }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          <Box>
            <TextField
              label="Mindestanzahl"
              type="number"
              size="small"
              fullWidth
              value={element.min_count !== undefined ? element.min_count : 0}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                onChange({
                  ...element,
                  min_count: isNaN(value) ? 0 : value,
                });
              }}
            />
          </Box>
          <Box>
            <TextField
              label="Höchstanzahl"
              type="number"
              size="small"
              fullWidth
              value={element.max_count !== undefined ? element.max_count : 1}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                onChange({
                  ...element,
                  max_count: isNaN(value) ? 1 : value,
                });
              }}
            />
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={element.required}
              onChange={(e) => {
                onChange({
                  ...element,
                  required: e.target.checked,
                });
              }}
            />
          }
          label="Erforderlich"
        />

        <Divider />

        <Typography variant="subtitle1">Erlaubte Dateitypen</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {(element.allowed_file_types || []).map((fileType) => (
            <Chip
              key={fileType}
              label={fileType}
              onDelete={() => handleRemoveFileType(fileType)}
              icon={
                fileType.startsWith('image/') ? <ImageIcon /> : <AttachFileIcon />
              }
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="Neuer Dateityp (z.B. image/jpeg)"
            size="small"
            fullWidth
            value={newFileType}
            onChange={(e) => setNewFileType(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddFileType();
              }
            }}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddFileType}
          >
            Hinzufügen
          </Button>
        </Box>

        <Divider />

        <Typography variant="subtitle1">Vorschläge für Dateitypen</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="image/jpeg"
            onClick={() => setNewFileType('image/jpeg')}
            icon={<ImageIcon />}
          />
          <Chip
            label="image/png"
            onClick={() => setNewFileType('image/png')}
            icon={<ImageIcon />}
          />
          <Chip
            label="image/webp"
            onClick={() => setNewFileType('image/webp')}
            icon={<ImageIcon />}
          />
          <Chip
            label="application/pdf"
            onClick={() => setNewFileType('application/pdf')}
            icon={<AttachFileIcon />}
          />
          <Chip
            label="application/msword"
            onClick={() => setNewFileType('application/msword')}
            icon={<AttachFileIcon />}
          />
          <Chip
            label="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onClick={() =>
              setNewFileType(
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              )
            }
            icon={<AttachFileIcon />}
          />
        </Box>

        <Divider />

        <Typography variant="subtitle1">Sichtbarkeitsregeln</Typography>
        <VisibilityConditionEditor
          visibilityCondition={element.visibility_condition}
          onChange={handleVisibilityChange}
          showAsAccordion={false}
        />
      </Box>
    </Paper>
  );
};

export default FileElementEditor;
