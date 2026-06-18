export const GEORGIA_REGIONS = [
  { slug: 'abkhazia', label: 'აფხაზეთი' },
  { slug: 'adjara', label: 'აჭარა' },
  { slug: 'guria', label: 'გურია' },
  { slug: 'tbilisi', label: 'თბილისი' },
  { slug: 'imereti', label: 'იმერეთი' },
  { slug: 'kakheti', label: 'კახეთი' },
  { slug: 'mtskheta-mtianeti', label: 'მცხეთა-მთიანეთი' },
  { slug: 'racha-lechkhumi', label: 'რაჭა-ლეჩხუმი და ქვემო სვანეთი' },
  { slug: 'samegrelo-upper-svaneti', label: 'სამეგრელო-ზემო სვანეთი' },
  { slug: 'samtskhe-javakheti', label: 'სამცხე-ჯავახეთი' },
  { slug: 'kvemo-kartli', label: 'ქვემო ქართლი' },
  { slug: 'shida-kartli', label: 'შიდა ქართლი' },
] as const;

export type RegionSlug = (typeof GEORGIA_REGIONS)[number]['slug'];

export function getRegionLabel(slug: string): string {
  const region = GEORGIA_REGIONS.find((r) => r.slug === slug);
  return region?.label ?? slug;
}

export function parseRegionFromTags(tags: string[]): string | null {
  const slugs = new Set(GEORGIA_REGIONS.map((r) => r.slug));
  return tags.find((t) => slugs.has(t as RegionSlug)) ?? null;
}
