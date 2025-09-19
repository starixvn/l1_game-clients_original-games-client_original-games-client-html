#!/usr/bin/env node

/**
 * Dynamic build script for baccarat-multiplayer
 * This script allows building with dynamic game ID and base path configuration
 */

const { spawn } = require("child_process");
const path = require("path");

// Get environment variables with defaults
const gameId = process.env.NEXT_PUBLIC_DEFAULT_GAME_ID || "150";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/game-150";

console.log(`Building baccarat-multiplayer with:`);
console.log(`  Game ID: ${gameId}`);
console.log(`  Base Path: ${basePath}`);
console.log("");

// Set environment variables for the build process
const env = {
    ...process.env,
    NEXT_PUBLIC_DEFAULT_GAME_ID: gameId,
    NEXT_PUBLIC_BASE_PATH: basePath,
};

// Run the build command
const buildCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const buildArgs = ["run", "build:standalone"];

console.log(`Running: ${buildCommand} ${buildArgs.join(" ")}`);

const child = spawn(buildCommand, buildArgs, {
    stdio: "inherit",
    env: env,
    cwd: path.dirname(__filename),
});

child.on("close", (code) => {
    process.exit(code);
});

child.on("error", (error) => {
    console.error("Build failed:", error);
    process.exit(1);
});
