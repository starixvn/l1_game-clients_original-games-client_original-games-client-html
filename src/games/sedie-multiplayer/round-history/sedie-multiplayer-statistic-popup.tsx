import React from "react";
import ScoreboardSeDie from "../scoreboard/scoreboard";
import { mainChoices, SeDieChoices, SeDieStatisticColors } from "../sedie-multiplayer-constants";
import PercentageStatistic from "../../../components/game-components/statistic";
import Image from "next/image";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { useShallow } from "zustand/react/shallow";
import Styles from "./statistic-popup.module.scss";
import AnimatedContent from "../../../components/game-components/animations/animated-content";
import { CachedImage } from "../../../components/game-components/cached-image";

interface SedieMultiplayerStatisticPopupProps {
    onClose?: () => void;
    inline?: boolean;
}

export const SedieMultiplayerStatisticPopup: React.FC<SedieMultiplayerStatisticPopupProps> = ({ onClose, inline }) => {
    const { roundHistory, isShowBlink } = useGameStore(
        useShallow((state) => ({ roundHistory: state.roundHistory, isShowBlink: state.isShowBlink }))
    );

    const sideChoices = [SeDieChoices.white4, SeDieChoices.white3, SeDieChoices.red2, SeDieChoices.red3, SeDieChoices.red4];

    const [isClosing, setIsClosing] = React.useState(false);

    const handleClose = () => {
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
        <div id="statistic-popup" data-testid="statistic-popup" className={containerClassName}>
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
                        <PercentageStatistic
                            roundHistory={roundHistory as any}
                            mainChoices={sideChoices as any}
                            iconRenderer={(choice) => {
                                const map = {
                                    red2: "/static/images/sedie-multiplayer/statistic-icon-red2.webp",
                                    red3: "/static/images/sedie-multiplayer/statistic-icon-red3.webp",
                                    red4: "/static/images/sedie-multiplayer/statistic-icon-red4.webp",
                                    white3: "/static/images/sedie-multiplayer/statistic-icon-white3.webp",
                                    white4: "/static/images/sedie-multiplayer/statistic-icon-white4.webp",
                                } as Record<string, string>;
                                const src = map[choice];
                                return src ? <CachedImage src={src} alt={choice} width={18} height={18} /> : null;
                            }}
                        />
                        <PercentageStatistic
                            roundHistory={roundHistory as any}
                            mainChoices={mainChoices as any}
                            renderAsBar={true}
                            barColors={SeDieStatisticColors}
                            barHeightPx={12}
                            roundedRadiusPx={12}
                            barLabelFontSizePx={14}
                        />
                        <ScoreboardSeDie roundHistory={roundHistory as any} isShowBlink={isShowBlink} />
                    </div>
                </div>
            </AnimatedContent>
        </div>
    );
};
export default SedieMultiplayerStatisticPopup;
