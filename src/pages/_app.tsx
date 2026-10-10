import 'styles/globals.css';
import 'styles/view-transitions.css';
import type { AppProps } from 'next/app';
import 'react-tooltip/dist/react-tooltip.css';
import { pageview } from 'lib/googleAnalytics';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import ProgressBar from 'components/ui/ProgressBar/ProgressBar';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import PageWrapper from 'components/layout/PageWrapper/PageWrapper';
import Script from 'next/script';
import { SpoilerContext, searchesForSpoilers } from 'lib/card/spoilers';
import { queryParameterAsString } from 'lib/http/queryParameters';
import { ApiErrorProps } from 'lib/http/apiErrorPage';
import HttpErrorPage from 'components/ui/HttpErrorPage/HttpErrorPage';
import NavigationTransitionTypes from 'components/ui/NavigationTransitionTypes/NavigationTransitionTypes';
import { getTransitionKey, TransitionPage } from 'lib/viewTransitions';

config.autoAddCss = false;

export default function App({ Component, pageProps }: AppProps<Partial<ApiErrorProps>>) {
  const router = useRouter();
  const isClient = typeof window !== 'undefined';

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
      <ProgressBar color="#9161f3" />
      <NavigationTransitionTypes />
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
      <SpoilerContext value={searchesForSpoilers(queryParameterAsString(router.query.q))}>
        <PageWrapper transitionKey={getTransitionKey(Component as TransitionPage, router)}>
          {pageProps.apiError ? (
            <HttpErrorPage status={pageProps.apiError.status} retryAfter={pageProps.apiError.retryAfter} />
          ) : (
            <Component {...pageProps} />
          )}
        </PageWrapper>
      </SpoilerContext>
    </>
  );
}
