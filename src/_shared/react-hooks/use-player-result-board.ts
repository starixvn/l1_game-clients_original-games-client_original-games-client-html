import { useMemo } from "react";
import { PlayerInPlayerResultBoard } from "../../components/game-base/type";
import useGameStore from "../stores/game-store/game-store";

export const usePlayerResultBoard = () => {
    const { playerResultBoard } = useGameStore();

    const tableData = useMemo(() => {
        if (!playerResultBoard?.players?.length) return [];

        return playerResultBoard.players.map((player: PlayerInPlayerResultBoard) => ({
            playerName: player.name,
            betAmount: player.betAmount.toString(),
            win: player.winAmount?.toString() || "-",
            winAmount: player.winAmount,
        }));
    }, [playerResultBoard]);

    return {
        totalPlayers: playerResultBoard?.totalPlayers || 0,
        roundId: playerResultBoard?.roundId?.toString() || "",
        tableData,
    };
};
