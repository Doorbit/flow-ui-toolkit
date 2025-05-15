import { normalizeElementTypes } from './normalizeUtils';
import { ListingFlow } from '../models/listingFlow';

// Hilfsfunktion zum Testen der Normalisierung ohne TypeScript-Fehler
const testNormalization = (input: any, getElementPath: (result: any) => any, expectedValue: string) => {
  // Wir müssen das Input-Objekt als any typisieren, um die Tests zu ermöglichen
  const result = normalizeElementTypes(input as unknown as ListingFlow);

  // Wir verwenden eine Funktion, um den Pfad zum Element zu erhalten
  const element = getElementPath(result);
  expect(element).toBe(expectedValue);
};

describe('normalizeElementTypes', () => {
  it('should normalize DateUIElement type values', () => {
    const input = {
      id: 'test-flow',
      'url-key': 'test',
      name: 'Test Flow',
      title: { de: 'Test', en: 'Test' },
      icon: 'test',
      pages_edit: [
        {
          pattern_type: 'Page', // Hinzugefügt, da es ein erforderliches Feld ist
          id: 'page1',
          elements: [
            {
              element: {
                pattern_type: 'DateUIElement',
                type: 'Y',
                field_id: { field_name: 'test_date' }
              }
            }
          ]
        }
      ],
      pages_view: []
    };

    testNormalization(
      input,
      (result) => (result.pages_edit[0].elements[0].element as any).type,
      'YEAR'
    );
  });

  it('should normalize DateUIElement type values in nested elements', () => {
    const input = {
      id: 'test-flow',
      'url-key': 'test',
      name: 'Test Flow',
      title: { de: 'Test', en: 'Test' },
      icon: 'test',
      pages_edit: [
        {
          pattern_type: 'Page', // Hinzugefügt, da es ein erforderliches Feld ist
          id: 'page1',
          elements: [
            {
              element: {
                pattern_type: 'GroupUIElement',
                elements: [
                  {
                    element: {
                      pattern_type: 'DateUIElement',
                      type: 'Y',
                      field_id: { field_name: 'test_date' }
                    }
                  }
                ]
              }
            }
          ]
        }
      ],
      pages_view: []
    };

    testNormalization(
      input,
      (result) => (result.pages_edit[0].elements[0].element as any).elements[0].element.type,
      'YEAR'
    );
  });

  it('should normalize DateUIElement type values in CustomUIElement sub_flows', () => {
    const input = {
      id: 'test-flow',
      'url-key': 'test',
      name: 'Test Flow',
      title: { de: 'Test', en: 'Test' },
      icon: 'test',
      pages_edit: [
        {
          pattern_type: 'Page', // Hinzugefügt, da es ein erforderliches Feld ist
          id: 'page1',
          elements: [
            {
              element: {
                pattern_type: 'CustomUIElement',
                type: 'SCANNER',
                sub_flows: [
                  {
                    type: 'POI',
                    elements: [
                      {
                        element: {
                          pattern_type: 'DateUIElement',
                          type: 'Y',
                          field_id: { field_name: 'test_date' }
                        }
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
      ],
      pages_view: []
    };

    testNormalization(
      input,
      (result) => (result.pages_edit[0].elements[0].element as any).sub_flows[0].elements[0].element.type,
      'YEAR'
    );
  });

  it('should handle combined date formats like YMD', () => {
    const input = {
      id: 'test-flow',
      'url-key': 'test',
      name: 'Test Flow',
      title: { de: 'Test', en: 'Test' },
      icon: 'test',
      pages_edit: [
        {
          pattern_type: 'Page', // Hinzugefügt, da es ein erforderliches Feld ist
          id: 'page1',
          elements: [
            {
              element: {
                pattern_type: 'DateUIElement',
                type: 'YMD',
                field_id: { field_name: 'test_date' }
              }
            }
          ]
        }
      ],
      pages_view: []
    };

    testNormalization(
      input,
      (result) => (result.pages_edit[0].elements[0].element as any).type,
      'YMD'
    );
  });

  it('should normalize SingleSelectionUIElement type values', () => {
    const input = {
      id: 'test-flow',
      'url-key': 'test',
      name: 'Test Flow',
      title: { de: 'Test', en: 'Test' },
      icon: 'test',
      pages_edit: [
        {
          pattern_type: 'Page', // Hinzugefügt, da es ein erforderliches Feld ist
          id: 'page1',
          elements: [
            {
              element: {
                pattern_type: 'SingleSelectionUIElement',
                type: 'BUTTON_GROUP',
                field_id: { field_name: 'test_selection' }
              }
            }
          ]
        }
      ],
      pages_view: []
    };

    testNormalization(
      input,
      (result) => (result.pages_edit[0].elements[0].element as any).type,
      'BUTTONGROUP'
    );
  });

  it('should normalize NumberUIElement type values', () => {
    const input = {
      id: 'test-flow',
      'url-key': 'test',
      name: 'Test Flow',
      title: { de: 'Test', en: 'Test' },
      icon: 'test',
      pages_edit: [
        {
          pattern_type: 'Page', // Hinzugefügt, da es ein erforderliches Feld ist
          id: 'page1',
          elements: [
            {
              element: {
                pattern_type: 'NumberUIElement',
                type: 'INT',
                field_id: { field_name: 'test_number' }
              }
            }
          ]
        }
      ],
      pages_view: []
    };

    testNormalization(
      input,
      (result) => (result.pages_edit[0].elements[0].element as any).type,
      'INTEGER'
    );
  });

  it('should normalize FileUIElement file_type values', () => {
    const input = {
      id: 'test-flow',
      'url-key': 'test',
      name: 'Test Flow',
      title: { de: 'Test', en: 'Test' },
      icon: 'test',
      pages_edit: [
        {
          pattern_type: 'Page',
          id: 'page1',
          elements: [
            {
              element: {
                pattern_type: 'FileUIElement',
                file_type: 'IMG',
                id_field_id: { field_name: 'test_file' }
              }
            }
          ]
        }
      ],
      pages_view: []
    };

    testNormalization(
      input,
      (result) => (result.pages_edit[0].elements[0].element as any).file_type,
      'IMAGE'
    );
  });

  it('should normalize field names like accepted_types to allowed_file_types', () => {
    const input = {
      id: 'test-flow',
      'url-key': 'test',
      name: 'Test Flow',
      title: { de: 'Test', en: 'Test' },
      icon: 'test',
      pages_edit: [
        {
          pattern_type: 'Page',
          id: 'page1',
          elements: [
            {
              element: {
                pattern_type: 'FileUIElement',
                file_type: 'IMAGE',
                id_field_id: { field_name: 'test_file' },
                accepted_types: ['image/jpeg', 'image/png']
              }
            }
          ]
        }
      ],
      pages_view: []
    };

    const result = normalizeElementTypes(input as unknown as ListingFlow);

    // Prüfen, ob accepted_types zu allowed_file_types normalisiert wurde
    expect((result.pages_edit[0].elements[0].element as any).allowed_file_types).toEqual(['image/jpeg', 'image/png']);
    expect((result.pages_edit[0].elements[0].element as any).accepted_types).toBeUndefined();
  });

  it('should normalize SingleSelectionUIElement items to options', () => {
    const input = {
      id: 'test-flow',
      'url-key': 'test',
      name: 'Test Flow',
      title: { de: 'Test', en: 'Test' },
      icon: 'test',
      pages_edit: [
        {
          pattern_type: 'Page',
          id: 'page1',
          elements: [
            {
              element: {
                pattern_type: 'SingleSelectionUIElement',
                type: 'DROPDOWN',
                field_id: { field_name: 'test_selection' },
                items: [
                  { key: 'option1', label: { de: 'Option 1', en: 'Option 1' } },
                  { key: 'option2', label: { de: 'Option 2', en: 'Option 2' } }
                ]
              }
            }
          ]
        }
      ],
      pages_view: []
    };

    const result = normalizeElementTypes(input as unknown as ListingFlow);

    // Prüfen, ob items zu options normalisiert wurde
    expect((result.pages_edit[0].elements[0].element as any).options).toEqual([
      { key: 'option1', label: { de: 'Option 1', en: 'Option 1' } },
      { key: 'option2', label: { de: 'Option 2', en: 'Option 2' } }
    ]);
    expect((result.pages_edit[0].elements[0].element as any).items).toBeUndefined();
  });

  it('should normalize TextUIElement type values', () => {
    const input = {
      id: 'test-flow',
      'url-key': 'test',
      name: 'Test Flow',
      title: { de: 'Test', en: 'Test' },
      icon: 'test',
      pages_edit: [
        {
          pattern_type: 'Page',
          id: 'page1',
          elements: [
            {
              element: {
                pattern_type: 'TextUIElement',
                type: 'TEXT',
                text: { de: 'Beispieltext', en: 'Example text' }
              }
            }
          ]
        }
      ],
      pages_view: []
    };

    testNormalization(
      input,
      (result) => (result.pages_edit[0].elements[0].element as any).type,
      'PARAGRAPH'
    );
  });
});
