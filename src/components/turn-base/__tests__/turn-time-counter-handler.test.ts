import { GameDurations } from "../../game-base/type";
import { TurnTimelineCounter } from "../turn-time-counter-handler";

describe("TurnTimeCounterHandler", () => {
    let handler: TurnTimelineCounter;
    let durations: GameDurations;

    beforeEach(() => {
        durations = {
            wholeRound: 114,
            wholeTurn: 28,
            placingBets: 20,
            lockingBet: 3,
            showResult: 8,
            resultAnimation: 3,
            beforePlaceBet: 0,
            switchRoundAnimation: 2,
        };

        handler = new TurnTimelineCounter(durations);
    });

    describe("compute turn timeline", () => {
        const roundId = 2;
        it.each([
            { roundRemainingTime: 114, turnIndex: 4, turnId: 4 },
            { roundRemainingTime: 106, turnIndex: 4, turnId: 4 },
            { roundRemainingTime: 105, turnIndex: 4, turnId: 4 },

            { roundRemainingTime: 104, turnIndex: 1, turnId: 5 },
            { roundRemainingTime: 103, turnIndex: 1, turnId: 5 },
            { roundRemainingTime: 90, turnIndex: 1, turnId: 5 },
            { roundRemainingTime: 77, turnIndex: 1, turnId: 5 },

            { roundRemainingTime: 76, turnIndex: 2, turnId: 6 },
            { roundRemainingTime: 75, turnIndex: 2, turnId: 6 },
            { roundRemainingTime: 70, turnIndex: 2, turnId: 6 },
            { roundRemainingTime: 59, turnIndex: 2, turnId: 6 },
            { roundRemainingTime: 49, turnIndex: 2, turnId: 6 },

            { roundRemainingTime: 48, turnIndex: 3, turnId: 7 },
            { roundRemainingTime: 45, turnIndex: 3, turnId: 7 },
            { roundRemainingTime: 36, turnIndex: 3, turnId: 7 },
            { roundRemainingTime: 21, turnIndex: 3, turnId: 7 },

            { roundRemainingTime: 20, turnIndex: 4, turnId: 8 },
            { roundRemainingTime: 19, turnIndex: 4, turnId: 8 },
            { roundRemainingTime: 10, turnIndex: 4, turnId: 8 },
            { roundRemainingTime: 5, turnIndex: 4, turnId: 8 },
            { roundRemainingTime: 0, turnIndex: 4, turnId: 8 },
        ])(
            `in round id: ${roundId} should return turn index: $turnIndex, and turn id: $turnId from round reminaing time: $roundRemainingTime`,
            (params: { roundRemainingTime: number; turnIndex: number; turnId: number }) => {
                const turn = handler.calculateTurn(params.roundRemainingTime, roundId);

                expect(turn.index).toBe(params.turnIndex);
                expect(turn.id).toBe(params.turnId);
            }
        );
    });
});

