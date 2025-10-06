import * as React from "react";
import { cn } from "@shared/utils/merge-tailwind-util";
import { useCommonTranslate, usePlinkoTranslate } from "@shared/react-hooks";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@shared/components/game-components/table";
import { gameModeMap } from "@shared/helpers/plinko";
import useBetDetailStore from "@shared/stores/bet-detail-store";
import { numberWithCommas } from "@shared/helpers";

interface BetDetailRow {
    gameMode: number;
    betChoice: React.ReactNode;
    stake: React.ReactNode;
    win: React.ReactNode;
    isWinningBet?: boolean;
    reachMaxWin?: boolean;
}

interface BetDetailTableProps {
    data: BetDetailRow[];
    emptyMessage: string;
}

const createBetDetailRowData = (row: BetDetailRow) => {
    return [
        {
            content: gameModeMap[row.gameMode],
            isWinningBet: false,
        },
        {
            content: row.betChoice,
            isWinningBet: false,
        },
        {
            content: row.stake,
            isWinningBet: row.isWinningBet,
        },
        {
            content: row.win,
            isWinningBet: row.isWinningBet,
            className: "text-right",
        },
    ];
};


const renderBetDetailHeader = (translateCommon: any, translatePlinko: any) => {
    const headerColumns = [
        { key: "gameMode", label: translatePlinko("mode").capitalizeFirstLetter() },
        { key: "bet_choice", label: translatePlinko("row").capitalizeFirstLetter() },
        { key: "stake", label: translateCommon("bet_amount").capitalizeFirstLetter() },
        { key: "win", label: translateCommon("win").capitalizeFirstLetter(), align: "right" },
    ];

    return (
        <TableHeader className="sticky top-0 z-10 bg-table-header">
            <TableRow>
                {headerColumns.map((column, index) => (
                    <TableHead
                        key={column.key}
                        className={cn(
                            "w-1/4 py-3 px-0 font-semibold text-white rounded-t-lg border-b border-primary-border text-sm md:text-base",
                            column.align === "right" ? "text-right" : "text-center"
                        )}
                    >
                        {column.label}
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
    );
};

const renderBetDetailRows = (data: BetDetailRow[], translateCommon: any) => {
    const rowData = createBetDetailRowData(data[0]);
    return (
        <TableRow className={cn("border-none bg-bet-detail-row-1")}>
            {rowData.map((cell, cellIndex) => (
                <TableCell
                    key={cellIndex}
                    className={cn(
                        "w-1/4 text-sm md:text-base text-secondary-text p-3",
                        cell.className || "text-center",
                        cell.isWinningBet && "text-winning-highlight",
                        cellIndex === 0 && "rounded-bl-lg",
                        cellIndex === rowData.length - 1 && "rounded-br-lg",
                    )}
                >
                    {translateCommon(cell.content)}
                </TableCell>
            ))}
        </TableRow>
    );
};

const PlinkoBetDetailTable = React.forwardRef<HTMLDivElement, BetDetailTableProps>(({ data, emptyMessage }, ref) => {
    const { t: translateCommon } = useCommonTranslate();
    const betDetailData = useBetDetailStore((state) => state.betDetailData);
    const { drawInfo } = betDetailData || {};
    const { t: translatePlinko } = usePlinkoTranslate();

    // Check if any row reached max win (server-side) or if drawInfo has max win (client-side)
    const maxWinRow = data.find(row => row.reachMaxWin);
    const reachMaxWin = maxWinRow?.reachMaxWin || drawInfo?.reachMaxWin;


    if (!data || data.length === 0) {
        return (
            <div ref={ref} className="flex flex-col h-full min-h-0 w-full">
                <div className="bg-table-header rounded-t-lg flex-shrink-0">
                    <Table className="rounded-t-lg w-full">{renderBetDetailHeader(translateCommon, translatePlinko)}</Table>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto w-full">
                    <Table className="w-full">
                        <TableBody>
                            <TableRow className="border-none bg-bet-detail-row-1">
                                <TableCell className="w-1/4 text-sm md:text-base text-secondary-text text-center p-3">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} className="flex flex-col h-full w-full">
            <div className="bg-table-header rounded-t-lg shrink-0 pr-3">
                <Table className="rounded-t-lg w-full">{renderBetDetailHeader(translateCommon, translatePlinko)}</Table>
            </div>

            <div className="w-full">
                <Table className="w-full pr-3">
                    <TableBody>{renderBetDetailRows(data, translatePlinko)}</TableBody>
                </Table>
            </div>

            {reachMaxWin && (
                <div className="font-semibold py-3 text-sm md:text-base">
                    <span>
                        You reached the max win: {numberWithCommas(maxWinRow?.win as number, 2)}
                    </span>
                </div>
            )}
        </div>
    );
});

PlinkoBetDetailTable.displayName = "PlinkoBetDetailTable";

export { PlinkoBetDetailTable };
