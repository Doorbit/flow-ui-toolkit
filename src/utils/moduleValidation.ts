import { ListingFlow, Page, PatternLibraryElement } from '../models/listingFlow';

/**
 * Eine Stelle im Flow, die per `module_id` auf ein Modul verweist.
 */
export interface ModuleReference {
  moduleId: string;
  /** Menschenlesbare Fundstelle (für Warnungen). */
  location: string;
}

const collectFromElement = (
  ple: PatternLibraryElement,
  pageLabel: string,
  acc: ModuleReference[]
): void => {
  const el = ple?.element as any;
  if (!el) return;

  if (el.module_id) {
    const label = el.title?.de || el.title?.en || el.pattern_type || 'Element';
    acc.push({ moduleId: el.module_id, location: `Element „${label}" (${pageLabel})` });
  }

  if (Array.isArray(el.elements)) {
    el.elements.forEach((child: PatternLibraryElement) => collectFromElement(child, pageLabel, acc));
  }
  if (Array.isArray(el.sub_flows)) {
    el.sub_flows.forEach((sf: any) => {
      if (Array.isArray(sf?.elements)) {
        sf.elements.forEach((child: PatternLibraryElement) => collectFromElement(child, pageLabel, acc));
      }
    });
  }
  if (Array.isArray(el.chips)) {
    el.chips.forEach((chip: any) => {
      if (chip?.module_id) {
        acc.push({ moduleId: chip.module_id, location: `Chip (${pageLabel})` });
      }
    });
  }
};

const collectFromPages = (pages: Page[] | undefined, acc: ModuleReference[]): void => {
  (pages ?? []).forEach((page) => {
    const pageLabel = `Seite „${page.title?.de || page.id}"`;
    if ((page as any).module_id) {
      acc.push({ moduleId: (page as any).module_id, location: pageLabel });
    }
    (page.elements ?? []).forEach((child) => collectFromElement(child, pageLabel, acc));
  });
};

/**
 * Sammelt alle `module_id`-Referenzen im Flow (Seiten + verschachtelte Elemente).
 */
export const collectModuleReferences = (flow: ListingFlow | null): ModuleReference[] => {
  if (!flow) return [];
  const acc: ModuleReference[] = [];
  collectFromPages(flow.pages_edit, acc);
  collectFromPages(flow.pages_view, acc);
  return acc;
};

/**
 * Liefert alle Referenzen, deren `module_id` in `ListingFlow.modules` NICHT existiert
 * (verwaiste Referenzen / dangling references). Wenn der Modul-Katalog fehlt, gelten
 * alle Referenzen als verwaist.
 */
export const findDanglingModuleReferences = (flow: ListingFlow | null): ModuleReference[] => {
  if (!flow) return [];
  const known = new Set((flow.modules ?? []).map((m) => m.id));
  return collectModuleReferences(flow).filter((ref) => !known.has(ref.moduleId));
};

/**
 * Eindeutige, verwaiste Modul-IDs (für kompakte Warnungen).
 */
export const danglingModuleIds = (flow: ListingFlow | null): string[] =>
  Array.from(new Set(findDanglingModuleReferences(flow).map((r) => r.moduleId)));
