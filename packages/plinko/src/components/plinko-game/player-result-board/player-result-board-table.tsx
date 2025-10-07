import * as React from "react";
import { cn } from "@shared/utils/merge-tailwind-util";
import { useCommonTranslate, usePlayerResultBoardPlinko } from "@shared/react-hooks";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@shared/components/game-components/table";

export const PlayerResultBoardTable = React.forwardRef<HTMLDivElement>((props, ref) => {
    const { t: translateCommon } = useCommonTranslate();
    const { tableData } = usePlayerResultBoardPlinko();

    const renderTableHeader = () => {
        return (
            <TableHeader>
                <TableRow className="bg-table-header border-none md:px-3">
                    <TableHead className="text-primary-text h-full text-sm md:text-base text-center p-2 md:py-3 md:pl-3 md:px-0 font-semibold rounded-tl-lg rounded-bl-lg w-1/4">
                        {translateCommon("player").capitalizeFirstLetter()}
                    </TableHead>
                    <TableHead className="text-primary-text h-full text-sm md:text-base text-center p-2 md:py-3 md:px-0 font-semibold w-1/4">
                        {translateCommon("bet_amount").capitalizeFirstLetter()}
                    </TableHead>
                    <TableHead className="text-primary-text h-full text-sm md:text-base text-center p-2 md:py-3 md:px-0 font-semibold  w-1/4">
                        {translateCommon("title_multiplier").capitalizeFirstLetter()}
                    </TableHead>
                    <TableHead className="text-primary-text h-full text-sm md:text-base text-right p-2 md:py-3 md:pr-3 pl-0 font-semibold rounded-tr-lg rounded-br-lg w-1/4">
                        {translateCommon("win").capitalizeFirstLetter()}
                    </TableHead>
                </TableRow>
            </TableHeader>
        );
    };

    const renderTableBody = () => {
        if (!tableData || tableData.length === 0) {
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
                    {tableData.map((row, index) => (
                        <TableRow
                            key={index}
                            className="text-center border-b border-primary-border hover:bg-secondary-bg/50 transition-colors"
                        >
                            <TableCell className="py-[10.3px] md:py-[12.5px] px-2 md:px-3 text-secondary-text text-center md:text-base">
                                {row.playerName}
                            </TableCell>
                            <TableCell className="py-[10.3px] md:py-[12.5px] px-2 md:px-3 text-secondary-text text-center md:text-base">
                                {row.betAmount}
                            </TableCell>
                            <TableCell className="py-[10.3px] md:py-[12.5px] px-2 md:px-3 text-secondary-text text-center md:text-base">
                                {row.multiplier}
                            </TableCell>
                            <TableCell
                                className={cn(
                                    "py-[10.3px] md:py-[12.5px] px-2 md:px-3 font-normal text-right pl-0 md:text-base",
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
        <div ref={ref} className={cn("h-[450px] w-full overflow-hidden flex flex-col")}>
            <div className="flex-shrink-0 mb-1">
                <Table className="w-full table-fixed">{renderTableHeader()}</Table>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide-on-idle">
                <Table className="w-full table-fixed">{renderTableBody()}</Table>
            </div>
        </div>
    );
});
