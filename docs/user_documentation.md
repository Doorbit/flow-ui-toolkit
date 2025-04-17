# Benutzerhandbuch - Flow UI Toolkit

## Übersicht

Das Flow UI Toolkit ermöglicht die visuelle Erstellung und Bearbeitung von Benutzeroberflächen durch einen intuitiven Editor. Sie können verschiedene UI-Elemente per Drag & Drop platzieren, deren Eigenschaften anpassen und mehrsprachige Inhalte verwalten.

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
  - **Scanner**: Barcode- und QR-Code-Scanner Integration
  - **Adresse**: Strukturierte Adresseingabe mit Validierung
  - **Standort**: GPS-Koordinaten und Kartenintegration
  - **Verwaltungsgrenzen**: Administrative Gebietszuordnung

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

### 5. Verschachtelung

Elemente können verschachtelt werden:
1. Gruppe oder Array-Element erstellen
2. Weitere Elemente per Drag & Drop in das Container-Element ziehen
3. Verschachtelungstiefe nach Bedarf erweitern

## Tipps & Tricks

### Effiziente Bearbeitung
- Nutzen Sie Tastaturkürzel für häufige Aktionen
- Duplizieren Sie ähnliche Elemente statt sie neu zu erstellen
- Verwenden Sie die JSON-Vorschau für technische Überprüfungen

### Mehrsprachigkeit
- Füllen Sie alle Sprachversionen direkt aus
- Nutzen Sie konsistente Bezeichnungen
- Prüfen Sie die Textlängen in allen Sprachen

### Organisation
- Gruppieren Sie zusammengehörige Elemente
- Nutzen Sie aussagekräftige Titel
- Halten Sie die Verschachtelungstiefe überschaubar

## Best Practices

### Struktur
- Logische Gruppierung verwandter Felder
- Klare Hierarchie der Informationen
- Konsistente Benennungen

### Benutzerfreundlichkeit
- Eindeutige Beschriftungen
- Hilfreiche Beschreibungstexte
- Sinnvolle Standardwerte

### Wartbarkeit
- Dokumentation wichtiger Entscheidungen
- Wiederverwendung von Strukturen
- Klare Namenskonventionen

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
   - Bilder können in gängigen Formaten hochgeladen werden

2. **Wie funktioniert die Mehrsprachigkeit?**
   - Texte werden in allen konfigurierten Sprachen gespeichert
   - Sprachen können flexibel erweitert werden

## Fehlerbehebung

### Häufige Probleme

1. **Element lässt sich nicht platzieren**
   - Prüfen Sie die Ziel-Position
   - Stellen Sie sicher, dass die Verschachtelung erlaubt ist

2. **Änderungen werden nicht gespeichert**
   - Speichern Sie explizit über die Werkzeugleiste
   - Prüfen Sie die JSON-Vorschau auf Fehler

### Support

Bei technischen Problemen:
1. Prüfen Sie die Dokumentation
2. Exportieren Sie den problematischen Flow
3. Dokumentieren Sie die Schritte zur Reproduktion
