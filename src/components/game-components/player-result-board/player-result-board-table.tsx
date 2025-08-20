import * as React from "react";
import { cn } from "../../../_shared/utils/merge-tailwind-util";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table/s-table";

interface PlayerData {
  playerName: string;
  betAmount: string;
  win: string;
}

interface PlayerResultBoardTableProps {
  data: PlayerData[];
  emptyMessage?: string;
}

const PlayerResultBoardTable = React.forwardRef<
  HTMLDivElement,
  PlayerResultBoardTableProps
>(({ data, emptyMessage = "No data available..." }, ref) => {
  const { t: translateCommon } = useCommonTranslate();

  const commonHeaderStyles = "text-primary-text text-center p-2 border-b border-primary-border";
  const commonRowStyles = "text-center border-b border-primary-border hover:bg-secondary-bg/50 transition-colors";
  const commonCellStyles = "py-3 text-secondary-text";

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-text">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-primary-border bg-primary-bg">
            <TableHead className={commonHeaderStyles}>
              {translateCommon("player")}
            </TableHead>
            <TableHead className={commonHeaderStyles}>
              {translateCommon("total_stake")}
            </TableHead>
            <TableHead className={commonHeaderStyles}>
              {translateCommon("win")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={index} 
              className={commonRowStyles}
            >
              <TableCell className={commonCellStyles}>
                {row.playerName}
              </TableCell>
              <TableCell className={commonCellStyles}>
                {row.betAmount}
              </TableCell>
              <TableCell className={cn(
                "py-3 font-semibold",
                parseFloat(row.win) > 0 ? "text-winning-highlight" : "text-secondary-text"
              )}>
                {row.win}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

PlayerResultBoardTable.displayName = "PlayerResultBoardTable";

export { PlayerResultBoardTable };
