// API route to serve game-specific configurations
export default function handler(req, res) {
    const { gameId } = req.query;

    try {
        let configs, gameSettings;

        if (gameId === "148" || gameId === 148) {
            // SeDie game
            configs = require("../../../packages/sedie/configs.json");
            gameSettings = require("../../../packages/sedie/game-settings.json");
        } else if (gameId === "2001" || gameId === 2001) {
            // Baccarat game
            configs = require("../../../packages/baccarat/configs.json");
            gameSettings = require("../../../packages/baccarat/game-settings.json");
        } else {
            // Default to SeDie if no gameId specified
            configs = require("../../../packages/sedie/configs.json");
            gameSettings = require("../../../packages/sedie/game-settings.json");
        }

        const appSettings = {
            ...configs,
            gameSettings,
        };

        res.status(200).json(appSettings);
    } catch (error) {
        console.error("Error loading game config:", error);
        res.status(500).json({ error: "Failed to load game configuration" });
    }
}
