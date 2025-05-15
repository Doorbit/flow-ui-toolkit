import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Tabs,
  Tab
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import { PatternLibraryElement } from '../../models/listingFlow';
import { VisibilityConditionEditor } from '../PropertyEditor/editors/VisibilityConditionEditor';
import StructureNavigator from './StructureNavigator';
import EnhancedElementEditorFactory from './EnhancedElementEditorFactory';
import { getContainerType } from '../../context/EditorContext';

const PropertyEditorContainer = styled(Paper)`
  width: 100%;
  height: 100%;
  background-color: #F8FAFC;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  border-left: 1px solid #E0E0E0;
`;

const EditorHeader = styled(Box)`
  padding: 1rem;
  background-color: #F8FAFC;
  border-bottom: 1px solid #E0E0E0;
`;

const EditorTitle = styled(Typography)`
  font-weight: 500;
  color: #2A2E3F;
`;

const EditorContent = styled(Box)`
  padding: 1rem;
  flex-grow: 1;
  overflow-y: auto;
  height: calc(100% - 64px - 56px); /* 100% - Tab-Höhe - Header-Höhe */
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled(Typography)`
  font-weight: 500;
  margin-top: 1rem;
  color: #009F64;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 159, 100, 0.1);
`;

const FormField = styled(Box)`
  margin-bottom: 1rem;
`;

const NoElementSelected = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
  color: #2A2E3F;
`;

interface EnhancedPropertyEditorProps {
  element: PatternLibraryElement | null;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
  onNavigateToElement?: (elementPath: number[]) => void;
  currentPath?: number[];
  selectedElementPath?: number[];
}

const EnhancedPropertyEditor: React.FC<EnhancedPropertyEditorProps> = ({
  element,
  onUpdate,
  onNavigateToElement,
  currentPath = [],
  selectedElementPath
}) => {
  const [activeTab, setActiveTab] = useState<string>('general');

  // Handler für Tab-Wechsel
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // Handler für Änderungen an Textfeldern
  const handleTextChange = (field: string, subfield?: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!element) return;

    const updatedElement = { ...element };
    const elementAny = updatedElement.element as any;

    if (subfield) {
      if (!elementAny[field]) {
        elementAny[field] = {};
      }
      elementAny[field][subfield] = event.target.value;
    } else {
      elementAny[field] = event.target.value;
    }

    onUpdate(updatedElement);
  };

  // Die Handler für Auswahlfelder und Schalter werden nicht mehr benötigt,
  // da diese Funktionalität jetzt in den spezialisierten Editor-Komponenten implementiert ist.

  // Handler für Änderungen an der Visibility Condition
  const handleVisibilityConditionChange = (condition: any) => {
    if (!element) return;

    const updatedElement = { ...element };
    updatedElement.element.visibility_condition = condition;

    onUpdate(updatedElement);
  };

  // Rendere die allgemeinen Eigenschaften
  const renderGeneralProperties = () => {
    if (!element) return null;

    const elementType = element.element.pattern_type;

    return (
      <Form>
        <SectionTitle variant="subtitle1">Allgemeine Eigenschaften</SectionTitle>

          {/* Bedingte Anzeige von ID-Feldern basierend auf dem Elementtyp */}
          {elementType === 'CustomUIElement' && (
            <FormField>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Seiten-ID
                </Typography>
                <Typography variant="body1">
                  {(element.element as any).id || 'Keine ID vorhanden'}
                </Typography>
              </Box>
            </FormField>
          )}

          {/* Für Datenelemente die Feld-ID anzeigen */}
          {(elementType === 'BooleanUIElement' ||
            elementType === 'StringUIElement' ||
            elementType === 'NumberUIElement' ||
            elementType === 'SingleSelectionUIElement' ||
            elementType === 'DateUIElement') && (
            <FormField>
              <TextField
                label="Feld-ID"
                value={(element.element as any).field_id?.field_name || ''}
                onChange={handleTextChange('field_id')}
                fullWidth
                variant="outlined"
                size="small"
              />
            </FormField>
          )}

          {/* Verwende die EnhancedElementEditorFactory für spezialisierte Editoren */}
          <EnhancedElementEditorFactory element={element} onUpdate={onUpdate} />

          {/* Die FileUIElement-Eigenschaften werden jetzt durch die EnhancedElementEditorFactory gerendert */}

          {/* Die Boolean-Eigenschaften werden jetzt durch die EnhancedElementEditorFactory gerendert */}



        {/* Beschreibungsfelder für komplexe Elemente wurden entfernt,
           da diese bereits in den spezialisierten Editor-Komponenten vorhanden sind */}

        {/* Die GroupUIElement-Eigenschaften werden jetzt durch die EnhancedElementEditorFactory gerendert */}

        {/* Die TextUIElement-Eigenschaften werden jetzt durch die EnhancedElementEditorFactory gerendert */}

        {/* Die NumberUIElement-Eigenschaften werden jetzt durch die EnhancedElementEditorFactory gerendert */}

        {/* Die SingleSelectionUIElement- und ChipGroupUIElement-Eigenschaften werden jetzt durch die EnhancedElementEditorFactory gerendert */}

        {/* Die ChipGroupUIElement-Eigenschaften werden jetzt durch die EnhancedElementEditorFactory gerendert */}
      </Form>
    );
  };

  // Rendere die Visibility Condition
  const renderVisibilityCondition = () => {
    if (!element) return null;

    return (
      <Form>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VisibilityIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">
            Bedingte Sichtbarkeit
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Definieren Sie, wann dieses Element sichtbar sein soll. Das Element wird nur angezeigt, wenn die Bedingung erfüllt ist.
        </Typography>

        <Box sx={{ p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 1, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Hinweis zu Feld-IDs
          </Typography>
          <Typography variant="body2">
            In der Dropdown-Liste werden die benutzerfreundlichen Feldtitel angezeigt, während im JSON die entsprechenden Feld-IDs verwendet werden.
            Die Feld-ID (z.B. "building_poi_is_todo") wird unter jedem Feldtitel angezeigt.
          </Typography>
        </Box>

        <VisibilityConditionEditor
          visibilityCondition={element.element.visibility_condition}
          onChange={handleVisibilityConditionChange}
          showAsAccordion={false}
        />

        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            Hinweis zur bedingten Sichtbarkeit:
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Die bedingte Sichtbarkeit bestimmt, wann ein Element angezeigt wird. Dies ist nicht zu verwechseln mit der Strukturnavigation, die es ermöglicht, durch die Hierarchie der Elemente zu navigieren.
          </Typography>
        </Box>
      </Form>
    );
  };



  // Rendere die JSON-Vorschau
  const renderJsonPreview = () => {
    if (!element) return null;

    return (
      <Form>
        <SectionTitle variant="subtitle1">JSON-Vorschau</SectionTitle>

        <Box
          sx={{
            p: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            overflow: 'auto',
            maxHeight: '400px'
          }}
        >
          <pre>{JSON.stringify(element.element, null, 2)}</pre>
        </Box>
      </Form>
    );
  };

  // Rendere die Struktur
  const renderStructure = () => {
    if (!element) return null;

    return (
      <Form>
        <StructureNavigator
          element={element}
          onNavigateToElement={onNavigateToElement || (() => {})}
          currentPath={currentPath || []}
          selectedElementPath={selectedElementPath}
        />
      </Form>
    );
  };

  // Rendere den Inhalt basierend auf dem aktiven Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralProperties();
      case 'visibility':
        return renderVisibilityCondition();
      case 'structure':
        return renderStructure();
      case 'json':
        return renderJsonPreview();
      default:
        return renderGeneralProperties();
    }
  };

  // Wenn kein Element ausgewählt ist, zeige einen Platzhalter
  if (!element) {
    return (
      <PropertyEditorContainer>
        <NoElementSelected>
          <SettingsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Kein Element ausgewählt
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Wählen Sie ein Element aus, um dessen Eigenschaften zu bearbeiten.
          </Typography>
        </NoElementSelected>
      </PropertyEditorContainer>
    );
  }

  return (
    <PropertyEditorContainer>
      <EditorHeader>
        <EditorTitle variant="subtitle1">
          {element.element.title?.de || element.element.title?.en || element.element.pattern_type}
        </EditorTitle>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Typ: {element.element.pattern_type || (element.element as any).type || 'Unbekannt'}
          </Typography>

          {/* Container-Typ anzeigen */}
          {getContainerType(element) !== 'none' && (
            <Typography
              variant="body2"
              sx={{
                color:
                  getContainerType(element) === 'group' ? '#009F64' :
                  getContainerType(element) === 'array' ? '#F05B29' :
                  getContainerType(element) === 'chipgroup' ? '#3F51B5' :
                  getContainerType(element) === 'custom' ? '#009F64' :
                  getContainerType(element) === 'subflow' ? '#009F64' :
                  'text.secondary'
              }}
            >
              Container-Typ: {getContainerType(element)}
            </Typography>
          )}
        </Box>
      </EditorHeader>

      <Box sx={{
        height: '64px', // Feste Höhe für den Container der Tab-Leiste
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              py: 1.5,
              fontSize: '0.875rem' // Etwas kleinere Schrift für bessere Lesbarkeit
            }
          }}
      >
        <Tab
          label="Allgemein"
          value="general"
          icon={<SettingsIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          label="Sichtbarkeit"
          value="visibility"
          icon={element.element.visibility_condition ?
            <VisibilityIcon fontSize="small" color="primary" /> :
            <VisibilityIcon fontSize="small" />
          }
          iconPosition="start"
        />
        <Tab
          label="Struktur"
          value="structure"
          icon={<AccountTreeIcon fontSize="small" color="success" />}
          iconPosition="start"
        />
        <Tab
          label="JSON"
          value="json"
          icon={<CodeIcon fontSize="small" />}
          iconPosition="start"
        />
      </Tabs>
      </Box>

      <EditorContent>
        {renderContent()}
      </EditorContent>
    </PropertyEditorContainer>
  );
};

export default EnhancedPropertyEditor;
