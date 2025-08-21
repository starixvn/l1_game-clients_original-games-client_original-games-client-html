import { FC, ReactNode, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { numberWithCommas, separateDateTime, sortedCollectionByTime } from "../../../_shared/helpers";
import { useClickSound, useCommonTranslate } from "../../../_shared/react-hooks";
import { useBetDetailStore } from "../../../_shared/stores/bet-detail-store";
import { DrawInfo } from "../../game-base/type";
import { BetDetailTable } from "./bet-detail-table";
import usePopupStore from "../../../_shared/stores/popup-store/popup-store";
import { calculateTotalStake, calculateTotalWinFromTable, displayWinAmount } from "./bet-detail-utils";

const BetDetailBase: FC<{
  isTurnBase: boolean;
  renderBetDetailResultBlock: (drawInfo: DrawInfo) => ReactNode;
  produceDataBetDetailRow: Function;
  renderBetChoice?: (choice: any) => ReactNode;
}> = ({ renderBetDetailResultBlock, produceDataBetDetailRow, renderBetChoice }) => {
  const betDetailData = useBetDetailStore(state => state.betDetailData);

  const { togglePFVerify } = usePopupStore(useShallow(state => ({ togglePFVerify: state.togglePFVerify })));
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
  };

  const handleClickProvablyFair = () => {
    togglePFVerify(true);
    clickSound();
  };

  return (
    <div className="mx-3 grid grid-rows-[auto_auto_auto_1fr] h-full min-h-0 gap-3">
      <div className="text-center font-inter text-[14px] font-normal leading-5 text-secondary-text">
        Note: Data are only available within the last 7 days from the current date.
      </div>

      {drawInfo.result && (
        <div>
          {renderBetDetailResultBlock(drawInfo)}
        </div>
      )}

      <button
        className="clickable flex items-center gap-2 text-[#00C950] text-sm font-medium"
        onClick={handleClickProvablyFair}
      >
        <span className="icon-pf flex justify-center items-center bg-gradient-to-b from-[#2DC555] to-[#1C8E3A] w-8 h-8 rounded-full"></span>
        <span className="underline">
          {translateCommon("pf_title_provably_fair").capitalizeFirstLetter()}
        </span>
      </button>

      <div className="min-h-0">
        <BetDetailTable
          data={tableData}
          totalStake={calculateTotalStake(betLogDetails, produceDataBetDetailRow, drawInfo)}
          netProfit={calculateTotalWinFromTable(tableData) - calculateTotalStake(betLogDetails, produceDataBetDetailRow, drawInfo)}
          emptyMessage={translateCommon("no_data")}
        />
      </div>
    </div>
  );
};

export default BetDetailBase;
