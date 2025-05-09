import React, { useState } from 'react';
import EditPageDialog from './EditPageDialog';

interface PageNavigatorProps {
  pages: Array<{id: string, title: string}>;
  onSelectPage?: (pageId: string) => void;
  onAddPage?: (title: string) => void;
  onEditPage?: (pageId: string, title: string) => void;
  onDeletePage?: (pageId: string) => void;
  onReorderPages?: (pages: any[]) => void;
}

const PageNavigator: React.FC<PageNavigatorProps> = ({
  pages,
  onSelectPage = () => {},
  onAddPage = () => {},
  onEditPage = () => {},
  onDeletePage = () => {},
  onReorderPages = () => {},
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleAddPage = () => {
    setDialogOpen(true);
  };
  
  return (
    <div className="MuiBox-root">
      {pages.length === 0 ? (
        <div data-testid="empty-pages-message">
          Keine Seiten vorhanden. Klicken Sie auf das Plus-Symbol, um eine neue Seite zu erstellen.
        </div>
      ) : (
        <div className="MuiTabs-root" data-testid="mock-tabs">
          {pages.map((page, index) => (
            <div 
              key={page.id}
              className="MuiButtonBase-root MuiTab-root MuiTab-textColorPrimary"
              style={{ opacity: 1, cursor: 'move', display: 'inline-flex', alignItems: 'center' }}
            >
              <div 
                className="MuiTab-root"
                data-testid="mock-tab"
                data-value={page.id}
              >
                <div className="MuiBox-root">
                  <span>{page.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div 
        className="MuiTooltip-root"
        data-tooltip="Neue Seite hinzufügen"
        aria-label="Neue Seite hinzufügen"
      >
        <button 
          className="MuiIconButton-root MuiIconButton-medium"
          onClick={handleAddPage}
        >
          <svg
            aria-hidden="true"
            className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-1umw9bq-MuiSvgIcon-root"
            data-testid="AddIcon"
            focusable="false"
            viewBox="0 0 24 24"
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
          </svg>
        </button>
      </div>
      
      <EditPageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(title) => {
          onAddPage(title);
          setDialogOpen(false);
        }}
        isNewPage={true}
      />
    </div>
  );
};

export default PageNavigator;
