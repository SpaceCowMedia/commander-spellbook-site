import { ServerResponse } from 'http';
import { absoluteUrl } from './seo';

export const MAX_SITEMAP_URLS = 40000;

export function escapeXml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function urlSet(locations: string[]): string {
  const urls = locations.map((location) => `<url><loc>${escapeXml(location)}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function sitemapIndex(locations: string[]): string {
  const sitemaps = locations.map((location) => `<sitemap><loc>${escapeXml(location)}</loc></sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>
`;
}

/* Served whole when it fits a single file, otherwise as an index of numbered pages. */
export function pagedSitemap(path: string, locations: string[], page: string | undefined): string | undefined {
  const pageCount = Math.ceil(locations.length / MAX_SITEMAP_URLS);
  if (page === undefined) {
    return pageCount <= 1
      ? urlSet(locations)
      : sitemapIndex(Array.from({ length: pageCount }, (_, i) => absoluteUrl(`${path}?page=${i + 1}`)));
  }
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > pageCount) {
    return undefined;
  }
  return urlSet(locations.slice((pageNumber - 1) * MAX_SITEMAP_URLS, pageNumber * MAX_SITEMAP_URLS));
}

export function sendXml(res: ServerResponse, xml: string) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.write(xml);
  res.end();
}
