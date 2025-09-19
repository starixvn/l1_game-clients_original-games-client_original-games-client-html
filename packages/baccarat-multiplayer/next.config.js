const path = require("path");
const gameSettings = require("./game-settings.json");
const configs = require("./configs.json");
const { v4: uuidv4 } = require("uuid");
const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const buildVersion = new Date().getTime();

const createAppSettings = (config) => ({
    ...config,
    gameSettings,
});

const baseAppSettings = createAppSettings(configs);

const nextConfig = withSentryConfig({
    publicRuntimeConfig: baseAppSettings,
    productionBrowserSourceMaps: false,
    sentry: {
        disableServerWebpackPlugin: true,
        disableClientWebpackPlugin: true,
        hideSourceMaps: true,
    },
    generateBuildId: async () => uuidv4(),
    experimental: { externalDir: true },
    transpilePackages: ["@shared/merged"],
    webpack: (config, options) => {
        config.devtool = false;
        config.resolve.alias = {
            ...config.resolve.alias,
            "@shared": path.resolve(__dirname, "../shared/src"),
            "@": path.resolve(__dirname, "src"),
            "@baccarat": path.resolve(__dirname, "src"),
        };
        return config;
    },
    basePath,
    assetPrefix: basePath || undefined,
    env: {
        buildVersion: String(buildVersion),
        REACT_APP_TOLGEE_API_URL: "https://tolgee.sabagame.com/",
        REACT_APP_TOLGEE_API_KEY: "tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc",
    },
    async rewrites() {
        // Build remote origin for proxying API requests in dev/standalone
        const serverDomain = (baseAppSettings?.serverDomainMapper && baseAppSettings.serverDomainMapper["localhost"]) || "lumigame.com";
        const proxyConf = baseAppSettings?.proxy || { ssl: true, subDomain: "l2-proxy1", path: "" };
        const protocol = proxyConf.ssl ? "https" : "http";
        const remoteOrigin = `${protocol}://${proxyConf.subDomain}.${serverDomain}`;
        const proxyPath = proxyConf.path || "";

        const base = [
            {
                source: "/health",
                destination: "/api/health",
            },
            // Proxy user/lobby service calls to remote to avoid CORS in standalone dev
            {
                source: "/user/:path*",
                destination: `${remoteOrigin}${proxyPath}/user/:path*`,
            },
            {
                source: "/lobby/:path*",
                destination: `${remoteOrigin}${proxyPath}/lobby/:path*`,
            },
        ];

        // If a basePath is set, support a dynamic :gameId segment after it
        if (basePath) {
            const baseNoSlash = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
            const prodGameIdRewrites = [
                {
                    source: `${baseNoSlash}/:gameId/_next/:path*`,
                    destination: `${baseNoSlash}/_next/:path*`,
                },
                {
                    source: `${baseNoSlash}/:gameId/static/:path*`,
                    destination: `${baseNoSlash}/static/:path*`,
                },
                {
                    source: `${baseNoSlash}/:gameId/:path*`,
                    destination: `${baseNoSlash}/:path*`,
                },
                {
                    source: `${baseNoSlash}/:gameId`,
                    destination: `${baseNoSlash}`,
                },
            ];
            return [...base, ...prodGameIdRewrites];
        }

        // Allow accessing the app under /:gameId/... on localhost without setting basePath
        const devGameIdRewrites = [
            // Assets under _next
            {
                source: "/:gameId/_next/:path*",
                destination: "/_next/:path*",
            },
            // Legacy static (if any)
            {
                source: "/:gameId/static/:path*",
                destination: "/static/:path*",
            },
            // App routes and public assets
            {
                source: "/:gameId/:path*",
                destination: "/:path*",
            },
            {
                source: "/:gameId",
                destination: "/",
            },
        ];

        return [...base, ...devGameIdRewrites];
    },
    async headers() {
        return [
            {
                source: "/:all*(js|png|json|mp3|webp|svg|jpg|gif)",
                locale: false,
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, must-revalidate",
                    },
                ],
            },
        ];
    },
    sassOptions: {
        prependData: `$version-image: '${buildVersion}'; $base-path: '${basePath}';`,
        includePaths: [
            require("path").resolve(__dirname, "../shared/src/styles"),
            require("path").resolve(__dirname, "../shared/src/components"),
        ],
        importer: function (url) {
            // Resolve SCSS imports that use the @shared alias
            if (typeof url === "string" && url.startsWith("@shared/")) {
                const path = require("path");
                const resolved = path.resolve(__dirname, "../shared/src", url.replace(/^@shared\//, ""));
                return { file: resolved };
            }
            return null;
        },
    },
});

module.exports = withBundleAnalyzer(nextConfig);
