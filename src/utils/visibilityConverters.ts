import { VisibilityCondition, LogicalOperator, RelationalFieldOperator } from '../models/listingFlow';

/**
 * Typ-Definition für das Format, das von VisibilityConditionBuilder verwendet wird
 */
export interface BuilderCondition {
  operator: 'AND' | 'OR' | 'NOT';
  conditions: BuilderConditionItem[];
}

export interface BuilderConditionItem {
  field: string;
  operator: string;
  value: any;
}

/**
 * Konvertiert eine VisibilityCondition aus dem Modell-Format in das Format für den VisibilityConditionBuilder
 *
 * @param condition Die VisibilityCondition im Modell-Format
 * @returns Die Bedingung im Builder-Format oder undefined
 */
export const toBuilderFormat = (condition: VisibilityCondition | undefined): BuilderCondition | undefined => {
  if (!condition) {
    return undefined;
  }

  // Für einfache RelationalFieldOperator
  if (condition.operator_type === 'RFO') {
    const rfo = condition as RelationalFieldOperator;
    const fieldName = rfo.field_id?.field_name || '';

    // Konvertiere den Operator
    let operator: string;
    switch(rfo.op) {
      case 'eq': operator = '=='; break;
      case 'ne': operator = '!='; break;
      case 'gt': operator = '>'; break;
      case 'lt': operator = '<'; break;
      case 'gte': operator = '>='; break;
      case 'lte': operator = '<='; break;
      default: operator = '=='; // Default-Fall
    }

    return {
      operator: 'AND', // Default-mäßig AND für einzelne Bedingungen
      conditions: [{
        field: fieldName,
        operator: operator,
        value: rfo.value
      }]
    };
  }

  // Für LogicalOperator
  if (condition.operator_type === 'LO') {
    const lo = condition as LogicalOperator;
    const builderConditions: BuilderConditionItem[] = [];

    // Konvertiere alle enthaltenen Bedingungen
    lo.conditions.forEach(subCondition => {
      if (subCondition.operator_type === 'RFO') {
        const rfo = subCondition as RelationalFieldOperator;
        const fieldName = rfo.field_id?.field_name || '';

        // Konvertiere den Operator
        let operator: string;
        switch(rfo.op) {
          case 'eq': operator = '=='; break;
          case 'ne': operator = '!='; break;
          case 'gt': operator = '>'; break;
          case 'lt': operator = '<'; break;
          case 'gte': operator = '>='; break;
          case 'lte': operator = '<='; break;
          default: operator = '=='; // Default-Fall
        }

        builderConditions.push({
          field: fieldName,
          operator: operator,
          value: rfo.value
        });
      }
      // Hinweis: Verschachtelte logische Operatoren werden nicht unterstützt
    });

    return {
      operator: lo.operator, // 'AND' oder 'OR'
      conditions: builderConditions
    };
  }

  // Für andere Typen (z.B. RelationalContextOperator) nicht unterstützt
  console.warn(`Nicht unterstützter Operator-Typ: ${condition.operator_type}`);
  return undefined;
};

/**
 * Konvertiert eine Bedingung aus dem VisibilityConditionBuilder-Format in das VisibilityCondition-Format für das Modell
 *
 * @param builderCondition Die Bedingung im Builder-Format
 * @returns Die VisibilityCondition im Modell-Format oder undefined
 */
export const fromBuilderFormat = (builderCondition: BuilderCondition | undefined): VisibilityCondition | undefined => {
  if (!builderCondition || !builderCondition.conditions || builderCondition.conditions.length === 0) {
    return undefined;
  }

  // Für einfache Bedingungen (nur eine Bedingung)
  if (builderCondition.conditions.length === 1) {
    const condition = builderCondition.conditions[0];

    // Konvertiere den Operator
    let op: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' = 'eq';
    switch(condition.operator) {
      case '==': op = 'eq'; break;
      case '!=': op = 'ne'; break;
      case '>': op = 'gt'; break;
      case '<': op = 'lt'; break;
      case '>=': op = 'gte'; break;
      case '<=': op = 'lte'; break;
      // Andere Operatoren wie 'contains', 'startsWith', etc. werden nicht direkt unterstützt
      default: op = 'eq'; // Default-Fall
    }

    return {
      operator_type: 'RFO',
      field_id: { field_name: condition.field },
      op: op,
      value: condition.value
    } as RelationalFieldOperator;
  }

  // Für mehrere Bedingungen (LogicalOperator)
  const conditions: VisibilityCondition[] = builderCondition.conditions.map(condition => {
    // Konvertiere den Operator
    let op: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' = 'eq';
    switch(condition.operator) {
      case '==': op = 'eq'; break;
      case '!=': op = 'ne'; break;
      case '>': op = 'gt'; break;
      case '<': op = 'lt'; break;
      case '>=': op = 'gte'; break;
      case '<=': op = 'lte'; break;
      default: op = 'eq'; // Default-Fall
    }

    return {
      operator_type: 'RFO',
      field_id: { field_name: condition.field },
      op: op,
      value: condition.value
    } as RelationalFieldOperator;
  });

  return {
    operator_type: 'LO',
    operator: builderCondition.operator as 'AND' | 'OR',
    conditions: conditions
  } as LogicalOperator;
};
