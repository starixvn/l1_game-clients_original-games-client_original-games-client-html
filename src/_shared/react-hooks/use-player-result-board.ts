import { useMemo } from "react";
import { PlayerInPlayerResultBoard } from "../../components/game-base/type";
import { useGameStateContext } from "../react-contexts/game-state-context/game-state-context";

export const usePlayerResultBoard = () => {
  const { playerResultBoard } = useGameStateContext();

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