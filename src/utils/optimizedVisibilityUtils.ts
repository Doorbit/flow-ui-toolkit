import { VisibilityCondition, LogicalOperator, RelationalFieldOperator } from '../models/listingFlow';

// Implementiere eine eigene Memoize-Funktion anstatt Lodash zu verwenden
function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => any
): T {
  const cache = new Map<string, any>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Extrahiert alle Feldnamen, die in einer Visibility-Bedingung verwendet werden.
 *
 * @param condition Die Visibility-Bedingung
 * @returns Ein Array mit allen verwendeten Feldnamen
 */
export const extractRelevantFields = (condition: VisibilityCondition | undefined): string[] => {
  if (!condition) {
    return [];
  }

  const fieldNames: string[] = [];

  // Rekursive Funktion zum Extrahieren von Feldnamen
  const extractFields = (cond: VisibilityCondition): void => {
    if (cond.operator_type === 'RFO') {
      const rfo = cond as RelationalFieldOperator;
      if (rfo.field_id && rfo.field_id.field_name) {
        fieldNames.push(rfo.field_id.field_name);
      }
    } else if (cond.operator_type === 'LO') {
      const lo = cond as LogicalOperator;
      if (lo.conditions && Array.isArray(lo.conditions)) {
        lo.conditions.forEach(subCond => extractFields(subCond));
      }
    }
  };

  extractFields(condition);
  // Entferne Duplikate ohne Spread-Operator
  return Array.from(new Set(fieldNames));
};

/**
 * Erstellt einen Cache-Schlüssel für die Memoization basierend auf der Bedingung und relevanten Feldwerten.
 *
 * @param condition Die Visibility-Bedingung
 * @param fieldValues Alle Feldwerte
 * @returns Ein String, der als Cache-Schlüssel verwendet werden kann
 */
const createCacheKey = (condition: VisibilityCondition | undefined, fieldValues: Record<string, any>): string => {
  if (!condition) {
    return 'undefined';
  }

  const relevantFieldNames = extractRelevantFields(condition);
  const relevantValues = relevantFieldNames.map(name => fieldValues[name]);

  return JSON.stringify({
    condition,
    relevantValues: Object.fromEntries(relevantFieldNames.map((name, index) => [name, relevantValues[index]]))
  });
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
  fieldValues: Record<string, any>,
  evaluateFunc: (cond: VisibilityCondition | undefined, values: Record<string, any>) => boolean
): boolean => {
  const { operator, conditions } = condition;

  if (!Array.isArray(conditions) || conditions.length === 0) {
    console.warn('Ungültige oder leere Bedingungen in LogicalOperator');
    return true;
  }

  // Evaluiere je nach logischem Operator
  switch (operator) {
    case 'AND': // Alle Bedingungen müssen erfüllt sein
      return conditions.every(cond => evaluateFunc(cond, fieldValues));

    case 'OR': // Mindestens eine Bedingung muss erfüllt sein
      return conditions.some(cond => evaluateFunc(cond, fieldValues));

    case 'NOT': // Negation der ersten Bedingung
      return !evaluateFunc(conditions[0], fieldValues);

    default:
      console.warn(`Unbekannter logischer Operator: ${operator}`);
      return true;
  }
};

/**
 * Nicht-memoized Version der Evaluierungsfunktion.
 */
const evaluateVisibilityConditionInternal = (
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
      return evaluateLogicalOperator(
        condition as LogicalOperator,
        fieldValues,
        evaluateVisibilityConditionInternal
      );

    default:
      console.warn(`Unbekannter Operator-Typ: ${condition.operator_type}`);
      return true; // Im Zweifelsfall sichtbar machen
  }
};

/**
 * Memoized Version der Evaluierungsfunktion.
 * Verwendet einen benutzerdefinierten Cache-Schlüssel, der nur relevante Feldwerte berücksichtigt.
 */
export const evaluateVisibilityCondition = memoize(
  evaluateVisibilityConditionInternal,
  createCacheKey
);

/**
 * Erstellt eine Abhängigkeitskarte für alle Elemente basierend auf ihren Visibility-Bedingungen.
 *
 * @param elements Array von Elementen mit Visibility-Bedingungen
 * @returns Eine Map, die für jedes Feld die IDs der Elemente enthält, die von diesem Feld abhängen
 */
export const createDependencyMap = (elements: Array<{ id: string, visibility_condition?: VisibilityCondition }>): Map<string, string[]> => {
  const dependencyMap = new Map<string, string[]>();

  elements.forEach(element => {
    if (element.visibility_condition) {
      const relevantFields = extractRelevantFields(element.visibility_condition);

      relevantFields.forEach(fieldName => {
        if (!dependencyMap.has(fieldName)) {
          dependencyMap.set(fieldName, []);
        }

        dependencyMap.get(fieldName)!.push(element.id);
      });
    }
  });

  return dependencyMap;
};

/**
 * Findet alle Elemente, die neu evaluiert werden müssen, wenn sich ein bestimmtes Feld ändert.
 *
 * @param dependencyMap Die Abhängigkeitskarte
 * @param changedFieldName Der Name des geänderten Feldes
 * @returns Ein Array mit den IDs der Elemente, die neu evaluiert werden müssen
 */
export const getElementsToReevaluate = (dependencyMap: Map<string, string[]>, changedFieldName: string): string[] => {
  return dependencyMap.get(changedFieldName) || [];
};
