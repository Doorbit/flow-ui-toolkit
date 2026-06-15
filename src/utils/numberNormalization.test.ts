import { normalizeElementTypes } from './normalizeUtils';
import { ListingFlow } from '../models/listingFlow';

const flowWith = (numberElement: any): any => ({
  id: 'test-flow',
  'url-key': 'test',
  name: 'Test Flow',
  title: { de: 'Test', en: 'Test' },
  icon: 'test',
  pages_edit: [
    {
      pattern_type: 'Page',
      id: 'page1',
      elements: [{ element: numberElement }],
    },
  ],
  pages_view: [],
});

const numberOf = (result: ListingFlow): any =>
  (result.pages_edit[0].elements[0] as any).element;

describe('NumberUIElement-Normalisierung (Schema-Drift-Fix)', () => {
  it('migriert Alt-Felder min/max/step/default_value auf minimum/maximum/default', () => {
    const result = normalizeElementTypes(
      flowWith({
        pattern_type: 'NumberUIElement',
        field_id: { field_name: 'n' },
        min: 1,
        max: 9,
        step: 2,
        default_value: 5,
      }) as ListingFlow
    );
    const el = numberOf(result);
    expect(el.minimum).toBe(1);
    expect(el.maximum).toBe(9);
    expect(el.default).toBe(5);
    // Alt-Felder werden entfernt, damit sie nicht zurück-exportiert werden.
    expect(el.min).toBeUndefined();
    expect(el.max).toBeUndefined();
    expect(el.step).toBeUndefined();
    expect(el.default_value).toBeUndefined();
  });

  it('lässt portal-konforme Felder minimum/maximum/default unverändert', () => {
    const result = normalizeElementTypes(
      flowWith({
        pattern_type: 'NumberUIElement',
        field_id: { field_name: 'n' },
        minimum: 0,
        maximum: 100,
        default: 42,
      }) as ListingFlow
    );
    const el = numberOf(result);
    expect(el.minimum).toBe(0);
    expect(el.maximum).toBe(100);
    expect(el.default).toBe(42);
  });

  it('überschreibt vorhandene Schema-Felder nicht mit Alt-Werten', () => {
    const result = normalizeElementTypes(
      flowWith({
        pattern_type: 'NumberUIElement',
        field_id: { field_name: 'n' },
        minimum: 3,
        min: 999,
        default: 7,
        default_value: 999,
      }) as ListingFlow
    );
    const el = numberOf(result);
    expect(el.minimum).toBe(3);
    expect(el.default).toBe(7);
    expect(el.min).toBeUndefined();
    expect(el.default_value).toBeUndefined();
  });
});
