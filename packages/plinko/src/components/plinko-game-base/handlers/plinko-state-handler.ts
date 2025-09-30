import { GameDurations, RoundState } from "@shared/components/game-base/type";
import { IRoundStateHandler } from "@shared/components/round-base/round-state-handler";

export class PlinkoStateHandler implements IRoundStateHandler {
    determineRoundBaseState({ roundRemainingTime, wholeRound, remainingTime, durations }: {
        roundRemainingTime: number;
        wholeRound: number;
        remainingTime: number;
        durations: GameDurations;
    }): RoundState {
        // Plinko is always in a state where betting is allowed
        // since it's not round-based like other games
        return RoundState.InRound;
    }

    getRemainingTime({ remainingTime, durations }: { remainingTime: number; durations: GameDurations }): number {
        // For Plinko, remaining time is not relevant since it's continuous
        return remainingTime;
    }

    getWholeRoundDuration({ durations }: { durations: GameDurations }): number {
        // For Plinko, whole round duration is not relevant since it's continuous
        return durations.wholeRound;
    }
}
