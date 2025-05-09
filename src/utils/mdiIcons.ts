import * as mdiIcons from '@mdi/js';

// Extrahiere die Icon-Namen aus den Pfaden
export const getMdiIconNames = (): string[] => {
  return Object.keys(mdiIcons)
    .filter(key => key.startsWith('mdi'))
    .map(key => key);
};

// Kategorisiere die Icons basierend auf ihren Namen
export const categorizeIcon = (iconName: string): string => {
  // Haus & Gebäude
  if (/(Home|House|Villa|Cabin|Apartment|Building|Door|Window|Room|Kitchen|Bath|Bed|Living|Dining|Pool|Gate|Garage|Deck|Balcony|Stair)/i.test(iconName)) {
    return 'home';
  }

  // Smart Home & HVAC
  if (/(Thermostat|Smart|Device|Light|Heat|Ac|Hvac|Remote|Wifi|Network)/i.test(iconName)) {
    return 'smart';
  }

  // Sensoren & Steuerung
  if (/(Sensor|Alarm|Monitor|Control|Timer|Schedule|Security|Emergency|Warning|Safety)/i.test(iconName)) {
    return 'sensors';
  }

  // Versorgung & Zähler
  if (/(Water|Electric|Power|Gas|Meter|Energy|Solar|Wind|Battery|Outlet|Propane|Bolt)/i.test(iconName)) {
    return 'utilities';
  }

  // Wetter & Umwelt
  if (/(Cloud|Weather|Sun|Rain|Snow|Wind|Storm|Nature|Air|Forest|Eco|Wb|Landscape|Park)/i.test(iconName)) {
    return 'weather';
  }

  // UI Elemente
  if (/(Settings|View|Grid|Menu|Button|List|Table|Add|Edit|Delete|Save|Arrow|Dashboard)/i.test(iconName)) {
    return 'ui';
  }

  return 'all';
};

// Erstelle kategorisierte Icon-Listen
export const getCategorizedIcons = () => {
  const allIcons = getMdiIconNames();

  const categorizedIcons: Record<string, string[]> = {
    home: allIcons.filter(icon => categorizeIcon(icon) === 'home'),
    smart: allIcons.filter(icon => categorizeIcon(icon) === 'smart'),
    utilities: allIcons.filter(icon => categorizeIcon(icon) === 'utilities'),
    sensors: allIcons.filter(icon => categorizeIcon(icon) === 'sensors'),
    weather: allIcons.filter(icon => categorizeIcon(icon) === 'weather'),
    ui: allIcons.filter(icon => categorizeIcon(icon) === 'ui'),
    all: allIcons // Speichere alle Icons für die Suchfunktion, aber zeige sie nicht als Kategorie an
  };

  return [
    { id: 'home', label: 'Haus & Gebäude', icons: categorizedIcons.home },
    { id: 'smart', label: 'Smart Home & HVAC', icons: categorizedIcons.smart },
    { id: 'utilities', label: 'Versorgung & Zähler', icons: categorizedIcons.utilities },
    { id: 'sensors', label: 'Sensoren & Steuerung', icons: categorizedIcons.sensors },
    { id: 'weather', label: 'Wetter & Umwelt', icons: categorizedIcons.weather },
    { id: 'ui', label: 'UI Elemente', icons: categorizedIcons.ui }
  ];
};

// Hilfsfunktion zum Abrufen des Icon-Pfads
export const getIconPath = (iconName: string): string => {
  return (mdiIcons as any)[iconName] || '';
};

// Überprüfe, ob ein Icon in der MDI-Bibliothek existiert
export const iconExists = (iconName: string): boolean => {
  return !!getIconPath(iconName);
};

// Validiere alle Icons in der Anwendung
export const validateIcons = (): { valid: string[], invalid: string[] } => {
  const allIcons = getMdiIconNames();
  const valid: string[] = [];
  const invalid: string[] = [];

  allIcons.forEach(iconName => {
    if (iconExists(iconName)) {
      valid.push(iconName);
    } else {
      invalid.push(iconName);
    }
  });

  return { valid, invalid };
};
