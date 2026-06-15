import {
  SUPPORTED_PAGE_LAYOUTS,
  SUPPORTED_LAYOUT_VALUES,
  PAGE_LAYOUT_STANDARD,
  isSupportedLayout,
  layoutForPersistence,
} from './pageLayouts';

describe('pageLayouts', () => {
  it('bietet genau die von portal gerenderten Layouts an (Standard + 2 Spaltenvarianten)', () => {
    expect(SUPPORTED_PAGE_LAYOUTS.map((o) => o.value)).toEqual([
      PAGE_LAYOUT_STANDARD,
      '2_COL_RIGHT_WIDER',
      '2_COL_RIGHT_FILL',
    ]);
    expect(SUPPORTED_LAYOUT_VALUES).toEqual(['2_COL_RIGHT_WIDER', '2_COL_RIGHT_FILL']);
  });

  describe('isSupportedLayout', () => {
    it('akzeptiert abwesendes/leeres Layout als Standard', () => {
      expect(isSupportedLayout(undefined)).toBe(true);
      expect(isSupportedLayout(null)).toBe(true);
      expect(isSupportedLayout('')).toBe(true);
    });

    it('akzeptiert die unterstützten Spaltenlayouts', () => {
      expect(isSupportedLayout('2_COL_RIGHT_FILL')).toBe(true);
      expect(isSupportedLayout('2_COL_RIGHT_WIDER')).toBe(true);
    });

    it('lehnt früher angebotene, aber von portal nicht gerenderte Layouts ab', () => {
      expect(isSupportedLayout('2_COL_LEFT_WIDER')).toBe(false);
      expect(isSupportedLayout('1_COL')).toBe(false);
      expect(isSupportedLayout('irgendwas')).toBe(false);
    });
  });

  describe('layoutForPersistence', () => {
    it('mappt Standard (leer) auf undefined', () => {
      expect(layoutForPersistence(PAGE_LAYOUT_STANDARD)).toBeUndefined();
      expect(layoutForPersistence('')).toBeUndefined();
    });

    it('behält gesetzte Layout-Werte bei', () => {
      expect(layoutForPersistence('2_COL_RIGHT_FILL')).toBe('2_COL_RIGHT_FILL');
      expect(layoutForPersistence('2_COL_RIGHT_WIDER')).toBe('2_COL_RIGHT_WIDER');
    });
  });
});
