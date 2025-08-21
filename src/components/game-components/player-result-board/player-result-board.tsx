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
      <span className="text-primary-text">{totalPlayers} players</span>
    </div>
  );

  const renderHeader = () => (
    <div className="flex justify-between bg-table-header rounded-xl p-2 mb-2">
      {renderPlayerCount()}
      <RoundId />
    </div>
  );

  const renderTable = () => (
    <div className="">
      <PlayerResultBoardTable
        data={tableData}
        emptyMessage={translateCommon("no_data")}
      />
    </div>
  );

  return (
    <div className="h-full rounded-xl p-3 pb-1 bg-white dark:bg-primary-bg border border-primary-border">
      {renderHeader()}
      {renderTable()}
    </div>
  );
};