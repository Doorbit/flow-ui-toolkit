import { stringToPath, pathToString } from './pathUtils';

describe('pathUtils', () => {
  describe('stringToPath', () => {
    it('returns empty array for empty string', () => {
      expect(stringToPath('')).toEqual([]);
    });

    it('converts dotted string to number array', () => {
      expect(stringToPath('1.2.3')).toEqual([1, 2, 3]);
    });
  });

  describe('pathToString', () => {
    it('converts number array to dotted string', () => {
      expect(pathToString([1, 2, 3])).toBe('1.2.3');
    });
  });
});
