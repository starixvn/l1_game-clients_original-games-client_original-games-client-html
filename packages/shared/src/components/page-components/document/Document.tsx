/* eslint-disable @next/next/no-sync-scripts */
import Document, { DocumentContext, Head, Html, Main, NextScript } from "next/document";
import React from "react";
import { buildVersion } from "@shared/constants";
import { BASE_PATH } from "@shared/constants/base-path";

// eslint-disable-next-line import/no-anonymous-default-export
export default class extends Document<{ headScript?: string }> {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);

        // Always use single env config script now - c.js is served from root regardless of basePath
        const headScript = `/c.js`;
        return { ...initialProps, headScript };
    }

    render() {
        const headScript = (this.props as any)?.headScript || `/c.js`;
        const configFileWithVersion = `${headScript}?${buildVersion}`;

        return (
            <Html>
                <Head>
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="mobile-web-app-capable" content="yes" />
                    <script type="text/javascript" src={configFileWithVersion}></script>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
