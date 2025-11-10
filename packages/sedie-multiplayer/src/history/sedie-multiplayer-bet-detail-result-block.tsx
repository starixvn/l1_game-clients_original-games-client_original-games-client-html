import { FC } from "react";
import Image from "next/image";
import { useCommonTranslate } from "@shared/react-hooks";
import { SeDieBetOptions } from "../sedie-multiplayer-constants";
import useBetDetailStore from "@shared/stores/bet-detail-store";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const SUB_OPTIONS = [
    SeDieBetOptions.RED2,
    SeDieBetOptions.RED3,
    SeDieBetOptions.RED4,
    SeDieBetOptions.WHITE3,
    SeDieBetOptions.WHITE4,
] as const;

const IMAGE_SIZE = 30;

export const getWinningSubOption = (settlementResult: Record<string, boolean>): string => {
    return SUB_OPTIONS.find((option) => settlementResult[option]) || "";
};

export const BetDetailResultBlock: FC = () => {
    const { t: translateCommon } = useCommonTranslate();
    const betDetailData = useBetDetailStore((state) => state.data);
    if (!betDetailData) {
        return null;
    }

    const winningSubOption = getWinningSubOption(betDetailData.settlementResult);

    return (
        <div className="flex justify-between text-secondary-text text-sm md:text-base mt-2">
            <div className="flex items-center gap-1.5 font-medium">
                {translateCommon("round").capitalizeFirstLetter()}: <span>{betDetailData.roundId}</span>
            </div>
            <div className="flex items-center gap-1.5">
                {winningSubOption ? (
                    <span className="flex items-center gap-1.5">
                        <span className="text-secondary-text">{translateCommon("result")}</span>
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
    );
};
