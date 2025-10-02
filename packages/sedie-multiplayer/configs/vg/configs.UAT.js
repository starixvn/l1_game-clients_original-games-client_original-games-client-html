window.envConfig = {
    proxy: {
        ssl: true,
        subDomain: "uat-proxy",
        path: "/uat",
    },
    sentry: {
        dsn: "https://eb5f1c92d1da4cb6a059fa40c1276a9d@sentry.lumigame.com/48",
        environment: "UAT",
    },
    openreplay: {
        projectKey: "",
        disableSecureMode: true,
        defaultInputMode: 2,
        obscureTextNumbers: false,
        obscureTextEmails: true,
    },
    enableSourceMap: false,
    subGuideDomain: "uat-guide",
    enableMsgpackParser: true,
    system: "VG",
    appType: 10,
    enableDebugLogs: true,
    socketGatewayPath: "gateway",
    useTolgeeStatic: true,
};
