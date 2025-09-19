const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();
const PORT = process.env.PROXY_PORT || 3000;
const TARGET_HOST = process.env.TARGET_HOST || "http://localhost:5000";

// Simulate the deployment environment where requests come in with /game-148 prefix
console.log(`🚀 Starting Reverse Proxy Server`);
console.log(`  - Proxy Port: ${PORT}`);
console.log(`  - Target Host: ${TARGET_HOST}`);
console.log(`  - Base Path: /game-148`);
console.log(`  - Environment: Simulating deployment environment`);
console.log(`  - Access URL: http://localhost:${PORT}/game-148`);
console.log("");

// Middleware to log all incoming requests
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📨 [${timestamp}] ${req.method} ${req.url} (User-Agent: ${req.get("User-Agent")?.substring(0, 50)}...)`);
    next();
});

// Proxy middleware that strips /game-148 prefix and forwards to the sedie-multiplayer container
app.use(
    "/game-148",
    createProxyMiddleware({
        target: TARGET_HOST,
        changeOrigin: true,
        pathRewrite: {
            "^/game-148": "", // Remove /game-148 prefix when forwarding
        },
        onProxyReq: (proxyReq, req, res) => {
            const timestamp = new Date().toISOString();
            const targetUrl = `${TARGET_HOST}${req.url.replace("/game-148", "")}`;
            console.log(`🔄 [${timestamp}] Proxying: ${req.method} ${req.url} → ${targetUrl}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            const timestamp = new Date().toISOString();
            const statusCode = proxyRes.statusCode;
            const statusEmoji = statusCode >= 200 && statusCode < 300 ? "✅" : statusCode >= 400 ? "❌" : "⚠️";
            console.log(`📨 [${timestamp}] ${req.method} ${req.url} → ${statusCode} ${statusEmoji}`);
        },
        onError: (err, req, res) => {
            const timestamp = new Date().toISOString();
            console.error(`❌ [${timestamp}] Proxy Error for ${req.method} ${req.url}:`, err.message);
        },
    })
);

// Handle direct requests (for debugging)
app.get("/", (req, res) => {
    res.send(`
        <h1>Reverse Proxy for Sedie-Multiplayer Game</h1>
        <p>This proxy simulates the deployment environment.</p>
        <p>Access the game at: <a href="/game-148">/game-148</a></p>
        <p>Target container: ${TARGET_HOST}</p>
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
        proxy_target: TARGET_HOST,
        base_path: "/game-148",
    });
});

// Start the proxy server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Reverse proxy server ready on http://0.0.0.0:${PORT}`);
    console.log(`🌐 Access the game at: http://localhost:${PORT}/game-148`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log("");
    console.log("This proxy simulates the exact deployment environment where:");
    console.log("  - External URL: http://domain/game-148/...");
    console.log("  - Internal forwarding: http://localhost:5000/...");
    console.log("  - BasePath is stripped during proxying");
    console.log("");
});

process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down reverse proxy...");
    process.exit(0);
});
