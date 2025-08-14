import { StateCreator } from "zustand";
import { GameDurations, RoundState } from "../../../components/game-base/type";
import { LanguageLocaleMapper } from "../../constants";
import { tolgee } from "../../tolgee";

export interface RoundStateSlice {
    prevRoundState: RoundState;
    roundState: RoundState;
    isPlayStartRoundAnimation: boolean;
    nextRoundState: RoundState;
    durations: GameDurations;
    defaultResult: any;
    defaultSettlementResult: any;
    remainingTime: number;
    isUMInFirstLoad: boolean;
    disabledMessage: string;
    showResultInfo: boolean;
    setGameState: (message: any) => void;
    setRoundState: (roundState: RoundState) => void;
    setUM: (message: string) => void;
    setIsUMInFirstLoad: (isUMInFirstLoad: boolean) => void;
}

const gameEvents = {
    NOT_PERMITTED_TO_PLAY: "notPermittedToPlay",
};

export const createRoundStateSlice: StateCreator<RoundStateSlice> = (set) => ({
    prevRoundState: RoundState.None,
    roundState: RoundState.None,
    isPlayStartRoundAnimation: false,
    nextRoundState: RoundState.None,
    durations: null,
    defaultResult: null,
    defaultSettlementResult: null,
    remainingTime: 0,
    isUMInFirstLoad: false,
    disabledMessage: "",
    showResultInfo: false,
    setGameState: (newGameState) => {
        set({
            ...newGameState,
        });
    },
    setRoundState: (roundState) => set({ roundState }),
    setUM: (message) =>
        set({
            roundState: RoundState.Disabled,
            disabledMessage: message[LanguageLocaleMapper[tolgee.getLanguage() || "en"]], // TO DO: remove hard code
            showResultInfo: false,
        }),
    setIsUMInFirstLoad: (isUMInFirstLoad) => set({ isUMInFirstLoad }),
});
