import React from 'react';
import styled from 'styled-components';
import { AppBar, Toolbar, Button, IconButton, Tooltip, Box } from '@mui/material';
import {
  Add as AddIcon,
  FolderOpen as OpenIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Edit as EditIcon,
  Extension as ModulesIcon,
  HelpOutline as HelpIcon,
  KeyboardOutlined as KeyboardIcon,
  SchoolOutlined as OnboardingIcon
} from '@mui/icons-material';
import { tokens } from '../../theme/tokens';

interface NavigationProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onEditWorkflowName: () => void;
  onEditModules: () => void;
  onOpenDocumentation?: () => void;
  onShowShortcuts?: () => void;
  onShowOnboarding?: () => void;
  validationSlot?: React.ReactNode;
  workflowName: string;
}

const StyledAppBar = styled(AppBar)`
  background-color: ${tokens.text.primary};
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const StyledToolbar = styled(Toolbar)`
  justify-content: space-between;
  padding: 0 16px;
`;

const LeftActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const RightActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Navigation: React.FC<NavigationProps> = ({
  onNew,
  onOpen,
  onSave,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onEditWorkflowName,
  onEditModules,
  onOpenDocumentation,
  onShowShortcuts,
  onShowOnboarding,
  validationSlot,
  workflowName
}) => {
  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LeftActions>
          <Tooltip title="Neu">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onNew}
              sx={{
                bgcolor: tokens.brand.green,
                color: 'white',
                '&:hover': { bgcolor: tokens.brand.greenHover }
              }}
            >
              Neu
            </Button>
          </Tooltip>
          <Tooltip title="Öffnen">
            <Button
              variant="contained"
              startIcon={<OpenIcon />}
              onClick={onOpen}
              sx={{
                bgcolor: tokens.brand.green,
                color: 'white',
                '&:hover': { bgcolor: tokens.brand.greenHover }
              }}
            >
              Öffnen
            </Button>
          </Tooltip>
          <Tooltip title="Speichern">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={onSave}
              sx={{
                bgcolor: tokens.brand.green,
                color: 'white',
                '&:hover': { bgcolor: tokens.brand.greenHover }
              }}
            >
              Speichern
            </Button>
          </Tooltip>
          <Tooltip title="Flow-Eigenschaften bearbeiten (Name, ID, URL-Key, Titel, Icon)">
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={onEditWorkflowName}
              sx={{
                bgcolor: tokens.brand.green,
                color: 'white',
                '&:hover': { bgcolor: tokens.brand.greenHover },
                fontWeight: 'bold'
              }}
            >
              {workflowName || "Workflow"}
            </Button>
          </Tooltip>
          <Tooltip title="Module verwalten">
            <Button
              variant="outlined"
              startIcon={<ModulesIcon />}
              onClick={onEditModules}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.7)',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.12)' }
              }}
            >
              Module
            </Button>
          </Tooltip>
        </LeftActions>
        </Box>

        <RightActions>
          {validationSlot}
          {onShowOnboarding && (
            <Tooltip title="Erste Schritte (Editor-Tour)">
              <IconButton
                onClick={onShowOnboarding}
                size="large"
                aria-label="Erste Schritte anzeigen"
                sx={{
                  bgcolor: tokens.brand.green,
                  color: 'white',
                  '&:hover': { bgcolor: tokens.brand.greenHover }
                }}
              >
                <OnboardingIcon />
              </IconButton>
            </Tooltip>
          )}
          {onShowShortcuts && (
            <Tooltip title="Tastaturkürzel">
              <IconButton
                onClick={onShowShortcuts}
                size="large"
                aria-label="Tastaturkürzel anzeigen"
                sx={{
                  bgcolor: tokens.brand.green,
                  color: 'white',
                  '&:hover': { bgcolor: tokens.brand.greenHover }
                }}
              >
                <KeyboardIcon />
              </IconButton>
            </Tooltip>
          )}
          {onOpenDocumentation && (
            <Tooltip title="Dokumentation öffnen">
              <span>
                <IconButton
                  onClick={onOpenDocumentation}
                  size="large"
                  sx={{
                    bgcolor: tokens.brand.green,
                    color: 'white',
                    '&:hover': { bgcolor: tokens.brand.greenHover }
                  }}
                >
                  <HelpIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip title="Rückgängig">
            <span>
              <IconButton
                onClick={onUndo}
                disabled={!canUndo}
                size="large"
                sx={{
                  bgcolor: tokens.brand.green,
                  color: 'white',
                  '&:hover': { bgcolor: tokens.brand.greenHover },
                  '&.Mui-disabled': { opacity: 0.4, color: 'rgba(255, 255, 255, 0.5)' }
                }}
              >
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Wiederherstellen">
            <span>
              <IconButton
                onClick={onRedo}
                disabled={!canRedo}
                size="large"
                sx={{
                  bgcolor: tokens.brand.green,
                  color: 'white',
                  '&:hover': { bgcolor: tokens.brand.greenHover },
                  '&.Mui-disabled': { opacity: 0.4, color: 'rgba(255, 255, 255, 0.5)' }
                }}
              >
                <RedoIcon />
              </IconButton>
            </span>
          </Tooltip>
        </RightActions>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Navigation;
