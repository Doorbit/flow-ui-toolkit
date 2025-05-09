# Benutzerhandbuch - Flow UI Toolkit

## Übersicht

Das Flow UI Toolkit ermöglicht die visuelle Erstellung und Bearbeitung von individuellem Workflow in der doorbit App und in doorbit Web. Sie können verschiedene UI-Elemente per Drag & Drop platzieren, deren Eigenschaften anpassen und mehrsprachige Inhalte verwalten.

## Hauptfunktionen

### 1. Navigation und Werkzeugleiste

Die Hauptnavigation bietet folgende Funktionen:
- **Neu**: Erstellt einen neuen, leeren Flow
- **Öffnen**: Lädt einen bestehenden Flow aus einer JSON-Datei
- **Speichern**: Speichert den aktuellen Flow als JSON-Datei
- **Rückgängig/Wiederholen**: Ermöglicht das Rückgängigmachen und Wiederholen von Änderungen

### 2. Seitenverwaltung

- Mehrere Seiten pro Flow verwalten
- Seiten über Tabs navigieren
- Seiten durch Drag & Drop neu anordnen
- Seiten hinzufügen, bearbeiten oder löschen
- Seitentitel in mehreren Sprachen anpassen
- Material Design Icons für Seiten auswählen

#### Seiten bearbeiten
1. Klicken Sie auf das Bearbeiten-Symbol (Stift) neben dem Seiten-Tab
2. Im Dialog können Sie folgende Eigenschaften anpassen:
   - Titel in verschiedenen Sprachen (lang und kurz)
   - Icon aus der Material Design Bibliothek
   - Layout der Seite
   - Verknüpfung mit korrespondierenden Seiten

#### Icon-Auswahl
1. Klicken Sie im Seiten-Dialog auf "Icon auswählen"
2. Wählen Sie eine Kategorie (z.B. "Haus & Gebäude", "Smart Home & HVAC")
3. Nutzen Sie die Suchfunktion für spezifische Icons
4. Klicken Sie auf ein Icon, um es auszuwählen

### 3. Verfügbare UI-Elemente

#### Textuelle Elemente
- **Textblock**: Für Überschriften oder Absätze
- **Texteingabe**: Einzeilige oder mehrzeilige Texteingabefelder
- **String-Element**: Für formatierte Texteingaben mit Längenvalidierung

#### Auswahloptionen
- **Boolean**: Ja/Nein-Auswahl (Checkbox/Toggle)
- **Einzelauswahl**: Dropdown oder Button-Gruppe
- **Chip-Gruppe**: Mehrere aktivierbare Optionen

#### Spezielle Eingaben
- **Nummern**: Ganzzahlen oder Dezimalzahlen mit Min/Max-Werten
- **Datum**: Auswahl von Jahr, Monat, Tag, Stunde oder Minute
- **Datei**: Datei-Upload mit Typ-Beschränkungen

#### Strukturelemente
- **Gruppe**: Fasst mehrere Elemente zusammen
- **Array**: Ermöglicht wiederholbare Elementgruppen
- **Benutzerdefiniert**: Spezielle Komponenten für spezifische Anwendungsfälle:
  - **Scanner**: Scan- und doorbit Studio Integration. Hier können die Screens während des Scans bearbeitet und individualisiert werden
  - **Adresse**: Strukturierte Adresseingabe mit Validierung
  - **Standort**: GPS-Koordinaten und Kartenintegration
  - **Umgebung**: Statistiken für den Standort, wie Altersverteilung und das Bildungsniveau der Bevölkerung
### 4. Element-Bearbeitung

#### Platzierung
1. Element aus der Palette auswählen
2. Per Drag & Drop im Editor platzieren
3. Position durch Ziehen anpassen

#### Eigenschaften bearbeiten
- Titel und Beschreibungen (mehrsprachig)
- Pflichtfeld-Status
- Elementspezifische Einstellungen
- Sichtbarkeitsregeln

#### Bearbeitungsoberfläche

1. **Strukturnavigator**: Zeigt die hierarchische Struktur aller Elemente
   - Einfache Navigation durch verschachtelte Elemente
   - Direkte Auswahl von Unterelementen
   - Übersichtliche Darstellung der Elementhierarchie

2. **EnhancedPropertyEditor**: Verbesserte Eigenschaftsbearbeitung
   - Tabs für verschiedene Kategorien (Allgemein, Sichtbarkeit, Unterelemente, JSON)
   - Spezialisierte Editoren für jeden Elementtyp
   - Umfassende Bearbeitung aller Elementeigenschaften

3. **ElementContextView**: Kontextinformationen zum ausgewählten Element
   - Anzeige des Elementpfads
   - Schnellzugriff auf übergeordnete Elemente
   - Kontextbezogene Aktionen

### 5. Verschachtelung

Elemente können verschachtelt werden:
1. Gruppe oder Array-Element erstellen
2. Weitere Elemente per Drag & Drop in das Container-Element ziehen
3. Verschachtelungstiefe nach Bedarf erweitern

## Tipps & Tricks

### Effiziente Bearbeitung
- Nutzen Sie Gruppeneleente als Container für zusammengehörige Elemente, die dann in der App und im Web auch eine optische Gruppierung bilden
- Duplizieren Sie ähnliche Elemente statt sie neu zu erstellen
- Verwenden Sie die JSON-Vorschau für technische Überprüfungen
- Verschieben Sie mit Pfeilelementen die Elemente bei Bedarf, um die Reihenfolge jederzeit zu ändern
- Seiten können Sie einfach mit Drag & Drop neu anordnen

### Mehrsprachigkeit
- Füllen Sie alle Sprachversionen direkt aus
- Nutzen Sie konsistente Bezeichnungen
- Prüfen Sie die Textlängen in allen Sprachen

### Organisation
- Gruppieren Sie zusammengehörige Elemente
- Nutzen Sie aussagekräftige Titel
- Halten Sie die Verschachtelungstiefe überschaubar

### Sichtbarkeitsregeln
- Nutzen Sie den verbesserten VisibilityConditionEditor für komplexe Bedingungen
- Kombinieren Sie Bedingungen mit logischen Operatoren (UND, ODER, NICHT)
- Verwenden Sie feldbasierte Bedingungen für dynamische Anzeige
- Nutzen Sie kontextbasierte Bedingungen für verschiedene Anwendungsfälle (Erstellen, Bearbeiten, Ansicht)

## Best Practices

### Struktur
- Logische Gruppierung verwandter Felder
- Klare Hierarchie der Informationen
- Konsistente Benennungen

### Benutzerfreundlichkeit
- Eindeutige Beschriftungen
- Hilfreiche Beschreibungstexte
- Sinnvolle Default-Werte

## Häufige Fragen

### Allgemein
1. **Wie sichere ich meine Arbeit?**
   - Regelmäßig über "Speichern" als JSON exportieren
   - Backups wichtiger Flows anlegen

2. **Kann ich Änderungen rückgängig machen?**
   - Ja, über die Undo/Redo-Funktionen in der Werkzeugleiste

### Technisch
1. **Welche Dateiformate werden unterstützt?**
   - Import/Export erfolgt im JSON-Format
   - Falls Bilder gezeigt werden sollen in dem Workflow, dann müssen diese aktuell noch separat an uns übermittelt werden

2. **Wie funktioniert die Mehrsprachigkeit?**
   - Texte werden in allen konfigurierten Sprachen gespeichert
   - Sprachen können flexibel erweitert werden
