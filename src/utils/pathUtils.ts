/**
 * Vergleicht zwei Pfade auf Gleichheit
 * @param path1 Erster Pfad
 * @param path2 Zweiter Pfad
 * @returns true, wenn die Pfade gleich sind, sonst false
 */
export const arePathsEqual = (path1: number[], path2: number[]): boolean => {
  if (path1.length !== path2.length) {
    return false;
  }
  
  return path1.every((value, index) => value === path2[index]);
};

/**
 * Prüft, ob ein Pfad ein Unterpfad eines anderen Pfades ist
 * @param parentPath Der übergeordnete Pfad
 * @param childPath Der zu prüfende Unterpfad
 * @returns true, wenn childPath ein Unterpfad von parentPath ist, sonst false
 */
export const isSubPath = (parentPath: number[], childPath: number[]): boolean => {
  if (childPath.length <= parentPath.length) {
    return false;
  }
  
  return parentPath.every((value, index) => value === childPath[index]);
};

/**
 * Prüft, ob ein Pfad ein direkter Unterpfad eines anderen Pfades ist
 * @param parentPath Der übergeordnete Pfad
 * @param childPath Der zu prüfende Unterpfad
 * @returns true, wenn childPath ein direkter Unterpfad von parentPath ist, sonst false
 */
export const isDirectSubPath = (parentPath: number[], childPath: number[]): boolean => {
  return isSubPath(parentPath, childPath) && childPath.length === parentPath.length + 1;
};

/**
 * Konvertiert einen Pfad in einen String
 * @param path Der zu konvertierende Pfad
 * @returns Der Pfad als String
 */
export const pathToString = (path: number[]): string => {
  return path.join('.');
};

/**
 * Konvertiert einen String in einen Pfad
 * @param pathString Der zu konvertierende String
 * @returns Der Pfad als Array von Zahlen
 */
export const stringToPath = (pathString: string): number[] => {
  if (!pathString) {
    return [];
  }
  return pathString
    .split('.')
    .filter(segment => segment !== '')
    .map(Number);
};

/**
 * Holt den übergeordneten Pfad eines Pfades
 * @param path Der Pfad
 * @returns Der übergeordnete Pfad oder ein leeres Array, wenn der Pfad keine übergeordneten Elemente hat
 */
export const getParentPath = (path: number[]): number[] => {
  if (path.length <= 1) {
    return [];
  }
  
  return path.slice(0, -1);
};

/**
 * Holt den Index des letzten Elements im Pfad
 * @param path Der Pfad
 * @returns Der Index des letzten Elements oder -1, wenn der Pfad leer ist
 */
export const getLastIndex = (path: number[]): number => {
  if (path.length === 0) {
    return -1;
  }
  
  return path[path.length - 1];
};
