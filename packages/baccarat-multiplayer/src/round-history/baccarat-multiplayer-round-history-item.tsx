import { BaccaratResult, BaccaratSettlementResult } from "../baccarat-multiplayer-constants";
import { hasPlayerPair, hasBankerPair, getWinnerFromSettlement, getScoreboardImagePath } from "../scoreboard/utils";
import Image from "next/image";

const PlayerPairDot = () => (
    <div className="absolute w-[7px] h-[7px] bg-[#538AFF] rounded-full -bottom-[1px] -right-[1px] z-[1]" />
);

const BankerPairDot = () => (
    <div className="absolute w-[7px] h-[7px] bg-[#FF2655] rounded-full -top-[1px] -left-[1px] z-[1]" />
);

type Props = {
    result: {
        result: BaccaratResult;
        settlementResult: BaccaratSettlementResult;
        roundId: number;
    };
    index: number;
};

export const BaccaratMultiplayerRoundHistoryItem = ({ result }: Props) => {
    if (!result?.settlementResult) {
        return null;
    }

    const { settlementResult } = result;

    const renderItem = () => {
        const winnerResult = getWinnerFromSettlement(settlementResult);
        if (!winnerResult.hasWinner) { return null; }

        const playerPair = result.result ? hasPlayerPair(result.result.player) : false;
        const bankerPair = result.result ? hasBankerPair(result.result.banker) : false;

        return <RoundHistoryItem variant={winnerResult.winner} playerPair={playerPair} bankerPair={bankerPair} />;
    };

    return <div className="w-[18px] h-[18px] inline-flex items-center justify-center" key={result.roundId}>{renderItem()}</div>;
};

type RoundHistoryItemProps = {
    variant: "player" | "banker" | "tie";
    playerPair: boolean;
    bankerPair: boolean;
};

const RoundHistoryItem = ({ variant, playerPair, bankerPair }: RoundHistoryItemProps) => {
    return (
        <div className="relative w-4 h-4">
            <Image
                src={getScoreboardImagePath(variant)}
                alt={variant}
                width={16}
                height={16}
                className="w-4 h-4"
            />
            {playerPair && <PlayerPairDot />}
            {bankerPair && <BankerPairDot />}
        </div>
    );
};
