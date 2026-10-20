import Head from 'next/head';
import React from 'react';
import { useRouter } from 'next/router';
import { GA_TRACKING_ID } from 'lib/googleAnalytics';
import { absoluteUrl, jsonLdHtml, SITE_NAME } from 'lib/seo';

const DEFAULT_IMAGE = {
  url: '/images/link-preview.png',
  width: 1200,
  height: 628,
  alt: 'Commander Spellbook, the search engine for Commander combos',
};

const IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
};

function imageType(imageUrl: string): string {
  const extension = new URL(imageUrl, 'http://localhost').pathname.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_TYPES[extension] ?? 'image/png';
}

interface Props {
  children?: React.ReactNode;
  title: string;
  description: string;
  socialDescription?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  /* The path this page should be indexed under, given by pages that are reachable under more than
     one URL: the query parameters that only hand state over between pages are left out of it. */
  canonicalPath?: string;
  noindex?: boolean;
  jsonLd?: object;
}

const SpellbookHead: React.FC<Props> = ({
  children,
  title,
  description,
  socialDescription = description,
  imageUrl,
  imageAlt,
  imageWidth,
  imageHeight,
  canonicalPath,
  noindex,
  jsonLd,
}) => {
  const router = useRouter();
  const image = imageUrl
    ? { url: imageUrl, width: imageWidth, height: imageHeight, alt: imageAlt }
    : { ...DEFAULT_IMAGE, url: absoluteUrl(DEFAULT_IMAGE.url) };
  return (
    <Head>
      {/* Google Analytics */}
      <script
        id="ga1"
        async={true}
        defer={false}
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <script
        id="ga2"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      {/* End Google Analytics */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:description" content={socialDescription} />
      <meta name="twitter:description" content={socialDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#9161f3" />
      <link rel="icon" href="/favicon.ico" />
      {noindex && <meta name="robots" content="noindex, follow" />}
      {canonicalPath && <link rel="canonical" href={absoluteUrl(canonicalPath)} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      <meta property="og:url" content={absoluteUrl(canonicalPath ?? router.asPath)} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image.url} />
      <meta property="og:image:type" content={imageType(image.url)} />
      {image.width && <meta property="og:image:width" content={String(image.width)} />}
      {image.height && <meta property="og:image:height" content={String(image.height)} />}
      {image.alt && <meta property="og:image:alt" content={image.alt} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={image.url} />
      {image.alt && <meta name="twitter:image:alt" content={image.alt} />}
      {jsonLd && (
        <script
          key="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml({ '@context': 'https://schema.org', ...jsonLd }) }}
        />
      )}
      {children}
    </Head>
  );
};

export default SpellbookHead;
