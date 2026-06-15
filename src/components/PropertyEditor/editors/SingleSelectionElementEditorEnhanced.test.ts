import { getOptionKeyError } from './SingleSelectionElementEditorEnhanced';

describe('getOptionKeyError', () => {
  it('akzeptiert eindeutige, nicht-leere Schlüssel', () => {
    const options = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
    expect(getOptionKeyError(options, 0)).toBeNull();
    expect(getOptionKeyError(options, 1)).toBeNull();
    expect(getOptionKeyError(options, 2)).toBeNull();
  });

  it('meldet einen leeren Schlüssel', () => {
    const options = [{ key: '' }, { key: 'b' }];
    expect(getOptionKeyError(options, 0)).toBe('Schlüssel darf nicht leer sein');
  });

  it('meldet einen Schlüssel, der nur aus Leerzeichen besteht', () => {
    const options = [{ key: '   ' }, { key: 'b' }];
    expect(getOptionKeyError(options, 0)).toBe('Schlüssel darf nicht leer sein');
  });

  it('markiert beide Optionen eines doppelten Schlüssels', () => {
    const options = [{ key: 'dup' }, { key: 'dup' }, { key: 'unique' }];
    expect(getOptionKeyError(options, 0)).toBe('Schlüssel muss eindeutig sein');
    expect(getOptionKeyError(options, 1)).toBe('Schlüssel muss eindeutig sein');
    expect(getOptionKeyError(options, 2)).toBeNull();
  });

  it('behandelt Schlüssel mit umgebenden Leerzeichen als Duplikat', () => {
    const options = [{ key: 'x' }, { key: ' x ' }];
    expect(getOptionKeyError(options, 0)).toBe('Schlüssel muss eindeutig sein');
    expect(getOptionKeyError(options, 1)).toBe('Schlüssel muss eindeutig sein');
  });
});
