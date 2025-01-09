import { Html, Head, Main, NextScript } from 'next/document';
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Josefin%20Sans&display=swap"/>
        <Script
          async
          data-cfasync='false'
          data-noptimize='1'
          src='//scripts.pubnation.com/tags/5843d1fc-ee57-4ce9-8b8a-3516d1f3ea93.js'
          type='text/javascript'
        />
      </Head>
      <body>
      <Main/>
      <NextScript/>
      </body>
    </Html>
  );
}
