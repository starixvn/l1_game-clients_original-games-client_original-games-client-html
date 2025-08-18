import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NoticeDialog } from "../index";
import { useNoticeStore } from "../../../../_shared/stores/notice-store/notice-store";
import { NoticeModel } from "../../../../game-base/type";

// Mock dependencies
jest.mock("../../../../_shared/react-contexts", () => ({
    useGameContext: () => ({
        tolgeeNamespace: "test-namespace",
    }),
}));

jest.mock("../../../../_shared/react-hooks", () => ({
    useTranslator: () => ({
        t: (key: string, params?: any) => key,
    }),
    useClickSound: () => jest.fn(),
}));

jest.mock("../../../../_shared/helpers", () => ({
    createOptionForHedgeBetGroup: jest.fn(() => ({})),
    getExtendMessageByErrorCode: jest.fn(() => ""),
    numberWithCommas: jest.fn((num) => num.toString()),
}));

jest.mock("../../../../_shared/helpers/message-transmitter/global-transmitter", () => ({
    GlobalTransmitterEvent: {
        NOTICE: "notice",
        CLOSE_DIALOG: "closeDialog",
    },
    registerGlobalMessageEvent: jest.fn(() => "handler-id"),
    unsubscribeGlobalMessageEvent: jest.fn(),
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
            jest.useFakeTimers();
            const mockNotice: NoticeModel = {
                message: "test.message",
                duration: 2,
                isWarning: false,
            };

            useNoticeStore.getState().showNotice(mockNotice);
            render(<NoticeDialog />);

            // Act
            jest.advanceTimersByTime(2000);

            // Assert
            await waitFor(() => {
                expect(useNoticeStore.getState().notice).toBeNull();
            });

            jest.useRealTimers();
        });
    });

    describe("Edge Cases", () => {
        it("should handle notice with null values", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test.message",
                duration: undefined,
                isWarning: undefined,
                gameName: undefined,
                roundId: undefined,
                minBet: undefined,
                maxBet: undefined,
                errorCode: undefined,
            };

            useNoticeStore.getState().showNotice(mockNotice);

            // Act
            render(<NoticeDialog />);

            // Assert
            expect(screen.getByText("test.message")).toBeInTheDocument();
        });

        it("should handle notice with empty string values", () => {
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

        it("should handle notice with very long message", () => {
            // Arrange
            const longMessage = "a".repeat(1000);
            const mockNotice: NoticeModel = {
                message: longMessage,
                duration: 3,
                isWarning: false,
            };

            useNoticeStore.getState().showNotice(mockNotice);

            // Act
            render(<NoticeDialog />);

            // Assert
            expect(screen.getByText(longMessage)).toBeInTheDocument();
        });

        it("should handle notice with zero duration", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test.message",
                duration: 0,
                isWarning: false,
            };

            useNoticeStore.getState().showNotice(mockNotice);

            // Act
            render(<NoticeDialog />);

            // Assert
            expect(screen.getByText("test.message")).toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should handle notice with missing required fields", () => {
            // Arrange
            const mockNotice = {
                message: "test.message",
                // Missing other required fields
            } as NoticeModel;

            useNoticeStore.getState().showNotice(mockNotice);

            // Act
            render(<NoticeDialog />);

            // Assert
            expect(screen.getByText("test.message")).toBeInTheDocument();
        });

        it("should handle rapid notice changes", async () => {
            // Arrange
            const notice1: NoticeModel = {
                message: "first notice",
                duration: 1,
                isWarning: false,
            };

            const notice2: NoticeModel = {
                message: "second notice",
                duration: 1,
                isWarning: true,
            };

            useNoticeStore.getState().showNotice(notice1);
            const { rerender } = render(<NoticeDialog />);

            // Act
            useNoticeStore.getState().showNotice(notice2);
            rerender(<NoticeDialog />);

            // Assert
            expect(screen.getByText("second notice")).toBeInTheDocument();
        });
    });

    describe("Integration with Global Transmitter", () => {
        it("should register global message event on mount", () => {
            // Arrange
            const { registerGlobalMessageEvent } = require("../../../../_shared/helpers/message-transmitter/global-transmitter");

            // Act
            render(<NoticeDialog />);

            // Assert
            expect(registerGlobalMessageEvent).toHaveBeenCalledWith("notice", expect.any(Function));
        });

        it("should unregister global message event on unmount", () => {
            // Arrange
            const { unsubscribeGlobalMessageEvent } = require("../../../../_shared/helpers/message-transmitter/global-transmitter");
            const { unmount } = render(<NoticeDialog />);

            // Act
            unmount();

            // Assert
            expect(unsubscribeGlobalMessageEvent).toHaveBeenCalledWith("handler-id");
        });

        it("should update store when global notice event is received", () => {
            // Arrange
            const { registerGlobalMessageEvent } = require("../../../../_shared/helpers/message-transmitter/global-transmitter");
            const mockNotice: NoticeModel = {
                message: "global notice",
                duration: 3,
                isWarning: false,
            };

            render(<NoticeDialog />);

            // Act
            const noticeHandler = registerGlobalMessageEvent.mock.calls[0][1];
            noticeHandler({ notice: mockNotice });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(mockNotice);
        });

        it("should clear store when global notice event with null is received", () => {
            // Arrange
            const { registerGlobalMessageEvent } = require("../../../../_shared/helpers/message-transmitter/global-transmitter");
            const mockNotice: NoticeModel = {
                message: "test notice",
                duration: 3,
                isWarning: false,
            };

            useNoticeStore.getState().showNotice(mockNotice);
            render(<NoticeDialog />);

            // Act
            const noticeHandler = registerGlobalMessageEvent.mock.calls[0][1];
            noticeHandler({ notice: null });

            // Assert
            expect(useNoticeStore.getState().notice).toBeNull();
        });
    });

    describe("Notice Store Integration", () => {
        it("should use notice from store state", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "store notice",
                duration: 3,
                isWarning: false,
            };

            // Act
            useNoticeStore.getState().showNotice(mockNotice);
            render(<NoticeDialog />);

            // Assert
            expect(screen.getByText("store notice")).toBeInTheDocument();
        });

        it("should clear notice when clearNotice is called", async () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test notice",
                duration: 3,
                isWarning: false,
            };

            useNoticeStore.getState().showNotice(mockNotice);
            render(<NoticeDialog />);

            // Act
            useNoticeStore.getState().clearNotice();

            // Assert
            await waitFor(() => {
                expect(screen.queryByText("test notice")).not.toBeInTheDocument();
            });
        });

        it("should update when store state changes", async () => {
            // Arrange
            const { rerender } = render(<NoticeDialog />);

            // Act
            const mockNotice: NoticeModel = {
                message: "updated notice",
                duration: 3,
                isWarning: false,
            };

            useNoticeStore.getState().showNotice(mockNotice);
            rerender(<NoticeDialog />);

            // Assert
            expect(screen.getByText("updated notice")).toBeInTheDocument();
        });
    });
});
