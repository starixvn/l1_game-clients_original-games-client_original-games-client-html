import { BetHistoryHandler, BetHistoryHandlerProps } from "@shared/components/game-base/handlers/bet-history-handler";
import { messageEventType } from "@shared/components/game-base/handlers/game-message-handler";
import useBetHistoryStore from "@shared/stores/bet-history-store/bet-history-store";
import usePFStore from "@shared/stores/pf-store/pf-store";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";

export class PlinkoBetHistoryHandler extends BetHistoryHandler {
    private static readonly PAGE_SIZE = 10;
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
    private readonly expandedLoadedPages: Set<number> = new Set(); // Track pages loaded during expanded state
    private expandedRequestedPages: number = 1; // Track total pages requested during expansion (starts at 1 for initial page)


    // Track pending bets by round ID (since Plinko has one round per ball)
    private readonly pendingBetsByRound: Map<number, any[]> = new Map();


    private unsubscribeFinishedBall: (() => void) | null = null;

    constructor(props: BetHistoryHandlerProps) {
        super(props);
        this.setupFinishedBallSubscription();
    }

    private setupFinishedBallSubscription() {
        this.unsubscribeFinishedBall = usePlinkoGameStore.subscribe(
            (state) => state.finishedBall,
            (finishedBall, previousFinishedBall) => {
                if (finishedBall && finishedBall.roundId !== previousFinishedBall?.roundId) {
                    // Check if we have pending bets for this finished round
                    if (this.pendingBetsByRound.has(finishedBall.roundId)) {
                        this.flushBetLogForRound(finishedBall.roundId);
                        // Remove the processed bet
                        this.pendingBetsByRound.delete(finishedBall.roundId);
                    }
                }
            }
        );
    }


    private flushBetLogForRound(roundId: number) {
        const betHistoryStore = useBetHistoryStore.getState();
        const pendingBets = this.pendingBetsByRound.get(roundId);
        
        if (!pendingBets || pendingBets.length === 0 || !this.latestFinish?.settlementResult) {
            return;
        }

        // Each roundId should have only one bet (one ball per round)
        const bet = pendingBets[0];
        const betAmount = Number(bet.amount) || 0;
        const winAmount = Number(bet.winAmount) || 0;

        const resultData = {
            result: bet.result,
            settlementResult: bet.settlementResult,
            odds: bet.odds || {},
        };

        const betLog = this.createPlinkoBetLog(
            roundId,
            betAmount,
            winAmount,
            [bet], // Pass as array for compatibility
            bet.time,
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

        const roundId = Number(action.finish.roundId) || 0;
        const betAmount = Number(action.finish.amount) || 0;
        const winAmount = Number(action.finish.winAmount) || 0;
        const reachMaxWin = Boolean(action.finish.reachMaxWin);

        if (betAmount > 0) {
            const clientSeed = pfStore.pfClientSeedSetting?.useManualClientSeed
                ? pfStore.pfClientSeedSetting.manualClientSeed
                : pfStore.pfClientSeedSetting?.randomClientSeed || "";

            const betData = {
                time: action.finish.time,
                amount: betAmount,
                winAmount: winAmount, // Store win amount per bet
                reachMaxWin: reachMaxWin, // Store reachMaxWin per bet
                choice: `plinko-${action.ownBets.gameMode}-${action.ownBets.numberOfRows}`,
                clientSeed,
                roundId: roundId, // Include round ID for tracking
                result: action.finish.result,
                settlementResult: action.finish.settlementResult,
                odds: action.finish.odds || {},
            };
            
            // Store this bet for the specific round ID
            if (!this.pendingBetsByRound.has(roundId)) {
                this.pendingBetsByRound.set(roundId, []);
            }
            this.pendingBetsByRound.get(roundId).push(betData);
        }
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

        // Add reachMaxWin flag to the bet log (use from the specific bet)
        return {
            ...baseBetLog,
            reachMaxWin: pendingDetails[0]?.reachMaxWin || false,
        };
    }

    resetHistory() {
        super.resetHistory();
        this.expandedLoadedPages.clear();
        this.expandedRequestedPages = 1;
        this.pendingBetsByRound.clear();
    }

    resetLoadedPages() {
        const betHistoryStore = useBetHistoryStore.getState();

        this.expandedLoadedPages.clear();
        this.expandedRequestedPages = 1;

        if (betHistoryStore.serverTotalPages > 0) {
            const page1Logs = betHistoryStore.betLogs.slice(0, PlinkoBetHistoryHandler.PAGE_SIZE);
            betHistoryStore.setBetLogs(page1Logs);
        }

        betHistoryStore.setCurrentPage(1);
        const hasMorePages = betHistoryStore.serverTotalPages > 1;
        betHistoryStore.setHasMoreData(hasMorePages);
    }

    expand() {
        const betHistoryStore = useBetHistoryStore.getState();

        if (betHistoryStore.isExpanded) {
            // Already expanded, load next 2 pages
            const pagesToLoad = Math.min(2, betHistoryStore.serverTotalPages - this.expandedRequestedPages);
            this.expandedRequestedPages += pagesToLoad;
            this.loadNextTwoPages();
            return;
        }

        betHistoryStore.setIsExpanded(true);

        if (betHistoryStore.serverTotalPages === 0) {
            this.requestHistory(1);
        } else if (betHistoryStore.serverTotalPages > 1) {
            // Load next 2 pages (pages 2 and 3)
            this.expandedRequestedPages = 3; // page 1 + 2 additional pages
            this.loadNextTwoPages();
        }
    }

    collapse() {
        const betHistoryStore = useBetHistoryStore.getState();
        betHistoryStore.setIsExpanded(false);
        this.expandedRequestedPages = 1; // Reset to initial state

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
            // Collapsed: Always show only 10 most recent records
            return betHistoryStore.betLogs.slice(0, PlinkoBetHistoryHandler.PAGE_SIZE);
        } else {
            // Expanded: Show records based on requested pages, slice oldest if needed
            if (betHistoryStore.serverTotalPages > 0) {
                const expectedRecords = this.expandedRequestedPages * PlinkoBetHistoryHandler.PAGE_SIZE;

                if (this.expandedRequestedPages >= betHistoryStore.serverTotalPages) {
                    // At max pages: show all records, new bets just append without slicing
                    return betHistoryStore.betLogs;
                } else if (betHistoryStore.betLogs.length > expectedRecords) {
                    // Not at max pages and too many records: slice oldest to maintain expected count
                    return betHistoryStore.betLogs.slice(0, expectedRecords); // Keep most recent records (first N since sorted desc)
                } else {
                    // Show all available records up to expected count
                    return betHistoryStore.betLogs;
                }
            } else {
                // No server pagination: show all records
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
        this.pendingBetsByRound.clear();

        super.cleanup();
    }
}

// Helper function for sorting bet logs
function sortByRoundDesc(logs: any[]): any[] {
    return [...(logs || [])].sort((a, b) => (b?.roundId || b?.phien || 0) - (a?.roundId || a?.phien || 0));
}