import { Variant } from '@space-cow-media/spellbook-client';
import { NextPageContext } from 'next';

interface SitemapCache {
  sitemap?: string;
  lastUpdated?: number;
}

const cardsCache: SitemapCache = {};

async function getCombos(): Promise<Variant[]> {
  const bulkVariants = JSON.parse(await (await fetch('https://json.commanderspellbook.com/variants.json')).text());
  const variants: Variant[] = bulkVariants.variants;
  return variants;
}

async function generateSiteMap(): Promise<string> {
  if (cardsCache.sitemap && cardsCache.lastUpdated && Date.now() - cardsCache.lastUpdated < 1000 * 60 * 60 * 24 * 6) {
    return cardsCache.sitemap;
  }
  const combos = await getCombos();
  const updateTime = Date.now();
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${`${process.env.NEXT_PUBLIC_CLIENT_URL}/`}</loc>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${`${process.env.NEXT_PUBLIC_CLIENT_URL}/find-my-combos/`}</loc>
       <priority>0.9</priority>
     </url>
     <url>
       <loc>${`${process.env.NEXT_PUBLIC_CLIENT_URL}/search/?q=is:featured`}</loc>
       <changefreq>monthly</changefreq>
       <priority>0.8</priority>
     </url>
     ${combos
       .map(({ id }) => {
         return `
       <url>
           <loc>${`${process.env.NEXT_PUBLIC_CLIENT_URL}/combo/${encodeURIComponent(id)}/`}</loc>
           <changefreq>weekly</changefreq>
           <lastmod>${new Date(updateTime).toISOString()}</lastmod>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
  cardsCache.sitemap = sitemap;
  cardsCache.lastUpdated = updateTime;
  return sitemap;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }: NextPageContext) {
  // We generate the XML sitemap with the posts data
  const sitemap = await generateSiteMap();

  res?.setHeader('Content-Type', 'application/xml');
  // we send the XML to the browser
  res?.write(sitemap);
  res?.end();

  return {
    props: {},
  };
}

export default SiteMap;
