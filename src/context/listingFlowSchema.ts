/**
 * JSON-Schema für das ListingFlow-Format.
 *
 * Abgeleitet aus dem vollständigen Datenmodell (`models/uiElements.ts`) und gegen die
 * authoritative Produktions-Flows abgeglichen (`portal-applications/customers/doorbit_esg.json`
 * sowie `enion_esg.json`) — beide validieren fehlerfrei (keine False-Positives).
 *
 * Designprinzipien:
 * - **Lenient**: kein `additionalProperties: false`. Unbekannte/zusätzliche Felder müssen den
 *   Round-Trip Import→Edit→Export unverändert überleben (Vertrag mit portal).
 * - **Vorwärtskompatibel**: Element-Typen werden über `if/then` auf `pattern_type` geprüft.
 *   Unbekannte (künftige) `pattern_type`s lösen KEINEN Fehler aus — nur bekannte Typen werden
 *   gegen ihre Pflichtfelder validiert.
 * - **Pflichtfelder = nur was in den echten Flows ausnahmslos vorhanden ist** (z. B. `field_id`
 *   bei Eingabe-Elementen, `elements` bei Containern). So werden echte Authoring-Fehler erkannt,
 *   ohne gültige Flows fälschlich zu beanstanden. `required` (Boolean) wird bewusst NICHT verlangt,
 *   da es in realen Flows häufig fehlt.
 */

const fieldId = {
  type: 'object',
  required: ['field_name'],
  properties: { field_name: { type: 'string' } },
};

const PLE = { $ref: '#/definitions/PatternLibraryElement' };

// Erzeugt eine bedingte Regel: "wenn pattern_type === type, dann required/props".
// Greift nur für genau diesen Typ; andere (inkl. unbekannte) Typen bleiben unberührt.
function reqIf(type: string, required: string[], props?: Record<string, unknown>) {
  return {
    if: { required: ['pattern_type'], properties: { pattern_type: { const: type } } },
    then: { required, ...(props ? { properties: props } : {}) },
  };
}

export const listingFlowSchema = {
  type: 'object',
  required: ['id', 'url-key', 'name', 'title', 'pages_edit', 'pages_view'],
  properties: {
    id: { type: 'string' },
    'url-key': { type: 'string' },
    name: { type: 'string' },
    title: { type: 'object' },
    icon: { type: 'string' },
    pages_edit: { type: 'array', items: { $ref: '#/definitions/Page' } },
    pages_view: { type: 'array', items: { $ref: '#/definitions/Page' } },
  },
  definitions: {
    FieldId: fieldId,
    Page: {
      type: 'object',
      required: ['pattern_type', 'id', 'elements'],
      properties: {
        pattern_type: { type: 'string' },
        id: { type: 'string' },
        elements: { type: 'array', items: PLE },
        sub_flows: { type: 'array', items: { $ref: '#/definitions/SubFlow' } },
      },
    },
    SubFlow: {
      type: 'object',
      required: ['type', 'elements'],
      properties: {
        type: { type: 'string' },
        elements: { type: 'array', items: PLE },
      },
    },
    PatternLibraryElement: {
      type: 'object',
      required: ['element'],
      properties: { element: { $ref: '#/definitions/UIElement' } },
    },
    UIElement: {
      type: 'object',
      required: ['pattern_type'],
      properties: { pattern_type: { type: 'string' } },
      allOf: [
        // Eingabe-Elemente: brauchen ein field_id (sonst hat der Wert keinen Speicherort)
        reqIf('BooleanUIElement', ['field_id'], { field_id: { $ref: '#/definitions/FieldId' } }),
        reqIf('StringUIElement', ['field_id'], { field_id: { $ref: '#/definitions/FieldId' } }),
        reqIf('NumberUIElement', ['field_id'], { field_id: { $ref: '#/definitions/FieldId' } }),
        reqIf('DateUIElement', ['field_id'], { field_id: { $ref: '#/definitions/FieldId' } }),
        reqIf('SingleSelectionUIElement', ['field_id', 'options'], {
          field_id: { $ref: '#/definitions/FieldId' },
          options: { type: 'array' },
        }),
        // Container: brauchen ihre Kind-Liste (rekursiv validiert)
        reqIf('GroupUIElement', ['elements'], { elements: { type: 'array', items: PLE } }),
        reqIf('ArrayUIElement', ['elements'], { elements: { type: 'array', items: PLE } }),
        reqIf('ChipGroupUIElement', ['chips'], {
          chips: { type: 'array', items: { $ref: '#/definitions/UIElement' } },
        }),
        // Inhalts-/Anzeige-Elemente: brauchen ihren definierenden Inhalt
        reqIf('TextUIElement', ['text'], { text: { type: 'object' } }),
        reqIf('FieldTextUIElement', ['field_value']),
        reqIf('TableUIElement', ['columns'], { columns: { type: 'array' } }),
        reqIf('KeyValueListUIElement', ['items'], { items: { type: 'array' } }),
        reqIf('FileUIElement', ['id_field_id', 'allowed_file_types'], {
          id_field_id: { $ref: '#/definitions/FieldId' },
          allowed_file_types: { type: 'array' },
        }),
        // CustomUIElement (SCANNER/ADDRESS/…): keine zusätzlichen Pflichtfelder, aber
        // verschachtelte elements/sub_flows rekursiv validieren.
        {
          if: { required: ['pattern_type'], properties: { pattern_type: { const: 'CustomUIElement' } } },
          then: {
            properties: {
              elements: { type: 'array', items: PLE },
              sub_flows: { type: 'array', items: { $ref: '#/definitions/SubFlow' } },
            },
          },
        },
        // ImageGalleryUIElement, ContactUIElement: variabel/optional → nur pattern_type (s. o.)
      ],
    },
  },
};
