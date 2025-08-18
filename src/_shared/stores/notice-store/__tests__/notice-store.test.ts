import { renderHook, act } from "@testing-library/react";
import { useNoticeStore } from "../notice-store";
import { NoticeModel } from "../../../../components/game-base/type";

describe("NoticeStore", () => {
    beforeEach(() => {
        // Clear the store before each test
        act(() => {
            useNoticeStore.getState().clearNotice();
        });
    });

    describe("Initial State", () => {
        it("should have null notice initially", () => {
            // Act
            const { result } = renderHook(() => useNoticeStore());

            // Assert
            expect(result.current.notice).toBeNull();
        });
    });

    describe("setNotice", () => {
        it("should set notice to the provided value", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test message",
                duration: 3,
                isWarning: false,
            };

            // Act
            act(() => {
                useNoticeStore.getState().setNotice(mockNotice);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(mockNotice);
        });

        it("should set notice to null when provided null", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test message",
                duration: 3,
                isWarning: false,
            };

            // Set initial notice
            act(() => {
                useNoticeStore.getState().setNotice(mockNotice);
            });

            // Act
            act(() => {
                useNoticeStore.getState().setNotice(null);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toBeNull();
        });

        it("should update notice when called multiple times", () => {
            // Arrange
            const notice1: NoticeModel = {
                message: "first message",
                duration: 3,
                isWarning: false,
            };

            const notice2: NoticeModel = {
                message: "second message",
                duration: 5,
                isWarning: true,
            };

            // Act
            act(() => {
                useNoticeStore.getState().setNotice(notice1);
            });

            act(() => {
                useNoticeStore.getState().setNotice(notice2);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(notice2);
        });
    });

    describe("clearNotice", () => {
        it("should clear notice to null", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test message",
                duration: 3,
                isWarning: false,
            };

            act(() => {
                useNoticeStore.getState().setNotice(mockNotice);
            });

            // Act
            act(() => {
                useNoticeStore.getState().clearNotice();
            });

            // Assert
            expect(useNoticeStore.getState().notice).toBeNull();
        });

        it("should do nothing when notice is already null", () => {
            // Act
            act(() => {
                useNoticeStore.getState().clearNotice();
            });

            // Assert
            expect(useNoticeStore.getState().notice).toBeNull();
        });
    });

    describe("showNotice", () => {
        it("should set notice to the provided value", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test message",
                duration: 3,
                isWarning: false,
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(mockNotice);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(mockNotice);
        });

        it("should update notice when called multiple times", () => {
            // Arrange
            const notice1: NoticeModel = {
                message: "first message",
                duration: 3,
                isWarning: false,
            };

            const notice2: NoticeModel = {
                message: "second message",
                duration: 5,
                isWarning: true,
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(notice1);
            });

            act(() => {
                useNoticeStore.getState().showNotice(notice2);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(notice2);
        });
    });

    describe("Edge Cases", () => {
        it("should handle notice with undefined values", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test message",
                duration: undefined,
                isWarning: undefined,
                gameName: undefined,
                roundId: undefined,
                minBet: undefined,
                maxBet: undefined,
                errorCode: undefined,
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(mockNotice);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(mockNotice);
        });

        it("should handle notice with empty string values", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "",
                duration: 3,
                isWarning: false,
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(mockNotice);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(mockNotice);
        });

        it("should handle notice with zero duration", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test message",
                duration: 0,
                isWarning: false,
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(mockNotice);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(mockNotice);
        });

        it("should handle notice with negative duration", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test message",
                duration: -1,
                isWarning: false,
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(mockNotice);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(mockNotice);
        });
    });

    describe("State Persistence", () => {
        it("should maintain state between multiple store accesses", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test message",
                duration: 3,
                isWarning: false,
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(mockNotice);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(mockNotice);
            expect(useNoticeStore.getState().notice).toEqual(mockNotice);
            expect(useNoticeStore.getState().notice).toEqual(mockNotice);
        });

        it("should maintain state when accessed from different components", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test message",
                duration: 3,
                isWarning: false,
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(mockNotice);
            });

            // Simulate accessing from different components
            const { result: result1 } = renderHook(() => useNoticeStore());
            const { result: result2 } = renderHook(() => useNoticeStore());

            // Assert
            expect(result1.current.notice).toEqual(mockNotice);
            expect(result2.current.notice).toEqual(mockNotice);
        });
    });

    describe("Action Methods", () => {
        it("should have setNotice method", () => {
            // Act
            const { result } = renderHook(() => useNoticeStore());

            // Assert
            expect(typeof result.current.setNotice).toBe("function");
        });

        it("should have clearNotice method", () => {
            // Act
            const { result } = renderHook(() => useNoticeStore());

            // Assert
            expect(typeof result.current.clearNotice).toBe("function");
        });

        it("should have showNotice method", () => {
            // Act
            const { result } = renderHook(() => useNoticeStore());

            // Assert
            expect(typeof result.current.showNotice).toBe("function");
        });
    });
});
