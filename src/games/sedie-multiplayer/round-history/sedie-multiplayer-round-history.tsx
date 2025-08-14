import { useState } from "react";
import { RoundHistory } from "../../../components/game-components/round-history/chain";
import { IconStatistic } from "../../../components/game-components/statistic/icon-statistic";
import { SedieMultiplayerRoundHistoryItem } from "./sedie-multiplayer-round-history-item";
import { useGameContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import BaseDialog from "../../../components/game-components/base-dialog";
import { ModalType } from "../../../components/game-components/base-dialog/type";
import ScoreboardSeDie from "../scoreboard";
import Styles from "../statistic-popup.module.scss";
import PercentageStatistic from "../../../components/game-components/statistic";
import Image from "next/image";
import { bottomChoices, mainChoices, topChoices } from "../sedie-multiplayer-constants";

export const SedieMultiplayerRoundHistory = () => {
    const { roundHistory, isShowBlink } = useGameStateContext();
    const [isShowStatistic, setIsShowStatistic] = useState(false);
    const onClickIconStatistic = () => {
        setIsShowStatistic(!isShowStatistic);
    };
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
                                    mainChoices={topChoices.concat(bottomChoices) as any}
                                    iconRenderer={(choice) => {
                                        const map = {
                                            red2: "/static/images/sedie-multiplayer/statistic-icon-red2.svg",
                                            red3: "/static/images/sedie-multiplayer/statistic-icon-red3.svg",
                                            red4: "/static/images/sedie-multiplayer/statistic-icon-red4.svg",
                                            white3: "/static/images/sedie-multiplayer/statistic-icon-blue3.svg",
                                            white4: "/static/images/sedie-multiplayer/statistic-icon-blue4.svg",
                                        } as Record<string, string>;
                                        const src = map[choice];
                                        return src ? <Image src={src} alt={choice} width={16} height={16} /> : null;
                                    }}
                                />
                                <PercentageStatistic roundHistory={roundHistory as any} mainChoices={mainChoices as any} />
                                <ScoreboardSeDie roundHistory={roundHistory as any} isShowBlink={isShowBlink} isOddEven={false} />
                            </div>
                        </div>
                    </div>
                </BaseDialog>
            )}
        </div>
    );
};
