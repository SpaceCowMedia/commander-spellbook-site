import Head from 'next/head';
import React from 'react';
import { useRouter } from 'next/router';
import { GA_TRACKING_ID } from 'lib/googleAnalytics';

type Props = {
  children?: React.ReactNode;
  title: string;
  description: string;
  imageUrl?: string;
};

const SpellbookHead: React.FC<Props> = ({ children, title, description, imageUrl }) => {
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
      {imageUrl && ['png', 'jpg', 'jpeg', 'gif', 'webp'].every((ext) => !imageUrl.endsWith(`.${ext}`)) && (
        <meta property="og:image:type" content="image/png" />
      )}
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      {imageUrl && <meta name="twitter:card" content="summary_large_image" />}
      {children}
    </Head>
  );
};

export default SpellbookHead;
