/* eslint-disable */
window.envConfig = {
    serverDomainMapper: {
        localhost: "lumigame.com",
        "10.5.10.12": "lumigame.com",
        "10.5.10.35": "lumigame.com",
        "10.5.10.66": "lumigame.com",
        "10.5.10.17": "lumigame.com",
        "10.5.10.33": "lumigame.com",
    },
    proxy: {
        ssl: true,
        subDomain: "l2-proxy1",
        path: "",
    },
    sentry: {
        dsn: "https://9c999f9b51e3b4543cb160b946b5bcbe@sentry-k8s.lumigame.com/30",
        environment: "DEV",
    },
    subGuideDomain: "l2-guide-1",
    enableMsgpackParser: false,
    system: "VG",
    appType: 10,
};
