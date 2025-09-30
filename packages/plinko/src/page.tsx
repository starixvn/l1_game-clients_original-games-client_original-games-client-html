// Plinko Game Page Component
// This is the main entry point for the Plinko game in the monorepo

import React from "react";
import { GameServiceProvider } from "./services/useGameService";
import PlinkoGame from "./components/plinko-game/PlinkoGame";

const PlinkoGameWithProvider: React.FC<any> = (props) => {
    return (
        <GameServiceProvider>
            <PlinkoGame {...props} />
        </GameServiceProvider>
    );
};

export default PlinkoGameWithProvider;
