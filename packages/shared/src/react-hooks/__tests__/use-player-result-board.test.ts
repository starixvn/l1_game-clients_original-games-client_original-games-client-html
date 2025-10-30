import { renderHook, act } from "@testing-library/react";
import { RoundState } from "@shared/components/game-base/type";
import { usePlayerResultBoard } from "../use-player-result-board";

// ✅ Mock Zustand store
const mockStoreState = {
  playerResultBoard: null,
  rate: 1,
  shouldShowResults: false,
  setShouldShowResults: jest.fn(),
};

// Mock the store
jest.mock("../../stores/game-store/game-store", () => jest.fn());

// ✅ Mock contexts
const mockGameStateContext = { roundState: RoundState.None };
const mockGameContext = { durations: { showResult: 2 } };

jest.mock("../../react-contexts/game-state-context/game-state-context", () => ({
  useGameStateContext: jest.fn(() => mockGameStateContext),
}));

jest.mock("../../react-contexts", () => ({
  useGameContext: jest.fn(() => mockGameContext),
}));

// ✅ Import store after mock
import useGameStore from "../../stores/game-store/game-store";

describe("usePlayerResultBoard Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock store state
    Object.assign(mockStoreState, {
      playerResultBoard: null,
      rate: 1,
      shouldShowResults: false,
      setShouldShowResults: jest.fn(),
    });

    // Setup mock store to handle selectors and getState
    (useGameStore as any).mockImplementation((selector?: any) => {
      if (typeof selector === 'function') {
        return selector(mockStoreState);
      }
      return mockStoreState;
    });

    (useGameStore as any).getState = jest.fn(() => mockStoreState);

    // Reset mock contexts
    Object.assign(mockGameStateContext, { roundState: RoundState.None });
    Object.assign(mockGameContext, { durations: { showResult: 2 } });
  });

  it("should return default empty state when playerResultBoard is null", () => {
    const { result } = renderHook(() => usePlayerResultBoard());
    expect(result.current.totalPlayers).toBe(0);
    expect(result.current.roundId).toBe("");
    expect(result.current.tableData).toEqual([]);
    expect(result.current.shouldShowResults).toBe(false);
  });

  it("should correctly calculate formatted amounts", () => {
    Object.assign(mockStoreState, {
      playerResultBoard: {
        totalPlayers: 2,
        roundId: 123,
        players: [
          { name: "Player 1", betAmount: 100, winAmount: 50 },
          { name: "Player 2", betAmount: 200, winAmount: -25 },
        ],
      },
      shouldShowResults: true,
    });

    const { result } = renderHook(() => usePlayerResultBoard());

    expect(result.current.tableData).toHaveLength(2);
    expect(result.current.tableData[0]).toEqual({
      playerName: "Player 1",
      betAmount: "100",
      win: "50",
    });
    expect(result.current.tableData[1]).toEqual({
      playerName: "Player 2",
      betAmount: "200",
      win: "0", // Negative amounts < 0.1 are converted to "0"
    });
  });

  it("should handle rate conversion properly", () => {
    Object.assign(mockStoreState, {
      playerResultBoard: {
        totalPlayers: 1,
        roundId: 456,
        players: [{ name: "Player 1", betAmount: 1000, winAmount: 500 }],
      },
      rate: 10,
      shouldShowResults: true,
    });

    const { result } = renderHook(() => usePlayerResultBoard());
    expect(result.current.tableData[0]).toEqual({
      playerName: "Player 1",
      betAmount: "100",
      win: "50",
    });
  });

  it("should display '-' when shouldShowResults is false", () => {
    Object.assign(mockStoreState, {
      playerResultBoard: {
        totalPlayers: 1,
        roundId: 789,
        players: [{ name: "Player 1", betAmount: 100, winAmount: 50 }],
      },
      shouldShowResults: false,
    });

    const { result } = renderHook(() => usePlayerResultBoard());
    expect(result.current.tableData[0].win).toBe("-");
  });

  it("should show win amount when roundState is InRound", () => {
    Object.assign(mockGameStateContext, { roundState: RoundState.InRound });
    Object.assign(mockStoreState, {
      playerResultBoard: {
        totalPlayers: 1,
        roundId: 999,
        players: [{ name: "Player 1", betAmount: 100, winAmount: 25 }],
      },
      shouldShowResults: false,
    });

    const { result } = renderHook(() => usePlayerResultBoard());
    expect(result.current.tableData[0].win).toBe("25");
  });

  it("should display '0' when amount < 0.1", () => {
    Object.assign(mockStoreState, {
      playerResultBoard: {
        totalPlayers: 1,
        roundId: 111,
        players: [{ name: "Player 1", betAmount: 0.05, winAmount: 0.05 }],
      },
      shouldShowResults: true,
    });

    const { result } = renderHook(() => usePlayerResultBoard());
    expect(result.current.tableData[0]).toEqual({
      playerName: "Player 1",
      betAmount: "0",
      win: "0",
    });
  });

  it("should return empty table when no players", () => {
    Object.assign(mockStoreState, {
      playerResultBoard: { totalPlayers: 0, roundId: 222, players: [] },
      shouldShowResults: true,
    });

    const { result } = renderHook(() => usePlayerResultBoard());
    expect(result.current.tableData).toEqual([]);
    expect(result.current.totalPlayers).toBe(0);
  });

  it("should show '-' when winAmount is null", () => {
    Object.assign(mockStoreState, {
      playerResultBoard: {
        totalPlayers: 1,
        roundId: 333,
        players: [{ name: "Player 1", betAmount: 100, winAmount: null }],
      },
      shouldShowResults: true,
    });

    const { result } = renderHook(() => usePlayerResultBoard());
    expect(result.current.tableData[0].win).toBe("-");
  });

  it("should format large numbers with commas", () => {
    Object.assign(mockStoreState, {
      playerResultBoard: {
        totalPlayers: 1,
        roundId: 444,
        players: [{ name: "Player 1", betAmount: 1000000, winAmount: 500000 }],
      },
      shouldShowResults: true,
    });

    const { result } = renderHook(() => usePlayerResultBoard());
    expect(result.current.tableData[0]).toEqual({
      playerName: "Player 1",
      betAmount: "1,000,000",
      win: "500,000",
    });
  });

  it("should call setShouldShowResults(true) after DisplayResult duration", async () => {
    jest.useFakeTimers();

    Object.assign(mockGameStateContext, { roundState: RoundState.DisplayResult });
    Object.assign(mockGameContext, { durations: { showResult: 1 } });

    renderHook(() => usePlayerResultBoard());

    expect(mockStoreState.setShouldShowResults).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockStoreState.setShouldShowResults).toHaveBeenCalledWith(true);
    jest.useRealTimers();
  });

  it("should call setShouldShowResults(false) during LockingBet", () => {
    Object.assign(mockGameStateContext, { roundState: RoundState.LockingBet });
    renderHook(() => usePlayerResultBoard());
    expect(mockStoreState.setShouldShowResults).toHaveBeenCalledWith(false);
  });

  it("should call setShouldShowResults(true) during None", () => {
    Object.assign(mockGameStateContext, { roundState: RoundState.None });
    renderHook(() => usePlayerResultBoard());
    expect(mockStoreState.setShouldShowResults).toHaveBeenCalledWith(true);
  });

  it("should handle unknown round state in switch statement", () => {
    // Test the default case in the switch statement
    Object.assign(mockGameStateContext, { roundState: RoundState.Disabled });
    renderHook(() => usePlayerResultBoard());
    // Default case does nothing, so no setShouldShowResults should be called
    expect(mockStoreState.setShouldShowResults).not.toHaveBeenCalled();
  });

  it("should handle zero bet amount correctly", () => {
    Object.assign(mockStoreState, {
      playerResultBoard: {
        totalPlayers: 1,
        roundId: 123,
        players: [{ name: "Player 1", betAmount: 0, winAmount: 50 }],
      },
      shouldShowResults: true,
    });

    const { result } = renderHook(() => usePlayerResultBoard());
    expect(result.current.tableData[0]).toEqual({
      playerName: "Player 1",
      betAmount: "", // Zero amount returns empty string
      win: "50",
    });
  });

  it("should handle complex win amount display conditions", () => {
    // Test the edge case where shouldShowResults is false but roundState is not InRound
    Object.assign(mockStoreState, {
      playerResultBoard: {
        totalPlayers: 1,
        roundId: 123,
        players: [{ name: "Player 1", betAmount: 100, winAmount: 50 }],
      },
      shouldShowResults: false,
    });

    // Test with BeforePlaceBet state (not InRound)
    Object.assign(mockGameStateContext, { roundState: RoundState.BeforePlaceBet });

    const { result } = renderHook(() => usePlayerResultBoard());
    expect(result.current.tableData[0].win).toBe("-"); // Should not show win amount
  });

  it("should handle shouldShowResults true but winAmount null", () => {
    Object.assign(mockStoreState, {
      playerResultBoard: {
        totalPlayers: 1,
        roundId: 123,
        players: [{ name: "Player 1", betAmount: 100, winAmount: null }],
      },
      shouldShowResults: true,
    });

    Object.assign(mockGameStateContext, { roundState: RoundState.DisplayResult });

    const { result } = renderHook(() => usePlayerResultBoard());
    expect(result.current.tableData[0].win).toBe("-"); // Should show dash when winAmount is null
  });
});
