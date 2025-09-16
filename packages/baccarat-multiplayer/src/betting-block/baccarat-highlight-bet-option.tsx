import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "@shared/components/game-base/type";
import styles from "./baccarat-highlight-bet-option.module.scss";
import { BET_OPTION_SHAPES } from "./bet-option-shapes";

export const BaccaratHighlightBetOption = ({ choice }: { choice: string }) => {
    const { showResultInfo, settlementResult, roundState } = useGameStateContext();

    // Get shape path from shared constants
    const shapePath = choice === 'banker' ? BET_OPTION_SHAPES.banker :
                     choice === 'tie' ? BET_OPTION_SHAPES.tie :
                     choice === 'anyPair' ? BET_OPTION_SHAPES.anyPair :
                     BET_OPTION_SHAPES.player;

    return (
        [RoundState.None, RoundState.DisplayResult].includes(roundState) &&
        showResultInfo &&
        settlementResult[choice] && (
            <div className={`${styles["highlight"]}`}>
                <div className={`${styles["animatedStroke"]}`}>
                    <svg viewBox={choice === 'tie' ? "0 0 106 76" :
                               choice === 'anyPair' ? "0 0 106 73" :
                               "0 0 183 169"} fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="strokeGradient" x1="0" y1="0" x2="47.5" y2="73" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#FBEC5E"/>
                                <stop offset="1" stop-color="#FBEC5E" stopOpacity="0.3"/>
                            </linearGradient>
                        </defs>
                        <path d={shapePath} data-choice={choice}/>
                    </svg>
                </div>
            </div>
        )
    );
};

export default BaccaratHighlightBetOption;


