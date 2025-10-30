const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();
const PORT = process.env.PROXY_PORT || 3000;

// Game service targets - use localhost for development
const SEDIE_TARGET = "http://localhost:5000";
const BACCARAT_TARGET = "http://localhost:5002";

// Simulate the deployment environment where requests come in with game-specific prefixes
console.log(`🚀 Starting Unified Reverse Proxy Server`);
console.log(`  - Proxy Port: ${PORT}`);
console.log(`  - Sedie Target: ${SEDIE_TARGET} (Game ID: 148)`);
console.log(`  - Baccarat Target: ${BACCARAT_TARGET} (Game ID: 150)`);
console.log(`  - Base Paths: /game-148, /game-150`);
console.log(`  - Environment: Simulating deployment environment`);
console.log(`  - Access URLs:`);
console.log(`   - Sedie: http://localhost:${PORT}/game-148`);
console.log(`   - Baccarat: http://localhost:${PORT}/game-150`);
console.log("");

// Middleware to log all incoming requests
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📨 [${timestamp}] ${req.method} ${req.url} (User-Agent: ${req.get("User-Agent")?.substring(0, 50)}...)`);
    next();
});

// Proxy middleware for Sedie game (Game ID 148) - strips /game-148 prefix
app.use(
    "/game-148",
    createProxyMiddleware({
        target: SEDIE_TARGET,
        changeOrigin: true,
        pathRewrite: {
            "^/game-148": "", // Remove /game-148 prefix when forwarding
        },
        onProxyReq: (proxyReq, req, res) => {
            const timestamp = new Date().toISOString();
            const targetUrl = `${SEDIE_TARGET}${req.url.replace("/game-148", "")}`;
            console.log(`🔄 [${timestamp}] [SEDIE] Proxying: ${req.method} ${req.url} → ${targetUrl}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            const timestamp = new Date().toISOString();
            const statusCode = proxyRes.statusCode;
            const statusEmoji = statusCode >= 200 && statusCode < 300 ? "✅" : statusCode >= 400 ? "❌" : "⚠️";
            console.log(`📨 [${timestamp}] [SEDIE] ${req.method} ${req.url} → ${statusCode} ${statusEmoji}`);
        },
        onError: (err, req, res) => {
            const timestamp = new Date().toISOString();
            console.error(`❌ [${timestamp}] [SEDIE] Proxy Error for ${req.method} ${req.url}:`, err.message);
        },
    })
);

// Proxy middleware for Baccarat game (Game ID 150) - strips /game-150 prefix
app.use(
    "/game-150",
    createProxyMiddleware({
        target: BACCARAT_TARGET,
        changeOrigin: true,
        pathRewrite: {
            "^/game-150": "", // Remove /game-150 prefix when forwarding
        },
        onProxyReq: (proxyReq, req, res) => {
            const timestamp = new Date().toISOString();
            const targetUrl = `${BACCARAT_TARGET}${req.url.replace("/game-150", "")}`;
            console.log(`🔄 [${timestamp}] [BACCARAT] Proxying: ${req.method} ${req.url} → ${targetUrl}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            const timestamp = new Date().toISOString();
            const statusCode = proxyRes.statusCode;
            const statusEmoji = statusCode >= 200 && statusCode < 300 ? "✅" : statusCode >= 400 ? "❌" : "⚠️";
            console.log(`📨 [${timestamp}] [BACCARAT] ${req.method} ${req.url} → ${statusCode} ${statusEmoji}`);
        },
        onError: (err, req, res) => {
            const timestamp = new Date().toISOString();
            console.error(`❌ [${timestamp}] [BACCARAT] Proxy Error for ${req.method} ${req.url}:`, err.message);
        },
    })
);

// Handle direct requests (for debugging)
app.get("/", (req, res) => {
    res.send(`
        <h1>Unified Reverse Proxy for Multiplayer Games</h1>
        <p>This proxy simulates the deployment environment for multiple games.</p>
        <h3>Available Games:</h3>
        <ul>
            <li><a href="/game-148">SeDie Multiplayer (Game ID: 148)</a> - Target: ${SEDIE_TARGET}</li>
            <li><a href="/game-150">Baccarat Multiplayer (Game ID: 150)</a> - Target: ${BACCARAT_TARGET}</li>
        </ul>
        <hr>
        <h3>Recent Logs:</h3>
        <div id="logs" style="font-family: monospace; background: #f5f5f5; padding: 10px; border: 1px solid #ccc;"></div>
        <script>
            // Simple log display (logs are in server console)
            setInterval(() => {
                fetch('/logs').then(r => r.text()).then(logs => {
                    document.getElementById('logs').innerHTML = logs.replace(/\\n/g, '<br>');
                }).catch(() => {});
            }, 1000);
        </script>
    `);
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        games: {
            sedie: {
                game_id: 148,
                target: SEDIE_TARGET,
                base_path: "/game-148",
            },
            baccarat: {
                game_id: 150,
                target: BACCARAT_TARGET,
                base_path: "/game-150",
            },
        },
        proxy_port: PORT,
    });
});

// Start the proxy server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Unified reverse proxy server ready on http://0.0.0.0:${PORT}`);
    console.log(`🌐 Access games at:`);
    console.log(`   - SeDie: http://localhost:${PORT}/game-148`);
    console.log(`   - Baccarat: http://localhost:${PORT}/game-150`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log("");
    console.log("This proxy simulates the exact deployment environment where:");
    console.log("  - External URLs: http://domain/game-148/... and http://domain/game-150/...");
    console.log("  - Internal forwarding: http://sedie-multiplayer:5000/... and http://baccarat-multiplayer:5001/...");
    console.log("  - BasePaths are stripped during proxying");
    console.log("");
});

process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down unified reverse proxy...");
    process.exit(0);
});
