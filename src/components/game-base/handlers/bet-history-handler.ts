import useGameStore from "../../../_shared/stores/game-store/game-store";
import { GameMessageHandler, messageEventType } from "./game-message-handler";
import { RoundState } from "../type";

export type BetHistoryHandlerProps = {
    gameMessageHandler: GameMessageHandler;
};

export class BetHistoryHandler {
    private readonly GET_HISTORY = "getHistory";
    private readonly HISTORY_EVENT = "history";
    private handlerIds: string[] = [];
    private lastRoundState: RoundState | null = null;
    private pendingBetLogDetails: Array<{ time: string; amount: number; choice: string }> = [];
    private firstBetReceivedTime: string | null = null;
    private latestOdds: Record<string, number> = {};
    private latestFinish: { drawId?: number; result?: any; settlementResult?: any } | null = null;
    private bettingRoundId: number | null = null;

    constructor(private readonly props: BetHistoryHandlerProps) {
        this.registerHistoryEvents();
    }

    private registerHistoryEvents() {
        const events = [
            [this.HISTORY_EVENT, this.handleHistoryResponse],
            [messageEventType.ROUND_STATE, this.handleRoundState],
            [messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED, this.handleOutgoingBet],
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
        useGameStore.getState().registerBetHistoryEvent(data);
    }

    private handleRoundState({ roundState }: { roundState: RoundState }) {
        const isEnteringNewRoundBetting = 
            roundState === RoundState.InRound && 
            this.lastRoundState !== RoundState.InRound;

        if (isEnteringNewRoundBetting) {
            this.flushLocalBetLogIfAny();
        }

        this.lastRoundState = roundState;
    }

    private handleOutgoingBet(message: any) {
        const payload = message?.[messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED];
        if (!payload || payload.event !== "bet") {
            return;
        }

        // Capture the round ID from the UI when placing first bet
        if (this.bettingRoundId === null) {
            const store = useGameStore.getState() as any;
            this.bettingRoundId = store.playerResultBoard?.roundId ?? 0;
        }

        const nowIso = new Date().toISOString();
        if (!this.firstBetReceivedTime) {
            this.firstBetReceivedTime = nowIso;
        }

        const data = payload.data || {};
        
        // Handle multiple bet formats
        if (data.betChoices && typeof data.betChoices === "object") {
            Object.entries(data.betChoices).forEach(([choice, amount]) => {
                if (Number(amount) > 0) {
                    this.pendingBetLogDetails.push({ time: nowIso, amount: Number(amount), choice });
                }
            });
        } else if (data.betChoice && data.amount > 0) {
            this.pendingBetLogDetails.push({ 
                time: nowIso, 
                amount: data.amount, 
                choice: String(data.betChoice) 
            });
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

    private handleFinish({ finish }: any) {
        if (!finish) {
            return;
        }
        
        const { drawId, result, settlementResult } = finish;
        this.latestFinish = { drawId, result, settlementResult };
    }

    private flushLocalBetLogIfAny() {
        if (!this.pendingBetLogDetails.length) {
            this.resetPendingLocalCache();
            return;
        }

        const store = useGameStore.getState() as any;
        const totalAmount = this.pendingBetLogDetails.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        
        // Get odds from store if not available locally
        if (Object.keys(this.latestOdds).length === 0 && store.gameConfigs?.odds) {
            this.latestOdds = store.gameConfigs.odds;
        }

        // Calculate total winnings
        let betwin = 0;
        if (this.latestFinish?.settlementResult && this.latestOdds) {
            for (const detail of this.pendingBetLogDetails) {
                const didWin = !!this.latestFinish.settlementResult[detail.choice];
                const odds = Number(this.latestOdds?.[detail.choice] ?? 0);
                if (didWin && odds > 0) {
                    betwin += detail.amount * odds;
                }
            }
        }

        // Use the betting round ID captured when first bet was placed
        const actualBettingRoundId = this.bettingRoundId || store.playerResultBoard?.roundId || 0;
        
        const betLog = {
            freeBet: false,
            roundId: actualBettingRoundId,
            phien: actualBettingRoundId,
            appType: 0,
            betwin,
            clientSeed: "",
            even: 0,
            name: "",
            odd: 0,
            rate: 0,
            red2: 0,
            red3: 0,
            red4: 0,
            time: this.firstBetReceivedTime,
            totalAmount,
            white3: 0,
            white4: 0,
            drawId: this.latestFinish?.drawId,
            result: this.latestFinish?.result,
            settlementResult: this.latestFinish?.settlementResult,
            odds: this.latestOdds || {},
            betLogDetails: this.pendingBetLogDetails.map((d) => ({
                freeBet: false,
                amount: d.amount,
                appType: 0,
                time: d.time,
                choice: d.choice,
            })),
        };

        // Check if this round already exists to avoid duplicates
        const existing = (store.betLogs || []) as any[];
        const exists = existing.some((log) => 
            (log?.phien || log?.roundId || log?.drawId) === actualBettingRoundId
        );

        if (!exists && actualBettingRoundId) {
            store.appendBetLogs([betLog]);
        }

        // Reset for next round
        this.resetPendingLocalCache();
    }

    private resetPendingLocalCache() {
        this.pendingBetLogDetails = [];
        this.firstBetReceivedTime = null;
        this.latestFinish = null;
        this.bettingRoundId = null;
    }

    requestHistory(page = 1) {
        const store = useGameStore.getState();

        store.setIsLoading(true);
        store.setCurrentPage(page);

        this.props.gameMessageHandler.broadcastGameEvent({
            [messageEventType.SEND_SOCKET_MESSAGE]: {
                event: this.GET_HISTORY,
                data: { page }
            }
        });
    }

    loadNextPage() {
        const store = useGameStore.getState();
        const nextPage = store.currentPage + 1;

        if (nextPage <= store.totalPages && store.hasMoreData) {
            this.requestHistory(nextPage);
        }
    }

    loadAllRemainingPages() {
        const store = useGameStore.getState();
        const { currentPage, totalPages } = store;

        for (let page = currentPage + 1; page <= totalPages; page++) {
            this.requestHistory(page);
        }
    }

    toggleExpanded() {
        const store = useGameStore.getState();
        const newExpandedState = !store.isExpanded;

        store.setIsExpanded(newExpandedState);

        if (newExpandedState && store.hasMoreData && store.currentPage < store.totalPages) {
            this.loadAllRemainingPages();
        }
    }

    scrollToTop() {
        const scrollWrapper = document.querySelector('.bet-history-scroll-wrapper');
        if (scrollWrapper) {
            scrollWrapper.scrollTop = 0;
        }
    }

    resetHistory() {
        const store = useGameStore.getState();
        store.resetBetHistory();
    }

    cleanup() {
        this.handlerIds.forEach((id) => this.props.gameMessageHandler.removeHandler(id));
        this.handlerIds = [];
    }

    // Utility methods
    getDisplayedBetLogs() {
        return useGameStore.getState().getDisplayedBetLogs();
    }

    getWinValue(betLog: any) {
        return useGameStore.getState().getWinValue(betLog);
    }

    isLoading() {
        return useGameStore.getState().isLoading;
    }

    isExpanded() {
        return useGameStore.getState().isExpanded;
    }

    hasMultiplePages() {
        return useGameStore.getState().totalPages > 1;
    }
}
