import { stub } from "jest-auto-stub";
import { Dispatch } from "react";
import { SystemContextModel } from "../../../../_shared/react-contexts";
import { GameStateContextModel } from "../../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { PlaceBetEventAction } from "../../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-action";
import { PlaceBetContextModel } from "../../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context-model";
import { GameConfigs, IUserStakeLevel, RoundState } from "../../type";
import { GameMessageHandler } from "../game-message-handler";
import { PlaceBetHandler, PlaceBetHandlerProps } from "./place-bet-handler";

jest.mock("../../../../_shared/react-contexts", () => ({
    loadURLContext: jest.fn(),
}));

describe("placeBet", () => {
    let placeBetHandler: PlaceBetHandler;
    let gameMessageHandler: GameMessageHandler;
    let gameStateContextModel: GameStateContextModel;
    let systemContextModel: SystemContextModel;
    let placeBetHandlerProps: PlaceBetHandlerProps;
    let gameConfigs: GameConfigs;
    let userStakeLevel: IUserStakeLevel;
    let placeBetContext: PlaceBetContextModel;
    let placeBetDispatch: Dispatch<PlaceBetEventAction>;

    const updatePlaceBetContext = (state) => {
        placeBetContext = stub<PlaceBetContextModel>(state);
        placeBetHandler.registerEvents(() => { }, placeBetContext);
    };

    beforeEach(() => {
        jest.clearAllMocks();

        systemContextModel = stub<SystemContextModel>();
        placeBetContext = stub<PlaceBetContextModel>();
        gameMessageHandler = stub<GameMessageHandler>();
        gameConfigs = stub<GameConfigs>();
        userStakeLevel = stub<IUserStakeLevel>();
        placeBetDispatch = jest.fn();

        placeBetHandlerProps = {
            gameName: "test",
            gameMessageHandler,
            translate: jest.fn(),
            playPlaceBetSound: jest.fn(),
            hedgeBetGroups: [["player", "banker"]],
            getPlayerBalance: jest.fn(),
            tolgeeNamespace: "test",
            gameId: 1,
            signOut: () => { },
        };

        placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
        placeBetHandler.setPlaceBetDispatch(placeBetDispatch);

        placeBetHandler.registerEvents(() => { }, placeBetContext);
    });

    afterEach(() => {
        placeBetHandler.unregisterEvents();
    });

    describe("isInPhasePreventBet", () => {
        beforeAll(() => {
            jest.mock("../../../../_shared/helpers/validate-bet-helper", () => ({
                isInPhasePreventBet: jest.fn(() => true),
                isBalanceUnavailable: jest.fn(() => false),
            }));
        });
        it("should return if in phase prevent bet", () => {
            // Arrange
            gameStateContextModel = stub<GameStateContextModel>({ roundState: RoundState.LockingBet });
            const handlePreventBetSpy = jest.spyOn(placeBetHandler, "handlePreventBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(handlePreventBetSpy).toHaveBeenCalled();
        });

        it("should return if in phase prevent bet - enabled QuickBet", () => {
            // Arrange
            gameStateContextModel = stub<GameStateContextModel>({ roundState: RoundState.LockingBet });
            const handlePreventBetSpy = jest.spyOn(placeBetHandler, "handlePreventBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(handlePreventBetSpy).toHaveBeenCalled();
        });
    });

    xdescribe("handleProcessingBet method", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it("calls handleProcessingBet when isProcessingBet is true", () => {
            // Arrange
            gameStateContextModel = stub<GameStateContextModel>({ roundState: RoundState.InRound });
            updatePlaceBetContext({ isProcessingBet: true });
            const handleProcessingBetSpy = jest.spyOn(placeBetHandler, "handleProcessingBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(handleProcessingBetSpy).toHaveBeenCalled();
        });

        it("calls handleProcessingBet when isProcessingBet is true - enabled QuickBet", () => {
            // Arrange
            gameStateContextModel = stub<GameStateContextModel>({ roundState: RoundState.InRound });
            updatePlaceBetContext({ isProcessingBet: true });
            const handleProcessingBetSpy = jest.spyOn(placeBetHandler, "handleProcessingBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(handleProcessingBetSpy).toHaveBeenCalled();
        });

        it("does not call handleProcessingBet when isProcessingBet is false", () => {
            // Arrange

            gameStateContextModel = stub<GameStateContextModel>({ roundState: RoundState.InRound, gameConfigs });
            updatePlaceBetContext({ isProcessingBet: false });
            const handleProcessingBetSpy = jest.spyOn(placeBetHandler, "handleProcessingBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(handleProcessingBetSpy).not.toHaveBeenCalled();
        });
    });

    describe("isBalanceUnavailable function", () => {
        it("returns true when available balance is zero and message: not_enough_money", () => {
            // Arrange
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(0);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const gameStateContext = {
                roundState: RoundState.InRound,
                gameConfigs,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            updatePlaceBetContext({
                isProcessingBet: false,
                notConfirmOwnBets: {},
                ownBets: {},
            });
            placeBetHandler.setPlaceBetDispatch(placeBetDispatch);

            const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
            const notice = {
                gameName: "test",
                message: "Common.not_enough_money",
                duration: 2,
                errorCode: "SB1907",
                betChoice1: "",
                betChoice2: "",
                adjustBetNoticePosition: false
            };

            // Act
            placeBetHandler.placeBet("betChoice", 100, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(broadcastNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("returns true when available balance is zero and message: not_enough_money -  enabled QuickBet", () => {
            // Arrange
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(0);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const gameStateContext = {
                roundState: RoundState.InRound,
                gameConfigs,
                notConfirmOwnBets: {},
                ownBets: {},
            };
            updatePlaceBetContext({ isProcessingBet: false });
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
            const notice = {
                gameName: "test",
                message: "Common.not_enough_money",
                duration: 2,
                errorCode: "SB1907",
                betChoice1: "",
                betChoice2: "",
                adjustBetNoticePosition: false
            };

            // Act
            placeBetHandler.placeBet("betChoice", 100, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(broadcastNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("returns true when amount is greater than zero and available balance `subtract` total bet amount is zero and show message: not_enough_money", () => {
            // Arrange
            const availableBalance = 100;
            const amount = 100;

            gameConfigs = stub<GameConfigs>();
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(availableBalance);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);

            const gameStateContext = {
                roundState: RoundState.InRound,
                gameConfigs,
            };
            updatePlaceBetContext({
                isProcessingBet: false,
                notConfirmOwnBets: { bet1: 50, bet2: 50 },
                ownBets: { bet3: 20 },
            });
            placeBetHandler.setPlaceBetDispatch(placeBetDispatch);

            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
            const notice = {
                gameName: "test",
                message: "Common.not_enough_money",
                duration: 2,
                errorCode: "SB1907",
                betChoice1: "",
                betChoice2: "",
                adjustBetNoticePosition: false
            };

            // Act
            placeBetHandler.placeBet("betChoice", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(broadcastNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("returns true when amount is greater than zero and available balance `subtract` total bet amount is zero and show message: not_enough_money - enable QuickBet", () => {
            // Arrange
            const availableBalance = 0;
            const amount = 100;

            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(availableBalance);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);

            updatePlaceBetContext({
                isProcessingBet: false,
                notConfirmOwnBets: { bet1: 50, bet2: 30 },
                ownBets: { bet3: 20 },
            });

            gameStateContextModel = stub<GameStateContextModel>({
                roundState: RoundState.InRound,
            });
            const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
            const notice = {
                gameName: "test",
                message: "Common.not_enough_money",
                duration: 2,
                errorCode: "SB1907",
                betChoice1: "",
                betChoice2: "",
                adjustBetNoticePosition: false
            };

            // Act
            placeBetHandler.placeBet("betChoice", amount, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(broadcastNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("returns false when neither condition is true", () => {
            // Arrange
            const availableBalance = 100;
            const amount = 50;
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(availableBalance);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const gameStateContext = {
                roundState: RoundState.InRound,
                gameConfigs,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            updatePlaceBetContext({
                isProcessingBet: false,
                notConfirmOwnBets: { bet1: 10, bet2: 20 },
                ownBets: { bet3: 20 },
            });
            placeBetHandler.setPlaceBetDispatch(placeBetDispatch);

            const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");

            // Act
            placeBetHandler.placeBet("betChoice", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(broadcastNoticeSpy).not.toHaveBeenCalled();
        });
    });

    describe("isHedgeBet function", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it("calls broadcastNotice with correct notice when isHedgeBet is true", () => {
            // Arrange
            jest.mock("../../../../_shared/helpers/validate-bet-helper", () => ({
                isInPhasePreventBet: jest.fn(() => false),
                isBalanceUnavailable: jest.fn(() => false),
            }));

            placeBetHandlerProps.hedgeBetGroups = [["choice1", "choice2"]];
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 100;
            const gameStateContext = {
                roundState: RoundState.InRound,
                gameConfigs,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            updatePlaceBetContext({
                isProcessingBet: false,
                notConfirmOwnBets: {},
                ownBets: { choice2: 20 },
            });
            placeBetHandler.setPlaceBetDispatch(placeBetDispatch);

            const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_hedge_bet",
                duration: 2,
                errorCode: "SB1939",
                betChoice1: undefined,
                betChoice2: undefined,
                adjustBetNoticePosition: true
            };

            // Act
            placeBetHandler.placeBet("choice1", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(broadcastNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("does not call broadcastNotice when ownBets empty and isHedgeBet is false", () => {
            // Arrange
            jest.mock("../../../../_shared/helpers/validate-bet-helper", () => ({
                isInPhasePreventBet: jest.fn(() => false),
                isBalanceUnavailable: jest.fn(() => false),
            }));

            placeBetHandlerProps.hedgeBetGroups = [["choice1", "choice2"]];
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 100;
            const gameStateContext = {
                roundState: RoundState.InRound,
                gameConfigs,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            updatePlaceBetContext({
                isProcessingBet: false,
                notConfirmOwnBets: {},
                ownBets: {},
            });
            placeBetHandler.setPlaceBetDispatch(placeBetDispatch);

            const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_hedge_bet",
                duration: 2,
                errorCode: "SB1939",
                betChoice1: undefined,
                betChoice2: undefined,
            };

            // Act
            placeBetHandler.placeBet("choice1", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(broadcastNoticeSpy).not.toHaveBeenCalledWith(notice);
        });
    });

    describe("handleBetValidation function", () => {
        let gameConfigMock: GameConfigs;
        let userStakeLevelMock: IUserStakeLevel;
        beforeEach(() => {
            jest.clearAllMocks();
            jest.mock("../../../../_shared/helpers/validate-bet-helper", () => ({
                isInPhasePreventBet: jest.fn(() => false),
                isBalanceUnavailable: jest.fn(() => false),
                isHedgeBet: jest.fn(() => false),
            }));

            gameConfigMock = {
                minBet: 1,
                maxBet: 200,
                maxBetPerChoices: {
                    player: 200,
                    banker: 200,
                    tie: 100,
                },
                chips: [],
                enableFreeBet: false,
                margin: 0.1,
                odds: {},
            };

            userStakeLevelMock = {
                minBet: 1,
                maxBet: 200,
            };

            gameConfigs = stub<GameConfigs>(gameConfigMock);
            userStakeLevel = stub<IUserStakeLevel>(userStakeLevelMock);
        });

        it("call broadcastNotice with maxBet Draw", () => {
            // Arrange
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(300);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 1;
            const gameStateContext = {
                roundState: RoundState.InRound,
                gameConfigs,
                userStakeLevel,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            updatePlaceBetContext({
                isProcessingBet: false,
                notConfirmOwnBets: {},
                ownBets: { player: 200 },
            });
            const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
            const notice = {
                gameName: "test",
                message: "SabaNumber.message_draw_maxbet",
                duration: 2,
                errorCode: "SB1942",
                betChoice1: undefined,
                betChoice2: undefined,
                maxBet: 200,
                adjustBetNoticePosition: false
            };

            // Act
            placeBetHandler.placeBet("player", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(broadcastNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("call broadcastNotice with maxBet Draw - Enabled QuickBet", () => {
            // Arrange
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(300);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 1;
            const gameStateContext = {
                roundState: RoundState.InRound,
                gameConfigs,
                userStakeLevel,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            updatePlaceBetContext({
                isProcessingBet: false,
                notConfirmOwnBets: {},
                ownBets: { player: 200 },
            });
            const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
            const notice = {
                gameName: "test",
                message: "SabaNumber.message_draw_maxbet",
                duration: 2,
                errorCode: "SB1942",
                betChoice1: undefined,
                betChoice2: undefined,
                maxBet: 200,
                adjustBetNoticePosition: false
            };

            // Act
            placeBetHandler.placeBet("player", amount, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(broadcastNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("call broadcastNotice with maxBet PerChoice", () => {
            // Arrange
            gameConfigMock.maxBetPerChoices.player = 150;
            gameConfigs = stub<GameConfigs>(gameConfigMock);
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(300);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 1;
            const gameStateContext = {
                roundState: RoundState.InRound,
                gameConfigs,
                userStakeLevel,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            updatePlaceBetContext({
                isProcessingBet: false,
                notConfirmOwnBets: {},
                ownBets: { player: 150 },
            });
            const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_option_maxbet",
                duration: 2,
                errorCode: "SB1910",
                betChoice1: undefined,
                betChoice2: undefined,
                maxBet: 150,
                adjustBetNoticePosition: false
            };

            // Act
            placeBetHandler.placeBet("player", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(broadcastNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("call broadcastNotice with maxBet PerChoice -  Enabled QuickBet", () => {
            // Arrange
            gameConfigMock.maxBetPerChoices.player = 150;
            gameConfigs = stub<GameConfigs>(gameConfigMock);
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(300);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 1;
            const gameStateContext = {
                roundState: RoundState.InRound,
                gameConfigs,
                userStakeLevel,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            updatePlaceBetContext({
                isProcessingBet: false,
                notConfirmOwnBets: {},
                ownBets: { player: 150 },
            });
            const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_option_maxbet",
                duration: 2,
                errorCode: "SB1910",
                betChoice1: undefined,
                betChoice2: undefined,
                maxBet: 150,
                adjustBetNoticePosition: false
            };

            // Act
            placeBetHandler.placeBet("player", amount, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(broadcastNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("Not call broadcastNotice with maxBet PerChoice when maxBetPerChoice equal total-amount on current Choice", () => {
            // Arrange
            gameConfigMock.maxBetPerChoices.player = 150;
            gameConfigs = stub<GameConfigs>(gameConfigMock);
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(300);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            placeBetHandler.setPlaceBetDispatch(placeBetDispatch);

            const amount = 1;
            const gameStateContext = {
                roundState: RoundState.InRound,
                gameConfigs,
                userStakeLevel,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            updatePlaceBetContext({
                isProcessingBet: false,
                notConfirmOwnBets: {},
                ownBets: { player: 149 },
            });
            const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_option_maxbet",
                duration: 2,
                errorCode: "SB1910",
                betChoice1: undefined,
                betChoice2: undefined,
                maxBet: 150,
                adjustBetNoticePosition: false
            };

            // Act
            placeBetHandler.placeBet("player", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(broadcastNoticeSpy).not.toHaveBeenCalledWith(notice);
        });

        describe("Suggest bet function", () => {
            let gameStateContext: any;
            let betChoice: string;
            let amount: number;

            beforeEach(() => {
                betChoice = "player";
                gameConfigMock.maxBetPerChoices.player = 150;
                gameConfigMock.minBet = 5;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                gameStateContext = {
                    roundState: RoundState.InRound,
                    gameConfigs,
                    userStakeLevel,
                };
                amount = 100;
            });

            it("call suggest-bet with case InsufficientFunds", () => {
                // Arrange
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(50);
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });

                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const availableSuggestBet = {
                    suggestAmount: 50,
                    isInsufficientFunds: true,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, false, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
            });

            it("call suggest-bet with case InsufficientFunds", () => {
                // Arrange
                userStakeLevelMock.maxBet = 20000;
                userStakeLevel = stub<IUserStakeLevel>(userStakeLevelMock);
                gameConfigMock.maxBet = 20000;
                gameConfigMock.maxBetPerChoices.player = 10000;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                gameStateContext = {
                    roundState: RoundState.InRound,
                    gameConfigs,
                    userStakeLevel,
                };
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(9500);
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: { player: 9000 },
                    ownBets: {},
                });
                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const availableSuggestBet = {
                    suggestAmount: 500,
                    isInsufficientFunds: true,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, 1000, false, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
            });

            it("call suggest-bet with case InsufficientFunds - Enabled QuickBet", () => {
                // Arrange
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(50);
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });

                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const availableSuggestBet = {
                    suggestAmount: 50,
                    isInsufficientFunds: true,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, true, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
            });

            it("call suggest-bet with case max-bet choice", () => {
                // Arrange
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });

                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");
                const availableSuggestBet = {
                    suggestAmount: 50,
                    isInsufficientFunds: false,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, false, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
                expect(placeBetHandler.getPlaceBetDispatch()).toHaveBeenCalledTimes(2);
                expect(showConfirmDialogSpy).toHaveBeenCalled();
            });

            it("call suggest-bet with case max-bet choice - Enabled QuickBet", () => {
                // Arrange
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });

                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");
                const availableSuggestBet = {
                    suggestAmount: 50,
                    isInsufficientFunds: false,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, true, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
                expect(placeBetHandler.getPlaceBetDispatch()).toHaveBeenCalledTimes(2);
                expect(showConfirmDialogSpy).toHaveBeenCalled();
            });

            it("call suggest-bet with case max-bet choice and max-bet round", () => {
                // Arrange
                gameConfigMock.maxBet = 140;
                gameConfigMock.maxBetPerChoices.player = 150;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                gameStateContext = {
                    roundState: RoundState.InRound,
                    gameConfigs,
                    userStakeLevel,
                };

                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });

                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");
                const availableSuggestBet = {
                    suggestAmount: 40,
                    isInsufficientFunds: false,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, false, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
                expect(placeBetHandler.getPlaceBetDispatch()).toHaveBeenCalledTimes(2);
                expect(showConfirmDialogSpy).toHaveBeenCalled();
            });

            it("call suggest-bet with case max-bet choice and max-bet round -  Enabled QuickBet", () => {
                // Arrange
                gameConfigMock.maxBet = 140;
                gameConfigMock.maxBetPerChoices.player = 150;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                gameStateContext = {
                    roundState: RoundState.InRound,
                    gameConfigs,
                    userStakeLevel,
                };

                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });
                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");
                const availableSuggestBet = {
                    suggestAmount: 40,
                    isInsufficientFunds: false,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, true, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
                expect(placeBetHandler.getPlaceBetDispatch()).toHaveBeenCalledTimes(2);
                expect(showConfirmDialogSpy).toHaveBeenCalled();
            });

            it("Not call suggest-bet with normal case", () => {
                // Arrange
                amount = 50;
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });

                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");
                const updateNotConfirmedBetStateSpy = jest.spyOn(placeBetHandler as any, "updateNotConfirmedBetState");
                const availableSuggestBet = {
                    suggestAmount: 50,
                    isInsufficientFunds: false,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, false, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).not.toHaveBeenCalledWith(betChoice, availableSuggestBet);
                expect(showConfirmDialogSpy).not.toHaveBeenCalled();
                expect(updateNotConfirmedBetStateSpy).toHaveBeenCalled();
            });

            it("Not call suggest-bet with user Insufficient ", () => {
                // Arrange
                amount = 10;
                gameConfigMock.minBet = 10;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                gameStateContext.gameConfigs = gameConfigs;
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(6);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });

                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");

                const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
                const notice = {
                    gameName: "test",
                    message: "Common.not_enough_money",
                    duration: 2,
                    errorCode: "SB1907",
                    betChoice1: "",
                    betChoice2: "",
                    adjustBetNoticePosition: false
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, false, gameStateContextModel, systemContextModel);

                // Assert

                expect(showConfirmDialogSpy).not.toHaveBeenCalled();
                expect(broadcastNoticeSpy).toHaveBeenCalledWith(notice);
            });

            it("Not call suggest-bet with user Insufficient - Enabled QuickBet", () => {
                // Arrange
                amount = 10;
                gameConfigMock.minBet = 10;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                gameStateContext.gameConfigs = gameConfigs;
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(6);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });

                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");

                const broadcastNoticeSpy = jest.spyOn(placeBetHandler, "broadcastNotice");
                const notice = {
                    gameName: "test",
                    message: "Common.not_enough_money",
                    duration: 2,
                    errorCode: "SB1907",
                    betChoice1: "",
                    betChoice2: "",
                    adjustBetNoticePosition: false
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, true, gameStateContextModel, systemContextModel);

                // Assert

                expect(showConfirmDialogSpy).not.toHaveBeenCalled();
                expect(broadcastNoticeSpy).toHaveBeenCalledWith(notice);
            });

            it("call suggest-bet when exist bet other choice and case max-bet round", () => {
                // Arrange
                amount = 5000;
                gameConfigMock.maxBet = 10000;
                userStakeLevel.maxBet = 10000;
                gameConfigMock.maxBetPerChoices.player = 20000;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                gameStateContext = {
                    roundState: RoundState.InRound,
                    gameConfigs,
                    userStakeLevel,
                };

                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(20000);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: { player: 5000 },
                    ownBets: { tie: 1000 },
                });
                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");
                const availableSuggestBet = {
                    suggestAmount: 4000,
                    isInsufficientFunds: false,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, false, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
                expect(placeBetHandler.getPlaceBetDispatch()).toHaveBeenCalledTimes(2);
                expect(showConfirmDialogSpy).toHaveBeenCalled();
            });

            it("call suggest-bet when exist bet other choice and case max-bet round - Enabled QuickBet", () => {
                // Arrange
                amount = 5000;
                gameConfigMock.maxBet = 10000;
                userStakeLevel.maxBet = 10000;
                gameConfigMock.maxBetPerChoices.player = 20000;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                gameStateContext = {
                    roundState: RoundState.InRound,
                    gameConfigs,
                    userStakeLevel,
                };

                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(20000);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { tie: 1000, player: 5000 },
                });
                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");
                const availableSuggestBet = {
                    suggestAmount: 4000,
                    isInsufficientFunds: false,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, true, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
                expect(placeBetHandler.getPlaceBetDispatch()).toHaveBeenCalledTimes(2);
                expect(showConfirmDialogSpy).toHaveBeenCalled();
            });
        });

        describe("Enabled QuickBet function", () => {
            let gameStateContext: any;
            let betChoice: string;
            let amount: number;
            let enabledQuickBet: boolean;

            beforeEach(() => {
                betChoice = "player";
                gameStateContext = {
                    roundState: RoundState.InRound,
                    gameConfigs,
                    userStakeLevel,
                };
                gameConfigMock.maxBetPerChoices.player = 150;
                gameConfigMock.minBet = 5;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                enabledQuickBet = true;
            });

            it("Valid bet", () => {
                // Arrange
                amount = 50;
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });
                const updateNotConfirmedBetStateSpy = jest.spyOn(placeBetHandler as any, "updateNotConfirmedBetState");
                const handleEnabledQuickBetSpy = jest.spyOn(placeBetHandler, "handleEnabledQuickBet");

                // Act
                placeBetHandler.placeBet(betChoice, amount, enabledQuickBet, gameStateContextModel, systemContextModel);

                // Assert
                expect(updateNotConfirmedBetStateSpy).toHaveBeenCalled();
                expect(handleEnabledQuickBetSpy).toHaveBeenCalledWith(amount, betChoice);
            });

            it("Invalid bet: amount > player-balance", () => {
                // Arrange
                amount = 300;
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });
                const updateNotConfirmedBetStateSpy = jest.spyOn(placeBetHandler as any, "updateNotConfirmedBetState");
                const handleEnabledQuickBetSpy = jest.spyOn(placeBetHandler, "handleEnabledQuickBet");

                // Act
                placeBetHandler.placeBet(betChoice, amount, enabledQuickBet, gameStateContextModel, systemContextModel);

                // Assert
                expect(updateNotConfirmedBetStateSpy).not.toHaveBeenCalled();
                expect(handleEnabledQuickBetSpy).not.toHaveBeenCalledWith(amount, betChoice);
            });
        });

        describe("Disable QuickBet function", () => {
            let gameStateContext: any;
            let betChoice: string;
            let amount: number;
            let enabledQuickBet: boolean;

            beforeEach(() => {
                betChoice = "player";
                gameStateContext = {
                    roundState: RoundState.InRound,
                    gameConfigs,
                    userStakeLevel,
                };
                gameConfigMock.maxBetPerChoices.player = 150;
                gameConfigMock.minBet = 5;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                enabledQuickBet = false;
            });

            it("Valid bet", () => {
                // Arrange
                amount = 50;
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });
                const updateNotConfirmedBetStateSpy = jest.spyOn(placeBetHandler as any, "updateNotConfirmedBetState");
                const showConfirmBetSpy = jest.spyOn(placeBetHandler, "showConfirmBet");

                // Act
                placeBetHandler.placeBet(betChoice, amount, enabledQuickBet, gameStateContextModel, systemContextModel);

                // Assert
                expect(updateNotConfirmedBetStateSpy).toHaveBeenCalled();
                expect(showConfirmBetSpy).toHaveBeenCalled();
            });

            it('Valid bet with betChoice =  "confirmBet"', () => {
                // Arrange
                amount = 50;
                betChoice = "confirmBet";
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });
                const updateNotConfirmedBetStateSpy = jest.spyOn(placeBetHandler as any, "updateNotConfirmedBetState");
                const sendConfirmBetSpy = jest.spyOn(placeBetHandler as any, "sendConfirmBet");

                // Act
                placeBetHandler.placeBet(betChoice, amount, enabledQuickBet, gameStateContextModel, systemContextModel);

                // Assert
                expect(updateNotConfirmedBetStateSpy).not.toHaveBeenCalled();
                expect(sendConfirmBetSpy).toHaveBeenCalled();
            });

            it("Invalid bet: amount > player-balance", () => {
                // Arrange
                amount = 300;
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                placeBetHandler.setPlaceBetDispatch(placeBetDispatch);
                updatePlaceBetContext({
                    isProcessingBet: false,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                });
                const updateNotConfirmedBetStateSpy = jest.spyOn(placeBetHandler as any, "updateNotConfirmedBetState");
                const sendConfirmBetSpy = jest.spyOn(placeBetHandler as any, "sendConfirmBet");

                // Act
                placeBetHandler.placeBet(betChoice, amount, enabledQuickBet, gameStateContextModel, systemContextModel);

                // Assert
                expect(updateNotConfirmedBetStateSpy).not.toHaveBeenCalled();
                expect(sendConfirmBetSpy).not.toHaveBeenCalled();
            });
        });
    });
});
