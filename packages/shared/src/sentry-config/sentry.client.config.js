// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { getAppSettings } from "@shared/app-settings";

const appSettings = getAppSettings();
const sentryConfig = appSettings.sentry || {};

if (sentryConfig) {
    Sentry.init({
        ...sentryConfig,
        tracesSampleRate: 1.0,
        ignoreErrors: ["Network Error"],
        beforeSendTransaction(transaction) {
            if (typeof window === "undefined") {
                return transaction;
            }

            if (transaction.transaction === "/") {
                const urlParams = new URLSearchParams(window.location.search);
                const gameId = urlParams.get("gameId") || process.env.NEXT_PUBLIC_DEFAULT_GAME_ID;
                const gameSettings = appSettings.gameSettings?.[gameId];
                const gameName = gameSettings?.gameName;

                transaction.transaction = `${gameName} ${transaction.transaction}`;
                transaction.tags = {
                    ...transaction.tags,
                    gameId,
                    gameName,
                };
            }

            return transaction;
        },
        integrations: [
            Sentry.browserTracingIntegration({
                enablePageLoadSpans: true,
            }),
        ],
    });
}
