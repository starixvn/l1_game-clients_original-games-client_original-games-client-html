const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();
const PORT = process.env.PROXY_PORT || 3000;

// Game service targets - use localhost for development
let SEDIE_TARGET = "http://localhost:5000";
let BACCARAT_TARGET = "http://localhost:5002";
let PLINKO_TARGET = "http://localhost:5003";
let PLINKO_X_TARGET = "http://localhost:5004";

// Use custom targets if specified via environment variables
const targetHost = process.env.TARGET_HOST;
if (targetHost) {
    // For specific game proxying
    if (targetHost.includes("5003")) {
        PLINKO_TARGET = targetHost;
    } else if (targetHost.includes("5004")) {
        PLINKO_X_TARGET = targetHost;
    } else if (targetHost.includes("5000")) {
        SEDIE_TARGET = targetHost;
    } else if (targetHost.includes("5002")) {
        BACCARAT_TARGET = targetHost;
    }
}

// Simulate the deployment environment where requests come in with game-specific prefixes
console.log(`🚀 Starting Unified Reverse Proxy Server`);
console.log(`  - Proxy Port: ${PORT}`);
console.log(`  - Sedie Target: ${SEDIE_TARGET} (Game ID: 148)`);
console.log(`  - Baccarat Target: ${BACCARAT_TARGET} (Game ID: 150)`);
console.log(`  - Plinko Target: ${PLINKO_TARGET} (Game ID: 145)`);
console.log(`  - Plinko X Target: ${PLINKO_X_TARGET} (Game ID: 159)`);
console.log(`  - Base Paths: /game-148, /game-150, /game-145, /game-159`);
console.log(`  - Environment: Simulating deployment environment`);
console.log(`  - Access URLs:`);
console.log(`   - Sedie: http://localhost:${PORT}/game-148`);
console.log(`   - Baccarat: http://localhost:${PORT}/game-150`);
console.log(`   - Plinko: http://localhost:${PORT}/game-145`);
console.log(`   - Plinko X: http://localhost:${PORT}/game-159`);
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

// Proxy middleware for Plinko game (Game ID 145) - strips /game-145 prefix
app.use(
    "/game-145",
    createProxyMiddleware({
        target: PLINKO_TARGET,
        changeOrigin: true,
        pathRewrite: {
            "^/game-145": "", // Remove /game-145 prefix when forwarding
        },
        onProxyReq: (proxyReq, req, res) => {
            const timestamp = new Date().toISOString();
            const targetUrl = `${PLINKO_TARGET}${req.url.replace("/game-145", "")}`;
            console.log(`🔄 [${timestamp}] [PLINKO] Proxying: ${req.method} ${req.url} → ${targetUrl}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            const timestamp = new Date().toISOString();
            const statusCode = proxyRes.statusCode;
            const statusEmoji = statusCode >= 200 && statusCode < 300 ? "✅" : statusCode >= 400 ? "❌" : "⚠️";
            console.log(`📨 [${timestamp}] [PLINKO] ${req.method} ${req.url} → ${statusCode} ${statusEmoji}`);
        },
        onError: (err, req, res) => {
            const timestamp = new Date().toISOString();
            console.error(`❌ [${timestamp}] [PLINKO] Proxy Error for ${req.method} ${req.url}:`, err.message);
        },
    })
);

// Proxy middleware for Plinko X game (Game ID 159) - strips /game-159 prefix
app.use(
    "/game-159",
    createProxyMiddleware({
        target: PLINKO_X_TARGET,
        changeOrigin: true,
        pathRewrite: {
            "^/game-159": "", // Remove /game-159 prefix when forwarding
        },
        onProxyReq: (proxyReq, req, res) => {
            const timestamp = new Date().toISOString();
            const targetUrl = `${PLINKO_X_TARGET}${req.url.replace("/game-159", "")}`;
            console.log(`🔄 [${timestamp}] [PLINKO-X] Proxying: ${req.method} ${req.url} → ${targetUrl}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            const timestamp = new Date().toISOString();
            const statusCode = proxyRes.statusCode;
            const statusEmoji = statusCode >= 200 && statusCode < 300 ? "✅" : statusCode >= 400 ? "❌" : "⚠️";
            console.log(`📨 [${timestamp}] [PLINKO-X] ${req.method} ${req.url} → ${statusCode} ${statusEmoji}`);
        },
        onError: (err, req, res) => {
            const timestamp = new Date().toISOString();
            console.error(`❌ [${timestamp}] [PLINKO-X] Proxy Error for ${req.method} ${req.url}:`, err.message);
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
            <li><a href="/game-145">Plinko (Game ID: 145)</a> - Target: ${PLINKO_TARGET}</li>
            <li><a href="/game-159">Plinko X (Game ID: 159)</a> - Target: ${PLINKO_X_TARGET}</li>
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
            plinko: {
                game_id: 145,
                target: PLINKO_TARGET,
                base_path: "/game-145",
            },
            "plinko-x": {
                game_id: 159,
                target: PLINKO_X_TARGET,
                base_path: "/game-159",
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
    console.log(`   - Plinko: http://localhost:${PORT}/game-145`);
    console.log(`   - Plinko X: http://localhost:${PORT}/game-159`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log("");
    console.log("This proxy simulates the exact deployment environment where:");
    console.log(
        "  - External URLs: http://domain/game-148/..., http://domain/game-150/..., http://domain/game-145/..., http://domain/game-159/..."
    );
    console.log(
        "  - Internal forwarding: http://sedie-multiplayer:5000/..., http://baccarat-multiplayer:5002/..., http://plinko:5003/..., http://plinko-x:5004/..."
    );
    console.log("  - BasePaths are stripped during proxying");
    console.log("");
});

process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down unified reverse proxy...");
    process.exit(0);
});
