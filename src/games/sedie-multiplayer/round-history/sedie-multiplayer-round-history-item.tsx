import { SeDieResult, SeDieSettlementResult } from "../sedie-multiplayer-constants";
import styles from "./style.module.scss";

export const SedieMultiplayerRoundHistoryItem = ({
    result,
    index,
}: {
    result: { result: SeDieResult; settlementResult: SeDieSettlementResult; roundId: number };
    index: number;
}) => {
    if (!result?.settlementResult) {
        return null;
    }
    const isOdd = result.settlementResult.odd;
    return (
        <div className="w-[18px] h-[18px] inline-flex items-center justify-center" key={index}>
            {isOdd ? <OddItem /> : <EvenItem />}
        </div>
    );
};
const OddItem = () => {
    return (
        <div className={`${styles["round-history-item"]} ${styles["odd-item"]}`}>
            <div className={styles.text}>O</div>
            <div className={styles.border}></div>
        </div>
    );
};
const EvenItem = () => {
    return (
        <div className={`${styles["round-history-item"]} ${styles["even-item"]}`}>
            <div className={styles.text}>E</div>
            <div className={styles.border}></div>
        </div>
    );
};
