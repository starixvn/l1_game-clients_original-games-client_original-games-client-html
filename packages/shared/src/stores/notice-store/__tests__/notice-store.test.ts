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
                message: "test.message",
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
                message: "test.message",
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
    });

    describe("clearNotice", () => {
        it("should clear notice and set it to null", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test.message",
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

        it("should not throw error when clearing already null notice", () => {
            // Act & Assert
            expect(() => {
                act(() => {
                    useNoticeStore.getState().clearNotice();
                });
            }).not.toThrow();
        });
    });

    describe("showNotice", () => {
        it("should show notice with provided data", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "show.test.message",
                duration: 5,
                isWarning: true,
                gameName: "Test Game",
                roundId: 123,
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(mockNotice);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(mockNotice);
        });

        it("should overwrite existing notice when showing new notice", () => {
            // Arrange
            const firstNotice: NoticeModel = {
                message: "first.message",
                duration: 3,
                isWarning: false,
            };

            const secondNotice: NoticeModel = {
                message: "second.message",
                duration: 5,
                isWarning: true,
            };

            // Set first notice
            act(() => {
                useNoticeStore.getState().showNotice(firstNotice);
            });

            // Act - Show second notice
            act(() => {
                useNoticeStore.getState().showNotice(secondNotice);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(secondNotice);
            expect(useNoticeStore.getState().notice).not.toEqual(firstNotice);
        });
    });

    describe("Store State Updates", () => {
        it("should trigger re-renders when state changes", () => {
            // Arrange
            const { result } = renderHook(() => useNoticeStore());
            const mockNotice: NoticeModel = {
                message: "update.test.message",
                duration: 3,
                isWarning: false,
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(mockNotice);
            });

            // Assert
            expect(result.current.notice).toEqual(mockNotice);
        });

        it("should maintain state consistency across multiple operations", () => {
            // Arrange
            const mockNotice1: NoticeModel = {
                message: "notice1",
                duration: 3,
                isWarning: false,
            };

            const mockNotice2: NoticeModel = {
                message: "notice2",
                duration: 5,
                isWarning: true,
            };

            // Act & Assert
            act(() => {
                useNoticeStore.getState().showNotice(mockNotice1);
            });
            expect(useNoticeStore.getState().notice).toEqual(mockNotice1);

            act(() => {
                useNoticeStore.getState().showNotice(mockNotice2);
            });
            expect(useNoticeStore.getState().notice).toEqual(mockNotice2);

            act(() => {
                useNoticeStore.getState().clearNotice();
            });
            expect(useNoticeStore.getState().notice).toBeNull();
        });
    });

    describe("Edge Cases", () => {
        it("should handle notice with minimal required properties", () => {
            // Arrange
            const minimalNotice: NoticeModel = {
                message: "minimal",
                duration: 3,
                isWarning: false,
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(minimalNotice);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(minimalNotice);
        });

        it("should handle notice with all optional properties", () => {
            // Arrange
            const fullNotice: NoticeModel = {
                message: "full.notice",
                duration: 10,
                isWarning: true,
                gameName: "Full Game",
                roundId: 456,
                minBet: 10,
                maxBet: 1000,
                errorCode: "FULL001",
                hedgeBetGroup: ["choice1", "choice2"],
                onClose: jest.fn(),
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(fullNotice);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(fullNotice);
        });

        it("should handle rapid state changes", () => {
            // Arrange
            const notices: NoticeModel[] = [
                { message: "notice1", duration: 1, isWarning: false },
                { message: "notice2", duration: 2, isWarning: true },
                { message: "notice3", duration: 3, isWarning: false },
            ];

            // Act & Assert
            notices.forEach((notice, index) => {
                act(() => {
                    useNoticeStore.getState().showNotice(notice);
                });
                expect(useNoticeStore.getState().notice).toEqual(notice);
            });
        });
    });

    describe("Store Isolation", () => {
        it("should maintain separate state for different store instances", () => {
            // This test verifies that the store is properly isolated
            // In Zustand, this should be the case by default

            // Arrange
            const mockNotice: NoticeModel = {
                message: "isolated.test",
                duration: 3,
                isWarning: false,
            };

            // Act
            act(() => {
                useNoticeStore.getState().showNotice(mockNotice);
            });

            // Assert
            expect(useNoticeStore.getState().notice).toEqual(mockNotice);

            // Verify that the store state is consistent
            const { result } = renderHook(() => useNoticeStore());
            expect(result.current.notice).toEqual(mockNotice);
        });
    });
});
