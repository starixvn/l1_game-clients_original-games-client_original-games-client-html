import { ResourceTypes } from "@shared/resources";
import { useTranslator } from "@shared/react-hooks/use-translator";
import { BaccaratResult, BaccaratSettlementResult, BaccaratWinner } from "../baccarat-multiplayer-constants";
import { hasPlayerPair, hasBankerPair, getWinnerFromSettlement, getScoreboardImagePath, getDisplayTextKey } from "../scoreboard/utils";
import { CachedImage } from "@shared/components/game-components/cached-image";

const Dot = ({ color, position }: { color: string; position: string }) => (
    <div className={`absolute w-[7px] h-[7px] rounded-full z-[1] ${color} ${position}`} />
);

const PlayerPairDot = () => <Dot color="bg-[#538AFF]" position="-bottom-[1px] -right-[1px]" />;
const BankerPairDot = () => <Dot color="bg-[#FF2655]" position="-top-[1px] -left-[1px]" />;

type BaccaratRoundHistoryProps = {
    result: {
        result: BaccaratResult;
        settlementResult: BaccaratSettlementResult;
        roundId: number;
    };
    index: number;
};

type RoundHistoryItemProps = {
    variant: BaccaratWinner;
    playerPair: boolean;
    bankerPair: boolean;
};

export const BaccaratMultiplayerRoundHistoryItem = ({ result }: BaccaratRoundHistoryProps) => {
    if (!result?.settlementResult) {
        return null;
    }

    const winnerInfo = getWinnerFromSettlement(result.settlementResult);
    if (!winnerInfo.hasWinner) {
        return null;
    }

    const playerPair = hasPlayerPair(result.result?.player);
    const bankerPair = hasBankerPair(result.result?.banker);

    return (
        <div key={result.roundId} className="w-[18px] h-[18px] inline-flex items-center justify-center">
            <RoundHistoryItem variant={winnerInfo.winner} playerPair={playerPair} bankerPair={bankerPair} />
        </div>
    );
};

const RoundHistoryItem = ({ variant, playerPair, bankerPair }: RoundHistoryItemProps) => {
    const { t } = useTranslator([ResourceTypes.BACCARAT_MULTIPLAYER]);

    const displayText = t(getDisplayTextKey(variant));

    return (
        <div className="relative w-[18px] h-[18px] flex items-center justify-center">
            <CachedImage
                src={getScoreboardImagePath(variant)}
                alt={variant}
                width={18}
                height={18}
                className="w-[18px] h-[18px]"
            />

            <span className="absolute inset-0 flex items-center justify-center text-white text-center text-[11px] font-semibold tracking-[0.44px] capitalize z-[1]">
                {displayText}
            </span>

            {playerPair && <PlayerPairDot />}
            {bankerPair && <BankerPairDot />}
        </div>
    );
};
