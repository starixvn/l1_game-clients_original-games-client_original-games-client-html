import { useMemo } from "react";
import { PlayerInPlayerResultBoard } from "../../components/game-base/type";
import useGameStore from "../stores/game-store/game-store";

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

    const tableData = useMemo(() => {
        if (!playerResultBoard?.players?.length) {
            return [];
        }

        return playerResultBoard.players.map((player: PlayerInPlayerResultBoard) => {
            const formattedWinAmount = () => {
                if (!player.winAmount) {
                    return "-";
                }
                return calculateAmountByRate(player.winAmount, rate ?? 1);
            };

            return {
                playerName: player.name,
                betAmount: calculateAmountByRate(player.betAmount, rate ?? 1),
                win: formattedWinAmount(),
            };
        });
    }, [playerResultBoard, rate]);

    return {
        totalPlayers: playerResultBoard?.totalPlayers || 0,
        roundId: playerResultBoard?.roundId?.toString() || "",
        tableData,
    };
};
