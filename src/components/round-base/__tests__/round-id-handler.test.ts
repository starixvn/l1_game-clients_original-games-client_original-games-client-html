import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { RoundIdHandler } from "../round-id-handler";

describe(RoundIdHandler.name, () => {
    describe("handleRoundId", () => {
        it("should set round id and dispatch when pfSeedBy is roundId and shouldRunWhenFirstLoad is true", () => {
            // arrange
            const dispatch = jest.fn();
            const broadcastGameEvent = jest.fn();
            const mockProps = {
                dispatch,
                gameStateContextModel: jest.fn(),
                gameMessageHandler: {
                    broadcastGameEvent,
                    register: jest.fn(),
                    removeHandler: jest.fn(),
                } as any,
                durations: {} as any,
                pfSeedBy: "roundId" as const,
            };
            const handler = new RoundIdHandler(mockProps);
            handler["shouldRunWhenFirstLoad"] = true;

            // act
            handler.handleRoundId({ roundId: 10 });

            // assert
            expect(dispatch).toHaveBeenCalledWith({ type: GameEventActionType.DRAW_ID, payload: { drawId: 0 } });
            expect(broadcastGameEvent).toHaveBeenCalledWith({
                savePFSettingFromTurnIdHandler: { drawId: 10 },
            });
        });

        it("should not dispatch when pfSeedBy is drawId", () => {
            // arrange
            const dispatch = jest.fn();
            const broadcastGameEvent = jest.fn();
            const mockProps = {
                dispatch,
                gameStateContextModel: jest.fn(),
                gameMessageHandler: {
                    broadcastGameEvent,
                    register: jest.fn(),
                    removeHandler: jest.fn(),
                } as any,
                durations: {} as any,
                pfSeedBy: "drawId" as const,
            };
            const handler = new RoundIdHandler(mockProps);
            handler["shouldRunWhenFirstLoad"] = true;

            // act
            handler.handleRoundId({ roundId: 10 });

            // assert
            expect(dispatch).not.toHaveBeenCalled();
            expect(broadcastGameEvent).not.toHaveBeenCalled();
        });

        it("should still dispatch when shouldRunWhenFirstLoad is false but not in display result state", () => {
            // arrange
            const dispatch = jest.fn();
            const broadcastGameEvent = jest.fn();
            const mockProps = {
                dispatch,
                gameStateContextModel: jest.fn(),
                gameMessageHandler: {
                    broadcastGameEvent,
                    register: jest.fn(),
                    removeHandler: jest.fn(),
                } as any,
                durations: {} as any,
                pfSeedBy: "roundId" as const,
            };
            const handler = new RoundIdHandler(mockProps);
            handler["shouldRunWhenFirstLoad"] = false;
            handler["roundState"] = 0; // RoundState.None

            // act
            handler.handleRoundId({ roundId: 10 });

            // assert
            expect(dispatch).toHaveBeenCalledWith({ type: GameEventActionType.DRAW_ID, payload: { drawId: 0 } });
            expect(broadcastGameEvent).toHaveBeenCalledWith({
                savePFSettingFromTurnIdHandler: { drawId: 10 },
            });
        });

        it("should not dispatch when shouldRunWhenFirstLoad is false and in display result state", () => {
            // arrange
            const dispatch = jest.fn();
            const broadcastGameEvent = jest.fn();
            const mockProps = {
                dispatch,
                gameStateContextModel: jest.fn(),
                gameMessageHandler: {
                    broadcastGameEvent,
                    register: jest.fn(),
                    removeHandler: jest.fn(),
                } as any,
                durations: {} as any,
                pfSeedBy: "roundId" as const,
            };
            const handler = new RoundIdHandler(mockProps);
            handler["shouldRunWhenFirstLoad"] = false;
            handler["roundState"] = 4; // RoundState.DisplayResult

            // act
            handler.handleRoundId({ roundId: 10 });

            // assert
            expect(dispatch).not.toHaveBeenCalled();
            expect(broadcastGameEvent).not.toHaveBeenCalled();
        });
    });
});
