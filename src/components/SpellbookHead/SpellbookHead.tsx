import Head from 'next/head';
import React from 'react';
import { useRouter } from 'next/router';
import { GA_TRACKING_ID } from 'lib/googleAnalytics';

type Props = {
  children?: React.ReactNode;
  title: string;
  description: string;
  imageUrl?: string;
  imageWidth?: string;
  imageHeight?: string;
  useCropDimensions?: boolean;
};

const SpellbookHead: React.FC<Props> = ({
  children,
  title,
  description,
  imageUrl,
  imageWidth,
  imageHeight,
  useCropDimensions,
}) => {
  const router = useRouter();
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
      <meta property="og:description" content={description} />
      <meta name="twitter:description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      <meta property="og:url" content={router.asPath} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl || '/images/link-preview.png'} />
      <meta name="twitter:image" content={imageUrl} />
      <meta property="og:image:width" content={imageWidth || (useCropDimensions ? '626' : '1200')} />
      <meta property="og:image:height" content={imageHeight || (useCropDimensions ? '457' : '628')} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta name="twitter:card" content="summary_large_image" />
      {children}
    </Head>
  );
};

export default SpellbookHead;
