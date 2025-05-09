import { updateSubflowElement, updateSubflowElementProperty, removeSubflowElementProperty, findSubflowByType, filterSubflows } from './SubflowManager';
import { CustomUIElement } from '../models/uiElements';
import { PatternLibraryElement } from '../models/listingFlow';

describe('SubflowManager', () => {
  // Mock-Daten für Tests
  const mockCustomElement: CustomUIElement = {
    pattern_type: 'CustomUIElement',
    type: 'SCANNER',
    id: 'test-scanner',
    required: false,
    sub_flows: [
      {
        type: 'POI',
        elements: [
          {
            element: {
              pattern_type: 'StringUIElement',
              type: 'TEXT',
              field_id: { field_name: 'poi_name' },
              required: true,
              title: { de: 'POI Name' }
            }
          },
          {
            element: {
              pattern_type: 'BooleanUIElement',
              field_id: { field_name: 'poi_active' },
              required: false,
              default_value: true
            }
          }
        ]
      },
      {
        type: 'ROOM',
        elements: [
          {
            element: {
              pattern_type: 'NumberUIElement',
              field_id: { field_name: 'room_size' },
              required: true,
              title: { de: 'Raumgröße' }
            }
          }
        ]
      }
    ]
  };

  describe('updateSubflowElement', () => {
    it('sollte ein Element innerhalb eines Subflows aktualisieren', () => {
      const updates = {
        title: { de: 'Neuer POI Name' },
        required: false
      };

      const result = updateSubflowElement(mockCustomElement, 0, 0, updates);

      // Überprüfe, ob die Aktualisierungen korrekt angewendet wurden
      expect(result.sub_flows![0].elements[0].element.title).toEqual({ de: 'Neuer POI Name' });
      expect(result.sub_flows![0].elements[0].element.required).toBe(false);
      
      // Überprüfe, ob andere Elemente unverändert bleiben
      expect(result.sub_flows![0].elements[1]).toEqual(mockCustomElement.sub_flows![0].elements[1]);
      expect(result.sub_flows![1]).toEqual(mockCustomElement.sub_flows![1]);
    });

    it('sollte das ursprüngliche Objekt zurückgeben, wenn der Subflow nicht existiert', () => {
      const result = updateSubflowElement(mockCustomElement, 5, 0, { title: { de: 'Test' } });
      expect(result).toEqual(mockCustomElement);
    });
  });

  describe('updateSubflowElementProperty', () => {
    it('sollte eine einzelne Eigenschaft aktualisieren', () => {
      const result = updateSubflowElementProperty(
        mockCustomElement,
        0,
        0,
        'title.de',
        'Aktualisierter POI Name'
      );

      expect(result.sub_flows![0].elements[0].element.title.de).toBe('Aktualisierter POI Name');
      
      // Überprüfe, ob andere Eigenschaften unverändert bleiben
      expect(result.sub_flows![0].elements[0].element.required).toBe(true);
    });

    it('sollte neue verschachtelte Eigenschaften erstellen, wenn sie nicht existieren', () => {
      const result = updateSubflowElementProperty(
        mockCustomElement,
        0,
        1,
        'description.de',
        'Eine Beschreibung'
      );

      expect(result.sub_flows![0].elements[1].element.description.de).toBe('Eine Beschreibung');
    });
  });

  describe('removeSubflowElementProperty', () => {
    it('sollte eine Eigenschaft aus einem Element entfernen', () => {
      const result = removeSubflowElementProperty(
        mockCustomElement,
        0,
        0,
        'title'
      );

      expect(result.sub_flows![0].elements[0].element.title).toBeUndefined();
      
      // Überprüfe, ob andere Eigenschaften unverändert bleiben
      expect(result.sub_flows![0].elements[0].element.required).toBe(true);
    });
  });

  describe('findSubflowByType', () => {
    it('sollte einen Subflow nach seinem Typ finden', () => {
      const result = findSubflowByType(mockCustomElement, 'ROOM');
      
      expect(result).not.toBeNull();
      expect(result!.subflow.type).toBe('ROOM');
      expect(result!.index).toBe(1);
    });

    it('sollte null zurückgeben, wenn kein Subflow mit dem angegebenen Typ gefunden wurde', () => {
      const result = findSubflowByType(mockCustomElement, 'NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('filterSubflows', () => {
    it('sollte Subflows nach ihren Typen filtern', () => {
      const result = filterSubflows(mockCustomElement, ['POI']);
      
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('ROOM');
    });

    it('sollte ein leeres Array zurückgeben, wenn alle Typen ausgeschlossen sind', () => {
      const result = filterSubflows(mockCustomElement, ['POI', 'ROOM']);
      expect(result.length).toBe(0);
    });
  });
});
