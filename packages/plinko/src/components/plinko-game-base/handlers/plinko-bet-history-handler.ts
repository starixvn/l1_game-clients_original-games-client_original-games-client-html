import { BetHistoryHandler, BetHistoryHandlerProps } from "@shared/components/game-base/handlers/bet-history-handler";
import { messageEventType } from "@shared/components/game-base/handlers/game-message-handler";
import useBetHistoryStore from "@shared/stores/bet-history-store/bet-history-store";
import usePFStore from "@shared/stores/pf-store/pf-store";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";

export class PlinkoBetHistoryHandler extends BetHistoryHandler {
    // Override to include winAmount and reachMaxWin support
    protected latestFinish: {
        roundId: number;
        result?: any;
        settlementResult?: any;
        winAmount: number;
        amount: number;
        reachMaxWin?: boolean;
        odds?: any;
    } | null = null;

    // Plinko-specific state for rolling window display
    private loadedServerPages: Set<number> = new Set(); // Track loaded server pages
    private expandedLoadedPages: Set<number> = new Set(); // Track pages loaded during expanded state

    // Track finished ball round IDs to handle multiple concurrent balls
    private finishedRoundIds: Set<number> = new Set();

    // Track pending bets by round ID (since Plinko has one round per ball)
    private pendingBetsByRound: Map<number, any[]> = new Map();

    // Track if we've switched to server pagination mode
    private hasSwitchedToServerMode: boolean = false;

    private unsubscribeFinishedBall: (() => void) | null = null;

    constructor(props: BetHistoryHandlerProps) {
        super(props);
        this.setupFinishedBallSubscription();
    }

    private setupFinishedBallSubscription() {
        this.unsubscribeFinishedBall = usePlinkoGameStore.subscribe(
            (state) => state.finishedBall,
            (finishedBall, previousFinishedBall) => {
                console.log("PlinkoBetHistoryHandler: finishedBall changed", finishedBall);
                if (finishedBall && finishedBall.roundId !== previousFinishedBall?.roundId) {
                    // Track this round ID as finished
                    this.finishedRoundIds.add(finishedBall.roundId);
                    console.log("PlinkoBetHistoryHandler: Added round ID to finished set:", finishedBall.roundId);
                    
                    // Check if we can flush any pending bets for finished balls
                    this.checkAndFlushFinishedBets();
                }
            }
        );
    }

    private checkAndFlushFinishedBets() {
        // Check each finished round ID against our pending bets
        const finishedRoundIdsArray = Array.from(this.finishedRoundIds);
        for (const finishedRoundId of finishedRoundIdsArray) {
            if (this.pendingBetsByRound.has(finishedRoundId)) {
                console.log("PlinkoBetHistoryHandler: Flushing bet for finished round ID:", finishedRoundId);
                this.flushBetLogForRound(finishedRoundId);
                
                // Remove from both maps after processing
                this.pendingBetsByRound.delete(finishedRoundId);
                this.finishedRoundIds.delete(finishedRoundId);
            }
        }
    }

    private flushBetLogForRound(roundId: number) {
        const betHistoryStore = useBetHistoryStore.getState();
        const pendingBets = this.pendingBetsByRound.get(roundId);
        
        if (!pendingBets || pendingBets.length === 0 || !this.latestFinish?.settlementResult) {
            return;
        }

        const totalAmount = pendingBets.reduce((sum: number, bet: any) => sum + (Number(bet.amount) || 0), 0);
        const { winAmount: betwin } = this.latestFinish;

        const resultData = {
            result: this.latestFinish.result,
            settlementResult: this.latestFinish.settlementResult,
            odds: this.latestFinish.odds || {}, // Use odds from endBet event
        };

        const betLog = this.createPlinkoBetLog(
            roundId,
            totalAmount,
            betwin,
            pendingBets,
            pendingBets[0]?.time, // Use first bet's time
            resultData
        );

        const exists = betHistoryStore.betLogs.some((log: any) => (log?.phien || log?.roundId) === roundId);

        if (!exists) {
            betHistoryStore.appendBetLogs([betLog], {
                updatePagination: true,
                source: "pending_bet_flush",
            });
        }
    }

    protected registerHistoryEvents() {
        super.registerHistoryEvents();

        // Register Plinko-specific endBet event
        const endBetId = this.props.gameMessageHandler.register(messageEventType.END_BET, this.handleEndBet.bind(this));
        this.handlerIds.push(endBetId);

        const historyHandlerId = this.props.gameMessageHandler.register("history", this.handlePlinkoHistoryResponse.bind(this));
        this.handlerIds.push(historyHandlerId);
    }

    private handlePlinkoHistoryResponse(data: any) {
        const betHistoryStore = useBetHistoryStore.getState();

        if (data.history) {
            const { history } = data;

            if (history.page === 1 && history.betLogs?.length > 0) {
                const normalizedServerLogs = history.betLogs.map((log: any) => ({
                    ...log,
                    betwin: log.betWin || log.betwin || 0,
                }));

                betHistoryStore.setBetLogs(sortByRoundDesc(normalizedServerLogs));

                if (betHistoryStore.isExpanded && betHistoryStore.serverTotalPages > 1) {
                    this.loadNextTwoPages();
                }
            } else {
                betHistoryStore.registerBetHistoryEvent(data);
            }

            this.trackLoadedPage(data);
        }
    }

    private trackLoadedPage(data: any) {
        if (data.history?.page) {
            const pageNumber = data.history.page;
            this.loadedServerPages.add(pageNumber);

            const betHistoryStore = useBetHistoryStore.getState();
            if (betHistoryStore.isExpanded) {
                this.expandedLoadedPages.add(pageNumber);
            }
        }
    }

    protected handleFinish({ finish }: any) {
        if (!finish) {
            return;
        }

        const { roundId, result, settlementResult, winAmount, amount, reachMaxWin, odds } = finish;
        this.latestFinish = {
            roundId: Number(roundId) || 0,
            result,
            settlementResult,
            winAmount: Number(winAmount) || 0,
            amount: Number(amount) || 0,
            reachMaxWin: Boolean(reachMaxWin),
            odds,
        };
    }

    private handleEndBet(action: any) {
        if (action?.finish) {
            // Extract bet data from endBet message (Plinko doesn't send separate ownBets)
            this.addPlinkoBetToPending(action);
            
            // Process the finish data
            this.handleFinish({ finish: action.finish });

            // Flush immediately for now (will flush when ball disappear later)
            //this.flushLocalBetLogIfAny();
        }
    }

    private addPlinkoBetToPending(action: any) {
        const pfStore = usePFStore.getState();
        const roundId = this.latestFinish.roundId;
        const betAmount = this.latestFinish.amount;

        if (betAmount > 0) {
            const clientSeed = pfStore.pfClientSeedSetting?.useManualClientSeed
                ? pfStore.pfClientSeedSetting.manualClientSeed
                : pfStore.pfClientSeedSetting?.randomClientSeed || "";

            const betData = {
                time: action.finish.time,
                amount: betAmount,
                choice: `plinko-${action.ownBets.gameMode}-${action.ownBets.numberOfRows}`,
                clientSeed,
                roundId: roundId, // Include round ID for tracking
            };
            
            // Store this bet for the specific round ID
            if (!this.pendingBetsByRound.has(roundId)) {
                this.pendingBetsByRound.set(roundId, []);
            }
            this.pendingBetsByRound.get(roundId)!.push(betData);
            
            console.log("PlinkoBetHistoryHandler: Added pending bet for round", roundId, betData);
        }
    }

    protected flushBetLogIfAny(roundId: number) {
        const betHistoryStore = useBetHistoryStore.getState();

        if (!betHistoryStore.hasPendingBets() || !this.latestFinish?.settlementResult) {
            return;
        }

        const pendingDetails = betHistoryStore.pendingBetDetails;
        const totalAmount = pendingDetails.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);

        const { winAmount: betwin } = this.latestFinish;

        const resultData = {
            result: this.latestFinish.result,
            settlementResult: this.latestFinish.settlementResult,
            odds: this.latestFinish.odds || {}, // Use odds from endBet event
        };

        const betLog = this.createPlinkoBetLog(
            roundId,
            totalAmount,
            betwin,
            pendingDetails,
            betHistoryStore.pendingFirstBetTime,
            resultData
        );
        const exists = betHistoryStore.betLogs.some((log: any) => (log?.phien || log?.roundId) === roundId);

        if (!exists) {
            betHistoryStore.appendBetLogs([betLog], {
                updatePagination: true,
                source: "pending_bet_flush",
            });

            const updatedBetLogs = betHistoryStore.betLogs;
            if (updatedBetLogs.length >= 10 && !this.hasSwitchedToServerMode) {
                this.hasSwitchedToServerMode = true;
            }
        }

        betHistoryStore.clearPendingBets();
        this.resetPendingLocalCache();
    }

    protected createPlinkoBetLog(
        roundId: number,
        totalAmount: number,
        betwin: number,
        pendingDetails: any[],
        firstBetTime: string,
        resultData: any
    ) {
        const baseBetLog = super.createBetLog(roundId, totalAmount, betwin, pendingDetails, firstBetTime, resultData);

        // Add reachMaxWin flag to the bet log
        return {
            ...baseBetLog,
            reachMaxWin: this.latestFinish?.reachMaxWin || false,
        };
    }

    resetHistory() {
        super.resetHistory();
        this.loadedServerPages.clear();
        this.expandedLoadedPages.clear();
        this.finishedRoundIds.clear();
        this.pendingBetsByRound.clear();
        this.hasSwitchedToServerMode = false;
    }

    resetLoadedPages() {
        const betHistoryStore = useBetHistoryStore.getState();

        this.expandedLoadedPages.clear();

        if (betHistoryStore.serverTotalPages > 0) {
            const page1Logs = betHistoryStore.betLogs.slice(0, 10);
            betHistoryStore.setBetLogs(page1Logs);
        }

        betHistoryStore.setCurrentPage(1);
        const hasMorePages = betHistoryStore.serverTotalPages > 1;
        betHistoryStore.setHasMoreData(hasMorePages);
    }

    expand() {
        const betHistoryStore = useBetHistoryStore.getState();

        if (betHistoryStore.isExpanded) {
            this.loadNextTwoPages();
            return;
        }

        betHistoryStore.setIsExpanded(true);

        if (betHistoryStore.serverTotalPages === 0) {
            this.hasSwitchedToServerMode = true;
            this.requestHistory(1);
        } else if (betHistoryStore.serverTotalPages > 1) {
            this.loadNextTwoPages();
        }
    }

    collapse() {
        const betHistoryStore = useBetHistoryStore.getState();
        betHistoryStore.setIsExpanded(false);

        if (betHistoryStore.serverTotalPages > 0) {
            this.resetLoadedPages();
        } else {
            this.expandedLoadedPages.clear();
            betHistoryStore.setCurrentPage(1);
            betHistoryStore.setHasMoreData(false);
        }
    }

    getExpandedLoadedPages() {
        return this.expandedLoadedPages;
    }

    private loadNextTwoPages() {
        const betHistoryStore = useBetHistoryStore.getState();
        const { serverTotalPages } = betHistoryStore;

        const highestExpandedPage = this.expandedLoadedPages.size > 0 ? Math.max(...Array.from(this.expandedLoadedPages)) : 1;
        const pagesToLoad = Math.min(2, serverTotalPages - highestExpandedPage);

        for (let i = 1; i <= pagesToLoad; i++) {
            const nextPage = highestExpandedPage + i;
            if (nextPage <= serverTotalPages) {
                this.requestHistory(nextPage);
            }
        }
    }

    getDisplayedBetLogs() {
        const betHistoryStore = useBetHistoryStore.getState();

        if (!betHistoryStore.isExpanded) {
            return betHistoryStore.betLogs.slice(0, 10);
        } else {
            if (this.hasSwitchedToServerMode || betHistoryStore.serverTotalPages > 0) {
                const totalLoadedPages = 1 + this.expandedLoadedPages.size;
                const expectedRecords = totalLoadedPages * 10;
                const hasLoadedAllPages = totalLoadedPages >= betHistoryStore.serverTotalPages;

                if (hasLoadedAllPages) {
                    return betHistoryStore.betLogs;
                } else if (betHistoryStore.betLogs.length <= expectedRecords) {
                    return betHistoryStore.betLogs;
                } else {
                    return betHistoryStore.betLogs.slice(0, expectedRecords);
                }
            } else {
                return betHistoryStore.betLogs;
            }
        }
    }

    public cleanup() {
        if (this.unsubscribeFinishedBall) {
            this.unsubscribeFinishedBall();
            this.unsubscribeFinishedBall = null;
        }

        // Clean up local tracking
        this.finishedRoundIds.clear();
        this.pendingBetsByRound.clear();

        super.cleanup();
    }
}

// Helper function for sorting bet logs
function sortByRoundDesc(logs: any[]): any[] {
    return [...(logs || [])].sort((a, b) => (b?.roundId || b?.phien || 0) - (a?.roundId || a?.phien || 0));
}