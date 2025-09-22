// Import game configuration first
import "../../../game-config";

// Import shared preload images API with game-specific path overrides
import { default as sharedPreloadImagesApi } from "@shared/api/preload-images";

// Override game-specific paths for Baccarat
const getBaccaratSpecificPaths = (gameId?: number): string[] => {
    const paths: string[] = [];

    // Lobby and game images
    paths.push("/images/game-icons/");
    paths.push("/images/chips/");

    // Add game-specific paths
    if (gameId) {
        // Baccarat-specific logic can be added here if needed
    }

    return paths;
};

// Export the shared handler but with baccarat-specific path logic
export default sharedPreloadImagesApi;