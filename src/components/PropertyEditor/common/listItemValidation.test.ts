import { getDuplicateKeyError } from './listItemValidation';

describe('getDuplicateKeyError', () => {
  it('akzeptiert eindeutige, nicht-leere Schlüssel', () => {
    expect(getDuplicateKeyError(['a', 'b', 'c'], 0)).toBeNull();
    expect(getDuplicateKeyError(['a', 'b', 'c'], 2)).toBeNull();
  });

  it('meldet leere bzw. nur aus Leerzeichen bestehende Schlüssel', () => {
    expect(getDuplicateKeyError(['', 'b'], 0)).toBe('Schlüssel darf nicht leer sein');
    expect(getDuplicateKeyError(['   ', 'b'], 0)).toBe('Schlüssel darf nicht leer sein');
  });

  it('markiert beide Seiten eines Duplikats (getrimmt)', () => {
    expect(getDuplicateKeyError(['dup', 'dup', 'x'], 0)).toBe('Schlüssel muss eindeutig sein');
    expect(getDuplicateKeyError(['x', ' x '], 1)).toBe('Schlüssel muss eindeutig sein');
    expect(getDuplicateKeyError(['dup', 'dup', 'x'], 2)).toBeNull();
  });

  it('verwendet das übergebene Label in den Meldungen', () => {
    expect(getDuplicateKeyError([''], 0, 'Feld-ID')).toBe('Feld-ID darf nicht leer sein');
    expect(getDuplicateKeyError(['f', 'f'], 1, 'Feld-ID')).toBe('Feld-ID muss eindeutig sein');
  });

  it('behandelt undefined-Einträge wie leere Werte', () => {
    expect(getDuplicateKeyError([undefined, 'b'], 0)).toBe('Schlüssel darf nicht leer sein');
  });
});
