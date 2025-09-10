import { useGameStateContext } from '@shared/react-contexts/game-state-context/game-state-context';
import { RoundState } from '@shared/components/game-base/type';
import styles from "./highlight-bet-option.module.scss";

export const HighlightBetOption = ({ choice }: { choice: string }) => {
    const { showResultInfo, settlementResult, roundState } = useGameStateContext();
    return (
        [RoundState.None, RoundState.DisplayResult].includes(roundState) &&
        showResultInfo &&
        settlementResult[choice] && (
            <div className={`${styles["highlight"]} ${styles[choice]}`}>
                <div className={`${styles["bg"]} ${styles[choice]}`}></div>
                <div className={`${styles["border"]} ${styles[choice]}`}></div>
            </div>
        )
    );
};

export default HighlightBetOption;
