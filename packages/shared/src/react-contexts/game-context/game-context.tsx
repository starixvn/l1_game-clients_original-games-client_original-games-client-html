import React, { useContext } from "react";
import { GamePropsContext } from "../../../components/game-base/type";

export const GameContext = React.createContext<GamePropsContext>({});
GameContext.displayName = "GameContext";

export const GameContextProvider = GameContext.Provider;
export const GameContextConsumer = GameContext.Consumer;
export const useGameContext = () => useContext(GameContext);
