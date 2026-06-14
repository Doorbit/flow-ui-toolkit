import { ListingFlow, Module, Page } from '../models/listingFlow';

/**
 * Baut aus einem Basis-Flow ein eigenständiges CATALOG-Modul-Artefakt für ein Modul.
 *
 * Ein Artefakt ist selbst flow-förmig (gleiches ListingFlow-Schema, wie es
 * portal-applications über `flowModule(id)` nachlädt). Es enthält:
 *  - den Modul-Katalog-Eintrag (delivery = CATALOG),
 *  - alle Seiten, die per `module_id` diesem Modul zugeordnet sind,
 *  - die Modul-Version auf Flow-Ebene (für Cache-Invalidierung).
 *
 * Gibt `null` zurück, wenn das Modul nicht existiert.
 */
export const extractModuleArtifact = (flow: ListingFlow | null, moduleId: string): ListingFlow | null => {
  if (!flow) return null;
  const module = (flow.modules ?? []).find((m) => m.id === moduleId);
  if (!module) return null;

  const belongsToModule = (page: Page) => (page as any).module_id === moduleId;

  const artifactModule: Module = { ...module, delivery: 'CATALOG' };

  return {
    id: moduleId,
    'url-key': moduleId,
    name: module.name?.de || module.name?.en || moduleId,
    title: module.name ?? { de: moduleId, en: moduleId },
    icon: module.icon ?? '',
    version: module.version,
    modules: [artifactModule],
    pages_edit: (flow.pages_edit ?? []).filter(belongsToModule),
    pages_view: (flow.pages_view ?? []).filter(belongsToModule),
  };
};

/**
 * Führt ein Modul-Artefakt in einen Basis-Flow zusammen:
 *  - ergänzt fehlende Modul-Katalog-Einträge (vorhandene mit gleicher id bleiben unangetastet),
 *  - hängt Seiten des Artefakts an, die im Basis-Flow noch nicht existieren (Abgleich über id).
 *
 * Immutable: liefert einen neuen Flow.
 */
export const mergeModuleArtifact = (flow: ListingFlow, artifact: ListingFlow): ListingFlow => {
  const existingModuleIds = new Set((flow.modules ?? []).map((m) => m.id));
  const mergedModules: Module[] = [
    ...(flow.modules ?? []),
    ...(artifact.modules ?? []).filter((m) => !existingModuleIds.has(m.id)),
  ];

  const existingEditIds = new Set((flow.pages_edit ?? []).map((p) => p.id));
  const existingViewIds = new Set((flow.pages_view ?? []).map((p) => p.id));

  return {
    ...flow,
    modules: mergedModules,
    pages_edit: [
      ...(flow.pages_edit ?? []),
      ...(artifact.pages_edit ?? []).filter((p) => !existingEditIds.has(p.id)),
    ],
    pages_view: [
      ...(flow.pages_view ?? []),
      ...(artifact.pages_view ?? []).filter((p) => !existingViewIds.has(p.id)),
    ],
  };
};
