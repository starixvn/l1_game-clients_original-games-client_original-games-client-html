/**
 * Game-specific asset configurations
 * Defines asset paths and resource configurations for different games
 */

export interface GameAssetsConfig {
    backgroundImage: string;
    gameIcon: string;
    soundFiles: {
        ballHitPin: string;
        ballHitWin: string;
        backgroundMusic: string[];
        placeBet: string;
        click: string;
    };
    fonts: string[];
    resourcePath: string;
}

/**
 * Plinko (Game ID 145) asset configuration - matches master branch exactly
 */
export const plinkoAssets: GameAssetsConfig = {
    backgroundImage: "/static/images/background/bg.webp",
    gameIcon: "/static/images/plinko/ball.png",
    soundFiles: {
        ballHitPin: "/static/sounds/ball-hit-pin.mp3",
        ballHitWin: "/static/sounds/ball-hit-win.mp3",
        backgroundMusic: [
            "/static/sounds/bg-music/song1.mp3",
            "/static/sounds/bg-music/song2.mp3",
            "/static/sounds/bg-music/song3.mp3",
            "/static/sounds/bg-music/song4.mp3"
        ],
        placeBet: "/static/sounds/place-bet.mp3",
        click: "/static/sounds/click.mp3"
    },
    fonts: [
        "/static/fonts/Inter-Regular.ttf",
        "/static/fonts/Inter-Bold.ttf",
        "/static/fonts/Montserrat-Regular.ttf",
        "/static/fonts/Montserrat-Bold.ttf",
        "/static/fonts/BebasNeue-Regular.ttf"
    ],
    resourcePath: "plinko"
};

/**
 * Plinko X (Game ID 159) asset configuration - matches master branch exactly
 * Same assets as Plinko for now, can be customized later
 */
export const plinkoXAssets: GameAssetsConfig = {
    backgroundImage: "/static/images/background/bg.webp",
    gameIcon: "/static/images/plinko/ball.png",
    soundFiles: {
        ballHitPin: "/static/sounds/ball-hit-pin.mp3",
        ballHitWin: "/static/sounds/ball-hit-win.mp3",
        backgroundMusic: [
            "/static/sounds/bg-music/song1.mp3",
            "/static/sounds/bg-music/song2.mp3",
            "/static/sounds/bg-music/song3.mp3",
            "/static/sounds/bg-music/song4.mp3"
        ],
        placeBet: "/static/sounds/place-bet.mp3",
        click: "/static/sounds/click.mp3"
    },
    fonts: [
        "/static/fonts/Inter-Regular.ttf",
        "/static/fonts/Inter-Bold.ttf",
        "/static/fonts/Montserrat-Regular.ttf",
        "/static/fonts/Montserrat-Bold.ttf",
        "/static/fonts/BebasNeue-Regular.ttf"
    ],
    resourcePath: "plinko"
};

/**
 * Get assets configuration for a specific game ID
 */
export function getGameAssets(gameId: number): GameAssetsConfig {
    switch (gameId) {
        case 145:
            return plinkoAssets;
        case 159:
            return plinkoXAssets;
        default:
            throw new Error(`Unknown game ID: ${gameId}`);
    }
}
