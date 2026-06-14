import { extractModuleArtifact, mergeModuleArtifact } from './moduleArtifact';
import { ListingFlow } from '../models/listingFlow';

const baseFlow = (): ListingFlow => ({
  id: 'esg',
  'url-key': 'esg',
  name: 'ESG',
  title: { de: 'ESG', en: 'ESG' },
  icon: 'mdiFileOutline',
  modules: [
    { id: 'heizlast', name: { de: 'Heizlast', en: 'Heat load' }, description: { de: '' }, delivery: 'CATALOG', version: '1.0.0', icon: 'mdiHeatingCoil' },
  ],
  pages_edit: [
    { pattern_type: 'CustomUIElement', id: 'edit-base', title: { de: 'Basis' }, elements: [] },
    { pattern_type: 'CustomUIElement', id: 'edit-heizlast', title: { de: 'Heizlast' }, module_id: 'heizlast', elements: [] },
  ],
  pages_view: [
    { pattern_type: 'CustomUIElement', id: 'view-heizlast', title: { de: 'Heizlast' }, module_id: 'heizlast', elements: [] },
  ],
});

describe('moduleArtifact', () => {
  describe('extractModuleArtifact', () => {
    it('baut ein eigenständiges Artefakt mit Modul, Version und modul-getaggten Seiten', () => {
      const artifact = extractModuleArtifact(baseFlow(), 'heizlast')!;
      expect(artifact).not.toBeNull();
      expect(artifact.id).toBe('heizlast');
      expect(artifact.version).toBe('1.0.0');
      expect(artifact.modules).toHaveLength(1);
      expect(artifact.modules![0].delivery).toBe('CATALOG');
      // nur die heizlast-getaggten Seiten
      expect(artifact.pages_edit.map((p) => p.id)).toEqual(['edit-heizlast']);
      expect(artifact.pages_view.map((p) => p.id)).toEqual(['view-heizlast']);
    });

    it('gibt null zurück für ein unbekanntes Modul', () => {
      expect(extractModuleArtifact(baseFlow(), 'unbekannt')).toBeNull();
    });
  });

  describe('mergeModuleArtifact', () => {
    it('ergänzt Modul-Katalog und Seiten ohne Duplikate', () => {
      const target: ListingFlow = {
        id: 't',
        'url-key': 't',
        name: 'T',
        title: { de: 'T', en: 'T' },
        icon: 'mdiFileOutline',
        modules: [],
        pages_edit: [{ pattern_type: 'CustomUIElement', id: 'edit-base', title: { de: 'Basis' }, elements: [] }],
        pages_view: [],
      };
      const artifact = extractModuleArtifact(baseFlow(), 'heizlast')!;

      const merged = mergeModuleArtifact(target, artifact);
      expect(merged.modules!.map((m) => m.id)).toEqual(['heizlast']);
      expect(merged.pages_edit.map((p) => p.id)).toEqual(['edit-base', 'edit-heizlast']);
      expect(merged.pages_view.map((p) => p.id)).toEqual(['view-heizlast']);

      // Erneutes Mergen erzeugt keine Duplikate
      const mergedTwice = mergeModuleArtifact(merged, artifact);
      expect(mergedTwice.modules!.map((m) => m.id)).toEqual(['heizlast']);
      expect(mergedTwice.pages_edit.map((p) => p.id)).toEqual(['edit-base', 'edit-heizlast']);
    });
  });
});
