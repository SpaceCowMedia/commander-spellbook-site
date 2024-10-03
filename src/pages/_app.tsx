import '../assets/globals.scss';
import type { AppProps } from 'next/app';
import 'react-tooltip/dist/react-tooltip.css';
import { pageview } from '../lib/googleAnalytics';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import NextNProgress from 'nextjs-progressbar';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import PageWrapper from 'components/layout/PageWrapper/PageWrapper';

config.autoAddCss = false;

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <NextNProgress options={{ showSpinner: false }} color={'#9161f3'} />
      <PageWrapper>
        <Component {...pageProps} />
      </PageWrapper>
    </>
  );
}
