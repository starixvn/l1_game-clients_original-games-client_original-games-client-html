import { useMemo, useState, useEffect } from "react";
import { PlayerInPlayerResultBoard, PlayerResultBoard, RoundState } from "../../components/game-base/type";
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

const DELAY = 2000;

export const usePlayerResultBoard = () => {
    const playerResultBoard = useGameStore((state) => state.playerResultBoard);
    const rate = useGameStore((state) => state.rate);
    const { roundState } = useGameStateContext();
    const { durations } = useGameContext();

    const [shouldShowResults, setShouldShowResults] = useState(false);
    const [isDisplayingResults, setIsDisplayingResults] = useState(false);

    const [captureSettledPlayerResultBoard, setCaptureSettledPlayerResultBoard] = useState<PlayerResultBoard | null>(null);

    useEffect(() => {
        let timeoutDisplayResult: NodeJS.Timeout;
        let timeoutHideResults: NodeJS.Timeout;

        switch (roundState) {
            case RoundState.DisplayResult:
                if (playerResultBoard && playerResultBoard.players?.length > 0 && playerResultBoard.isSettled) {
                    setCaptureSettledPlayerResultBoard(playerResultBoard);
                }

                timeoutDisplayResult = setTimeout(() => {
                    setShouldShowResults(true);
                    setIsDisplayingResults(true);

                    timeoutHideResults = setTimeout(() => {
                        setShouldShowResults(false);
                        setIsDisplayingResults(false);
                    }, (durations?.showResult ?? 0) * 1000);
                }, DELAY);
                break;

            case RoundState.InRound:
                setCaptureSettledPlayerResultBoard(null);
                setShouldShowResults(false);
                setIsDisplayingResults(false);
                break;

            default:
                break;
        }

        return () => {
            timeoutDisplayResult && clearTimeout(timeoutDisplayResult);
            timeoutHideResults && clearTimeout(timeoutHideResults);
        };
    }, [roundState, durations?.showResult, playerResultBoard]);

    const tableData = useMemo(() => {
        const currentPlayerResultBoard = captureSettledPlayerResultBoard || playerResultBoard;

        if (!currentPlayerResultBoard?.players?.length) {
            return [];
        }

        return currentPlayerResultBoard.players.map((player: PlayerInPlayerResultBoard) => {
            const formattedWinAmount = () => {
                if (!shouldShowResults) {
                    return "-";
                }
                if (player.winAmount === null) {
                    return "-";
                }
                return calculateAmountByRate(player.winAmount, rate ?? 1) || "0";
            };

            return {
                playerName: player.name,
                betAmount: calculateAmountByRate(player.betAmount, rate ?? 1),
                win: formattedWinAmount(),
            };
        });
    }, [captureSettledPlayerResultBoard, playerResultBoard, rate, shouldShowResults]);

    return {
        totalPlayers: (captureSettledPlayerResultBoard || playerResultBoard)?.totalPlayers || 0,
        roundId: (captureSettledPlayerResultBoard || playerResultBoard)?.roundId?.toString() || "",
        tableData,
        shouldShowResults,
        isDisplayingResults,
    };
};
