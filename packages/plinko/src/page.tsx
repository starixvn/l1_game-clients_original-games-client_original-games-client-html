// Plinko Game Page Component
// This is the main entry point for both Plinko and Plinko X games in the monorepo
// Uses the PlinkoGameBase which extends the shared GameBase
// Game configuration is initialized dynamically based on game ID

import { initializeGameConfig } from "./game-config";
import PlinkoGameBase from "./components/plinko-game-base";

// Dynamic page component that initializes game config based on props
const PlinkoPage = (props: any) => {
    // Initialize game configuration based on game ID from props
    // Default to Plinko (145) if no gameId provided
    const gameId = props.gameId || 145;
    initializeGameConfig(gameId);

    return <PlinkoGameBase {...props} />;
};

export default PlinkoPage;
