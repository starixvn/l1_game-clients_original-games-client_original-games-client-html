import Image from "next/image";
import { BaccaratSettlementResult } from "../baccarat-multiplayer-constants";
import styles from "./scoreboard-elements.module.scss";
import { BigRoadRound } from "@shared/components/game-components/round-history/scoreboard/elements";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const scoreboardImages: Record<string, string> = {
    player: `${basePath}/static/images/baccarat/scoreboard/big-road/player.svg`,
    banker: `${basePath}/static/images/baccarat/scoreboard/big-road/banker.svg`,
    natural: `${basePath}/static/images/baccarat/scoreboard/big-road/natural.svg`,
    tie: `${basePath}/static/images/baccarat/scoreboard/big-road/tie.svg`,
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

const isBankerWin = (data: BaccaratSettlementResult[]): boolean => {
    return data.some((result) => result.banker);
};

const getEnrichedData = (data: BaccaratSettlementResult[]): BaccaratSettlementResult | null => {
    return data?.[0] || null;
};

const getTieCount = (data: BaccaratSettlementResult[]): number => {
    const firstResult = data?.[0];
    if (!firstResult) {
        return 0;
    }

    return firstResult.tie ? data.length : Math.max(0, data.length - 1);
};

const BigRoadIcon: React.FC<BigRoadIconProps> = ({ round, isBlink, isEmpty }) => {
    if (isBlink) {
        return <span className={styles.blink}></span>;
    }

    if (isEmpty) {
        return <div className={styles['dot-empty']}></div>;
    }

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

            {enrichedData?.natural && (
                <Image
                    className={styles['natural-image']}
                    src={scoreboardImages.natural}
                    alt="Natural"
                    width={8}
                    height={8}
                />
            )}

            {enrichedData?.playerPair && <PlayerPairDot />}
            {enrichedData?.bankerPair && <BankerPairDot />}

            {tieCount > 0 && <TieDot count={tieCount} />}
        </div>
    );
};

export default BigRoadIcon;
