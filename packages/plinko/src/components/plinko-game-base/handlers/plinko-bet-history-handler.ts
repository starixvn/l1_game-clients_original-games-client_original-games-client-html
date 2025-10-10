import { BetHistoryHandler, BetHistoryHandlerProps } from "@shared/components/game-base/handlers/bet-history-handler";
import { messageEventType } from "@shared/components/game-base/handlers/game-message-handler";
import useBetHistoryStore from "@shared/stores/bet-history-store/bet-history-store";
import usePFStore from "@shared/stores/pf-store/pf-store";

export class PlinkoBetHistoryHandler extends BetHistoryHandler {
    // Override to include winAmount and reachMaxWin support
    protected latestFinish: {
        roundId: number;
        result?: any;
        settlementResult?: any;
        winAmount: number;
        amount: number;
        reachMaxWin?: boolean;
    } | null = null;

    constructor(props: BetHistoryHandlerProps) {
        super(props);
    }

    // Override the event registration to handle Plinko-specific events
    protected registerHistoryEvents() {
        super.registerHistoryEvents();

        // Register Plinko-specific endBet event
        const endBetId = this.props.gameMessageHandler.register(messageEventType.END_BET, this.handleEndBet.bind(this));
        this.handlerIds.push(endBetId);
    }

    // Override handleFinish to include winAmount and reachMaxWin
    protected handleFinish({ finish }: any) {
        if (!finish) {
            return;
        }

        const { roundId, result, settlementResult, winAmount, amount, reachMaxWin } = finish;
        this.latestFinish = {
            roundId: Number(roundId) || 0,
            result,
            settlementResult,
            winAmount: Number(winAmount) || 0,
            amount: Number(amount) || 0,
            reachMaxWin: Boolean(reachMaxWin),
        };
    }

    private handleEndBet(action: any) {
        if (action?.finish) {
            // Extract bet data from endBet message (Plinko doesn't send separate ownBets)
            this.addPlinkoBetToPending(action);

            // Process the finish data
            this.handleFinish({ finish: action.finish });

            // Flush immediately for now (will flush when ball disappear later)
            this.flushLocalBetLogIfAny();
        }
    }

    private addPlinkoBetToPending(action: any) {
        const betHistoryStore = useBetHistoryStore.getState();
        const pfStore = usePFStore.getState();

        if (this.shouldUpdateRoundId(this.latestFinish.roundId, betHistoryStore.pendingBetRoundId)) {
            betHistoryStore.setPendingBetRoundId(this.latestFinish.roundId);
        }

        // Set first bet time if not set - use time from socket message
        if (!betHistoryStore.pendingFirstBetTime) {
            betHistoryStore.setPendingFirstBetTime(action.finish.time);
        }

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
            };

            betHistoryStore.addPendingBet(betData);
        }
    }

    protected flushLocalBetLogIfAny() {
        const betHistoryStore = useBetHistoryStore.getState();

        if (!betHistoryStore.hasPendingBets() || !this.latestFinish?.settlementResult) {
            return;
        }

        const pendingDetails = betHistoryStore.pendingBetDetails;
        const totalAmount = pendingDetails.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);

        const { winAmount: betwin, roundId: actualBettingRoundId } = this.latestFinish;

        const resultData = {
            result: this.latestFinish.result,
            settlementResult: this.latestFinish.settlementResult,
            odds: {}, // Plinko doesn't use odds-based calculations
        };

        const betLog = this.createPlinkoBetLog(
            actualBettingRoundId,
            totalAmount,
            betwin,
            pendingDetails,
            betHistoryStore.pendingFirstBetTime,
            resultData,
            betHistoryStore.betLogs[0].odds
        );

        const exists = betHistoryStore.betLogs.some((log: any) => (log?.phien || log?.roundId) === actualBettingRoundId);

        if (!exists) {
            betHistoryStore.appendBetLogs([betLog], {
                updatePagination: true,
                source: "pending_bet_flush",
            });
        }

        betHistoryStore.clearPendingBets();
        this.resetPendingLocalCache();
    }

    // Override createBetLog to include reachMaxWin flag
    protected createPlinkoBetLog(
        roundId: number,
        totalAmount: number,
        betwin: number,
        pendingDetails: any[],
        firstBetTime: string,
        resultData: any,
        odds: any
    ) {
        const baseBetLog = super.createBetLog(roundId, totalAmount, betwin, pendingDetails, firstBetTime, resultData);

        // Add reachMaxWin flag to the bet log
        return {
            ...baseBetLog,
            reachMaxWin: this.latestFinish?.reachMaxWin || false,
            odds: odds,
        };
    }
}
