import * as React from "react";
import { cn } from "../../../_shared/utils/merge-tailwind-util";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { formatNumber, calculateTotalWinFromTable } from "./bet-detail-utils";

interface BetDetailRow {
  time: React.ReactNode;
  betChoice: React.ReactNode;
  stake: React.ReactNode;
  win: React.ReactNode;
  isWinningBet?: boolean;
}

interface BetDetailTableProps {
  data: BetDetailRow[];
  totalStake: number;
  netProfit: number;
  emptyMessage: string;
}

const commonStyles = {
  header: "sticky top-0 z-10 bg-bet-detail-header border-b border-primary-border",
  headerGrid: "grid grid-cols-4 gap-4 p-3 text-sm font-medium text-secondary-text",
  headerCell: "text-center",
  rowGrid: "grid grid-cols-4 gap-4 p-3 text-sm border-b border-primary-border",
  dataCell: "text-sm text-secondary-text text-center flex justify-center items-center",
  summaryGrid: "grid grid-cols-4 gap-4 p-4 text-sm font-semibold text-secondary-text",
  summaryCell: "text-center",
  summaryWinCell: "text-winning-highlight text-center",
  scrollContainer: "max-h-[500px] overflow-y-auto",
  stickyBottom: "sticky bottom-0 z-10"
};

const SummaryRow: React.FC<{
  label: string;
  bgColor: string;
  stakeValue?: React.ReactNode;
  winValue?: React.ReactNode;
}> = ({ label, bgColor, stakeValue, winValue }) => (
  <div className={cn("border-t border-primary-border", bgColor)}>
    <div className={commonStyles.summaryGrid}>
      <div className={commonStyles.summaryCell}>{label}</div>
      <div></div>
      <div className={commonStyles.summaryCell}>{stakeValue || ""}</div>
      <div className={commonStyles.summaryWinCell}>{winValue || ""}</div>
    </div>
  </div>
);

const BetDetailTable = React.forwardRef<HTMLDivElement, BetDetailTableProps>(
  ({ data, totalStake, netProfit, emptyMessage }, ref) => {
    const { t: translateCommon } = useCommonTranslate();

    const renderCell = (columnKey: string, row: BetDetailRow, content: React.ReactNode) => {
      const isWinningBet = row.isWinningBet && (columnKey === "betChoice" || columnKey === "win");
      return (
        <div
          className={cn(
            commonStyles.dataCell,
            isWinningBet && "text-winning-highlight font-semibold"
          )}
        >
          {content}
        </div>
      );
    };

    if (!data || data.length === 0) {
      return (
        <div className="bg-bet-detail-row-1 p-8">
          <div className="text-center text-secondary-text">{emptyMessage}</div>
        </div>
      );
    }

    return (
      <div ref={ref} className="relative w-full">
        {/* Header */}
        <div className={commonStyles.header}>
          <div className={commonStyles.headerGrid}>
            <div className={commonStyles.headerCell}>{translateCommon("time")}</div>
            <div className={commonStyles.headerCell}>{translateCommon("bet_choice")}</div>
            <div className={commonStyles.headerCell}>{translateCommon("stake")}</div>
            <div className={commonStyles.headerCell}>{translateCommon("win")}</div>
          </div>
        </div>

        {/* Rows */}
        <div className={commonStyles.scrollContainer}>
          {data.map((row, index) => (
            <div
              key={index}
              className={cn(
                commonStyles.rowGrid,
                index % 2 === 0 ? "bg-bet-detail-row-1" : "bg-bet-detail-row-2"
              )}
            >
              {renderCell("time", row, row.time)}
              {renderCell("betChoice", row, row.betChoice)}
              {renderCell("stake", row, row.stake)}
              {renderCell("win", row, row.win)}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className={commonStyles.stickyBottom}>
          <SummaryRow
            label={translateCommon("total")}
            bgColor="bg-bet-detail-row-1 border-t-2"
            stakeValue={formatNumber(totalStake)}
            winValue={formatNumber(calculateTotalWinFromTable(data))}
          />
          <SummaryRow
            label={translateCommon("net_profit")}
            bgColor="bg-bet-detail-row-2"
            winValue={formatNumber(netProfit)}
          />
        </div>
      </div>
    );
  }
);

BetDetailTable.displayName = "BetDetailTable";

export { BetDetailTable };
