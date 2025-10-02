window.envConfig = {
    proxy: {
        ssl: true,
        subDomain: "l2proxy",
        path: "/sit",
    },
    sentry: {
        dsn: "https://eb5f1c92d1da4cb6a059fa40c1276a9d@sentry.lumigame.com/48",
        environment: "SIT",
    },
    openreplay: {
        projectKey: "",
        disableSecureMode: true,
        defaultInputMode: 2,
        obscureTextNumbers: false,
        obscureTextEmails: true,
    },
    enableSourceMap: false,
    subGuideDomain: "l2guides",
    enableMsgpackParser: true,
    system: "VG",
    appType: 10,
    enableDebugLogs: true,
    socketGatewayPath: "l2gwsit",
    useTolgeeStatic: true,
};
