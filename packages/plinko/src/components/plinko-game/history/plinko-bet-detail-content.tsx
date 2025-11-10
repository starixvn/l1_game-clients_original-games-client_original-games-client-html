import { useClickSound, useCommonTranslate } from "@shared/react-hooks";
import { useBetDetailStore } from "@shared/stores/bet-detail-store";
import { usePopupStore } from "@shared/stores/popup-store";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";
import PlinkoBetDetailTable from "./plinko-bet-detail-table";
import { PlinkoBetDetailResultBlock, PlinkoSettlementResult } from "./plinko-bet-detail-result-block";
import { usePFStore } from "@shared/stores/pf-store";

export interface PlinkoBetDetailData {
    roundId: number;
    gameMode: number;
    numberOfRows: number;
    stake: string;
    win: string;
    reachMaxWin: boolean;
    settlementResult: PlinkoSettlementResult;
}

const PlinkoBetDetailContent: FC = () => {
    const data = useBetDetailStore((state) => state.data);

    const { togglePFVerify } = usePopupStore(useShallow((state) => ({ togglePFVerify: state.togglePFVerify })));
    const { updateRoundIdPfVerify } = usePFStore(useShallow((state) => ({ updateRoundIdPfVerify: state.updateRoundIdPfVerify })));

    const { t: translateCommon } = useCommonTranslate();
    const clickSound = useClickSound();

    if (!data) {
        return null;
    }

    const handleClickProvablyFair = () => {
        updateRoundIdPfVerify(data.roundId);
        togglePFVerify(true);
        clickSound();
    };

    return (
        <div className="mx-3 grid grid-rows-[auto_auto_auto_1fr] h-full min-h-0 gap-3">
            <div className="text-center font-inter text-sm md:text-base font-normal leading-5 text-secondary-text">
                {translateCommon("bet_detail_note").capitalizeFirstLetter()}
            </div>

            <PlinkoBetDetailResultBlock roundId={data.roundId} settlementResult={data.settlementResult} />

            <button
                className="clickable flex items-center gap-2 text-[#00C950] text-sm md:text-base font-medium w-fit"
                onClick={handleClickProvablyFair}
            >
                <span className="icon-pf flex justify-center items-center bg-gradient-to-b from-[#2DC555] to-[#1C8E3A] w-8 h-8 rounded-full text-[20px]"></span>
                <span className="underline">{translateCommon("pf_title_provably_fair").capitalizeFirstLetter()}</span>
            </button>

            <div className="min-h-0">
                <PlinkoBetDetailTable />
            </div>
        </div>
    );
};

export default PlinkoBetDetailContent;
