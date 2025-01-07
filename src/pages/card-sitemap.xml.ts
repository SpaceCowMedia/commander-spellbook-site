import { CardDetail, CardsApi } from '@spacecowmedia/spellbook-client';
import { NextPageContext } from 'next';
import { apiConfiguration } from 'services/api.service';

type SitemapCache = {
  sitemap?: string;
  lastUpdated?: number;
};

const cardsCache: SitemapCache = {};

async function getCards(): Promise<CardDetail[]> {
  const configuration = apiConfiguration();
  const cardsApi = new CardsApi(configuration);
  const firstPage = await cardsApi.cardsList();
  const cards = firstPage.results;
  const pageSize = firstPage.results.length;
  const pageCount = Math.ceil(firstPage.count / pageSize);
  const promises = [];
  for (let i = 1; i < pageCount; i++) {
    promises.push(cardsApi.cardsList({ limit: pageSize, offset: i * pageSize }));
  }
  const restPages = await Promise.all(promises);
  restPages.forEach((page) => cards.push(...page.results));
  return cards;
}

async function generateSiteMap(): Promise<string> {
  if (cardsCache.sitemap && cardsCache.lastUpdated && Date.now() - cardsCache.lastUpdated < 1000 * 60 * 60 * 24 * 6) {
    return cardsCache.sitemap;
  }
  const cards = await getCards();
  const updateTime = Date.now();
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${`${process.env.NEXT_PUBLIC_CLIENT_URL}/`}</loc>
       <priority>1.0</priority>
     </url>
     ${cards
       .map(({ name }) => {
         return `
       <url>
           <loc>${`${process.env.NEXT_PUBLIC_CLIENT_URL}/search/?q=${encodeURIComponent(`card="${name}"`).replaceAll("'", '%27')}`}</loc>
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
