import { RoundState } from "../game-base/type";

export type GameSoundHandlerProps = {
    gameSound: () => {
        startPlaceBetSound: Function;
        startRoundSound: Function;
        blockBetSound: Function;
        playPlaceBetSound: Function;
    };
};

export interface IGameSoundHandler {
    handleSound(newRoundState: RoundState): void;
}

export class RoundGameSoundHandler implements IGameSoundHandler {
    constructor(protected readonly props: GameSoundHandlerProps) { }

    handleSound(newRoundState: RoundState) {
        const { startPlaceBetSound, startRoundSound } = this.props.gameSound();
        const soundByState = {
            [RoundState.BeforePlaceBet]: startRoundSound,
            [RoundState.InRound]: startPlaceBetSound,
        };
        const fn = soundByState[newRoundState];
        if (fn) {
            fn();
        }
    }
}
