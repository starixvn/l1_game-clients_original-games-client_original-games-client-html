import React from "react";
import ScoreboardSeDie from "../scoreboard/scoreboard";
import { mainChoices, SeDieChoices, SeDieStatisticColors } from "../sedie-multiplayer-constants";
import PercentageStatistic from "../../../components/game-components/statistic";
import Image from "next/image";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { useShallow } from "zustand/react/shallow";
import Styles from "./statistic-popup.module.scss";

interface SedieMultiplayerStatisticPopupProps {
    onClose?: () => void;
}

export const SedieMultiplayerStatisticPopup: React.FC<SedieMultiplayerStatisticPopupProps> = ({ onClose }) => {
    const { roundHistory, isShowBlink } = useGameStore(
        useShallow((state) => ({ roundHistory: state.roundHistory, isShowBlink: state.isShowBlink }))
    );

    const sideChoices = [SeDieChoices.white4, SeDieChoices.white3, SeDieChoices.red2, SeDieChoices.red3, SeDieChoices.red4];

    return (
        <div id="statistic-popup" data-testid="statistic-popup" className={Styles["statistic-container"]}>
            <div className={Styles["panel"]}>
                <div className={Styles["grid"]}>
                    <span className={Styles["close"]} onClick={onClose} />
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
                            return src ? <Image src={src} alt={choice} width={16} height={16} /> : null;
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
                    <ScoreboardSeDie roundHistory={roundHistory as any} isShowBlink={isShowBlink} isOddEven={false} />
                </div>
            </div>
        </div>
    );
};
