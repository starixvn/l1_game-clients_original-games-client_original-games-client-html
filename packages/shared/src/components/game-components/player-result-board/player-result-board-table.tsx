import * as React from "react";
import { cn } from '@shared/utils/merge-tailwind-util';
import { useCommonTranslate } from '@shared/react-hooks';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../table";

interface PlayerData {
    playerName: string;
    betAmount: string;
    win: string;
}

interface PlayerResultBoardTableProps {
    data: PlayerData[];
    emptyMessage?: string;
}

const PlayerResultBoardTable = React.forwardRef<HTMLDivElement, PlayerResultBoardTableProps>(({ data }, ref) => {
    const { t: translateCommon } = useCommonTranslate();

    const renderTableHeader = () => {
        return (
            <TableHeader>
                <TableRow className="bg-table-header border-none md:px-3">
                    <TableHead className="text-primary-text h-full text-sm md:text-base text-center p-2 md:pl-3 md:px-0 font-semibold rounded-tl-lg rounded-bl-lg w-1/3">
                        {translateCommon("player")}
                    </TableHead>
                    <TableHead className="text-primary-text h-full text-sm md:text-base text-center p-2 md:px-0 font-semibold w-1/3">
                        {translateCommon("bet_amount")}
                    </TableHead>
                    <TableHead className="text-primary-text h-full text-sm md:text-base text-right p-2 md:pr-3 pl-0 font-semibold rounded-tr-lg rounded-br-lg w-1/3">
                        {translateCommon("win")}
                    </TableHead>
                </TableRow>
            </TableHeader>
        );
    };

    const renderTableBody = () => {
        if (!data || data.length === 0) {
            return (
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={3} className="py-8 text-secondary-text text-center">
                            {translateCommon("no_data")}
                        </TableCell>
                    </TableRow>
                </TableBody>
            );
        } else {
            return (
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow
                            key={index}
                            className="text-center border-b border-primary-border hover:bg-secondary-bg/50 transition-colors"
                        >
                            <TableCell className="py-[10.3px] md:py-[12.5px] px-2 md:px-3 text-secondary-text text-center md:text-base">{row.playerName}</TableCell>
                            <TableCell className="py-[10.3px] md:py-[12.5px] px-2 md:px-3 text-secondary-text text-center md:text-base">{row.betAmount}</TableCell>
                            <TableCell
                                className={cn(
                                    "py-[10.3px] md:py-[12.5px] px-2 md:px-3 font-semibold text-right pl-0 md:text-base",
                                    parseFloat(row.win) > 0 ? "text-winning-highlight" : "text-secondary-text"
                                )}
                            >
                                {row.win}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            );
        }
    };

    return (
        <div ref={ref} className="min-h-[450px] w-full">
            <Table>
                {renderTableHeader()}
                {renderTableBody()}
            </Table>
        </div>
    );
});

PlayerResultBoardTable.displayName = "PlayerResultBoardTable";

export { PlayerResultBoardTable };
