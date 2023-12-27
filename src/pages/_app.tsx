import "../assets/globals.scss";
import type { AppProps } from "next/app";
import "react-tooltip/dist/react-tooltip.css";
import Script from "next/script";
import { GA_TRACKING_ID, pageview } from "../lib/googleAnalytics";
import { useRouter } from "next/router";
import { useEffect } from "react";
import NextNProgress from 'nextjs-progressbar';
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Script
        id="ga1"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="ga2"
        strategy="afterInteractive"
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
      <NextNProgress options={{showSpinner: false}} color={"#9161f3"}/>
      <Component {...pageProps} />
    </>
  );
}
