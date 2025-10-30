import { create } from "zustand";
import { act } from "@testing-library/react";
import { createBetHistorySlice, BetHistorySlice, BetLog } from "../bet-history-slice";

describe("BetHistorySlice", () => {
    const initStore = () =>
        create<BetHistorySlice>()((set, get, api) => createBetHistorySlice(set, get, api));

    it("should add pending bets and detect hasPendingBets", () => {
        const store = initStore();
        const bet = { time: "2025-10-01T00:00:00Z", amount: 100, choice: "red", clientSeed: "seed" };

        // Act
        act(() => {
            store.getState().addPendingBet(bet);
            store.getState().setPendingBetRoundId(123);
        });

        // Assert
        expect(store.getState().pendingBetDetails).toHaveLength(1);
        expect(store.getState().hasPendingBets()).toBe(true);
    });

    it("should compute win value correctly", () => {
        const store = initStore();
        const log: BetLog = {
            freeBet: false,
            roundId: 1,
            phien: 1,
            appType: 0,
            betwin: 300,
            clientSeed: "",
            name: "",
            rate: 0,
            time: "2025-10-01T00:00:00Z",
            totalAmount: 200,
            result: {},
            settlementResult: {},
            odds: {},
            betLogDetails: [],
        };
        // Assert
        expect(store.getState().getWinValue(log)).toBe(100);
    });

    it("should limit bet logs when collapsed and show all when expanded", () => {
        const store = initStore();
        // generate 15 logs
        const logs: BetLog[] = Array.from({ length: 15 }).map((_, i) => ({
            freeBet: false,
            roundId: i + 1,
            phien: i + 1,
            appType: 0,
            betwin: 0,
            clientSeed: "",
            name: "",
            rate: 0,
            time: "2025-10-01T00:00:00Z",
            totalAmount: 100,
            result: {},
            settlementResult: {},
            odds: {},
            betLogDetails: [],
        }));

        // Act
        act(() => {
            store.getState().setBetLogs(logs);
        });
        // Assert collapsed
        expect(store.getState().getDisplayedBetLogs()).toHaveLength(10);

        // Act expand
        act(() => {
            store.getState().setIsExpanded(true);
        });
        // Assert expanded
        expect(store.getState().getDisplayedBetLogs()).toHaveLength(15);
    });

    it("appendBetLogs should maintain desc order and update pagination", () => {
        const store = initStore();
        const log1 = { roundId: 1, phien: 1 } as any;
        const log2 = { roundId: 2, phien: 2 } as any;

        act(() => {
            store.getState().setBetLogs([log1]);
            store.getState().appendBetLogs([log2]);
        });

        const rounds = store.getState().betLogs.map((l) => l.roundId);
        expect(rounds).toEqual([2, 1]);
        expect(store.getState().totalPages).toBe(Math.ceil(2 / 10));
    });

    it("appendBetLogs with duplicates does not change state", () => {
        // Arrange
        const store = initStore();
        const log = fakeLog(1);
        act(() => {
            store.getState().setBetLogs([log]);
        });
        const prevTotalPages = store.getState().totalPages;

        // Act
        act(() => {
            store.getState().appendBetLogs([log]); // duplicate
        });

        // Assert
        expect(store.getState().betLogs).toHaveLength(1);
        expect(store.getState().totalPages).toBe(prevTotalPages);
    });

    it("appendBetLogs respects updatePagination=false", () => {
        // Arrange
        const store = initStore();
        const log1 = fakeLog(1);
        const log2 = fakeLog(2);
        act(() => {
            store.getState().setBetLogs([log1]);
        });
        const prevTotalPages = store.getState().totalPages;

        // Act
        act(() => {
            store.getState().appendBetLogs([log2], { updatePagination: false });
        });

        // Assert
        expect(store.getState().betLogs).toHaveLength(2);
        expect(store.getState().totalPages).toBe(prevTotalPages); // unchanged
    });

    it("clearPendingBets resets pending state", () => {
        // Arrange
        const store = initStore();
        act(() => {
            store.getState().addPendingBet({ time: "t", amount: 1, choice: "x", clientSeed: "" });
            store.getState().setPendingBetRoundId(11);
            store.getState().setPendingFirstBetTime("t");
        });

        // Act
        act(() => {
            store.getState().clearPendingBets();
        });

        // Assert
        expect(store.getState().pendingBetDetails).toHaveLength(0);
        expect(store.getState().pendingBetRoundId).toBeNull();
        expect(store.getState().pendingFirstBetTime).toBeNull();
    });

    it("registerBetHistoryEvent sets hasMoreData=false on last page", () => {
        // Arrange
        const store = initStore();
        const historyMsg = {
            history: {
                betLogs: [fakeLog(10)],
                page: 3,
                pageSize: 10,
                total: 30,
            },
        };

        // Act
        act(() => {
            store.getState().registerBetHistoryEvent(historyMsg);
        });

        // Assert
        expect(store.getState().hasMoreData).toBe(false);
    });

    it("should process server history event and update pagination & hasMoreData", () => {
        const store = initStore();

        const historyMessage = {
            history: {
                betLogs: [fakeLog(1), fakeLog(2), fakeLog(3)],
                page: 1,
                pageSize: 10,
                total: 30,
            },
        };

        // Act
        act(() => {
            store.getState().registerBetHistoryEvent(historyMessage);
        });

        // Assert
        expect(store.getState().betLogs).toHaveLength(3);
        expect(store.getState().totalPages).toBe(3);
        expect(store.getState().hasMoreData).toBe(true);
    });

    function fakeLog(id: number): BetLog {
        return {
            freeBet: false,
            roundId: id,
            phien: id,
            appType: 0,
            betwin: 0,
            clientSeed: "",
            name: "",
            rate: 0,
            time: "iso",
            totalAmount: 100,
            result: {},
            settlementResult: {},
            odds: {},
            betLogDetails: [],
        };
    }
});
