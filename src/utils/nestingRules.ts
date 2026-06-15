/**
 * Verschachtelungsregeln für Flow-Elemente.
 *
 * Single Source of Truth dafür, welche Element-Typen in welchen Containern erlaubt sind.
 * Wird sowohl beim tatsächlichen Hinzufügen (App.tsx) als auch im Element-Typ-Dialog
 * (zum Vorab-Deaktivieren unerlaubter Optionen) verwendet.
 */

export interface NestingRuleResult {
  allowed: boolean;
  message: string;
}

/**
 * Prüft, ob ein Element-Typ (pattern_type) in einem Eltern-Container (pattern_type)
 * erlaubt ist. Gibt bei Verbot eine erklärende Meldung zurück.
 */
export function isElementAllowedInParent(elementType: string, parentType: string): NestingRuleResult {
  // ChipGroup: nur Boolean-Elemente
  if (parentType === 'ChipGroupUIElement') {
    return {
      allowed: elementType === 'BooleanUIElement',
      message: 'Nur Boolean-Elemente können in Chip-Gruppen hinzugefügt werden',
    };
  }

  // Array: keine weiteren Arrays oder komplexen Elemente
  if (parentType === 'ArrayUIElement') {
    const isComplex = ['ArrayUIElement', 'GroupUIElement', 'CustomUIElement', 'ChipGroupUIElement'].includes(elementType);
    return {
      allowed: !isComplex,
      message: 'Arrays dürfen keine weiteren Arrays oder komplexe Elemente enthalten',
    };
  }

  // Gruppe: keine weiteren Gruppen
  if (parentType === 'GroupUIElement') {
    return {
      allowed: elementType !== 'GroupUIElement',
      message: 'Gruppen dürfen keine weiteren Gruppen enthalten',
    };
  }

  return { allowed: true, message: '' };
}

/**
 * Bildet die Dialog-Typen (z. B. `CustomUIElement_SCANNER`) auf den tatsächlichen
 * `pattern_type` ab, der beim Erstellen entsteht (`CustomUIElement`). Für die
 * Regelprüfung im Dialog nötig, da dort die spezifischen Custom-Varianten gelistet sind.
 */
export function resolvePatternType(dialogType: string): string {
  return dialogType.startsWith('CustomUIElement_') ? 'CustomUIElement' : dialogType;
}
