import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "@shared/components/game-base/type";
import styles from "./baccarat-highlight-bet-option.module.scss";
import { BET_OPTION_SHAPES, BET_OPTION_SHAPES_DESKTOP } from "./bet-option-shapes";
import { useEffect, useState } from "react";

export const BaccaratHighlightBetOption = ({ choice }: { choice: string }) => {
    const { showResultInfo, settlementResult, roundState } = useGameStateContext();
    const [isDesktop, setIsDesktop] = useState(false);

    // Track viewport size for responsive shapes
    useEffect(() => {
        const checkViewport = () => {
            setIsDesktop(window.innerWidth > 768);
        };

        checkViewport();
        window.addEventListener('resize', checkViewport);
        
        return () => window.removeEventListener('resize', checkViewport);
    }, []);

    // Get shape path from shared constants based on viewport
    const shapes = isDesktop ? BET_OPTION_SHAPES_DESKTOP : BET_OPTION_SHAPES;
    const shapePath = choice === 'banker' ? shapes.banker :
                     choice === 'tie' ? shapes.tie :
                     choice === 'anyPair' ? shapes.anyPair :
                     shapes.player;

    // Get correct viewBox for desktop vs mobile
    const getViewBox = () => {
        if (isDesktop) {
            if (choice === 'tie') return "0 0 140 77";
            if (choice === 'anyPair') return "0 0 140 73";
            return "0 0 220 169"; // Player and Banker desktop
        } else {
            if (choice === 'tie') return "0 0 106 77";
            if (choice === 'anyPair') return "0 0 106 73";
            return "0 0 183 169"; // Player and Banker mobile
        }
    };

    return (
        [RoundState.None, RoundState.DisplayResult].includes(roundState) &&
        showResultInfo &&
        settlementResult[choice] && (
            <div className={`${styles["highlight"]}`}>
                <div className={`${styles["animatedStroke"]}`}>
                    <svg viewBox={getViewBox()} fill="none" xmlns="http://www.w3.org/2000/svg">
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


