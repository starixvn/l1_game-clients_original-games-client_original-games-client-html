import { FC } from "react";
import { useTranslator } from "../../../_shared/react-hooks";
import { DrawInfo, PFResult } from "../../../components/game-base/type";
import { ResourceTypes } from "../../../_shared/resources";
import { getWinningSubOption } from "../history/sedie-multiplayer-bet-detail-result-block";
import Image from "next/image";
import { useBetDetailStore } from "../../../_shared/stores/bet-detail-store/bet-detail-store";

const PFVerifyResultBlock: FC<{ pfResult: DrawInfo }> = ({ pfResult }) => {
    const { t } = useTranslator();
    const winningSubOption = getWinningSubOption(pfResult.settlementResult);
    const IMAGE_SIZE = 36;

    return (
        <>
            <div className="flex justify-between gap-6 px-2 text-secondary-text text-sm">
                <div className="flex items-center gap-1.5 font-medium">
                    {t(`${ResourceTypes.COMMON}.round`).capitalizeFirstLetter()}: {pfResult?.drawId}
                </div>
                <div className="flex items-center gap-1.5">
                    {winningSubOption ? (
                        <span className="flex items-center gap-1.5">
                            <span className="text-secondary-text">Result</span>
                            <Image
                                src={`/static/images/sedie-multiplayer/bet-detail-${winningSubOption}.svg`}
                                alt={`${winningSubOption} result`}
                                width={IMAGE_SIZE}
                                height={IMAGE_SIZE}
                            />
                        </span>
                    ) : (
                        <span aria-label="no result">—</span>
                    )}
                </div>
            </div>
        </>
    );
};

const renderPFVerifyResultBlock = (pfResult: DrawInfo) => {
    return <PFVerifyResultBlock pfResult={pfResult} />;
};

export default renderPFVerifyResultBlock;
