import { FileUIElement } from '../models/uiElements';
import { PatternLibraryElement } from '../models/listingFlow';

/**
 * Validierungsergebnis für FileUIElement
 */
export interface FileElementValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validiert ein FileUIElement auf Vollständigkeit und Korrektheit
 * 
 * @param element - Das zu validierende FileUIElement
 * @returns Validierungsergebnis mit Fehlern und Warnungen
 */
export function validateFileUIElement(element: FileUIElement): FileElementValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // KRITISCH: field_id muss vorhanden sein
  if (!element.field_id || !element.field_id.field_name) {
    errors.push('Fehlendes erforderliches Feld: field_id (eindeutige Identifikation des Elements)');
  }

  // KRITISCH: id_field_id muss vorhanden sein
  if (!element.id_field_id || !element.id_field_id.field_name) {
    errors.push('Fehlendes erforderliches Feld: id_field_id (Speicherort für Datei-IDs)');
  }

  // EMPFOHLEN: caption_field_id sollte vorhanden sein
  if (!element.caption_field_id || !element.caption_field_id.field_name) {
    warnings.push('Fehlendes empfohlenes Feld: caption_field_id (Speicherort für Bildunterschriften)');
  }

  // EMPFOHLEN: min_count sollte definiert sein
  if (element.min_count === undefined || element.min_count === null) {
    warnings.push('Fehlendes empfohlenes Feld: min_count (Mindestanzahl der Dateien, Standard: 0)');
  }

  // EMPFOHLEN: max_count sollte definiert sein
  if (element.max_count === undefined || element.max_count === null) {
    warnings.push('Fehlendes empfohlenes Feld: max_count (Höchstanzahl der Dateien, Standard: 1)');
  }

  // VALIDIERUNG: min_count <= max_count
  if (
    element.min_count !== undefined &&
    element.max_count !== undefined &&
    element.min_count > element.max_count
  ) {
    errors.push(`Ungültige Konfiguration: min_count (${element.min_count}) ist größer als max_count (${element.max_count})`);
  }

  // EMPFOHLEN: allowed_file_types sollte nicht leer sein
  if (!element.allowed_file_types || element.allowed_file_types.length === 0) {
    warnings.push('Keine erlaubten Dateitypen definiert (allowed_file_types ist leer). Alle Dateitypen werden akzeptiert.');
  }

  // EMPFOHLEN: title sollte vorhanden sein
  if (!element.title || (!element.title.de && !element.title.en)) {
    warnings.push('Fehlendes empfohlenes Feld: title (Titel des Elements)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validiert alle FileUIElements in einem Array von PatternLibraryElements (rekursiv)
 * 
 * @param elements - Array von PatternLibraryElements
 * @returns Array von Validierungsergebnissen mit Pfadinformationen
 */
export function validateAllFileUIElements(
  elements: PatternLibraryElement[],
  parentPath: string = ''
): Array<{ path: string; result: FileElementValidationResult }> {
  const results: Array<{ path: string; result: FileElementValidationResult }> = [];

  elements.forEach((item, index) => {
    const currentPath = parentPath ? `${parentPath}[${index}]` : `[${index}]`;
    const element = item.element;

    // Prüfe, ob es ein FileUIElement ist
    if (element.pattern_type === 'FileUIElement') {
      const validationResult = validateFileUIElement(element as FileUIElement);
      if (!validationResult.isValid || validationResult.warnings.length > 0) {
        results.push({
          path: currentPath,
          result: validationResult
        });
      }
    }

    // Rekursiv in verschachtelte Elemente schauen
    if ('elements' in element && Array.isArray(element.elements)) {
      const nestedResults = validateAllFileUIElements(
        element.elements as PatternLibraryElement[],
        currentPath
      );
      results.push(...nestedResults);
    }
  });

  return results;
}

/**
 * Repariert ein FileUIElement, indem fehlende erforderliche Felder hinzugefügt werden
 * 
 * @param element - Das zu reparierende FileUIElement
 * @returns Repariertes FileUIElement
 */
export function repairFileUIElement(element: FileUIElement): FileUIElement {
  const repaired = { ...element };

  // Füge field_id hinzu, falls fehlend
  if (!repaired.field_id || !repaired.field_id.field_name) {
    const uuid = crypto.randomUUID ? crypto.randomUUID() : generateFallbackUUID();
    repaired.field_id = {
      field_name: `fileuielement_${uuid}`
    };
  }

  // Füge id_field_id hinzu, falls fehlend
  if (!repaired.id_field_id || !repaired.id_field_id.field_name) {
    const fieldName = repaired.title?.de || repaired.title?.en || 'file';
    const sanitizedName = fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    repaired.id_field_id = {
      field_name: `${sanitizedName}_id`
    };
  }

  // Füge caption_field_id hinzu, falls fehlend
  if (!repaired.caption_field_id || !repaired.caption_field_id.field_name) {
    const fieldName = repaired.title?.de || repaired.title?.en || 'file';
    const sanitizedName = fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    repaired.caption_field_id = {
      field_name: `${sanitizedName}_caption`
    };
  }

  // Setze min_count, falls fehlend
  if (repaired.min_count === undefined || repaired.min_count === null) {
    repaired.min_count = 0;
  }

  // Setze max_count, falls fehlend
  if (repaired.max_count === undefined || repaired.max_count === null) {
    repaired.max_count = 10;
  }

  return repaired;
}

/**
 * Fallback UUID-Generator für Browser ohne crypto.randomUUID
 */
function generateFallbackUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

