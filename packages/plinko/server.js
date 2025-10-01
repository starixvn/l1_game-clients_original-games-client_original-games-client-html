/**
 * Custom Next.js server with WebSocket support for Plinko game
 * Enables real-time auto bet updates and live game notifications
 *
 * @format
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
// WebSocket server initialization (disabled - using external mock service)
// const { initWebSocketServer } = require('./api/websocket-server');

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
    .then(() => {
        // Create HTTP server
        const server = createServer((req, res) => {
            try {
                // Parse URL
                const parsedUrl = parse(req.url, true);

                // Handle API routes
                if (parsedUrl.pathname.startsWith("/api/")) {
                    // Let Next.js handle API routes
                    handle(req, res, parsedUrl);
                    return;
                }

                // Handle all other routes with Next.js
                handle(req, res, parsedUrl);
            } catch (err) {
                console.error("Error occurred handling", req.url, err);
                res.statusCode = 500;
                res.end("Internal server error");
            }
        });

        // Initialize WebSocket server (disabled - using external mock service)
        // initWebSocketServer(server);

        // Start server
        server.listen(port, (err) => {
            if (err) throw err;
        });

        // Graceful shutdown
        process.on("SIGTERM", () => {
            server.close(() => {
                process.exit(0);
            });
        });

        process.on("SIGINT", () => {
            server.close(() => {
                process.exit(0);
            });
        });
    })
    .catch((ex) => {
        console.error("Error starting server:", ex);
        process.exit(1);
    });
