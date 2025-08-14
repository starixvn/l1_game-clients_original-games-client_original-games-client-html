import { useMemo } from "react";
import { PlayerInPlayerResultBoard } from "../../components/game-base/type";
import useGameStore from "../stores/game-store/game-store";
import { numberWithCommas } from "../helpers";

export const usePlayerResultBoard = () => {
    const { playerResultBoard } = useGameStore();

    const tableData = useMemo(() => {
        if (!playerResultBoard?.players?.length) return [];

        return playerResultBoard.players.map((player: PlayerInPlayerResultBoard) => ({
            playerName: player.name,
            betAmount: numberWithCommas(player.betAmount, 2).toString(),
            win: numberWithCommas(player.winAmount || 0, 2).toString() || "-",
        }));
    }, [playerResultBoard]);

    return {
        totalPlayers: playerResultBoard?.totalPlayers || 0,
        roundId: playerResultBoard?.roundId?.toString() || "",
        tableData,
    };
};
