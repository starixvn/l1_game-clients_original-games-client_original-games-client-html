import { useState } from "react";
import { RoundHistory } from "../../../components/game-components/round-history/chain";
import { IconStatistic } from "../../../components/game-components/statistic/icon-statistic";
import { SedieMultiplayerRoundHistoryItem } from "./sedie-multiplayer-round-history-item";
import ScoreboardSeDie from "../scoreboard";
import { mainChoices, SeDieChoices, SeDieStatisticColors } from "../sedie-multiplayer-constants";
import BaseDialog from "../../../components/game-components/base-dialog";
import { ModalType } from "../../../components/game-components/base-dialog/type";
import Styles from "../statistic-popup.module.scss";
import PercentageStatistic from "../../../components/game-components/statistic";
import Image from "next/image";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { useShallow } from "zustand/react/shallow";

export const SedieMultiplayerRoundHistory = () => {
    const { roundHistory, isShowBlink } = useGameStore(
        useShallow((state) => ({ roundHistory: state.roundHistory, isShowBlink: state.isShowBlink }))
    );
    const [isShowStatistic, setIsShowStatistic] = useState(false);
    const onClickIconStatistic = () => {
        setIsShowStatistic(!isShowStatistic);
    };

    const sideChoices = [SeDieChoices.white4, SeDieChoices.white3, SeDieChoices.red2, SeDieChoices.red3, SeDieChoices.red4];

    return (
        <div>
            <RoundHistory
                roundHistory={roundHistory}
                isShowBlink={isShowBlink}
                renderItem={SedieMultiplayerRoundHistoryItem}
                numberOfItems={14}
                sideButton={<IconStatistic onClick={onClickIconStatistic} />}
                sizeNextItem="medium"
            />
            {isShowStatistic && (
                <BaseDialog type={ModalType.Center} isOpen={true} enableBackdrop={false} onCloseModal={() => setIsShowStatistic(false)}>
                    <div id="statistic-popup" className={Styles["statistic-container"]}>
                        <div className={Styles["panel"]}>
                            <div className={Styles["grid"]}>
                                <span className={Styles["close"]} onClick={() => setIsShowStatistic(false)} />
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
                </BaseDialog>
            )}
        </div>
    );
};
