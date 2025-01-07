import { NextPageContext } from 'next';

function RobotsTxt() {
  // getServerSideProps will do the heavy lifting
}

function getRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${process.env.NEXT_PUBLIC_CLIENT_URL}/combo-sitemap.xml`,
    `Sitemap: ${process.env.NEXT_PUBLIC_CLIENT_URL}/card-sitemap.xml`,
  ].join('\n');
}

export async function getServerSideProps({ res }: NextPageContext) {
  const robotsTxt = getRobotsTxt();

  res?.setHeader('Content-Type', 'text/plain');
  res?.write(robotsTxt);
  res?.end();

  return { props: {} };
}

export default RobotsTxt;
