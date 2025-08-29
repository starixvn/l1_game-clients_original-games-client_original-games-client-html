import "@testing-library/jest-dom";
jest.mock("next/dynamic", () => ({
    __esModule: true,
    default: (loader: any) => {
        const dynamicModule = jest.requireActual("next/dynamic");
        const dynamicActualComp = dynamicModule.default;
        const RequiredComponent = dynamicActualComp(() => loader().then((mod: any) => mod.default || mod));
        if (RequiredComponent?.render?.displayName) {
            RequiredComponent.render.displayName = loader.toString();
        }
        RequiredComponent.preload ? RequiredComponent.preload() : RequiredComponent.render.preload();
        return RequiredComponent;
    },
}));
jest.mock("next/config", () => () => ({
    publicRuntimeConfig: {
        proxy: {
            ssl: true,
            subDomain: "gn-proxy1",
            path: "",
        },
        sentry: {
            dsn: "",
            environment: "",
            tracesSampleRate: 1,
        },
        enableSourceMap: true,
        subGuideDomain: "gn-guide",
        enableMsgpackParser: false,
        system: "GN",
        appType: 10,
        useTolgeeStatic: false,
        socketGatewayPath: "gateway",
        gameSettings: {
            "1005": {
                id: 1005,
                gameName: "SeBall1",
                socketInfo: {
                    namespace: "seball1",
                    path: "seball1",
                },
                durations: {
                    wholeRound: 31,
                    wholeTurn: 31,
                    placingBets: 20,
                    lockingBet: 3,
                    showResult: 7,
                    resultAnimation: 4,
                    beforePlaceBet: 4,
                    switchRoundAnimation: 0,
                },
            },
        },
    },
}));

jest.mock("swiper/modules", () => ({
    Navigation: (_) => null,
    Pagination: (_) => null,
}));

jest.mock("swiper/react", () => ({
    Swiper: ({ children }) => <div data-testid="swiper-testid">{children}</div>,
    SwiperSlide: ({ children }) => <div data-testid="swiper-slide-testid">{children}</div>,
}));

// Provide a global IntersectionObserver mock for jsdom/Jest environment
if (!(global as any).IntersectionObserver) {
    (global as any).IntersectionObserver = class {
        constructor(_callback?: any, _options?: any) {}
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() { return []; }
    };
}