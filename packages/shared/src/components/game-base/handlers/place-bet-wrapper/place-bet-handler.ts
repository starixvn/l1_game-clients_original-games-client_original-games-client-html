import { TFnType, TranslationKey } from "@tolgee/react";
import { Dispatch } from "react";
import { GameMessageHandler, messageEventType } from "..";
import { NoticeErrorCode } from '@shared/constants/error-code-dictionary';
import {
    GetLocalizedErrorMessage,
    StorageHelper,
    getGlossaryTranslate,
    localStorageKeys,
    broadcastNotice,
} from "@shared/helpers";
import {
    findHedgeBetGroup,
    getAccountBalance,
    isBalanceUnavailable,
    isHedgeBet,
    isInPhasePreventBet,
} from "@shared/helpers/validate-bet-helper";
import { GameStateContextModel } from '@shared/react-contexts/game-state-context/game-state-context-model';
import {
    PlaceBetEventAction,
    PlaceBetEventActionType,
} from "@shared/react-contexts/game-state-context/place-bet-context/place-bet-action";
import { PlaceBetContextModel } from '@shared/react-contexts/game-state-context/place-bet-context/place-bet-context-model';
import { NoticeModel, RoundState } from "../../type";
import { broadcastCloseDialog } from '@shared/helpers/global-events-helper';

export type PlaceBetHandlerProps = {
    tolgeeNamespace: string;
    gameName: string;
    gameMessageHandler: GameMessageHandler;
    translate: TFnType<string, TranslationKey>;
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
    private endPlaceBetHandlerId: any;

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

        this.endPlaceBetHandlerId = this.props.gameMessageHandler.register(messageEventType.END_PLACE_BET, this.handleEndPlaceBet);
    };

    handleRoundState = ({ roundState }) => {
        this.roundState = roundState;
    };

    unregisterEvents = () => {
        this.props.gameMessageHandler.removeHandler(this.endBetHandlerId);
        this.props.gameMessageHandler.removeHandler(this.ownBetsHandlerId);
        this.props.gameMessageHandler.removeHandler(this.finishHandlerId);
        this.props.gameMessageHandler.removeHandler(this.roundStateHandlerId);
        this.props.gameMessageHandler.removeHandler(this.endPlaceBetHandlerId);
    };

    broadcastNotice = (notice: object) => {
        broadcastNotice(notice as any);
    };

    clearNotice = () => {
        broadcastNotice(null);
    };

    handleEndPlaceBet = () => {
        this.clearNotice();
        broadcastCloseDialog();
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

        broadcastNotice(noticePayload);
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

        this.clearRetryInterval();
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

    placeBet = (betChoice: string, amount: number, enabledQuickBet: boolean, gameStateContext: GameStateContextModel) => {
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

        this.handleValidBetChoice(amount, betChoice);
    };

    sendOutstandingBet(betChoice: string, suggestAmount: number) {
        this.sendBetMessage(betChoice, suggestAmount);
    }

    protected handleValidBetChoice = (amount: number, betChoice: string) => {
        if (amount > 0) {
            this.setRetryInterval();
            this.sendBetMessage(betChoice, amount);
        }
    };

    handleProcessingBet = () => {
        this.broadcastNotice({ message: "Common.message_processing_action", duration: 2, adjustBetNoticePosition: true });
    };

    handlePreventBet = (roundState: RoundState) => {
        const isStartingRound = roundState === RoundState.BeforePlaceBet;
        const errorCodeDuringSettlement = NoticeErrorCode.placeBetNextRound;
        const notice = isStartingRound ? this.getNotice(NoticeErrorCode.cannotBet, true) : this.getNotice(errorCodeDuringSettlement, true);

        this.broadcastNotice(notice);
    };

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
