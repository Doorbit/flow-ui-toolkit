# UX-Überarbeitung flow-ui-toolkit

## Kontext

Ziel: die gesamte UX des Toolkits von „funktional" zu „poliert & selbsterklärend" heben.
Grundlage sind drei codebasierte UX-Reviews (App-Shell/Layout, Element-Erstellung/Editoren,
Seiten/Module/Import-Export). Die Reviews waren rein code-basiert — eine ergänzende visuelle
Usability-Runde sollte den Plan validieren.

**Entscheidungen (mit Product Owner abgestimmt):**
- **Desktop-first**: Der Toolkit bleibt ein Desktop-Authoring-Werkzeug. Responsives Layout (F4)
  beschränkt sich auf „nicht kaputt / Tablet-tolerant" — kein voller Mobile-Umbau.
- **Kompletter Mehr-Phasen-Umbau**, ein Branch/PR pro Phase.

**Leitprinzip:** Erst Fundamente (Feedback-System, Theme-Tokens, Dialog-Basis), dann darauf
aufsetzende Einzelfixes — sonst flickt man dieselben Probleme mehrfach.

**Wiederverwenden statt neu bauen:** `EditorContext` (Undo/Redo, Multi-Select, Grouping),
Editor-Factory-Muster, `AccordionSection`, `TabbedTranslatableFields`, `ElementPreview`,
`IconField`, das neue `FeedbackContext`, die Snackbar-/Confirm-Muster.

---

## Phase 0 — Fundamente

- [x] **F1 — Einheitliches Feedback-System** *(dieser PR)*
  - `context/FeedbackContext.tsx`: `showSuccess/showError/showWarning/showInfo` + promise-basiertes `confirm()`; rendert eigene Snackbar + Confirm-Dialog.
  - In `App.tsx` verdrahtet; die zwei ad-hoc Snackbars über Shims auf das System umgeleitet.
  - `alert()`/`window.confirm()` ersetzt (`handleNew`, `handleOpen`, `handleSave`, Nesting-Regel).
  - **Datenverlust-Schutz**: „Datei öffnen" fragt bei nicht-leerem Flow nach Bestätigung.
  - **Bugfix**: stiller `catch` beim Modul-Artefakt-Import → Fehler-Toast + Validierung; Erfolgs-Toasts für Modul-CRUD/Import/Export.
- [ ] **F2 — Theme-Tokens**: hardcodierte Farben (`#009F64`, `#43E77F`), Spacing, Font-Sizes in Theme-Tokens; Komponenten auf `primary.main` etc. umstellen. (`App.tsx` Theme, dann breit)
- [ ] **F3 — Shared `DialogBase`**: einheitliche Titel/Actions, `fullScreen` auf Mobile, Fokus-Rückgabe, `aria`-Labels; Dialoge migrieren (`PageNavigator`, `WorkflowNameDialog`, Import/Export-Dialoge — `ModuleManagerDialog`/`EditPageDialog` haben fullScreen bereits).
- [ ] **F4 — Desktop-first Layout-Toleranz** in `HybridEditor.tsx:35–69` (min-width + sauberer Umgang unterhalb der Breakpoints).

## Phase 1 — Sicherheit & Korrektheit
- [ ] Löschen mit Bestätigung für Elemente (`App.tsx handleRemoveElement`) — nutzt `confirm()`.
- [ ] AJV-/Schema-Fehler inline sichtbar machen (`SchemaContext` + ungenutzte `ValidationHelper.tsx`).
- [ ] Restliche `alert/confirm`-Reste in Dialogen auf Feedback-System umstellen.

## Phase 2 — Orientierung & Navigation
- [ ] „Auswählen" vs. „Drill-down" entkoppeln/visuell trennen; `selectedElementPath`↔`currentPath` vereinfachen (`HybridEditor.tsx`, `ElementHierarchyTree.tsx:362–387`).
- [ ] Empty States + Erstkontakt-Onboarding (3-Spalten-Modell; leere Mitte mit CTA).
- [ ] Accessibility: `aria-label`, Fokus-Management, Kontraste, semantische Landmarks, Keyboard-Shortcuts-Hilfe.

## Phase 3 — Auffindbarkeit & Effizienz
- [ ] Palette: Suche/Filter + Tooltips je Typ; Palette sichtbar im Layout (`ElementPalette.tsx`).
- [ ] Drag&Drop: Drop-Indikatoren + Verschachtelungsregeln vorab (ungültiges Hinzufügen deaktivieren).
- [ ] Multi-Select-Affordance (sichtbarer Toggle/Checkboxen).
- [ ] Modul-Zuordnung immer sichtbar. *(INLINE/CATALOG- & Modul-Tooltips bereits via PR #8.)*

## Phase 4 — Editor-Konsistenz & Wartbarkeit
- [ ] `useElementUpdate`-Hook (dedupliziert Handler-Boilerplate über ~12 Editoren).
- [ ] Listen-Editoren vereinheitlichen (ChipGroup-Dialog vs. SingleSelection-Tabelle).
- [ ] Pflichtfeld-Markierung, Feld-ID prominenter, Hilfetexte, Duplikat-Optionen verhindern.

## Phase 5 — Seiten & Flow-Metadaten
- [ ] `pattern_type`-Auswahl bei Seitenanlage; Layout-Vorschau (`PageNavigator.tsx`, `EditPageDialog.tsx`).
- [ ] Flow-Metadaten editierbar (id/url-key mit Validierung, Flow-Icon, Beschreibung); `related_pages` dokumentieren.

---

## Verifikation (je Phase)
- `npm test` grün + `npm run build` (CI) ohne Fehler.
- Neue Tests für Reducer-/Util-Änderungen (Muster: `EditorContext.test.tsx`).
- Manuelle Klick-Checkliste je Phase.
- Empfehlung: ergänzende visuelle Usability-Runde (Live-App), da Reviews code-basiert waren.
