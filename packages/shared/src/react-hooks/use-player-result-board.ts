import { useMemo, useEffect } from "react";
import { PlayerInPlayerResultBoard, RoundState } from '@shared/components/game-base/type';
import useGameStore from "../stores/game-store/game-store";
import { useGameStateContext } from "../react-contexts/game-state-context/game-state-context";
import { useGameContext } from "../react-contexts";

const calculateAmountByRate = (amount: number, rate: number) => {
    if (amount) {
        const total = amount / rate;
        const options = { maximumFractionDigits: 2 };
        const locale = "en-US";
        if (total < 0.1) {
            return "0";
        }
        return total.toLocaleString(locale, options);
    }
    return "";
};

export const usePlayerResultBoard = () => {
    const playerResultBoard = useGameStore((state) => state.playerResultBoard);
    const rate = useGameStore((state) => state.rate);
    const shouldShowResults = useGameStore((state) => state.shouldShowResults);
    const { roundState } = useGameStateContext();
    const { durations } = useGameContext();

    useEffect(() => {
        let timeoutDisplayResult: NodeJS.Timeout;

        switch (roundState) {
            case RoundState.DisplayResult:
                timeoutDisplayResult = setTimeout(() => {
                    useGameStore.getState().setShouldShowResults(true);
                }, (durations?.showResult ?? 0) * 1000);
                break;

                case RoundState.InRound:
                case RoundState.LockingBet:
                    useGameStore.getState().setShouldShowResults(false);
                    break;
            case RoundState.BeforePlaceBet:
            case RoundState.None:
                useGameStore.getState().setShouldShowResults(true);
                break;
            default:
                break;
        }

        return () => {
            timeoutDisplayResult && clearTimeout(timeoutDisplayResult);
        };
    }, [roundState, durations?.showResult]);

    const tableData = useMemo(() => {
        if (!playerResultBoard?.players?.length) {
            return [];
        }

        return playerResultBoard.players.map((player: PlayerInPlayerResultBoard) => {
            const formattedWinAmount = () => {
                if(shouldShowResults && player.winAmount !== null || (roundState === RoundState.InRound && player.winAmount !== null)) {
                    return calculateAmountByRate(player.winAmount, rate ?? 1) || "0";
                }
                return "-";
            };

            return {
                playerName: player.name,
                betAmount: calculateAmountByRate(player.betAmount, rate ?? 1),
                win: formattedWinAmount(),
            };
        });
    }, [playerResultBoard, rate, shouldShowResults, roundState]);

    return {
        totalPlayers: playerResultBoard?.totalPlayers || 0,
        roundId: playerResultBoard?.roundId?.toString() || "",
        tableData,
        shouldShowResults,
    };
};
