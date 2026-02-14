# FileUIElement Field-ID Generierung

## Problem

Beim FileUIElement wurden hochgeladene Fotos in allen FileUIElement-Instanzen angezeigt, wenn diese die gleichen Field-IDs verwendeten.

**Ursache:**
- Beim Erstellen neuer FileUIElements wurden `id_field_id` und `caption_field_id` mit statischen Werten erstellt
- Beim Duplizieren wurden nur `field_id` regeneriert, aber nicht `id_field_id` und `caption_field_id`
- Mehrere FileUIElements teilten sich dadurch die gleichen Speicherorte für Datei-IDs und Bildunterschriften

## Lösung

### 1. Eindeutige Field-IDs beim Erstellen

**Datei:** `src/App.tsx` (Zeilen 445-477)

Beim Erstellen eines neuen FileUIElements werden jetzt **alle drei Field-IDs** mit eindeutigen UUIDs generiert:

```typescript
case 'FileUIElement':
  const fileUuid = uuidv4();
  return {
    element: {
      pattern_type: 'FileUIElement',
      required: false,
      file_type: 'IMAGE',
      allowed_file_types: ['image/jpeg', 'image/png'],
      // KRITISCH: field_id für eindeutige Identifikation des Elements
      field_id: {
        field_name: `fileuielement_${fileUuid}`
      },
      // KRITISCH: id_field_id für Speicherort der Datei-IDs (eindeutig mit UUID)
      id_field_id: {
        field_name: `file_images_id_${uuidv4()}`
      },
      // EMPFOHLEN: caption_field_id für Bildunterschriften (eindeutig mit UUID)
      caption_field_id: {
        field_name: `file_images_caption_${uuidv4()}`
      },
      min_count: 0,
      max_count: 10,
      title: {
        de: 'Datei Element',
        en: 'File Element'
      },
      description: {
        de: '',
        en: ''
      }
    } as FileUIElement
  };
```

### 2. Field-ID Regenerierung beim Duplizieren

**Datei:** `src/App.tsx` (Zeilen 1987-2002)

Die `regenerateFieldIds`-Funktion wurde erweitert, um auch `id_field_id` und `caption_field_id` zu regenerieren:

```typescript
// FileUIElement: Regeneriere field_id, id_field_id und caption_field_id
if (elem.pattern_type === 'FileUIElement') {
  // id_field_id ist erforderlich und muss immer regeneriert werden
  if (elem.id_field_id) {
    elem.id_field_id = {
      field_name: `file_images_id_${uuidv4()}`
    };
  }
  // caption_field_id ist optional, aber wenn vorhanden, regenerieren
  if (elem.caption_field_id) {
    elem.caption_field_id = {
      field_name: `file_images_caption_${uuidv4()}`
    };
  }
}
```

## Field-ID Struktur für FileUIElement

Ein FileUIElement hat **drei verschiedene Field-IDs**:

| Field-ID | Zweck | Erforderlich | Beispiel |
|----------|-------|--------------|----------|
| `field_id` | Eindeutige Identifikation des Elements | Ja | `fileuielement_a1b2c3d4-...` |
| `id_field_id` | Speicherort für die Datei-IDs im Backend | Ja | `file_images_id_a1b2c3d4-...` |
| `caption_field_id` | Speicherort für Bildunterschriften | Empfohlen | `file_images_caption_a1b2c3d4-...` |

**Wichtig:** Alle drei Field-IDs müssen eindeutig sein, damit verschiedene FileUIElements unabhängig voneinander funktionieren.

## Testing

### Test 1: Neues FileUIElement erstellen

1. Erstellen Sie ein neues FileUIElement über die Element-Palette
2. Öffnen Sie den Property Editor
3. Überprüfen Sie die "Technische Felder":
   - `field_id.field_name` sollte `fileuielement_<uuid>` sein
   - `id_field_id.field_name` sollte `file_images_id_<uuid>` sein
   - `caption_field_id.field_name` sollte `file_images_caption_<uuid>` sein
4. Alle drei UUIDs sollten unterschiedlich sein

### Test 2: FileUIElement duplizieren

1. Erstellen Sie ein FileUIElement
2. Laden Sie ein Bild hoch
3. Duplizieren Sie das Element
4. Überprüfen Sie, dass das duplizierte Element **neue Field-IDs** hat:
   - Alle drei Field-IDs sollten neue UUIDs haben
   - Das hochgeladene Bild sollte **nicht** im duplizierten Element erscheinen
5. Laden Sie ein anderes Bild im duplizierten Element hoch
6. Beide Elemente sollten unterschiedliche Bilder anzeigen

### Test 3: Mehrere FileUIElements unabhängig

1. Erstellen Sie zwei FileUIElements
2. Laden Sie in jedem Element unterschiedliche Bilder hoch
3. Überprüfen Sie, dass jedes Element nur seine eigenen Bilder anzeigt
4. Die Bilder sollten nicht zwischen den Elementen geteilt werden

## Vorher vs. Nachher

### Vorher ❌

```typescript
// Erstellen
field_id: { field_name: 'fileuielement_abc123' }
id_field_id: { field_name: 'file_images_id' }          // ❌ Statisch!
caption_field_id: { field_name: 'file_images_caption' } // ❌ Statisch!

// Duplizieren
field_id: { field_name: 'fileuielement_xyz789' }        // ✅ Neu
id_field_id: { field_name: 'file_images_id' }          // ❌ Gleich!
caption_field_id: { field_name: 'file_images_caption' } // ❌ Gleich!

→ Beide Elemente teilen sich die Datei-IDs und Bildunterschriften
```

### Nachher ✅

```typescript
// Erstellen
field_id: { field_name: 'fileuielement_abc123' }
id_field_id: { field_name: 'file_images_id_def456' }
caption_field_id: { field_name: 'file_images_caption_ghi789' }

// Duplizieren
field_id: { field_name: 'fileuielement_xyz789' }
id_field_id: { field_name: 'file_images_id_uvw012' }
caption_field_id: { field_name: 'file_images_caption_rst345' }

→ Jedes Element hat vollständig eindeutige Field-IDs
```

## Verwandte Dokumentation

- `docs/DUPLICATE_ELEMENT_FIX.md` - Allgemeine Lösung für field_id Regenerierung
- `docs/FIELD_ID_UNIQUENESS_ANALYSIS.md` - Analyse der Field-ID Eindeutigkeit
- `src/utils/fileElementValidator.ts` - Validierung von FileUIElements

