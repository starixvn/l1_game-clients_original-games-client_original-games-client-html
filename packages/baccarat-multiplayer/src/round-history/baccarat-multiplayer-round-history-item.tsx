import { BaccaratResult, BaccaratSettlementResult } from "../baccarat-multiplayer-constants";
import styles from "./style.module.scss";

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

    const renderItem = () => {
        if (result.settlementResult.player) {
            return <PlayerItem />;
        }
        if (result.settlementResult.banker) {
            return <BankerItem />;
        }
        if (result.settlementResult.tie) {
            return <TieItem />;
        }
        if (result.settlementResult.anyPair) {
            return <AnyPairItem />;
        }
        return null;
    };

    return <div className="w-[1.125rem] h-[1.125rem] inline-flex items-center justify-center">{renderItem()}</div>;
};

const PlayerItem = () => {
    return (
        <div className={`${styles["round-history-item"]} ${styles["player-item"]}`}>
            <div className={styles.text}>P</div>
            <div className={styles.border}></div>
        </div>
    );
};

const BankerItem = () => {
    return (
        <div className={`${styles["round-history-item"]} ${styles["banker-item"]}`}>
            <div className={styles.text}>B</div>
            <div className={styles.border}></div>
        </div>
    );
};

const TieItem = () => {
    return (
        <div className={`${styles["round-history-item"]} ${styles["tie-item"]}`}>
            <div className={styles.text}>T</div>
            <div className={styles.border}></div>
        </div>
    );
};

const AnyPairItem = () => {
    return (
        <div className={`${styles["round-history-item"]} ${styles["any-pair-item"]}`}>
            <div className={styles.text}>{``}</div>
            <div className={styles.border}></div>
        </div>
    );
};
