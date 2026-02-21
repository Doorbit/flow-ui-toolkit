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
- **Selektionsmodus**: Aktiviert Multi-Selektion zum Gruppieren mehrerer Elemente

### 2. Seitenverwaltung

- Mehrere Seiten pro Flow verwalten
- Seiten über Tabs navigieren
- Seiten durch Drag & Drop neu anordnen
- Seiten hinzufügen, bearbeiten oder löschen
- Seitentitel in mehreren Sprachen anpassen
- Material Design Icons für Seiten auswählen
- **Seiten aus externen JSON-Dateien importieren**

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

#### Seiten aus anderer JSON-Datei importieren
Sie können komplette Seiten aus einer anderen JSON-Datei in den aktuellen Flow importieren:

1. Klicken Sie auf das **Import-Symbol** (Pfeil nach oben) neben dem „+"-Button in der Seitennavigation
2. Im Import-Dialog klicken Sie auf **„Datei auswählen"** und wählen eine JSON-Datei aus
3. Die verfügbaren Seiten der Quelldatei werden als Liste angezeigt
4. Wählen Sie die gewünschten Seiten per Checkbox aus (oder nutzen Sie „Alle auswählen")
5. Klicken Sie auf **„Importieren"**

**Hinweise:**
- Die importierten Seiten erhalten neue interne IDs (UUIDs), um Konflikte zu vermeiden
- Sowohl die Edit- als auch die zugehörigen View-Seiten werden automatisch als Paar importiert
- Die `field_id`-Werte der Elemente bleiben erhalten, damit die Datenbindung innerhalb der importierten Seite intakt bleibt
- Undo/Redo wird unterstützt – ein Import kann rückgängig gemacht werden
- Ungültige oder leere JSON-Dateien werden mit einer Fehlermeldung abgewiesen

### 3. Verfügbare UI-Elemente

#### Textuelle Elemente
- **Text (Anzeige)** (`TextUIElement`): Für statische Textanzeige wie Überschriften oder Absätze
  - Wird **nicht** vom Benutzer bearbeitet
  - Dient zur Information und Strukturierung
  - Unterstützt Überschriften (HEADING) und Absätze (PARAGRAPH)

- **Texteingabe** (`StringUIElement`): Für Benutzereingaben von Text
  - Ermöglicht **Benutzereingabe** von Textdaten
  - Speichert eingegebene Werte in einem Feld
  - Unterstützt einzeilige und mehrzeilige Eingaben
  - Bietet Validierungsoptionen (Mindest-/Maximallänge, Muster)
  - Kann Platzhaltertext und Standardwerte haben

> **Wichtig**: Verwenden Sie **Text (Anzeige)** für statische Inhalte und **Texteingabe** wenn Benutzer Text eingeben sollen.

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

#### Multi-Selektion und Gruppierung

Sie können mehrere Elemente auswählen und zu einer neuen Gruppe zusammenfassen:

##### Selektionsmodus aktivieren
1. Klicken Sie auf das **Selektionsmodus-Symbol** (Checkbox-Icon) in der Werkzeugleiste des Editors
2. Im aktiven Selektionsmodus erscheinen Checkboxen neben jedem Element
3. Wählen Sie die gewünschten Elemente per Checkbox aus
4. Ein **schwebender Aktionsbalken** am unteren Bildschirmrand zeigt die Anzahl der selektierten Elemente an

##### Elemente gruppieren
1. Aktivieren Sie den Selektionsmodus und wählen Sie mindestens ein Element aus
2. Klicken Sie im Aktionsbalken auf **„Zu Gruppe zusammenfassen"**
3. Geben Sie im Dialog einen **Gruppentitel** und eine **field_id** ein (wird automatisch vorgeschlagen)
4. Klicken Sie auf **„Zusammenfassen"**
5. Die ausgewählten Elemente werden in ein neues `GroupUIElement` eingebettet

**Validierungsregeln:**
- Alle selektierten Elemente müssen sich auf **derselben Hierarchieebene** befinden
- Elemente innerhalb eines **Arrays** können nicht gruppiert werden
- Elemente innerhalb eines **SubFlows** können nicht gruppiert werden
- **Chips** innerhalb einer Chip-Gruppe können nicht gruppiert werden
- Bereits vorhandene **Gruppen** können nicht erneut in eine Gruppe eingebettet werden
- Bei Verstößen wird eine verständliche Fehlermeldung angezeigt

##### Gruppierung auflösen (Ungroup)
1. Klicken Sie auf eine bestehende Gruppe im Editor
2. Klicken Sie auf das **Auflösen-Symbol** (Ungroup-Icon) in der Elementkarte
3. Die Gruppe wird entfernt und ihre Kinder-Elemente werden an der ursprünglichen Position der Gruppe eingefügt

**Hinweise:**
- Die `field_id`-Werte der verschobenen Elemente bleiben unverändert
- Undo/Redo wird vollständig unterstützt
- Der Selektionsmodus wird nach dem Gruppieren automatisch deaktiviert

#### Element auf andere Seite kopieren

Sie können ein Element (einschließlich aller verschachtelten Kinder) auf eine andere Seite innerhalb desselben Flows kopieren:

1. Klicken Sie auf das **Kopier-Symbol** (zwei übereinanderliegende Seiten) in der Elementkarte
2. Wählen Sie im Dialog die **Zielseite** aus der Liste aller verfügbaren Seiten
3. Wählen Sie die **Position**: „Am Anfang der Seite" oder „Am Ende der Seite"
4. Klicken Sie auf **„Kopieren"**

**Hinweise:**
- Das kopierte Element erhält neue UUIDs **und** neue `field_id`-Werte, um Duplikat-Konflikte innerhalb desselben Flows zu vermeiden
- Alle verschachtelten Elemente (Gruppen, Arrays, etc.) werden vollständig tief-kopiert
- Sichtbarkeitsbedingungen, die auf Felder anderer Seiten verweisen, bleiben funktionsfähig
- Ein Erfolgs-Snackbar bestätigt die Kopie
- Undo/Redo wird unterstützt

#### Element in andere JSON-Datei exportieren

Sie können ein Element in eine externe JSON-Datei exportieren, ohne den aktuellen Flow zu verändern:

1. Klicken Sie auf das **Export-Symbol** (Teilen-Icon) in der Elementkarte
2. Klicken Sie im Dialog auf **„Zieldatei auswählen"** und wählen Sie eine JSON-Datei aus
3. Die Seiten der Zieldatei werden angezeigt – wählen Sie die **Zielseite** aus
4. Wählen Sie die **Position**: „Am Anfang der Seite" oder „Am Ende der Seite"
5. Klicken Sie auf **„Exportieren"**
6. Die modifizierte Zieldatei wird automatisch als `[Dateiname]_modified.json` heruntergeladen

**Hinweise:**
- Der aktuelle Flow wird **nicht verändert** – nur die Zieldatei erhält das neue Element
- Die `field_id`-Werte werden **beibehalten** (kein Konflikt, da unterschiedliche Flows)
- UUIDs werden neu generiert, um Eindeutigkeit in der Zieldatei zu gewährleisten
- Falls das Element Sichtbarkeitsbedingungen mit Feldverweisen enthält, wird eine **Warnung** angezeigt, da diese Felder in der Zieldatei möglicherweise nicht existieren
- Unterstützt alle Elementtypen einschließlich verschachtelter Gruppen und Arrays

#### Bearbeitungsoberfläche

1. **Strukturnavigator**: Zeigt die hierarchische Struktur aller Elemente
   - Einfache Navigation durch verschachtelte Elemente (bis zu 6 Ebenen)
   - Direkte Auswahl von Unterelementen
   - Übersichtliche Darstellung der Elementhierarchie
   - Anzeige des Containertyps (Gruppe, Array, Chip-Gruppe, etc.)
   - Farbliche Unterscheidung verschiedener Containertypen
   - Anzeige der Anzahl von Unterelementen

2. **EnhancedPropertyEditor**: Verbesserte Eigenschaftsbearbeitung
   - Tabs für verschiedene Kategorien (Allgemein, Sichtbarkeit, Unterelemente, JSON)
   - Spezialisierte Editoren für jeden Elementtyp
   - Umfassende Bearbeitung aller Elementeigenschaften
   - Anzeige des Containertyps im Header
   - Verbesserte Strukturnavigation für Unterelemente
   - Unterstützung für komplexe JSON-Strukturen

3. **ElementContextView**: Kontextinformationen zum ausgewählten Element
   - Anzeige des Elementpfads mit Containertyp-Informationen
   - Schnellzugriff auf übergeordnete Elemente
   - Kontextbezogene Aktionen je nach Containertyp
   - Detaillierte Anzeige von Elementeigenschaften
   - Verbesserte Darstellung von Unterelementen
   - Containertyp-spezifische Aktionsschaltflächen
   - **Element auf andere Seite kopieren** (Kopier-Symbol)
   - **Element in andere JSON-Datei exportieren** (Export-Symbol)
   - **Gruppe auflösen** (bei GroupUIElement-Elementen)

### 5. Verschachtelung und Container

Elemente können verschachtelt werden:
1. Gruppe oder Array-Element erstellen
2. Weitere Elemente per Drag & Drop in das Container-Element ziehen
3. Verschachtelungstiefe nach Bedarf erweitern (bis zu 6 Ebenen werden unterstützt)

#### Containertypen
- **Gruppe (group)**: Fasst mehrere Elemente zusammen, kann alle Elementtypen enthalten
- **Array (array)**: Ermöglicht wiederholbare Elementgruppen, kann alle Elementtypen enthalten
- **Chip-Gruppe (chipgroup)**: Enthält nur Boolean-Elemente als Auswahloptionen
- **Benutzerdefiniert (custom)**: Kann sowohl Elemente als auch Subflows enthalten
- **Subflow (subflow)**: Spezielle Container für komplexe Workflows

#### Navigation in verschachtelten Strukturen
1. Nutzen Sie die Breadcrumb-Navigation oben im Editor, um durch die Hierarchie zu navigieren
2. Verwenden Sie den Strukturnavigator, um direkt zu bestimmten Elementen zu springen
3. Nutzen Sie die containertyp-spezifischen Schaltflächen in der ElementContextView
4. Beachten Sie die farbliche Kennzeichnung der verschiedenen Containertypen

## Tipps & Tricks

### Effiziente Bearbeitung
- Nutzen Sie Gruppenelemente als Container für zusammengehörige Elemente, die dann in der App und im Web auch eine optische Gruppierung bilden
- Duplizieren Sie ähnliche Elemente statt sie neu zu erstellen
- Verwenden Sie die JSON-Vorschau für technische Überprüfungen
- Verschieben Sie mit Pfeilelementen die Elemente bei Bedarf, um die Reihenfolge jederzeit zu ändern
- Seiten können Sie einfach mit Drag & Drop neu anordnen
- Nutzen Sie die Containertyp-Anzeige, um schnell zu erkennen, welche Art von Container Sie bearbeiten
- Verwenden Sie die verbesserte Strukturnavigation, um schnell durch komplexe Hierarchien zu navigieren
- Beachten Sie die farbliche Kennzeichnung der verschiedenen Containertypen für eine bessere Übersicht
- **Nutzen Sie die Multi-Selektion**, um mehrere Elemente gleichzeitig in eine Gruppe zusammenzufassen – schneller als einzelnes Drag & Drop
- **Importieren Sie Seiten** aus bestehenden Flows, um bewährte Seitenstrukturen wiederzuverwenden
- **Kopieren Sie Elemente zwischen Seiten**, um konsistente Formularstrukturen aufzubauen
- **Exportieren Sie Elemente** in andere JSON-Dateien, um Flows projektübergreifend zu standardisieren

### Mehrsprachigkeit
- Füllen Sie alle Sprachversionen direkt aus
- Nutzen Sie konsistente Bezeichnungen
- Prüfen Sie die Textlängen in allen Sprachen

### Organisation
- Gruppieren Sie zusammengehörige Elemente
- Nutzen Sie aussagekräftige Titel
- Halten Sie die Verschachtelungstiefe überschaubar (max. 6 Ebenen werden optimal unterstützt)
- Verwenden Sie den passenden Containertyp für Ihre Anforderungen:
  - Gruppen für statische Zusammenfassungen
  - Arrays für wiederholbare Elemente
  - Chip-Gruppen für Mehrfachauswahl
  - Custom-Elemente für spezielle Funktionalitäten
  - Subflows für komplexe Teilabläufe
- Nutzen Sie die Strukturnormalisierung für konsistente JSON-Ausgabe
- Achten Sie auf die Validierungshinweise bei der JSON-Vorschau

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

3. **Wie tief können Elemente verschachtelt werden?**
   - Bis zu 6 Ebenen werden optimal unterstützt
   - Tiefere Verschachtelungen sind möglich, aber die Navigation wird komplexer

4. **Was sind Containertypen und wie nutze ich sie?**
   - Containertypen (group, array, chipgroup, custom, subflow) definieren das Verhalten von Elementen
   - Die Anzeige des Containertyps hilft bei der Navigation und Bearbeitung
   - Jeder Containertyp hat spezifische Eigenschaften und Verwendungszwecke

5. **Wie werden komplexe JSON-Strukturen unterstützt?**
   - Die Strukturnormalisierung sorgt für konsistente JSON-Ausgabe
   - Die Validierung prüft die Struktur auf Fehler
   - Komplexe Strukturen wie doorbit_original.json werden unterstützt

6. **Wie kann ich mehrere Elemente gleichzeitig gruppieren?**
   - Aktivieren Sie den Selektionsmodus über das Checkbox-Symbol in der Werkzeugleiste
   - Wählen Sie die gewünschten Elemente per Checkbox aus
   - Klicken Sie auf „Zu Gruppe zusammenfassen" im schwebenden Aktionsbalken
   - Alle Elemente müssen auf derselben Ebene liegen

7. **Wie kann ich eine Gruppe wieder auflösen?**
   - Wählen Sie die Gruppe im Editor aus
   - Klicken Sie auf das Auflösen-Symbol (Ungroup) in der Elementkarte
   - Die Kinder-Elemente werden an der Position der Gruppe eingefügt

8. **Wie kann ich Seiten aus einem anderen Flow übernehmen?**
   - Nutzen Sie die Import-Funktion neben dem „+"-Button in der Seitennavigation
   - Wählen Sie die Quell-JSON-Datei aus und markieren Sie die gewünschten Seiten
   - Die importierten Seiten erhalten neue IDs, behalten aber ihre interne Struktur bei

9. **Was passiert mit field_ids beim Kopieren und Exportieren?**
   - **Kopieren innerhalb desselben Flows**: `field_id`-Werte werden **neu generiert**, um Duplikate zu vermeiden
   - **Exportieren in eine andere JSON-Datei**: `field_id`-Werte werden **beibehalten**, da kein Konflikt in einem anderen Flow besteht
   - **Seitenimport**: `field_id`-Werte werden **beibehalten**, damit die Datenbindung innerhalb der Seite funktioniert

10. **Werden Sichtbarkeitsbedingungen beim Kopieren übernommen?**
    - Ja, Sichtbarkeitsbedingungen werden mitkopiert
    - Beim Export in eine andere Datei wird eine Warnung angezeigt, falls Feldverweise existieren, die in der Zieldatei möglicherweise nicht vorhanden sind
