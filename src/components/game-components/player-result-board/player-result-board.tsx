import { FC } from "react";
import { usePlayerResultBoard, useCommonTranslate } from "../../../_shared/react-hooks";
import { RoundId } from "../round-id";
import { PlayerResultBoardTable } from "./player-result-board-table";

export const PlayerResultBoard: FC = () => {
  const { totalPlayers, tableData } = usePlayerResultBoard();
  const { t: translateCommon } = useCommonTranslate();

  const renderPlayerCount = () => (
    <div className="flex items-center">
      <span className="inline-flex items-center justify-center mr-2 bg-[#24d67c33] rounded-full">
        <span className="inline-block w-2 h-2 m-1 bg-[#24d67c] rounded-full" />
      </span>
      <span className="text-primary-text">{totalPlayers} {translateCommon("players")}</span>
    </div>
  );

  const renderHeaderInfo = () => (
    <div className="flex justify-between bg-secondary-bg rounded-lg p-2 px-[10px] mb-2 text-sm">
      {renderPlayerCount()}
      <RoundId />
    </div>
  );

  const renderTable = () => (
    <div className="">
      <PlayerResultBoardTable
        data={tableData}
      />
    </div>
  );

  return (
    <div className="h-full rounded-xl px-2 lg:px-4 py-3 bg-primary-bg border border-primary-border">
      {renderHeaderInfo()}
      {renderTable()}
    </div>
  );
};