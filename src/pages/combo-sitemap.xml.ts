import { GetServerSideProps } from 'next';
import BulkApiService from 'services/bulk-api.service';
import { absoluteUrl } from 'lib/seo';
import { pagedSitemap, sendXml } from 'lib/sitemap';
import { queryParameterAsString } from 'lib/queryParameters';

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res, query }) => {
  const { variantIds } = await BulkApiService.fetchBulkIds();
  const xml = pagedSitemap(
    '/combo-sitemap.xml',
    variantIds.map((id) => absoluteUrl(`/combo/${encodeURIComponent(id)}/`)),
    queryParameterAsString(query.page),
  );
  if (xml === undefined) {
    return { notFound: true };
  }
  sendXml(res, xml);
  return { props: {} };
};

export default SiteMap;
