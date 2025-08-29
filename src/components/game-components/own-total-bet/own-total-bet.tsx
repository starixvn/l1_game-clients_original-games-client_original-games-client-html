import { numberWithCommas } from "../../../_shared/helpers";
import { useTranslator } from "../../../_shared/react-hooks";
import useGameStore from "../../../_shared/stores/game-store/game-store";

export const OwnTotalBet = () => {
    const ownBets = useGameStore((state) => state.ownBets);
    const totalBet = Object.values(ownBets).reduce((acc, curr) => acc + curr, 0);
    const { t } = useTranslator();

    return (
        <>
            <div className="text-sm mb-2 font-semibold">{t("common.total_bet")}</div>
            <div className="p-3 rounded-lg bg-secondary-bg border border-[#2b3648] text-sm">{numberWithCommas(totalBet)}</div>
        </>
    );
};
export default OwnTotalBet;
