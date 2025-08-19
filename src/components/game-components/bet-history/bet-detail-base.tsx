import { FC, ReactNode, useMemo } from "react";

import { numberWithCommas, separateDateTime, sortedCollectionByTime } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { useClickSound, useCommonTranslate } from "../../../_shared/react-hooks";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { DrawInfo } from "../../game-base/type";
import { InfiniteTable } from "../infinite-table";
import Styles from "./bet-history.module.scss";
import { usePFStore } from "../../../_shared/stores/pf-store/pf-store";
import { useShallow } from "zustand/react/shallow";

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
    const { betDetailModalData } = useGameStore();
    const { drawInfo, betLogDetails } = betDetailModalData || {};
    const { t: translateCommon } = useCommonTranslate();
    const { fractionalOddsFormat } = usePlayerContext();
    const clickSound = useClickSound();
    const { togglePFVerify } = usePFStore(useShallow((state) => ({
        togglePFVerify: state.togglePFVerify,
    })));

    if (!drawInfo || !betLogDetails) {
        return null;
    }

    const handleClickProvablyFair = () => {
        clickSound();
        togglePFVerify(true);
    };

    const header = [
        { node: translateCommon("time") },
        { node: translateCommon("bet_choice") },
        { node: translateCommon("odds") },
        { node: translateCommon("stake") },
        { node: translateCommon("win") },
    ];

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const preprocessedBetLogDetails = useMemo(() => sortedCollectionByTime(betLogDetails || []), [betLogDetails]);

    const body = preprocessedBetLogDetails.map((betLogDetail) => {
        const { rawTime, amount, choice, odds, win, hightlight, hideOdd } = produceDataBetDetailRow(betLogDetail, drawInfo);
        const { date, time } = separateDateTime(rawTime);

        const calcOdds = hideOdd ? "-" : numberWithCommas(fractionalOddsFormat ? odds - 1 : odds);

        return [
            {
                node: (
                    <>
                        {time}
                        <br />
                        {date}
                    </>
                ),
            },
            ...[renderBetChoice ? renderBetChoice(choice) : choice, calcOdds, numberWithCommas(amount) ?? 0].map((item) => {
                return { node: <div className={hightlight ? "highlight" : ""}>{item}</div> };
            }),
            {
                node: <div className={hightlight ? "highlight" : ""}>{numberWithCommas(win)}</div>,
            },
        ];
    });

    console.log("Render");

    return (
        <>
            {drawInfo.result && renderBetDetailResultBlock(drawInfo)}

            <button className={`clickable ${Styles["provably-fair"]}`} onClick={handleClickProvablyFair}>
                <span className={`icon-pf ${Styles["icon-pf"]}`}></span>
                {translateCommon("pf_title_provably_fair").capitalizeFirstLetter()}
            </button>

            <InfiniteTable header={header} body={body} customTableContainerStyles={Styles["bet-detail"]} />
        </>
    );
};

export default BetDetailBase;
