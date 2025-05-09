import React from 'react';

// Synchronisiert mit der tatsächlichen Navigation.tsx
interface NavigationProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  // Zusätzliche Props für Rückwärtskompatibilität
  onImport?: () => void;
  onExport?: () => void;
  onTogglePreview?: () => void;
  showPreview?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  onNew,
  onOpen,
  onSave,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onImport,
  onExport,
  onTogglePreview,
  showPreview
}) => {
  return (
    <div className="styled-appbar" data-testid="navigation">
      <div className="mui-toolbar">
        <div className="left-actions">
          <button onClick={onNew} data-testid="btn-new">Neu</button>
          <button onClick={onOpen} data-testid="btn-open">Öffnen</button>
          <button onClick={onSave} data-testid="btn-save">Speichern</button>
          {onImport && <button onClick={onImport} data-testid="btn-import">Importieren</button>}
          {onExport && <button onClick={onExport} data-testid="btn-export">Exportieren</button>}
          {onTogglePreview && (
            <button onClick={onTogglePreview} data-testid="btn-preview">
              {showPreview ? "Editor anzeigen" : "JSON-Vorschau"}
            </button>
          )}
        </div>
        
        <div className="right-actions">
          <button 
            onClick={onUndo} 
            disabled={!canUndo}
            data-testid="btn-undo"
            aria-label="Rückgängig"
          >
            Undo
          </button>
          <button 
            onClick={onRedo} 
            disabled={!canRedo}
            data-testid="btn-redo"
            aria-label="Wiederherstellen"
          >
            Redo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
