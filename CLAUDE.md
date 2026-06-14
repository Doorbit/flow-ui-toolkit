# CLAUDE.md

Guidance für Claude Code (claude.ai/code) in diesem Repository.

## Zweck & Beziehung zu portal-applications

`flow-ui-toolkit` ist ein **React-Visual-Editor** (Drag & Drop, mehrsprachig, Undo/Redo), mit dem man **Flow-JSON** erstellt und bearbeitet. Dieses JSON beschreibt dynamische, mehrseitige Formular-Workflows („Flows").

Der entscheidende Punkt: **Das erzeugte JSON wird von `portal-applications` zur Laufzeit gerendert.** Die doorbit-PWA baut ihre gesamte Erfassungs-UI aus genau diesem `ListingFlow`-Format auf. Damit ist das JSON-Format ein **Vertrag**:

> Das Flow-JSON-Schema des Toolkits muss exakt zu `portal-applications/api/rest/listing-flow-api.yaml` und `portal-applications/customers/schema/readme.md` passen. **Schema-Drift zwischen Toolkit und portal ist ein Bug.** Felder, die portal kennt, der Toolkit aber nicht (oder umgekehrt), führen zu kaputten oder nicht editierbaren Flows.

Strategisches Ziel: Der Toolkit soll perspektivisch **in portal-applications integrierbar** werden (eingebetteter Flow-Editor / geteiltes Schema). Deshalb: Flow-JSON-Vertrag 1:1 halten und den Editor-Kern (`models/`, `context/`, `components/`) möglichst frei von CRA/Craco-Spezifika halten.

## Commands

```bash
npm install        # Dependencies
npm start          # craco Dev-Server (http://localhost:3000)
npm run build      # Production-Build (craco)
npm test           # Tests (craco/react-scripts, jest)
npm run deploy     # Build + Deploy nach GitHub Pages (gh-pages)
```

Stack: React 19, TypeScript 4.9, Material-UI (MUI) 7, styled-components, react-dnd, `ajv` (JSON-Validierung), `uuid`, `@mdi/js` (Icons), craco (CRA-Override).

**Versions-Pinning (Pflicht):** Dependencies in `package.json` immer **exakt** pinnen — **niemals** Range-Operatoren (`^`, `~`). (Gleiche Konvention wie portal-applications.)

## Architektur-Map

| Bereich | Datei(en) |
|---|---|
| **Datenmodell** | `src/models/listingFlow.ts` (`ListingFlow`, `Page`, `TranslatableString`, `VisibilityCondition`), `src/models/uiElements.ts` (UIElement-Union + alle Element-Typen) |
| **State** | `src/context/EditorContext.tsx` (zentraler Reducer, Undo/Redo, Multi-Select), `SubflowContext.tsx`, `SchemaContext.tsx` (AJV-Validierung), `FieldValuesContext.tsx`, `ErrorContext.tsx` |
| **Haupt-Editor (3 Spalten)** | `src/components/HybridEditor/HybridEditor.tsx` → links `ElementHierarchyTree.tsx`, Mitte `ElementContextView.tsx`, rechts `EnhancedPropertyEditor.tsx` (+ `EnhancedElementEditorFactory.tsx`) |
| **Element-Editoren** | `src/components/PropertyEditor/editors/*` (Text, Boolean, String, SingleSelection, Number, Date, File, Group, Array, ChipGroup, Custom, Visibility) |
| **Palette** | `src/components/ElementPalette/ElementPalette.tsx` (ziehbare Element-Typen) |
| **Seiten** | `src/components/PageNavigator/PageNavigator.tsx`, `EditPageDialog.tsx` |
| **Flow-Metadaten** | `src/App.tsx` (hält Flow-State + leeres Template), `src/components/Navigation/Navigation.tsx`, `WorkflowNameDialog/` |
| **Export/UUID** | `src/utils/uuidUtils.ts` (Export-Transform — strippt `uuid`) |
| **Utilities** | `SubflowManager.ts`, `normalizeUtils.ts`, `visibilityUtils.ts`, `deepCloneUtils.ts`, `pathUtils.ts` |

## Flow-JSON-Modell (kompakt)

```
ListingFlow { id, url-key, name, title, icon, modules?, pages_edit[], pages_view[] }
  Page { pattern_type, id, layout?, related_pages?, title?, elements[], visibility_condition?, sub_flows?, module_id? }
    PatternLibraryElement { element: UIElement }
      UIElement (Union, diskriminiert über pattern_type):
        Boolean | SingleSelection | ChipGroup | String | Number | Date |
        Custom (SCANNER/ADDRESS/… mit sub_flows[]) | File | Array | Group |
        Text | KeyValueList | ImageGallery | FieldText | Table
      visibility_condition: AND | OR | NOT | Context | RelationalField
```

- **CustomUIElement SCANNER** bettet das Web-CAD ein und deklariert `sub_flows[]` (z. B. `POI`, `ROOM`, `WALL`, `WINDOW`, `DOOR`, `ROOF_AREA`) — kontextsensitive Mini-Fragebögen im CAD.
- Reale Beispiele/Fixtures: `enion_esg.json` (groß), `test-hierarchy.json`, `test-scanner-flow.json`.

### Konventionen

- Alle nutzersichtbaren Texte sind `TranslatableString` (`{ "de": "…", "en": "…" }`).
- Eingabe-Elemente brauchen `field_id.field_name` (dort landet der Wert).
- Schachtelung immer über den Wrapper `PatternLibraryElement { element }`.
- Jedes Element erhält intern eine `uuid`; der **Export strippt `uuid`** (`uuidUtils`). Unbekannte/zusätzliche Felder müssen den Round-Trip Import→Edit→Export **unverändert** überleben.
- Immutability: Reducer arbeitet mit Deep-Clone.
- **Neuer Element-Typ** = Union in `uiElements.ts` + Editor in `PropertyEditor/editors/` + Eintrag in `EnhancedElementEditorFactory` + `ElementPalette`.
- snake_case im JSON (`pages_edit`, `field_id`, `visibility_condition`, `module_id`, `default_active`) — **nicht** camelCase. (GraphQLs `moduleId`/`defaultActive` in portal ist nur die BFF-interne Transformation.)

## Schema-Sync-Regel (Pflicht)

Ändert sich in `portal-applications` das Flow-Schema (`api/rest/listing-flow-api.yaml`, `api/graphql/schema/flow-config.graphqls`, `customers/schema/readme.md`), müssen die Toolkit-Typen und Editoren **nachgezogen** werden. Aktueller offener Abgleich + Modul-System: siehe **`plans/modulare-flows-upgrade.md`**.

## Modulare Flows (Kontext)

portal unterstützt seit Juni 2026 **Module**: Ein Flow kann einen `modules`-Katalog deklarieren; Seiten/Gruppen/Elemente werden per `module_id` einem Modul zugeordnet und sind nur sichtbar, wenn das Projekt das Modul aktiviert hat (`module_<id>_active === true`). Module werden **INLINE** (im Basis-Flow) oder **CATALOG** (separates, nachladbares, versioniertes Flow-Artefakt) ausgeliefert. Der Toolkit muss dieses Authoring abbilden — Detailplan in `plans/modulare-flows-upgrade.md`.

## Tests

- Tests liegen als `*.test.tsx` / `*.test.ts` neben dem Quellcode. Muster: `src/context/EditorContext.test.tsx`.
- Vor jedem Commit: `npm test` grün + `npm run build` ohne TS-Fehler.

## Plans & Docs

- `plans/` — Feature-/Upgrade-Pläne (u. a. `modulare-flows-upgrade.md`).
- `docs/` — technische & Nutzer-Doku (Architektur, Property-Editor, Icon-System).
