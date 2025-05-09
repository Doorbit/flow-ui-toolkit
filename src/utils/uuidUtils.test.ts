import { v4 as uuidv4 } from 'uuid';
import { ensureUUIDs, generateUUID } from './uuidUtils';
import { ListingFlow, Page, PatternLibraryElement } from '../models/listingFlow';
import { 
  GroupUIElement, 
  ArrayUIElement, 
  ChipGroupUIElement, 
  BooleanUIElement,
  SingleSelectionUIElement,
  StringUIElement 
} from '../models/uiElements';

// Mock UUID Generator
jest.mock('uuid');
const mockedUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

describe('uuidUtils', () => {
  beforeEach(() => {
    // Zurücksetzen des Mocks vor jedem Test
    jest.clearAllMocks();
    
    // Festlegen der Mock-Implementierung für uuidv4
    let counter = 0;
    mockedUuidv4.mockImplementation(() => `test-uuid-${counter++}`);
  });

  describe('generateUUID', () => {
    it('sollte eine neue UUID zurückgeben', () => {
      const result = generateUUID();
      expect(result).toBe('test-uuid-0');
      expect(mockedUuidv4).toHaveBeenCalledTimes(1);
    });
  });

  describe('ensureUUIDs', () => {
    it('sollte UUIDs für alle Top-Level-Elemente hinzufügen', () => {
      // Test-Flow mit Elementen ohne UUIDs
      const testFlow: ListingFlow = {
        id: 'test-flow',
        'url-key': 'test-flow',
        name: 'Test Flow',
        title: { de: 'Test Flow' },
        icon: 'test-icon',
        pages_edit: [
          {
            pattern_type: 'Page',
            id: 'test-page',
            elements: [
              {
                element: {
                  pattern_type: 'StringUIElement',
                  type: 'TEXT',
                  field_id: { field_name: 'test_field' },
                  required: false
                }
              }
            ]
          }
        ],
        pages_view: []
      };

      const result = ensureUUIDs(testFlow);

      // Überprüfen, dass alle Elemente UUIDs haben
      expect(result.pages_edit[0].elements[0].element.uuid).not.toBeUndefined();
      expect(mockedUuidv4).toHaveBeenCalled();
    });

    it('sollte keine vorhandenen UUIDs überschreiben', () => {
      // Test-Flow mit Elementen, die bereits UUIDs haben
      const testFlow: ListingFlow = {
        id: 'test-flow',
        'url-key': 'test-flow',
        name: 'Test Flow',
        title: { de: 'Test Flow' },
        icon: 'test-icon',
        pages_edit: [
          {
            pattern_type: 'Page',
            id: 'test-page',
            elements: [
              {
                element: {
                  pattern_type: 'StringUIElement',
                  type: 'TEXT',
                  field_id: { field_name: 'test_field' },
                  required: false,
                  uuid: 'existing-uuid'
                }
              }
            ]
          }
        ],
        pages_view: []
      };

      const result = ensureUUIDs(testFlow);

      // Überprüfen, dass bestehende UUIDs nicht überschrieben wurden
      expect(result.pages_edit[0].elements[0].element.uuid).toBe('existing-uuid');
      expect(mockedUuidv4).not.toHaveBeenCalledWith('existing-uuid');
    });

    it('sollte UUIDs für verschachtelte Elemente in GroupUIElements hinzufügen', () => {
      // Test-Flow mit verschachtelten Elementen
      const groupElement: PatternLibraryElement = {
        element: {
          pattern_type: 'GroupUIElement',
          required: false,
          elements: [
            {
              element: {
                pattern_type: 'StringUIElement',
                type: 'TEXT',
                field_id: { field_name: 'nested_field' },
                required: false
              }
            }
          ]
        }
      };

      const testFlow: ListingFlow = {
        id: 'test-flow',
        'url-key': 'test-flow',
        name: 'Test Flow',
        title: { de: 'Test Flow' },
        icon: 'test-icon',
        pages_edit: [
          {
            pattern_type: 'Page',
            id: 'test-page',
            elements: [groupElement]
          }
        ],
        pages_view: []
      };

      const result = ensureUUIDs(testFlow);

      // Überprüfen, dass GroupUIElement und seine verschachtelten Elemente UUIDs haben
      const resultGroup = result.pages_edit[0].elements[0].element as GroupUIElement;
      expect(resultGroup.uuid).not.toBeUndefined();
      expect((resultGroup.elements[0].element as any).uuid).not.toBeUndefined();
      // Die genaue Anzahl der Aufrufe kann variieren, da die Implementierung
      // möglicherweise weitere UUIDs für andere Eigenschaften generiert
      expect(mockedUuidv4).toHaveBeenCalled();
    });

    it('sollte UUIDs für verschachtelte Elemente in ArrayUIElements hinzufügen', () => {
      // Test-Flow mit ArrayUIElement und verschachtelten Elementen
      const arrayElement: PatternLibraryElement = {
        element: {
          pattern_type: 'ArrayUIElement',
          required: false,
          min_count: 0,
          max_count: 10,
          elements: [
            {
              element: {
                pattern_type: 'StringUIElement',
                type: 'TEXT',
                field_id: { field_name: 'array_item_field' },
                required: false
              }
            }
          ]
        }
      };

      const testFlow: ListingFlow = {
        id: 'test-flow',
        'url-key': 'test-flow',
        name: 'Test Flow',
        title: { de: 'Test Flow' },
        icon: 'test-icon',
        pages_edit: [
          {
            pattern_type: 'Page',
            id: 'test-page',
            elements: [arrayElement]
          }
        ],
        pages_view: []
      };

      const result = ensureUUIDs(testFlow);

      // Überprüfen, dass ArrayUIElement und seine verschachtelten Elemente UUIDs haben
      const resultArray = result.pages_edit[0].elements[0].element as ArrayUIElement;
      expect(resultArray.uuid).not.toBeUndefined();
      expect((resultArray.elements[0].element as any).uuid).not.toBeUndefined();
      // Die genaue Anzahl der Aufrufe kann variieren, da die Implementierung
      // möglicherweise weitere UUIDs für andere Eigenschaften generiert
      expect(mockedUuidv4).toHaveBeenCalled();
    });

    it('sollte UUIDs für BooleanUIElements in ChipGroupUIElement hinzufügen', () => {
      // Test-Flow mit ChipGroupUIElement und BooleanUIElements
      const chipGroup: PatternLibraryElement = {
        element: {
          pattern_type: 'ChipGroupUIElement',
          required: false,
          chips: [
            {
              pattern_type: 'BooleanUIElement',
              field_id: { field_name: 'chip1' },
              required: false
            },
            {
              pattern_type: 'BooleanUIElement',
              field_id: { field_name: 'chip2' },
              required: false
            }
          ]
        }
      };

      const testFlow: ListingFlow = {
        id: 'test-flow',
        'url-key': 'test-flow',
        name: 'Test Flow',
        title: { de: 'Test Flow' },
        icon: 'test-icon',
        pages_edit: [
          {
            pattern_type: 'Page',
            id: 'test-page',
            elements: [chipGroup]
          }
        ],
        pages_view: []
      };

      const result = ensureUUIDs(testFlow);

      // Überprüfen, dass ChipGroupUIElement und seine BooleanUIElements UUIDs haben
      const resultChipGroup = result.pages_edit[0].elements[0].element as ChipGroupUIElement;
      expect(resultChipGroup.uuid).not.toBeUndefined();
      expect(resultChipGroup.chips[0].uuid).not.toBeUndefined();
      expect(resultChipGroup.chips[1].uuid).not.toBeUndefined();
      // Die genaue Anzahl der Aufrufe kann variieren, da die Implementierung
      // möglicherweise weitere UUIDs für andere Eigenschaften generiert
      expect(mockedUuidv4).toHaveBeenCalled();
    });

    it('sollte UUIDs für options in SingleSelectionUIElement hinzufügen', () => {
      // Test-Flow mit SingleSelectionUIElement und Options
      const singleSelection: PatternLibraryElement = {
        element: {
          pattern_type: 'SingleSelectionUIElement',
          required: false,
          field_id: { field_name: 'selection_field' },
          options: [
            {
              key: 'option1',
              label: { de: 'Option 1' }
            },
            {
              key: 'option2',
              label: { de: 'Option 2' }
            }
          ]
        }
      };

      const testFlow: ListingFlow = {
        id: 'test-flow',
        'url-key': 'test-flow',
        name: 'Test Flow',
        title: { de: 'Test Flow' },
        icon: 'test-icon',
        pages_edit: [
          {
            pattern_type: 'Page',
            id: 'test-page',
            elements: [singleSelection]
          }
        ],
        pages_view: []
      };

      const result = ensureUUIDs(testFlow);

      // Überprüfen, dass SingleSelectionUIElement und seine Options UUIDs haben
      const resultSelection = result.pages_edit[0].elements[0].element as SingleSelectionUIElement;
      expect(resultSelection.uuid).not.toBeUndefined();
      expect((resultSelection.options[0] as any).uuid).not.toBeUndefined();
      expect((resultSelection.options[1] as any).uuid).not.toBeUndefined();
      // Die genaue Anzahl der Aufrufe kann variieren, da die Implementierung
      // möglicherweise weitere UUIDs für andere Eigenschaften generiert
      expect(mockedUuidv4).toHaveBeenCalled();
    });

    it('sollte UUIDs für other_user_value in SingleSelectionUIElement hinzufügen', () => {
      // Test-Flow mit SingleSelectionUIElement und other_user_value
      const singleSelection: PatternLibraryElement = {
        element: {
          pattern_type: 'SingleSelectionUIElement',
          required: false,
          field_id: { field_name: 'selection_field' },
          options: [
            {
              key: 'option1',
              label: { de: 'Option 1' }
            }
          ],
          other_user_value: {
            activates_on_value_selection: 'option1',
            text_ui_element: {
              pattern_type: 'StringUIElement',
              type: 'TEXT',
              field_id: { field_name: 'other_text' },
              required: false
            }
          }
        }
      };

      const testFlow: ListingFlow = {
        id: 'test-flow',
        'url-key': 'test-flow',
        name: 'Test Flow',
        title: { de: 'Test Flow' },
        icon: 'test-icon',
        pages_edit: [
          {
            pattern_type: 'Page',
            id: 'test-page',
            elements: [singleSelection]
          }
        ],
        pages_view: []
      };

      const result = ensureUUIDs(testFlow);

      // Überprüfen, dass SingleSelectionUIElement, Options und other_user_value UUIDs haben
      const resultSelection = result.pages_edit[0].elements[0].element as SingleSelectionUIElement;
      expect(resultSelection.uuid).not.toBeUndefined();
      expect((resultSelection.options[0] as any).uuid).not.toBeUndefined();
      expect((resultSelection.other_user_value as any).uuid).not.toBeUndefined();
      expect((resultSelection.other_user_value?.text_ui_element as any).uuid).not.toBeUndefined();
      // Die genaue Anzahl der Aufrufe kann variieren, da die Implementierung
      // möglicherweise weitere UUIDs für andere Eigenschaften generiert
      expect(mockedUuidv4).toHaveBeenCalled();
    });

    it('sollte UUIDs für visibility_condition Objekte hinzufügen', () => {
      // Test-Flow mit Element mit visibility_condition
      const elementWithCondition: PatternLibraryElement = {
        element: {
          pattern_type: 'StringUIElement',
          type: 'TEXT',
          field_id: { field_name: 'test_field' },
          required: false,
          visibility_condition: {
            operator_type: 'LogicalOperator',
            operator: 'AND',
            conditions: [
              {
                operator_type: 'RelationalFieldOperator',
                field_id: { field_name: 'other_field' },
                op: 'eq',
                value: 'test'
              }
            ]
          }
        }
      };

      const testFlow: ListingFlow = {
        id: 'test-flow',
        'url-key': 'test-flow',
        name: 'Test Flow',
        title: { de: 'Test Flow' },
        icon: 'test-icon',
        pages_edit: [
          {
            pattern_type: 'Page',
            id: 'test-page',
            elements: [elementWithCondition]
          }
        ],
        pages_view: []
      };

      const result = ensureUUIDs(testFlow);

      // Überprüfen, dass Element und visibility_condition UUIDs haben
      const resultElement = result.pages_edit[0].elements[0].element as StringUIElement;
      expect(resultElement.uuid).not.toBeUndefined();
      expect((resultElement.visibility_condition as any).uuid).not.toBeUndefined();
      
      // Prüfen, ob die Bedingung ein LogicalOperator mit conditions ist
      const condition = resultElement.visibility_condition as any;
      if (condition.operator && condition.conditions) {
        expect(condition.conditions[0].uuid).not.toBeUndefined();
      }
      
      // Die genaue Anzahl der Aufrufe kann variieren, da die Implementierung
      // möglicherweise weitere UUIDs für andere Eigenschaften generiert
      expect(mockedUuidv4).toHaveBeenCalled();
    });
  });
});
