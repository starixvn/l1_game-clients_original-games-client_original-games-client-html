import { GameDurations, RoundState } from "../../game-base/type";
import { TurnStateHandler } from "../turn-state-handler";

describe("TurnStateHandler", () => {
    let handler: TurnStateHandler;
    let durations: GameDurations;

    beforeEach(() => {
        handler = new TurnStateHandler();
        durations = {
            wholeRound: 122,
            wholeTurn: 30,
            placingBets: 20,
            lockingBet: 3,
            showResult: 9,
            resultAnimation: 3,
            beforePlaceBet: 1,
            switchRoundAnimation: 2,
        };
    });

    describe("determineRoundBaseState", () => {
        it.each([112, 113])(
            "should return SwitchRound if roundRemainingTime is within the switch round animation period",
            (roundRemainingTime) => {
                const roundState = handler.determineRoundBaseState({ wholeRound: 122, remainingTime: 34, durations, roundRemainingTime });
                expect(roundState).toBe(RoundState.SwitchRound);
            }
        );
    });

    describe("getRemainingTime", () => {
        it.each([[0], [-1]])("should return the whole turn duration when turnRemainingTime is less than or equal to 0", (remainingTime) => {
            const result = handler.getRemainingTime({ remainingTime, durations });
            expect(result).toBe(durations.wholeTurn);
        });

        it("should return the turnRemainingTime when it is greater than 0", () => {
            const result = handler.getRemainingTime({ remainingTime: 5, durations });
            expect(result).toBe(5);
        });
    });

    describe("getRoundRemainingTimeToCalculateTurnRemainingtime", () => {
        it.each([
            [122, 120],
            [121, 119],
            [120, 118],
            [119, 117],
            [118, 116],
            [117, 115],
            [116, 114],
            [115, 113],
            [114, 112],
        ])(
            "returns correct expected round remaining time when remainingTime is greater than endSwitchRoundPointTime",
            (roundRemainingTime, expectedResult) => {
                const result = handler.getRoundRemainingTimeToCalculateTurnRemainingTime({ remainingTime: roundRemainingTime, durations });
                expect(result).toBe(expectedResult);
            }
        );

        it.each([
            [113, 110],
            [112, 110],
            [111, 110],
        ])(
            "returns expected round remaining when remainingTime is on range of startSwitchRoundPointTime to beforePlaceBet",
            (roundRemainingTime, expectedResult) => {
                const result = handler.getRoundRemainingTimeToCalculateTurnRemainingTime({ remainingTime: roundRemainingTime, durations });
                expect(result).toBe(expectedResult);
            }
        );

        it.each([
            [110, 110],
            [109, 109],
            [108, 108],
        ])("returns expected round remaining when remainingTime is greater than beforePlaceBet", (roundRemainingTime, expectedResult) => {
            const result = handler.getRoundRemainingTimeToCalculateTurnRemainingTime({ remainingTime: roundRemainingTime, durations });
            expect(result).toBe(expectedResult);
        });
    });

    describe("getWholeRoundDuration", () => {
        it("should return the wholeTurn duration from durations", () => {
            const wholeRoundDuration = handler.getWholeRoundDuration({ durations });
            expect(wholeRoundDuration).toEqual(durations.wholeTurn);
        });
    });

    describe("shouldCountDownTimer", () => {
        it.each([RoundState.InRound, RoundState.LockingBet, RoundState.BeforePlaceBet, RoundState.DisplayResult])(
            "should return true if newRoundState is not SwitchRound",
            (newRoundState) => {
                const shouldCount = handler.shouldCountDownTimer({ newRoundState });
                expect(shouldCount).toBe(true);
            }
        );

        it("should return false if newRoundState is SwitchRound", () => {
            const shouldCount = handler.shouldCountDownTimer({ newRoundState: RoundState.SwitchRound });
            expect(shouldCount).toBe(false);
        });
    });
});
