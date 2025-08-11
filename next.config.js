const gameSettings = require("./game-settings.json");
const configs = require("./configs.json");
const configsOriginal = require("./configs-original.json");
const { v4: uuidv4 } = require("uuid");
const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

const basePath = "";

// Function to determine which config to use based on game
const getConfigForGame = (gameId) => {
    // SeDie game (ID 148) uses L2 configuration
    if (gameId === 148) {
        return configsOriginal;
    }
    // Other games use GN configuration
    return configs;
};

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
    env: {
        buildVersion,
        REACT_APP_TOLGEE_API_URL: "https://tolgee.sabagame.com/",
        REACT_APP_TOLGEE_API_KEY: "tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc",
    },
    async rewrites() {
        return [
            {
                source: "/health",
                destination: "/api/health",
            },
        ];
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
