import useGameStore from '@shared/stores/game-store/game-store';
import useBetHistoryStore from '@shared/stores/bet-history-store/bet-history-store';
import usePFStore from '@shared/stores/pf-store/pf-store';
import { GameMessageHandler, messageEventType } from "./game-message-handler";
import { RoundState } from "../type";
import { BetWinCalculatorRegistry } from "@shared/helpers/bet-history/bet-history-calculator";

export type BetHistoryHandlerProps = {
    gameMessageHandler: GameMessageHandler;
    gameId?: string;
};

interface BetResultData {
    result: any;
    settlementResult: any;
    odds: Record<string, number>;
}

export class BetHistoryHandler {
    protected readonly GET_HISTORY = "getHistory";
    protected readonly HISTORY_EVENT = "history";
    protected handlerIds: string[] = [];
    protected lastRoundState: RoundState | null = null;
    protected latestOdds: Record<string, number> = {};
    protected latestFinish: { roundId?: number; result?: any; settlementResult?: any } | null = null;
    protected gameId: string;

    protected shouldUpdateRoundId(currentRoundId: number, pendingRoundId: number | null): boolean {
        return !pendingRoundId || (pendingRoundId !== currentRoundId && pendingRoundId !== null);
    }

    protected calculateBetWin(pendingDetails: any[], resultData: BetResultData): number {
        // Use game-specific calculator from registry
        const calculator = BetWinCalculatorRegistry.getCalculator(this.gameId);
        if (calculator) {
            return calculator.calculateBetWin(pendingDetails, resultData);
        }

        // Fallback to generic calculation
        let betwin = 0;
        for (const detail of pendingDetails) {
            const didWin = !!resultData.settlementResult[detail.choice];
            const betOdds = Number(resultData.odds?.[detail.choice] ?? 0);
            if (didWin && betOdds > 0) {
                betwin += detail.amount * betOdds;
            }
        }
        return betwin;
    }

    protected createBetLog(
        roundId: number,
        totalAmount: number,
        betwin: number,
        pendingDetails: any[],
        firstBetTime: string,
        resultData: BetResultData
    ) {
        // Use client seed from the first pending bet (all bets in a round use same client seed)
        const clientSeed = pendingDetails.length > 0 ? pendingDetails[0].clientSeed : "";

        return {
            freeBet: false,
            roundId,
            phien: roundId,
            appType: 0,
            betwin,
            clientSeed,
            name: "",
            rate: 0,
            time: firstBetTime,
            totalAmount,
            result: resultData.result,
            settlementResult: resultData.settlementResult,
            odds: resultData.odds,
            betLogDetails: pendingDetails.map((d: any) => ({
                freeBet: false,
                amount: d.amount,
                appType: 0,
                time: d.time,
                choice: d.choice,
            })),
        };
    }

    private sendHistoryRequest(page: number) {
        const betHistoryStore = useBetHistoryStore.getState();
        betHistoryStore.setIsLoading(true);
        betHistoryStore.setCurrentPage(page);

        this.props.gameMessageHandler.broadcastGameEvent({
            [messageEventType.SEND_SOCKET_MESSAGE]: {
                event: this.GET_HISTORY,
                data: { page },
            },
        });
    }

    constructor(protected readonly props: BetHistoryHandlerProps) {
        this.gameId = props.gameId || 'generic';
        this.registerHistoryEvents();
    }

    protected registerHistoryEvents() {
        const events = [
            [this.HISTORY_EVENT, this.handleHistoryResponse],
            [messageEventType.ROUND_STATE, this.handleRoundState],
            [messageEventType.OWN_BETS, this.handleOwnBets],
            [messageEventType.ODDS, this.handleOdds],
            [messageEventType.GAME_CONFIG, this.handleGameConfig],
            [messageEventType.FINISH, this.handleFinish],
        ] as const;

        events.forEach(([event, handler]) => {
            const id = this.props.gameMessageHandler.register(event, handler.bind(this));
            this.handlerIds.push(id);
        });
    }

    private handleHistoryResponse(data: any) {
        useBetHistoryStore.getState().registerBetHistoryEvent(data);
    }

    private handleRoundState({ roundState }: { roundState: RoundState }) {
        const isEnteringNewRoundBetting = roundState === RoundState.InRound && this.lastRoundState !== RoundState.InRound && this.lastRoundState !== null;

        if (isEnteringNewRoundBetting) {
            this.flushLocalBetLogIfAny();

            const betHistoryStore = useBetHistoryStore.getState();
            if (betHistoryStore.hasPendingBets()) {
                betHistoryStore.clearPendingBets();
            }
        }

        this.lastRoundState = roundState;
    }



    private handleOwnBets({ ownBets, betChoice, ownChip }: any) {
        const gameStore = useGameStore.getState() as any;
        const betHistoryStore = useBetHistoryStore.getState();
        const nowIso = new Date().toISOString();
        const currentUIRoundId = gameStore.playerResultBoard?.roundId ?? 0;

        if (this.shouldUpdateRoundId(currentUIRoundId, betHistoryStore.pendingBetRoundId)) {
            betHistoryStore.setPendingBetRoundId(currentUIRoundId);
        }

        if (!betHistoryStore.pendingFirstBetTime) {
            betHistoryStore.setPendingFirstBetTime(nowIso);
        }

        if (ownChip && ownChip.amount > 0) {
            const pfStore = usePFStore.getState();
            const clientSeed = pfStore.pfClientSeedSetting?.useManualClientSeed
                ? pfStore.pfClientSeedSetting.manualClientSeed
                : pfStore.pfClientSeedSetting?.randomClientSeed || "";

            const betData = {
                time: nowIso,
                amount: ownChip.amount,
                choice: String(ownChip.betChoice),
                clientSeed,
            };
            betHistoryStore.addPendingBet(betData);
        }
    }

    private handleOdds({ odds }: { odds: Record<string, number> }) {
        this.latestOdds = odds || {};
    }

    private handleGameConfig(data: any) {
        if (data?.gameConfig?.odds) {
            this.latestOdds = { ...this.latestOdds, ...data.gameConfig.odds };
        }
        if (data?.odds) {
            this.latestOdds = { ...this.latestOdds, ...data.odds };
        }
    }

    protected handleFinish({ finish }: any) {
        if (!finish) {
            return;
        }

        const { roundId, result, settlementResult } = finish;
        this.latestFinish = { roundId, result, settlementResult };
    }

    protected flushLocalBetLogIfAny() {
        const gameStore = useGameStore.getState() as any;
        const betHistoryStore = useBetHistoryStore.getState();

        if (!betHistoryStore.hasPendingBets() || !this.latestFinish?.settlementResult) {
            return;
        }

        const pendingDetails = betHistoryStore.pendingBetDetails;
        const totalAmount = pendingDetails.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);

        if (Object.keys(this.latestOdds).length === 0 && gameStore.gameConfigs?.odds) {
            this.latestOdds = gameStore.gameConfigs.odds;
        }

        const resultData: BetResultData = {
            result: this.latestFinish.result,
            settlementResult: this.latestFinish.settlementResult,
            odds: this.latestOdds || {}
        };

        const betwin = this.calculateBetWin(pendingDetails, resultData);
        const actualBettingRoundId = betHistoryStore.pendingBetRoundId || 0;

        const betLog = this.createBetLog(
            actualBettingRoundId,
            totalAmount,
            betwin,
            pendingDetails,
            betHistoryStore.pendingFirstBetTime,
            resultData
        );

        const exists = betHistoryStore.betLogs.some((log: any) => (log?.phien || log?.roundId) === actualBettingRoundId);

        if (!exists && actualBettingRoundId) {
            betHistoryStore.appendBetLogs([betLog], {
                updatePagination: true,
                source: "pending_bet_flush"
            });
        }

        betHistoryStore.clearPendingBets();
        this.resetPendingLocalCache();
    }

    protected resetPendingLocalCache() {
        this.latestFinish = null;
    }

    requestHistory(page = 1) {
        this.sendHistoryRequest(page);
    }

    loadNextPage() {
        const betHistoryStore = useBetHistoryStore.getState();
        const nextPage = betHistoryStore.currentPage + 1;

        if (nextPage <= betHistoryStore.totalPages && betHistoryStore.hasMoreData) {
            this.requestHistory(nextPage);
        }
    }

    loadAllRemainingPages() {
        const betHistoryStore = useBetHistoryStore.getState();
        const { currentPage, serverTotalPages } = betHistoryStore;

        for (let page = currentPage + 1; page <= serverTotalPages; page++) {
            this.requestHistory(page);
        }
    }

    toggleExpanded() {
        const betHistoryStore = useBetHistoryStore.getState();
        const newExpandedState = !betHistoryStore.isExpanded;

        betHistoryStore.setIsExpanded(newExpandedState);

        if (newExpandedState && betHistoryStore.hasMoreData && betHistoryStore.currentPage < betHistoryStore.serverTotalPages) {
            this.loadAllRemainingPages();
        }
    }

    scrollToTop() {
        const scrollWrapper = document.querySelector(".bet-history-scroll-wrapper");
        if (scrollWrapper) {
            scrollWrapper.scrollTop = 0;
        }
    }

    resetHistory() {
        useBetHistoryStore.getState().resetBetHistory();
    }

    cleanup() {
        this.handlerIds.forEach((id) => this.props.gameMessageHandler.removeHandler(id));
        this.handlerIds = [];
    }

    // Utility methods
    getDisplayedBetLogs() {
        return useBetHistoryStore.getState().getDisplayedBetLogs();
    }

    getWinValue(betLog: any) {
        return useBetHistoryStore.getState().getWinValue(betLog);
    }

    isLoading() {
        return useBetHistoryStore.getState().isLoading;
    }

    isExpanded() {
        return useBetHistoryStore.getState().isExpanded;
    }

    hasMultiplePages() {
        return useBetHistoryStore.getState().totalPages > 1;
    }
}
