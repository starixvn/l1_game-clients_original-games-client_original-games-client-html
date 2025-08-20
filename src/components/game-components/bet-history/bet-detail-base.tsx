import { FC, ReactNode, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { numberWithCommas, separateDateTime, sortedCollectionByTime } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { useClickSound, useCommonTranslate } from "../../../_shared/react-hooks";
import { useBetDetailStore } from "../../../_shared/stores/bet-detail-store";
import { DrawInfo } from "../../game-base/type";
import { Table, TableColumn } from "../table";
import usePopupStore from "../../../_shared/stores/popup-store/popup-store";

// Define the data structure for bet detail rows
interface BetDetailRow {
    time: ReactNode;
    betChoice: ReactNode;
    odds: ReactNode;
    stake: ReactNode;
    win: ReactNode;
}

const BetDetailBase: FC<{
    isTurnBase: boolean;
    renderBetDetailResultBlock: (drawInfo: DrawInfo) => ReactNode;
    produceDataBetDetailRow: (
        betLogDetail: any,
        drawInfo: DrawInfo
    ) => {
        rawTime: Date;
        amount: number;
        choice: any;
        odds: number;
        win: number;
        hightlight: boolean;
        hideOdd?: boolean;
    };
    renderBetChoice?: (choice: any) => ReactNode;
}> = ({ renderBetDetailResultBlock, produceDataBetDetailRow, renderBetChoice }) => {
    const { betDetailData } = useBetDetailStore(
        useShallow((state) => ({
            betDetailData: state.betDetailData,
        }))
    );

    const { togglePFVerify } = usePopupStore(
        useShallow((state) => ({
            togglePFVerify: state.togglePFVerify,
        }))
    );

    const { drawInfo, betLogDetails } = betDetailData || {};
    const { t: translateCommon } = useCommonTranslate();
    const { fractionalOddsFormat } = usePlayerContext();
    const clickSound = useClickSound();

    const columns: TableColumn<BetDetailRow>[] = useMemo(
        () => [
            { key: "time", header: translateCommon("time") },
            { key: "betChoice", header: translateCommon("bet_choice") },
            { key: "odds", header: translateCommon("odds") },
            { key: "stake", header: translateCommon("stake") },
            { key: "win", header: translateCommon("win") },
        ],
        [translateCommon]
    );

    const preprocessedBetLogDetails = useMemo(() => sortedCollectionByTime(betLogDetails || []), [betLogDetails]);

    const tableData: BetDetailRow[] = useMemo(() => {
        if (!drawInfo || !betLogDetails) {
            return [];
        }

        return preprocessedBetLogDetails.map((betLogDetail) => {
            const { rawTime, amount, choice, odds, win, hightlight, hideOdd } = produceDataBetDetailRow(betLogDetail, drawInfo);
            const { date, time } = separateDateTime(rawTime);

            const calcOdds = hideOdd ? "-" : numberWithCommas(fractionalOddsFormat ? odds - 1 : odds);
            const highlightClass = hightlight ? "highlight" : "";

            return {
                time: (
                    <>
                        {time}
                        <br />
                        {date}
                    </>
                ),
                betChoice: <div className={highlightClass}>{renderBetChoice ? renderBetChoice(choice) : choice}</div>,
                odds: <div className={highlightClass}>{calcOdds}</div>,
                stake: <div className={highlightClass}>{numberWithCommas(amount) ?? 0}</div>,
                win: <div className={highlightClass}>{numberWithCommas(win)}</div>,
            };
        });
    }, [preprocessedBetLogDetails, produceDataBetDetailRow, drawInfo, fractionalOddsFormat, renderBetChoice, betLogDetails]);

    if (!drawInfo || !betLogDetails) {
        return null;
    }

    const handleClickProvablyFair = () => {
        togglePFVerify(true);
        clickSound();
    };

    console.log("Render");

    return (
        <>
            <div className="text-center font-inter text-[14px] font-normal leading-5 text-primary-text my-3">
                Note: Data are only available within the last 7 days from the current date.
            </div>
            {drawInfo.result && renderBetDetailResultBlock(drawInfo)}

            <button className={`clickable flex items-center gap-1 px-2 pb-2 text-[#20e500] text-sm font-semibold}`} onClick={handleClickProvablyFair}>
                <span className={`icon-pf flex justify-center items-center bg-[#159500] w-8 h-8 rounded-xl}`}></span>
                {translateCommon("pf_title_provably_fair").capitalizeFirstLetter()}
            </button>

            <div className="[--more-info-height:68px]">
                <Table columns={columns} data={tableData} emptyMessage={translateCommon("no_data")} className="bet-detail-table" />
            </div>
        </>
    );
};

export default BetDetailBase;
