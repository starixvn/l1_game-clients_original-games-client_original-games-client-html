/* eslint-disable @next/next/no-sync-scripts */
import Document, { DocumentContext, Head, Html, Main, NextScript } from "next/document";
import React from "react";
import { buildVersion } from "../_shared/constants";

// eslint-disable-next-line import/no-anonymous-default-export
export default class extends Document<{ headScript?: string }> {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);

        // Determine which env config to load based on gameId/op in the URL
        let headScript = "./c.js";
        try {
            const reqUrl = ctx?.req?.url || "";
            const base = "http://localhost";
            const url = new URL(reqUrl, base);
            const gameIdParam = Number(url.searchParams.get("gameId") || 0);
            const opParam = (url.searchParams.get("op") || "").toUpperCase();
            if (gameIdParam === 2 || opParam === "VG") {
                headScript = "./c-original.js";
            }
        } catch {
            // fallback to default script
        }

        return { ...initialProps, headScript } as any;
    }

    render() {
        const headScript = (this.props as any)?.headScript || "./c.js";
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
