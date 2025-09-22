import Image from "next/image";
import { BaccaratSettlementResult } from "../baccarat-multiplayer-constants";
import styles from "./scoreboard-elements.module.scss";
import { BigRoadRound } from "@shared/components/game-components/round-history/scoreboard/elements";

const scoreboardImages: Record<string, string> = {
    player: '/static/images/baccarat/scoreboard/big-road/player.svg',
    banker: '/static/images/baccarat/scoreboard/big-road/banker.svg',
    natural: '/static/images/baccarat/scoreboard/big-road/natural.svg',
    tie: '/static/images/baccarat/scoreboard/big-road/tie.svg',
};

const PlayerPairDot = () => (
    <div className="absolute w-[5px] h-[5px] bg-[#538AFF] rounded-full -bottom-[1px] -right-[1px] z-[1]" />
);

const BankerPairDot = () => (
    <div className="absolute w-[5px] h-[5px] bg-[#FF2655] rounded-full -top-[1px] -left-[1px] z-[1]" />
);

const TieDot: React.FC<{ count: number }> = ({ count }) => (
    <>
        {count >= 2 && <span className="absolute text-red-600 text-center font-inter text-[9px] font-bold leading-normal tracking-[0.36px] capitalize z-[5]">{count}</span>}
        <Image className={styles['tie-image']} src={scoreboardImages.tie} alt="Tie" width={10} height={10} />
    </>
);

export interface BigRoadIconProps {
    round: BigRoadRound<BaccaratSettlementResult>;
    isBlink: boolean;
    isEmpty: boolean;
}

// Helper function to determine the main result (banker wins)
const isBankerWin = (data: BaccaratSettlementResult[]): boolean => {
    return data.some((result) => result.banker);
};

// Helper function to get enriched settlement data
const getEnrichedData = (data: BaccaratSettlementResult[]): BaccaratSettlementResult | null => {
    return data?.[0] || null;
};

// Helper function to calculate tie count for Big Road
const getTieCount = (data: BaccaratSettlementResult[]): number => {
    const firstResult = data?.[0];
    if (!firstResult) {
        return 0;
    }

    // If first result is tie, count all as ties
    // If not first is tie, count the non-first results as ties
    return firstResult.tie ? data.length : Math.max(0, data.length - 1);
};

const BigRoadIcon: React.FC<BigRoadIconProps> = ({ round, isBlink, isEmpty }) => {
    // Handle special states first
    if (isBlink) {
        return <span className={styles.blink}></span>;
    }

    if (isEmpty) {
        return <div className={styles['dot-empty']}></div>;
    }

    // Get round data and determine result
    const enrichedData = getEnrichedData(round.data);
    const hasBanker = isBankerWin(round.data);
    const imagePath = hasBanker ? scoreboardImages.banker : scoreboardImages.player;
    const tieCount = getTieCount(round.data);

    return (
        <div className={styles['dot-image']}>
            <Image
                src={imagePath}
                alt={hasBanker ? 'Banker' : 'Player'}
                width={26}
                height={26}
                priority
            />

            {/* Natural indicator */}
            {enrichedData?.natural && (
                <Image
                    className={styles['natural-image']}
                    src={scoreboardImages.natural}
                    alt="Natural"
                    width={8}
                    height={8}
                />
            )}

            {/* Pair indicators */}
            {enrichedData?.playerPair && <PlayerPairDot />}
            {enrichedData?.bankerPair && <BankerPairDot />}

            {/* Tie indicator */}
            {tieCount > 0 && <TieDot count={tieCount} />}
        </div>
    );
};

export default BigRoadIcon;
