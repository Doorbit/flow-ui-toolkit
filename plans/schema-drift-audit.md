# Schema-Drift-Audit: flow-ui-toolkit ↔ portal-applications

**Stand:** 2026-06-15 · **Autoritativ:** `portal-applications/api/rest/listing-flow-api.yaml` (REST/JSON = Vertrag,
snake_case), gestützt durch `api/graphql/schema/flow-config.graphqls` (BFF, camelCase) und
`customers/schema/readme.md`.

Geprüft: `src/models/uiElements.ts`, `src/models/listingFlow.ts`, `src/components/PropertyEditor/editors/*`,
`src/utils/normalizeUtils.ts`. Ziel: Felder/Enums, die zwischen Toolkit und portal auseinanderlaufen
(„Schema-Drift ist ein Bug", siehe CLAUDE.md).

Severity: **HOCH** = bricht/verliert Daten beim Round-Trip oder erzeugt ungültiges JSON ·
**MITTEL** = fehlende Editierbarkeit/Enum-Werte, aber Round-Trip-safe · **NIEDRIG** = kosmetisch/Doku.

---

## ✅ In diesem PR behoben

| Befund | Sev | Fix |
|---|---|---|
| **NumberUIElement verliert `default`/Grenzen** — Modell/Editor nutzten `min`/`max`/`step`/`default_value`; portal kennt nur `minimum`/`maximum`/`default`. `normalizeUtils` wandelte importiertes `default` → `default_value` ohne Rück-Mapping → Default/Grenzen gingen beim Export verloren. | HOCH | Modell auf `minimum`/`maximum`/`default` umgestellt (`step`/`default_value` entfernt), Editor angepasst (Schrittweite entfernt — portal kennt keine), `normalizeUtils` migriert Alt-Exporte beim Import auf die Schema-Felder. Test: `numberNormalization.test.ts`. |
| **SingleSelection schreibt `BUTTONGROUP`** statt `BUTTON_GROUP` — der aktive Enhanced-Editor erzeugte einen ungültigen Enum-Wert (Schema/Modell: `BUTTON_GROUP`). | HOCH | MenuItem-Wert in `SingleSelectionElementEditorEnhanced.tsx` auf `BUTTON_GROUP` korrigiert. |
| **KeyValueList `type`** kannte nur `TABLE`, Schema hat `COUNTER_BAR` + `TABLE`. | MITTEL | Union auf `'COUNTER_BAR' \| 'TABLE'` erweitert. |
| **FieldText** ohne `align`/`unit` (Schema: `align: LEFT\|CENTER`, `unit`; GraphQL `horizontalAlignment`). | MITTEL | `align?`/`unit?` ergänzt (Round-Trip-Erhalt). |
| **Table** ohne `hide_index_column` (Schema/GraphQL: `hideIndexColumn`). | MITTEL | `hide_index_column?` ergänzt. |
| `Page.layout`-Kommentar irreführend. | NIEDRIG | Kommentar verweist nun auf `pageLayouts.ts` (Standard/`2_COL_RIGHT_WIDER`/`2_COL_RIGHT_FILL`). |

> Hinweis: `Page.layout`-Drift (`1_COL`/`2_COL_LEFT_WIDER`) wurde bereits in PR #21 (Phase 5a) behoben.

---

## ⏭️ Bewusst aufgeschoben (Begründung)

| Befund | Sev | Warum nicht jetzt |
|---|---|---|
| **BooleanUIElement `type` (SWITCH/CHECKBOX/…) + `options.{true/false_label}`** sind toolkit-erfunden — portal kennt sie nicht (Boolean ist immer ein Switch). | HOCH* | **Feature-Entfernung** mit sichtbarer Editor-UI → braucht Produkt-Sign-off. Daten gehen nicht verloren (portal ignoriert die Felder); irreführend ist nur, dass der Autor glaubt, eine Darstellung zu wählen. Empfehlung: `type`/`options` aus Boolean-Typ + Editor entfernen. |
| **StringUIElement `default_value`/`placeholder`/`multiline`/`pattern`** nicht im Schema. | MITTEL | Ebenfalls Feature-Entfernung; Round-Trip-safe. Entweder entfernen oder bewusst als portal-Erweiterung abstimmen. |
| **RCO-Context `LIST`** — nur GraphQL kennt `LIST` zusätzlich zu CREATE/EDIT/VIEW/BACK_OFFICE; REST-YAML (autoritativ fürs JSON) nicht. | MITTEL | Unklar, ob `LIST` im JSON-Vertrag vorkommt. Erst mit portal verifizieren, dann ggf. `RelationalContextOperator.context` + VisibilityConditionEditor ergänzen. |
| **CustomUIElement `PROJECT_CONFIGURATOR`** als Typ-Option in Editor/Palette. | NIEDRIG | Gehört thematisch in die Listen-/Editor-Vereinheitlichung; `type: string` lässt den Wert ohnehin zu (kein Bruch). |
| **Module `name`/`description` required** im Toolkit, optional in YAML. | NIEDRIG | Strenger als der Vertrag (kein Round-Trip-Bruch). Optional-Machen würde TS-Zugriffe in `ModuleManagerDialog` berühren → separat. |
| Erfundene, harmlose Zusatzfelder: `Group.field_id`, `Date.default_value`, `ImageGallery.field_id`, `Table.type`, `ListingFlow.version`. | NIEDRIG | Round-Trip-safe; Aufräumen ohne Dringlichkeit. |

\* Severity-Einstufung des Audits; da kein Datenverlust, eher „irreführende UI".

---

## 🔎 Unklar / manuell mit portal verifizieren

- **FileUIElement `id_field_*`**: YAML `required` nennt `id_field_name`, definiert aber `id_field_id` (YAML-interner Widerspruch). Toolkit nutzt `id_field_id` (konsistent mit readme.md + GraphQL `idField`) → vermutlich korrekt, YAML-`required` ist der Bug. Außerdem prüfen, ob der Export das toolkit-interne `FileUIElement.field_id` strippt.
- **`caption_field_id` vs `name_element`**: REST nutzt `caption_field_id`, GraphQL `nameElement: StringUIElement` — klären, welche Form das JSON erwartet.
- **`preferred_position` vs `display_position`** bei View-Elementen (Text/Table/KeyValueList/FieldText): mögliche Namens-Drift — klären, welches Feld portal im JSON liest.

---

## ℹ️ Portal-seitig (kein Toolkit-Fix — YAML hinkt GraphQL/readme hinterher)

- `SubFlow.type`-Enum im YAML listet nur 5 Werte; readme.md hat die Vollmenge (die der Toolkit korrekt führt). YAML-Enum nachziehen.
- `ImageGallery.preferred_size` im YAML nur `[M, L]`; GraphQL/Toolkit kennen `S, M, M_NARROW, L`. YAML nachziehen.
