import AnimatedContent from "@shared/components/game-components/animations/animated-content";
import { useClickSound } from "@shared/react-hooks";
import useGameStore from "@shared/stores/game-store/game-store";
import React from "react";
import { useShallow } from "zustand/react/shallow";
import ScoreboardBaccarat from "../scoreboard/scoreboard";
import BaccaratBetCountsComponent from "./baccarat-bet-counts";
import BaccaratScoreboardGuidePopup from "./baccarat-scoreboard-guide-popup";
import Styles from "./statistic-popup.module.scss";
import { cn } from "@shared/utils";

interface BaccaratMultiplayerStatisticPopupProps {
    onClose?: () => void;
    inline?: boolean;
}

export const BaccaratMultiplayerStatisticPopup: React.FC<BaccaratMultiplayerStatisticPopupProps> = ({ onClose, inline }) => {
    const clickSound = useClickSound();
    const { roundHistory, isShowBlink } = useGameStore(useShallow((state) => ({ roundHistory: state.roundHistory, isShowBlink: state.isShowBlink })));

    const [isClosing, setIsClosing] = React.useState(false);
    const [openScoreBoardGuide, setOpenScoreBoardGuide] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleClose = () => {
        clickSound();
        if (!inline) {
            onClose?.();
            return;
        }
        setIsClosing(true);
        // Match closing animation duration (200ms)
        setTimeout(() => onClose?.(), 200);
    };

    const handleOpenGuide = () => {
        setOpenScoreBoardGuide(true);
    };

    const handleCloseGuide = () => {
        setOpenScoreBoardGuide(false);
    };

    let containerClassName = Styles["statistic-container"];
    if (inline) {
        containerClassName = Styles["inlineContainer"];
    }

    let panelAnimClass = "";
    if (inline) {
        panelAnimClass = isClosing ? Styles["closing"] : Styles["opening"];
    }

    return (
        <div id="statistic-popup" data-testid="statistic-popup" className={cn(containerClassName, "w-[369px] rounded-3")}>
            <AnimatedContent distance={24} duration={0.8} ease="power3.out" initialOpacity={0} animateOpacity>
                <div
                    className={cn(`${Styles["panel"]} ${panelAnimClass} rounded-3`)}
                    style={{
                        ["--anim-distance" as any]: "-16px",
                        ["--anim-duration" as any]: "480ms",
                        ["--anim-close-duration" as any]: "500ms",
                        ["--anim-ease" as any]: "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                >
                    <div ref={containerRef} className={cn(Styles["grid"], "pl-2 py-1 pr-[2px] relative")}>
                        <button type="button" className={Styles["close"]} onClick={handleClose} aria-label="Close" />
                        {/* Baccarat Bet Counts Statistics */}
                        <BaccaratBetCountsComponent 
                            roundHistory={roundHistory as any} 
                            onOpenGuide={handleOpenGuide}
                        />
                        <ScoreboardBaccarat roundHistory={roundHistory as any} isShowBlink={isShowBlink} />
                        <BaccaratScoreboardGuidePopup 
                            isVisible={openScoreBoardGuide}
                            onClose={handleCloseGuide}
                            containerRef={containerRef}
                        />
                    </div>
                </div>
            </AnimatedContent>
        </div>
    );
};
export default BaccaratMultiplayerStatisticPopup;
