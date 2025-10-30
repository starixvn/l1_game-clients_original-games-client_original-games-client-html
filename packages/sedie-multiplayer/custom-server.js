const path = require("path");

// Try to resolve shared configs path - works for both local dev and Docker
let sharedConfigPath;
try {
    // First try local development path (when running from packages/sedie-multiplayer/)
    sharedConfigPath = path.join(__dirname, "../shared/configs/custom-server.js");
    require.resolve(sharedConfigPath);
} catch {
    // If that fails, try Docker/production path (when running from /app/)
    sharedConfigPath = path.join(__dirname, "./packages/shared/configs/custom-server.js");
}

const { createCustomServer } = require(sharedConfigPath);

// Start the server for sedie-multiplayer
createCustomServer("sedie-multiplayer");
