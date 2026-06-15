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
- [x] **F3 — Shared `DialogBase`** *(PR #10)*: einheitliche Titel/Actions, automatisches `fullScreen` auf kleinen Screens, Fokus auf Primär-Aktion, `aria-labelledby`. `components/common/DialogBase.tsx`; `WorkflowNameDialog` migriert. Weitere Dialoge folgen schrittweise.
- [x] **F4 — Desktop-first Layout-Toleranz** *(PR #10)*: `HybridEditor` nutzt Flex + Mindestbreiten; bei schmalen Viewports horizontal scrollen statt Spalten unbrauchbar quetschen.

## Phase 1 — Sicherheit & Korrektheit
- [x] Löschen mit Bestätigung — **war bereits vorhanden** (Element via `ElementContextView`, Seite, Modul). Befund der Review-Agenten war ungenau.
- [x] **Confirm-Konsolidierung** *(PR #11)*: Seiten- & Modul-Lösch-Dialoge auf das einheitliche `confirm()` umgestellt; „letzte Seite"-Sperre gibt jetzt Feedback. ElementContextView **bewusst aufgeschoben** (1087-Zeilen-Datei, bestehender Dialog gut inkl. Kind-Warnung).
- [x] **AJV-/Schema-Validierung sichtbar** *(PR #12)*: Schema (`context/listingFlowSchema.ts`) ans volle Modell angeglichen und gegen die authoritativen Flows abgeglichen (`portal-applications/customers/doorbit_esg.json` + `enion_esg.json` validieren fehlerfrei → keine False-Positives). Lenient + vorwärtskompatibel (unbekannte `pattern_type`s erlaubt). Toolbar-Indikator (`ValidationStatus`): grün „Gültig" / rot „N Probleme" → Dialog mit Fehlerliste. Test: `listingFlowSchema.test.ts`.
- [x] Restliche `alert/confirm`-Reste auf Feedback-System — erledigt mit F1 (#9).

## Phase 2 — Orientierung & Navigation
- [~] „Auswählen" vs. „Drill-down" **visuell getrennt** *(PR Phase 2-Rest)*: Funktional waren beide schon entkoppelt (Zeile=auswählen, Baum-Icon=drill, „Gruppe öffnen"-Button=drill). Neu: die Drill-Schaltfläche des aktuell geöffneten Containers zeigt einen **aktiven Zustand** (`isCurrentContext`) + `aria-pressed` → „wo bin ich drin" ≠ „was bearbeite ich". Der tiefere `selectedElementPath`↔`currentPath`-State-Refactor bleibt **bewusst offen** (spekulativ, braucht Live-Usability-Runde).
- [x] **Empty States + Erstkontakt-Onboarding** *(PR Phase 2)*: `OnboardingDialog` (via DialogBase) erklärt das 3-Spalten-Modell + Grundablauf; First-Run automatisch (localStorage `flowToolkit.onboardingSeen`), jederzeit über Toolbar-Icon „Erste Schritte" erneut aufrufbar. Leere Mitte mit CTA war bereits vorhanden.
- [~] Accessibility: 3 Spalten als Landmarks (`role="region"` + `aria-label`) **erledigt** *(PR Phase 2)*; Hierarchie-Baum: `aria-label` auf Auf-/Zuklappen- & Drill-Buttons, `aria-current` für die Auswahl, `aria-pressed` am Drill-Button **erledigt** *(PR Phase 2-Rest)*. Fokus-Management/Kontraste weiterhin offen.
- [x] **Keyboard-Shortcuts-Hilfe** *(PR #11)*: Dialog (via DialogBase) listet die vorhandenen, bislang undokumentierten Shortcuts (Strg+Z/Y/S, Esc); Tastatur-Icon in der Toolbar.

## Phase 3 — Auffindbarkeit & Effizienz
- [~] **Element-Picker: Suche + Beschreibungen** *(PR Phase 3)*: Befund — die `ElementPalette.tsx`-Komponente ist **tot** (in `App.tsx` auskommentiert, nicht gerendert). Der real genutzte Picker ist der `ElementTypeDialog` in `ElementContextView`. Dort ergänzt: Suchfeld (filtert Label/Typ/Beschreibung über beide Kategorien) + sichtbare **Beschreibung je Typ** (statt nur Hover-Tooltip → besser auffindbar/Touch). Offen: tote `ElementPalette` aufräumen/entfernen.
- [~] **Verschachtelungsregeln vorab** *(PR Phase 3)*: Regeln in `utils/nestingRules.ts` extrahiert (Single Source of Truth, Unit-Test) und im Element-Typ-Dialog angewandt — unerlaubte Typen werden **deaktiviert + mit Grund** angezeigt, statt erst nach der Auswahl einen Fehler zu werfen (Fallback in App.tsx bleibt). Offen: ausgefeiltere Drop-Indikatoren beim Reorder-Drag (heute simple Top-Border).
- [ ] Multi-Select-Affordance (sichtbarer Toggle/Checkboxen).
- [ ] Modul-Zuordnung immer sichtbar. *(INLINE/CATALOG- & Modul-Tooltips bereits via PR #8.)*

## Phase 4 — Editor-Konsistenz & Wartbarkeit
- [ ] `useElementUpdate`-Hook (dedupliziert Handler-Boilerplate über ~12 Editoren).
- [ ] Listen-Editoren vereinheitlichen (ChipGroup-Dialog vs. SingleSelection-Tabelle).
- [~] **Feld-ID-Prominenz** *(PR Phase 4)*: gemeinsame `common/FieldIdField` (Pflicht-Marker, Hilfetext, Leer-Warnung) **zentral** im `EnhancedElementEditorFactory` für alle wertführenden Typen (Boolean/String/Number/Date/SingleSelection). Befund: Feld-ID war zuvor uneinheitlich — bei Number/Date/Boolean/SingleSelection gar nicht editierbar, bei String als String statt `{field_name}`. Jetzt überall sichtbar + einheitlich als `{field_name}` geschrieben. Offen: breitere Pflichtfeld-Markierungen, `useElementUpdate`-Hook.
- [x] **Duplikat-/Leer-Optionen verhindern** *(PR Phase 4)*: Auswahlfeld-Optionen-Schlüssel werden auf Eindeutigkeit und Nicht-Leere geprüft (`getOptionKeyError`, Unit-getestet). Befund: `handleUpdateOptionKey` erlaubte beliebige Keys ohne Prüfung — doppelte/leere `key`s sind vertragskritisch (portal speichert den Wert über `key`). Jetzt: Fehlerstatus + Hilfetext am Key-Feld, Sammel-Warnung über der Optionen-Tabelle, kollisionssichere Auto-Key-Generierung beim Hinzufügen.

## Phase 5 — Seiten & Flow-Metadaten
- [x] **Layout-Vorschau + Layout-Wahl bei Seitenanlage** *(PR Phase 5a)*: Zentrale `pageLayouts.ts` (Single Source of Truth, unit-getestet) + SVG-`LayoutPreview`. Schema-Abgleich mit portal (`d-fc-page-default.vue`): nur `null`/Standard, `2_COL_RIGHT_WIDER`, `2_COL_RIGHT_FILL` werden gerendert — der Editor bot zusätzlich `2_COL_LEFT_WIDER`/`1_COL` an (**Schema-Drift, entfernt**). Layout jetzt mit Vorschau in `EditPageDialog` **und** schon im Neue-Seite-Dialog wählbar; abwesendes Layout = „Standard"; nicht unterstützte Alt-Werte werden als deaktivierter „⚠ Nicht unterstützt"-Eintrag sichtbar gemacht. **`pattern_type`-Auswahl bewusst verworfen**: portal verzweigt nicht über den Page-`pattern_type` (alle Top-Level-Seiten laufen durch `d-fc-page-default`), ein Selektor wäre wirkungslos und driftgefährdet.
- [x] **Flow-Metadaten editierbar** *(PR Phase 5b)*: Neuer `FlowMetadataDialog` (über `DialogBase`) ersetzt den reinen Namens-Dialog und macht `id`, `url-key`, `name`, `title` (de/en) und `icon` editierbar; `id`/`url-key` werden als slug-artige Identifier validiert (`utils/flowMetadata.ts`, unit-getestet), mit „aus Name"-Ableitung. Befund: vorher leitete der Dialog `id`/`url-key`/`title` still aus dem Namen ab und das Icon war gar nicht editierbar. `related_pages` + Layout-Vertrag in `docs/technical_documentation.md` dokumentiert. Flow-`description` bewusst weggelassen — nicht im `ListingFlow`-Schema von portal.

---

## Verifikation (je Phase)
- `npm test` grün + `npm run build` (CI) ohne Fehler.
- Neue Tests für Reducer-/Util-Änderungen (Muster: `EditorContext.test.tsx`).
- Manuelle Klick-Checkliste je Phase.
- Empfehlung: ergänzende visuelle Usability-Runde (Live-App), da Reviews code-basiert waren.
