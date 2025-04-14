import React from 'react';
import styled from 'styled-components';
import { AppBar, Toolbar, Button, IconButton, Tooltip } from '@mui/material';
import {
  Add as AddIcon,
  FolderOpen as OpenIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon
} from '@mui/icons-material';

interface NavigationProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const StyledAppBar = styled(AppBar)`
  background-color: #2c2c2c;
  color: white;
`;

const StyledToolbar = styled(Toolbar)`
  justify-content: space-between;
`;

const LeftActions = styled.div`
  display: flex;
  gap: 8px;
`;

const RightActions = styled.div`
  display: flex;
  gap: 8px;
`;

const Navigation: React.FC<NavigationProps> = ({
  onNew,
  onOpen,
  onSave,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <LeftActions>
          <Tooltip title="Neu">
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={onNew}
            >
              Neu
            </Button>
          </Tooltip>
          <Tooltip title="Öffnen">
            <Button
              color="inherit"
              startIcon={<OpenIcon />}
              onClick={onOpen}
            >
              Öffnen
            </Button>
          </Tooltip>
          <Tooltip title="Speichern">
            <Button
              color="inherit"
              startIcon={<SaveIcon />}
              onClick={onSave}
            >
              Speichern
            </Button>
          </Tooltip>
        </LeftActions>

        <RightActions>
          <Tooltip title="Rückgängig">
            <span>
              <IconButton
                color="inherit"
                onClick={onUndo}
                disabled={!canUndo}
                size="large"
              >
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Wiederherstellen">
            <span>
              <IconButton
                color="inherit"
                onClick={onRedo}
                disabled={!canRedo}
                size="large"
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
