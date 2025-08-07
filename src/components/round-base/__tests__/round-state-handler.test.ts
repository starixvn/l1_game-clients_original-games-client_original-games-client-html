import { GameDurations, RoundState } from "../../game-base/type";
import { RoundStateHandler } from "../round-state-handler";

describe("RoundStateHandler", () => {
    let roundStateHandler: RoundStateHandler;
    let durations: GameDurations;

    beforeEach(() => {
        roundStateHandler = new RoundStateHandler();
        durations = { showResult: 9, beforePlaceBet: 1, placingBets: 25, lockingBet: 3, wholeRound: 35, resultAnimation: 5 };
    });

    describe("determineRoundBaseState", () => {
        test("returns DisplayResult when remainingTime is greater than showResult", () => {
            const state = roundStateHandler.determineRoundBaseState({
                wholeRound: 35,
                remainingTime: 32,
                durations,
                roundRemainingTime: 32,
            });
            expect(state).toBe(RoundState.DisplayResult);
        });

        test("returns BeforePlaceBet when remainingTime is greater than placingBets and beforePlaceBet greater than 0", () => {
            const state = roundStateHandler.determineRoundBaseState({
                wholeRound: 35,
                remainingTime: 26,
                durations,
                roundRemainingTime: 26,
            });
            expect(state).toBe(RoundState.BeforePlaceBet);
        });

        test("returns InRound when remainingTime is between placingBets and lockingBet", () => {
            const state = roundStateHandler.determineRoundBaseState({
                wholeRound: 35,
                remainingTime: 20,
                durations,
                roundRemainingTime: 20,
            });
            expect(state).toBe(RoundState.InRound);
        });

        test("returns LockingBet when remainingTime is less than or equal to lockingBet and greater than or equal to 0", () => {
            const state = roundStateHandler.determineRoundBaseState({
                wholeRound: 35,
                remainingTime: 2,
                durations,
                roundRemainingTime: 2,
            });
            expect(state).toBe(RoundState.LockingBet);
        });

        test("returns None when remainingTime is negative", () => {
            const state = roundStateHandler.determineRoundBaseState({
                wholeRound: 35,
                remainingTime: -1,
                durations,
                roundRemainingTime: 0,
            });
            expect(state).toBe(RoundState.None);
        });
    });

    describe("getRemainingTime", () => {
        test("returns the provided remainingTime", () => {
            const remainingTime = roundStateHandler.getRemainingTime({ remainingTime: 31, durations });
            expect(remainingTime).toBe(31);
        });
    });

    describe("getWholeRoundDuration", () => {
        test("returns the wholeRound duration from durations", () => {
            const wholeRoundDuration = roundStateHandler.getWholeRoundDuration({ durations });
            expect(wholeRoundDuration).toBe(35);
        });
    });
});
