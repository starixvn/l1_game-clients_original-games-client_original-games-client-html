import React from "react";
import { createPortal } from "react-dom";
import { Socket } from "socket.io-client";

import { GameIds } from "../../_shared/constants";
import { InitSocketIO, writeDebugLog } from "../../_shared/helpers";
import { AnalyticsHelper } from "../../_shared/helpers/analytic-helper";
import { broadcastOpeningGameId } from "../../_shared/helpers/global-events-helper";
import { GameActionsContextProvider, GameContextProvider, PlayerContext, PlayerContextModel } from "../../_shared/react-contexts";
import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { PlaceBetEventActionType } from "../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-action";
import { PlaceBetProvider } from "../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context";
import { GameResourceKeys } from "../../_shared/resources";
import { getBalance } from "../../services/auth-service";
import BetConfirmDialog from "../game-components/bet-confirm-dialog";
import ConfirmBet from "../game-components/confirm-bet";
import CountdownTimer from "../game-components/countdown-timer/countdown-timer";
import DisabledModal from "../game-components/disabled-modal";
import { ConnectFailedMessage } from "../game-components/error-message";
import { ConnectFailedReasonKey } from "../game-components/error-message/type";
import GameContainer from "../game-components/game-container";
import GameGuideModal from "../game-components/game-guide";
import GameLoading from "../game-components/game-loading";
import { LoadingSpinner } from "../game-components/game-loading/loading-spinner";
import { NewRoundTransitionWithoutExtraSeconds } from "../game-components/new-round-transition";
import { NoticeDialog } from "../game-components/notice";
import { PFSettingModal } from "../game-components/provably-fair";
import { IRoundStateHandler } from "../round-base/round-state-handler";
import { IGameSoundHandler, RoundGameSoundHandler } from "../round-base/round-game-sound-handler";
import {
    GameDisableHandler,
    GameErrorHandler,
    GameFinishHandler,
    GameMessageHandler,
    GameRoundHistoryHandler,
    messageEventType,
    PlaceBetHandler,
    PlayerHandler,
} from "./handlers";
import { GameRoundDataHandler } from "./handlers/game-round-data-handler";
import { GameStateHandler, IGameStateHandler } from "./handlers/game-state-handler";
import { PFWrapper } from "./handlers/pf-wrapper/pf-wrapper";
import { PlaceBetHandlerWrapper } from "./handlers/place-bet-wrapper/place-bet-handler-wrapper";
import { GameBaseHandlers, GameBaseProps, GameBaseState, RoundState } from "./type";
import PreloadResources from "../../_shared/helpers/preload-resources";
import { BetHistoryTable } from "../game-components/bet-history/bet-history-table";
import { PlayerResultBoard } from "../game-components/player-result-board/player-result-board";
import { Menu } from "../game-components/menu/menu";
import ChipControlPanel from "../game-components/chip-slider";
import { OwnTotalBet } from "../game-components/own-total-bet/own-total-bet";
import { Menu as MenuSettings } from "../game-components/settings/menu";
import useGameStore from "../../_shared/stores/game-store/game-store";
import { Background } from "../page-components/background";

abstract class GameBase<P extends GameBaseProps, S extends GameBaseState> extends React.PureComponent<P, S> {
    protected socket: Socket;
    protected gameCronInterval: NodeJS.Timeout;
    protected roundTimeCounter: number;
    protected timeCounter: number;
    private disconnectTimeout: NodeJS.Timeout;
    private readonly gameMessageHandler: GameMessageHandler;
    private readonly roundStateHandler: IRoundStateHandler;
    private readonly gameStateHandler: IGameStateHandler;
    private readonly gameErrorHandler: GameErrorHandler;
    private readonly playerHandler: PlayerHandler;
    private readonly placeBetHandler: PlaceBetHandler;
    private readonly gameFinishHandler?: GameFinishHandler;
    private readonly gameDisabledHandler?: GameDisableHandler;
    private readonly gameRoundHistoryHandler?: GameRoundHistoryHandler;
    private readonly gameSoundHandler: IGameSoundHandler;
    private readonly gameRoundDataHandler?: GameRoundDataHandler;

    constructor(props: P, handlers: GameBaseHandlers) {
        super(props);

        const { dispatch } = this.props;
        const gamName = this.props.translate(`${GameResourceKeys.GAME_NAME}_${this.props.id}`);

        const {
            roundStateHandler,
            gameStateHandler,
            gameMessageHandler,
            gameRoundDataHandler,
            gameErrorHandler,
            playerHandler,
            placeBetHandler,
            gameFinishHandler,
            gameDisabledHandler,
            gameRoundHistoryHandler,
            gameSoundHandler,
        } = handlers;

        this.roundStateHandler = roundStateHandler;
        this.gameMessageHandler = gameMessageHandler;
        this.gameRoundDataHandler = gameRoundDataHandler ?? new GameRoundDataHandler();
        this.gameStateHandler = gameStateHandler ?? new GameStateHandler();
        this.gameErrorHandler =
            gameErrorHandler ??
            new GameErrorHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gamName,
            });

        this.playerHandler =
            playerHandler ??
            new PlayerHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gameName: this.props.gameName,
            });

        this.placeBetHandler =
            placeBetHandler ??
            new PlaceBetHandler({
                tolgeeNamespace: this.props.tolgeeNamespace,
                gameMessageHandler: this.gameMessageHandler,
                gameName: gamName,
                getPlayerBalance: this.getPlayerBalance,
                hedgeBetGroups: this.props.hedgeBetGroups,
                translate: props.translate,
                playPlaceBetSound: () => {
                    this.props.gameSound.playPlaceBetSound();
                },
                gameId: this.props.id,
                betPayloadFormat: this.props.id === GameIds.SeDieMultiplayer ? "single" : "map",
            });

        this.gameFinishHandler =
            gameFinishHandler ??
            new GameFinishHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                durations: this.props.durations,
                roundStateHandler: this.roundStateHandler,
                runGame: (remainingTime: number) => this.runGame(remainingTime),
                gameId: this.props.id,
                gameStateContextModel: this.getGameStateContext.bind(this),
                gameRoundDataHandler: this.gameRoundDataHandler,
            });

        this.gameDisabledHandler =
            gameDisabledHandler ??
            new GameDisableHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                durations: this.props.durations,
                gameStateContextModel: this.getGameStateContext.bind(this),
                roundStateHandler: roundStateHandler,
            });

        this.gameRoundHistoryHandler =
            gameRoundHistoryHandler ??
            new GameRoundHistoryHandler({ dispatch, gameStateContextModel: this.getGameStateContext.bind(this) });

        this.gameSoundHandler =
            gameSoundHandler ??
            new RoundGameSoundHandler({
                gameSound: this.getGameSound.bind(this),
            });

        this.state = {
            isLoaded: false,
        } as S;

        this.placeBet = this.placeBet.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);
        this.onPreloadResourceDone = this.onPreloadResourceDone.bind(this);

        AnalyticsHelper.trackPage({ page_title: this.props.gameName });
        broadcastOpeningGameId(props.id);
    }

    getGameStateContext = () => {
        return this.props.gameStateContextModel;
    };

    getGameSound = () => {
        return this.props.gameSound;
    };

    componentDidMount() {
        document.addEventListener("visibilitychange", this.onVisibilityChange);
        this.onStart();
    }

    componentWillUnmount() {
        this.onDestroy();
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }

    getPlayerBalance = () => {
        return (this.context as PlayerContextModel).authorizeInfo.user.red;
    };

    onDestroy() {
        this.props.dispatch({
            type: GameEventActionType.SIGN_OUT,
            payload: { roundState: RoundState.None },
        });
        this.socket?.disconnect();

        this.clearGameTimeoutAndInterval();
        this.clearDisconnectTimeout();
    }

    clearGameTimeoutAndInterval = () => {
        clearInterval(this.gameCronInterval);
        this.gameFinishHandler.clearTimeout();
        this.placeBetHandler.clearRetryInterval();
    };

    onStart() {
        this.socket?.disconnect();
        this.socket = null;
        this.gameMessageHandler.clearAllHandlers();
        this.props.dispatch({ type: GameEventActionType.DISCONNECT, payload: {} });
        this.clearDisconnectTimeout();
        this.registerHandlers();
        this.connectToGameService();
        this.gameMessageHandler.broadcastGameEvent({ [messageEventType.UPDATE_PLAYER_BALANCE]: true });
    }

    onPreloadResourceDone = () => {
        console.log(`[GameBase:${this.props.id}] PreloadResources completed, setting isLoaded to true`);
        this.setState({ isLoaded: true });
    };

    preloadResource = () => {
        const playerContext = this.context as PlayerContextModel;
        console.log(`[GameBase:${this.props.id}] Rendering PreloadResources:`, {
            gameId: this.props.id,
            locale: playerContext?.locale || "en",
            isLoaded: this.state.isLoaded,
        });
        return (
            <PreloadResources setIsDonePreload={this.onPreloadResourceDone} gameId={this.props.id} locale={playerContext?.locale || "en"} />
        );
    };

    protected async connectToGameService() {
        const { session } = this.context as PlayerContextModel;
        const { socketInfo, gameName } = this.props;
        const { socket } = InitSocketIO(socketInfo, session, gameName, this.gameMessageHandler);

        this.socket = socket;
    }

    onVisibilityChange = () => {
        document.visibilityState === "hidden" ? this.onDestroy() : this.onStart();
    };

    onConnectFailed() {
        this.onDestroy();
        useGameStore.getState().setRoundState(RoundState.ConnectFailed);
        this.props.dispatch({
            type: GameEventActionType.DISCONNECT_ERROR,
            payload: { disconnectReason: ConnectFailedReasonKey.lostConnection },
        });
    }

    onSocketDisconnect() {
        this.onDestroy();
        const { dispatch } = this.props;
        this.disconnectTimeout = setTimeout(
            () => {
                dispatch({ type: GameEventActionType.DISCONNECT, payload: {} });
                if (!this.props.gameStateContextModel.signedIn) {
                    useGameStore.getState().setRoundState(RoundState.ConnectFailed);

                    dispatch({
                        type: GameEventActionType.DISCONNECT_ERROR,
                        payload: { disconnectReason: ConnectFailedReasonKey.lostConnection },
                    });
                }
            },
            this.props.gameStateContextModel.signedIn ? 1000 : 5000
        );
    }

    onGameServiceConnected() {
        this.clearDisconnectTimeout();
        this.props.dispatch({
            type: GameEventActionType.CONNECT,
            payload: { isConnect: true },
        });
    }

    registerHandlers() {
        const signOut = (this.context as PlayerContextModel)?.signOut;

        this.gameMessageHandler.register(messageEventType.SOCKET_CONNECTED, this.onGameServiceConnected.bind(this));
        this.gameMessageHandler.register(messageEventType.SOCKET_CONNECT_ERROR, this.onConnectFailed.bind(this));
        this.gameMessageHandler.register(messageEventType.SOCKET_DISCONNECTED, this.onSocketDisconnect.bind(this));
        this.gameMessageHandler.register(messageEventType.UNDER_MAINTENANCE, this.handleUM.bind(this));
        this.gameMessageHandler.register(messageEventType.REMAINING_TIME, this.handleRemainingTime.bind(this));
        this.gameMessageHandler.register(messageEventType.ROUND_HISTORY, this.handleRoundHistory.bind(this));
        this.gameFinishHandler.registerEvents();
        this.gameMessageHandler.register(messageEventType.GAME_DESTROY, this.onDestroy.bind(this));
        this.gameMessageHandler.register(messageEventType.CLEAR_GAME_TIMEOUT_AND_INTERVAL, this.clearGameTimeoutAndInterval.bind(this));
        this.gameMessageHandler.register(messageEventType.SEND_SOCKET_MESSAGE, this.sendSocketMessage.bind(this));
        this.gameMessageHandler.register(messageEventType.UPDATE_PLAYER_BALANCE, this.updateUserBalance.bind(this));
        this.playerHandler.registerEvents();
        this.gameErrorHandler.registerEvents(signOut);
    }

    get defaultResult() {
        return null;
    }

    get defaultSettlementResult() {
        return null;
    }

    sendSocketMessage = (message) => {
        const { event, data } = message[messageEventType.SEND_SOCKET_MESSAGE];
        this.socket.emit(event, data);
    };

    handleUM(gameMessage) {
        this.gameDisabledHandler.handleUM(gameMessage, this.timeCounter);
    }

    handleRoundHistory(gameMessage) {
        const { durations } = this.props;
        const newRoundState = this.roundStateHandler.determineRoundBaseState({
            roundRemainingTime: this.roundTimeCounter,
            wholeRound: durations.wholeRound,
            remainingTime: this.timeCounter,
            durations,
        });
        this.gameRoundHistoryHandler.handleRoundHistory({ ...gameMessage, newRoundState });
    }

    handleRemainingTime({ remainingTime }) {
        const { durations, gameStateContextModel } = this.props;
        const { roundState, isUMInFirstLoad } = gameStateContextModel;

        if (roundState === RoundState.None || !isUMInFirstLoad) {
            this.roundTimeCounter = remainingTime;
            const clientRemainingTime = this.roundStateHandler.getRemainingTime({ remainingTime, durations });
            this.broadcastClientRemainingTime(clientRemainingTime);
            this.runGame(clientRemainingTime);
        }
    }

    runGame(remainingTime: number) {
        this.timeCounter = remainingTime;
        const { durations } = this.props;
        const { wholeRound } = durations;

        this.gameCronInterval && clearInterval(this.gameCronInterval);
        this.gameCronInterval = setInterval(() => {
            this.roundStateHandler.determineRoundBaseState({
                roundRemainingTime: this.roundTimeCounter,
                wholeRound: wholeRound,
                remainingTime: this.timeCounter,
                durations,
            });

            this.roundTimeCounter = this.roundTimeCounter - 1;
            if (this.timeCounter > 0) {
                this.timeCounter = this.timeCounter - 1;
            }

            this.handleGamePlay(this.timeCounter);
        }, 1000);

        this.handleGamePlay(remainingTime);
    }

    updatePlaceBetContext = (newRoundState: RoundState) => {
        if (
            [RoundState.SwitchRound, RoundState.BeforePlaceBet, RoundState.InRound].includes(newRoundState) &&
            typeof this.placeBetHandler?.getPlaceBetDispatch() === "function"
        ) {
            this.placeBetHandler?.getPlaceBetDispatch()({
                type: PlaceBetEventActionType.RESET_OWN_BETS_AND_SUGGEST_BET,
                payload: {},
            });

            this.gameMessageHandler.broadcastGameEvent({ [messageEventType.SYNC_OWN_BETS_TO_PF]: {} });
        }

        if (newRoundState === RoundState.LockingBet && typeof this.placeBetHandler?.getPlaceBetDispatch() === "function") {
            this.placeBetHandler?.getPlaceBetDispatch()({
                type: PlaceBetEventActionType.CLOSE_ALL_DIALOGS,
                payload: {},
            });
        }
    };

    handleGamePlay(remainingTime: number) {
        const { durations, dispatch, gameStateContextModel } = this.props;

        writeDebugLog({
            remainingTime,
            roundState: RoundState[gameStateContextModel.roundState],
            roundTimeCounter: this.roundTimeCounter,
        });

        this.broadcastClientRemainingTime(remainingTime);
        this.roundStateHandler.determineRoundBaseState({
            roundRemainingTime: this.roundTimeCounter,
            wholeRound: durations.wholeRound,
            remainingTime,
            durations,
        });

        this.gameMessageHandler.broadcastGameEvent({
            [messageEventType.ROUND_STATE]: this.roundStateHandler.determineRoundBaseState({
                roundRemainingTime: this.roundTimeCounter,
                wholeRound: durations.wholeRound,
                remainingTime,
                durations,
            }),
        });

        if (
            gameStateContextModel.roundState !==
            this.roundStateHandler.determineRoundBaseState({
                roundRemainingTime: this.roundTimeCounter,
                wholeRound: durations.wholeRound,
                remainingTime,
                durations,
            })
        ) {
            const isStartNewRound =
                gameStateContextModel.roundState === RoundState.SwitchRound &&
                this.roundStateHandler.determineRoundBaseState({
                    roundRemainingTime: this.roundTimeCounter,
                    wholeRound: durations.wholeRound,
                    remainingTime,
                    durations,
                }) === RoundState.InRound;
            const newGameState = {
                prevRoundState: gameStateContextModel.roundState,
                roundState: this.roundStateHandler.determineRoundBaseState({
                    roundRemainingTime: this.roundTimeCounter,
                    wholeRound: durations.wholeRound,
                    remainingTime,
                    durations,
                }),
                isPlayStartRoundAnimation: isStartNewRound,
                ...this.gameStateHandler.getNextRoundState({
                    nextRoundState: this.roundStateHandler.determineRoundBaseState({
                        roundRemainingTime: this.roundTimeCounter,
                        wholeRound: durations.wholeRound,
                        remainingTime,
                        durations,
                    }),
                    gameStateContextModel,
                    durations,
                    defaultResult: this.defaultResult,
                    defaultSettlementResult: this.defaultSettlementResult,
                    remainingTime,
                }),
            };

            writeDebugLog({
                name: "change-round-state",
                prevRoundState: RoundState[gameStateContextModel.roundState],
                newRoundState:
                    RoundState[
                        this.roundStateHandler.determineRoundBaseState({
                            roundRemainingTime: this.roundTimeCounter,
                            wholeRound: durations.wholeRound,
                            remainingTime,
                            durations,
                        })
                    ],
                ...newGameState,
            });

            useGameStore.getState().setGameState(newGameState);
            dispatch({
                type: GameEventActionType.SET_NEW_GAME_STATE,
                payload: { newGameState },
            });

            if ([RoundState.None, RoundState.BeforePlaceBet].includes(newGameState.prevRoundState)) {
                useGameStore.getState().resetBettingInfo();
            }
            this.updatePlaceBetContext(
                this.roundStateHandler.determineRoundBaseState({
                    roundRemainingTime: this.roundTimeCounter,
                    wholeRound: durations.wholeRound,
                    remainingTime,
                    durations,
                })
            );

            const isContinuePlaying = gameStateContextModel.roundState !== RoundState.None;
            if (isContinuePlaying) {
                console.log(`[GameBase:${this.props.id}] handleSound`, {
                    newRoundState: this.roundStateHandler.determineRoundBaseState({
                        roundRemainingTime: this.roundTimeCounter,
                        wholeRound: durations.wholeRound,
                        remainingTime,
                        durations,
                    }),
                });
                this.gameSoundHandler.handleSound(
                    this.roundStateHandler.determineRoundBaseState({
                        roundRemainingTime: this.roundTimeCounter,
                        wholeRound: durations.wholeRound,
                        remainingTime,
                        durations,
                    })
                );
            }
        }

        if (remainingTime > 0 && remainingTime <= durations.lockingBet) {
            this.props.gameSound.blockBetSound();
        }

        if (this.roundTimeCounter === durations.startNewRoundAnim) {
            dispatch({
                type: GameEventActionType.START_NEW_ROUND_ANIM,
                payload: { isPlayStartRoundAnimation: true },
            });
        }

        if (this.roundTimeCounter === durations.startNewRoundAnim - 2) {
            dispatch({
                type: GameEventActionType.START_NEW_ROUND_ANIM,
                payload: { isPlayStartRoundAnimation: false },
            });
        }
    }

    broadcastClientRemainingTime = (clientRemainingTime: number) => {
        this.gameMessageHandler.broadcastGameEvent({ [messageEventType.CLIENT_REMAINING_TIME]: clientRemainingTime });
    };

    async updateUserBalance() {
        const authContext = this.context as PlayerContextModel;
        const balanceResponse = await getBalance(authContext?.session);
        if (balanceResponse.isSuccessful) {
            authContext?.setBalance(balanceResponse.balance);
        } else {
            this.props.setApiErrorMessage(balanceResponse.errorCode);
        }
    }

    placeBet(betChoice: string, amount: number) {
        const { authorizeInfo, enableQuickBet } = this.context as PlayerContextModel;
        const enabledQuickBet = authorizeInfo?.user?.settings.quickBet || enableQuickBet;

        this.placeBetHandler.placeBet(betChoice, amount, enabledQuickBet, this.props.gameStateContextModel, this.props.systemContextModel);
    }

    clearDisconnectTimeout = () => {
        clearTimeout(this.disconnectTimeout);
    };

    renderNotice() {
        return <NoticeDialog />;
    }

    renderRoundIdSection() {
        return <></>;
    }

    renderPFSettingModal() {
        return createPortal(<PFSettingModal />, document.getElementById("dashboard"));
    }

    renderBetHistoryModal() {
        return <></>;
    }

    renderGameGuideModal() {
        return createPortal(<GameGuideModal />, document.getElementById("dashboard"));
    }

    renderMenuButtons() {
        return <></>;
    }

    renderBettingBlock() {
        return <></>;
    }

    renderScoreboards() {
        return <></>;
    }

    renderChipControlPanel() {
        return <ChipControlPanel />;
    }

    renderLeftSideBetSettings() {
        return <></>;
    }
    renderRightSideBetSettings() {
        return <></>;
    }

    renderBetSettings() {
        return (
            <div className="flex gap-2 justify-center items-center">
                {this.renderLeftSideBetSettings()}
                {this.renderChipControlPanel()}
                {this.renderRightSideBetSettings()}
            </div>
        );
    }

    renderConfirmBet() {
        return <ConfirmBet />;
    }

    renderConfirmDialog() {
        return <BetConfirmDialog />;
    }

    renderStatistic() {
        return <></>;
    }

    renderStatisticContent() {
        return <></>;
    }

    renderNewRoundTransition() {
        return <NewRoundTransitionWithoutExtraSeconds />;
    }

    renderRoundHistory() {
        return <></>;
    }

    renderCountdownTimer() {
        return <CountdownTimer />;
    }

    renderResultBlock() {
        return <></>;
    }

    renderBetOptions() {
        return (
            <PlaceBetProvider>
                <PlaceBetHandlerWrapper handler={this.placeBetHandler} signOut={(this.context as PlayerContextModel)?.signOut}>
                    {this.renderBettingBlock()}
                    {this.renderConfirmDialog()}
                    {this.renderConfirmBet()}
                </PlaceBetHandlerWrapper>
            </PlaceBetProvider>
        );
    }

    renderBetControlLeftSide() {
        return <div className="col-12 col-md-6">{this.renderBetSettings()}</div>;
    }

    renderBetControlRightSide() {
        return (
            <div className="col-12 col-md-6">
                <div className="p-3 rounded-t-xl bg-primary-bg">
                    <OwnTotalBet />
                </div>
            </div>
        );
    }

    renderBetControl() {
        return (
            <div className="md:bg-primary-bg md:rounded-t-xl">
                <div className="flex flex-wrap items-center">
                    {this.renderBetControlLeftSide()}
                    {this.renderBetControlRightSide()}
                </div>
            </div>
        );
    }

    renderMenu() {
        return (
            <Menu
                leftSide={
                    <div className="bg-gradient-to-br from-[#6F8FC4] via-[#455F8A] to-[#364D74] bg-clip-text text-transparent font-bold text-sm tracking-wider align-middle">
                        Nova88 Original
                    </div>
                }
                rightSide={
                    <>
                        <MenuSettings />
                    </>
                }
            />
        );
    }

    renderGameFrame() {
        return (
            <div className="flex flex-col items-center justify-center relative">
                <Background gameId={this.props.id} />
                {this.renderRoundHistory()}
                {this.renderCountdownTimer()}
                <div className="flex flex-col">
                    {this.props.gameStateContextModel.availableInGameData && this.renderResultBlock()}
                    {this.renderBetOptions()}
                </div>
            </div>
        );
    }

    renderLeftSide() {
        return (
            <div className="col-12 col-lg-8 mb-3 px-3">
                {this.renderGameFrame()}
                {this.renderBetControl()}
                {this.renderMenu()}
            </div>
        );
    }

    renderRightSide() {
        return (
            <div className="col-12 col-lg-4 mb-3 px-3">
                <PlayerResultBoard />
            </div>
        );
    }

    renderBetHistoryTable() {
        return <BetHistoryTable />;
    }

    getRenderTemplate() {
        return (
            <>
                <div className={`game-${this.props.id}`}>
                    <div className="flex flex-wrap">
                        {this.renderLeftSide()}
                        {this.renderRightSide()}
                        <div className="col-12 px-3">{this.renderBetHistoryTable()}</div>
                    </div>
                    <PFWrapper
                        socket={this.socket}
                        gameMessageHandler={this.gameMessageHandler}
                        gameId={this.props.id}
                        uid={(this.context as PlayerContextModel).authorizeInfo?.user?.UID}
                    >
                        {this.renderPFSettingModal()}
                        {this.renderBetHistoryModal()}
                    </PFWrapper>
                    {this.renderGameGuideModal()}
                </div>
            </>
        );
    }

    renderGame() {
        const gameActionsContext = {
            placeBet: this.placeBet,
        };
        return (
            <GameContextProvider value={{ ...this.props, gameMessageHandler: this.gameMessageHandler }}>
                <GameActionsContextProvider value={gameActionsContext}>{this.getRenderTemplate()}</GameActionsContextProvider>
            </GameContextProvider>
        );
    }

    protected retryConnect() {
        this.onStart();
    }

    render() {
        const { signedIn, roundState, disabledMessage, disconnectReason, availableInGameData } = this.props.gameStateContextModel;
        const { isLoaded } = this.state;
        const isDisabledGame = roundState === RoundState.Disabled;

        return (
            <GameContainer>
                {!isLoaded && this.preloadResource()}
                {signedIn && isLoaded ? this.renderGame() : <GameLoading />}
                {(roundState === RoundState.None || !availableInGameData) && (
                    <LoadingSpinner removeSpinner={isDisabledGame || !!disconnectReason} />
                )}
                {this.renderDisableGamePopup(isDisabledGame && !!disabledMessage, disabledMessage)}
                {this.renderConnectFailed(roundState, disconnectReason)}
            </GameContainer>
        );
    }

    private renderConnectFailed(roundState: RoundState, disconnectReason: string): React.ReactNode {
        const { tolgeeNamespace, id } = this.props;

        return (
            roundState === RoundState.ConnectFailed && (
                <ConnectFailedMessage
                    tolgeeNamespace={tolgeeNamespace}
                    id={id}
                    onReconnect={this.retryConnect.bind(this)}
                    reason={disconnectReason}
                    enableBackdrop={true}
                />
            )
        );
    }

    private renderDisableGamePopup(isDisabledGame: boolean, disabledMessage: string): React.ReactNode {
        return isDisabledGame && <DisabledModal disableMessage={disabledMessage} />;
    }
}

GameBase.contextType = PlayerContext;

export default GameBase;
