import { Table, TableColumn } from "../table";
import { usePlayerResultBoard } from "../../../_shared/react-hooks";

const columns: TableColumn[] = [
  { key: "playerName", header: "Player" },
  { key: "betAmount", header: "Bet Amount" },
  { key: "win", header: "Win" },
];

const getCellClassName = (columnKey: string, _value: any, row: any) => {
  if (columnKey === "win" && +row.win > 0) {
    return "text-winning-highlight font-semibold";
  }
  return "";
};

export const PlayerResultBoard = () => {
  const { totalPlayers, roundId, tableData } = usePlayerResultBoard();

  return (
    <div className="h-full rounded-xl p-3 pb-1 mb-3 bg-white dark:bg-primary-bg border border-primary-border">
      <div className="flex justify-between bg-secondary-bg rounded-xl p-2 mb-2">
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center mr-2 bg-[#24d67c33] rounded-full">
            <span className="inline-block w-2 h-2 m-1 bg-[#24d67c] rounded-full" />
          </span>
          <span className="text-primary-text">{totalPlayers} players</span>
        </div>
        <div className="text-primary-text">#{roundId}</div>
      </div>

      <div className="min-h-[450px]">
        <Table
          columns={columns}
          data={tableData}
          getCellClassName={getCellClassName}
        />
      </div>
    </div>
  );
};