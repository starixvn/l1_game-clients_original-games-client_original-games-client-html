#!/usr/bin/env node

/**
 * Dynamic development script for sedie-multiplayer
 * This script allows running development server with dynamic game ID and base path configuration
 */

const { spawn } = require("child_process");
const path = require("path");

// Get environment variables with defaults
const gameId = process.env.NEXT_PUBLIC_DEFAULT_GAME_ID || "148";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/site-148";

console.log(`Starting sedie-multiplayer development server with:`);
console.log(`  Game ID: ${gameId}`);
console.log(`  Base Path: ${basePath}`);
console.log("");

// Set environment variables for the dev process
const env = {
    ...process.env,
    NEXT_PUBLIC_DEFAULT_GAME_ID: gameId,
    NEXT_PUBLIC_BASE_PATH: basePath,
};

// Run the dev command
const devCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const devArgs = ["run", "dev:standalone"];

console.log(`Running: ${devCommand} ${devArgs.join(" ")}`);

const child = spawn(devCommand, devArgs, {
    stdio: "inherit",
    env: env,
    cwd: path.dirname(__filename),
});

child.on("close", (code) => {
    process.exit(code);
});

child.on("error", (error) => {
    console.error("Dev server failed:", error);
    process.exit(1);
});
