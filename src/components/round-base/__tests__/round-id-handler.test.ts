import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { RoundIdHandler } from "../round-id-handler";

describe(RoundIdHandler.name, () => {
    describe("handleRoundId", () => {
        it("should set round id", () => {
            // arrange
            const dispatch = jest.fn();
            const mockProps = {
                dispatch,
                gameStateContextModel: jest.fn(),
                gameMessageHandler: {
                    broadcastGameEvent: jest.fn(),
                    register: jest.fn(),
                    removeHandler: jest.fn()
                } as any,
                durations: {} as any
            };
            const handler = new RoundIdHandler(mockProps);
            handler["shouldRunWhenFirstLoad"] = false;

            // act
            handler.handleRoundId({ pf: { roundId: 10 } });

            // assert
            expect(dispatch).toHaveBeenCalledWith({ type: GameEventActionType.ROUND_ID, payload: { roundId: 10 } });
        });
    });
});
