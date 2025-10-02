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
import dynamic from "next/dynamic";

// Dynamic import for OpenReplay to prevent SSR issues
const OpenReplayTracker = dynamic(
    () => import("@shared/components/page-components/open-replay").then((mod) => ({ default: mod.OpenReplayTracker })),
    { ssr: false }
);
import { getGameConfig } from "@shared/game-config";
import LoggerControls from "@shared/components/game-components/logger-controls/LoggerControls";

const GameApp = ({ Component, pageProps }: AppProps) => {
    const gameConfig = getGameConfig();

    return (
        <ThemeProvider defaultTheme={Themes.dark} enableSystem={false} attribute="data-theme">
            {/* <ThemeToggle /> */}
            <TolgeeProvider tolgee={tolgee} fallback={<LoadingSpinner />}>
                <AppTitle gameConfig={gameConfig} />
                <Component {...pageProps} />
                <GoogleAnalytic />
                <OpenReplayTracker />
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

export const AppTitle = ({ gameConfig }: AppTitleProps) => {
    return (
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            <title>Original Games</title>
            <link rel="shortcut icon" type="image/x-icon" href={`${gameConfig.assetPath}/favicons/favicon.ico?v=${buildVersion}`} sizes="any" />
            <link rel="icon" type="image/png" href={`${gameConfig.assetPath}/favicons/favicon2.png?v=${buildVersion}`} sizes="16x16" />
            <link rel="apple-touch-icon" type="image/png" href={`${gameConfig.assetPath}/favicons/favicon2.png?v=${buildVersion}`} sizes="any" />
            {/* Favicon for browsers that request /favicon.ico */}
            <link rel="icon" type="image/x-icon" href={`${gameConfig.assetPath}/favicons/favicon.ico?v=${buildVersion}`} />
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
