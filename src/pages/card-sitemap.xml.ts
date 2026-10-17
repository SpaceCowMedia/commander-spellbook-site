import { GetServerSideProps } from 'next';
import BulkApiService from 'services/bulk-api.service';
import { absoluteUrl } from 'lib/seo';
import { cardPath } from 'lib/cards';
import { pagedSitemap, sendXml } from 'lib/sitemap';
import { queryParameterAsString } from 'lib/queryParameters';

const STATIC_PATHS = ['/', '/find-my-combos/', '/advanced-search/', '/syntax-guide/', '/about/'];

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res, query }) => {
  const { cardIds } = await BulkApiService.fetchBulkIds();
  const xml = pagedSitemap(
    '/card-sitemap.xml',
    [...STATIC_PATHS, ...cardIds.flatMap((id) => cardPath({ id }) ?? [])].map(absoluteUrl),
    queryParameterAsString(query.page),
  );
  if (xml === undefined) {
    return { notFound: true };
  }
  sendXml(res, xml);
  return { props: {} };
};

export default SiteMap;
