import { memo } from "react";
import { Table, TableBody, TableCell, TableRow } from "../table";
import { cn } from "@shared/utils";
import { formatNumber } from "./bet-detail-utils";
import { useCommonTranslate } from "@shared/react-hooks";
import useBetDetailStore from "@shared/stores/bet-detail-store/bet-detail-store";

const BetDetailTableSummary = () => {
    const { t: translateCommon } = useCommonTranslate();
    const betDetailData = useBetDetailStore((state) => state.data);
    if (!betDetailData) {
        return null;
    }
    const totalStake = betDetailData?.totalAmount || 0;
    const betWin = betDetailData?.betWin || betDetailData.betwin || 0;
    const netProfit = betWin - totalStake;
    return (
        <div className="shrink-0 w-full">
            <Table className="w-full pr-3">
                <TableBody>
                    <TableRow className="border-none font-semibold text-secondary-text text-sm md:text-base bg-[#31415B] table w-full table-fixed">
                        <TableCell colSpan={2} className="w-1/2 text-center p-3 px-0">
                            {translateCommon("total")}
                        </TableCell>
                        <TableCell className="w-1/4 text-center p-3 px-0 font-normal">{formatNumber(totalStake)}</TableCell>
                        <TableCell className={cn("w-1/4 font-normal text-right p-3 px-0 pr-3", betWin > 0 && "text-winning-highlight")}>
                            {formatNumber(betWin)}
                        </TableCell>
                    </TableRow>
                    <TableRow className="border-none font-semibold text-secondary-text text-sm md:text-base bg-[#253248] table w-full table-fixed rounded-b-lg">
                        <TableCell colSpan={2} className="w-1/2 text-center p-3 px-0">
                            {translateCommon("win_loss")}
                        </TableCell>
                        <TableCell className="w-1/4 text-center p-3 px-0 font-normal"></TableCell>
                        <TableCell className={cn("w-1/4 text-right p-3 px-0 pr-3 font-normal", netProfit > 0 && "text-winning-highlight")}>
                            {formatNumber(netProfit)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};

export default memo(BetDetailTableSummary);
