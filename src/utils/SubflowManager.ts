import { PatternLibraryElement } from '../models/listingFlow';
import {
  CustomUIElement,
  SubFlow,
  GroupUIElement,
  ChipGroupUIElement,
  BooleanUIElement
} from '../models/uiElements';

/**
 * Aktualisiert ein Element innerhalb eines Subflows mit den angegebenen Änderungen.
 *
 * @param customElement Das CustomUIElement, das den Subflow enthält
 * @param subflowIndex Der Index des Subflows
 * @param elementIndex Der Index des Elements innerhalb des Subflows
 * @param updates Die Änderungen, die auf das Element angewendet werden sollen
 * @returns Das aktualisierte CustomUIElement
 */
export const updateSubflowElement = (
  customElement: CustomUIElement,
  subflowIndex: number,
  elementIndex: number,
  updates: Record<string, any>
): CustomUIElement => {
  if (!customElement.sub_flows || !customElement.sub_flows[subflowIndex]) {
    return customElement;
  }

  const updatedSubflows = [...customElement.sub_flows];
  const updatedElements = [...updatedSubflows[subflowIndex].elements];

  updatedElements[elementIndex] = {
    ...updatedElements[elementIndex],
    element: {
      ...updatedElements[elementIndex].element,
      ...updates
    }
  };

  updatedSubflows[subflowIndex] = {
    ...updatedSubflows[subflowIndex],
    elements: updatedElements
  };

  return {
    ...customElement,
    sub_flows: updatedSubflows
  };
};

/**
 * Aktualisiert eine bestimmte Eigenschaft eines Elements innerhalb eines Subflows.
 *
 * @param customElement Das CustomUIElement, das den Subflow enthält
 * @param subflowIndex Der Index des Subflows
 * @param elementIndex Der Index des Elements innerhalb des Subflows
 * @param propertyPath Der Pfad zur Eigenschaft, die aktualisiert werden soll (z.B. 'title', 'visibility_condition')
 * @param value Der neue Wert für die Eigenschaft
 * @returns Das aktualisierte CustomUIElement
 */
export const updateSubflowElementProperty = (
  customElement: CustomUIElement,
  subflowIndex: number,
  elementIndex: number,
  propertyPath: string,
  value: any
): CustomUIElement => {
  if (!customElement.sub_flows || !customElement.sub_flows[subflowIndex]) {
    return customElement;
  }

  const updatedSubflows = [...customElement.sub_flows];
  const updatedElements = [...updatedSubflows[subflowIndex].elements];

  // Aktualisiere die angegebene Eigenschaft
  const updatedElement = { ...updatedElements[elementIndex] };

  // Verarbeite verschachtelte Pfade (z.B. 'title.de')
  const pathParts = propertyPath.split('.');
  let current: any = updatedElement.element;
  const lastPart = pathParts.pop()!;

  // Navigiere zum letzten Objekt im Pfad
  for (const part of pathParts) {
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }

  // Setze den Wert
  current[lastPart] = value;

  updatedElements[elementIndex] = updatedElement;

  updatedSubflows[subflowIndex] = {
    ...updatedSubflows[subflowIndex],
    elements: updatedElements
  };

  return {
    ...customElement,
    sub_flows: updatedSubflows
  };
};

/**
 * Entfernt eine Eigenschaft eines Elements innerhalb eines Subflows.
 *
 * @param customElement Das CustomUIElement, das den Subflow enthält
 * @param subflowIndex Der Index des Subflows
 * @param elementIndex Der Index des Elements innerhalb des Subflows
 * @param propertyName Der Name der Eigenschaft, die entfernt werden soll
 * @returns Das aktualisierte CustomUIElement
 */
export const removeSubflowElementProperty = (
  customElement: CustomUIElement,
  subflowIndex: number,
  elementIndex: number,
  propertyName: string
): CustomUIElement => {
  if (!customElement.sub_flows || !customElement.sub_flows[subflowIndex]) {
    return customElement;
  }

  const updatedSubflows = [...customElement.sub_flows];
  const updatedElements = [...updatedSubflows[subflowIndex].elements];

  // Erstelle eine Kopie des Elements ohne die angegebene Eigenschaft
  const { [propertyName]: _, ...restElement } = updatedElements[elementIndex].element;

  updatedElements[elementIndex] = {
    ...updatedElements[elementIndex],
    element: restElement
  };

  updatedSubflows[subflowIndex] = {
    ...updatedSubflows[subflowIndex],
    elements: updatedElements
  };

  return {
    ...customElement,
    sub_flows: updatedSubflows
  };
};

/**
 * Findet einen Subflow nach seinem Typ.
 *
 * @param customElement Das CustomUIElement, das die Subflows enthält
 * @param subflowType Der Typ des gesuchten Subflows (z.B. 'POI', 'ROOM')
 * @returns Der gefundene Subflow und sein Index oder null, wenn kein Subflow gefunden wurde
 */
export const findSubflowByType = (
  customElement: CustomUIElement,
  subflowType: string
): { subflow: SubFlow, index: number } | null => {
  if (!customElement.sub_flows) {
    return null;
  }

  const index = customElement.sub_flows.findIndex(sf => sf.type === subflowType);

  if (index === -1) {
    return null;
  }

  return {
    subflow: customElement.sub_flows[index],
    index
  };
};

/**
 * Filtert Subflows nach ihren Typen.
 *
 * @param customElement Das CustomUIElement, das die Subflows enthält
 * @param excludeTypes Ein Array von Subflow-Typen, die ausgeschlossen werden sollen
 * @returns Ein Array von Subflows, die nicht zu den ausgeschlossenen Typen gehören
 */
export const filterSubflows = (
  customElement: CustomUIElement,
  excludeTypes: string[]
): SubFlow[] => {
  if (!customElement.sub_flows) {
    return [];
  }

  return customElement.sub_flows.filter(sf => !excludeTypes.includes(sf.type));
};

/**
 * Repräsentiert einen Pfad zu einem Element innerhalb eines Subflows.
 * Der Pfad besteht aus einer Reihe von Indizes, die die Position des Elements in der Hierarchie angeben.
 */
export interface ElementPath {
  subflowIndex: number;
  path: number[];
}

/**
 * Findet ein Element basierend auf einem Pfad von Indizes.
 *
 * @param customElement Das CustomUIElement, das den Subflow enthält
 * @param path Der Pfad zum Element (subflowIndex und Array von Indizes)
 * @returns Das gefundene Element oder null, wenn kein Element gefunden wurde
 */
export const findElementByPath = (
  customElement: CustomUIElement,
  path: ElementPath
): PatternLibraryElement | null => {
  if (!customElement.sub_flows || !customElement.sub_flows[path.subflowIndex]) {
    return null;
  }

  let currentElements = customElement.sub_flows[path.subflowIndex].elements;
  let currentElement: PatternLibraryElement | null = null;

  // Navigiere durch den Pfad
  for (let i = 0; i < path.path.length; i++) {
    const index = path.path[i];

    if (!currentElements || !currentElements[index]) {
      return null;
    }

    currentElement = currentElements[index];

    // Wenn wir noch nicht am Ende des Pfads sind, gehe tiefer
    if (i < path.path.length - 1 && currentElement) {
      // Prüfe, ob das aktuelle Element verschachtelte Elemente hat
      if (currentElement.element.pattern_type === 'GroupUIElement') {
        currentElements = (currentElement.element as GroupUIElement).elements;
      } else if (currentElement.element.pattern_type === 'ArrayUIElement') {
        currentElements = (currentElement.element as any).elements;
      } else if (currentElement.element.pattern_type === 'ChipGroupUIElement') {
        // ChipGroupUIElement hat keine elements, sondern chips
        // Wir müssen die chips als "Elemente" behandeln
        const chipGroup = currentElement.element as ChipGroupUIElement;
        // Konvertiere chips zu PatternLibraryElement[]
        currentElements = chipGroup.chips.map((chip: any) => ({ element: chip }));
      } else {
        // Das Element hat keine verschachtelten Elemente
        return null;
      }
    }
  }

  return currentElement;
};

/**
 * Aktualisiert ein Element basierend auf einem Pfad von Indizes.
 *
 * @param customElement Das CustomUIElement, das den Subflow enthält
 * @param path Der Pfad zum Element (subflowIndex und Array von Indizes)
 * @param updates Die Änderungen, die auf das Element angewendet werden sollen
 * @returns Das aktualisierte CustomUIElement
 */
export const updateElementByPath = (
  customElement: CustomUIElement,
  path: ElementPath,
  updates: Record<string, any>
): CustomUIElement => {
  if (!customElement.sub_flows || !customElement.sub_flows[path.subflowIndex]) {
    return customElement;
  }

  // Deep copy des CustomUIElement
  const updatedCustomElement = JSON.parse(JSON.stringify(customElement));

  // Navigiere zum übergeordneten Element
  let currentElements = updatedCustomElement.sub_flows[path.subflowIndex].elements;
  let lastIndex = path.path[path.path.length - 1];

  // Navigiere durch den Pfad bis zum vorletzten Element
  for (let i = 0; i < path.path.length - 1; i++) {
    const index = path.path[i];

    if (!currentElements || !currentElements[index]) {
      return customElement;
    }

    const currentElement = currentElements[index];



    // Gehe tiefer
    if (currentElement.element.pattern_type === 'GroupUIElement') {
      currentElements = (currentElement.element as GroupUIElement).elements;
    } else if (currentElement.element.pattern_type === 'ArrayUIElement') {
      currentElements = (currentElement.element as any).elements;
    } else if (currentElement.element.pattern_type === 'ChipGroupUIElement') {
      // ChipGroupUIElement hat keine elements, sondern chips
      const chipGroup = currentElement.element as ChipGroupUIElement;
      // Konvertiere chips zu PatternLibraryElement[]
      currentElements = chipGroup.chips.map((chip: any) => ({ element: chip }));
    } else {
      // Das Element hat keine verschachtelten Elemente
      return customElement;
    }

    // Aktualisiere lastIndex für den nächsten Schritt
    lastIndex = path.path[i + 1];
  }

  // Aktualisiere das Element
  if (currentElements && currentElements[lastIndex]) {
    currentElements[lastIndex] = {
      ...currentElements[lastIndex],
      element: {
        ...currentElements[lastIndex].element,
        ...updates
      }
    };
  }

  return updatedCustomElement;
};

/**
 * Findet alle BooleanUIElements innerhalb einer ChipGroupUIElement.
 *
 * @param chipGroup Die ChipGroupUIElement
 * @returns Ein Array von BooleanUIElements
 */
export const findElementsInChipGroup = (
  chipGroup: ChipGroupUIElement
): BooleanUIElement[] => {
  return chipGroup.chips || [];
};

/**
 * Aktualisiert ein BooleanUIElement innerhalb einer ChipGroupUIElement.
 *
 * @param chipGroup Die ChipGroupUIElement
 * @param chipIndex Der Index des Chips
 * @param updates Die Änderungen, die auf den Chip angewendet werden sollen
 * @returns Die aktualisierte ChipGroupUIElement
 */
export const updateElementInChipGroup = (
  chipGroup: ChipGroupUIElement,
  chipIndex: number,
  updates: Record<string, any>
): ChipGroupUIElement => {
  if (!chipGroup.chips || !chipGroup.chips[chipIndex]) {
    return chipGroup;
  }

  const updatedChips = [...chipGroup.chips];

  updatedChips[chipIndex] = {
    ...updatedChips[chipIndex],
    ...updates
  };

  return {
    ...chipGroup,
    chips: updatedChips
  };
};

/**
 * Findet alle Elemente innerhalb einer GroupUIElement.
 *
 * @param groupElement Die GroupUIElement
 * @returns Ein Array von PatternLibraryElements
 */
export const findElementsInGroup = (
  groupElement: GroupUIElement
): PatternLibraryElement[] => {
  return groupElement.elements || [];
};

/**
 * Aktualisiert ein Element innerhalb einer GroupUIElement.
 *
 * @param groupElement Die GroupUIElement
 * @param elementIndex Der Index des Elements
 * @param updates Die Änderungen, die auf das Element angewendet werden sollen
 * @returns Die aktualisierte GroupUIElement
 */
export const updateElementInGroup = (
  groupElement: GroupUIElement,
  elementIndex: number,
  updates: Record<string, any>
): GroupUIElement => {
  if (!groupElement.elements || !groupElement.elements[elementIndex]) {
    return groupElement;
  }

  const updatedElements = [...groupElement.elements];

  updatedElements[elementIndex] = {
    ...updatedElements[elementIndex],
    element: {
      ...updatedElements[elementIndex].element,
      ...updates
    }
  };

  return {
    ...groupElement,
    elements: updatedElements
  };
};

/**
 * Generiert einen Pfad zu einem Element basierend auf seinem Typ und seiner ID.
 * Diese Funktion durchsucht rekursiv alle Elemente in allen Subflows.
 *
 * @param customElement Das CustomUIElement, das die Subflows enthält
 * @param elementType Der Typ des Elements (z.B. 'BooleanUIElement', 'StringUIElement')
 * @param elementId Die ID des Elements (z.B. field_id.field_name)
 * @returns Der Pfad zum Element oder null, wenn kein Element gefunden wurde
 */
export const getElementPath = (
  customElement: CustomUIElement,
  elementType: string,
  elementId: string
): ElementPath | null => {
  if (!customElement.sub_flows) {
    return null;
  }

  // Durchsuche alle Subflows
  for (let subflowIndex = 0; subflowIndex < customElement.sub_flows.length; subflowIndex++) {
    const subflow = customElement.sub_flows[subflowIndex];

    // Suche rekursiv nach dem Element
    const path = findElementPathRecursive(subflow.elements, elementType, elementId);

    if (path) {
      return {
        subflowIndex,
        path
      };
    }
  }

  return null;
};

/**
 * Hilfsfunktion für getElementPath, die rekursiv nach einem Element sucht.
 *
 * @param elements Die zu durchsuchenden Elemente
 * @param elementType Der Typ des Elements
 * @param elementId Die ID des Elements
 * @param currentPath Der aktuelle Pfad (für die Rekursion)
 * @returns Der Pfad zum Element oder null, wenn kein Element gefunden wurde
 */
const findElementPathRecursive = (
  elements: PatternLibraryElement[],
  elementType: string,
  elementId: string,
  currentPath: number[] = []
): number[] | null => {
  if (!elements) {
    return null;
  }

  // Durchsuche alle Elemente
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    // Prüfe, ob das aktuelle Element das gesuchte Element ist
    if (
      element.element.pattern_type === elementType &&
      (element.element as any).field_id?.field_name === elementId
    ) {
      return [...currentPath, i];
    }

    // Prüfe verschachtelte Elemente
    if (element.element.pattern_type === 'GroupUIElement') {
      const groupElement = element.element as GroupUIElement;
      const path = findElementPathRecursive(
        groupElement.elements,
        elementType,
        elementId,
        [...currentPath, i]
      );

      if (path) {
        return path;
      }
    } else if (element.element.pattern_type === 'ArrayUIElement') {
      const arrayElement = element.element as any;
      const path = findElementPathRecursive(
        arrayElement.elements,
        elementType,
        elementId,
        [...currentPath, i]
      );

      if (path) {
        return path;
      }
    } else if (element.element.pattern_type === 'ChipGroupUIElement') {
      const chipGroup = element.element as ChipGroupUIElement;

      // Durchsuche alle Chips
      for (let j = 0; j < chipGroup.chips.length; j++) {
        const chip = chipGroup.chips[j];

        if (
          chip.pattern_type === elementType &&
          chip.field_id?.field_name === elementId
        ) {
          return [...currentPath, i, j];
        }
      }
    }
  }

  return null;
};
