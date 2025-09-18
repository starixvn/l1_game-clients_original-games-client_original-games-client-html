import { BaccaratResult, BaccaratSettlementResult } from "../baccarat-multiplayer-constants";
import styles from "./style.module.scss";

const PairDot = () => <div className="absolute w-[6px] h-[6px] bg-white rounded-full -top-[2.5px] z-[1]" />;

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
            return <RoundHistoryItem label="P" variant="player-item" hasPair={settlementResult.anyPair} />;
        }
        if (settlementResult.banker) {
            return <RoundHistoryItem label="B" variant="banker-item" hasPair={settlementResult.anyPair} />;
        }
        if (settlementResult.tie) {
            return <RoundHistoryItem label="T" variant="tie-item" hasPair={settlementResult.anyPair} />;
        }
        return null;
    };

    return <div className="w-[1.125rem] h-[1.125rem] inline-flex items-center justify-center">{renderItem()}</div>;
};

type RoundHistoryItemProps = {
    label: string;
    variant: "player-item" | "banker-item" | "tie-item";
    hasPair: boolean;
};

const RoundHistoryItem = ({ label, variant, hasPair }: RoundHistoryItemProps) => (
    <div className={`${styles["round-history-item"]} ${styles[variant]} relative`}>
        <div className={styles.text}>{label}</div>
        <div className={styles.border}></div>
        {hasPair && <PairDot />}
    </div>
);
