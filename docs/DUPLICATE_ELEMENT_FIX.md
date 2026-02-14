# Fix: Eindeutige field_ids beim Duplizieren von Elementen

## Problem

Beim Duplizieren von Eingabeelementen (StringUIElement, NumberUIElement, DateUIElement, SingleSelectionUIElement, BooleanUIElement, etc.) wurde die `field_id.field_name` des ursprünglichen Elements mitkopiert. Dies führte dazu, dass beide Elemente die gleiche `field_id.field_name` hatten.

**Auswirkung im Frontend:**
Wenn der Benutzer einen Wert in ein Feld eingibt, erscheint dieser Wert automatisch auch in allen anderen Feldern mit der gleichen `field_id.field_name`.

## Lösung

Eine neue rekursive Hilfsfunktion `regenerateFieldIds` wurde implementiert, die beim Duplizieren automatisch neue, eindeutige `field_id.field_name` mit UUID generiert.

### Implementierung

**Datei:** `src/App.tsx`

**Funktion:** `regenerateFieldIds(element: any): any`

Die Funktion:
1. Erstellt eine Deep Copy des Elements
2. Generiert eine neue `field_id.field_name` mit UUID für das Element selbst
3. Verarbeitet rekursiv alle verschachtelten Elemente:
   - **ChipGroupUIElement**: Regeneriert field_ids für alle Chips
   - **GroupUIElement**: Regeneriert field_ids für alle Unterelemente
   - **ArrayUIElement**: Regeneriert field_ids für alle Unterelemente
   - **CustomUIElement**: Regeneriert field_ids für sub_flows und elements
   - **SingleSelectionUIElement**: Regeneriert field_id für other_user_value.text_ui_element

### Präfix-Mapping

Die Funktion verwendet typspezifische Präfixe für die generierten field_ids:

| Element-Typ | Feld | Präfix | Beispiel |
|-------------|------|--------|----------|
| BooleanUIElement | `field_id` | `boolean_field` | `boolean_field_a1b2c3d4-...` |
| StringUIElement | `field_id` | `string_field` | `string_field_a1b2c3d4-...` |
| NumberUIElement | `field_id` | `number_field` | `number_field_a1b2c3d4-...` |
| DateUIElement | `field_id` | `date_field` | `date_field_a1b2c3d4-...` |
| SingleSelectionUIElement | `field_id` | `selection_field` | `selection_field_a1b2c3d4-...` |
| FileUIElement | `field_id` | `fileuielement` | `fileuielement_a1b2c3d4-...` |
| FileUIElement | `id_field_id` | `file_images_id` | `file_images_id_a1b2c3d4-...` |
| FileUIElement | `caption_field_id` | `file_images_caption` | `file_images_caption_a1b2c3d4-...` |
| ChipGroup Chips | `field_id` | `chip` | `chip_a1b2c3d4-...` |

### Betroffene Elemente

Alle UI-Elemente mit `field_id`:
- ✅ StringUIElement
- ✅ NumberUIElement
- ✅ DateUIElement
- ✅ SingleSelectionUIElement
- ✅ BooleanUIElement
- ✅ FileUIElement
- ✅ ChipGroupUIElement (Chips)
- ✅ Verschachtelte Elemente in GroupUIElement
- ✅ Verschachtelte Elemente in ArrayUIElement
- ✅ Verschachtelte Elemente in CustomUIElement

## Testing

Um die Funktion zu testen:

1. Erstellen Sie ein Eingabeelement (z.B. StringUIElement)
2. Notieren Sie die `field_id.field_name` des Elements
3. Duplizieren Sie das Element
4. Überprüfen Sie, dass das duplizierte Element eine neue, eindeutige `field_id.field_name` hat
5. Geben Sie Werte in beide Felder ein und stellen Sie sicher, dass sie unabhängig voneinander funktionieren

## Änderungshistorie

- **2026-02-14**: Erweitert für FileUIElement
  - `id_field_id` und `caption_field_id` werden jetzt beim Duplizieren regeneriert
  - Beim Erstellen neuer FileUIElements werden alle drei field_ids mit eindeutigen UUIDs generiert
  - Behebt das Problem, dass hochgeladene Fotos in allen FileUIElement-Instanzen angezeigt wurden
- **2025-02-14**: Initiale Implementierung der `regenerateFieldIds`-Funktion
  - Ersetzt die vorherige Logik, die nur BooleanUIElements in ChipGroups behandelte
  - Erweitert auf alle Eingabeelemente mit field_id
  - Unterstützt rekursive Verarbeitung verschachtelter Elemente

