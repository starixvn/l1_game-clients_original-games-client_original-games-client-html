const express = require("express");
const path = require("path");
const next = require("next");
const cors = require("cors");

// Factory function to create a custom server for a specific game
function createCustomServer(gameName) {
    const fs = require("fs");
    const dev = process.env.NODE_ENV !== "production";
    const hostname = process.env.HOSTNAME || "localhost";
    const port = parseInt(process.env.PORT, 10) || 3000;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const FONTS_PATH_PREFIX = "/static/fonts/";

    // Create the Next.js app
    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    app.prepare()
        .then(() => {
            const server = express();

            // Configure CORS
            server.use(
                cors({
                    origin: "*",
                    credentials: true,
                    methods: ["GET", "POST", "OPTIONS"],
                    allowedHeaders: ["Content-Type", "Authorization"],
                })
            );

            // Serve static files from .next/static
            server.use("/_next/static", (req, res, next) => {
                express.static(path.join(__dirname, "..", "..", gameName, ".next/static"), {
                    maxAge: "1y",
                    immutable: true,
                })(req, res, next);
            });

            // Handle favicon.ico requests - browsers request this from root
            server.get("/favicon.ico", (req, res) => {
                res.sendFile(path.join(__dirname, "..", "..", gameName, "public", "favicons", "favicon.ico"));
            });

            // Handle health check requests directly
            server.get("/health", (req, res) => {
                res.status(200).send("healthy");
            });

            // Handle Next.js image optimization URLs before Next.js processes them
            server.use("/_next/image", (req, res, next) => {
                const urlParam = req.query?.url;

                // Strip basePath from image URLs if present
                if (urlParam?.startsWith(basePath)) {
                    const newUrl = urlParam.slice(basePath.length);
                    req.query.url = newUrl;
                }

                // Continue to Next.js image optimization
                next();
            });

            // Also handle root-level static files for compatibility
            server.use((req, res, next) => {
                if (req.url.startsWith("/static/")) {
                    let staticPath;
                    if (req.url.startsWith(FONTS_PATH_PREFIX)) {
                        // Check game package first for fonts, fallback to shared
                        const gameFontsPath = path.join(__dirname, "..", "..", gameName, "public", "static", "fonts");

                        // Check if file exists in game package
                        const relativePath = req.url.replace(FONTS_PATH_PREFIX, "");
                        const gameFilePath = path.join(gameFontsPath, relativePath);

                        if (fs.existsSync(gameFilePath)) {
                            staticPath = path.join(__dirname, "..", "..", gameName, "public");
                        } else {
                            staticPath = path.join(__dirname, "..", "public");
                        }
                    } else {
                        // Serve other static files from game package
                        staticPath = path.join(__dirname, "..", "..", gameName, "public");
                    }

                    express.static(staticPath, {
                        maxAge: "1y",
                    })(req, res, (err) => {
                        next(err);
                    });
                } else {
                    next();
                }
            });

            // Helper function to process basePath routing logic
            function processBasePathRouting(req, originalUrl, basePath) {
                let shouldServeIndex = false;
                let transformedUrl = originalUrl;

                if (basePath) {
                    // Note: Next.js image optimization URLs are handled by dedicated middleware above

                    // Transform URL based on basePath
                    const result = transformUrlForBasePath(req.url, basePath, originalUrl);
                    transformedUrl = result.transformedUrl;
                    shouldServeIndex = result.shouldServeIndex;
                }

                return { transformedUrl, shouldServeIndex };
            }

            // Helper function to transform URLs for basePath handling
            function transformUrlForBasePath(url, basePath, originalUrl) {
                let transformedUrl = url;
                let shouldServeIndex = false;

                if (url === basePath || url === basePath + "/") {
                    // Root page request with basePath - convert to internal root
                    transformedUrl = "/";
                } else if (url.startsWith(basePath + "/")) {
                    // Request has basePath prefix - remove it for Next.js (which has no basePath configured)
                    const newUrl = url.slice(basePath.length);
                    transformedUrl = newUrl;

                    // Check if this is a potential SPA route that should fall back to index
                    if (isSPARoute(newUrl)) {
                        shouldServeIndex = true;
                    }
                } else if (url.startsWith(basePath + "?")) {
                    // Handle basePath with query parameters (e.g., /game-150?token=...)
                    transformedUrl = "/" + url.slice(basePath.length);
                }

                return { transformedUrl, shouldServeIndex };
            }

            // Helper function to determine if a URL should be treated as an SPA route
            function isSPARoute(url) {
                // Exclude API routes, static assets, and known file extensions
                return (
                    !url.startsWith("/api/") &&
                    !url.includes("/_next/") &&
                    !url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt)$/i)
                );
            }

            // Helper function to setup redirect interception
            function setupRedirectInterception(res, basePath) {
                const originalRedirect = res.redirect;
                res.redirect = function (status, url) {
                    if (basePath && url && typeof url === "string" && !url.startsWith("http") && !url.startsWith(basePath)) {
                        // In production with reverse proxy, add basePath back to redirects
                        url = basePath + url;
                    }
                    return originalRedirect.call(this, status, url);
                };
            }

            // Helper function to setup SPA fallback for 404 responses
            function setupSPAFallback(req, res, originalUrl, handle) {
                const originalSend = res.send;
                const originalStatus = res.status;
                let is404 = false;

                // Override res.status to detect 404s
                res.status = function (code) {
                    if (code === 404) {
                        is404 = true;
                    }
                    return originalStatus.call(this, code);
                };

                // Override res.send to intercept 404 responses
                res.send = function (body) {
                    if (is404) {
                        // Reset the response and serve the index page
                        res.status(200);
                        req.url = "/"; // Serve the root page for SPA fallback
                        return handle(req, res);
                    }
                    return originalSend.call(this, body);
                };
            }

            // Handle all other routes with Next.js
            server.all("*", (req, res) => {
                const originalUrl = req.url;

                // Process the URL for basePath handling
                const { transformedUrl, shouldServeIndex } = processBasePathRouting(req, originalUrl, basePath);

                req.url = transformedUrl;

                // Setup SPA fallback for 404s if needed
                if (shouldServeIndex) {
                    setupSPAFallback(req, res, originalUrl, handle);
                }

                // Setup redirect interception for basePath
                setupRedirectInterception(res, basePath);

                try {
                    return handle(req, res);
                } catch (error) {
                    console.error(`❌ [Next.js Handler] Error handling request: ${originalUrl} → ${req.url}`, error);
                    res.status(500).send("Internal Server Error");
                }
            });

            server.listen(port, hostname, (err) => {
                if (err) throw err;
            });
        })
        .catch((ex) => {
            console.error(ex.stack);
            process.exit(1);
        });
}

module.exports = { createCustomServer };
