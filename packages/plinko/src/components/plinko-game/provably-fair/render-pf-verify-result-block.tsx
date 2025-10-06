
import { gameModeMap } from "@shared/helpers/plinko";
import { usePlinkoTranslate, useTranslator } from "@shared/react-hooks";
import { ResourceTypes } from "@shared/resources";
import useBetDetailStore from "@shared/stores/bet-detail-store/bet-detail-store";


const PFVerifyResultBlock = () => {
    const { t } = useTranslator();
    const { t: translatePlinko } = usePlinkoTranslate();
    const betDetailData = useBetDetailStore((state) => state.betDetailData);

    return (
        <>
            <div className="flex flex-col  gap-1.5">
                <div className="flex justify-between gap-6 text-sm md:text-base">
                    <div className="flex items-center gap-1.5 font-[400] text-[var(--text-content-color)]">
                        {t(`${ResourceTypes.COMMON}.round`).capitalizeFirstLetter()}: {betDetailData.drawInfo?.roundId}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {betDetailData.drawInfo?.settlementResult ? (
                            <span className="flex items-center gap-1.5">
                                <div className="text-[var(--text-content-color)] font-[400]"> {t(`${ResourceTypes.COMMON}.result`)}:</div>
                                <div>{betDetailData.drawInfo?.settlementResult.multiplier}x</div>
                            </span>
                        ) : (
                            <span aria-label="no result">—</span>
                        )}
                    </div>
                </div>
                <div className="flex justify-between gap-6 text-sm md:text-base">
                    <div className="flex items-center gap-1.5 font-[400] text-[var(--text-content-color)]">
                        {translatePlinko(`mode`).capitalizeFirstLetter()}: {translatePlinko(gameModeMap[betDetailData.betLogDetails[0]?.gameMode])}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1.5">
                            <div className="text-[var(--text-content-color)] font-[400]"> {t(`${ResourceTypes.PLINKO}.row`).capitalizeFirstLetter()}:</div>
                            <div>{betDetailData.betLogDetails[0].choice}</div>
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

const renderPFVerifyResultBlock = () => {
    return <PFVerifyResultBlock />;
};

export default renderPFVerifyResultBlock;
