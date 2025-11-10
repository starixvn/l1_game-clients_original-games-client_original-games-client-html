import { useTranslator } from "@shared/react-hooks";
import { ResourceTypes } from "@shared/resources";
import useBetDetailStore from "@shared/stores/bet-detail-store/bet-detail-store";
import { useGameContext } from "@shared/react-contexts";
import { GAME_MODE_MAP } from "@plinko/constants";

const PFVerifyResultBlock = () => {
    const { t } = useTranslator();
    const { tolgeeNamespace } = useGameContext();
    const betDetailData = useBetDetailStore((state) => state.data);
    if (!betDetailData || !betDetailData.roundId) {
        return null;
    }
    return (
        <div className="flex flex-col  gap-1.5">
            <div className="flex justify-between gap-6 text-sm md:text-base">
                <div className="flex items-center gap-1.5 font-[400] text-[var(--text-content-color)]">
                    {t(`${ResourceTypes.COMMON}.round`).capitalizeFirstLetter()}: {betDetailData.roundId}
                </div>

                <div className="flex items-center gap-1.5">
                    {betDetailData?.settlementResult ? (
                        <span className="flex items-center gap-1.5">
                            <div className="text-[var(--text-content-color)] font-[400]"> {t(`${ResourceTypes.COMMON}.result`)}:</div>
                            <div>{betDetailData?.settlementResult.multiplier}x</div>
                        </span>
                    ) : (
                        <span aria-label="no result">—</span>
                    )}
                </div>
            </div>
            <div className="flex justify-between gap-6 text-sm md:text-base">
                <div className="flex items-center gap-1.5 font-[400] text-[var(--text-content-color)]">
                    {t(`${tolgeeNamespace}.mode`).capitalizeFirstLetter()}:{" "}
                    {t(`${tolgeeNamespace}.${GAME_MODE_MAP[betDetailData.gameMode]}`)}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1.5">
                        <div className="text-[var(--text-content-color)] font-[400]">
                            {t(`${tolgeeNamespace}.row`).capitalizeFirstLetter()}:
                        </div>
                        <div>{betDetailData?.numberOfRows}</div>
                    </span>
                </div>
            </div>
        </div>
    );
};

const renderPFVerifyResultBlock = () => {
    return <PFVerifyResultBlock />;
};

export default renderPFVerifyResultBlock;
