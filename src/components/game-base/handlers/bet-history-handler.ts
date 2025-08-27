import useGameStore from "../../../_shared/stores/game-store/game-store";
import useBetHistoryStore from "../../../_shared/stores/bet-history-store/bet-history-store";
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
    private latestOdds: Record<string, number> = {};
    private latestFinish: { roundId?: number; result?: any; settlementResult?: any } | null = null;

    constructor(private readonly props: BetHistoryHandlerProps) {
        this.registerHistoryEvents();
    }

    private registerHistoryEvents() {
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
        const isEnteringNewRoundBetting = roundState === RoundState.InRound && this.lastRoundState !== RoundState.InRound;

        if (isEnteringNewRoundBetting) {
            const gameStore = useGameStore.getState() as any;
            const betHistoryStore = useBetHistoryStore.getState();
            
            // Flush any pending bets from the previous round first
            this.flushLocalBetLogIfAny();
            
            // Clear any stale pending bet data for the new round
            // This ensures we start fresh for the current betting round
            const hadPendingData = betHistoryStore.hasPendingBets();
            if (hadPendingData) {
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

        // Always capture/update the round ID from the UI for each bet
        // This ensures we get the correct current round ID
        if (!betHistoryStore.pendingBetRoundId || betHistoryStore.pendingBetRoundId !== currentUIRoundId) {
            betHistoryStore.setPendingBetRoundId(currentUIRoundId);
        }

        // Set first bet time if not already set
        if (!betHistoryStore.pendingFirstBetTime) {
            betHistoryStore.setPendingFirstBetTime(nowIso);
        }

        // Process the bet from ownChip (this contains the actual bet placed)
        if (ownChip && ownChip.amount > 0) {
            betHistoryStore.addPendingBet({
                time: nowIso,
                amount: ownChip.amount,
                choice: String(ownChip.betChoice),
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

        const { roundId, result, settlementResult } = finish;
        this.latestFinish = { roundId, result, settlementResult };
    }

    private flushLocalBetLogIfAny() {
        const gameStore = useGameStore.getState() as any;
        const betHistoryStore = useBetHistoryStore.getState();

        if (!betHistoryStore.hasPendingBets()) {
            return;
        }

        // Important: Only flush if we have settlement data from the previous round
        // This ensures we wait for the round to finish before calculating wins
        if (!this.latestFinish?.settlementResult) {
            return;
        }

        const pendingDetails = betHistoryStore.pendingBetDetails;
        const totalAmount = pendingDetails.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);

        // Get odds from game store if not available locally
        if (Object.keys(this.latestOdds).length === 0 && gameStore.gameConfigs?.odds) {
            this.latestOdds = gameStore.gameConfigs.odds;
        }

        // Calculate total winnings using settlement data
        let betwin = 0;
        if (this.latestFinish?.settlementResult && this.latestOdds) {
            for (const detail of pendingDetails) {
                const didWin = !!this.latestFinish.settlementResult[detail.choice];
                const odds = Number(this.latestOdds?.[detail.choice] ?? 0);
                if (didWin && odds > 0) {
                    betwin += detail.amount * odds;
                }
            }
        }

        const actualBettingRoundId = betHistoryStore.pendingBetRoundId || 0;

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
            time: betHistoryStore.pendingFirstBetTime,
            totalAmount,
            white3: 0,
            white4: 0,
            result: this.latestFinish?.result,
            settlementResult: this.latestFinish?.settlementResult,
            odds: this.latestOdds || {},
            betLogDetails: pendingDetails.map((d: any) => ({
                freeBet: false,
                amount: d.amount,
                appType: 0,
                time: d.time,
                choice: d.choice,
            })),
        };

        // Check if this round already exists to avoid duplicates
        const exists = betHistoryStore.betLogs.some((log: any) => (log?.phien || log?.roundId) === actualBettingRoundId);

        if (!exists && actualBettingRoundId) {
            betHistoryStore.appendBetLogs([betLog]);
        }

        betHistoryStore.clearPendingBets();
        this.resetPendingLocalCache();
    }

    private resetPendingLocalCache() {
        this.latestFinish = null;
    }

    requestHistory(page = 1) {
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

    loadNextPage() {
        const betHistoryStore = useBetHistoryStore.getState();
        const nextPage = betHistoryStore.currentPage + 1;

        if (nextPage <= betHistoryStore.totalPages && betHistoryStore.hasMoreData) {
            this.requestHistory(nextPage);
        }
    }

    loadAllRemainingPages() {
        const betHistoryStore = useBetHistoryStore.getState();
        const { currentPage, totalPages } = betHistoryStore;

        for (let page = currentPage + 1; page <= totalPages; page++) {
            this.requestHistory(page);
        }
    }

    toggleExpanded() {
        const betHistoryStore = useBetHistoryStore.getState();
        const newExpandedState = !betHistoryStore.isExpanded;

        betHistoryStore.setIsExpanded(newExpandedState);

        if (newExpandedState && betHistoryStore.hasMoreData && betHistoryStore.currentPage < betHistoryStore.totalPages) {
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
        const betHistoryStore = useBetHistoryStore.getState();
        betHistoryStore.resetBetHistory();
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
