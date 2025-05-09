import React from 'react';

interface EditPageDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  initialTitle?: string;
  isNewPage?: boolean;
}

const EditPageDialog: React.FC<EditPageDialogProps> = ({ 
  open, 
  onClose, 
  onSave, 
  initialTitle = '', 
  isNewPage = false 
}) => {
  return (
    <div 
      data-testid="edit-page-dialog" 
      style={{ display: open ? 'block' : 'none' }}
    >
      <h2>{isNewPage ? 'Neue Seite erstellen' : 'Seite bearbeiten'}</h2>
      <div>
        <label htmlFor="page-title">Seitentitel</label>
        <input 
          id="page-title"
          aria-label="Seitentitel"
          defaultValue={initialTitle}
        />
      </div>
      <div>
        <button onClick={onClose}>Abbrechen</button>
        <button onClick={() => onSave(initialTitle)}>
          {isNewPage ? 'Erstellen' : 'Speichern'}
        </button>
      </div>
    </div>
  );
};

export default EditPageDialog;
