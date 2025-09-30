import Image from "next/image";
import { BaccaratSettlementResult } from "../baccarat-multiplayer-constants";
import styles from "./scoreboard-elements.module.scss";
import { BigRoadRound } from "@shared/components/game-components/round-history/scoreboard/elements";
import { getTieCount, getActualWinner, getCombinedTieData, hasTies } from "./utils";
import dotStyles from '@shared/components/game-components/round-history/dot/dot.module.scss';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const SCOREBOARD_IMAGES = {
    player: `${basePath}/static/images/baccarat/scoreboard/big-road/player.svg`,
    banker: `${basePath}/static/images/baccarat/scoreboard/big-road/banker.svg`,
    natural: `${basePath}/static/images/baccarat/scoreboard/big-road/natural.svg`,
    tie: `${basePath}/static/images/baccarat/scoreboard/big-road/tie.svg`,
} as const;

const Dot = ({ className }: { className: string }) => <div className={`absolute w-[5px] h-[5px] rounded-full z-[1] ${className}`} />;

const PlayerPairDot = () => <Dot className="bg-[#538AFF] bottom-0 right-0" />;
const BankerPairDot = () => <Dot className="bg-[#FF2655] top-0 left-0" />;

interface TieDotProps {
    count: number;
    hasNatural: boolean;
    hasPlayerPair: boolean;
    hasBankerPair: boolean;
}

const TieDot: React.FC<TieDotProps> = ({ count, hasNatural, hasPlayerPair, hasBankerPair }) => {
    const textColor = hasNatural ? "text-black" : "text-white";

    return (
        <>
            {count >= 2 && (
                <span
                    className={`absolute text-center font-inter text-[11px] font-bold leading-normal tracking-[0.44px] capitalize z-[5] ${textColor}`}
                >
                    {count}
                </span>
            )}

            <Image className={styles["tie-image"]} src={SCOREBOARD_IMAGES.tie} alt="Tie" width={10} height={10} />

            {hasPlayerPair && <PlayerPairDot />}
            {hasBankerPair && <BankerPairDot />}
            {hasNatural && (
                <Image className={styles["natural-image"]} src={SCOREBOARD_IMAGES.natural} alt="Natural" width={12} height={12} />
            )}
        </>
    );
};

export interface BigRoadIconProps {
    round: BigRoadRound<BaccaratSettlementResult>;
    isBlink: boolean;
    isEmpty: boolean;
}

const getEnrichedData = (data: BaccaratSettlementResult[]): BaccaratSettlementResult | null => data?.[0] || null;

const getWinnerImage = (round: BigRoadRound<BaccaratSettlementResult>) => {
    const actualWinner = getActualWinner(round.data);
    return actualWinner === 'banker' ? SCOREBOARD_IMAGES.banker : SCOREBOARD_IMAGES.player;
};

const BigRoadIcon: React.FC<BigRoadIconProps> = ({ round, isBlink, isEmpty }) => {
    if (isBlink) {
        return <span className={`${dotStyles["dot-next"]} ${dotStyles["blink"]}`}></span>;
    }
    if (isEmpty) {
        return <div className={styles["dot-empty"]}></div>;
    }

    const enrichedData = getEnrichedData(round.data);
    const hasTiesInRound = hasTies(round.data);
    const tieCount = getTieCount(round.data);

    const combinedTieData = hasTiesInRound ? getCombinedTieData(round.data) : null;
    const sourceData = combinedTieData || enrichedData;

    const { natural, playerPair, bankerPair } = sourceData || {};

    const actualWinner = getActualWinner(round.data);
    const shouldShowWinnerImage = actualWinner !== null;

    return (
        <div className={styles["dot-image"]}>
            {shouldShowWinnerImage && (
                <Image
                    src={getWinnerImage(round)}
                    alt={actualWinner}
                    width={14}
                    height={14}
                    priority
                />
            )}

            {natural && <Image className={styles["natural-image"]} src={SCOREBOARD_IMAGES.natural} alt="Natural" width={12} height={12} />}

            {playerPair && <PlayerPairDot />}
            {bankerPair && <BankerPairDot />}

            {tieCount > 0 && <TieDot count={tieCount} hasNatural={!!natural} hasPlayerPair={!!playerPair} hasBankerPair={!!bankerPair} />}
        </div>
    );
};

export default BigRoadIcon;
