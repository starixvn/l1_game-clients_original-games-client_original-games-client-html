import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { messageEventType } from "../../game-base/handlers/game-message-handler";
import { RoundState } from "../../game-base/type";
import { RoundIdHandler } from "../round-id-handler";

describe(RoundIdHandler.name, () => {
    describe("registerEvents", () => {
        it("registerEvents_withValidHandler_shouldRegisterAllAndResetState", () => {
            // arrange
            const dispatch = jest.fn();
            const register = jest.fn();
            const mockProps = {
                dispatch,
                gameStateContextModel: jest.fn(),
                gameMessageHandler: {
                    broadcastGameEvent: jest.fn(),
                    register,
                    removeHandler: jest.fn(),
                } as any,
                durations: {} as any,
                pfSeedBy: "roundId" as const,
            };
            const handler = new RoundIdHandler(mockProps);
            handler["roundState"] = RoundState.DisplayResult; // set a non-default to verify reset
            handler["roundRemainingTime"] = 99;
            handler["shouldRunWhenFirstLoad"] = false;

            // act
            handler.registerEvents();

            // assert
            expect(register).toHaveBeenCalledTimes(4);
            expect(register).toHaveBeenCalledWith(messageEventType.REMAINING_TIME, expect.any(Function));
            expect(register).toHaveBeenCalledWith(messageEventType.ROUND_ID, expect.any(Function));
            expect(register).toHaveBeenCalledWith(messageEventType.PF, expect.any(Function));
            expect(register).toHaveBeenCalledWith(messageEventType.ROUND_STATE, expect.any(Function));
            expect(handler["shouldRunWhenFirstLoad"]).toBe(true);
            expect(handler["roundRemainingTime"]).toBe(0);
            expect(handler["roundState"]).toBe(RoundState.None);
        });
    });

    describe("handleRemainingTime", () => {
        it("handleRemainingTime_onFirstLoad_shouldStoreRemainingTime", () => {
            // arrange
            const handler = new RoundIdHandler({
                dispatch: jest.fn(),
                gameStateContextModel: jest.fn(),
                gameMessageHandler: { broadcastGameEvent: jest.fn(), register: jest.fn(), removeHandler: jest.fn() } as any,
                durations: {} as any,
                pfSeedBy: "roundId" as const,
            });
            handler["shouldRunWhenFirstLoad"] = true;

            // act
            handler.handleRemainingTime({ remainingTime: 12 });

            // assert
            expect(handler["roundRemainingTime"]).toBe(12);
        });

        it("handleRemainingTime_afterFirstLoad_shouldNotOverride", () => {
            // arrange
            const handler = new RoundIdHandler({
                dispatch: jest.fn(),
                gameStateContextModel: jest.fn(),
                gameMessageHandler: { broadcastGameEvent: jest.fn(), register: jest.fn(), removeHandler: jest.fn() } as any,
                durations: {} as any,
                pfSeedBy: "roundId" as const,
            });
            handler["shouldRunWhenFirstLoad"] = false;
            handler["roundRemainingTime"] = 5;

            // act
            handler.handleRemainingTime({ remainingTime: 20 });

            // assert
            expect(handler["roundRemainingTime"]).toBe(5);
        });
    });

    describe("handleRoundId", () => {
        it("handleRoundId_firstLoad_shouldBroadcastThenDispatchAndUnsetFirstLoad", () => {
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
            expect(handler["shouldRunWhenFirstLoad"]).toBe(false);
            expect(dispatch).toHaveBeenCalledWith({
                type: GameEventActionType.ROUND_ID,
                payload: { roundId: 10 },
            });
            expect(broadcastGameEvent).toHaveBeenCalledWith({
                savePFSettingFromTurnIdHandler: { roundId: 10 },
            });
            expect(broadcastGameEvent.mock.invocationCallOrder[0]).toBeLessThan(
                dispatch.mock.invocationCallOrder[0]
            );
        });
        it("handleRoundId_inDisplayResult_shouldNotDispatchOrBroadcast", () => {
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
            handler["roundState"] = RoundState.DisplayResult;

            // act
            handler.handleRoundId({ roundId: 10 });

            // assert
            expect(dispatch).not.toHaveBeenCalled();
            expect(broadcastGameEvent).not.toHaveBeenCalled();
        });

        it("handleRoundId_afterFirstLoadAndNotDisplayResult_shouldDispatchThenBroadcast", () => {
            // arrange
            const dispatch = jest.fn();
            const broadcastGameEvent = jest.fn();
            const handler = new RoundIdHandler({
                dispatch,
                gameStateContextModel: jest.fn(),
                gameMessageHandler: { broadcastGameEvent, register: jest.fn(), removeHandler: jest.fn() } as any,
                durations: {} as any,
                pfSeedBy: "roundId" as const,
            });
            handler["shouldRunWhenFirstLoad"] = false;
            handler["roundState"] = RoundState.None;

            // act
            handler.handleRoundId({ roundId: 99 });

            // assert
            expect(dispatch).toHaveBeenCalledWith({ type: GameEventActionType.ROUND_ID, payload: { roundId: 99 } });
            expect(broadcastGameEvent).toHaveBeenCalledWith({ savePFSettingFromTurnIdHandler: { roundId: 99 } });
            expect(dispatch.mock.invocationCallOrder[0]).toBeLessThan(
                broadcastGameEvent.mock.invocationCallOrder[0]
            );
        });
    });

    describe("handlePF", () => {
        it("handlePF_notInDisplayResult_shouldDispatchThenBroadcast", () => {
            // arrange
            const dispatch = jest.fn();
            const broadcastGameEvent = jest.fn();
            const handler = new RoundIdHandler({
                dispatch,
                gameStateContextModel: jest.fn(),
                gameMessageHandler: { broadcastGameEvent, register: jest.fn(), removeHandler: jest.fn() } as any,
                durations: {} as any,
                pfSeedBy: "roundId" as const,
            });
            handler["roundState"] = RoundState.None;

            // act
            handler.handlePF({ pf: { roundId: 7 } });

            // assert
            expect(handler["roundId"]).toBe(7);
            expect(dispatch).toHaveBeenCalledWith({ type: GameEventActionType.ROUND_ID, payload: { roundId: 7 } });
            expect(broadcastGameEvent).toHaveBeenCalledWith({ savePFSettingFromTurnIdHandler: { roundId: 7 } });
            expect(dispatch.mock.invocationCallOrder[0]).toBeLessThan(
                broadcastGameEvent.mock.invocationCallOrder[0]
            );
        });

        it("handlePF_inDisplayResult_shouldNotDispatchOrBroadcast", () => {
            // arrange
            const dispatch = jest.fn();
            const broadcastGameEvent = jest.fn();
            const handler = new RoundIdHandler({
                dispatch,
                gameStateContextModel: jest.fn(),
                gameMessageHandler: { broadcastGameEvent, register: jest.fn(), removeHandler: jest.fn() } as any,
                durations: {} as any,
                pfSeedBy: "roundId" as const,
            });
            handler["roundState"] = RoundState.DisplayResult;

            // act
            handler.handlePF({ pf: { roundId: 11 } });

            // assert
            expect(dispatch).not.toHaveBeenCalled();
            expect(broadcastGameEvent).not.toHaveBeenCalled();
        });
    });

    describe("handleRoundState", () => {
        it("handleRoundState_prevDisplayResultToInRound_shouldBroadcastClientSeedAndUpdateState", () => {
            // arrange
            const broadcastGameEvent = jest.fn();
            const handler = new RoundIdHandler({
                dispatch: jest.fn(),
                gameStateContextModel: jest.fn(),
                gameMessageHandler: { broadcastGameEvent, register: jest.fn(), removeHandler: jest.fn() } as any,
                durations: {} as any,
                pfSeedBy: "roundId" as const,
            });
            handler["roundState"] = RoundState.DisplayResult; // isInDisplayResultState() === true
            handler["roundId"] = 42;

            // act
            handler.handleRoundState({ roundState: RoundState.InRound });

            // assert
            expect(broadcastGameEvent).toHaveBeenCalledWith({
                savePFSettingFromTurnIdHandler: { roundId: 42 },
            });
            expect(handler["roundState"]).toBe(RoundState.InRound);
        });

        it("handleRoundState_prevNoneToInRound_shouldNotBroadcastButUpdateState", () => {
            // arrange
            const broadcastGameEvent = jest.fn();
            const handler = new RoundIdHandler({
                dispatch: jest.fn(),
                gameStateContextModel: jest.fn(),
                gameMessageHandler: { broadcastGameEvent, register: jest.fn(), removeHandler: jest.fn() } as any,
                durations: {} as any,
                pfSeedBy: "roundId" as const,
            });
            handler["roundState"] = RoundState.None; // isInDisplayResultState() === false

            // act
            handler.handleRoundState({ roundState: RoundState.InRound });

            // assert
            expect(broadcastGameEvent).not.toHaveBeenCalled();
            expect(handler["roundState"]).toBe(RoundState.InRound);
        });

        it("handleRoundState_toDisplayResult_shouldNotBroadcastAndUpdateState", () => {
            // arrange
            const broadcastGameEvent = jest.fn();
            const handler = new RoundIdHandler({
                dispatch: jest.fn(),
                gameStateContextModel: jest.fn(),
                gameMessageHandler: { broadcastGameEvent, register: jest.fn(), removeHandler: jest.fn() } as any,
                durations: {} as any,
                pfSeedBy: "roundId" as const,
            });
            handler["roundState"] = RoundState.InRound;

            // act
            handler.handleRoundState({ roundState: RoundState.DisplayResult });

            // assert
            expect(broadcastGameEvent).not.toHaveBeenCalled();
            expect(handler["roundState"]).toBe(RoundState.DisplayResult);
        });
    });
});
