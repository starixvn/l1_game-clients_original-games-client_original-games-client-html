import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "@shared/components/game-base/type";
import styles from "./baccarat-highlight-bet-option.module.scss";

export const BaccaratHighlightBetOption = ({ choice }: { choice: string }) => {
    const { showResultInfo, settlementResult, roundState } = useGameStateContext();
    return (
        [RoundState.None, RoundState.DisplayResult].includes(roundState) &&
        showResultInfo &&
        settlementResult[choice] && (
            <div className={`${styles["highlight"]}`}>
                <div className={`${styles["bg"]}`}></div>
                <div className={`${styles["border"]}`}></div>
            </div>
        )
    );
};

export default BaccaratHighlightBetOption;


