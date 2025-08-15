import { DefaultParamType, TFnType, TranslationKey } from "@tolgee/react";
import { Dispatch } from "react";
import { GameMessageHandler, messageEventType } from "..";
import { confirmBet } from "../../../../_shared/constants";
import { NoticeErrorCode } from "../../../../_shared/constants/error-code-dictionary";
import { GetLocalizedErrorMessage, StorageHelper, getGlossaryTranslate, localStorageKeys } from "../../../../_shared/helpers";
import { GlobalMessageTransmitter, GlobalTransmitterEvent } from "../../../../_shared/helpers/message-transmitter/global-transmitter";
import {
    IAvailableSuggestBetAmount,
    findHedgeBetGroup,
    getAccountBalance,
    getCriteriaValidateBet,
    isBalanceUnavailable,
    isHedgeBet,
    isInPhasePreventBet,
} from "../../../../_shared/helpers/validate-bet-helper";
import { SystemContextModel } from "../../../../_shared/react-contexts";
import { GameStateContextModel } from "../../../../_shared/react-contexts/game-state-context/game-state-context-model";
import {
    PlaceBetEventAction,
    PlaceBetEventActionType,
} from "../../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-action";
import { PlaceBetContextModel } from "../../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context-model";
import { NoticeModel, RoundState, SuggestBet } from "../../type";

export type PlaceBetHandlerProps = {
    tolgeeNamespace: string;
    gameName: string;
    gameMessageHandler: GameMessageHandler;
    translate: TFnType<DefaultParamType, string, TranslationKey>;
    playPlaceBetSound?: Function;
    hedgeBetGroups: string[][];
    getPlayerBalance: Function;
    gameId: number;
    signOut?: Function;
    // Controls how bet payloads are sent to the service
    betPayloadFormat?: "map" | "single"; // default: map
};

export class PlaceBetHandler {
    private retryInterval: NodeJS.Timeout;
    private placeBetDispatch: Dispatch<PlaceBetEventAction>;
    private placeBetContext: PlaceBetContextModel;

    private endBetHandlerId: any;
    private ownBetsHandlerId: any;
    private finishHandlerId: string;
    private roundStateHandlerId: any;
    private isProcessingBet: boolean;
    private roundState: RoundState = RoundState.None;
    private isFirstOwnBetHandler = false;

    constructor(public readonly props: PlaceBetHandlerProps) {
        this.isProcessingBet = false;
    }

    setPlaceBetDispatch = (dispatch: Dispatch<PlaceBetEventAction>) => {
        this.placeBetDispatch = dispatch;
    };

    getPlaceBetDispatch = () => {
        return this.placeBetDispatch;
    };

    registerEvents = (signOut: () => void, placeBetContext: PlaceBetContextModel) => {
        this.placeBetContext = placeBetContext;
        this.isFirstOwnBetHandler = true;
        this.roundState = RoundState.None;

        this.endBetHandlerId = this.props.gameMessageHandler.register(messageEventType.END_BET, (gameMessage) => {
            this.handleEndBet(gameMessage, signOut, placeBetContext);
        });

        this.ownBetsHandlerId = this.props.gameMessageHandler.register(messageEventType.OWN_BETS, this.handleOwnBets);
        this.finishHandlerId = this.props.gameMessageHandler.register(messageEventType.FINISH, () => {
            this.clearRetryInterval();
            this.isProcessingBet = false;
        });

        this.roundStateHandlerId = this.props.gameMessageHandler.register(messageEventType.ROUND_STATE, this.handleRoundState.bind(this));
    };

    handleRoundState = ({ roundState }) => {
        this.roundState = roundState;
    };

    unregisterEvents = () => {
        this.props.gameMessageHandler.removeHandler(this.endBetHandlerId);
        this.props.gameMessageHandler.removeHandler(this.ownBetsHandlerId);
        this.props.gameMessageHandler.removeHandler(this.finishHandlerId);
        this.props.gameMessageHandler.removeHandler(this.roundStateHandlerId);
    };

    broadcastNotice = (notice: object) => {
        GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.NOTICE]: notice });
    };

    clearNotice = () => {
        this.broadcastNotice(null);
    };

    handleOwnBets = ({ ownBets }) => {
        this.props.gameMessageHandler.broadcastGameEvent({ [messageEventType.SYNC_OWN_BETS_TO_PF]: ownBets });

        if (this.isFirstOwnBetHandler && [RoundState.None, RoundState.SwitchRound, RoundState.BeforePlaceBet].includes(this.roundState)) {
            this.isFirstOwnBetHandler = false;
            return;
        }

        this.placeBetDispatch({ type: PlaceBetEventActionType.OWN_BETS, payload: { ownBets } });
    };

    handleBetFailed = ({ notice, kickedOut }, signOut: () => void) => {
        const isDisabledAccount = kickedOut?.isDisabledAccount;
        const noticePayload = this.getNoticePayloadBetFailed(notice, kickedOut);

        noticePayload.gameName = this.props.gameName;
        if (isDisabledAccount) {
            noticePayload.onClose = signOut;
            noticePayload.duration = 10;
            noticePayload.roundId = 0;
        } else {
            noticePayload.duration = 3;
            noticePayload.minBet = notice?.minBet;
            noticePayload.maxBet = notice?.maxBet;
            noticePayload.roundId = notice?.gameRoundId;
        }

        GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.NOTICE]: noticePayload });
    };

    getNoticePayloadBetFailed = (notice: NoticeModel, kickedOut: any) => {
        const errorCode = kickedOut?.isDisabledAccount ? kickedOut.errorCode : notice.errorCode;

        const hedgeBetGroup = notice?.hedgeBetGroup;
        const betChoice = hedgeBetGroup ? hedgeBetGroup[0] : undefined;

        return this.getNotice(errorCode, false, betChoice, notice);
    };

    handleEndBet = ({ endBet, ownBets, notice, kickedOut, apiError }, signOut: () => void, placeBetContext: PlaceBetContextModel) => {
        const { playPlaceBetSound, gameMessageHandler } = this.props;
        const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? true;
        this.isProcessingBet = false;
        this.clearNotice();

        this.clearRetryInterval();
        GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.CLOSE_DIALOG]: {} });
        if (endBet === -1) {
            !apiError && this.handleBetFailed({ notice, kickedOut }, signOut);
        } else {
            enableSound && playPlaceBetSound();
            this.placeBetDispatch({
                type: PlaceBetEventActionType.OWN_BETS,
                payload: { ownBets },
            });
            gameMessageHandler.broadcastGameEvent({ [messageEventType.UPDATE_PLAYER_BALANCE]: {} });

        }

        this.placeBetDispatch({
            type: PlaceBetEventActionType.SHOW_CONFIRM_BET,
            payload: { showConfirmBet: false },
        });

        this.placeBetDispatch({
            type: PlaceBetEventActionType.NOT_CONFIRM_OWN_BETS,
            payload: { notConfirmOwnBets: {} },
        });
    };

    placeBet = (
        betChoice: string,
        amount: number,
        enabledQuickBet: boolean,
        gameStateContext: GameStateContextModel,
        systemContext: SystemContextModel
    ) => {
        if (isInPhasePreventBet(gameStateContext.roundState)) {
            this.handlePreventBet(gameStateContext.roundState);
            return;
        }

        if (this.isProcessingBet) {
            this.handleProcessingBet();
            return;
        }

        if (
            isBalanceUnavailable(
                getAccountBalance(this.props.getPlayerBalance()),
                amount,
                gameStateContext,
                this.placeBetContext.notConfirmOwnBets,
                enabledQuickBet
            )
        ) {
            this.broadcastNotice(this.getNotice(NoticeErrorCode.notEnoughMoney));
            return;
        }

        if (isHedgeBet(findHedgeBetGroup(this.props?.hedgeBetGroups, betChoice), betChoice, amount, this.placeBetContext?.ownBets)) {
            this.broadcastNotice(this.getNotice(NoticeErrorCode.hedgeBet, true, betChoice));
            return;
        }

        this.handleBetValidation(this.placeBetContext, gameStateContext, betChoice, amount, enabledQuickBet, systemContext);
    };

    protected handleBetValidation = (
        placeBetContext: PlaceBetContextModel,
        gameStateContext: GameStateContextModel,
        betChoice: string,
        amount: number,
        enabledQuickBet: boolean,
        systemContext: SystemContextModel
    ) => {
        const criteriaValidateBet = getCriteriaValidateBet(
            gameStateContext,
            this.placeBetContext,
            betChoice,
            amount,
            getAccountBalance(this.props.getPlayerBalance()),
            enabledQuickBet
        );

        if (criteriaValidateBet?.errorCode === NoticeErrorCode.validBet) {
            this.handleValidBetChoice(enabledQuickBet, amount, betChoice, placeBetContext, systemContext);
            return;
        }

        if (criteriaValidateBet?.errorCode === NoticeErrorCode.suggestBet) {
            this.suggestBetAmount(betChoice, criteriaValidateBet?.args as IAvailableSuggestBetAmount);
            return;
        }

        this.broadcastNotice(this.getNotice(criteriaValidateBet?.errorCode, false, betChoice, criteriaValidateBet?.args));
    };

    suggestBetAmount = (betChoice: string, availableSuggestBet: IAvailableSuggestBetAmount) => {
        this.showConfirmDialog();
        const suggestBet: SuggestBet = {
            currentBetChoice: betChoice,
            suggestBetAmount: availableSuggestBet?.suggestAmount,
            sendOutstandingBet: () => this.sendOutstandingBet(betChoice, availableSuggestBet?.suggestAmount),
            isInsufficientFunds: availableSuggestBet?.isInsufficientFunds,
        };

        this.placeBetDispatch({
            type: PlaceBetEventActionType.SUGGEST_BET,
            payload: { suggestBet },
        });
    };

    sendOutstandingBet(betChoice: string, suggestAmount: number) {
        this.sendBetMessage(betChoice, suggestAmount);
    }

    protected handleValidBetChoice = (
        enabledQuickBet: boolean,
        amount: number,
        betChoice: string,
        placeBetContext: PlaceBetContextModel,
        systemContext: SystemContextModel
    ) => {
        if (enabledQuickBet) {
            this.updateNotConfirmedBetState(placeBetContext.notConfirmOwnBets, betChoice, systemContext);
            this.handleEnabledQuickBet(amount, betChoice);
        } else {
            if (betChoice === confirmBet) {
                this.sendConfirmBet(placeBetContext.notConfirmOwnBets);
                return;
            }

            const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? true;
            enableSound && this.props.playPlaceBetSound();

            this.showConfirmBet(placeBetContext);
            this.updateNotConfirmedBetState(placeBetContext.notConfirmOwnBets, betChoice, systemContext);
        }
    };

    handleProcessingBet = () => {
        this.broadcastNotice({ message: "Common.message_processing_action", duration: 2, adjustBetNoticePosition: true });
    };

    sendConfirmBet(notConfirmOwnBets: object) {
        const entries = Object.entries(notConfirmOwnBets);
        if ((this.props.betPayloadFormat ?? "map") === "single") {
            // Send one bet message per choice with amount
            entries.forEach(([choice, amount]) => {
                this.props.gameMessageHandler.broadcastGameEvent({
                    [messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED]: {
                        event: "bet",
                        data: { amount, betChoice: String(choice).toLowerCase(), __pfMode: "clientSeedOnly" },
                    },
                });
            });
        } else {
            const betChoices = {} as Record<string, number>;
            entries.forEach(([key, value]) => {
                betChoices[key] = value as number;
            });

            this.props.gameMessageHandler.broadcastGameEvent({
                [messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED]: { event: "bet", data: { betChoices } },
            });
        }
    }

    updateNotConfirmedBetState(notConfirmOwnBets: object, betChoice: string, systemContext: SystemContextModel) {
        notConfirmOwnBets[betChoice] = (notConfirmOwnBets[betChoice] ?? 0) + systemContext.selectedChip;
        this.placeBetDispatch({
            type: PlaceBetEventActionType.NOT_CONFIRM_OWN_BETS,
            payload: { notConfirmOwnBets },
        });
    }

    handlePreventBet = (roundState: RoundState) => {
        const isStartingRound = roundState === RoundState.BeforePlaceBet;
        const errorCodeDuringSettlement = NoticeErrorCode.placeBetNextRound;
        const notice = isStartingRound ? this.getNotice(NoticeErrorCode.cannotBet, true) : this.getNotice(errorCodeDuringSettlement, true);

        this.broadcastNotice(notice);
    };

    showConfirmDialog = () => {
        this.placeBetDispatch({
            type: PlaceBetEventActionType.SHOW_CONFIRM_DIALOG,
            payload: { showConfirmDialog: true },
        });
    };

    showConfirmBet(placeBetContextModel: PlaceBetContextModel) {
        !placeBetContextModel.showConfirmBet &&
            this.placeBetDispatch({
                type: PlaceBetEventActionType.SHOW_CONFIRM_BET,
                payload: { showConfirmBet: true },
            });
    }

    handleEnabledQuickBet(amount: number, betChoice: string) {
        if (amount > 0) {
            this.setRetryInterval();
            this.sendBetMessage(betChoice, amount);
        }
    }

    protected getNotice = (errorCode: string, adjustBetNoticePosition = false, betChoice?: string, args?: object): NoticeModel => {
        let betChoice1 = "";
        let betChoice2 = "";

        const hedgeBetGroup = this.props.hedgeBetGroups.find((group) => group.includes(betChoice));
        if (betChoice && hedgeBetGroup) {
            betChoice1 = this.props.translate(getGlossaryTranslate(this.props.tolgeeNamespace, hedgeBetGroup[0]));
            betChoice2 = this.props.translate(getGlossaryTranslate(this.props.tolgeeNamespace, hedgeBetGroup[1]));
        }

        const gameErrorCode = this.isReachRoundMaxBet(errorCode) ? NoticeErrorCode.roundMaxBet : errorCode;

        return {
            gameName: this.props.gameName,
            message: GetLocalizedErrorMessage(gameErrorCode),
            duration: 2,
            errorCode: gameErrorCode,
            betChoice1,
            betChoice2,
            adjustBetNoticePosition,
            ...args,
        };
    };

    private isReachRoundMaxBet(errorCode: string) {
        return errorCode === NoticeErrorCode.drawMaxBet;
    }

    protected sendBetMessage(betChoice: string, amount: number) {
        this.isProcessingBet = true;
        if ((this.props.betPayloadFormat ?? "map") === "single") {
            this.props.gameMessageHandler.broadcastGameEvent({
                [messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED]: {
                    event: "bet",
                    data: { amount, betChoice: betChoice.toLowerCase(), __pfMode: "clientSeedOnly" },
                },
            });
        } else {
            this.props.gameMessageHandler.broadcastGameEvent({
                [messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED]: {
                    event: "bet",
                    data: { betChoices: { [betChoice.toLowerCase()]: amount } },
                },
            });
        }
    }

    setRetryInterval = () => {
        this.clearRetryInterval();

        this.retryInterval = setInterval(() => {
            this.props.gameMessageHandler.broadcastGameEvent({ [messageEventType.SEND_SOCKET_MESSAGE]: { event: "retry" } });
        }, 3 * 1000);
    };

    clearRetryInterval = () => {
        clearInterval(this.retryInterval);
    };
}
