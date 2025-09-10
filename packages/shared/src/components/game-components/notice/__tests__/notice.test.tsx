import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NoticeDialog } from "../index";
import { useNoticeStore } from "../../../../_shared/stores/notice-store/notice-store";
import { NoticeModel } from "../../../../components/game-base/type";

// Mock dependencies
jest.mock("../../../../_shared/react-contexts", () => ({
    useGameContext: () => ({
        tolgeeNamespace: "test-namespace",
    }),
}));

jest.mock("../../../../_shared/react-hooks", () => ({
    useTranslator: () => ({
        t: (key: string, params?: any) => ({
            replaceTolgeeFormat: () => key,
        }),
    }),
    useClickSound: () => jest.fn(),
}));

jest.mock("../../../../_shared/helpers", () => ({
    createOptionForHedgeBetGroup: jest.fn(() => ({})),
    getExtendMessageByErrorCode: jest.fn(() => ""),
    numberWithCommas: jest.fn((num) => num.toString()),
}));

// Mock the global events store - fix the mock to properly simulate Zustand store
jest.mock("../../../../_shared/stores/global-events-store/global-events-store", () => ({
    useGlobalEventsStore: jest.fn((selector) => {
        const mockState = {
            closeDialog: false,
            setCloseDialog: jest.fn(),
        };
        return selector ? selector(mockState) : mockState;
    }),
}));

describe("NoticeDialog", () => {
    beforeEach(() => {
        // Clear the notice store before each test
        useNoticeStore.getState().clearNotice();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Happy Path", () => {
        it("should render notice dialog when notice is present in store", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test.message",
                duration: 3,
                isWarning: false,
                gameName: "Test Game",
                roundId: 123,
                minBet: 10,
                maxBet: 100,
                errorCode: "TEST001",
            };

            useNoticeStore.getState().showNotice(mockNotice);

            // Act
            render(<NoticeDialog />);

            // Assert
            expect(screen.getByTestId("close-btn")).toBeInTheDocument();
            expect(screen.getByText("test.message")).toBeInTheDocument();
        });

        it("should not render anything when no notice is present", () => {
            // Arrange
            useNoticeStore.getState().clearNotice();

            // Act
            const { container } = render(<NoticeDialog />);

            // Assert
            expect(container.firstChild).toBeNull();
        });

        it("should close notice when close button is clicked", async () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test.message",
                duration: 3,
                isWarning: false,
            };

            useNoticeStore.getState().showNotice(mockNotice);
            render(<NoticeDialog />);

            // Act
            fireEvent.click(screen.getByTestId("close-btn"));

            // Assert
            await waitFor(() => {
                expect(useNoticeStore.getState().notice).toBeNull();
            });
        });

        it("should auto-close notice after duration expires", async () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test.message",
                duration: 0.1, // Very short duration for testing
                isWarning: false,
            };

            useNoticeStore.getState().showNotice(mockNotice);
            render(<NoticeDialog />);

            // Assert
            await waitFor(() => {
                expect(useNoticeStore.getState().notice).toBeNull();
            }, { timeout: 200 });
        });
    });

    describe("Edge Cases", () => {
        it("should handle notice with minimal properties", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "minimal.message",
                duration: 3,
                isWarning: false,
            };

            useNoticeStore.getState().showNotice(mockNotice);

            // Act
            render(<NoticeDialog />);

            // Assert
            expect(screen.getByText("minimal.message")).toBeInTheDocument();
        });

        it("should handle warning notices", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "warning.message",
                duration: 3,
                isWarning: true,
            };

            useNoticeStore.getState().showNotice(mockNotice);

            // Act
            render(<NoticeDialog />);

            // Assert
            expect(screen.getByText("warning.message")).toBeInTheDocument();
            // Check for warning styling (you might need to adjust this based on your CSS classes)
        });

        it("should handle notices with hedge bet options", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "hedge.message",
                duration: 3,
                isWarning: false,
                hedgeBetGroup: ["choice1", "choice2"],
            };

            useNoticeStore.getState().showNotice(mockNotice);

            // Act
            render(<NoticeDialog />);

            // Assert
            expect(screen.getByText("hedge.message")).toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should handle missing message gracefully", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "",
                duration: 3,
                isWarning: false,
            };

            useNoticeStore.getState().showNotice(mockNotice);

            // Act
            render(<NoticeDialog />);

            // Assert
            expect(screen.getByTestId("close-btn")).toBeInTheDocument();
        });

        it("should handle zero duration", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "zero.duration",
                duration: 0,
                isWarning: false,
            };

            useNoticeStore.getState().showNotice(mockNotice);

            // Act
            render(<NoticeDialog />);

            // Assert
            expect(screen.getByText("zero.duration")).toBeInTheDocument();
        });
    });
});
