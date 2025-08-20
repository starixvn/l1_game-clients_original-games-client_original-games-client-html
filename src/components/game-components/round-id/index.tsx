import { FC } from "react";
import { usePlayerResultBoard } from "../../../_shared/react-hooks";

export const RoundId: FC = () => {
  const { roundId } = usePlayerResultBoard();

  return (
    <div className="text-primary-text">#{roundId}</div>
  );
};