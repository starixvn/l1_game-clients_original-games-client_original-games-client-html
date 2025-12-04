import { ComponentProps, FC } from "react";
import { Games, GameConfig } from "@shared/components/game-components/games";
import { GAME_ID } from "../game-config";
import SedieGame from "../page";

const gameConfig: GameConfig = {
    gameId: GAME_ID,
    component: SedieGame,
    name: "SeDie Multiplayer",
};

type SedieGamesProps = ComponentProps<typeof Games>;

export const SedieGames: FC<SedieGamesProps> = (props) => {
    return <Games {...props} gameConfig={gameConfig} />;
};

export default SedieGames;
