# Test-Anleitung: Element-Hierarchie Expand/Collapse Problem

## Problem
Elemente in der Element-Hierarchie-Navigation konnten manchmal nicht mehr zugeklappt werden, nachdem sie aufgeklappt wurden.

## Implementierte Lösung
1. **Manueller Toggle-State**: Hinzugefügt `manuallyToggled` State, um zu verfolgen, ob der Benutzer manuell ein Element auf-/zugeklappt hat
2. **Verbesserte useEffect Logik**: Die automatischen Expand-Effekte berücksichtigen jetzt den manuellen Toggle-State
3. **Intelligenter Reset**: Der manuelle Toggle-State wird nur zurückgesetzt, wenn das Element nicht mehr im aktuellen Pfad ist

## Test-Schritte

### Vorbereitung
1. Stellen Sie sicher, dass die Anwendung läuft (http://localhost:3001/flow-ui-toolkit)
2. Laden Sie die Testdatei `test-hierarchy.json` über "Öffnen"

### Test 1: Grundlegendes Expand/Collapse
1. Öffnen Sie die Element-Hierarchie (linke Spalte)
2. Klicken Sie auf das Expand-Icon (▶) neben "Hauptgruppe"
3. Die Gruppe sollte sich öffnen und Unterelemente anzeigen
4. Klicken Sie auf das Collapse-Icon (▼) neben "Hauptgruppe"
5. **Erwartetes Verhalten**: Die Gruppe sollte sich schließen und geschlossen bleiben

### Test 2: Manuelles Collapse trotz automatischem Expand
1. Öffnen Sie "Hauptgruppe" → "Untergruppe" → "Array Element"
2. Klicken Sie auf ein Element tief in der Hierarchie (z.B. "Array Text Element")
3. Alle übergeordneten Elemente sollten automatisch geöffnet werden
4. Klicken Sie manuell auf das Collapse-Icon einer übergeordneten Gruppe
5. **Erwartetes Verhalten**: Die Gruppe sollte sich schließen und geschlossen bleiben, auch wenn ein Unterelement ausgewählt ist

### Test 3: Reset bei Pfadwechsel
1. Navigieren Sie tief in die Hierarchie und klappen Sie manuell Elemente zu
2. Wechseln Sie zu einem anderen Bereich der Anwendung (z.B. andere Seite)
3. Kehren Sie zur ursprünglichen Hierarchie zurück
4. **Erwartetes Verhalten**: Die automatische Expand-Logik sollte wieder funktionieren

### Test 4: ChipGroup und Array Elemente
1. Testen Sie das Expand/Collapse-Verhalten auch mit:
   - ChipGroup-Elementen
   - Array-Elementen
   - Verschachtelten Gruppen
2. **Erwartetes Verhalten**: Alle Containertypen sollten sich korrekt verhalten

## Technische Details der Lösung

### Geänderte Dateien
- `src/components/HybridEditor/ElementHierarchyTree.tsx`

### Wichtige Änderungen
```typescript
// Neuer State für manuellen Toggle
const [manuallyToggled, setManuallyToggled] = useState(false);

// Verbesserte useEffect Hooks
React.useEffect(() => {
  if (isInCurrentPath && hasActualChildren && !manuallyToggled) {
    setExpanded(true);
  }
}, [isInCurrentPath, hasActualChildren, manuallyToggled]);

// Manueller Toggle Handler
onClick={(e) => {
  e.stopPropagation();
  setExpanded(!expanded);
  setManuallyToggled(true); // Markiere als manuell geändert
}}

// Intelligenter Reset
React.useEffect(() => {
  if (!isInCurrentPath) {
    setManuallyToggled(false);
  }
}, [isInCurrentPath]);
```

## Erwartete Verbesserungen
- ✅ Elemente können jederzeit manuell zu- und aufgeklappt werden
- ✅ Manuelles Zuklappen wird respektiert, auch bei automatischen Expand-Triggern
- ✅ Automatische Expansion funktioniert weiterhin für Navigation
- ✅ Reset-Verhalten ist intelligent und nicht zu aggressiv
