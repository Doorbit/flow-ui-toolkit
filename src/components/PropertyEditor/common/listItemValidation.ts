/**
 * Geteilte Validierung für Listen-Editoren (Auswahlfeld-Optionen, Chip-Gruppen-Chips, …).
 *
 * Beide Editor-Arten verwalten eine Liste von Einträgen mit einem eindeutigen Schlüssel
 * (SingleSelection: `option.key`; ChipGroup: `chip.field_id.field_name`). Doppelte oder leere
 * Schlüssel sind vertragskritisch — portal adressiert die Werte darüber. Diese Funktion
 * vereinheitlicht die Prüfung über alle Listen-Editoren.
 *
 * @param keys   Alle Schlüssel der Liste in Reihenfolge.
 * @param index  Index des zu prüfenden Schlüssels.
 * @param label  Bezeichnung des Schlüsselfeldes für die Fehlermeldung (Default „Schlüssel").
 * @returns Fehlertext oder `null`, wenn der Schlüssel gültig ist.
 */
export function getDuplicateKeyError(
  keys: Array<string | undefined>,
  index: number,
  label = 'Schlüssel'
): string | null {
  const key = (keys[index] || '').trim();
  if (!key) return `${label} darf nicht leer sein`;
  const duplicate = keys.some((k, i) => i !== index && (k || '').trim() === key);
  if (duplicate) return `${label} muss eindeutig sein`;
  return null;
}
