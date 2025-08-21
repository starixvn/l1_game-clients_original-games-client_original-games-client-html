import * as React from "react";
import { cn } from "../../../_shared/utils/merge-tailwind-util";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { formatNumber, calculateTotalWinFromTable } from "./bet-detail-utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../table";

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
            isWinningBet: false,
        },
        {
            content: row.betChoice,
            isWinningBet: row.isWinningBet,
        },
        {
            content: row.stake,
            isWinningBet: false,
        },
        {
            content: row.win,
            isWinningBet: row.isWinningBet,
        },
    ];
};

const renderBetDetailHeader = (translateCommon: any) => {
    const headerColumns = [
        { key: "time", label: translateCommon("time") },
        { key: "bet_choice", label: translateCommon("bet_choice") },
        { key: "stake", label: translateCommon("stake") },
        { key: "win", label: translateCommon("win") },
    ];

    return (
        <TableHeader className="sticky top-0 z-10 bg-table-header">
            <TableRow>
                {headerColumns.map((column, index) => (
                    <TableHead
                        key={column.key}
                        className="w-1/4 text-center py-3 px-0 text-sm font-normal text-secondary-text rounded-t-lg border-b border-primary-border text-[14px] leading-5"
                    >
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
            <TableRow key={index} className={cn("border-none", index % 2 === 0 ? "bg-bet-detail-row-1" : "bg-bet-detail-row-2")}>
                {rowData.map((cell, cellIndex) => (
                    <TableCell
                        key={cellIndex}
                        className={cn(
                            "w-1/4 text-sm text-secondary-text text-center p-3 text-[14px] leading-5",
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
            <TableRow className="border-none font-normal text-secondary-text text-[14px] leading-5 bg-[#0C192B] table w-full table-fixed">
                <TableCell className="w-1/4 text-center p-3 px-0">{translateCommon("total")}</TableCell>
                <TableCell className="w-1/4 text-center p-3 px-0"></TableCell>
                <TableCell className="w-1/4 text-center p-3 px-0">{formatNumber(totalStake)}</TableCell>
                <TableCell className="w-1/4 text-winning-highlight font-semibold text-center p-3 px-0">
                    {formatNumber(calculateTotalWinFromTable(data))}
                </TableCell>
            </TableRow>
            <TableRow className="border-none font-normal text-secondary-text text-[14px] leading-5 bg-bet-detail-row-2 table w-full table-fixed rounded-b-lg">
                <TableCell className="w-1/4 text-center p-3 px-0">{`Net Profit`}</TableCell>
                <TableCell className="w-1/4 text-center p-3 px-0"></TableCell>
                <TableCell className="w-1/4 text-center p-3 px-0"></TableCell>
                <TableCell className="w-1/4 text-winning-highlight font-semibold text-center p-3 px-0">{formatNumber(netProfit)}</TableCell>
            </TableRow>
        </>
    );
};

const BetDetailTable = React.forwardRef<HTMLDivElement, BetDetailTableProps>(({ data, totalStake, netProfit, emptyMessage }, ref) => {
    const { t: translateCommon } = useCommonTranslate();

    if (!data || data.length === 0) {
        return (
            <div ref={ref} className="flex flex-col h-full min-h-0 w-full">
                <div className="bg-table-header rounded-t-lg flex-shrink-0">
                    <Table className="rounded-t-lg w-full">{renderBetDetailHeader(translateCommon)}</Table>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto w-full">
                    <Table className="w-full">
                        <TableRow className="border-none bg-bet-detail-row-1">
                            <TableCell className="w-1/4 text-sm text-secondary-text text-center p-3">{emptyMessage}</TableCell>
                        </TableRow>
                    </Table>
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} className="flex flex-col h-full w-full">
            <div className="bg-table-header rounded-t-lg shrink-0">
                <Table className="rounded-t-lg w-full">{renderBetDetailHeader(translateCommon)}</Table>
            </div>

            <div className="overflow-y-auto w-full max-h-[calc(100%-92px)]">
                <Table className="w-full">
                    <TableBody>{renderBetDetailRows(data)}</TableBody>
                </Table>
            </div>

            <div className="shrink-0 w-full">
                {renderSummaryRows(translateCommon, totalStake, netProfit, data)}
            </div>
        </div>
    );
});

BetDetailTable.displayName = "BetDetailTable";

export { BetDetailTable };
