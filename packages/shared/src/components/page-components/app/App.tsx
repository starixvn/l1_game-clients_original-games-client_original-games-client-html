import "@shared/helpers/string-helper";
import "@shared/styles/errors.scss";
import "@shared/styles/main.scss";
import "@shared/styles/global.css";

import { TolgeeProvider } from "@tolgee/react";
import { ThemeProvider } from "next-themes";
import App, { AppContext, AppProps } from "next/app";
import Head from "next/head";
import { AppTypes, buildVersion, Themes } from "@shared/constants";
import { tolgee } from "@shared/tolgee";
import { LoadingSpinner } from "@shared/components/game-components/game-loading/loading-spinner";
import { GoogleAnalytic } from "@shared/components/page-components/google-analytics";
import { getGameConfig } from "@shared/game-config";
import { getAppSettings } from "@shared/app-settings";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getLanguage, getOperator } from "@shared/helpers/router-helper";

const GameApp = ({ Component, pageProps }: AppProps) => {
    const gameConfig = getGameConfig();

    return (
        <ThemeProvider defaultTheme={Themes.dark} enableSystem={false} attribute="data-theme">
            {/* <ThemeToggle /> */}
            <TolgeeProvider tolgee={tolgee} fallback={<LoadingSpinner />}>
                <AppTitle gameConfig={gameConfig} />
                <Component {...pageProps} />
                <GoogleAnalytic />
                {/* <LoggerControls className="fixed top-4 right-4 z-50" /> */}
            </TolgeeProvider>
        </ThemeProvider>
    );
};

interface AppTitleProps {
    gameConfig: {
        gameId: number;
        assetPath: string;
    };
}

const getTitleAndFavicon = (operator: string, language: string) => {
    switch (operator) {
        case "SP":
            return {
                title: "Saba Play",
                favicon: "favicon.ico",
            };
        case "VG":
            return {
                title: "Vgaming",
                favicon: "favicon-vgaming.ico",
            };
        case "SG":
            return {
                title: language === "vi" ? "Cổng Game SABA" : "SABA.games",
                favicon: "favicon-saba.ico",
            };
        case "TIP88":
            return {
                title: "SoiBet",
                favicon: "favicon-tip88.ico",
            };
        default:
            return {
                title: "Original Games",
                favicon: "favicon.ico",
            };
    }
};

export const AppTitle = ({ gameConfig }: AppTitleProps) => {
    const appSettings = getAppSettings();
    const router = useRouter();

    const [title, setTitle] = useState<string>("Original Games");
    const [favicon, setFavicon] = useState<string>("favicon.ico");

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        const { op, lang } = router.query;
        let operator = getOperator(op as string);
        let language = getLanguage(lang as string);

        if (appSettings.appType === AppTypes.ORIGINAL) {
            return;
        }

        const { title, favicon } = getTitleAndFavicon(operator, language);
        setTitle(title);
        setFavicon(favicon);
    }, [router.isReady]);

    return (
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            <title>{title}</title>
            <link rel="shortcut icon" href={`${gameConfig.assetPath}/favicons/${favicon}?v=${buildVersion}`} />
        </Head>
    );
};

GameApp.getInitialProps = async (context: AppContext) => {
    const initialProps = await App.getInitialProps(context);
    return {
        ...initialProps,
    };
};

export default GameApp;
