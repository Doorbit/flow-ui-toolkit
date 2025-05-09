import { toBuilderFormat, fromBuilderFormat, BuilderCondition } from './visibilityConverters';
import { LogicalOperator, RelationalFieldOperator } from '../models/listingFlow';

describe('visibilityConverters', () => {
  describe('toBuilderFormat', () => {
    it('should convert a simple RelationalFieldOperator to Builder format', () => {
      // arrange
      const rfo: RelationalFieldOperator = {
        operator_type: 'RFO',
        field_id: { field_name: 'testField' },
        op: 'eq',
        value: true
      };

      // act
      const result = toBuilderFormat(rfo);

      // assert
      expect(result).toBeDefined();
      if (result) {
        expect(result.operator).toBe('AND');
        expect(result.conditions).toHaveLength(1);
        expect(result.conditions[0].field).toBe('testField');
        expect(result.conditions[0].operator).toBe('==');
        expect(result.conditions[0].value).toBe(true);
      }
    });

    it('should convert a LogicalOperator (OR) with multiple conditions to Builder format', () => {
      // arrange
      const lo: LogicalOperator = {
        operator_type: 'LO',
        operator: 'OR',
        conditions: [
          {
            operator_type: 'RFO',
            field_id: { field_name: 'pv_installed' },
            op: 'eq',
            value: true
          } as RelationalFieldOperator,
          {
            operator_type: 'RFO',
            field_id: { field_name: 'solar_thermal_installed' },
            op: 'eq',
            value: true
          } as RelationalFieldOperator
        ]
      };

      // act
      const result = toBuilderFormat(lo);

      // assert
      expect(result).toBeDefined();
      if (result) {
        expect(result.operator).toBe('OR');
        expect(result.conditions).toHaveLength(2);
        expect(result.conditions[0].field).toBe('pv_installed');
        expect(result.conditions[0].operator).toBe('==');
        expect(result.conditions[0].value).toBe(true);
        expect(result.conditions[1].field).toBe('solar_thermal_installed');
        expect(result.conditions[1].operator).toBe('==');
        expect(result.conditions[1].value).toBe(true);
      }
    });

    it('should return undefined for undefined input', () => {
      // act
      const result = toBuilderFormat(undefined);

      // assert
      expect(result).toBeUndefined();
    });
  });

  describe('fromBuilderFormat', () => {
    it('should convert a simple Builder condition to RelationalFieldOperator', () => {
      // arrange
      const builderCondition: BuilderCondition = {
        operator: 'AND',
        conditions: [
          { field: 'testField', operator: '==', value: true }
        ]
      };

      // act
      const result = fromBuilderFormat(builderCondition);

      // assert
      expect(result).toBeDefined();
      if (result) {
        expect(result.operator_type).toBe('RFO');
        const rfo = result as RelationalFieldOperator;
        expect(rfo.field_id.field_name).toBe('testField');
        expect(rfo.op).toBe('eq');
        expect(rfo.value).toBe(true);
      }
    });

    it('should convert a complex Builder condition (OR) to LogicalOperator', () => {
      // arrange
      const builderCondition: BuilderCondition = {
        operator: 'OR',
        conditions: [
          { field: 'pv_installed', operator: '==', value: true },
          { field: 'solar_thermal_installed', operator: '==', value: true }
        ]
      };

      // act
      const result = fromBuilderFormat(builderCondition);

      // assert
      expect(result).toBeDefined();
      if (result) {
        expect(result.operator_type).toBe('LO');
        const lo = result as LogicalOperator;
        expect(lo.operator).toBe('OR');
        expect(lo.conditions).toHaveLength(2);

        expect(lo.conditions[0].operator_type).toBe('RFO');
        const rfo1 = lo.conditions[0] as RelationalFieldOperator;
        expect(rfo1.field_id.field_name).toBe('pv_installed');
        expect(rfo1.op).toBe('eq');
        expect(rfo1.value).toBe(true);

        expect(lo.conditions[1].operator_type).toBe('RFO');
        const rfo2 = lo.conditions[1] as RelationalFieldOperator;
        expect(rfo2.field_id.field_name).toBe('solar_thermal_installed');
        expect(rfo2.op).toBe('eq');
        expect(rfo2.value).toBe(true);
      }
    });

    it('should return undefined for undefined input', () => {
      // act
      const result = fromBuilderFormat(undefined);

      // assert
      expect(result).toBeUndefined();
    });
  });

  describe('Scenario: Renewable Energy Page Visibility', () => {
    it('should handle the case where "Renewable Energy" page is visible if PV or Solar Thermal is installed', () => {
      // arrange - erstelle eine OR-Bedingung für PV ODER Solar Thermal
      const visibilityCondition: LogicalOperator = {
        operator_type: 'LO',
        operator: 'OR',
        conditions: [
          {
            operator_type: 'RFO',
            field_id: { field_name: 'pv_installed' },
            op: 'eq',
            value: true
          } as RelationalFieldOperator,
          {
            operator_type: 'RFO',
            field_id: { field_name: 'solar_thermal_installed' },
            op: 'eq',
            value: true
          } as RelationalFieldOperator
        ]
      };

      // act - konvertiere hin und zurück
      const builderFormat = toBuilderFormat(visibilityCondition);
      const backToVisibilityCondition = fromBuilderFormat(builderFormat);

      // assert - prüfe, ob die Konvertierung beibehalten wird
      expect(backToVisibilityCondition).toBeDefined();
      if (backToVisibilityCondition) {
        expect(backToVisibilityCondition.operator_type).toBe('LO');
        const lo = backToVisibilityCondition as LogicalOperator;
        expect(lo.operator).toBe('OR');
        expect(lo.conditions).toHaveLength(2);

        const rfo1 = lo.conditions[0] as RelationalFieldOperator;
        expect(rfo1.field_id.field_name).toBe('pv_installed');
        expect(rfo1.op).toBe('eq');

        const rfo2 = lo.conditions[1] as RelationalFieldOperator;
        expect(rfo2.field_id.field_name).toBe('solar_thermal_installed');
        expect(rfo2.op).toBe('eq');
      }
    });
  });
});
