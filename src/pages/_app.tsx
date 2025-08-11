import "../_shared/helpers/string-helper";
import "../styles/errors.scss";
import "../styles/main.scss";

import { TolgeeProvider } from "@tolgee/react";
import { ThemeProvider } from "next-themes";
import App, { AppContext, AppProps } from "next/app";
import Head from "next/head";
import { buildVersion, Themes } from "../_shared/constants";
import { useURLContext } from "../_shared/react-contexts";
import { tolgee } from "../_shared/tolgee";
import { LoadingSpinner } from "../components/game-components/game-loading/loading-spinner";
import { GoogleAnalytic } from "../components/page-components/google-analytics";

const SabaNumberApp = ({ Component, pageProps }: AppProps) => {
    console.log("[SabaNumberApp] SabaNumberApp rendering with Component:", Component.name);

    return (
        <ThemeProvider defaultTheme={Themes.dark} forcedTheme={Themes.dark}>
            <TolgeeProvider tolgee={tolgee} fallback={<LoadingSpinner />}>
                <AppTittle />
                <Component {...pageProps} />
                <GoogleAnalytic />
            </TolgeeProvider>
        </ThemeProvider>
    );
};

export const AppTittle = () => {
    console.log("[AppTittle] AppTittle rendering");
    return (
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            <title>SABA xD</title>
            <link rel="shortcut icon" type="image/x-icon" href={`/favicons/favicon.ico?v=${buildVersion}`} sizes="any" />
            <link rel="icon" type="image/png" href={`/favicons/favicon2.png?v=${buildVersion}`} sizes="16x16" />
            <link rel="apple-touch-icon" type="image/png" href={`/favicons/favicon2.png?v=${buildVersion}`} sizes="any" />
        </Head>
    );
};
SabaNumberApp.getInitialProps = async (context: AppContext) => {
    console.log("[SabaNumberApp] getInitialProps called");
    const initialProps = await App.getInitialProps(context);
    console.log("[SabaNumberApp] initialProps:", initialProps);
    return {
        ...initialProps,
    };
};

export default SabaNumberApp;
