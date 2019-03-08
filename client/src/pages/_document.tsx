import React from 'react';
import Document, {
  Head,
  Main,
  NextScript,
  NextDocumentContext,
} from 'next/document';
import { ServerStyleSheet } from 'styled-components';

type Props = {
  styleTags: React.ReactElement;
};

class AppDocument extends Document<Props> {
  static getInitialProps(context: NextDocumentContext) {
    const sheet = new ServerStyleSheet();
    const page = context.renderPage(App => props => {
      return sheet.collectStyles(<App {...props} />);
    });
    const styleTags = sheet.getStyleElement();
    return { ...page, styleTags };
  }

  render() {
    return (
      <html>
        <Head>{this.props.styleTags}</Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

export default AppDocument;
