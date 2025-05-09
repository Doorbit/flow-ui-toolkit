import React from 'react';
import Navigation from './components/Navigation/Navigation';

const App: React.FC = () => {
  return (
    <div className="app-container" data-testid="app-container">
      <Navigation 
        onNew={() => {}}
        onOpen={() => {}}
        onSave={() => {}}
        onExport={() => {}}
        onImport={() => {}}
        onTogglePreview={() => {}}
        showPreview={false}
        // Neue Pflichtfelder
        canUndo={false}
        canRedo={false}
        onUndo={() => {}}
        onRedo={() => {}}
      />
      <div className="app-content">
        <div className="main-content">
          <div className="editor-content">
            {/* Editor-Bereich */}
            <div className="element-editor">
              {/* Element-Editor-Bereich */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
