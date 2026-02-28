import { NextApiRequest } from 'next';
import Document, { Html, Head, Main, NextScript, DocumentInitialProps, DocumentContext } from 'next/document';

type MyDocumentInitialProps = {
  documentClass: string;
} & DocumentInitialProps;

export default class MyDocument extends Document<MyDocumentInitialProps> {
  static async getInitialProps(ctx: DocumentContext) {
    const documentClass = (ctx.req as NextApiRequest)?.cookies.theme || 'light';
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      documentClass,
    };
  }
  render() {
    return (
      <Html lang="en" className={this.props.documentClass === 'light' ? 'light' : 'dark'}>
        <Head>
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
