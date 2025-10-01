import React from "react";
import { render, screen } from "@testing-library/react";
import { PlayerResultBoardTable } from "../player-result-board-table";
import { useCommonTranslate, usePlayerResultBoard } from "@shared/react-hooks";
// Import string helper to ensure prototype methods are available
import "@shared/helpers/string-helper";

// Mock the hooks
jest.mock("@shared/react-hooks", () => ({
    useCommonTranslate: jest.fn(),
    usePlayerResultBoard: jest.fn(),
}));

// Mock the statistic store
jest.mock("@shared/stores", () => ({
    useStatisticStore: jest.fn(),
}));

const mockUseCommonTranslate = useCommonTranslate as jest.MockedFunction<typeof useCommonTranslate>;
const mockUsePlayerResultBoard = usePlayerResultBoard as jest.MockedFunction<typeof usePlayerResultBoard>;
const mockUseStatisticStore = require("@shared/stores").useStatisticStore as jest.Mock;

// Helper function to create complete mock return value
const createMockPlayerResultBoardReturn = (overrides: Partial<ReturnType<typeof usePlayerResultBoard>> = {}) => ({
    totalPlayers: 0,
    roundId: "",
    tableData: [],
    shouldShowResults: false,
    ...overrides,
});

describe("PlayerResultBoardTable", () => {
    const mockTranslateCommon = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCommonTranslate.mockReturnValue({
            t: mockTranslateCommon,
            isLoading: false,
        });
        mockTranslateCommon.mockImplementation((key: string) => key);

        // Mock usePlayerResultBoard
        mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn());

        // Mock useStatisticStore
        mockUseStatisticStore.mockReturnValue({
            isShowStatistic: false,
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("rendering", () => {
        it("should render table structure correctly", () => {
            // Arrange
            const mockData = [
                {
                    playerName: "Player1",
                    betAmount: "100.00",
                    win: "50.00",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: mockData,
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(screen.getAllByRole("table")).toHaveLength(2); // Header table and body table
            expect(screen.getByText("Player")).toBeInTheDocument();
            expect(screen.getByText("Bet_amount")).toBeInTheDocument();
            expect(screen.getByText("Win")).toBeInTheDocument();
        });

        it("should render player data correctly", () => {
            // Arrange
            const mockData = [
                {
                    playerName: "Alice",
                    betAmount: "200.50",
                    win: "75.25",
                },
                {
                    playerName: "Bob",
                    betAmount: "150.00",
                    win: "-25.00",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: mockData,
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(screen.getByText("Alice")).toBeInTheDocument();
            expect(screen.getByText("200.50")).toBeInTheDocument();
            expect(screen.getByText("75.25")).toBeInTheDocument();
            expect(screen.getByText("Bob")).toBeInTheDocument();
            expect(screen.getByText("150.00")).toBeInTheDocument();
            expect(screen.getByText("-25.00")).toBeInTheDocument();
        });

        it("should render empty table when no data provided", () => {
            // Arrange - mock empty tableData
            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: [],
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(screen.getByText("no_data")).toBeInTheDocument();
            expect(screen.getByText("Player")).toBeInTheDocument(); // Headers are always rendered
            expect(screen.getByText("Bet_amount")).toBeInTheDocument();
            expect(screen.getByText("Win")).toBeInTheDocument();
        });

        it("should render empty table when data is null", () => {
            // Arrange - mock null tableData
            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: null as any,
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(screen.getByText("no_data")).toBeInTheDocument();
        });

        it("should render empty table when data is undefined", () => {
            // Arrange - mock undefined tableData
            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: undefined as any,
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(screen.getByText("no_data")).toBeInTheDocument();
        });
    });

    describe("styling and layout", () => {
        it("should apply correct styling to winning amounts", () => {
            // Arrange
            const mockData = [
                {
                    playerName: "Winner",
                    betAmount: "100.00",
                    win: "50.00",
                },
                {
                    playerName: "Loser",
                    betAmount: "100.00",
                    win: "-25.00",
                },
                {
                    playerName: "BreakEven",
                    betAmount: "100.00",
                    win: "0.00",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: mockData,
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            const winnerCell = screen.getByText("50.00").closest("td");
            const loserCell = screen.getByText("-25.00").closest("td");
            const breakEvenCell = screen.getByText("0.00").closest("td");

            expect(winnerCell).toHaveClass("text-winning-highlight");
            expect(loserCell).toHaveClass("text-secondary-text");
            expect(breakEvenCell).toHaveClass("text-secondary-text");
        });
    });

    describe("props handling", () => {
        it("should use default empty message when data is empty", () => {
            // Arrange - mock empty tableData
            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: [],
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(mockTranslateCommon).toHaveBeenCalledWith("no_data");
        });
    });

    describe("translations", () => {
        it("should call translation function for table headers", () => {
            // Arrange
            const mockData = [
                {
                    playerName: "TestPlayer",
                    betAmount: "100.00",
                    win: "50.00",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: mockData,
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(mockTranslateCommon).toHaveBeenCalledWith("player");
            expect(mockTranslateCommon).toHaveBeenCalledWith("bet_amount");
            expect(mockTranslateCommon).toHaveBeenCalledWith("win");
        });

        it("should call translation function for empty state", () => {
            // Arrange - mock empty tableData
            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: [],
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(mockTranslateCommon).toHaveBeenCalledWith("no_data");
        });
    });

    describe("edge cases", () => {
        it("should handle very long player names", () => {
            // Arrange
            const longPlayerName = "VeryLongPlayerNameThatMightCauseLayoutIssuesAndWrapping";
            const mockData = [
                {
                    playerName: longPlayerName,
                    betAmount: "100.00",
                    win: "50.00",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: mockData,
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(screen.getByText(longPlayerName)).toBeInTheDocument();
        });

        it("should handle special characters in amounts", () => {
            // Arrange
            const mockData = [
                {
                    playerName: "Player1",
                    betAmount: "1,000,000.99",
                    win: "-999,999.99",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: mockData,
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(screen.getByText("1,000,000.99")).toBeInTheDocument();
            expect(screen.getByText("-999,999.99")).toBeInTheDocument();
        });

        it("should handle zero amounts", () => {
            // Arrange
            const mockData = [
                {
                    playerName: "Player1",
                    betAmount: "0.00",
                    win: "0.00",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: mockData,
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(screen.getByText("Player1")).toBeInTheDocument();
            expect(screen.getAllByText("0.00")).toHaveLength(2); // betAmount and win both 0.00
        });

        it("should handle large datasets", () => {
            // Arrange
            const mockData = Array.from({ length: 10 }, (_, index) => ({
                playerName: `Player${index + 1}`,
                betAmount: `${(index + 1) * 10}.00`,
                win: `${(index + 1) * 5}.00`,
            }));

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: mockData,
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(screen.getByText("Player1")).toBeInTheDocument();
            expect(screen.getByText("Player10")).toBeInTheDocument();
            expect(screen.getAllByText(/^\d+\.00$/)).toHaveLength(20); // 10 bet amounts + 10 win amounts
        });

        it("should handle decimal amounts correctly", () => {
            // Arrange
            const mockData = [
                {
                    playerName: "Player1",
                    betAmount: "0.01",
                    win: "999999.99",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: mockData,
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(screen.getByText("Player1")).toBeInTheDocument();
            expect(screen.getAllByText(/^\d+\.\d+$/)).toHaveLength(2); // 0.01 and 999999.99
        });
    });

    describe("accessibility", () => {
        it("should have proper semantic table structure", () => {
            // Arrange
            const mockData = [
                {
                    playerName: "TestPlayer",
                    betAmount: "100.00",
                    win: "50.00",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: mockData,
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(screen.getAllByRole("table")).toHaveLength(2); // Header table and body table
            expect(screen.getAllByRole("rowgroup")).toHaveLength(2); // thead and tbody
            expect(screen.getAllByRole("row")).toHaveLength(2); // header row + data row
            expect(screen.getAllByRole("columnheader")).toHaveLength(3); // player, bet_amount, win
            expect(screen.getAllByRole("cell")).toHaveLength(3); // player data, bet data, win data
        });

        it("should have proper semantic table structure for empty state", () => {
            // Arrange - mock empty tableData
            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: [],
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert
            expect(screen.getAllByRole("table")).toHaveLength(2); // Header table and body table
            expect(screen.getAllByRole("row")).toHaveLength(2); // header row + empty state row
            expect(screen.getAllByRole("columnheader")).toHaveLength(3); // player, bet_amount, win headers
            expect(screen.getByRole("cell")).toBeInTheDocument(); // empty message cell
        });
    });

    describe("forwardRef", () => {
        it("should forward ref correctly", () => {
            // Arrange
            const ref = React.createRef<HTMLDivElement>();
            const mockData = [
                {
                    playerName: "TestPlayer",
                    betAmount: "100.00",
                    win: "50.00",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: mockData,
            }));

            // Act
            render(<PlayerResultBoardTable ref={ref} />);

            // Assert
            expect(ref.current).toBeInstanceOf(HTMLDivElement);
            expect(ref.current).toHaveClass("h-[450px]");
        });

        it("should have correct displayName", () => {
            // Assert
            expect(PlayerResultBoardTable.displayName).toBe("PlayerResultBoardTable");
        });
    });

    describe("table height classes", () => {
        it("should apply correct height class for game ID 148 without statistics", () => {
            // Arrange - mock environment variable
            const originalEnv = process.env;
            process.env.NEXT_PUBLIC_DEFAULT_GAME_ID = "148";

            mockUseStatisticStore.mockReturnValue({
                isShowStatistic: false,
            });

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: [],
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert - find the main container with height classes
            const tableContainer = document.querySelector('[class*="h-[450px]"]');
            expect(tableContainer).toHaveClass("md:h-[560px]");

            // Restore environment
            process.env = originalEnv;
        });

        it("should apply correct height class for game ID 148 with statistics", () => {
            // Arrange - mock environment variable
            const originalEnv = process.env;
            process.env.NEXT_PUBLIC_DEFAULT_GAME_ID = "148";

            mockUseStatisticStore.mockReturnValue({
                isShowStatistic: true,
            });

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: [],
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert - find the main container with height classes
            const tableContainer = document.querySelector('[class*="h-[450px]"]');
            expect(tableContainer).toHaveClass("md:h-[700px]");

            // Restore environment
            process.env = originalEnv;
        });

        it("should apply correct height class for game ID 150 without statistics", () => {
            // Arrange - mock environment variable
            const originalEnv = process.env;
            process.env.NEXT_PUBLIC_DEFAULT_GAME_ID = "150";

            mockUseStatisticStore.mockReturnValue({
                isShowStatistic: false,
            });

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: [],
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert - find the main container with height classes
            const tableContainer = document.querySelector('[class*="h-[450px]"]');
            expect(tableContainer).toHaveClass("md:h-[540px]");

            // Restore environment
            process.env = originalEnv;
        });

        it("should apply correct height class for game ID 150 with statistics", () => {
            // Arrange - mock environment variable
            const originalEnv = process.env;
            process.env.NEXT_PUBLIC_DEFAULT_GAME_ID = "150";

            mockUseStatisticStore.mockReturnValue({
                isShowStatistic: true,
            });

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: [],
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert - find the main container with height classes
            const tableContainer = document.querySelector('[class*="h-[450px]"]');
            expect(tableContainer).toHaveClass("md:h-[656px]");

            // Restore environment
            process.env = originalEnv;
        });

        it("should apply default height class for unknown game ID", () => {
            // Arrange - mock environment variable
            const originalEnv = process.env;
            process.env.NEXT_PUBLIC_DEFAULT_GAME_ID = "999";

            mockUseStatisticStore.mockReturnValue({
                isShowStatistic: false,
            });

            mockUsePlayerResultBoard.mockReturnValue(createMockPlayerResultBoardReturn({
                tableData: [],
            }));

            // Act
            render(<PlayerResultBoardTable />);

            // Assert - find the main container with height classes
            const tableContainer = document.querySelector('[class*="h-[450px]"]');
            expect(tableContainer).toHaveClass("md:h-[540px]");

            // Restore environment
            process.env = originalEnv;
        });
    });
});
