# Field ID Eindeutigkeit - Analyse und Lösung

## Problem-Beschreibung

Bei der Erstellung neuer UI-Elemente wurden teilweise fest codierte IDs verwendet, was zu potenziellen Konflikten führen konnte.

## Analyse

### 1. SingleSelectionUIElement Options

**Problem identifiziert:**
- In `App.tsx` wurden neue SingleSelectionUIElements mit fest codierten Option-Keys erstellt: `'option1'`, `'option2'`, `'option3'`
- Wenn mehrere SingleSelectionUIElements erstellt wurden, hatten alle die gleichen Option-Keys

**Kritikalität:**
- **MITTEL**: SingleSelectionUIElementItem hat kein `field_id`, sondern nur ein `key`-Feld
- Diese Keys werden nicht direkt in Visibility Conditions verwendet (nur die field_id des Parent-Elements)
- Dennoch ist es Best Practice, eindeutige Keys zu verwenden, um zukünftige Probleme zu vermeiden

**Lösung implementiert:**
- Alle fest codierten Option-Keys in `App.tsx` durch `uuidv4()` ersetzt
- Neue Optionen, die über die Editoren hinzugefügt werden, verwenden bereits UUIDs (siehe `SingleSelectionElementEditor.tsx` und `SingleSelectionElementEditorEnhanced.tsx`)

### 2. ChipGroupUIElement Chips

**Status:**
- ✅ **BEREITS KORREKT**: ChipGroupUIElement-Chips verwenden bereits UUIDs für ihre field_ids
- In `App.tsx` Zeile 1481 und 1489: `field_id: { field_name: \`chip_${uuidv4()}\` }`
- In `ChipGroupEditor.tsx` Zeile 52 und 65: Neue Chips erhalten automatisch UUIDs

### 3. Andere UI-Elemente

**Status:**
- ✅ **BEREITS KORREKT**: Alle anderen UI-Elemente (BooleanUIElement, StringUIElement, NumberUIElement, DateUIElement, etc.) verwenden bereits UUIDs für ihre field_ids
- Beispiele:
  - `boolean_field_${uuidv4()}` (Zeile 379)
  - `selection_field_${uuidv4()}` (Zeile 395)
  - `number_field_${uuidv4()}` (Zeile 416)
  - `date_field_${uuidv4()}` (Zeile 434)

## Implementierte Änderungen

### Datei: `src/App.tsx`

**Zeilen 399-401 (vorher):**
```typescript
options: [
  { key: 'option1', label: { de: 'Option 1', en: 'Option 1' } },
  { key: 'option2', label: { de: 'Option 2', en: 'Option 2' } },
  { key: 'option3', label: { de: 'Option 3', en: 'Option 3' } }
]
```

**Zeilen 399-401 (nachher):**
```typescript
options: [
  { key: uuidv4(), label: { de: 'Option 1', en: 'Option 1' } },
  { key: uuidv4(), label: { de: 'Option 2', en: 'Option 2' } },
  { key: uuidv4(), label: { de: 'Option 3', en: 'Option 3' } }
]
```

## Visibility Conditions und Field IDs

### Wie Visibility Conditions funktionieren:

1. **RelationalFieldOperator** verwendet `field_id.field_name` zur Referenzierung von Feldern
2. **Nur UI-Elemente mit field_id** können in Visibility Conditions referenziert werden:
   - BooleanUIElement
   - SingleSelectionUIElement (das Element selbst, nicht die Optionen)
   - StringUIElement
   - NumberUIElement
   - DateUIElement
   - ArrayUIElement
   - FileUIElement (verwendet id_field_id)

3. **SingleSelectionUIElementItem** hat KEIN field_id, sondern nur ein `key`-Feld
   - Der `key` wird verwendet, um die ausgewählte Option zu identifizieren
   - In Visibility Conditions wird die field_id des Parent-SingleSelectionUIElement verwendet
   - Der Wert der Condition ist dann der `key` der ausgewählten Option

### Beispiel:

```typescript
// SingleSelectionUIElement
{
  pattern_type: 'SingleSelectionUIElement',
  field_id: { field_name: 'building_type' },  // ← Wird in Visibility Conditions verwendet
  options: [
    { key: 'residential', label: { de: 'Wohngebäude' } },  // ← key wird als value verwendet
    { key: 'commercial', label: { de: 'Gewerbegebäude' } }
  ]
}

// Visibility Condition
{
  operator_type: 'RFO',
  field_id: { field_name: 'building_type' },  // ← Referenziert das Element
  op: 'eq',
  value: 'residential'  // ← Referenziert den key der Option
}
```

## Abwärtskompatibilität

✅ **VOLLSTÄNDIG GEWÄHRLEISTET**:
- Bestehende JSON-Dateien mit fest codierten Option-Keys funktionieren weiterhin
- Die Änderung betrifft nur neu erstellte Elemente
- Keine Breaking Changes für existierende Workflows

## Best Practices für zukünftige Entwicklung

1. **Interne vs. externe IDs klar trennen**
   - `uuid` wird ausschließlich als **interne** ID im Editor verwendet (Elemente, Seiten, Subflows, Visibility-Bedingungen, Optionen, Chips, etc.).
   - `field_id.field_name` ist ein **fachlicher/externer** Identifier und wird bei importierten Flows niemals automatisch verändert.

2. **UUIDs für neue Elemente verwenden**
   - Für neu im Editor angelegte Elemente werden wie bisher eindeutige Feldnamen mit UUID-Anteil verwendet, z.B. `boolean_field_${uuidv4()}` oder `chip_${uuidv4()}`.
   - Diese Generierung passiert nur beim Anlegen in `App.tsx`, nicht mehr in den UUID-Normalisierungsfunktionen.

3. **Normalisierung ohne Feldnamensänderung**
   - `ensureUUIDs` ergänzt nur `uuid`-Felder und normalisiert `field_id` von String → Objekt, verändert aber **nie** den Inhalt von `field_name`.
   - Das gilt auch für eingebettete Elemente wie `other_user_value.text_ui_element` und ChipGroup-Chips.

4. **Export ohne technische UUIDs**
   - Beim Export werden alle internen `uuid`-Felder über `transformFlowForExport` entfernt.
   - `visibility_condition`-Strukturen werden von `uuid` bereinigt, behalten aber ihre Feldreferenzen (`field_id.field_name`) unverändert.

5. **Tests mit Referenz-Flows**
   - Für Referenzdateien wie `doorbit_esg (2).json` sollte es Roundtrip-Tests geben (Import → `ensureUUIDs` → Export), die sicherstellen, dass Struktur und `field_id.field_name` identisch bleiben.

## Zusammenfassung

- ✅ Problem identifiziert und behoben
- ✅ Alle neuen SingleSelectionUIElement-Optionen verwenden jetzt UUIDs als Keys
- ✅ ChipGroupUIElement-Chips und andere neu erstellte Elemente verwenden UUID-basierte Feldnamen
- ✅ Importierte `field_id.field_name`-Werte bleiben unverändert
- ✅ Export entfernt alle technischen `uuid`-Felder und bereinigt Visibility-Bedingungen
- ✅ Abwärtskompatibilität gewährleistet
- ✅ Best Practices zur Trennung von `uuid` und `field_id` dokumentiert

