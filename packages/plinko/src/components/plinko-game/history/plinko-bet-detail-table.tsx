import * as React from "react";
import { cn } from "@shared/utils/merge-tailwind-util";
import { useCommonTranslate } from "@shared/react-hooks";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@shared/components/game-components/table";
import { GAME_MODES, gameModeMap } from "@shared/helpers/plinko";
import useBetDetailStore from "@shared/stores/bet-detail-store";
import { numberWithCommas } from "@shared/helpers";
import { ResourceTypes } from "@shared/resources";
import { useTranslate } from "@tolgee/react";
import { capitalizeFirstLetter } from "@shared/helpers/string-helper";

interface BetDetailRow {
    gameMode: number;
    betChoice: string;
    stake: string | number;
    win: string | number;
    isWinningBet?: boolean;
    reachMaxWin?: boolean;
    payoutSlot?: number;
    totalPegMultipliers?: number;
}

interface BetDetailTableProps {
    data: BetDetailRow[];
    emptyMessage: string;
}

const TEXT_RIGHT_ALIGN = "text-right";

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
            className: TEXT_RIGHT_ALIGN,
        },
    ];
};

const createLightningBetDetailRowData = (row: BetDetailRow) => {
    return [
        {
            content: `${row.payoutSlot}x`,
            isWinningBet: row.isWinningBet,
        },
        {
            content: `${row.totalPegMultipliers}x`,
            isWinningBet: row.isWinningBet,
        },
        {
            content: row.stake,
            isWinningBet: row.isWinningBet,
        },
        {
            content: row.win,
            isWinningBet: row.isWinningBet,
            className: TEXT_RIGHT_ALIGN,
        },
    ];
};


const renderBetDetailHeader = (isLightningMode: boolean, translateCommon: any, translatePlinko: any) => {
    const defaultHeaderColumns = [
        { key: "gameMode", label: capitalizeFirstLetter(translatePlinko("mode")) },
        { key: "bet_choice", label: capitalizeFirstLetter(translatePlinko("row")) },
        { key: "stake", label: capitalizeFirstLetter(translateCommon("bet_amount")) },
        { key: "win", label: capitalizeFirstLetter(translateCommon("win")), align: "right" },
    ];

    const lightningHeaderColumns = [
        { key: "payoutSlot", label: capitalizeFirstLetter(translatePlinko("payout_slot")) },
        { key: "totalPegMultipliers", label: capitalizeFirstLetter(translateCommon("title_multiplier")) },
        { key: "stake", label: capitalizeFirstLetter(translateCommon("bet_amount")) },
        { key: "win", label: capitalizeFirstLetter(translateCommon("win")), align: "right" },
    ];

    const headerColumns = isLightningMode ? lightningHeaderColumns : defaultHeaderColumns;

    return (
        <div className="bg-table-header rounded-t-lg shrink-0 pr-3">
                <Table className="rounded-t-lg w-full">
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
                </Table>
            </div>
    );
};

const renderBetDetailRows = (data: BetDetailRow[], isLightningMode: boolean, translateCommon: any) => {
    const rowData = isLightningMode ? createLightningBetDetailRowData(data[0]) : createBetDetailRowData(data[0]);
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

const renderLightningModeRow = (pegMultipliers: any[], reachedPegMultipliers: any[], translateCommon: any, translatePlinko: any) => {
    if (!pegMultipliers || pegMultipliers.length === 0) {
        return null;
    }

    const isReachedPeg = (peg: any) => {
        if (!reachedPegMultipliers || reachedPegMultipliers.length === 0) {
            return false;
        }
        return reachedPegMultipliers.some((reachedPeg: any) =>
            reachedPeg.row === peg.row &&
            reachedPeg.column === peg.column &&
            reachedPeg.multiplier === peg.multiplier
        );
    };

    return (
        <div className="mt-4">
            <div className="font-semibold py-3 text-sm md:text-base">
                {capitalizeFirstLetter(translatePlinko("multiplier_position"))}
            </div>
            <div className="bg-table-header rounded-t-lg">
                <Table className="rounded-t-lg w-full">
                    <TableHeader className="sticky top-0 z-10 bg-table-header">
                        <TableRow>
                            <TableHead className="w-1/3 py-3 px-0 font-semibold text-white rounded-t-lg border-b border-primary-border text-sm md:text-base text-center">
                                {capitalizeFirstLetter(translatePlinko("column"))}
                            </TableHead>
                            <TableHead className="w-1/3 py-3 px-0 font-semibold text-white rounded-t-lg border-b border-primary-border text-sm md:text-base text-center">
                                {capitalizeFirstLetter(translatePlinko("row"))}
                            </TableHead>
                            <TableHead className="w-1/3 py-3 px-0 font-semibold text-white rounded-t-lg border-b border-primary-border text-sm md:text-base text-center">
                                {capitalizeFirstLetter(translateCommon("title_multiplier"))}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            </div>
            <div className="w-full">
                <Table className="w-full">
                    <TableBody>
                        {pegMultipliers.map((peg, index) => {
                            const reached = isReachedPeg(peg);
                            const tableCellStyles = cn(
                                "w-1/3 text-sm md:text-base text-center p-3",
                                reached ? "text-winning-highlight" : "text-secondary-text"
                            );
                            return (
                                <TableRow key={index} className={cn("border-none", index % 2 === 0 ? "bg-bet-detail-row-1" : "bg-bet-detail-row-2")}>
                                    <TableCell className={cn(
                                       tableCellStyles,
                                        index === pegMultipliers.length - 1 && "rounded-bl-lg"
                                    )}>
                                        {peg.column + 2}
                                    </TableCell>
                                    <TableCell className={cn(
                                       tableCellStyles,
                                    )}>
                                        {peg.row + 1}
                                    </TableCell>
                                    <TableCell className={cn(
                                       tableCellStyles,
                                        index === pegMultipliers.length - 1 && "rounded-br-lg"
                                    )}>
                                        {peg.multiplier}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

const PlinkoBetDetailTable = React.forwardRef<HTMLDivElement, BetDetailTableProps>(({ data, emptyMessage }, ref) => {
    const { t: translateCommon } = useCommonTranslate();
    const betDetailData = useBetDetailStore((state) => state.betDetailData);
    const { drawInfo } = betDetailData || {};
    const { t: translatePlinko } = useTranslate(ResourceTypes.PLINKO);

    // Check if any row reached max win (server-side) or if drawInfo has max win (client-side)
    const maxWinRow = data.find(row => row.reachMaxWin);
    const reachMaxWin = maxWinRow?.reachMaxWin || drawInfo?.reachMaxWin;

    const isLightningMode = drawInfo?.gameMode === GAME_MODES.LIGHTNING && !!drawInfo?.lightningBoard;

    if (!data || data.length === 0) {
        return (
            <div ref={ref} className="flex flex-col h-full min-h-0 w-full">
                {renderBetDetailHeader(isLightningMode, translateCommon, translatePlinko)}
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
            {renderBetDetailHeader(isLightningMode, translateCommon, translatePlinko)}

            <div className="w-full">
                <Table className="w-full pr-3">
                    <TableBody>{renderBetDetailRows(data, isLightningMode,translatePlinko)}</TableBody>
                </Table>
            </div>

            {drawInfo?.lightningBoard?.pegMultipliers && renderLightningModeRow(drawInfo.lightningBoard.pegMultipliers, drawInfo.settlementResult?.reachedPegMultipliers, translateCommon, translatePlinko)}

            {reachMaxWin && (
                <div className="font-semibold py-3 text-sm md:text-base">
                    <span>
                    {`${translateCommon("you_reach_max_win")}: ${numberWithCommas(Number(maxWinRow?.win), 2)}`}
                    </span>
                </div>
            )}
        </div>
    );
});

PlinkoBetDetailTable.displayName = "PlinkoBetDetailTable";

export { PlinkoBetDetailTable };
