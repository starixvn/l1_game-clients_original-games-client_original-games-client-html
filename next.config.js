const gameSettings = require("./game-settings.json");
const configs = require("./configs.json");
const { v4: uuidv4 } = require("uuid");
const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const enableDevGameIdRewrites = !basePath;

// Create a configuration that can be dynamically updated
const createAppSettings = (config) => ({
    ...config,
    gameSettings,
});

const baseAppSettings = createAppSettings(configs);
const buildVersion = new Date().getTime();

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = withSentryConfig({
    publicRuntimeConfig: baseAppSettings,
    productionBrowserSourceMaps: false,
    sentry: {
        disableServerWebpackPlugin: true,
        disableClientWebpackPlugin: true,
        hideSourceMaps: true,
    },
    generateBuildId: async () => uuidv4(),
    webpack: (config, options) => {
        // Disable source maps
        config.devtool = false;

        config.module.rules.push({
            test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2|mp3|webp)$/,
            use: {
                loader: "url-loader",
                options: {
                    limit: 100000,
                },
            },
        });

        return config;
    },
    basePath,
    assetPrefix: basePath || undefined,
    env: {
        buildVersion,
        REACT_APP_TOLGEE_API_URL: "https://tolgee.sabagame.com/",
        REACT_APP_TOLGEE_API_KEY: "tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc",
    },
    async rewrites() {
        const base = [
            {
                source: "/health",
                destination: "/api/health",
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
        prependData: `$version-image: '${buildVersion}';`,
    },
    output: "standalone",
});

module.exports = withBundleAnalyzer(nextConfig);
