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
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  InputAdornment,
  FormHelperText
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TitleIcon from '@mui/icons-material/Title';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';

import { FileUIElement } from '../../../models/uiElements';
import { TranslatableField } from '../common/TranslatableField';

import { AccordionSection } from '../common/AccordionSection';
import { ElementTypeIndicator } from '../common/ElementTypeIndicator';
import { ElementPreview } from '../common/ElementPreview';
import IconField from '../common/IconField';

interface FileElementEditorEnhancedProps {
  element: FileUIElement;
  onChange: (updatedElement: FileUIElement) => void;
}

/**
 * Verbesserte Komponente für die Bearbeitung von FileUIElements.
 * Unterstützt die Bearbeitung von Eigenschaften wie Titel, Mindest- und Höchstanzahl von Dateien,
 * erlaubte Dateitypen, etc.
 */
const FileElementEditorEnhanced: React.FC<FileElementEditorEnhancedProps> = ({ element, onChange }) => {
  const [newFileType, setNewFileType] = useState('');

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
  /*
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
  */

  // Hilfsfunktion zum Ermitteln des Icons basierend auf dem Dateityp
  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (fileType.includes('pdf')) {
      return <PictureAsPdfIcon />;
    } else {
      return <AttachFileIcon />;
    }
  };

  // Hilfsfunktion zum Ermitteln des Anzeigenamens für den Dateityp
  const getFileTypeName = (fileType: string) => {
    switch (fileType) {
      case 'image/jpeg':
        return 'JPEG-Bild';
      case 'image/png':
        return 'PNG-Bild';
      case 'image/webp':
        return 'WebP-Bild';
      case 'application/pdf':
        return 'PDF-Dokument';
      case 'application/msword':
        return 'Word-Dokument (.doc)';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'Word-Dokument (.docx)';
      default:
        return fileType;
    }
  };

  return (
    <>
      <ElementTypeIndicator
        type={element.file_type === 'IMAGE' ? 'Bild-Upload' : 'Datei-Upload'}
        icon={element.file_type === 'IMAGE' ? <ImageIcon fontSize="large" color="primary" /> : <AttachFileIcon fontSize="large" color="primary" />}
        description={element.file_type === 'IMAGE' ? 'Ermöglicht Benutzern das Hochladen von Bildern' : 'Ermöglicht Benutzern das Hochladen von Dateien'}
      />

      <AccordionSection
        title="Grundlegende Informationen"
        icon={<TitleIcon />}
        defaultExpanded={true}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TranslatableField
            label="Titel"
            value={element.title || { de: '', en: '' }}
            onChange={(value) => {
              onChange({
                ...element,
                title: value,
              });
            }}
          />

          <TranslatableField
            label="Beschreibung"
            value={element.description || { de: '', en: '' }}
            onChange={(value) => {
              onChange({
                ...element,
                description: value,
              });
            }}
            multiline
            rows={2}
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
        </Box>
      </AccordionSection>

      <AccordionSection
        title="Inhalt & Verhalten"
        icon={<TuneIcon />}
        defaultExpanded={true}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            <FormHelperText>
              {element.file_type === 'IMAGE'
                ? 'Nur Bildformate werden akzeptiert und als Vorschau angezeigt'
                : 'Alle konfigurierten Dateitypen werden akzeptiert'}
            </FormHelperText>
          </FormControl>

          <Typography variant="subtitle2" gutterBottom>
            Erlaubte Dateitypen
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {(element.allowed_file_types || []).length > 0 ? (
              (element.allowed_file_types || []).map((fileType) => (
                <Chip
                  key={fileType}
                  label={getFileTypeName(fileType)}
                  onDelete={() => handleRemoveFileType(fileType)}
                  icon={getFileTypeIcon(fileType)}
                  variant="outlined"
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Keine Dateitypen definiert. Alle Dateitypen werden akzeptiert.
              </Typography>
            )}
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
              disabled={!newFileType.trim()}
            >
              Hinzufügen
            </Button>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Häufig verwendete Dateitypen
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="JPEG-Bild"
              onClick={() => setNewFileType('image/jpeg')}
              icon={<ImageIcon />}
              variant="outlined"
              size="small"
            />
            <Chip
              label="PNG-Bild"
              onClick={() => setNewFileType('image/png')}
              icon={<ImageIcon />}
              variant="outlined"
              size="small"
            />
            <Chip
              label="PDF-Dokument"
              onClick={() => setNewFileType('application/pdf')}
              icon={<PictureAsPdfIcon />}
              variant="outlined"
              size="small"
            />
            <Chip
              label="Word-Dokument"
              onClick={() => setNewFileType('application/msword')}
              icon={<DescriptionIcon />}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>
      </AccordionSection>

      <AccordionSection
        title="Validierung & Einschränkungen"
        icon={<VerifiedIcon />}
        defaultExpanded={false}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={!!element.required}
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

          <Grid container spacing={2}>
            <Grid size={6}>
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
                InputProps={{
                  inputProps: { min: 0 },
                  startAdornment: (
                    <InputAdornment position="start">
                      Min
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid size={6}>
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
                InputProps={{
                  inputProps: { min: 1 },
                  startAdornment: (
                    <InputAdornment position="start">
                      Max
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
          <FormHelperText>
            {element.min_count === 0 && element.max_count === 1
              ? 'Eine optionale Datei kann hochgeladen werden'
              : element.min_count === 1 && element.max_count === 1
                ? 'Genau eine Datei muss hochgeladen werden'
                : element.min_count === 0 && element.max_count && element.max_count > 1
                  ? `Bis zu ${element.max_count} Dateien können hochgeladen werden`
                  : `Mindestens ${element.min_count} und höchstens ${element.max_count} Dateien müssen hochgeladen werden`
            }
          </FormHelperText>
        </Box>
      </AccordionSection>



      <ElementPreview title="Vorschau">
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {element.title?.de || (element.file_type === 'IMAGE' ? 'Bild hochladen' : 'Datei hochladen')}
          </Typography>

          <Box sx={{ mt: 1, mb: 1 }}>
            <Button
              variant="outlined"
              startIcon={element.file_type === 'IMAGE' ? <ImageIcon /> : <AttachFileIcon />}
              disabled
              fullWidth
            >
              {element.file_type === 'IMAGE' ? 'Bild auswählen' : 'Datei auswählen'}
            </Button>
          </Box>

          {element.file_type === 'IMAGE' && (
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardMedia
                component="img"
                height="140"
                image="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22288%22%20height%3D%22225%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20d%3D%22M287%2C113.5v111H1v-224h286V113.5z%22%20style%3D%22fill%3A%23dedede%3B%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20style%3D%22font-family%3A%20Arial%2C%20sans-serif%3Bfont-size%3A%2014px%3Btext-anchor%3A%20middle%3Bdominant-baseline%3A%20middle%3Bfill%3A%20%23a9a9a9%3B%22%3EBildvorschau%3C%2Ftext%3E%3C%2Fsvg%3E"
                alt="Bildvorschau"
              />
              <CardContent sx={{ py: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Beispielbild.jpg
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                <IconButton size="small" disabled>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          )}

          {element.file_type === 'FILE' && (
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFileIcon color="action" />
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                  Beispieldatei.pdf
                </Typography>
                <IconButton size="small" disabled>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardContent>
            </Card>
          )}

          {element.max_count && element.max_count > 1 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {element.min_count && element.min_count > 0
                ? `Mindestens ${element.min_count} von ${element.max_count} Dateien erforderlich`
                : `Maximal ${element.max_count} Dateien erlaubt`}
            </Typography>
          )}
        </Box>
      </ElementPreview>
    </>
  );
};

export default FileElementEditorEnhanced;
