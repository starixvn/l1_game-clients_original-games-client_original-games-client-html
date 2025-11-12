import { memo, useCallback, useMemo } from "react";
import { cn } from "@shared/utils";
import { TableCell, TableRow } from "../table";
import { formatDateTime, formatWinValue, getRoundId, getWinValueColorClass } from "./bet-history-utils";
import usePopupStore from "@shared/stores/popup-store/popup-store";
import useBetDetailStore from "@shared/stores/bet-detail-store";
import { useClickSound } from "@shared/react-hooks";
import { separateDateTime } from "@shared/helpers/time-helper";
import { numberWithCommas } from "@shared/helpers";
import { BetLog } from "@shared/components/game-base/type";

interface BetHistoryBodyItemCell {
    content: React.ReactNode;
    className?: string;
    isClickable?: boolean;
}
interface BetHistoryBodyItemProps {
    data: BetLog;
    mapDataToCells: (data: BetLog) => BetHistoryBodyItemCell[];
}

const BetHistoryBodyItem = ({ data, mapDataToCells }: BetHistoryBodyItemProps) => {
    const toggleBetDetail = usePopupStore((state) => state.toggleBetDetail);
    const setBetDetailData = useBetDetailStore((state) => state.setData);
    const clickSound = useClickSound();

    const handleCellClick = useCallback(
        (data: BetLog) => {
            clickSound();
            setBetDetailData(data);
            toggleBetDetail(true);
        },
        [clickSound, toggleBetDetail, setBetDetailData]
    );

    const defaultMapDataToCells = useCallback((data: BetLog) => {
        const { date, time } = separateDateTime(data.time);
        return [
            {
                content: <div style={{ whiteSpace: "pre-line" }}>{formatDateTime(date, time)}</div>,
            },
            {
                content: <span className="text-table-text-clickable cursor-pointer">{getRoundId(data)}</span>,
                className: "text-table-text-clickable cursor-pointer",
                isClickable: true,
            },
            {
                content: numberWithCommas(data.totalAmount),
            },
            {
                content: (
                    <div className={getWinValueColorClass(formatWinValue(data.betWin ?? data.betwin ?? 0), data.totalAmount.toString())}>
                        {numberWithCommas(data.betWin)}
                    </div>
                ),
                className: "text-right",
            },
        ];
    }, []);
    const cells = useMemo(() => (mapDataToCells || defaultMapDataToCells)(data), [data, mapDataToCells, defaultMapDataToCells]);
    return (
        <TableRow className={cn("border-none text-center")}>
            {cells.map((cell, index) => (
                <TableCell
                    key={index}
                    className={cn("text-secondary-text h-[60px] py-2 px-2 md:text-base", cell.className)}
                    onClick={cell.isClickable ? () => handleCellClick(data) : undefined}
                >
                    {cell.content}
                </TableCell>
            ))}
        </TableRow>
    );
};

export default memo(BetHistoryBodyItem);
