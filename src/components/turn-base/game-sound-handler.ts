import { StorageHelper, localStorageKeys } from "../../_shared/helpers";
import { GameSound, RoundState } from "../game-base/type";

export type GameSoundHandlerProps = {
    gameSound(): GameSound;
};
export interface IGameSoundHandler {
    handleSound(newRoundState: RoundState);
}

export class GameSoundHandler implements IGameSoundHandler {
    constructor(protected readonly props: GameSoundHandlerProps) { }

    handleSound = (newRoundState: RoundState) => {
        const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? true;
        enableSound && this.playSound(newRoundState);
    };

    protected playSound(newRoundState: RoundState) {
        const { startPlaceBetSound, startRoundSound } = this.props.gameSound();
        const soundByState = {
            [RoundState.SwitchRound]: startRoundSound,
            [RoundState.InRound]: startPlaceBetSound,
        };
        soundByState[newRoundState]?.();
    }
}
