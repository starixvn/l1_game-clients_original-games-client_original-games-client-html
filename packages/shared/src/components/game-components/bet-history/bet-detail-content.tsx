import { useClickSound, useCommonTranslate } from "@shared/react-hooks";
import { useBetDetailStore } from "@shared/stores/bet-detail-store";
import usePopupStore from "@shared/stores/popup-store/popup-store";
import { FC, ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import BetDetailTable from "./bet-detail-table";
import { usePFStore } from "@shared/stores/pf-store";

const BetDetailContent: FC<{
    ResultBlock?: ReactNode;
    Table?: ReactNode;
    isEnableProvablyFair?: boolean;
}> = ({ ResultBlock, Table = <BetDetailTable />, isEnableProvablyFair = true }) => {
    const { togglePFVerify } = usePopupStore(useShallow((state) => ({ togglePFVerify: state.togglePFVerify })));
    const { updateRoundIdPfVerify } = usePFStore(useShallow((state) => ({ updateRoundIdPfVerify: state.updateRoundIdPfVerify })));
    const { t: translateCommon } = useCommonTranslate();
    const clickSound = useClickSound();

    const betDetailData = useBetDetailStore((state) => state.data);
    if (!betDetailData) {
        return null;
    }

    const handleClickProvablyFair = () => {
        updateRoundIdPfVerify(betDetailData.roundId);
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
                <span className="icon-pf flex justify-center items-center bg-gradient-to-b from-[#2DC555] to-[#1C8E3A] w-8 h-8 rounded-full text-[20px]"></span>
                <span className="underline">{translateCommon("pf_title_provably_fair").capitalizeFirstLetter()}</span>
            </button>
        );
    };

    return (
        <div className="mx-3 grid grid-rows-[auto_auto_auto_1fr] h-full min-h-0 gap-3">
            <div className="text-center font-inter text-sm md:text-base font-normal leading-5 text-secondary-text">
                {translateCommon("bet_detail_note").capitalizeFirstLetter()}
            </div>

            {ResultBlock}

            {renderButtonProvablyFair()}

            <div className="min-h-0">{Table}</div>
        </div>
    );
};

export default BetDetailContent;
