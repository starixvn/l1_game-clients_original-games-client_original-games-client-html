import { useCommonTranslate } from "../../../_shared/react-hooks";
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
        <div className="w-[1.125rem] h-[1.125rem] inline-flex items-center justify-center" key={index}>
            {isOdd ? <OddItem /> : <EvenItem />}
        </div>
    );
};
const OddItem = () => {
    const {t} = useCommonTranslate();

    return (
        <div className={`${styles["round-history-item"]} ${styles["odd-item"]}`}>
            <div className={styles.text}>{t("scoreboard_odd")}</div>
            <div className={styles.border}></div>
        </div>
    );
};
const EvenItem = () => {
    const {t} = useCommonTranslate();

    return (
        <div className={`${styles["round-history-item"]} ${styles["even-item"]}`}>
            <div className={styles.text}>{t("scoreboard_even")}</div>
            <div className={styles.border}></div>
        </div>
    );
};
