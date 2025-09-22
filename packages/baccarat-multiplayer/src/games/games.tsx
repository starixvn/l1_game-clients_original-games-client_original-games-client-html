import React from "react";
import dynamic from "next/dynamic";
import { Games, GameConfig } from "@shared/components/game-components/games";
import { GAME_ID } from "../game-config";

const LoadingGameComponent = React.memo(() => (
    <div>Loading...</div>
));

LoadingGameComponent.displayName = "LoadingGameComponent";

const BaccaratMultiPlayer = dynamic(() => import("../page"), {
    loading: () => <LoadingGameComponent />,
    ssr: false,
});

const gameConfig: GameConfig = {
    gameId: GAME_ID,
    component: BaccaratMultiPlayer,
    name: "Baccarat Multiplayer",
};

export const BaccaratGames: React.FC<any> = (props) => {
    return <Games {...props} gameConfig={gameConfig} />;
};

export default BaccaratGames;
