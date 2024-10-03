import { NextPageContext } from 'next';

function RobotsTxt() {
  // getServerSideProps will do the heavy lifting
}

function getRobotsTxt(): string {
  return `User-agent: *\nAllow: /\nSitemap: ${process.env.NEXT_PUBLIC_CLIENT_URL}/sitemap.xml\n`;
}

export async function getServerSideProps({ res }: NextPageContext) {
  const robotsTxt = getRobotsTxt();

  res?.setHeader('Content-Type', 'text/plain');
  res?.write(robotsTxt);
  res?.end();

  return { props: {} };
}

export default RobotsTxt;
