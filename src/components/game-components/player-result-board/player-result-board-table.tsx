import * as React from "react";
import { cn } from "../../../_shared/utils/merge-tailwind-util";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "../table";


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

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-text min-h-[465px]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div ref={ref} className="min-h-[465px]">
      <Table>
        <TableHeader>
          <TableRow className="border-primary-border bg-primary-bg">
            <TableHead className="text-primary-text text-center p-2 border-b border-primary-border font-bold">
              {translateCommon("player")}
            </TableHead>
            <TableHead className="text-primary-text text-center p-2 border-b border-primary-border font-bold">
              {translateCommon("total_stake")}
            </TableHead>
            <TableHead className="text-primary-text text-center p-2 border-b border-primary-border font-bold">
              {translateCommon("win")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={index} 
              className="text-center border-b border-primary-border hover:bg-secondary-bg/50 transition-colors"
            >
              <TableCell className="py-[10px] text-secondary-text text-center">
                {row.playerName}
              </TableCell>
              <TableCell className="py-[10px] text-secondary-text text-center">
                {row.betAmount}
              </TableCell>
              <TableCell className={cn(
                "py-[10px] font-semibold",
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
