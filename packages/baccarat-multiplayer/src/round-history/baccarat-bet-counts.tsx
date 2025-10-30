import React from "react";
import Image from "next/image";
import { Round } from "@shared/components/game-base/type";
import { BaccaratResult, BaccaratSettlementResult, BaccaratBetOptions, BaccaratWinner, Winner } from "../baccarat-multiplayer-constants";
import { calculateBaccaratBetCounts, BaccaratBetCounts, getScoreboardImagePath, getDisplayTextKey } from "../scoreboard/utils";
import { ResourceTypes } from "@shared/resources";
import { useTranslator } from "@shared/react-hooks/use-translator";

interface BetCountItemProps {
    choice: string;
    count: number;
}

interface BaccaratBetCountsProps {
    roundHistory: Round<BaccaratResult, BaccaratSettlementResult>[];
    onOpenGuide?: () => void;
    isTooltipVisible?: boolean;
    onCloseGuide?: () => void;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

type BetCountVariant = BaccaratWinner | "playerPair" | "bankerPair";

const BetCountItem: React.FC<BetCountItemProps> = ({ choice, count }) => {
    const { t } = useTranslator([ResourceTypes.BACCARAT_MULTIPLAYER]);

    const getChoiceVariant = (choice: string): BetCountVariant | null => {
        switch (choice) {
            case BaccaratBetOptions.PLAYER:
                return Winner.PLAYER;
            case BaccaratBetOptions.BANKER:
                return Winner.BANKER;
            case BaccaratBetOptions.TIE:
                return Winner.TIE;
            case "playerPair":
                return "playerPair";
            case "bankerPair":
                return "bankerPair";
            default:
                return null;
        }
    };

    const getIconSrc = (variant: BetCountVariant): string => {
        switch (variant) {
            case "playerPair":
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/player-pair.svg`;
            case "bankerPair":
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/banker-pair.svg`;
            default:
                return getScoreboardImagePath(variant);
        }
    };

    const getDisplayText = (variant: BetCountVariant): string => {
        const key = getDisplayTextKey(variant);
        return key ? t(key) : "";
    };

    const variant = getChoiceVariant(choice);

    if (!variant) {
        return null;
    }

    const iconSrc = getIconSrc(variant);
    const displayText = getDisplayText(variant);

    return (
        <div className="flex items-center gap-1 pr-3 rounded transition-all duration-200">
            <div className="relative flex items-center justify-center w-4 h-4">
                {iconSrc && (
                    <>
                        <Image src={iconSrc} alt={choice} width={16} height={16} className="w-4 h-4" />
                        {displayText && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-center text-[11px] font-semibold z-[1]">
                                {displayText}
                            </span>
                        )}
                    </>
                )}
            </div>
            <div className="text-sm font-normal text-white min-w-[18px] text-left">{count}</div>
        </div>
    );
};

const BaccaratBetCountsComponent: React.FC<BaccaratBetCountsProps> = ({ roundHistory, onOpenGuide, isTooltipVisible, onCloseGuide }) => {
    const betCounts = calculateBaccaratBetCounts(roundHistory);

    const countItems = [
        { choice: BaccaratBetOptions.PLAYER, count: betCounts.player },
        { choice: BaccaratBetOptions.BANKER, count: betCounts.banker },
        { choice: BaccaratBetOptions.TIE, count: betCounts.tie },
        { choice: "playerPair", count: betCounts.playerPair },
        { choice: "bankerPair", count: betCounts.bankerPair },
    ];

    return (
        <div className="relative">
            <div className="flex gap-1 px-1 py-2 items-center">
                {countItems.map((item) => (
                    <BetCountItem key={item.choice} choice={item.choice} count={item.count} />
                ))}
                <Image
                    src={`${basePath}/static/images/icons/scoreboard-question-mark.svg`}
                    alt="scoreboard-question-mark"
                    width={16}
                    height={16}
                    className="w-4 h-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onOpenGuide?.()}
                />
            </div>
            {isTooltipVisible && (
                <div
                    className="absolute inset-0 z-40"
                    onClick={(event) => {
                        event.stopPropagation();
                        onCloseGuide?.();
                    }}
                />
            )}
        </div>
    );
};

export { BaccaratBetCountsComponent, type BaccaratBetCounts };
export default BaccaratBetCountsComponent;
