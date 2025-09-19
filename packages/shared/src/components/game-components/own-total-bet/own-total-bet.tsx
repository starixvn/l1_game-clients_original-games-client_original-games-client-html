import { numberWithCommas } from "@shared/helpers";
import { useCommonTranslate } from "@shared/react-hooks";
import useGameStore from "@shared/stores/game-store/game-store";

export const OwnTotalBet = () => {
    const ownBets = useGameStore((state) => state.ownBets);
    const totalBet = Object.values(ownBets).reduce((acc, curr) => acc + curr, 0);
    const { t } = useCommonTranslate();

    return (
        <>
            <div className="own-total-bet-glow"></div>
            <div className="text-sm md:text-base mb-2 font-semibold">{t("total_bet")}</div>
            <div className="p-3 rounded-lg bg-secondary-bg border border-[#2b3648] text-sm">{numberWithCommas(totalBet)}</div>
        </>
    );
};
export default OwnTotalBet;
