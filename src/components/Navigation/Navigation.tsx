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
  HelpOutline as HelpIcon
} from '@mui/icons-material';

interface NavigationProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onEditWorkflowName: () => void;
  onOpenDocumentation?: () => void;
  workflowName: string;
}

const StyledAppBar = styled(AppBar)`
  background-color: #2A2E3F;
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
  onOpenDocumentation,
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
                bgcolor: '#009F64',
                color: 'white',
                '&:hover': { bgcolor: '#008D58' }
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
                bgcolor: '#009F64',
                color: 'white',
                '&:hover': { bgcolor: '#008D58' }
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
                bgcolor: '#009F64',
                color: 'white',
                '&:hover': { bgcolor: '#008D58' }
              }}
            >
              Speichern
            </Button>
          </Tooltip>
          <Tooltip title="Workflow-Namen bearbeiten">
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={onEditWorkflowName}
              sx={{
                bgcolor: '#009F64',
                color: 'white',
                '&:hover': { bgcolor: '#008D58' },
                fontWeight: 'bold'
              }}
            >
              {workflowName || "Workflow"}
            </Button>
          </Tooltip>
        </LeftActions>
        </Box>

        <RightActions>
          {onOpenDocumentation && (
            <Tooltip title="Dokumentation öffnen">
              <span>
                <IconButton
                  onClick={onOpenDocumentation}
                  size="large"
                  sx={{
                    bgcolor: '#009F64',
                    color: 'white',
                    '&:hover': { bgcolor: '#008D58' }
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
                  bgcolor: '#009F64',
                  color: 'white',
                  '&:hover': { bgcolor: '#008D58' },
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
                  bgcolor: '#009F64',
                  color: 'white',
                  '&:hover': { bgcolor: '#008D58' },
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
