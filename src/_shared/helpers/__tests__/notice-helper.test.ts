import { GetLocalizedErrorMessage, broadcastNotice, createNoticeFromErrorCode } from "../notice-helper";
import { useNoticeStore } from "../../stores/notice-store/notice-store";
import { NoticeModel } from "../../../components/game-base/type";

// Mock the notice store
jest.mock("../../stores/notice-store/notice-store", () => ({
    useNoticeStore: {
        getState: jest.fn(),
    },
}));

describe("NoticeHelper", () => {
    const mockGetState = useNoticeStore.getState as jest.MockedFunction<typeof useNoticeStore.getState>;
    const mockShowNotice = jest.fn();
    const mockClearNotice = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetState.mockReturnValue({
            showNotice: mockShowNotice,
            clearNotice: mockClearNotice,
        } as any);
    });

    describe("GetLocalizedErrorMessage", () => {
        it("should return error message for valid error code", () => {
            // Arrange
            const errorCode = "SB1907"; // not_enough_money

            // Act
            const result = GetLocalizedErrorMessage(errorCode);

            // Assert
            expect(result).toBe("Common.not_enough_money");
        });

        it("should return place bet failed message for invalid error code with isPlaceBet true", () => {
            // Arrange
            const errorCode = "INVALID_CODE";
            const isPlaceBet = true;

            // Act
            const result = GetLocalizedErrorMessage(errorCode, isPlaceBet);

            // Assert
            expect(result).toBe("Common.message_placebet_failed");
        });

        it("should return error occurred message for invalid error code with isPlaceBet false", () => {
            // Arrange
            const errorCode = "INVALID_CODE";
            const isPlaceBet = false;

            // Act
            const result = GetLocalizedErrorMessage(errorCode, isPlaceBet);

            // Assert
            expect(result).toBe("Common.message_error_occurred");
        });

        it("should return error occurred message for invalid error code with isPlaceBet undefined", () => {
            // Arrange
            const errorCode = "INVALID_CODE";

            // Act
            const result = GetLocalizedErrorMessage(errorCode);

            // Assert
            expect(result).toBe("Common.message_error_occurred");
        });

        it("should handle empty error code", () => {
            // Arrange
            const errorCode = "";

            // Act
            const result = GetLocalizedErrorMessage(errorCode);

            // Assert
            expect(result).toBe("Common.message_error_occurred");
        });

        it("should handle undefined error code", () => {
            // Arrange
            const errorCode = undefined as any;

            // Act
            const result = GetLocalizedErrorMessage(errorCode);

            // Assert
            expect(result).toBe("Common.message_error_occurred");
        });
    });

    describe("broadcastNotice", () => {
        it("should call showNotice when notice is provided", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test message",
                duration: 3,
                isWarning: false,
            };

            // Act
            broadcastNotice(mockNotice);

            // Assert
            expect(mockShowNotice).toHaveBeenCalledWith(mockNotice);
            expect(mockClearNotice).not.toHaveBeenCalled();
        });

        it("should call clearNotice when notice is null", () => {
            // Act
            broadcastNotice(null);

            // Assert
            expect(mockClearNotice).toHaveBeenCalled();
            expect(mockShowNotice).not.toHaveBeenCalled();
        });

        it("should call clearNotice when notice is undefined", () => {
            // Act
            broadcastNotice(undefined as any);

            // Assert
            expect(mockClearNotice).toHaveBeenCalled();
            expect(mockShowNotice).not.toHaveBeenCalled();
        });

        it("should handle notice with minimal properties", () => {
            // Arrange
            const minimalNotice: NoticeModel = {
                message: "minimal message",
            };

            // Act
            broadcastNotice(minimalNotice);

            // Assert
            expect(mockShowNotice).toHaveBeenCalledWith(minimalNotice);
        });

        it("should handle notice with all properties", () => {
            // Arrange
            const fullNotice: NoticeModel = {
                message: "full message",
                duration: 5,
                isWarning: true,
                gameName: "Test Game",
                roundId: 123,
                minBet: 10,
                maxBet: 100,
                errorCode: "TEST001",
                betChoice1: "choice1",
                betChoice2: "choice2",
                onClose: jest.fn(),
                hedgeBetGroup: ["choice1", "choice2"],
                adjustBetNoticePosition: true,
            };

            // Act
            broadcastNotice(fullNotice);

            // Assert
            expect(mockShowNotice).toHaveBeenCalledWith(fullNotice);
        });
    });

    describe("createNoticeFromErrorCode", () => {
        it("should create notice with basic properties", () => {
            // Arrange
            const errorCode = "SB1907";
            const gameName = "Test Game";
            const roundId = 123;
            const minBet = 10;
            const maxBet = 100;

            // Act
            const result = createNoticeFromErrorCode(errorCode, gameName, roundId, minBet, maxBet);

            // Assert
            expect(result).toEqual({
                gameName,
                roundId,
                message: "Common.not_enough_money",
                duration: 3,
                minBet,
                maxBet,
                errorCode,
                isWarning: false,
                onClose: undefined,
                hedgeBetGroup: undefined,
                adjustBetNoticePosition: false,
            });
        });

        it("should create notice with custom duration", () => {
            // Arrange
            const errorCode = "SB1907";
            const duration = 10;

            // Act
            const result = createNoticeFromErrorCode(errorCode, "", undefined, undefined, undefined, undefined, duration);

            // Assert
            expect(result.duration).toBe(duration);
        });

        it("should create notice with warning flag", () => {
            // Arrange
            const errorCode = "SB1907";
            const isWarning = true;

            // Act
            const result = createNoticeFromErrorCode(errorCode, "", undefined, undefined, undefined, undefined, 3, isWarning);

            // Assert
            expect(result.isWarning).toBe(isWarning);
        });

        it("should create notice with onClose callback", () => {
            // Arrange
            const errorCode = "SB1907";
            const onClose = jest.fn();

            // Act
            const result = createNoticeFromErrorCode(errorCode, "", undefined, undefined, undefined, onClose);

            // Assert
            expect(result.onClose).toBe(onClose);
        });

        it("should create notice with hedge bet group", () => {
            // Arrange
            const errorCode = "SB1907";
            const hedgeBetGroup = ["choice1", "choice2"];

            // Act
            const result = createNoticeFromErrorCode(errorCode, "", undefined, undefined, undefined, undefined, 3, false, hedgeBetGroup);

            // Assert
            expect(result.hedgeBetGroup).toBe(hedgeBetGroup);
        });

        it("should create notice with adjust bet notice position", () => {
            // Arrange
            const errorCode = "SB1907";
            const adjustBetNoticePosition = true;

            // Act
            const result = createNoticeFromErrorCode(errorCode, "", undefined, undefined, undefined, undefined, 3, false, undefined, adjustBetNoticePosition);

            // Assert
            expect(result.adjustBetNoticePosition).toBe(adjustBetNoticePosition);
        });

        it("should handle undefined parameters", () => {
            // Arrange
            const errorCode = "SB1907";

            // Act
            const result = createNoticeFromErrorCode(errorCode);

            // Assert
            expect(result).toEqual({
                gameName: undefined,
                roundId: undefined,
                message: "Common.not_enough_money",
                duration: 3,
                minBet: undefined,
                maxBet: undefined,
                errorCode,
                isWarning: false,
                onClose: undefined,
                hedgeBetGroup: undefined,
                adjustBetNoticePosition: false,
            });
        });

        it("should handle empty string parameters", () => {
            // Arrange
            const errorCode = "SB1907";
            const gameName = "";
            const roundId = 0;
            const minBet = 0;
            const maxBet = 0;

            // Act
            const result = createNoticeFromErrorCode(errorCode, gameName, roundId, minBet, maxBet);

            // Assert
            expect(result).toEqual({
                gameName,
                roundId,
                message: "Common.not_enough_money",
                duration: 3,
                minBet,
                maxBet,
                errorCode,
                isWarning: false,
                onClose: undefined,
                hedgeBetGroup: undefined,
                adjustBetNoticePosition: false,
            });
        });

        it("should handle invalid error code", () => {
            // Arrange
            const errorCode = "INVALID_CODE";

            // Act
            const result = createNoticeFromErrorCode(errorCode);

            // Assert
            expect(result.message).toBe("Common.message_error_occurred");
        });

        it("should handle zero duration", () => {
            // Arrange
            const errorCode = "SB1907";
            const duration = 0;

            // Act
            const result = createNoticeFromErrorCode(errorCode, "", undefined, undefined, undefined, undefined, duration);

            // Assert
            expect(result.duration).toBe(duration);
        });

        it("should handle negative duration", () => {
            // Arrange
            const errorCode = "SB1907";
            const duration = -1;

            // Act
            const result = createNoticeFromErrorCode(errorCode, "", undefined, undefined, undefined, undefined, duration);

            // Assert
            expect(result.duration).toBe(duration);
        });
    });

    describe("Integration Tests", () => {
        it("should work together: createNoticeFromErrorCode and broadcastNotice", () => {
            // Arrange
            const errorCode = "SB1907";
            const gameName = "Test Game";

            // Act
            const notice = createNoticeFromErrorCode(errorCode, gameName);
            broadcastNotice(notice);

            // Assert
            expect(mockShowNotice).toHaveBeenCalledWith(notice);
            expect(notice.message).toBe("Common.not_enough_money");
            expect(notice.gameName).toBe(gameName);
        });

        it("should handle complete workflow: error code to displayed notice", () => {
            // Arrange
            const errorCode = "SB1907";
            const gameName = "Test Game";
            const roundId = 123;
            const minBet = 10;
            const maxBet = 100;
            const onClose = jest.fn();

            // Act
            const notice = createNoticeFromErrorCode(errorCode, gameName, roundId, minBet, maxBet, onClose, 5, true);
            broadcastNotice(notice);

            // Assert
            expect(mockShowNotice).toHaveBeenCalledWith({
                gameName,
                roundId,
                message: "Common.not_enough_money",
                duration: 5,
                minBet,
                maxBet,
                errorCode,
                isWarning: true,
                onClose,
                hedgeBetGroup: undefined,
                adjustBetNoticePosition: false,
            });
        });
    });
});
