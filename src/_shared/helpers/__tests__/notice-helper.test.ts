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
            notice: null,
            setNotice: jest.fn(),
        } as any);
    });

    describe("GetLocalizedErrorMessage", () => {
        it("should return error message for known error code", () => {
            // Arrange
            const errorCode = "SB1907";

            // Act
            const result = GetLocalizedErrorMessage(errorCode);

            // Assert
            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });

        it("should return default error message for unknown error code", () => {
            // Arrange
            const errorCode = "UNKNOWN_ERROR_CODE";

            // Act
            const result = GetLocalizedErrorMessage(errorCode);

            // Assert
            expect(result).toBe("Common.message_error_occurred");
        });

        it("should return place bet failed message when isPlaceBet is true", () => {
            // Arrange
            const errorCode = "UNKNOWN_ERROR_CODE";

            // Act
            const result = GetLocalizedErrorMessage(errorCode, true);

            // Assert
            expect(result).toBe("Common.message_placebet_failed");
        });

        it("should return default error message when isPlaceBet is false", () => {
            // Arrange
            const errorCode = "UNKNOWN_ERROR_CODE";

            // Act
            const result = GetLocalizedErrorMessage(errorCode, false);

            // Assert
            expect(result).toBe("Common.message_error_occurred");
        });
    });

    describe("broadcastNotice", () => {
        it("should call showNotice when notice is provided", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "test.message",
                duration: 3,
                isWarning: false,
            };

            // Act
            broadcastNotice(mockNotice);

            // Assert
            expect(mockShowNotice).toHaveBeenCalledWith(mockNotice);
        });

        it("should call clearNotice when notice is null", () => {
            // Act
            broadcastNotice(null);

            // Assert
            expect(mockClearNotice).toHaveBeenCalled();
        });

        it("should call clearNotice when notice is undefined", () => {
            // Act
            broadcastNotice(undefined as any);

            // Assert
            expect(mockClearNotice).toHaveBeenCalled();
        });

        it("should handle notice with all properties", () => {
            // Arrange
            const mockNotice: NoticeModel = {
                message: "full.notice",
                duration: 10,
                isWarning: true,
                gameName: "Test Game",
                roundId: 123,
                minBet: 10,
                maxBet: 1000,
                errorCode: "TEST001",
                hedgeBetGroup: ["choice1", "choice2"],
                onClose: jest.fn(),
            };

            // Act
            broadcastNotice(mockNotice);

            // Assert
            expect(mockShowNotice).toHaveBeenCalledWith(mockNotice);
        });
    });

    describe("createNoticeFromErrorCode", () => {
        it("should create notice with basic properties", () => {
            // Arrange
            const errorCode = "TEST001";
            const gameName = "Test Game";
            const roundId = 123;

            // Act
            const result = createNoticeFromErrorCode(errorCode, gameName, roundId);

            // Assert
            expect(result).toEqual({
                message: expect.any(String),
                duration: 3,
                isWarning: false,
                gameName: "Test Game",
                roundId: 123,
                errorCode: "TEST001",
                minBet: undefined,
                maxBet: undefined,
                onClose: undefined,
                hedgeBetGroup: undefined,
                adjustBetNoticePosition: false,
            });
        });

        it("should create notice with custom duration", () => {
            // Arrange
            const errorCode = "TEST002";
            const gameName = "Test Game";
            const roundId = 456;
            const duration = 5;

            // Act
            const result = createNoticeFromErrorCode(errorCode, gameName, roundId, undefined, undefined, undefined, duration);

            // Assert
            expect(result.duration).toBe(5);
        });

        it("should create notice with bet limits", () => {
            // Arrange
            const errorCode = "TEST003";
            const gameName = "Test Game";
            const roundId = 789;
            const minBet = 10;
            const maxBet = 1000;

            // Act
            const result = createNoticeFromErrorCode(errorCode, gameName, roundId, minBet, maxBet);

            // Assert
            expect(result.minBet).toBe(10);
            expect(result.maxBet).toBe(1000);
        });

        it("should create notice with onClose callback", () => {
            // Arrange
            const errorCode = "TEST004";
            const gameName = "Test Game";
            const roundId = 101;
            const onClose = jest.fn();

            // Act
            const result = createNoticeFromErrorCode(errorCode, gameName, roundId, undefined, undefined, onClose);

            // Assert
            expect(result.onClose).toBe(onClose);
        });

        it("should create notice with hedge bet group", () => {
            // Arrange
            const errorCode = "TEST005";
            const gameName = "Test Game";
            const roundId = 202;
            const hedgeBetGroup = ["player", "banker"];

            // Act
            const result = createNoticeFromErrorCode(errorCode, gameName, roundId, undefined, undefined, undefined, 3, false, hedgeBetGroup);

            // Assert
            expect(result.hedgeBetGroup).toEqual(["player", "banker"]);
        });

        it("should create warning notice when isWarning is true", () => {
            // Arrange
            const errorCode = "TEST006";
            const gameName = "Test Game";
            const roundId = 303;

            // Act
            const result = createNoticeFromErrorCode(errorCode, gameName, roundId, undefined, undefined, undefined, 3, true);

            // Assert
            expect(result.isWarning).toBe(true);
        });

        it("should create error notice when isWarning is false", () => {
            // Arrange
            const errorCode = "TEST007";
            const gameName = "Test Game";
            const roundId = 404;

            // Act
            const result = createNoticeFromErrorCode(errorCode, gameName, roundId, undefined, undefined, undefined, 3, false);

            // Assert
            expect(result.isWarning).toBe(false);
        });

        it("should handle undefined parameters gracefully", () => {
            // Arrange
            const errorCode = "TEST008";

            // Act
            const result = createNoticeFromErrorCode(errorCode);

            // Assert
            expect(result).toEqual({
                message: expect.any(String),
                duration: 3,
                isWarning: false,
                gameName: undefined,
                roundId: undefined,
                errorCode: "TEST008",
                minBet: undefined,
                maxBet: undefined,
                onClose: undefined,
                hedgeBetGroup: undefined,
                adjustBetNoticePosition: false,
            });
        });

        it("should handle empty string parameters", () => {
            // Arrange
            const errorCode = "";
            const gameName = "";

            // Act
            const result = createNoticeFromErrorCode(errorCode, gameName);

            // Assert
            expect(result).toEqual({
                message: expect.any(String),
                duration: 3,
                isWarning: false,
                gameName: "",
                roundId: undefined,
                errorCode: "",
                minBet: undefined,
                maxBet: undefined,
                onClose: undefined,
                hedgeBetGroup: undefined,
                adjustBetNoticePosition: false,
            });
        });
    });

    describe("Integration Tests", () => {
        it("should work together with broadcastNotice and createNoticeFromErrorCode", () => {
            // Arrange
            const errorCode = "INTEGRATION_TEST";
            const gameName = "Integration Game";
            const roundId = 999;

            // Act
            const notice = createNoticeFromErrorCode(errorCode, gameName, roundId);
            broadcastNotice(notice);

            // Assert
            expect(mockShowNotice).toHaveBeenCalledWith(notice);
            expect(notice.errorCode).toBe("INTEGRATION_TEST");
            expect(notice.gameName).toBe("Integration Game");
            expect(notice.roundId).toBe(999);
        });

        it("should handle error message localization with notice creation", () => {
            // Arrange
            const errorCode = "LOCALIZATION_TEST";

            // Act
            const localizedMessage = GetLocalizedErrorMessage(errorCode);
            const notice = createNoticeFromErrorCode(errorCode, "Test Game", 123);
            broadcastNotice(notice);

            // Assert
            expect(mockShowNotice).toHaveBeenCalledWith(notice);
            expect(notice.errorCode).toBe("LOCALIZATION_TEST");
        });
    });
});
