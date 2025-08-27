import { numberWithCommas } from "../../../_shared/helpers";
import useGameStore from "../../../_shared/stores/game-store/game-store";

export const OwnTotalBet = () => {
    const ownBets = useGameStore((state) => state.ownBets);
    const totalBet = Object.values(ownBets).reduce((acc, curr) => acc + curr, 0);

    return (
        <>
            <div className="text-sm mb-2 font-semibold">Total Bet</div>
            <div className="p-3 rounded-lg bg-secondary-bg border border-[#2b3648] text-sm">{numberWithCommas(totalBet)}</div>
        </>
    );
};
export default OwnTotalBet;
