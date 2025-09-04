import { FC } from "react";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";

export const RoundId: FC = () => {
  const { roundId } = useGameStateContext();

  return (
    <div className="text-primary-text">#{roundId}</div>
  );
};