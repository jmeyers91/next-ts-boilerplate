import React from 'react';
import Document, { Head, Main, NextScript, } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
class AppDocument extends Document {
    static getInitialProps(context) {
        const sheet = new ServerStyleSheet();
        const page = context.renderPage(App => props => {
            return sheet.collectStyles(React.createElement(App, Object.assign({}, props)));
        });
        const styleTags = sheet.getStyleElement();
        return Object.assign({}, page, { styleTags });
    }
    render() {
        return (React.createElement("html", null,
            React.createElement(Head, null, this.props.styleTags),
            React.createElement("body", null,
                React.createElement(Main, null),
                React.createElement(NextScript, null))));
    }
}
export default AppDocument;
//# sourceMappingURL=_document.js.map