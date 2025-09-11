import "../_shared/helpers/string-helper";
import "../styles/errors.scss";
import "../styles/main.scss";
import "../styles/global.css";

import { TolgeeProvider } from "@tolgee/react";
import { ThemeProvider } from "next-themes";
import App, { AppContext, AppProps } from "next/app";
import Head from "next/head";
import { buildVersion, Themes } from "../_shared/constants";
import { tolgee } from "../_shared/tolgee";
import { LoadingSpinner } from "../components/game-components/game-loading/loading-spinner";
import { GoogleAnalytic } from "../components/page-components/google-analytics";
import { URLContext, initialURLContextData } from "../_shared/react-contexts/url-context";
import { PlayerContext } from "../_shared/react-contexts/auth";
import { useState } from "react";


const SabaNumberApp = ({ Component, pageProps }: AppProps) => {
    const [playerContext, setPlayerContext] = useState(() => ({
        locale: "en",
        enableQuickBet: true,
    }));

    const updatePlayerContext = (updates: Partial<typeof playerContext>) => {
        setPlayerContext(prev => ({ ...prev, ...updates }));
    };

    return (
        <URLContext.Provider value={initialURLContextData}>
            <PlayerContext.Provider value={{
                ...playerContext,
                setBalance: (balance: number) => updatePlayerContext({ balance }),
                signOut: () => updatePlayerContext({ session: undefined, authorizeInfo: undefined }),
                setSession: (session: any) => updatePlayerContext({ session }),
                setAuthorizeInfo: (authorizeInfo: any) => updatePlayerContext({ authorizeInfo }),
                setLocale: (locale: string) => updatePlayerContext({ locale }),
            }}>
                <ThemeProvider defaultTheme={Themes.dark} enableSystem={false} attribute="data-theme">
                    {/* <ThemeToggle /> */}
                    <TolgeeProvider tolgee={tolgee} fallback={<LoadingSpinner />}>
                        <AppTittle />
                        <Component {...pageProps} />
                        <GoogleAnalytic />
                    </TolgeeProvider>
                </ThemeProvider>
            </PlayerContext.Provider>
        </URLContext.Provider>
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
