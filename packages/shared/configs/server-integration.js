const express = require("express");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

// Factory function to create a server integration for a specific game
function createServerIntegration(gameName) {
    const app = express();
    const hostname = process.env.HOSTNAME || "0.0.0.0";
    const port = parseInt(process.env.PORT, 10) || 3000;

    // Serve static files from .next/static
    app.use(
        "/_next/static",
        express.static(path.join(__dirname, "..", "..", gameName, ".next/static"), {
            maxAge: "1y",
            immutable: true,
            setHeaders: (res, path) => {
                if (path.endsWith(".css") || path.endsWith(".js")) {
                    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
                }
            },
        })
    );

    // Serve static files from public directory
    app.use(
        express.static(path.join(__dirname, "..", "..", gameName, "public"), {
            maxAge: "1y",
        })
    );

    // Start the Next.js standalone server as a child process
    const nextServer = spawn("node", [path.join(__dirname, "..", "..", gameName, ".next/standalone/packages", gameName, "server.js")], {
        stdio: ["pipe", "pipe", "pipe"],
        env: {
            ...process.env,
            PORT: (port + 1).toString(), // Run Next.js on a different port
            HOSTNAME: hostname,
        },
    });

    // Pipe the Next.js server output to our logs
    nextServer.stdout.on("data", (data) => {
        console.log(`[Next.js] ${data.toString().trim()}`);
    });

    nextServer.stderr.on("data", (data) => {
        console.error(`[Next.js] ${data.toString().trim()}`);
    });

    // Proxy requests to Next.js server (except static assets)
    const httpProxy = require("http-proxy");
    const proxy = httpProxy.createProxyServer({
        target: `http://${hostname}:${port + 1}`,
        ws: true,
    });

    // Handle all other requests by proxying to Next.js
    app.use((req, res) => {
        proxy.web(req, res, {}, (err) => {
            if (err) {
                console.error("Proxy error:", err);
                res.status(500).send("Internal Server Error");
            }
        });
    });

    // Handle WebSocket proxying
    const server = http.createServer(app);
    server.on("upgrade", (req, socket, head) => {
        proxy.ws(req, socket, head, {}, (err) => {
            if (err) {
                console.error("WebSocket proxy error:", err);
            }
        });
    });

    server.listen(port, hostname, () => {
        console.log(`> Asset server listening on http://${hostname}:${port}`);
        console.log(`> Next.js server running on port ${port + 1}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
        console.log("SIGTERM received, shutting down gracefully");
        nextServer.kill("SIGTERM");
        server.close(() => {
            console.log("Process terminated");
        });
    });

    process.on("SIGINT", () => {
        console.log("SIGINT received, shutting down gracefully");
        nextServer.kill("SIGINT");
        server.close(() => {
            console.log("Process terminated");
        });
    });
}

module.exports = { createServerIntegration };
