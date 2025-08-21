import * as React from "react";
import { cn } from "../../../_shared/utils/merge-tailwind-util";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { formatNumber, calculateTotalWinFromTable } from "./bet-detail-utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../table";

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

const createBetDetailRowData = (row: BetDetailRow) => {
  return [
    {
      content: row.time,
      isWinningBet: false
    },
    {
      content: row.betChoice,
      isWinningBet: row.isWinningBet
    },
    {
      content: row.stake,
      isWinningBet: false
    },
    {
      content: row.win,
      isWinningBet: row.isWinningBet
    }
  ];
};

const renderBetDetailHeader = (translateCommon: any) => {
  const headerColumns = [
    { key: "time", label: translateCommon("time") },
    { key: "bet_choice", label: translateCommon("bet_choice") },
    { key: "stake", label: translateCommon("stake") },
    { key: "win", label: translateCommon("win") }
  ];

  return (
    <TableHeader className="sticky top-0 z-10 bg-bet-detail-header border-b border-primary-border">
      <TableRow>
        {headerColumns.map((column) => (
          <TableHead key={column.key} className="w-1/4 text-center p-3 text-sm font-medium text-secondary-text">
            {column.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};

const renderBetDetailRows = (data: BetDetailRow[]) => {
  return data.map((row, index) => {
    const rowData = createBetDetailRowData(row);

    return (
      <TableRow 
        key={index} 
        className={cn(
          "border-b border-primary-border",
          index % 2 === 0 ? "bg-bet-detail-row-1" : "bg-bet-detail-row-2"
        )}
      >
        {rowData.map((cell, cellIndex) => (
          <TableCell 
            key={cellIndex}
            className={cn(
              "w-1/4 text-sm text-secondary-text text-center p-3",
              cell.isWinningBet && "text-winning-highlight font-semibold"
            )}
          >
            {cell.content}
          </TableCell>
        ))}
      </TableRow>
    );
  });
};

const renderSummaryRows = (translateCommon: any, totalStake: number, netProfit: number, data: BetDetailRow[]) => {
  return (
    <>
      <TableRow className="border-t border-primary-border font-semibold text-secondary-text bg-bet-detail-row-1">
        <TableCell className="w-1/4 text-center p-4">{translateCommon("total")}</TableCell>
        <TableCell className="w-1/4 text-center p-4"></TableCell>
        <TableCell className="w-1/4 text-center p-4">{formatNumber(totalStake)}</TableCell>
        <TableCell className="w-1/4 text-winning-highlight text-center p-4">{formatNumber(calculateTotalWinFromTable(data))}</TableCell>
      </TableRow>
      <TableRow className="border-t border-primary-border font-semibold text-secondary-text bg-bet-detail-row-2">
        <TableCell className="w-1/4 text-center p-4">{translateCommon("net_profit")}</TableCell>
        <TableCell className="w-1/4 text-center p-4"></TableCell>
        <TableCell className="w-1/4 text-center p-4"></TableCell>
        <TableCell className="w-1/4 text-winning-highlight text-center p-4">{formatNumber(netProfit)}</TableCell>
      </TableRow>
    </>
  );
};

const BetDetailTable = React.forwardRef<HTMLDivElement, BetDetailTableProps>(
  ({ data, totalStake, netProfit, emptyMessage }, ref) => {
    const { t: translateCommon } = useCommonTranslate();

    if (!data || data.length === 0) {
      return (
        <div className="bg-bet-detail-row-1 p-8">
          <div className="text-center text-secondary-text">{emptyMessage}</div>
        </div>
      );
    }

    return (
      <div ref={ref} className="relative w-full">
        <div className="max-h-[500px] overflow-y-auto relative">
          <Table>
            {renderBetDetailHeader(translateCommon)}
            <TableBody>
              {renderBetDetailRows(data)}
            </TableBody>
          </Table>
        </div>

        <div className="sticky bottom-0 z-10">
          <Table>
            <TableBody>
              {renderSummaryRows(translateCommon, totalStake, netProfit, data)}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
);

BetDetailTable.displayName = "BetDetailTable";

export { BetDetailTable };
