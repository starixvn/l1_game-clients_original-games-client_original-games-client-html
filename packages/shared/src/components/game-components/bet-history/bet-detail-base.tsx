import { numberWithCommas, separateDateTime, sortedCollectionByTime } from "@shared/helpers";
import { useClickSound, useCommonTranslate } from "@shared/react-hooks";
import { useBetDetailStore } from "@shared/stores/bet-detail-store";
import usePopupStore from "@shared/stores/popup-store/popup-store";
import { FC, ReactNode, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { DrawInfo } from "../../game-base/type";
import { BetDetailTable } from "./bet-detail-table";
import { calculateTotalStake, calculateTotalWinFromTable, displayWinAmount } from "./bet-detail-utils";

const BetDetailBase: FC<{
    isTurnBase: boolean;
    renderBetDetailResultBlock: (drawInfo: DrawInfo) => ReactNode;
    produceDataBetDetailRow: Function;
    renderBetChoice?: (choice: any) => ReactNode;
    isEnableProvablyFair?: boolean;
}> = ({ renderBetDetailResultBlock, produceDataBetDetailRow, renderBetChoice, isEnableProvablyFair }) => {
    const betDetailData = useBetDetailStore((state) => state.betDetailData);

    const { togglePFVerify } = usePopupStore(useShallow((state) => ({ togglePFVerify: state.togglePFVerify })));
    const { drawInfo, betLogDetails } = betDetailData || {};
    const { t: translateCommon } = useCommonTranslate();
    const clickSound = useClickSound();

    const preprocessedBetLogDetails = useMemo(() => sortedCollectionByTime(betLogDetails || []), [betLogDetails]);

    const tableData = useMemo(() => {
        if (!drawInfo || !betLogDetails) {
            return [];
        }
        return preprocessedBetLogDetails.map((betLogDetail) => {
            const { rawTime, amount, choice, odds, win } = produceDataBetDetailRow(betLogDetail, drawInfo);
            const { time } = separateDateTime(rawTime);

            return {
                time: time,
                betChoice: renderBetChoice ? renderBetChoice(choice) : choice,
                stake: numberWithCommas(amount, 2) ?? 0,
                win: displayWinAmount(amount, odds, win),
                isWinningBet: win > 0,
            };
        });
    }, [preprocessedBetLogDetails, produceDataBetDetailRow, drawInfo, renderBetChoice, betLogDetails]);

    if (!drawInfo || !betLogDetails) {
        return null;
    }

    const handleClickProvablyFair = () => {
        togglePFVerify(true);
        clickSound();
    };

    const renderButtonProvablyFair = () => {
        if (!isEnableProvablyFair) {
            return null;
        }

        return (
            <button
                className="clickable flex items-center gap-2 text-[#00C950] text-sm md:text-base font-medium w-fit"
                onClick={handleClickProvablyFair}
            >
                <span className="icon-pf flex justify-center items-center bg-gradient-to-b from-[#2DC555] to-[#1C8E3A] w-8 h-8 rounded-full"></span>
                <span className="underline">{translateCommon("pf_title_provably_fair").capitalizeFirstLetter()}</span>
            </button>
        );
    };

    return (
        <div className="mx-3 grid grid-rows-[auto_auto_auto_1fr] h-full min-h-0 gap-3">
            <div className="text-center font-inter text-sm md:text-base font-normal leading-5 text-secondary-text">
                {translateCommon("bet_detail_note").capitalizeFirstLetter()}
            </div>

            {drawInfo.result && <div>{renderBetDetailResultBlock(drawInfo)}</div>}

            {renderButtonProvablyFair()}

            <div className="min-h-0">
                <BetDetailTable
                    data={tableData}
                    totalStake={calculateTotalStake(betLogDetails, produceDataBetDetailRow, drawInfo)}
                    netProfit={
                        calculateTotalWinFromTable(tableData) - calculateTotalStake(betLogDetails, produceDataBetDetailRow, drawInfo)
                    }
                    emptyMessage={translateCommon("no_data")}
                />
            </div>
        </div>
    );
};

export default BetDetailBase;
