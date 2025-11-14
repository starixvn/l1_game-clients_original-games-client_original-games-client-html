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

const nextConfig = {
    compiler: {
        removeConsole: true,
    },
    publicRuntimeConfig: baseAppSettings,
    productionBrowserSourceMaps: false,
    pageExtensions: ["tsx", "ts", "jsx", "js"],
    generateBuildId: async () => uuidv4(),
    async rewrites() {
        return [
            {
                source: `${basePath}/api/health`,
                destination: "/api/health",
            },
        ];
    },
    experimental: {
        externalDir: true,
        serverComponentsExternalPackages: [],
        esmExternals: "loose",
    },
    images: {
        // Use custom image loader to handle basePath properly for reverse proxy environments
        loader: "custom",
        loaderFile: "./src/image-loader.js",
        // Disable image optimization since static files are served directly and work fine
        unoptimized: true,
        // Allow images from any domain for flexibility
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    transpilePackages: ["@shared/merged"],
    webpack: (config, { isServer }) => {
        config.devtool = false;
        config.resolve.alias = {
            ...config.resolve.alias,
            "@shared": path.resolve(__dirname, "../shared/src"),
            "@": path.resolve(__dirname, "src"),
            "@plinko": path.resolve(__dirname, "src"),
        };
        return config;
    },
    basePath: "", // Custom server handles basePath
    assetPrefix: basePath,
    env: {
        buildVersion: String(buildVersion),
        REACT_APP_TOLGEE_API_URL: "https://tolgee.sabagame.com/",
        REACT_APP_TOLGEE_API_KEY: "tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc",
    },
    sassOptions: {
        prependData: `$version-image: '${buildVersion}'; $base-path: '${basePath}';`,
        includePaths: [path.resolve(__dirname, "../shared/src/styles"), path.resolve(__dirname, "../shared/src/components")],
        importer: function (url) {
            // Resolve SCSS imports that use the @shared alias
            if (typeof url === "string" && url.startsWith("@shared/")) {
                let resolvedPath = url.replace(/^@shared\//, "");

                // If no extension provided, treat as SCSS partial (add _ prefix and .scss extension)
                if (!resolvedPath.includes(".scss") && !resolvedPath.includes(".css")) {
                    const parts = resolvedPath.split("/");
                    const filename = parts.pop();
                    const dirname = parts.join("/");
                    resolvedPath = dirname ? `${dirname}/_${filename}.scss` : `_${filename}.scss`;
                }

                const fullPath = path.resolve(__dirname, "../shared/src", resolvedPath);
                return { file: fullPath };
            }
            return null;
        },
    },
    output: "standalone",
};

const sentryConfig = {
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
    hideSourceMaps: true,
};

module.exports = withBundleAnalyzer(withSentryConfig(nextConfig, sentryConfig));
