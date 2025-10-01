import { BetHistoryHandler } from "../bet-history-handler";
import { messageEventType } from "../game-message-handler";
import useBetHistoryStore from "@shared/stores/bet-history-store/bet-history-store";
import { RoundState } from "@shared/components/game-base/type";

jest.mock("@shared/stores/game-store/game-store", () => {
    const mockStore = () => {};
    mockStore.getState = () => ({ playerResultBoard: { roundId: 1 }, gameConfigs: { odds: { red: 2 } } });
    return {
        __esModule: true,
        default: mockStore,
    };
});
jest.mock("@shared/stores/pf-store/pf-store", () => {
    const mockStore = () => {};
    mockStore.getState = () => ({ pfClientSeedSetting: {} });
    return {
        __esModule: true,
        default: mockStore,
    };
});

function createMockGMH() {
    const handlers: Record<string, Function> = {};
    return {
        handlers,
        register: jest.fn((event: string, fn: Function) => {
            handlers[event] = fn;
            return `${event}-id`;
        }),
        removeHandler: jest.fn(),
        broadcastGameEvent: jest.fn(),
    } as any;
}

describe("BetHistoryHandler", () => {
    beforeEach(() => {
        // @ts-ignore
        useBetHistoryStore.setState({
            betLogs: [],
            currentPage: 1,
            totalPages: 1,
            serverTotalPages: 1,
            isLoading: false,
            isExpanded: false,
            hasMoreData: true,
            pendingBetDetails: [],
            pendingBetRoundId: null,
            pendingFirstBetTime: null,
        });
    });

    it("should send history request via GameMessageHandler", () => {
        // Arrange
        const gmh = createMockGMH();
        const handler = new BetHistoryHandler({ gameMessageHandler: gmh });

        // Act
        handler.requestHistory(3);

        // Assert
        expect(gmh.broadcastGameEvent).toHaveBeenCalledWith({
            [messageEventType.SEND_SOCKET_MESSAGE]: {
                event: "getHistory",
                data: { page: 3 },
            },
        });
    });

    it("toggleExpanded should load remaining pages when hasMoreData is true", () => {
        // Arrange
        const gmh = createMockGMH();
        const handler = new BetHistoryHandler({ gameMessageHandler: gmh });
        useBetHistoryStore.setState({ currentPage: 1, serverTotalPages: 3, hasMoreData: true });

        // Act
        handler.toggleExpanded();

        // Assert
        expect(gmh.broadcastGameEvent).toHaveBeenCalledTimes(2);
        expect(gmh.broadcastGameEvent.mock.calls[0][0][messageEventType.SEND_SOCKET_MESSAGE].data.page).toBe(2);
        expect(gmh.broadcastGameEvent.mock.calls[1][0][messageEventType.SEND_SOCKET_MESSAGE].data.page).toBe(3);
    });

    it("loadNextPage respects pagination limits", () => {
        // Arrange
        const gmh = createMockGMH();
        const handler = new BetHistoryHandler({ gameMessageHandler: gmh });
        useBetHistoryStore.setState({ currentPage: 1, totalPages: 2, hasMoreData: true });

        // Act
        handler.loadNextPage();

        // Assert
        expect(gmh.broadcastGameEvent).toHaveBeenCalledWith({
            [messageEventType.SEND_SOCKET_MESSAGE]: {
                event: "getHistory",
                data: { page: 2 },
            },
        });

        // calling again when already last page should not broadcast
        gmh.broadcastGameEvent.mockClear();
        useBetHistoryStore.setState({ currentPage: 2 });
        handler.loadNextPage();
        expect(gmh.broadcastGameEvent).not.toHaveBeenCalled();
    });

    it("should not append duplicate pending bet log", () => {
        // Arrange
        const gmh = createMockGMH();
        const handler = new BetHistoryHandler({ gameMessageHandler: gmh });
        useBetHistoryStore.setState({ betLogs: [{ roundId: 999, phien: 999, totalAmount: 10, betwin: 20 }] as any });

        useBetHistoryStore.setState({ pendingBetRoundId: 999, pendingBetDetails: [{ amount: 10, choice: "red", time: "iso", clientSeed: "" }], pendingFirstBetTime: "iso" });
        handler["latestFinish"] = { roundId: 999, settlementResult: { red: true }, result: {} } as any;
        handler["latestOdds"] = { red: 2 };

        // Act
        // @ts-ignore
        handler.flushLocalBetLogIfAny();

        // Assert
        expect(useBetHistoryStore.getState().betLogs.filter((l: any) => l.roundId === 999)).toHaveLength(1);
    });

    it("calculateBetWin falls back to generic when no calculator", () => {
        // Arrange
        const gmh = createMockGMH();
        const handler = new BetHistoryHandler({ gameMessageHandler: gmh, gameId: "unknown" });

        const pending = [{ amount: 50, choice: "x" }];
        const resultData = { settlementResult: { x: true }, odds: { x: 3 }, result: {} } as any;

        // Act
        // @ts-ignore
        const win = handler.calculateBetWin(pending, resultData);

        // Assert
        expect(win).toBe(150);
    });

    it("uses game-specific calculator when available", () => {
        // Arrange
        const { BetWinCalculatorRegistry } = require("@shared/helpers/bet-history/bet-history-calculator");
        const mockCalc = {
            calculateBetWin: jest.fn().mockReturnValue(999),
            getGameId: () => "mockgame",
        };
        BetWinCalculatorRegistry.registerCalculator(mockCalc as any);

        const gmh = createMockGMH();
        const handler = new BetHistoryHandler({ gameMessageHandler: gmh, gameId: "mockgame" });

        // prepare store pending bet so flush will call calculate
        useBetHistoryStore.setState({
            pendingBetDetails: [{ amount: 10, choice: "a", time: "t", clientSeed: "" }],
            pendingBetRoundId: 321,
            pendingFirstBetTime: "t",
        });
        // @ts-ignore
        handler.latestFinish = { roundId: 321, settlementResult: { a: true }, result: {} };
        // @ts-ignore
        handler.latestOdds = { a: 2 };

        // Act
        // @ts-ignore
        handler.flushLocalBetLogIfAny();

        // Assert
        expect(mockCalc.calculateBetWin).toHaveBeenCalled();
        expect(useBetHistoryStore.getState().betLogs[0].betwin).toBe(999);
    });

    it("should flush pending bets into betLogs at round transition", () => {
        // Arrange
        const gmh = createMockGMH();
        const handler = new BetHistoryHandler({ gameMessageHandler: gmh });

        const store = useBetHistoryStore;

        gmh.handlers[messageEventType.ROUND_STATE]({ roundState: RoundState.Disabled });
        // Act – place bet, receive odds & finish, then new round
        gmh.handlers[messageEventType.OWN_BETS]({
            ownBets: [],
            ownChip: { amount: 100, betChoice: "red" },
        });

        // odds broadcast
        gmh.handlers[messageEventType.ODDS]({ odds: { red: 2 } });

        // finish result indicates red wins
        gmh.handlers[messageEventType.FINISH]({ finish: { roundId: 123, settlementResult: { red: true }, result: {} } });

        // transition to InRound state (2)
        gmh.handlers[messageEventType.ROUND_STATE]({ roundState: RoundState.InRound });

        // Assert
        expect(store.getState().betLogs).toHaveLength(1);
        const log = store.getState().betLogs[0];
        expect(log.totalAmount).toBe(100);
        expect(log.betwin).toBe(200);
    });

    it("scrollToTop sets element scrollTop to 0", () => {
        // Arrange
        const gmh = createMockGMH();
        const handler = new BetHistoryHandler({ gameMessageHandler: gmh });
        const mockElem = { scrollTop: 123 } as any;
        jest.spyOn(document, "querySelector").mockReturnValueOnce(mockElem);

        // Act
        handler.scrollToTop();

        // Assert
        expect(mockElem.scrollTop).toBe(0);
    });

    it("loadNextPage early-exits when hasMoreData false", () => {
        // Arrange
        const gmh = createMockGMH();
        const handler = new BetHistoryHandler({ gameMessageHandler: gmh });
        useBetHistoryStore.setState({ currentPage: 1, totalPages: 2, hasMoreData: false });

        // Act
        handler.loadNextPage();

        // Assert
        expect(gmh.broadcastGameEvent).not.toHaveBeenCalled();
    });

    it("toggleExpanded collapse path does not request pages", () => {
        // Arrange
        const gmh = createMockGMH();
        const handler = new BetHistoryHandler({ gameMessageHandler: gmh });
        useBetHistoryStore.setState({ isExpanded: true });

        // Act
        handler.toggleExpanded(); // collapse

        // Assert
        expect(useBetHistoryStore.getState().isExpanded).toBe(false);
        expect(gmh.broadcastGameEvent).not.toHaveBeenCalled();
    });

    it("flushLocalBetLogIfAny exits when no pending bets", () => {
        // Arrange
        const gmh = createMockGMH();
        const handler = new BetHistoryHandler({ gameMessageHandler: gmh });
        const initialLen = useBetHistoryStore.getState().betLogs.length;

        // Act
        // @ts-ignore
        handler.flushLocalBetLogIfAny();

        // Assert
        expect(useBetHistoryStore.getState().betLogs.length).toBe(initialLen);
    });

    it("requestHistory sets loading flag", () => {
        // Arrange
        const gmh = createMockGMH();
        const handler = new BetHistoryHandler({ gameMessageHandler: gmh });

        // Act
        handler.requestHistory(1);

        // Assert
        expect(useBetHistoryStore.getState().isLoading).toBe(true);
    });
});
