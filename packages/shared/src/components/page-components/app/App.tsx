import "@shared/helpers/string-helper";
import "@shared/styles/errors.scss";
import "@shared/styles/main.scss";
import "@shared/styles/global.css";

import React from "react";
import { TolgeeProvider } from "@tolgee/react";
import { ThemeProvider } from "next-themes";
import App, { AppContext, AppProps } from "next/app";
import Head from "next/head";
import { buildVersion, Themes } from "@shared/constants";
import { tolgee } from "@shared/tolgee";
import { LoadingSpinner } from "@shared/components/game-components/game-loading/loading-spinner";
import { GoogleAnalytic } from "@shared/components/page-components/google-analytics";
import { getGameConfig } from "@shared/game-config";
import LoggerControls from "@shared/components/game-components/logger-controls/LoggerControls";

// Global error handlers to ensure LoggerControls always works
if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        // Don't prevent default to allow normal error handling
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
        console.error('Uncaught error:', event.error);
        // Don't prevent default to allow normal error handling
    });

    // Handle React errors
    window.addEventListener('error', (event) => {
        if (event.error && event.error.message && event.error.message.includes('React')) {
            console.error('React error caught globally:', event.error);
        }
    });
}

// Error Boundary that always shows LoggerControls
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('App Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-center text-white">
                        <h1 className="text-4xl font-bold mb-4 text-red-500">🚨 APPLICATION ERROR 🚨</h1>
                        <p className="text-xl mb-8">Something went wrong. LoggerControls should still be visible.</p>
                        <div className="text-sm text-gray-400 mb-4">
                            Error: {this.state.error?.message}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            Reload Application
                        </button>
                    </div>
                    {/* LoggerControls is always rendered outside the error boundary */}
                    <LoggerControls className="fixed top-4 right-4 z-50" />
                </div>
            );
        }

        return (
            <>
                {this.props.children}
                {/* LoggerControls is always rendered */}
                <LoggerControls className="fixed top-4 right-4 z-50" />
            </>
        );
    }
}

const GameApp = ({ Component, pageProps }: AppProps) => {
    const gameConfig = getGameConfig();

    return (
        <ErrorBoundary>
            <ThemeProvider defaultTheme={Themes.dark} enableSystem={false} attribute="data-theme">
                {/* <ThemeToggle /> */}
                <TolgeeProvider tolgee={tolgee} fallback={<LoadingSpinner />}>
                    <AppTitle gameConfig={gameConfig} />
                    <Component {...pageProps} />
                    <GoogleAnalytic />
                </TolgeeProvider>
            </ThemeProvider>
        </ErrorBoundary>
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
