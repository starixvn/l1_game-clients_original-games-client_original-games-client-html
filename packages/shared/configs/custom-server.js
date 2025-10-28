const express = require("express");
const path = require("path");
const next = require("next");
const cors = require("cors");

// Factory function to create a custom server for a specific game
function createCustomServer(gameName) {
    const dev = process.env.NODE_ENV !== "production";
    const hostname = process.env.HOSTNAME || "localhost";
    const port = parseInt(process.env.PORT, 10) || 3000;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

    console.log(`🚀 Starting server with config:`);
    console.log(`  - Environment: ${process.env.NODE_ENV}`);
    console.log(`  - Hostname: ${hostname}`);
    console.log(`  - Port: ${port}`);
    console.log(`  - Base Path: ${basePath || "(none)"}`);
    console.log(`  - Dev Mode: ${dev}`);
    console.log(`  - Working Directory: ${__dirname}`);
    console.log(`  - Game: ${gameName}`);

    // Check if the problematic image file exists
    const fs = require("fs");
    const imagePath = path.join(
        __dirname,
        "..",
        "..",
        gameName,
        "public",
        "static",
        "images",
        gameName
        // "scoreboard",
        // "statistic-icon-white4.webp"
    );
    console.log(`🔍 Checking for statistic-icon-white4.webp:`);
    console.log(`  - Expected path: ${imagePath}`);
    console.log(`  - File exists: ${fs.existsSync(imagePath)}`);

    if (fs.existsSync(imagePath)) {
        const stats = fs.statSync(imagePath);
        console.log(`  - File size: ${stats.size} bytes`);
        console.log(`  - Last modified: ${stats.mtime}`);
    } else {
        console.log(`  - ❌ File not found!`);
        // List files in the directory
        const dirPath = path.dirname(imagePath);
        if (fs.existsSync(dirPath)) {
            console.log(`  - Available files in ${dirPath}:`, fs.readdirSync(dirPath));
        } else {
            console.log(`  - Directory doesn't exist: ${dirPath}`);
        }
    }

    // Create the Next.js app
    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    app.prepare()
        .then(() => {
            const server = express();

            // Configure CORS
            server.use(cors({
                origin: "*",
                credentials: true,
                methods: ["GET", "POST", "OPTIONS"],
                allowedHeaders: ["Content-Type", "Authorization"],
            }));

            // Add comprehensive logging middleware FIRST to catch ALL requests
            server.use((req, res, next) => {
                const timestamp = new Date().toISOString();
                console.log(
                    `📨 [${timestamp}] ${req.method} ${req.url} (User-Agent: ${req.get("User-Agent")?.substring(0, 50) || "unknown"})`
                );

                // Also log when response is finished
                res.on("finish", () => {
                    console.log(`📨 [${timestamp}] ${req.method} ${req.url} → ${res.statusCode}`);
                });

                next();
            });

            // Serve static files from .next/static
            server.use("/_next/static", (req, res, next) => {
                console.log(`📁 [Static] Serving _next/static file: ${req.url}`);
                express.static(path.join(__dirname, "..", "..", gameName, ".next/static"), {
                    maxAge: "1y",
                    immutable: true,
                })(req, res, next);
            });

            // Handle favicon.ico requests - browsers request this from root
            server.get("/favicon.ico", (req, res) => {
                console.log(`🎨 [Favicon] Serving favicon.ico from favicons directory`);
                res.sendFile(path.join(__dirname, "..", "..", gameName, "public", "favicons", "favicon.ico"));
            });

            // Handle health check requests directly
            server.get("/health", (req, res) => {
                res.status(200).send("healthy");
            });
            
            // Handle Next.js image optimization URLs before Next.js processes them
            server.use("/_next/image", (req, res, next) => {
                console.log(`🖼️  [Image Optimization] Intercepting Next.js image URL: ${req.url}`);
                console.log(`🖼️  [Image Optimization] BasePath configured: "${basePath}"`);
                console.log(`🖼️  [Image Optimization] Query params:`, JSON.stringify(req.query));

                const urlParam = req.query?.url;
                console.log(`🖼️  [Image Optimization] URL parameter: "${urlParam}"`);

                // Handle both cases: with basePath and without basePath in query parameter
                if (urlParam?.startsWith(basePath)) {
                    const newUrl = urlParam.slice(basePath.length);
                    console.log(`🖼️  [Image Optimization] BasePath "${basePath}" found in URL param`);
                    console.log(`🖼️  [Image Optimization] Updated image URL: "${urlParam}" → "${newUrl}"`);

                    // Update the query parameter for Next.js to process
                    req.query.url = newUrl;
                    console.log(`🖼️  [Image Optimization] Final URL parameter set to: "${req.query.url}"`);
                } else if (urlParam && !urlParam.startsWith("/static/")) {
                    // If URL parameter doesn't start with /static/ and doesn't have basePath,
                    // it might be a direct request that bypassed reverse proxy basePath handling
                    console.log(`🖼️  [Image Optimization] URL parameter doesn't start with /static/ or basePath: "${urlParam}"`);
                    console.log(`🖼️  [Image Optimization] This might be a direct request - checking if it needs basePath handling`);

                    // For direct requests that might have basePath in query, try to strip it
                    if (urlParam.startsWith(basePath)) {
                        const newUrl = urlParam.slice(basePath.length);
                        req.query.url = newUrl;
                        console.log(`🖼️  [Image Optimization] Stripped basePath from direct request: "${urlParam}" → "${newUrl}"`);
                    }
                } else {
                    console.log(`🖼️  [Image Optimization] No basePath processing needed for: "${urlParam}"`);
                }

                // Continue to Next.js image optimization
                next();
            });

            // Serve static files from public with basePath support
            server.use("/static", (req, res, next) => {
                console.log(`📁 [Static] Processing: ${req.url}`);

                // For direct access or reverse proxy scenarios, serve static files
                express.static(path.join(__dirname, "..", "..", gameName, "public"), {
                    maxAge: "1y",
                })(req, res, (err) => {
                    if (err) {
                        console.log(`📁 [Static] File not found or error: ${req.url}`, err.message);
                    }
                    next(err);
                });
            });

            // Also handle root-level static files for compatibility
            server.use((req, res, next) => {
                if (req.url.startsWith("/static/")) {
                    console.log(`📁 [Static Fallback] Processing: ${req.url}`);
                    express.static(path.join(__dirname, "..", "..", gameName, "public"), {
                        maxAge: "1y",
                    })(req, res, (err) => {
                        if (err) {
                            console.log(`📁 [Static Fallback] File not found or error: ${req.url}`, err.message);
                        }
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
                    console.log(`📍 [BasePath Logic] basePath: "${basePath}", originalUrl: "${originalUrl}"`);

                    // Note: Next.js image optimization URLs are handled by dedicated middleware above

                    // Transform URL based on basePath
                    const result = transformUrlForBasePath(req.url, basePath, originalUrl);
                    transformedUrl = result.transformedUrl;
                    shouldServeIndex = result.shouldServeIndex;
                } else {
                    console.log(`ℹ️  [BasePath] No basePath configured, passing through: "${originalUrl}"`);
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
                    console.log(`✅ [BasePath] Root request transformed: "${originalUrl}" → "/"`);
                } else if (url.startsWith(basePath + "/")) {
                    // Request has basePath prefix - remove it for Next.js (which has no basePath configured)
                    const newUrl = url.slice(basePath.length);
                    transformedUrl = newUrl;
                    console.log(`✅ [BasePath] Prefixed request transformed: "${originalUrl}" → "${newUrl}"`);

                    // Check if this is a potential SPA route that should fall back to index
                    if (isSPARoute(newUrl)) {
                        shouldServeIndex = true;
                        console.log(`🏠 [SPA Fallback] Will serve index.html for potential SPA route: "${originalUrl}"`);
                    }
                } else if (url.startsWith(basePath + "?")) {
                    // Handle basePath with query parameters (e.g., /game-150?token=...)
                    transformedUrl = "/" + url.slice(basePath.length);
                    console.log(`✅ [BasePath] Root with query params transformed: "${originalUrl}" → "${transformedUrl}"`);
                } else {
                    // Request does NOT have basePath prefix - this is normal for reverse proxy
                    console.log(`🔄 [BasePath] No prefix needed: "${originalUrl}" (reverse proxy scenario)`);
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
                        console.log(`🔀 [Redirect] BasePath added to redirect: "${url}"`);
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
                        console.log(`🔄 [SPA Fallback] Detected 404 for "${originalUrl}", serving index.html instead`);
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
                console.log(`🔄 [Next.js Handler] Processing: ${originalUrl}`);

                // Process the URL for basePath handling
                const { transformedUrl, shouldServeIndex } = processBasePathRouting(req, originalUrl, basePath);

                req.url = transformedUrl;
                console.log(`🎯 [Next.js Handler] Final URL for Next.js: "${req.url}"`);

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
                console.log(`✅ Server ready on http://${hostname}:${port}`);
                if (basePath) {
                    console.log(`📁 Base path configured: ${basePath}`);
                    console.log(`🔍 Static files served from:`);
                    console.log(`   - /_next/static → ${path.join(__dirname, "..", "..", gameName, ".next/static")}`);
                    console.log(`   - /${basePath}/... → ${path.join(__dirname, "..", "..", gameName, "public")}`);
                }
                console.log(`📊 Request logging enabled - watch for incoming requests`);
            });
        })
        .catch((ex) => {
            console.error(ex.stack);
            process.exit(1);
        });
}

module.exports = { createCustomServer };
