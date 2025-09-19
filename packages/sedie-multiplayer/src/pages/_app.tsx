import "@shared/helpers/string-helper";
import "@shared/styles/errors.scss";
import "@shared/styles/main.scss";
import "@shared/styles/global.css";

import { TolgeeProvider } from "@tolgee/react";
import { ThemeProvider } from "next-themes";
import App, { AppContext, AppProps } from "next/app";
import Head from "next/head";
import { buildVersion, Themes } from "@shared/constants";
import { tolgee } from "@shared/tolgee";
import { LoadingSpinner } from "@shared/components/game-components/game-loading/loading-spinner";
import { GoogleAnalytic } from "@shared/components/page-components/google-analytics";


const SabaNumberApp = ({ Component, pageProps }: AppProps) => {

    return (
        <ThemeProvider defaultTheme={Themes.dark} enableSystem={false} attribute="data-theme">
            {/* <ThemeToggle /> */}
            <TolgeeProvider tolgee={tolgee} fallback={<LoadingSpinner />}>
                <AppTittle />
                <Component {...pageProps} />
                <GoogleAnalytic />
            </TolgeeProvider>
        </ThemeProvider>
    );
};

export const AppTittle = () => {
    return (
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            <title>Original Games</title>
            <link rel="shortcut icon" type="image/x-icon" href={`/favicons/favicon.ico?v=${buildVersion}`} sizes="any" />
            <link rel="icon" type="image/png" href={`/favicons/favicon2.png?v=${buildVersion}`} sizes="16x16" />
            <link rel="apple-touch-icon" type="image/png" href={`/favicons/favicon2.png?v=${buildVersion}`} sizes="any" />
            {/* Favicon for browsers that request /favicon.ico */}
            <link rel="icon" type="image/x-icon" href={`/favicons/favicon.ico?v=${buildVersion}`} />
        </Head>
    );
};
SabaNumberApp.getInitialProps = async (context: AppContext) => {
    const initialProps = await App.getInitialProps(context);
    return {
        ...initialProps,
    };
};

export default SabaNumberApp;