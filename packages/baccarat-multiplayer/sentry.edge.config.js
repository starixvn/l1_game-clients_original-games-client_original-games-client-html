// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever middleware or an Edge route handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { getAppSettings } from "@shared/app-settings";

const appSettings = getAppSettings();
const sentryConfig = appSettings.sentry || {};

if (sentryConfig) {
    Sentry.init({
        ...sentryConfig,
        tracesSampleRate: 0.1,
    });
}
