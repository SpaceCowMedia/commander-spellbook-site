import Document, { Html, Head, Main, NextScript } from 'next/document';

// Runs before first paint so the theme is correct on statically optimized pages,
// where the server cannot know the cookie. Kept in sync with services/theme.service.
const APPLY_THEME_BEFORE_PAINT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):'system';var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <script dangerouslySetInnerHTML={{ __html: APPLY_THEME_BEFORE_PAINT }} />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Josefin%20Sans&display=swap" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
