import React from "react";
import Image from "next/image";
import { Round } from "@shared/components/game-base/type";
import { BaccaratResult, BaccaratSettlementResult, BaccaratBetOptions } from "../baccarat-multiplayer-constants";
import { calculateBaccaratBetCounts, BaccaratBetCounts } from "../scoreboard/utils";

// Types and Interfaces
interface BetCountItemProps {
    choice: string;
    count: number;
}

interface BaccaratBetCountsProps {
    roundHistory: Round<BaccaratResult, BaccaratSettlementResult>[];
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";


// Component for individual bet count item
const BetCountItem: React.FC<BetCountItemProps> = ({ choice, count }) => {
    const getChoiceIcon = (choice: string) => {
        switch (choice) {
            case BaccaratBetOptions.PLAYER:
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/player.svg`;
            case BaccaratBetOptions.BANKER:
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/banker.svg`;
            case BaccaratBetOptions.TIE:
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/tie.svg`;
            case "playerPair":
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/player-pair.svg`;
            case "bankerPair":
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/banker-pair.svg`;
            default:
                return "";
        }
    };

    const iconSrc = getChoiceIcon(choice);

    return (
        <div className="flex items-center gap-1 pr-3 rounded transition-all duration-200">
            <div className="flex items-center justify-center w-4 h-4">
                {iconSrc && <Image src={iconSrc} alt={choice} width={16} height={16} className="w-4 h-4" />}
            </div>
            <div className="text-sm font-normal text-white text-right">{count}</div>
        </div>
    );
};

const BaccaratBetCountsComponent: React.FC<BaccaratBetCountsProps> = ({ roundHistory }) => {
    const betCounts = calculateBaccaratBetCounts(roundHistory);

    const countItems = [
        { choice: BaccaratBetOptions.PLAYER, count: betCounts.player },
        { choice: BaccaratBetOptions.BANKER, count: betCounts.banker },
        { choice: BaccaratBetOptions.TIE, count: betCounts.tie },
        { choice: "playerPair", count: betCounts.playerPair },
        { choice: "bankerPair", count: betCounts.bankerPair },
    ];

    return (
        <div className="flex gap-1 px-1 py-2 items-center">
            {countItems.map((item) => (
                <BetCountItem key={item.choice} choice={item.choice} count={item.count} />
            ))}
            <Image
                src={`${basePath}/static/images/icons/scoreboard-question-mark.svg`}
                alt="scoreboard-question-mark"
                width={16}
                height={16}
                className="w-4 h-4 cursor-pointer"
            />
        </div>
    );
};

export { BaccaratBetCountsComponent, type BaccaratBetCounts };
export default BaccaratBetCountsComponent;
