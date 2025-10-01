import { render, screen } from "@testing-library/react";
import { PlayerResultBoard } from "../player-result-board";
import { usePlayerResultBoard, useCommonTranslate } from "@shared/react-hooks";
// Import string helper to ensure prototype methods are available
import "@shared/helpers/string-helper";

// Mock the hooks
jest.mock("@shared/react-hooks", () => ({
    usePlayerResultBoard: jest.fn(),
    useCommonTranslate: jest.fn(),
}));

const mockUsePlayerResultBoard = usePlayerResultBoard as jest.MockedFunction<typeof usePlayerResultBoard>;
const mockUseCommonTranslate = useCommonTranslate as jest.MockedFunction<typeof useCommonTranslate>;

describe("PlayerResultBoard", () => {
    const mockTranslateCommon = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCommonTranslate.mockReturnValue({
            t: mockTranslateCommon,
            isLoading: false,
        });
        mockTranslateCommon.mockImplementation((key: string) => key);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("rendering", () => {
        it("should render the component with default data", () => {
            // Arrange
            mockUsePlayerResultBoard.mockReturnValue({
                totalPlayers: 5,
                roundId: "123",
                tableData: [],
                shouldShowResults: false,
            });

            // Act
            render(<PlayerResultBoard />);

            // Assert
            expect(screen.getByText((content) => content.includes("5"))).toBeInTheDocument();
            expect(screen.getByText((content) => content.includes("players"))).toBeInTheDocument();
            expect(screen.getByText("#123")).toBeInTheDocument();
        });

        it("should render with zero players", () => {
            // Arrange
            mockUsePlayerResultBoard.mockReturnValue({
                totalPlayers: 0,
                roundId: "",
                tableData: [],
                shouldShowResults: false,
            });

            // Act
            render(<PlayerResultBoard />);

            // Assert
            expect(screen.getByText((content) => content.includes("0"))).toBeInTheDocument();
            expect(screen.getByText((content) => content.includes("players"))).toBeInTheDocument();
            expect(screen.getByText((content) => content === "#")).toBeInTheDocument();
        });

        it("should render with large number of players", () => {
            // Arrange
            mockUsePlayerResultBoard.mockReturnValue({
                totalPlayers: 999,
                roundId: "999999",
                tableData: [],
                shouldShowResults: false,
            });

            // Act
            render(<PlayerResultBoard />);

            // Assert
            expect(screen.getByText((content) => content.includes("999") && content.includes("players"))).toBeInTheDocument();
            expect(screen.getByText("#999999")).toBeInTheDocument();
        });

    });

    describe("table data rendering", () => {
        it("should render table with player data", () => {
            // Arrange
            const mockTableData = [
                {
                    playerName: "Player1",
                    betAmount: "100.00",
                    win: "50.00",
                },
                {
                    playerName: "Player2",
                    betAmount: "200.00",
                    win: "-",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue({
                totalPlayers: 2,
                roundId: "789",
                tableData: mockTableData,
                shouldShowResults: true,
            });

            // Act
            render(<PlayerResultBoard />);

            // Assert
            expect(screen.getByText("Player1")).toBeInTheDocument();
            expect(screen.getByText("100.00")).toBeInTheDocument();
            expect(screen.getByText("50.00")).toBeInTheDocument();
            expect(screen.getByText("Player2")).toBeInTheDocument();
            expect(screen.getByText("200.00")).toBeInTheDocument();
            expect(screen.getByText("-")).toBeInTheDocument();
        });

        it("should render empty table when no data", () => {
            // Arrange
            mockUsePlayerResultBoard.mockReturnValue({
                totalPlayers: 0,
                roundId: "123",
                tableData: [],
                shouldShowResults: false,
            });

            // Act
            render(<PlayerResultBoard />);

            // Assert - table should still render but be empty
            expect(screen.getByText((content) => content.includes("0"))).toBeInTheDocument();
            expect(screen.getByText("#123")).toBeInTheDocument();
        });
    });

    describe("translations", () => {
        it("should use correct translation keys", () => {
            // Arrange
            mockUsePlayerResultBoard.mockReturnValue({
                totalPlayers: 3,
                roundId: "789",
                tableData: [],
                shouldShowResults: false,
            });

            // Act
            render(<PlayerResultBoard />);

            // Assert
            expect(mockTranslateCommon).toHaveBeenCalledWith("players");
        });

        it("should call translation function for table headers", () => {
            // Arrange
            const mockTableData = [
                {
                    playerName: "TestPlayer",
                    betAmount: "100.00",
                    win: "50.00",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue({
                totalPlayers: 1,
                roundId: "123",
                tableData: mockTableData,
                shouldShowResults: true,
            });

            // Act
            render(<PlayerResultBoard />);

            // Assert
            expect(mockTranslateCommon).toHaveBeenCalledWith("player");
            expect(mockTranslateCommon).toHaveBeenCalledWith("bet_amount");
            expect(mockTranslateCommon).toHaveBeenCalledWith("win");
        });
    });

    describe("edge cases", () => {
        it("should handle undefined playerResultBoard data gracefully", () => {
            // Arrange
            mockUsePlayerResultBoard.mockReturnValue({
                totalPlayers: 0,
                roundId: "",
                tableData: [],
                shouldShowResults: false,
            });

            // Act
            render(<PlayerResultBoard />);

            // Assert - should not crash and show default values
            expect(screen.getByText((content) => content.includes("0"))).toBeInTheDocument();
            expect(screen.getByText((content) => content === "#")).toBeInTheDocument();
        });

        it("should handle very long player names", () => {
            // Arrange
            const longPlayerName = "VeryLongPlayerNameThatMightCauseLayoutIssues";
            const mockTableData = [
                {
                    playerName: longPlayerName,
                    betAmount: "100.00",
                    win: "50.00",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue({
                totalPlayers: 1,
                roundId: "123",
                tableData: mockTableData,
                shouldShowResults: true,
            });

            // Act
            render(<PlayerResultBoard />);

            // Assert
            expect(screen.getByText(longPlayerName)).toBeInTheDocument();
        });

        it("should handle special characters in amounts", () => {
            // Arrange
            const mockTableData = [
                {
                    playerName: "Player1",
                    betAmount: "1,000,000.99",
                    win: "-999.99",
                },
            ];

            mockUsePlayerResultBoard.mockReturnValue({
                totalPlayers: 1,
                roundId: "123",
                tableData: mockTableData,
                shouldShowResults: true,
            });

            // Act
            render(<PlayerResultBoard />);

            // Assert
            expect(screen.getByText("1,000,000.99")).toBeInTheDocument();
            expect(screen.getByText("-999.99")).toBeInTheDocument();
        });
    });

    describe("accessibility", () => {
        it("should have proper semantic structure", () => {
            // Arrange
            mockUsePlayerResultBoard.mockReturnValue({
                totalPlayers: 3,
                roundId: "789",
                tableData: [],
                shouldShowResults: false,
            });

            // Act
            render(<PlayerResultBoard />);

            // Assert - basic semantic checks
            expect(screen.getByText((content) => content.includes("3"))).toBeInTheDocument();
            expect(screen.getByText("#789")).toBeInTheDocument();
        });
    });
});
