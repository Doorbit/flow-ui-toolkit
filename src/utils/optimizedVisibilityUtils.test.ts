import { 
  evaluateVisibilityCondition, 
  extractRelevantFields, 
  createDependencyMap, 
  getElementsToReevaluate 
} from './optimizedVisibilityUtils';
import { VisibilityCondition, LogicalOperator, RelationalFieldOperator } from '../models/listingFlow';

describe('optimizedVisibilityUtils', () => {
  const mockFieldValues = {
    'test.field': 'test-value',
    'boolean.field': true,
    'number.field': 42,
    'object.field': { nested: 'value' },
    'array.field': [1, 2, 3]
  };

  describe('evaluateVisibilityCondition', () => {
    it('sollte true zurückgeben, wenn keine Bedingung gegeben ist', () => {
      const result = evaluateVisibilityCondition(undefined, {});
      expect(result).toBe(true);
    });

    it('sollte eq-Bedingung für String korrekt auswerten', () => {
      const condition: RelationalFieldOperator = {
        operator_type: 'RFO',
        field_id: { field_name: 'test.field' },
        op: 'eq',
        value: 'test-value'
      };
      
      const resultTrue = evaluateVisibilityCondition(condition, mockFieldValues);
      expect(resultTrue).toBe(true);
      
      const resultFalse = evaluateVisibilityCondition({
        ...condition,
        value: 'wrong-value'
      }, mockFieldValues);
      expect(resultFalse).toBe(false);
    });

    it('sollte AND-Bedingung korrekt auswerten', () => {
      const condition: LogicalOperator = {
        operator_type: 'LO',
        operator: 'AND',
        conditions: [
          {
            operator_type: 'RFO',
            field_id: { field_name: 'test.field' },
            op: 'eq',
            value: 'test-value'
          },
          {
            operator_type: 'RFO',
            field_id: { field_name: 'boolean.field' },
            op: 'eq',
            value: true
          }
        ]
      };
      
      const resultTrue = evaluateVisibilityCondition(condition, mockFieldValues);
      expect(resultTrue).toBe(true);
      
      const resultFalse = evaluateVisibilityCondition({
        ...condition,
        conditions: [
          {
            operator_type: 'RFO',
            field_id: { field_name: 'test.field' },
            op: 'eq',
            value: 'test-value'
          },
          {
            operator_type: 'RFO',
            field_id: { field_name: 'boolean.field' },
            op: 'eq',
            value: false
          }
        ]
      }, mockFieldValues);
      expect(resultFalse).toBe(false);
    });

    it('sollte Memoization korrekt anwenden', () => {
      const condition: RelationalFieldOperator = {
        operator_type: 'RFO',
        field_id: { field_name: 'test.field' },
        op: 'eq',
        value: 'test-value'
      };
      
      // Erste Auswertung
      const result1 = evaluateVisibilityCondition(condition, mockFieldValues);
      expect(result1).toBe(true);
      
      // Zweite Auswertung mit denselben Werten sollte aus dem Cache kommen
      const result2 = evaluateVisibilityCondition(condition, mockFieldValues);
      expect(result2).toBe(true);
      
      // Änderung eines irrelevanten Feldes sollte immer noch aus dem Cache kommen
      const result3 = evaluateVisibilityCondition(condition, {
        ...mockFieldValues,
        'irrelevant.field': 'new-value'
      });
      expect(result3).toBe(true);
      
      // Änderung eines relevanten Feldes sollte eine neue Auswertung auslösen
      const result4 = evaluateVisibilityCondition(condition, {
        ...mockFieldValues,
        'test.field': 'new-value'
      });
      expect(result4).toBe(false);
    });
  });

  describe('extractRelevantFields', () => {
    it('sollte ein leeres Array zurückgeben, wenn keine Bedingung gegeben ist', () => {
      const result = extractRelevantFields(undefined);
      expect(result).toEqual([]);
    });

    it('sollte alle relevanten Felder aus einer einfachen Bedingung extrahieren', () => {
      const condition: RelationalFieldOperator = {
        operator_type: 'RFO',
        field_id: { field_name: 'test.field' },
        op: 'eq',
        value: 'test-value'
      };
      
      const result = extractRelevantFields(condition);
      expect(result).toEqual(['test.field']);
    });

    it('sollte alle relevanten Felder aus einer komplexen Bedingung extrahieren', () => {
      const condition: LogicalOperator = {
        operator_type: 'LO',
        operator: 'AND',
        conditions: [
          {
            operator_type: 'RFO',
            field_id: { field_name: 'test.field' },
            op: 'eq',
            value: 'test-value'
          },
          {
            operator_type: 'RFO',
            field_id: { field_name: 'boolean.field' },
            op: 'eq',
            value: true
          },
          {
            operator_type: 'LO',
            operator: 'OR',
            conditions: [
              {
                operator_type: 'RFO',
                field_id: { field_name: 'number.field' },
                op: 'eq',
                value: 42
              },
              {
                operator_type: 'RFO',
                field_id: { field_name: 'test.field' }, // Duplikat
                op: 'ne',
                value: 'other-value'
              }
            ]
          }
        ]
      };
      
      const result = extractRelevantFields(condition);
      expect(result).toEqual(['test.field', 'boolean.field', 'number.field']);
    });
  });

  describe('createDependencyMap', () => {
    it('sollte eine leere Map zurückgeben, wenn keine Elemente gegeben sind', () => {
      const result = createDependencyMap([]);
      expect(result.size).toBe(0);
    });

    it('sollte eine korrekte Abhängigkeitskarte erstellen', () => {
      const elements = [
        {
          id: 'element1',
          visibility_condition: {
            operator_type: 'RFO',
            field_id: { field_name: 'field1' },
            op: 'eq',
            value: true
          } as RelationalFieldOperator
        },
        {
          id: 'element2',
          visibility_condition: {
            operator_type: 'LO',
            operator: 'AND',
            conditions: [
              {
                operator_type: 'RFO',
                field_id: { field_name: 'field1' },
                op: 'eq',
                value: true
              },
              {
                operator_type: 'RFO',
                field_id: { field_name: 'field2' },
                op: 'eq',
                value: 'value'
              }
            ]
          } as LogicalOperator
        },
        {
          id: 'element3',
          visibility_condition: {
            operator_type: 'RFO',
            field_id: { field_name: 'field3' },
            op: 'eq',
            value: 42
          } as RelationalFieldOperator
        }
      ];
      
      const result = createDependencyMap(elements);
      
      expect(result.size).toBe(3);
      expect(result.get('field1')).toEqual(['element1', 'element2']);
      expect(result.get('field2')).toEqual(['element2']);
      expect(result.get('field3')).toEqual(['element3']);
    });
  });

  describe('getElementsToReevaluate', () => {
    it('sollte ein leeres Array zurückgeben, wenn das Feld keine Abhängigkeiten hat', () => {
      const dependencyMap = new Map<string, string[]>();
      dependencyMap.set('field1', ['element1', 'element2']);
      
      const result = getElementsToReevaluate(dependencyMap, 'field2');
      expect(result).toEqual([]);
    });

    it('sollte alle abhängigen Elemente zurückgeben', () => {
      const dependencyMap = new Map<string, string[]>();
      dependencyMap.set('field1', ['element1', 'element2']);
      dependencyMap.set('field2', ['element3']);
      
      const result = getElementsToReevaluate(dependencyMap, 'field1');
      expect(result).toEqual(['element1', 'element2']);
    });
  });
});
