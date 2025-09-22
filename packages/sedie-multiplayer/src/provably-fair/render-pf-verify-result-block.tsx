import { FC } from "react";
import { useTranslator } from "@shared/react-hooks";
import { DrawInfo } from "@shared/components/game-base/type";
import { ResourceTypes } from "@shared/resources";
import { getWinningSubOption } from "../history/sedie-multiplayer-bet-detail-result-block";
import Image from "next/image";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const PFVerifyResultBlock: FC<{ pfResult: DrawInfo }> = ({ pfResult }) => {
    const { t } = useTranslator();
    const winningSubOption = getWinningSubOption(pfResult.settlementResult);
    const IMAGE_SIZE = 36;

    return (
        <>
            <div className="flex justify-between gap-6 text-sm md:text-base">
                <div className="flex items-center gap-1.5 font-[400] text-[var(--text-content-color)]">
                    {t(`${ResourceTypes.COMMON}.round`).capitalizeFirstLetter()}: {pfResult?.roundId}
                </div>
                <div className="flex items-center gap-1.5">
                    {winningSubOption ? (
                        <span className="flex items-center gap-1.5">
                            <div className="text-[var(--text-content-color)] font-[400]"> {t(`${ResourceTypes.COMMON}.result`)}</div>
                            <Image
                                src={`${basePath}/static/images/sedie-multiplayer/bet-detail/bet-detail-${winningSubOption}.svg`}
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
