import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageNavigator from './PageNavigator';
import { EditorProvider } from '../../context/EditorContext';

// Mock für den UUID-Generator
jest.mock('uuid', () => ({
  v4: () => 'test-uuid'
}));

describe('PageNavigator Komponente', () => {
  const mockPages = [
    {
      pattern_type: 'Page',
      id: 'page-1',
      title: { de: 'Seite 1', en: 'Page 1' },
      elements: []
    },
    {
      pattern_type: 'Page',
      id: 'page-2',
      title: { de: 'Seite 2', en: 'Page 2' },
      elements: []
    }
  ];
  
  test('Zeigt alle Seiten-Tabs an', () => {
    render(
      <EditorProvider>
        <PageNavigator 
          pages={mockPages} 
          selectedPageId="page-1"
        />
      </EditorProvider>
    );
    
    expect(screen.getByText('Seite 1')).toBeInTheDocument();
    expect(screen.getByText('Seite 2')).toBeInTheDocument();
  });
  
  test('Zeigt "Neue Seite hinzufügen" Button an', () => {
    render(
      <EditorProvider>
        <PageNavigator 
          pages={mockPages} 
          selectedPageId="page-1"
        />
      </EditorProvider>
    );
    
    // Finde Button anhand des Aria-Labels (ToolTip)
    const addButton = screen.getByLabelText('Neue Seite hinzufügen');
    expect(addButton).toBeInTheDocument();
  });
  
  test('Öffnet Dialog zum Erstellen einer neuen Seite', () => {
    render(
      <EditorProvider>
        <PageNavigator 
          pages={mockPages} 
          selectedPageId="page-1"
        />
      </EditorProvider>
    );
    
    // Klicken auf den "Neue Seite hinzufügen" Button
    const addButton = screen.getByLabelText('Neue Seite hinzufügen');
    fireEvent.click(addButton);
    
    // Dialog sollte angezeigt werden
    expect(screen.getByText('Neue Seite erstellen')).toBeInTheDocument();
    expect(screen.getByLabelText('Seitentitel')).toBeInTheDocument();
    expect(screen.getByText('Abbrechen')).toBeInTheDocument();
    expect(screen.getByText('Erstellen')).toBeInTheDocument();
  });
  
  test('Zeigt Hinweis an, wenn keine Seiten vorhanden sind', () => {
    render(
      <EditorProvider>
        <PageNavigator 
          pages={[]} 
          selectedPageId={null}
        />
      </EditorProvider>
    );
    
    expect(screen.getByText('Keine Seiten vorhanden')).toBeInTheDocument();
    expect(screen.getByText('Erste Seite erstellen')).toBeInTheDocument();
  });
});

// Damit die Datei als ES-Modul behandelt wird
export {};
