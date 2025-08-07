import { GameDurations, RoundState } from "../game-base/type";
import { RoundStateHandler } from "../round-base/round-state-handler";

export class TurnStateHandler extends RoundStateHandler {
    constructor() {
        super();
    }

    determineRoundBaseState({
        roundRemainingTime,
        wholeRound,
        remainingTime,
        durations,
    }: {
        roundRemainingTime: number;
        wholeRound: number;
        remainingTime: number;
        durations: GameDurations;
    }): RoundState {
        const { wholeTurn, showResult, switchRoundAnimation } = durations;
        const startSwitchRoundPointTime = wholeRound - showResult;
        const endSwitchRoundPointTime = startSwitchRoundPointTime - switchRoundAnimation;

        if (startSwitchRoundPointTime >= roundRemainingTime && roundRemainingTime > endSwitchRoundPointTime) {
            return RoundState.SwitchRound;
        }

        return super.determineRoundBaseState({ roundRemainingTime, wholeRound: wholeTurn, remainingTime, durations });
    }

    getRemainingTime({ remainingTime, durations }: { remainingTime: number; durations: GameDurations }): number {
        const turnRemainingTime =
            this.getRoundRemainingTimeToCalculateTurnRemainingTime({ remainingTime, durations }) % durations.wholeTurn;

        if (turnRemainingTime <= 0) {
            return durations.wholeTurn;
        }

        return turnRemainingTime;
    }

    getRoundRemainingTimeToCalculateTurnRemainingTime({
        remainingTime,
        durations,
    }: {
        remainingTime: number;
        durations: GameDurations;
    }): number {
        const { wholeRound, showResult, switchRoundAnimation, beforePlaceBet } = durations;
        const startSwitchRoundPointTime = wholeRound - showResult;
        const endSwitchRoundPointTime = startSwitchRoundPointTime - switchRoundAnimation;

        if (remainingTime > startSwitchRoundPointTime) {
            return remainingTime - switchRoundAnimation;
        }

        if (startSwitchRoundPointTime >= remainingTime && remainingTime > endSwitchRoundPointTime - beforePlaceBet) {
            return endSwitchRoundPointTime - beforePlaceBet;
        }

        return remainingTime;
    }

    getWholeRoundDuration({ durations }: { durations: GameDurations }) {
        return durations.wholeTurn;
    }

    shouldCountDownTimer({ newRoundState }: { newRoundState: RoundState }): boolean {
        return newRoundState !== RoundState.SwitchRound;
    }
}
