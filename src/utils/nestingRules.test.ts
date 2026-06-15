import { isElementAllowedInParent, resolvePatternType } from './nestingRules';

describe('nestingRules', () => {
  describe('ChipGroup', () => {
    it('erlaubt nur Boolean-Elemente', () => {
      expect(isElementAllowedInParent('BooleanUIElement', 'ChipGroupUIElement').allowed).toBe(true);
      expect(isElementAllowedInParent('StringUIElement', 'ChipGroupUIElement').allowed).toBe(false);
      expect(isElementAllowedInParent('GroupUIElement', 'ChipGroupUIElement').allowed).toBe(false);
    });
  });

  describe('Array', () => {
    it('verbietet Arrays und komplexe Elemente', () => {
      expect(isElementAllowedInParent('ArrayUIElement', 'ArrayUIElement').allowed).toBe(false);
      expect(isElementAllowedInParent('GroupUIElement', 'ArrayUIElement').allowed).toBe(false);
      expect(isElementAllowedInParent('CustomUIElement', 'ArrayUIElement').allowed).toBe(false);
      expect(isElementAllowedInParent('ChipGroupUIElement', 'ArrayUIElement').allowed).toBe(false);
    });
    it('erlaubt einfache Elemente', () => {
      expect(isElementAllowedInParent('StringUIElement', 'ArrayUIElement').allowed).toBe(true);
      expect(isElementAllowedInParent('NumberUIElement', 'ArrayUIElement').allowed).toBe(true);
    });
  });

  describe('Gruppe', () => {
    it('verbietet verschachtelte Gruppen, erlaubt den Rest', () => {
      expect(isElementAllowedInParent('GroupUIElement', 'GroupUIElement').allowed).toBe(false);
      expect(isElementAllowedInParent('ArrayUIElement', 'GroupUIElement').allowed).toBe(true);
      expect(isElementAllowedInParent('StringUIElement', 'GroupUIElement').allowed).toBe(true);
    });
  });

  describe('unbeschränkte Eltern', () => {
    it('erlaubt alles (z. B. Custom/Subflow)', () => {
      expect(isElementAllowedInParent('GroupUIElement', 'CustomUIElement').allowed).toBe(true);
      expect(isElementAllowedInParent('ArrayUIElement', 'CustomUIElement').allowed).toBe(true);
    });
  });

  describe('resolvePatternType', () => {
    it('bildet Custom-Dialog-Varianten auf CustomUIElement ab', () => {
      expect(resolvePatternType('CustomUIElement_SCANNER')).toBe('CustomUIElement');
      expect(resolvePatternType('CustomUIElement_ADDRESS')).toBe('CustomUIElement');
    });
    it('lässt normale Typen unverändert', () => {
      expect(resolvePatternType('BooleanUIElement')).toBe('BooleanUIElement');
      expect(resolvePatternType('GroupUIElement')).toBe('GroupUIElement');
    });
  });
});
