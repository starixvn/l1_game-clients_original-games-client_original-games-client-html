/**
 * Game-specific UI theme configurations
 * Defines colors, styles, and visual themes for different games
 */

export interface UIThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    buttonStyles: {
        primary: string;
        secondary: string;
        danger: string;
    };
    panelBackground: string;
    gameAreaBackground: string;
}

/**
 * Plinko (Game ID 145) UI theme configuration - matches master branch
 */
export const plinkoTheme: UIThemeConfig = {
    primaryColor: "#FF7400",
    secondaryColor: "#FFA700",
    accentColor: "#FFCE00",
    backgroundColor: "#1a1a1a",
    textColor: "#ffffff",
    borderColor: "#333333",
    buttonStyles: {
        primary: "bg-orange-500 hover:bg-orange-600 text-white",
        secondary: "bg-gray-600 hover:bg-gray-700 text-white",
        danger: "bg-red-500 hover:bg-red-600 text-white"
    },
    panelBackground: "bg-gray-800",
    gameAreaBackground: "bg-black"
};

/**
 * Plinko X (Game ID 159) UI theme configuration - matches master branch for now
 * Can be customized later with different colors
 */
export const plinkoXTheme: UIThemeConfig = {
    primaryColor: "#FF7400",
    secondaryColor: "#FFA700",
    accentColor: "#FFCE00",
    backgroundColor: "#1a1a1a",
    textColor: "#ffffff",
    borderColor: "#333333",
    buttonStyles: {
        primary: "bg-orange-500 hover:bg-orange-600 text-white",
        secondary: "bg-gray-600 hover:bg-gray-700 text-white",
        danger: "bg-red-500 hover:bg-red-600 text-white"
    },
    panelBackground: "bg-gray-800",
    gameAreaBackground: "bg-black"
};

/**
 * Get UI theme configuration for a specific game ID
 */
export function getGameUITheme(gameId: number): UIThemeConfig {
    switch (gameId) {
        case 145:
            return plinkoTheme;
        case 159:
            return plinkoXTheme;
        default:
            throw new Error(`Unknown game ID: ${gameId}`);
    }
}
