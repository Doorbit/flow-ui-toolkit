import { collectModuleReferences, findDanglingModuleReferences, danglingModuleIds } from './moduleValidation';
import { ListingFlow } from '../models/listingFlow';

const makeFlow = (overrides: Partial<ListingFlow>): ListingFlow => ({
  id: 'f',
  'url-key': 'f',
  name: 'F',
  title: { de: 'F', en: 'F' },
  icon: 'mdiFileOutline',
  pages_edit: [],
  pages_view: [],
  ...overrides,
});

describe('moduleValidation', () => {
  it('sammelt module_id-Referenzen von Seiten und (verschachtelten) Elementen', () => {
    const flow = makeFlow({
      modules: [
        { id: 'heizlast', name: { de: 'Heizlast' }, description: { de: '' } },
      ],
      pages_edit: [
        {
          pattern_type: 'Page',
          id: 'p1',
          title: { de: 'Seite 1' },
          module_id: 'heizlast',
          elements: [
            {
              element: {
                pattern_type: 'GroupUIElement',
                required: false,
                title: { de: 'Gruppe' },
                module_id: 'heizlast',
                elements: [
                  { element: { pattern_type: 'StringUIElement', type: 'TEXT', required: false, title: { de: 'Feld' }, module_id: 'heizlast', field_id: { field_name: 'x' } } },
                ],
              } as any,
            },
          ],
        },
      ],
    });

    const refs = collectModuleReferences(flow);
    expect(refs).toHaveLength(3); // Seite + Gruppe + verschachteltes Feld
    expect(refs.every((r) => r.moduleId === 'heizlast')).toBe(true);
  });

  it('erkennt verwaiste Referenzen (module_id ohne Katalog-Eintrag)', () => {
    const flow = makeFlow({
      modules: [{ id: 'heizlast', name: { de: 'Heizlast' }, description: { de: '' } }],
      pages_edit: [
        {
          pattern_type: 'Page',
          id: 'p1',
          title: { de: 'Seite 1' },
          elements: [
            { element: { pattern_type: 'StringUIElement', type: 'TEXT', required: false, title: { de: 'Feld' }, module_id: 'unbekannt', field_id: { field_name: 'x' } } as any },
          ],
        },
      ],
    });

    const dangling = findDanglingModuleReferences(flow);
    expect(dangling).toHaveLength(1);
    expect(dangling[0].moduleId).toBe('unbekannt');
    expect(danglingModuleIds(flow)).toEqual(['unbekannt']);
  });

  it('behandelt alle Referenzen als verwaist, wenn kein Modul-Katalog existiert', () => {
    const flow = makeFlow({
      pages_edit: [
        { pattern_type: 'Page', id: 'p1', title: { de: 'Seite 1' }, module_id: 'heizlast', elements: [] },
      ],
    });
    expect(findDanglingModuleReferences(flow)).toHaveLength(1);
  });

  it('liefert keine verwaisten Referenzen, wenn alle module_id im Katalog existieren', () => {
    const flow = makeFlow({
      modules: [{ id: 'heizlast', name: { de: 'Heizlast' }, description: { de: '' } }],
      pages_edit: [
        { pattern_type: 'Page', id: 'p1', title: { de: 'Seite 1' }, module_id: 'heizlast', elements: [] },
      ],
    });
    expect(findDanglingModuleReferences(flow)).toHaveLength(0);
  });
});
