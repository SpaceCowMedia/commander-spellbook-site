import '../assets/globals.css';
import type { AppContext, AppProps } from 'next/app';
import 'react-tooltip/dist/react-tooltip.css';
import { pageview } from '../lib/googleAnalytics';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import NextNProgress from 'nextjs-progressbar';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import PageWrapper from 'components/layout/PageWrapper/PageWrapper';
import Script from 'next/script';
import { CookiesProvider } from 'react-cookie';
import Cookies from 'universal-cookie';

config.autoAddCss = false;

export default function App({ Component, pageProps, cookies }: AppProps & { cookies: any }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <NextNProgress options={{ showSpinner: false }} color={'#9161f3'} />
      <header>
        {isClient && window.location.hostname === 'commanderspellbook.com' && (
          <Script
            async
            data-cfasync="false"
            data-noptimize="1"
            src="//scripts.pubnation.com/tags/5843d1fc-ee57-4ce9-8b8a-3516d1f3ea93.js"
            type="text/javascript"
          />
        )}
      </header>
      <CookiesProvider cookies={typeof window !== 'undefined' ? undefined : new Cookies(cookies)}>
        <PageWrapper>
          <Component {...pageProps} />
        </PageWrapper>
      </CookiesProvider>
    </>
  );
}

App.getInitialProps = async (context: AppContext): Promise<any> => {
  return { cookies: context.ctx.req?.headers?.cookie };
};
