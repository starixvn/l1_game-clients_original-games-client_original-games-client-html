import { BaccaratResult, BaccaratSettlementResult } from "../baccarat-multiplayer-constants";
import Image from "next/image";

const PairDot = () => <div className="absolute w-[6px] h-[6px] bg-white rounded-full -top-[2.5px] z-[1]" />;
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
        if (settlementResult.player) {
            return <RoundHistoryItem variant="player" hasPair={settlementResult.anyPair} />;
        }
        if (settlementResult.banker) {
            return <RoundHistoryItem variant="banker" hasPair={settlementResult.anyPair} />;
        }
        if (settlementResult.tie) {
            return <RoundHistoryItem variant="tie" hasPair={settlementResult.anyPair} />;
        }
        return null;
    };

    return <div className="w-[18px] h-[18px] inline-flex items-center justify-center" key={result.roundId}>{renderItem()}</div>;
};

type RoundHistoryItemProps = {
    variant: "player" | "banker" | "tie";
    hasPair: boolean;
};

const RoundHistoryItem = ({ variant, hasPair }: RoundHistoryItemProps) => {
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
            {hasPair && <PairDot />}
        </div>
    );
};
