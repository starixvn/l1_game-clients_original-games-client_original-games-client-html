import { useBetHistoryStore, useGameStore, usePFStore } from "@shared";
import { GameMessageHandler, messageEventType } from "@shared/components/game-base/handlers";
import { RoundState } from "../type";

export type BetHistoryHandlerProps = {
    gameMessageHandler: GameMessageHandler;
    gameId: string;
};
export class BetHistoryHandler {
    protected lastRoundState: RoundState | null = null;
    protected latestOdds: Record<string, number> = {};
    protected latestFinish: { roundId?: number; result?: any; settlementResult?: any } | null = null;
    protected betWin: number = 0;

    constructor(private readonly props: BetHistoryHandlerProps) {}

    registerEvents() {
        this.props.gameMessageHandler.register(messageEventType.GAME_CONFIG, this.handleGameConfig.bind(this));
        this.props.gameMessageHandler.register(messageEventType.BET_HISTORY, this.handleBetHistory.bind(this));
        this.registerDurationEvents();
    }

    registerDurationEvents() {
        this.props.gameMessageHandler.register(messageEventType.OWN_BETS, this.handleOwnBets.bind(this));
        this.props.gameMessageHandler.register(messageEventType.FINISH, this.handleFinish.bind(this));
        this.props.gameMessageHandler.register(messageEventType.STATUS, this.handleStatus.bind(this));
        this.props.gameMessageHandler.register(messageEventType.ROUND_STATE, this.handleRoundState.bind(this));
    }

    protected handleGameConfig(data: any) {
        if (data?.gameConfig?.odds) {
            this.latestOdds = { ...this.latestOdds, ...data.gameConfig.odds };
        }
        if (data?.odds) {
            this.latestOdds = { ...this.latestOdds, ...data.odds };
        }
    }

    protected handleBetHistory(data: any) {
        useBetHistoryStore.getState().registerBetHistoryEvent(data);
    }

    protected handleOwnBets({ ownChip }: any) {
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
                gameId: this.props.gameId,
            };
            betHistoryStore.addPendingBet(betData);
        }
    }

    protected handleFinish({ finish }: any) {
        if (!finish) {
            return;
        }
        const { roundId, result, settlementResult } = finish;
        this.latestFinish = { roundId, result, settlementResult };
    }

    protected handleStatus({ status }: any) {
        const { bet, win } = status;
        this.betWin = win ? bet : 0;
    }

    protected handleRoundState({ roundState }: { roundState: RoundState }) {
        const isEnteringNewRoundBetting =
            roundState === RoundState.InRound && this.lastRoundState !== RoundState.InRound && this.lastRoundState !== null;

        if (isEnteringNewRoundBetting) {
            this.flushLocalBetLogIfAny();

            const betHistoryStore = useBetHistoryStore.getState();
            if (betHistoryStore.hasPendingBets()) {
                betHistoryStore.clearPendingBets();
            }
        }

        this.lastRoundState = roundState;
    }

    protected flushLocalBetLogIfAny() {
        const gameStore = useGameStore.getState() as any;
        const betHistoryStore = useBetHistoryStore.getState();

        if (!betHistoryStore.hasPendingBets() || !this.latestFinish?.settlementResult) {
            return;
        }

        const pendingDetails = betHistoryStore.pendingBetDetails.filter((d: any) => d.gameId === this.props.gameId);
        const totalAmount = pendingDetails.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);

        if (Object.keys(this.latestOdds).length === 0 && gameStore.gameConfigs?.odds) {
            this.latestOdds = gameStore.gameConfigs.odds;
        }

        const resultData = {
            result: this.latestFinish.result,
            settlementResult: this.latestFinish.settlementResult,
            odds: this.latestOdds || {},
        };

        const actualBettingRoundId = betHistoryStore.pendingBetRoundId || 0;

        const betLog = {
            roundId: actualBettingRoundId,
            betwin: this.betWin,
            betWin: this.betWin,
            totalAmount,
            amount: totalAmount,
            time: betHistoryStore.pendingFirstBetTime,
            result: resultData.result,
            settlementResult: resultData.settlementResult,
            odds: resultData.odds,
            betLogDetails: pendingDetails.map((d: any) => ({
                amount: d.amount,
                time: d.time,
                choice: d.choice,
            })),
        };

        const exists = betHistoryStore.betLogs.some((log: any) => (log?.phien || log?.roundId) === actualBettingRoundId);

        if (!exists && actualBettingRoundId) {
            betHistoryStore.appendBetLogs([betLog], {
                updatePagination: true,
                source: "pending_bet_flush",
            });
        }

        betHistoryStore.clearPendingBets();
        this.latestFinish = null;
    }

    protected shouldUpdateRoundId(currentRoundId: number, pendingRoundId: number | null): boolean {
        return !pendingRoundId || (pendingRoundId !== currentRoundId && pendingRoundId !== null);
    }
}
