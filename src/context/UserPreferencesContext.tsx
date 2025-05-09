import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserPreferences {
  expandedSections: Record<string, boolean>;
  previewMode: 'mobile' | 'desktop';
  showPreview: boolean;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setSectionExpanded: (sectionId: string, expanded: boolean) => void;
  setPreviewMode: (mode: 'mobile' | 'desktop') => void;
  setShowPreview: (show: boolean) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  expandedSections: {},
  previewMode: 'mobile',
  showPreview: true
};

const LOCAL_STORAGE_KEY = 'flow-ui-toolkit-user-preferences';

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Lade gespeicherte Präferenzen aus dem localStorage, falls vorhanden
    const savedPreferences = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedPreferences ? JSON.parse(savedPreferences) : defaultPreferences;
  });

  // Speichere Präferenzen im localStorage, wenn sie sich ändern
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const setSectionExpanded = (sectionId: string, expanded: boolean) => {
    setPreferences(prev => ({
      ...prev,
      expandedSections: {
        ...prev.expandedSections,
        [sectionId]: expanded
      }
    }));
  };

  const setPreviewMode = (mode: 'mobile' | 'desktop') => {
    setPreferences(prev => ({
      ...prev,
      previewMode: mode
    }));
  };

  const setShowPreview = (show: boolean) => {
    setPreferences(prev => ({
      ...prev,
      showPreview: show
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        setSectionExpanded,
        setPreviewMode,
        setShowPreview,
        resetPreferences
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
