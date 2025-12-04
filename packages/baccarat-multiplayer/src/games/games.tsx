import { ComponentProps, FC } from "react";
import { Games, GameConfig } from "@shared/components/game-components/games";
import { GAME_ID } from "../game-config";
import BaccaratGame from "../page";

const gameConfig: GameConfig = {
    gameId: GAME_ID,
    component: BaccaratGame,
    name: "Baccarat Multiplayer",
};
type BaccaratGamesProps = ComponentProps<typeof Games>;

export const BaccaratGames: FC<BaccaratGamesProps> = (props) => {
    return <Games {...props} gameConfig={gameConfig} />;
};

export default BaccaratGames;
