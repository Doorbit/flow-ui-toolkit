# Upgrade-Plan: „Modulare Flows" + Schema-Abgleich für flow-ui-toolkit

> Ziel: Den Visual-Editor so erweitern, dass er die neue **Modulare-Flows**-Fähigkeit von `portal-applications` authoren kann, und gleichzeitig die sonstige **Schema-Drift** toolkit↔portal schließen. UX/UI produktreif, mit Blick auf eine künftige Integration des Toolkits in portal-applications.

## Umsetzungsstand (Stand 2026-06-14)

| Phase | Inhalt | Status |
|---|---|---|
| 0 | Schema als Vertrag (AJV lässt neue Felder zu / Round-Trip) | ✅ (durch Round-Trip-Erhalt abgedeckt) |
| 1 | Typmodell (`modules`, `Module`, `module_id`, flow-`version`) | ✅ |
| 2 | Modul-Katalog-Manager (CRUD + Referenz-Integrität) | ✅ |
| 3 | `module_id`-Tagging an Seiten & Elementen | ✅ |
| 4 | Visuelle Kennzeichnung (Badge an Element-Karten **und** Page-Tabs) | ✅ |
| 5 | Referenzielle Validierung (verwaiste `module_id`) | ✅ |
| 6 | Import/Export-Round-Trip (`modules`/`module_id` überleben) | ✅ |
| 7 | CATALOG-Modul-Artefakte exportieren/importieren | ✅ |
| 8 | Schema-Drift-Abgleich (`ContactUIElement`, SubFlow-Typen, `DateUIElement 'YMDT'`) | ✅ |
| 9 | Produkt-UX-Politur + Vorbereitung portal-Integration | teilweise (Kern-UX umgesetzt; tiefe CRA/Craco-Entkopplung als Future Work) |

Offen / Future Work: optionaler Modul-Filter/Highlight + Legende; Entkopplung des Editor-Kerns von CRA/Craco für die spätere Einbettung in die Vue-PWA.

## Hintergrund

`portal-applications` rendert seine gesamte Erfassungs-UI aus Flow-JSON (`ListingFlow` → `pages_edit`/`pages_view` → `elements` → UIElement-Typen; `CustomUIElement.sub_flows`; `visibility_condition`). Der Toolkit erzeugt genau dieses JSON.

Im Juni 2026 hat portal die **„Modulare Flows"-EPIC** ausgeliefert (additiv, kein Breaking Change). Neu im JSON:

- **`ListingFlow.modules`** — Katalog optionaler Module. Pro Modul:
  - `id` (stabile id; Aktivierungsfeld = `module_<id>_active`)
  - `name: TranslatableString`, `description: TranslatableString`
  - `icon?` (mdi-Name)
  - `default_active?: boolean` (Default false; bei Projektanlage vorausgewählt)
  - `delivery?: 'INLINE' | 'CATALOG'` (INLINE = im Basis-Flow; CATALOG = separates, nachladbares Artefakt)
  - `version?: string` (semver-artig; nur CATALOG, für Cache-Invalidierung)
- **`module_id?`** an der UIElement-**Basis** (jedes Element + Teilbaum), an **Page** und **GroupUIElement**. Ein mit `module_id=M` getaggtes Element ist nur sichtbar, wenn `module_<M>_active === true`. Fehlt `module_id` → modul-unabhängig (immer sichtbar).
- **CATALOG-Module** sind eigenständige, flow-förmige JSON-Artefakte (gleiches `ListingFlow`-Schema), separat per `flowModule(id)` nachladbar und offline gecacht.

**Quelle der Wahrheit (portal, read-only Referenz):**
- `api/rest/listing-flow-api.yaml` — `Module`-Schema, `module_id` an UIElement-Basis (snake_case → maßgeblich für den Toolkit).
- `api/graphql/schema/flow-config.graphqls` — `FlowConfigModule`, `moduleId` an Page/Group, `modules` an `FlowConfig`, Query `flowModule(id)`.
- `customers/schema/readme.md`, Beispiel `customers/doorbit_esg.json`.
- `docs/superpowers/specs/2026-06-07-modulare-flows-EPIC-design.md`.

**Naming:** Customer-JSON/REST = **snake_case** (`module_id`, `default_active`, `modules`). GraphQLs camelCase ist nur BFF-intern. Der Toolkit ist snake_case → konsequent snake_case.

## Aktueller Stand im Toolkit

- `src/models/listingFlow.ts`: `ListingFlow` (kein `modules`), `Page` (kein `module_id`), `UIElementBase` (kein `module_id`).
- `src/models/uiElements.ts`: 15-Typen-Union ohne `module_id`, `GroupUIElement` ohne `module_id`; gedriftet ggü. portal (u. a. kein `ContactUIElement`, engeres `SubFlow.type`-Set, `DateUIElement` ohne `'YMDT'`).
- Keine Modul-Verwaltung, kein Tagging, keine referenzielle Validierung.

---

## Phasen (additiv, jede Phase einzeln testbar; Reihenfolge = Implementierungsreihenfolge)

### Phase 0 — Schema als Vertrag verankern
- AJV-Schema in `src/context/SchemaContext.tsx` an portal angleichen, sodass die neuen Felder zugelassen sind (sonst Validierungs-Fehlalarme).
- Sicherstellen, dass Import unbekannte/zusätzliche Felder **nicht verwirft** (Round-Trip-Schutz).

### Phase 1 — Typmodell
Dateien: `src/models/listingFlow.ts`, `src/models/uiElements.ts`.
- Neuer Typ:
  ```ts
  export interface Module {
    id: string;
    name: TranslatableString;
    description: TranslatableString;
    icon?: string;
    default_active?: boolean;
    delivery?: 'INLINE' | 'CATALOG';
    version?: string;
  }
  ```
- `ListingFlow.modules?: Module[]`.
- `module_id?: string` an **`UIElementBase`** (deckt alle Element-Typen inkl. Group via Vererbung) **und** an `Page`.
- Optionales flow-level `version?: string` (für CATALOG-Artefakte, Phase 7).

### Phase 2 — Modul-Katalog-Manager (Flow-Ebene)
- Flow-State + leeres Template in `src/App.tsx`; Einstieg über `Navigation/Navigation.tsx` (ggf. neben `WorkflowNameDialog`).
- Neuer Dialog `src/components/ModuleManager/ModuleManagerDialog.tsx`: CRUD auf `ListingFlow.modules` — `id`, übersetzbarer `name`/`description` (vorhandenes `TranslatableField`), Icon (`IconSelector`), `default_active`-Toggle, `delivery`-Select (INLINE/CATALOG), `version` nur bei CATALOG.
- Reducer-Actions in `EditorContext.tsx`: `ADD_MODULE`, `UPDATE_MODULE`, `REMOVE_MODULE` (immutable, Undo/Redo). `REMOVE_MODULE` warnt/räumt referenzierende `module_id` auf.

### Phase 3 — `module_id`-Tagging (Page, Element, Group)
- **Gemeinsames Basis-Control „Modul-Zuordnung"** (Dropdown der deklarierten Module + „— keins —") in der für **alle** Element-Typen gerenderten Basis-Sektion des `EnhancedPropertyEditor` (da `module_id` an der Basis sitzt → einmal bauen, gilt überall, auch Group).
- Page-Tagging im `PageNavigator/EditPageDialog.tsx` (gleiches Dropdown).
- Reducer-Action `SET_MODULE_ID` (per Element-Pfad / per Page-id), immutable, Undo/Redo, nutzt den vorhandenen update-by-path-Mechanismus.

### Phase 4 — Visuelle Kennzeichnung (Produkt-UX)
- Modul-Badge/Chip (Modul-Icon + -Name, optional Modul-Farbe) in `HybridEditor/ElementHierarchyTree.tsx` und `ElementContextView.tsx` sowie an Page-Tabs in `PageNavigator.tsx`.
- Optional: Modul-Filter/Highlight („nur Modul X anzeigen") + Legende analog vorhandener `VisibilityLegend`.

### Phase 5 — Validierung (referenzielle Integrität)
- Validator (in `SchemaContext` oder eigener Util): jedes verwendete `module_id` muss in `modules[].id` existieren → sonst Warnung (dangling reference). Warnung, wenn `module_id` genutzt, aber `modules` fehlt/leer.
- Ausgabe über vorhandenes Error-/Notification-System (`ErrorContext` / `ErrorNotification`).

### Phase 6 — Import/Export-Round-Trip
- `src/utils/uuidUtils.ts`: bestätigen/erweitern, dass `modules` + `module_id` Import→Edit→Export **unverändert** durchlaufen (nur `uuid` wird gestrippt). Tests dafür.

### Phase 7 — CATALOG-Modul-Artefakte (voll)
- Editor-Modus „Modul-Artefakt": Export eines einzelnen Moduls als eigenständige flow-förmige `ListingFlow`-JSON inkl. flow-level `version`; Import solcher Artefakte; klare UI-Kennzeichnung „dies ist ein CATALOG-Modul-Artefakt".
- Konsistenzprüfung Basis-Flow ↔ Katalog-Eintrag (`delivery: CATALOG` + passende `id`/`version`).

### Phase 8 — Schema-Drift-Abgleich (voller Abgleich)
- Fehlende Typen ergänzen, die portal kennt: **`ContactUIElement`** (+ Editor + Palette + Factory + Union).
- `CustomUIElement.SubFlow.type` an portal-Set erweitern (u. a. `WALL_EVEBI`, `ROOF_AREA`, `COMPONENT`, …) — exakte Liste aus `customers/schema/readme.md` / `flow-config.graphqls`.
- Kleinere Feld-Drifts: `DateUIElement` `'YMDT'` ergänzen; weitere Enums/Optionalfelder gegen `listing-flow-api.yaml` prüfen und angleichen.
- Drift-Check als wiederholbare Aufgabe in `CLAUDE.md` verlinkt halten.

### Phase 9 — Produkt-UX-Politur + Vorbereitung portal-Integration
- Modul-Verwaltung als zusammenhängender „echte-Software"-Flow: klare Einstiegsstelle, konsistente Dialoge, Empty-States, Lösch-Bestätigungen.
- **Integrations-Vorbereitung (Future Work, jetzt nicht umbauen):** Flow-JSON-Vertrag 1:1 zu portal halten; Editor-Kern (`models/`, `context/`, `components/`) von CRA/Craco-Spezifika entkoppeln, damit eine künftige Einbettung in die Vue-PWA (eingebetteter Editor oder geteiltes Schema-Paket) möglich wird.

---

## Tests (Muster: `src/context/EditorContext.test.tsx`)
- Typ-/Round-Trip: `modules` + `module_id` überleben Import→Export.
- Reducer: `ADD/UPDATE/REMOVE_MODULE`, `SET_MODULE_ID` (Element + Page), Undo/Redo.
- Validierung: dangling `module_id` und fehlender `modules`-Katalog werden erkannt.
- Drift: neue Typen (`ContactUIElement`) und erweiterte SubFlow-Typen werden geparst/gerendert.

## Verifikation
- `npm test` grün, `npm run build` ohne TS-Fehler.
- Manuell (`npm start`): Modul anlegen → Page + Element taggen → Badge sichtbar → Export → JSON enthält `modules` + `module_id` (snake_case) → Re-Import unverändert.
- Gegen-Check: exportiertes JSON gegen einen realen portal-Modulabschnitt (`customers/doorbit_esg.json`) diffen; Felder/Schreibweise müssen matchen.

## Betroffene Dateien
**Ändern:** `src/models/listingFlow.ts`, `src/models/uiElements.ts`, `src/context/EditorContext.tsx`, `src/context/SchemaContext.tsx`, `src/components/HybridEditor/{EnhancedPropertyEditor,EnhancedElementEditorFactory,ElementHierarchyTree,ElementContextView}.tsx`, `src/components/PropertyEditor/editors/*`, `src/components/PageNavigator/{PageNavigator,EditPageDialog}.tsx`, `src/components/Navigation/Navigation.tsx`, `src/components/ElementPalette/ElementPalette.tsx`, `src/utils/uuidUtils.ts`, `src/App.tsx`.
**Neu:** `src/components/ModuleManager/ModuleManagerDialog.tsx`.
