/* eslint-disable @next/next/no-sync-scripts */
import Document, { DocumentContext, Head, Html, Main, NextScript } from "next/document";
import React from "react";
import { buildVersion } from "@shared/constants";
import { BASE_PATH } from "@shared/constants/base-path";

// eslint-disable-next-line import/no-anonymous-default-export
export default class extends Document<{ headScript?: string }> {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);

        // Always use single env config script now
        const headScript = `${BASE_PATH}/c.js`;

        // Debug logging for basePath issues
        console.log('📄 DOCUMENT getInitialProps:', {
            BASE_PATH,
            headScript,
            url: ctx.req?.url,
            env_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH
        });

        return { ...initialProps, headScript };
    }

    render() {
        const headScript = (this.props as any)?.headScript || `${BASE_PATH}/c.js`;
        const configFileWithVersion = `${headScript}?${buildVersion}`;

        // Debug logging for render phase
        console.log('📄 DOCUMENT render:', {
            BASE_PATH,
            headScript,
            configFileWithVersion,
            props_headScript: (this.props as any)?.headScript
        });

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
