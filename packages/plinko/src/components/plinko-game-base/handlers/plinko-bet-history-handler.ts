import { usePlinkoGameStore } from "@plinko/shared/stores";
import { useBetHistoryStore } from "@shared";
import { BetHistoryHandler } from "@shared/components/game-base/handlers";

export class PlinkoBetHistoryHandler extends BetHistoryHandler {
    registerEvents() {
        super.registerEvents();
        usePlinkoGameStore.subscribe((state) => state.finishedBall, this.handleFinishedBall.bind(this));
    }

    registerDurationEvents() {
        // nothing
    }

    handleBetHistory(data: any) {
        useBetHistoryStore.getState().registerBetHistoryEvent(data);
    }

    handleFinishedBall(finishedBall: any) {
        if (finishedBall) {
            const {
                roundId,
                result,
                settlementResult,
                winAmount,
                amount,
                time,
                reachMaxWin,
                odds,
                gameMode,
                numberOfRows,
                lightningBoard,
            } = finishedBall;
            const data: any = {
                roundId,
                phien: roundId,
                betwin: winAmount,
                betWin: winAmount,
                time: time,
                totalAmount: amount,
                amount,
                result: result,
                settlementResult: settlementResult,
                odds: odds,
                reachMaxWin,
                gameMode,
                numberOfRows,
                lightningBoard: lightningBoard,
                betLogDetails: [],
            };
            useBetHistoryStore.getState().appendBetLogs([data], { updatePagination: true });
        }
    }
}
