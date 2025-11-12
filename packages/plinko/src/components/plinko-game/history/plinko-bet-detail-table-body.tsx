import { TableRow, TableCell, TableBody, Table } from "@shared/components/game-components/table";
import { cn } from "@shared/utils";
import { useTranslator } from "@shared/react-hooks";
import { ResourceTypes } from "@shared/resources";
import { useBetDetailStore } from "@shared/stores";
import { GAME_MODE_MAP, GAME_MODES } from "@plinko/constants";
import { numberWithCommas } from "@shared/helpers";
import { displayWinAmount } from "@shared/components/game-components/bet-history/bet-detail-utils";
import { memo } from "react";

const PlinkoBetDetailTableBody = () => {
    const data = useBetDetailStore((state) => state.data);
    const { t } = useTranslator([ResourceTypes.PLINKO]);
    const isLightningMode = data.gameMode === GAME_MODES.LIGHTNING && !!data.lightningBoard;
    const { settlementResult, lightningBoard } = data;
    const isWin = data?.betwin > data.amount;

    const getLightningTotalMultiplierDisplay = () => {
        const totalMultiplier = settlementResult.reachedPegMultipliers?.reduce((total, reachedPeg) => {
            return total + (reachedPeg.multiplier || 0);
        }, 0) || 0;
        return totalMultiplier === 0 ? "-" : `${numberWithCommas(totalMultiplier)}x`;
    };

    const rowData = [
        {
            content: isLightningMode
                ? `${numberWithCommas(lightningBoard.odds[settlementResult.slotIndex])}x`
                : t(`${ResourceTypes.PLINKO}.${GAME_MODE_MAP[data.gameMode]}`),
            isWinningBet: isLightningMode && isWin,
        },
        {
            content: isLightningMode ? getLightningTotalMultiplierDisplay() : data.numberOfRows,
            isWinningBet: isLightningMode && isWin,
        },
        {
            content: numberWithCommas(data.amount) ?? 0,
            isWinningBet: isWin,
        },
        {
            content: displayWinAmount(data.betWin ?? data.betwin ?? 0),
            className: "text-right",
            isWinningBet: isWin,
        },
    ];

    return (
        <div className="w-full">
            <Table className="w-full table-fixed">
                <TableBody>
                    <TableRow className={cn("border-none bg-bet-detail-row-1")}>
                        {rowData.map((cell, cellIndex) => (
                            <TableCell
                                key={cellIndex}
                                className={cn(
                                    "text-sm md:text-base text-secondary-text p-3",
                                    cell.className || "text-center",
                                    cell.isWinningBet && "text-winning-highlight",
                                    cellIndex === 0 && "rounded-bl-lg",
                                    cellIndex === rowData.length - 1 && "rounded-br-lg"
                                )}
                            >
                                {cell.content}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};

export default memo(PlinkoBetDetailTableBody);
