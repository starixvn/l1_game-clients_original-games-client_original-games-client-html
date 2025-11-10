import * as React from "react";
import { useCommonTranslate } from "@shared/react-hooks";
import useBetDetailStore from "@shared/stores/bet-detail-store";
import { numberWithCommas } from "@shared/helpers";
import { memo } from "react";
import PlinkoBetDetailTableHeader from "./plinko-bet-detail-table-header";
import PlinkoBetDetailTableBody from "./plinko-bet-detail-table-body";
import PlinkoBetDetailTableLightning from "./plinko-bet-detail-table-lightning";

const PlinkoBetDetailTable = () => {
    const { t: translateCommon } = useCommonTranslate();
    const betDetailData = useBetDetailStore((state) => state.data);

    // Check if any row reached max win (server-side) or if drawInfo has max win (client-side)
    const reachMaxWin = betDetailData.reachMaxWin;

    if (!betDetailData) {
        return null;
    }

    return (
        <div className="flex flex-col h-full w-full">
            <PlinkoBetDetailTableHeader />
            <PlinkoBetDetailTableBody />
            <PlinkoBetDetailTableLightning />

            {reachMaxWin && (
                <div className="font-semibold py-3 text-sm md:text-base">
                    <span>
                        {translateCommon("you_reach_max_win")}: {numberWithCommas(betDetailData?.betWin ?? betDetailData?.betwin ?? 0, 2)}
                    </span>
                </div>
            )}
        </div>
    );
};

export default memo(PlinkoBetDetailTable);
