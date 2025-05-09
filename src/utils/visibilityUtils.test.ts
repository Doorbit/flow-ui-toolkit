import { evaluateVisibilityCondition } from './visibilityUtils';
import { VisibilityCondition, LogicalOperator, RelationalFieldOperator } from '../models/listingFlow';

describe('visibilityUtils', () => {
  describe('evaluateVisibilityCondition', () => {
    const mockFieldValues = {
      'test.field': 'test-value',
      'boolean.field': true,
      'number.field': 42,
      'object.field': { nested: 'value' },
      'array.field': [1, 2, 3]
    };

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

    it('sollte eq-Bedingung für Boolean korrekt auswerten', () => {
      const condition: RelationalFieldOperator = {
        operator_type: 'RFO',
        field_id: { field_name: 'boolean.field' },
        op: 'eq',
        value: true
      };
      
      const resultTrue = evaluateVisibilityCondition(condition, mockFieldValues);
      expect(resultTrue).toBe(true);
      
      const resultFalse = evaluateVisibilityCondition({
        ...condition,
        value: false
      }, mockFieldValues);
      expect(resultFalse).toBe(false);
    });

    it('sollte eq-Bedingung für Number korrekt auswerten', () => {
      const condition: RelationalFieldOperator = {
        operator_type: 'RFO',
        field_id: { field_name: 'number.field' },
        op: 'eq',
        value: 42
      };
      
      const resultTrue = evaluateVisibilityCondition(condition, mockFieldValues);
      expect(resultTrue).toBe(true);
      
      const resultFalse = evaluateVisibilityCondition({
        ...condition,
        value: 43
      }, mockFieldValues);
      expect(resultFalse).toBe(false);
    });

    it('sollte ne-Bedingung korrekt auswerten', () => {
      const condition: RelationalFieldOperator = {
        operator_type: 'RFO',
        field_id: { field_name: 'test.field' },
        op: 'ne',
        value: 'wrong-value'
      };
      
      const resultTrue = evaluateVisibilityCondition(condition, mockFieldValues);
      expect(resultTrue).toBe(true);
      
      const resultFalse = evaluateVisibilityCondition({
        ...condition,
        value: 'test-value'
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
      
      // Beide Bedingungen sind erfüllt
      const resultTrue = evaluateVisibilityCondition(condition, mockFieldValues);
      expect(resultTrue).toBe(true);
      
      // Eine Bedingung ist nicht erfüllt
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

    it('sollte OR-Bedingung korrekt auswerten', () => {
      const condition: LogicalOperator = {
        operator_type: 'LO',
        operator: 'OR',
        conditions: [
          {
            operator_type: 'RFO',
            field_id: { field_name: 'test.field' },
            op: 'eq',
            value: 'wrong-value'
          },
          {
            operator_type: 'RFO',
            field_id: { field_name: 'boolean.field' },
            op: 'eq',
            value: true
          }
        ]
      };
      
      // Eine Bedingung ist erfüllt
      const resultTrue = evaluateVisibilityCondition(condition, mockFieldValues);
      expect(resultTrue).toBe(true);
      
      // Keine Bedingung ist erfüllt
      const resultFalse = evaluateVisibilityCondition({
        ...condition,
        conditions: [
          {
            operator_type: 'RFO',
            field_id: { field_name: 'test.field' },
            op: 'eq',
            value: 'wrong-value'
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

    it('sollte verschachtelte Bedingungen korrekt auswerten', () => {
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
            operator_type: 'LO',
            operator: 'OR',
            conditions: [
              {
                operator_type: 'RFO',
                field_id: { field_name: 'boolean.field' },
                op: 'eq',
                value: false // nicht erfüllt
              },
              {
                operator_type: 'RFO',
                field_id: { field_name: 'number.field' },
                op: 'eq',
                value: 42 // erfüllt
              }
            ]
          }
        ]
      };
      
      const result = evaluateVisibilityCondition(condition, mockFieldValues);
      expect(result).toBe(true);
    });

    it('sollte false zurückgeben, wenn das Feld nicht existiert', () => {
      const condition: RelationalFieldOperator = {
        operator_type: 'RFO',
        field_id: { field_name: 'non.existent.field' },
        op: 'eq',
        value: 'anything'
      };
      
      const result = evaluateVisibilityCondition(condition, mockFieldValues);
      expect(result).toBe(false);
    });
  });
});
