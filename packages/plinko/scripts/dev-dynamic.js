#!/usr/bin/env node

/**
 * Dynamic development script for plinko
 * This script allows running development server with dynamic game ID and base path configuration
 */

const { spawn } = require("child_process");
const path = require("path");

// Get environment variables with defaults
const gameId = process.env.NEXT_PUBLIC_DEFAULT_GAME_ID || "145";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/game-145";

// Set environment variables for the dev process
const env = {
    ...process.env,
    NEXT_PUBLIC_DEFAULT_GAME_ID: gameId,
    NEXT_PUBLIC_BASE_PATH: basePath,
};

// Run the actual dev commands directly with dynamic environment variables
const { exec } = require("child_process");

// Build the command string with dynamic environment variables
const generateTolgeeCommand = `cd ../.. && cross-env NEXT_PUBLIC_DEFAULT_GAME_ID=${gameId} npm run generate-tolgee-data && cd packages/plinko`;
const devCommand = `cross-env NEXT_PUBLIC_DEFAULT_GAME_ID=${gameId} NEXT_PUBLIC_BASE_PATH= PORT=3003 FAST_REFRESH=false node custom-server.js`;

const fullCommand = `${generateTolgeeCommand} && ${devCommand}`;

console.log(`Running dev server for game ID: ${gameId}`);
console.log("Command:", fullCommand);

const child = exec(fullCommand, {
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
