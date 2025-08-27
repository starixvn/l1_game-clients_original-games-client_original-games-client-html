window.envConfig = {
    proxy: {
        ssl: true,
        subDomain: "uat-proxy",
        path: "/uat",
    },
    sentry: {
        dsn: "https://19b3909c434341f0b13eb3a8529e5862@sentry.lumigame.com/9",
        environment: "UAT",
    },
    enableSourceMap: false,
    subGuideDomain: "uat-guide",
    enableMsgpackParser: true,
    system: "SG",
    appType: 10,
    enableDebugLogs: true,
    socketGatewayPath: "gateway",
    useTolgeeStatic: true,
};
