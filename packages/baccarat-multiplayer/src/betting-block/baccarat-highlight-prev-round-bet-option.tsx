import { isShowHighlightPrevResult, useGameStore } from "@shared";
import styles from "./baccarat-highlight-prev-round-bet-option.module.scss";
import { BET_OPTION_SHAPES, BET_OPTION_SHAPES_DESKTOP } from "./bet-option-shapes";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

export const BaccaratHighlightPrevRoundBetOption = ({ choice }: { choice: string }) => {
    const { roundHistory, roundState } = useGameStore(
        useShallow((state) => ({ roundHistory: state.roundHistory, roundState: state.roundState }))
    );
    const isShow = isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory });
    const [isDesktop, setIsDesktop] = useState(false);

    // Track viewport size for responsive shapes
    useEffect(() => {
        const checkViewport = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        checkViewport();
        window.addEventListener("resize", checkViewport);

        return () => window.removeEventListener("resize", checkViewport);
    }, []);

    // Get shape path from shared constants based on viewport
    const shapes = isDesktop ? BET_OPTION_SHAPES_DESKTOP : BET_OPTION_SHAPES;
    const shapePath =
        choice === "banker" ? shapes.banker : choice === "tie" ? shapes.tie : choice === "anyPair" ? shapes.anyPair : shapes.player;

    // Get correct viewBox for desktop vs mobile
    const getViewBox = () => {
        if (isDesktop) {
            if (choice === "tie") {
                return "0 0 140 76";
            }
            if (choice === "anyPair") {
                return "0 0 140 73";
            }
            return "0 0 220 169"; // Player and Banker desktop
        } else {
            if (choice === "tie") {
                return "0 0 106 76";
            }
            if (choice === "anyPair") {
                return "0 0 106 73";
            }
            return "0 0 183 169"; // Player and Banker mobile
        }
    };

    return isShow ? (
        <div className={`${styles["prev-highlight"]}`}>
            <svg viewBox={getViewBox()} fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id={`prevBorderGradient-${choice}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255, 234, 0, 1)" />
                        <stop offset="50%" stopColor="rgba(255, 255, 255, 1)" />
                        <stop offset="100%" stopColor="rgba(255, 217, 5, 1)" />
                    </linearGradient>

                    <filter id={`borderGlow-${choice}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(255,225,0,0.8)" />
                    </filter>

                    <mask id={`prevHighlightMask-${choice}`}>
                        <path d={shapePath} fill="white" />
                    </mask>
                </defs>

                <path
                    d={shapePath}
                    fill="none"
                    stroke={`url(#prevBorderGradient-${choice})`}
                    strokeWidth="1.8"
                    filter={`url(#borderGlow-${choice})`}
                />
            </svg>
        </div>
    ) : null;
};

export default BaccaratHighlightPrevRoundBetOption;
