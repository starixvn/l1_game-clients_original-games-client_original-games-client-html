const express = require("express");
const path = require("path");

// Import the Next.js standalone server
const nextServer = require("./.next/standalone/packages/sedie-multiplayer/server");

const app = express();
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3000;

// Serve static files from .next/static with proper caching
app.use(
    "/_next/static",
    express.static(path.join(__dirname, ".next/static"), {
        maxAge: "1y",
        immutable: true,
        setHeaders: (res, path) => {
            // Set proper cache headers for static assets
            if (path.endsWith(".css") || path.endsWith(".js")) {
                res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            }
        },
    })
);

// Serve static files from public directory
app.use(
    express.static(path.join(__dirname, "public"), {
        maxAge: "1y",
    })
);

// Start the Next.js server and proxy requests to it
const server = app.listen(port, hostname, () => {
    console.log(`> Static asset server ready on http://${hostname}:${port}`);
    console.log(`> Serving .next/static from ${path.join(__dirname, ".next/static")}`);
});

// Handle all other requests by proxying to Next.js
app.use((req, res) => {
    // For non-static requests, we need to let Next.js handle them
    // This is a simplified approach - in production you'd want proper request forwarding
    res.status(404).send("Asset not found");
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(() => {
        console.log("Process terminated");
    });
});
