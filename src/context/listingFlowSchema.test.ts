import Ajv from 'ajv';
import { listingFlowSchema } from './listingFlowSchema';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(listingFlowSchema);

const base = () => ({
  id: 'x',
  'url-key': 'x',
  name: 'x',
  title: { de: 'x' },
  icon: 'mdiFile',
  pages_edit: [] as any[],
  pages_view: [] as any[],
});
const withEl = (el: any) => ({
  ...base(),
  pages_edit: [{ pattern_type: 'CustomUIElement', id: 'p', elements: [{ element: el }] }],
});

describe('listingFlowSchema', () => {
  it('validiert einen echten Produktions-Flow (enion_esg) ohne False-Positives', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const enion = require('../../enion_esg.json');
    const ok = validate(enion);
    if (!ok) {
      // Hilft beim Debuggen, falls sich das Modell ändert
      // eslint-disable-next-line no-console
      console.error('Schema-Fehler enion_esg:', validate.errors?.slice(0, 20));
    }
    expect(ok).toBe(true);
  });

  it('lehnt ein Boolean-Element ohne field_id ab', () => {
    expect(validate(withEl({ pattern_type: 'BooleanUIElement', title: { de: 'b' } }))).toBe(false);
  });

  it('lehnt eine SingleSelection ohne options ab', () => {
    expect(validate(withEl({ pattern_type: 'SingleSelectionUIElement', field_id: { field_name: 'f' } }))).toBe(false);
  });

  it('lehnt eine Gruppe ohne elements ab', () => {
    expect(validate(withEl({ pattern_type: 'GroupUIElement', title: { de: 'g' } }))).toBe(false);
  });

  it('lehnt einen Flow ohne pages_view ab', () => {
    const f: any = base();
    delete f.pages_view;
    expect(validate(f)).toBe(false);
  });

  it('akzeptiert unbekannte (künftige) Element-Typen — vorwärtskompatibel', () => {
    expect(validate(withEl({ pattern_type: 'FutureUIElement', whatever: 1 }))).toBe(true);
  });
});
