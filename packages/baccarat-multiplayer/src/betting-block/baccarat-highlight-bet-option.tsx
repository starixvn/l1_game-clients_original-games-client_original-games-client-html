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

    // Generate SVG mask for the shape
    const generateShapeMask = () => {
        const svgString = `
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <path d="${shapePath}" fill="none" stroke="white" stroke-width="2"/>
            </svg>
        `;
        return `url("data:image/svg+xml,${encodeURIComponent(svgString)}")`;
    };
    return (
        [RoundState.None, RoundState.DisplayResult].includes(roundState) &&
        showResultInfo &&
        settlementResult[choice] && (
            <div className={`${styles["highlight"]} ${styles[choice]}`}>
                {/* Background glow effect */}
                <div className={`${styles["bg"]} ${styles[choice]}`}></div>
                {/* Glowing border effect */}
                <div
                    className={`${styles["border"]} ${styles[choice]}`}
                    style={{
                        maskImage: generateShapeMask(),
                        WebkitMaskImage: generateShapeMask(),
                    }}
                ></div>
            </div>
        )
    );
};

export default BaccaratHighlightBetOption;
