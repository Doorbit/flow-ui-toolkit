import { slugify, validateSlug, validateRequired } from './flowMetadata';

describe('flowMetadata', () => {
  describe('slugify', () => {
    it('wandelt Text in einen slug', () => {
      expect(slugify('Mein Flow')).toBe('mein-flow');
      expect(slugify('  Doorbit  ESG  ')).toBe('doorbit-esg');
      expect(slugify('Ärger & Co.!')).toBe('rger-co');
    });

    it('entfernt führende/abschließende Trenner', () => {
      expect(slugify('---Test---')).toBe('test');
      expect(slugify('')).toBe('');
    });
  });

  describe('validateSlug', () => {
    it('akzeptiert gültige Identifier (Bindestrich und Unterstrich)', () => {
      expect(validateSlug('new-flow')).toBeNull();
      expect(validateSlug('doorbit_esg')).toBeNull();
      expect(validateSlug('flow123')).toBeNull();
    });

    it('lehnt leere Werte ab', () => {
      expect(validateSlug('', 'ID')).toBe('ID darf nicht leer sein');
      expect(validateSlug('   ', 'ID')).toBe('ID darf nicht leer sein');
    });

    it('lehnt Großbuchstaben, Leerzeichen und Sonderzeichen ab', () => {
      expect(validateSlug('Mein Flow')).not.toBeNull();
      expect(validateSlug('flow!')).not.toBeNull();
      expect(validateSlug('-flow')).not.toBeNull();
      expect(validateSlug('flow--name')).not.toBeNull();
    });
  });

  describe('validateRequired', () => {
    it('verlangt einen nicht-leeren Wert', () => {
      expect(validateRequired('Name', 'Name')).toBeNull();
      expect(validateRequired('', 'Name')).toBe('Name darf nicht leer sein');
      expect(validateRequired('  ', 'Name')).toBe('Name darf nicht leer sein');
    });
  });
});
