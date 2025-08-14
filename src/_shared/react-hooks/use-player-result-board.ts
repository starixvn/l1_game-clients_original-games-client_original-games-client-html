import { useMemo } from "react";
import { PlayerInPlayerResultBoard } from "../../components/game-base/type";
import useGameStore from "../stores/game-store/game-store";
import { numberWithCommas } from "../helpers";

export const usePlayerResultBoard = () => {
    const { playerResultBoard } = useGameStore();

    const tableData = useMemo(() => {
        if (!playerResultBoard?.players?.length) return [];
    
        return playerResultBoard.players.map((player: PlayerInPlayerResultBoard) => {
          const formattedWinAmount = numberWithCommas(player.winAmount ?? 0, 2);
          return {
            playerName: player.name,
            betAmount: numberWithCommas(player.betAmount, 2),
            win: formattedWinAmount === "0" ? "-" : formattedWinAmount,
          };
        });
      }, [playerResultBoard]);

    return {
        totalPlayers: playerResultBoard?.totalPlayers || 0,
        roundId: playerResultBoard?.roundId?.toString() || "",
        tableData,
    };
};
