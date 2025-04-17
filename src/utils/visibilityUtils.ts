import { VisibilityCondition, LogicalOperator, RelationalFieldOperator } from '../models/listingFlow';

/**
 * Evaluiert eine Visibility-Bedingung basierend auf den aktuellen Feldwerten.
 * 
 * @param condition Die zu evaluierende Visibility-Bedingung
 * @param fieldValues Ein Objekt mit den aktuellen Feldwerten, wobei der Schlüssel der field_name ist
 * @returns true, wenn die Bedingung erfüllt ist (Element soll sichtbar sein), sonst false
 */
export const evaluateVisibilityCondition = (
  condition: VisibilityCondition | undefined,
  fieldValues: Record<string, any>
): boolean => {
  // Wenn keine Bedingung vorhanden ist, ist das Element immer sichtbar
  if (!condition) {
    return true;
  }

  // Evaluiere je nach Operator-Typ
  switch (condition.operator_type) {
    case 'RFO': // Relationaler Feldoperator
      return evaluateRelationalFieldOperator(condition as RelationalFieldOperator, fieldValues);
    
    case 'LO': // Logischer Operator
      return evaluateLogicalOperator(condition as LogicalOperator, fieldValues);
    
    default:
      console.warn(`Unbekannter Operator-Typ: ${condition.operator_type}`);
      return true; // Im Zweifelsfall sichtbar machen
  }
};

/**
 * Evaluiert einen relationalen Feldoperator.
 */
const evaluateRelationalFieldOperator = (
  condition: RelationalFieldOperator,
  fieldValues: Record<string, any>
): boolean => {
  const { field_id, op, value, value_list } = condition;
  
  if (!field_id || !field_id.field_name) {
    console.warn('Ungültige Feld-ID in RelationalFieldOperator');
    return true;
  }
  
  const fieldName = field_id.field_name;
  const fieldValue = fieldValues[fieldName];
  
  // Wenn das Feld nicht existiert, ist die Bedingung nicht erfüllt
  if (fieldValue === undefined) {
    return false;
  }
  
  // Evaluiere je nach Operator
  switch (op) {
    case 'eq': // Gleich
      return fieldValue === value;
    
    case 'ne': // Ungleich
      return fieldValue !== value;
    
    case 'gt': // Größer als
      return fieldValue > value;
    
    case 'lt': // Kleiner als
      return fieldValue < value;
    
    case 'gte': // Größer oder gleich
      return fieldValue >= value;
    
    case 'lte': // Kleiner oder gleich
      return fieldValue <= value;
    
    case 'in': // In Liste
      return Array.isArray(value_list) && value_list.includes(fieldValue);
    
    case 'nin': // Nicht in Liste
      return Array.isArray(value_list) && !value_list.includes(fieldValue);
    
    default:
      console.warn(`Unbekannter Operator: ${op}`);
      return true;
  }
};

/**
 * Evaluiert einen logischen Operator.
 */
const evaluateLogicalOperator = (
  condition: LogicalOperator,
  fieldValues: Record<string, any>
): boolean => {
  const { operator, conditions } = condition;
  
  if (!Array.isArray(conditions) || conditions.length === 0) {
    console.warn('Ungültige oder leere Bedingungen in LogicalOperator');
    return true;
  }
  
  // Evaluiere je nach logischem Operator
  switch (operator) {
    case 'AND': // Alle Bedingungen müssen erfüllt sein
      return conditions.every(cond => evaluateVisibilityCondition(cond, fieldValues));
    
    case 'OR': // Mindestens eine Bedingung muss erfüllt sein
      return conditions.some(cond => evaluateVisibilityCondition(cond, fieldValues));
    
    case 'NOT': // Negation der ersten Bedingung
      return !evaluateVisibilityCondition(conditions[0], fieldValues);
    
    default:
      console.warn(`Unbekannter logischer Operator: ${operator}`);
      return true;
  }
};
