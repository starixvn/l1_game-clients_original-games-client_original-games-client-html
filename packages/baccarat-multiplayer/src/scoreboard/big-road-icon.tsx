import Image from "next/image";
import { BaccaratSettlementResult } from "../baccarat-multiplayer-constants";
import styles from "./scoreboard-elements.module.scss";
import { BigRoadRound } from "@shared/components/game-components/round-history/scoreboard/elements";
import { isBankerWin, getTieCount } from "./utils";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const scoreboardImages: Record<string, string> = {
    player: `${basePath}/static/images/baccarat/scoreboard/big-road/player.svg`,
    banker: `${basePath}/static/images/baccarat/scoreboard/big-road/banker.svg`,
    natural: `${basePath}/static/images/baccarat/scoreboard/big-road/natural.svg`,
    tie: `${basePath}/static/images/baccarat/scoreboard/big-road/tie.svg`,
};

const PlayerPairDot = () => (
    <div className="absolute w-[5px] h-[5px] bg-[#538AFF] rounded-full bottom-[0] right-[0] z-[1]" />
);

const BankerPairDot = () => (
    <div className="absolute w-[5px] h-[5px] bg-[#FF2655] rounded-full top-[0px] left-[0] z-[1]" />
);


const TieDot: React.FC<{ count: number; hasNatural: boolean }> = ({ count, hasNatural }) => (
    <>
        {count >= 2 && (
            <span
                className={`absolute text-center font-inter text-[11px] font-bold leading-normal tracking-[0.44px] capitalize z-[5] ${
                    hasNatural ? 'text-black' : 'text-white'
                }`}
            >
                {count}
            </span>
        )}
        <Image className={styles['tie-image']} src={scoreboardImages.tie} alt="Tie" width={10} height={10} />
    </>
);

export interface BigRoadIconProps {
    round: BigRoadRound<BaccaratSettlementResult>;
    isBlink: boolean;
    isEmpty: boolean;
}

const getEnrichedData = (data: BaccaratSettlementResult[]): BaccaratSettlementResult | null => {
    return data?.[0] || null;
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
                width={14}
                height={14}
                priority
            />

            {enrichedData?.natural && (
                <Image
                    className={styles['natural-image']}
                    src={scoreboardImages.natural}
                    alt="Natural"
                    width={12}
                    height={12}
                />
            )}

            {enrichedData?.playerPair && <PlayerPairDot />}
            {enrichedData?.bankerPair && <BankerPairDot />}

            {tieCount > 0 && <TieDot count={tieCount} hasNatural={!!enrichedData?.natural} />}
        </div>
    );
};

export default BigRoadIcon;
