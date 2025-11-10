import { useBetDetailStore } from "@shared/stores";
import { FC, memo } from "react";
import { TableCell, TableRow } from "../table";
import { cn } from "@shared/utils";
import { separateDateTime } from "@shared/helpers";

const BetDetailTableBodyItem = ({ data, BetChoice }: { data: any; BetChoice?: FC<{ choice: string }> }) => {
    const betDetailData = useBetDetailStore((state) => state.data);
    if (!data || !betDetailData) {
        return null;
    }
    const { odds, settlementResult } = betDetailData;
    const isWinningBet = (choice: string) => {
        return settlementResult?.[choice] === true;
    };
    const { choice, amount } = data;
    const isWin = isWinningBet(choice);
    const { time } = separateDateTime(data.time);
    const rowData = [
        {
            content: time,
            isWinningBet: false,
        },
        {
            content: BetChoice ? <BetChoice choice={choice} /> : choice,
            isWinningBet: isWin,
            className: "font-semibold",
        },
        {
            content: amount,
            isWinningBet: false,
        },
        {
            content: isWin ? amount * odds[choice] : 0,
            isWinningBet: isWin,
            className: "text-right",
        },
    ];
    return (
        <TableRow className="border-none">
            {rowData.map((cell, cellIndex) => (
                <TableCell
                    key={cellIndex}
                    className={cn(
                        "text-sm md:text-base text-secondary-text p-3 text-center",
                        cell.className,
                        cell.isWinningBet && "text-winning-highlight font-normal"
                    )}
                >
                    {cell.content}
                </TableCell>
            ))}
        </TableRow>
    );
};

export default memo(BetDetailTableBodyItem);
