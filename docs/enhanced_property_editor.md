# EnhancedPropertyEditor - Dokumentation

## Übersicht

Der EnhancedPropertyEditor ist eine verbesserte Version des klassischen PropertyEditors, der die Businesslogik des PropertyEditors mit einer optimierten Benutzeroberfläche kombiniert. Er ermöglicht die Bearbeitung aller Eigenschaften von UI-Elementen in einer übersichtlichen und benutzerfreundlichen Oberfläche.

## Architektur

Der EnhancedPropertyEditor verwendet ein Factory-Pattern, um die Bearbeitung verschiedener Elementtypen zu ermöglichen. Die Hauptkomponenten sind:

1. **EnhancedPropertyEditor**: Die Hauptkomponente, die die Benutzeroberfläche und die Logik für die Bearbeitung von Elementeigenschaften bereitstellt.
2. **EnhancedElementEditorFactory**: Eine Factory-Komponente, die als Brücke zwischen dem EnhancedPropertyEditor und den spezialisierten Editor-Komponenten dient.
3. **Spezialisierte Editor-Komponenten**: Eigenständige Komponenten für die Bearbeitung spezifischer Elementtypen (z.B. TextElementEditor, BooleanElementEditor, etc.).

## Komponenten im Detail

### EnhancedPropertyEditor

Die EnhancedPropertyEditor-Komponente ist für die Darstellung und Verwaltung der Benutzeroberfläche verantwortlich. Sie bietet:

- Tabs für verschiedene Kategorien von Eigenschaften (Allgemein, Sichtbarkeit, Struktur, JSON)
- Gemeinsame Eigenschaften für alle Elementtypen (Titel, Beschreibung, ID)
- Integration der spezialisierten Editor-Komponenten über die EnhancedElementEditorFactory
- Unterstützung für Visibility-Bedingungen über den VisibilityConditionEditor

```typescript
interface EnhancedPropertyEditorProps {
  element: PatternLibraryElement | null;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
  onNavigateToElement?: (elementPath: number[]) => void;
  currentPath?: number[];
  selectedElementPath?: number[];
}
```

### EnhancedElementEditorFactory

Die EnhancedElementEditorFactory dient als Brücke zwischen dem EnhancedPropertyEditor und den spezialisierten Editor-Komponenten. Sie:

- Bestimmt den Typ des zu bearbeitenden Elements
- Instanziiert die passende spezialisierte Editor-Komponente
- Leitet Aktualisierungen an den EnhancedPropertyEditor weiter

```typescript
interface EnhancedElementEditorFactoryProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}
```

### Spezialisierte Editor-Komponenten

Für jeden Elementtyp gibt es eine spezialisierte Editor-Komponente, die die spezifischen Eigenschaften des Elements bearbeitet:

- **TextElementEditor**: Bearbeitung von Textblöcken (Überschriften, Absätze)
- **BooleanElementEditor**: Bearbeitung von Ja/Nein-Feldern mit verschiedenen Darstellungsarten
- **SingleSelectionElementEditor**: Bearbeitung von Auswahlfeldern mit konfigurierbaren Optionen
- **NumberElementEditor**: Bearbeitung von Zahlenfeldern mit Min/Max-Werten und Schrittweite
- **DateElementEditor**: Bearbeitung von Datumsfeldern mit verschiedenen Formaten
- **StringElementEditor**: Bearbeitung von Texteingabefeldern mit Validierungsoptionen
- **GroupElementEditor**: Bearbeitung von Gruppenelementen mit Einklapp-Funktion
- **ArrayElementEditor**: Bearbeitung von Array-Elementen mit Min/Max-Anzahl
- **ChipGroupEditor**: Bearbeitung von Chip-Gruppen mit konfigurierbaren Optionen
- **FileElementEditor**: Bearbeitung von Datei-Upload-Elementen
- **CustomElementEditor**: Bearbeitung von benutzerdefinierten Komponenten (Scanner, Adresse, etc.)

Jede spezialisierte Editor-Komponente implementiert eine einheitliche Schnittstelle:

```typescript
interface SpecializedEditorProps {
  element: PatternLibraryElement;
  onUpdate: (updatedElement: PatternLibraryElement) => void;
}
```

## Integration mit dem HybridEditor

Der EnhancedPropertyEditor ist ein zentraler Bestandteil des HybridEditors, der eine verbesserte Benutzeroberfläche für die Bearbeitung von UI-Flows bietet. Im HybridEditor wird der EnhancedPropertyEditor zusammen mit dem StructureNavigator und dem ElementContextView verwendet, um eine umfassende Bearbeitungsumgebung zu schaffen.

## Vorteile gegenüber dem klassischen PropertyEditor

1. **Verbesserte Benutzeroberfläche**: Übersichtlichere Darstellung der Eigenschaften durch Tabs und strukturierte Bereiche.
2. **Modulare Struktur**: Bessere Wartbarkeit durch Trennung von Logik und Darstellung.
3. **Spezialisierte Editoren**: Optimierte Bearbeitung spezifischer Elementtypen.
4. **Erweiterte Funktionalität**: Unterstützung für komplexe Elementstrukturen und Subflows.
5. **Bessere Typensicherheit**: Strikte Typisierung durch TypeScript.

## Implementierungsdetails

### Factory-Pattern

Das Factory-Pattern ermöglicht eine flexible und erweiterbare Architektur:

```typescript
const EnhancedElementEditorFactory: React.FC<EnhancedElementEditorFactoryProps> = ({ element, onUpdate }) => {
  const elementType = element.elementType;

  // Verwende die ElementEditorFactory aus dem PropertyEditor
  return <ElementEditorFactory element={element} onUpdate={onUpdate} />;
};
```

### Gemeinsame Eigenschaften

Alle Elemente teilen bestimmte gemeinsame Eigenschaften, die im EnhancedPropertyEditor direkt bearbeitet werden:

```typescript
// Gemeinsame Eigenschaften für alle Elementtypen
<FormField>
  <TextField
    label="ID"
    value={element.field_id?.field_name || ''}
    onChange={handleTextChange('field_id')}
    fullWidth
    variant="outlined"
    size="small"
  />
</FormField>

// Mehrsprachige Titel und Beschreibungen
<TranslatableField
  label="Titel"
  value={(element.element as any).title || { de: '', en: '' }}
  onChange={(value) => {
    // Aktualisierungslogik
  }}
/>
```

### Visibility-Bedingungen

Die Unterstützung für Visibility-Bedingungen ist ein wichtiger Bestandteil des EnhancedPropertyEditors:

```typescript
// Visibility-Bedingungen
<VisibilityConditionEditor
  visibilityCondition={element.visibility_condition}
  onChange={handleVisibilityConditionChange}
  showAsAccordion={false}
/>
```

## Erweiterbarkeit

Der EnhancedPropertyEditor ist so konzipiert, dass er leicht um neue Elementtypen erweitert werden kann:

1. Implementiere eine neue spezialisierte Editor-Komponente
2. Registriere die Komponente in der ElementEditorFactory
3. Die EnhancedElementEditorFactory nutzt automatisch die neue Komponente

## Fazit

Der EnhancedPropertyEditor kombiniert die Businesslogik des klassischen PropertyEditors mit einer verbesserten Benutzeroberfläche. Durch die Verwendung des Factory-Patterns und spezialisierter Editor-Komponenten bietet er eine flexible und erweiterbare Architektur für die Bearbeitung von UI-Elementen. Die Integration mit dem HybridEditor schafft eine umfassende Bearbeitungsumgebung für komplexe UI-Flows.
