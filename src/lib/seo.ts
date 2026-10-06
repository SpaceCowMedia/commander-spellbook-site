export const SITE_NAME = 'Commander Spellbook';
export const DESCRIPTION_LENGTH = 160;
export const IMAGE_CACHE_CONTROL = 'public, max-age=86400, stale-while-revalidate=604800';

export function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_CLIENT_URL ?? ''}${path}`;
}

export function withSiteName(title: string): string {
  return `${title} | ${SITE_NAME}`;
}

export function truncateDescription(text: string, length = DESCRIPTION_LENGTH): string {
  const singleLine = text.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= length) {
    return singleLine;
  }
  const cut = singleLine.slice(0, length - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.]+$/, '')}…`;
}

export function formatList(items: string[]): string {
  return new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(items);
}

export function formatCount(count: number): string {
  return count.toLocaleString('en-US');
}

export function jsonLdHtml(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absoluteUrl('/'),
  };
}
