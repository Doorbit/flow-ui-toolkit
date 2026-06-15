# Benutzerhandbuch — Flow UI Toolkit

## 1. Über das Flow UI Toolkit

Das Flow UI Toolkit ist ein visueller Editor, mit dem Sie **Flows** erstellen und bearbeiten — die
mehrseitigen, dynamischen Formular-Workflows, die in der **doorbit App** und in **doorbit Web**
zur Laufzeit angezeigt werden. Ein Flow wird als **JSON-Datei** gespeichert und geladen; dieses
JSON ist das Format, das doorbit rendert.

Mit dem Toolkit können Sie:

- Seiten und UI-Elemente per Drag & Drop anlegen und anordnen,
- Eigenschaften jedes Elements bearbeiten (inkl. mehrsprachiger Texte),
- Sichtbarkeitsregeln definieren,
- Flows in **Module** gliedern, die pro Projekt zu- oder abgeschaltet werden,
- Flows als JSON exportieren und wieder importieren.

> Sie arbeiten immer an genau **einem** Flow. „Speichern" lädt eine JSON-Datei herunter; es gibt
> keine serverseitige Ablage im Toolkit selbst.

---

## 2. Die Oberfläche im Überblick

Der Editor ist in drei Spalten aufgebaut:

| Spalte | Inhalt |
|---|---|
| **Links — Hierarchie** | Baumansicht aller Elemente der aktuellen Seite; Auswahl und Navigation durch verschachtelte Strukturen. |
| **Mitte — Kontext** | Das aktuell geöffnete Element/Container mit seinen direkten Kindern; hier fügen Sie Elemente hinzu. |
| **Rechts — Eigenschaften** | Der Eigenschaften-Editor für das ausgewählte Element. |

Darüber liegt die **Werkzeugleiste** mit:

- **Neu / Öffnen / Speichern** — Flow anlegen, JSON laden, JSON herunterladen.
- **Flow-Eigenschaften** (Schaltfläche mit dem Flow-Namen) — Name, ID, URL-Key, Titel und Icon bearbeiten.
- **Module** — den Modul-Katalog des Flows verwalten.
- **Erste Schritte** — eine kurze Editor-Tour (erscheint beim ersten Start automatisch).
- **Tastaturkürzel** — Übersicht der verfügbaren Shortcuts.
- **Dokumentation** — öffnet diese Hilfe.
- **Rückgängig / Wiederherstellen** — Undo/Redo.
- **Validierungs-Anzeige** — zeigt „Gültig" (grün) oder „N Probleme" (rot); ein Klick öffnet die Fehlerliste.

Unter der Werkzeugleiste liegt die **Seiten-Navigation** (Tabs) mit „+" (neue Seite) und dem
Import-Symbol.

> **Tastaturkürzel:** Rückgängig (Strg/Cmd+Z), Wiederherstellen (Strg/Cmd+Y), Speichern
> (Strg/Cmd+S), Abbrechen/Schließen (Esc). Die vollständige Liste finden Sie über das
> Tastatur-Symbol.

---

## 3. Flows anlegen, öffnen & speichern

- **Neu:** legt einen leeren Flow an. Ungespeicherte Änderungen gehen verloren — Sie werden vorher gefragt.
- **Öffnen:** lädt einen Flow aus einer JSON-Datei. Bei einem nicht-leeren Flow wird vor dem Überschreiben nachgefragt.
- **Speichern:** lädt den aktuellen Flow als JSON-Datei herunter.

### Flow-Eigenschaften bearbeiten

Über die Schaltfläche mit dem Flow-Namen öffnen Sie den Dialog **„Flow-Eigenschaften"**:

- **Name** — interner Anzeigename.
- **ID** und **URL-Key** — technische Identifier. Sie müssen gesetzt sein und dürfen nur
  Kleinbuchstaben, Ziffern, „-" und „_" enthalten (keine Leerzeichen). Mit **„aus Name"** wird
  automatisch ein passender Wert abgeleitet.
- **Titel (Deutsch/Englisch)** — nutzersichtbarer Titel des Flows.
- **Flow-Icon** — über die Icon-Auswahl.

Ungültige Eingaben werden direkt am Feld markiert; „Speichern" bleibt bis zur Korrektur deaktiviert.

---

## 4. Seiten verwalten

Ein Flow besteht aus mehreren Seiten, zwischen denen Sie über die Tabs wechseln.

- **Seite anlegen:** „+" in der Seiten-Navigation. Im Dialog vergeben Sie einen Titel und wählen
  das **Layout** — mit einer **Live-Vorschau**, die zeigt, wie die rechte Spalte dargestellt wird.
- **Seite bearbeiten:** Stift-Symbol am Tab. Hier setzen Sie Titel (mehrsprachig), Icon, Layout
  (mit Vorschau), die Modul-Zuordnung und Sichtbarkeitsregeln.
- **Reihenfolge ändern:** Tabs per Drag & Drop verschieben.
- **Seite löschen:** mit Bestätigung; die letzte verbleibende Seite kann nicht gelöscht werden.

### Layouts

Es stehen genau die Layouts zur Verfügung, die doorbit auch tatsächlich darstellt:

| Layout | Darstellung |
|---|---|
| **Standard** | rechte Spalte zentriert (kein Layout-Feld gesetzt) |
| **2-spaltig, rechts breiter** | rechte Spalte breiter zentriert |
| **2-spaltig, rechts gefüllt** | genau ein rechtes Element füllt die Spalte |

### View-Modus automatisch erzeugen

Beim Bearbeiten einer Edit-Seite können Sie **„Im View-Modus anzeigen"** aktivieren. Die
Eingabefelder werden dann automatisch in Anzeige-Elemente umgewandelt (z. B. Eingaben → Tabellen,
Datei-Uploads → Bildergalerien). So müssen Sie die zugehörige View-Seite nicht von Hand pflegen.
Enthält die View-Seite bereits manuelle Inhalte, werden Sie vor dem Überschreiben gewarnt.

### Seiten aus einer anderen Datei importieren

Über das Import-Symbol neben „+" übernehmen Sie ganze Seiten aus einer anderen JSON-Datei:

1. Datei auswählen → die enthaltenen Seiten werden aufgelistet.
2. Gewünschte Seiten per Checkbox markieren (oder „Alle auswählen").
3. „Importieren".

Importierte Seiten erhalten neue interne IDs (um Konflikte zu vermeiden); die `field_id`-Werte der
Elemente bleiben erhalten, damit die Datenbindung intakt bleibt. Edit- und zugehörige View-Seite
werden als Paar übernommen. Der Import lässt sich rückgängig machen.

---

## 5. Elemente hinzufügen & verschachteln

### Element hinzufügen

In der mittleren Spalte fügen Sie über die Element-Auswahl ein neues Element hinzu. Der Auswahl-Dialog
bietet:

- ein **Suchfeld** (filtert nach Name, Typ und Beschreibung),
- eine **Beschreibung je Elementtyp**,
- eine **Vorab-Prüfung der Verschachtelungsregeln**: Typen, die im aktuellen Container nicht erlaubt
  sind, werden deaktiviert und mit Begründung angezeigt.

### Verschachteln & Container

Container-Elemente nehmen weitere Elemente auf:

- **Gruppe** — fasst Elemente zusammen (bildet auch optisch eine Gruppe). Kann alle Typen enthalten.
- **Array** — wiederholbare Elementgruppen. Kann alle Typen enthalten.
- **Chip-Gruppe** — enthält ausschließlich Boolean-Elemente (Chips).
- **Benutzerdefiniert (Custom)** — kann Elemente und Subflows enthalten (z. B. Scanner).

Ziehen Sie Elemente per Drag & Drop in einen Container oder ändern Sie ihre Reihenfolge. Die
Hierarchie ist bis zu sechs Ebenen tief gut handhabbar. In der Hierarchie (links) und im Kontext
(Mitte) navigieren Sie durch die Ebenen; der Containertyp wird farblich gekennzeichnet.

---

## 6. Elementeigenschaften bearbeiten

Im rechten Eigenschaften-Editor (mit Tabs für Allgemein, Sichtbarkeit, ggf. Unterelemente und JSON)
bearbeiten Sie:

- **Titel & Beschreibung** — mehrsprachig (Deutsch/Englisch).
- **Feld-ID** — bei eingebenden Elementen; hier wird der erfasste Wert gespeichert. Sie wird
  einheitlich und prominent angezeigt.
- **Pflichtfeld** — ob eine Eingabe erforderlich ist.
- **Modul-Zuordnung** — ordnet das Element einem Modul zu (siehe Abschnitt 9). Immer sichtbar; ohne
  definierte Module mit Hinweis, wie man welche anlegt.
- **Elementspezifische Einstellungen** — je nach Typ (siehe Abschnitt 7).
- **Sichtbarkeitsregeln** — siehe unten.

### Sichtbarkeitsregeln

Mit dem Bedingungs-Editor steuern Sie, wann ein Element (oder eine Seite) angezeigt wird:

- **Feldbasierte Bedingungen** — abhängig vom Wert eines anderen Feldes.
- **Kontextbedingungen** — z. B. nur beim Erstellen, Bearbeiten oder Ansehen.
- **Logische Verknüpfung** — UND / ODER / NICHT für komplexe Bedingungen.

---

## 7. Elementtypen im Überblick

### Anzeige (keine Benutzereingabe)
- **Text** — statische Überschrift oder Absatz.
- **Feld-Text** — zeigt den Wert eines Feldes als Text an (dynamisch).
- **Schlüssel-Wert-Liste**, **Tabelle**, **Bildergalerie** — Anzeige-Elemente, v. a. für den View-Modus.
- **Kontakt** — zeigt eine Identitäts-/Kontaktkarte (z. B. den zuständigen Energieberater).

### Eingabe
- **Texteingabe** — ein- oder mehrzeilig, mit optionaler Längen-Validierung.
- **Nummer** — Ganzzahl oder Dezimalzahl, mit Minimum/Maximum, Default-Wert und Einheit.
- **Datum** — Jahr, Monat, Tag oder Uhrzeit (je nach Genauigkeit).
- **Datei** — Datei-/Bild-Upload mit Typ-Beschränkungen.

### Auswahl
- **Boolean** — Ja/Nein.
- **Einzelauswahl** — eine Option aus mehreren, als Dropdown oder Button-Gruppe. Jede Option hat
  einen eindeutigen Schlüssel (wird auf Eindeutigkeit geprüft), eine mehrsprachige Beschriftung und
  optional ein Icon.
- **Chip-Gruppe** — mehrere unabhängig aktivierbare Chips.

### Struktur
- **Gruppe**, **Array** — siehe Abschnitt 5.

### Benutzerdefiniert (Custom)
- **Scanner** — Scan- und doorbit-Studio-Integration; die Screens während des Scans lassen sich hier
  über Subflows anpassen.
- **Adresse** — strukturierte Adresseingabe mit Validierung.
- **Standort** — GPS-Koordinaten und Kartenintegration.
- **Umgebung** — Standort-Statistiken (z. B. Altersverteilung, Bildungsniveau).

---

## 8. Mehrere Elemente: Auswählen, Gruppieren, Kopieren, Exportieren

### Mehrfachauswahl & Gruppieren
1. **Selektionsmodus** aktivieren (Checkbox-Symbol in der Editor-Werkzeugleiste). Neben den Elementen
   erscheinen Checkboxen; ein **Aktionsbalken** zeigt die Anzahl der ausgewählten Elemente.
2. Elemente markieren → **„Zu Gruppe zusammenfassen"**.
3. Gruppentitel und Feld-ID vergeben (wird vorgeschlagen) → die Auswahl wird in eine neue Gruppe
   eingebettet.

Voraussetzungen: Alle Elemente müssen auf **derselben Ebene** liegen; Elemente innerhalb von Arrays,
Subflows oder Chip-Gruppen sowie bereits bestehende Gruppen können nicht (erneut) gruppiert werden.
Bei Verstößen erscheint eine verständliche Meldung.

### Gruppierung auflösen
Eine Gruppe auswählen → **Auflösen-Symbol**. Die Kinder-Elemente rücken an die Position der Gruppe;
ihre `field_id`-Werte bleiben unverändert.

### Element auf andere Seite kopieren
Kopier-Symbol an der Elementkarte → Zielseite und Position wählen. Das kopierte Element (inkl. aller
Kinder) erhält **neue** UUIDs und **neue** `field_id`-Werte, um Konflikte im selben Flow zu vermeiden.

### Element in andere JSON-Datei exportieren
Export-Symbol → Zieldatei, Zielseite und Position wählen. Die Zieldatei wird als
`[Dateiname]_modified.json` heruntergeladen; der aktuelle Flow bleibt unverändert. Die `field_id`-Werte
bleiben erhalten (anderer Flow → kein Konflikt). Enthält das Element Sichtbarkeitsbedingungen mit
Feldverweisen, erscheint eine Warnung, da diese Felder in der Zieldatei evtl. fehlen.

> Alle diese Aktionen unterstützen Undo/Redo.

---

## 9. Module (modulare Flows)

Ein Flow kann optionale **Module** deklarieren — Bündel aus Seiten/Feldern, die ein Projekt bei Bedarf
(auch nachträglich) aktiviert. Mit `module_id` markierte Seiten oder Elemente sind nur sichtbar, wenn
das zugehörige Modul im Projekt aktiv ist.

- **Modul-Katalog verwalten:** Schaltfläche **„Module"** in der Werkzeugleiste — Module anlegen,
  bearbeiten, löschen. Je Modul: ID, Name, Beschreibung, Icon und ob es standardmäßig aktiv ist.
- **Auslieferungsart:**
  - **INLINE** — das Modul ist im Flow enthalten.
  - **CATALOG** — das Modul ist ein eigenständiges, versioniertes Artefakt, das separat exportiert/
    importiert und nachgeladen werden kann.
- **Zuordnung:** Im Eigenschaften-Editor (Element) und im Seiten-Dialog ordnen Sie über
  **„Modul-Zuordnung"** ein Element/eine Seite einem Modul zu. Verweist eine Zuordnung auf ein nicht
  (mehr) vorhandenes Modul, wird das als „⚠ Unbekannt" angezeigt; der Modul-Manager warnt vor solchen
  verwaisten Zuordnungen.

---

## 10. Tipps & häufige Fragen

### Tipps
- **Gruppen** schaffen auch in App und Web eine optische Zusammenfassung — nutzen Sie sie für
  zusammengehörige Felder.
- **Mehrfachauswahl** ist schneller als einzelnes Drag & Drop, wenn Sie mehrere Elemente gruppieren.
- **Seiten importieren** und **Elemente kopieren/exportieren** helfen, bewährte Strukturen
  wiederzuverwenden und projektübergreifend zu standardisieren.
- Achten Sie auf den **Validierungs-Indikator** — er weist früh auf strukturelle Probleme hin.
- Füllen Sie alle Sprachversionen aus und halten Sie die Verschachtelung überschaubar (≤ 6 Ebenen).

### Häufige Fragen

**Wie sichere ich meine Arbeit?**
Regelmäßig über „Speichern" als JSON exportieren und Backups wichtiger Flows anlegen. Das Toolkit
speichert nicht serverseitig.

**Kann ich Änderungen rückgängig machen?**
Ja, über Rückgängig/Wiederherstellen (Strg/Cmd+Z bzw. Y). Auch Importe, Kopien und Gruppierungen sind
umkehrbar.

**Welches Dateiformat wird verwendet?**
Import und Export erfolgen als JSON. Sollen im Workflow Bilder gezeigt werden, müssen diese aktuell
noch separat übermittelt werden.

**Wie funktioniert die Mehrsprachigkeit?**
Texte werden in allen konfigurierten Sprachen (mind. Deutsch/Englisch) gespeichert.

**Was ist eine Feld-ID — und was passiert mit ihr beim Kopieren/Exportieren?**
Die Feld-ID bestimmt, wo der erfasste Wert abgelegt wird. Beim **Kopieren innerhalb desselben Flows**
wird sie **neu generiert** (Konfliktvermeidung); beim **Export in eine andere Datei** und beim
**Seitenimport** bleibt sie **erhalten**.

**Wozu dienen Module?**
Module bündeln optionale Seiten/Felder, die pro Projekt aktiviert werden. So lässt sich ein Basis-Flow
um projektspezifische Teile erweitern, ohne ihn zu duplizieren (siehe Abschnitt 9).

**Warum kann ich ein bestimmtes Element hier nicht hinzufügen?**
Manche Typen sind in bestimmten Containern nicht erlaubt. Der Element-Auswahl-Dialog zeigt solche
Typen deaktiviert mit Begründung an.

**Werden Sichtbarkeitsbedingungen mitkopiert?**
Ja. Beim Export in eine andere Datei erscheint zusätzlich eine Warnung, falls die Bedingung auf Felder
verweist, die dort evtl. nicht existieren.
