import { BaccaratResult, BaccaratSettlementResult } from "../baccarat-multiplayer-constants";
import { hasPlayerPair, hasBankerPair } from "../scoreboard/utils";
import Image from "next/image";

const PlayerPairDot = () => (
    <div className="absolute w-[7px] h-[7px] bg-[#538AFF] rounded-full -bottom-[1px] -right-[1px] z-[1]" />
);

const BankerPairDot = () => (
    <div className="absolute w-[7px] h-[7px] bg-[#FF2655] rounded-full -top-[1px] -left-[1px] z-[1]" />
);

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
        const playerPair = result.result ? hasPlayerPair(result.result.player) : false;
        const bankerPair = result.result ? hasBankerPair(result.result.banker) : false;

        if (settlementResult.player) {
            return <RoundHistoryItem variant="player" playerPair={playerPair} bankerPair={bankerPair} />;
        }
        if (settlementResult.banker) {
            return <RoundHistoryItem variant="banker" playerPair={playerPair} bankerPair={bankerPair} />;
        }
        if (settlementResult.tie) {
            return <RoundHistoryItem variant="tie" playerPair={playerPair} bankerPair={bankerPair} />;
        }
        return null;
    };

    return <div className="w-[18px] h-[18px] inline-flex items-center justify-center" key={result.roundId}>{renderItem()}</div>;
};

type RoundHistoryItemProps = {
    variant: "player" | "banker" | "tie";
    playerPair: boolean;
    bankerPair: boolean;
};

const RoundHistoryItem = ({ variant, playerPair, bankerPair }: RoundHistoryItemProps) => {
    const getImagePath = () => {
        switch (variant) {
            case "player":
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/player.svg`;
            case "banker":
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/banker.svg`;
            case "tie":
                return `${basePath}/static/images/baccarat/scoreboard/bead-road/tie.svg`;
            default:
                return "";
        }
    };

    return (
        <div className="relative w-4 h-4">
            <Image
                src={getImagePath()}
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
