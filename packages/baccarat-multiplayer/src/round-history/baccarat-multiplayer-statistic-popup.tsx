import AnimatedContent from "@shared/components/game-components/animations/animated-content";
import PercentageStatistic from "@shared/components/game-components/statistic";
import { useClickSound } from "@shared/react-hooks";
import useGameStore from "@shared/stores/game-store/game-store";
import Image from "next/image";
import React from "react";
import { useShallow } from "zustand/react/shallow";
import { BaccaratChoices, BaccaratStatisticColors, mainChoices } from "../baccarat-multiplayer-constants";
import ScoreboardBaccarat from "../scoreboard/scoreboard";
import Styles from "./statistic-popup.module.scss";
import { cn } from "@shared/utils";

interface BaccaratMultiplayerStatisticPopupProps {
    onClose?: () => void;
    inline?: boolean;
}

export const BaccaratMultiplayerStatisticPopup: React.FC<BaccaratMultiplayerStatisticPopupProps> = ({ onClose, inline }) => {
    const clickSound = useClickSound();
    const { roundHistory, isShowBlink } = useGameStore(useShallow((state) => ({ roundHistory: state.roundHistory, isShowBlink: state.isShowBlink })));

    const sideChoices = [BaccaratChoices.tie, BaccaratChoices.anyPair];

    const [isClosing, setIsClosing] = React.useState(false);

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

    let containerClassName = Styles["statistic-container"];
    if (inline) {
        containerClassName = Styles["inlineContainer"];
    }

    let panelAnimClass = "";
    if (inline) {
        panelAnimClass = isClosing ? Styles["closing"] : Styles["opening"];
    }

    return (
        <div id="statistic-popup" data-testid="statistic-popup" className={cn(containerClassName, "w-[369px]")}>
            <AnimatedContent distance={24} duration={0.8} ease="power3.out" initialOpacity={0} animateOpacity>
                <div
                    className={`${Styles["panel"]} ${panelAnimClass}`}
                    style={{
                        ["--anim-distance" as any]: "-16px",
                        ["--anim-duration" as any]: "480ms",
                        ["--anim-close-duration" as any]: "500ms",
                        ["--anim-ease" as any]: "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                >
                    <div className={Styles["grid"]}>
                        <button type="button" className={Styles["close"]} onClick={handleClose} aria-label="Close" />
                        {/* TODO: Need to change the total counts instead of percentage */}
                        <PercentageStatistic
                            roundHistory={roundHistory as any}
                            mainChoices={sideChoices as any}
                            iconRenderer={(choice) => {
                                const map = {
                                    red2: "/static/images/sedie-multiplayer/scoreboard/statistic-icon-red2.webp",
                                    red3: "/static/images/sedie-multiplayer/scoreboard/statistic-icon-red3.webp",
                                    red4: "/static/images/sedie-multiplayer/scoreboard/statistic-icon-red4.webp",
                                    white3: "/static/images/sedie-multiplayer/scoreboard/statistic-icon-white3.webp",
                                    white4: "/static/images/sedie-multiplayer/scoreboard/statistic-icon-white4.webp",
                                } as Record<string, string>;
                                const src = map[choice];
                                return src ? <Image src={src} alt={choice} width={18} height={18} /> : null;
                            }}
                        />
                        <PercentageStatistic
                            roundHistory={roundHistory as any}
                            mainChoices={mainChoices as any}
                            renderAsBar={true}
                            barColors={BaccaratStatisticColors}
                            barHeightPx={8}
                            roundedRadiusPx={12}
                            barLabelFontSizePx={12}
                        />
                        <ScoreboardBaccarat roundHistory={roundHistory as any} isShowBlink={isShowBlink} />
                    </div>
                </div>
            </AnimatedContent>
        </div>
    );
};
export default BaccaratMultiplayerStatisticPopup;
