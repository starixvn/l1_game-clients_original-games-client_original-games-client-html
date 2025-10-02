import { GameSettings } from "@shared/components/game-base/type";

interface ProxySetting {
    ssl: string;
    subDomain: string;
    path: string;
}

interface SentryOptions {
    dsn: string;
    environment: string;
}

interface OpenReplayOptions {
    projectKey: string;
    ingestPoint?: string;
    disableSecureMode: boolean;
    defaultInputMode: number;
    obscureTextNumbers: boolean;
    obscureTextEmails: boolean;
}

export default interface AppSettings {
    serverDomainMapper: Array<string>;
    socketGatewayPath: string;
    proxy: ProxySetting;
    sentry: SentryOptions;
    openreplay?: OpenReplayOptions;
    gameSettings: { [id: string]: GameSettings };
    subGuideDomain: string;
    googleAnalyticId: string;
    enableMsgpackParser: boolean;
    system: string;
    appType: number;
    useTolgeeStatic: boolean;
    enableDebugLogs: boolean;
    gamePath: string;
    enablePreloadResource?: boolean;
}
