import { useState } from "react";
import { RoundHistory } from "../../../components/game-components/round-history/chain";
import { IconStatistic } from "../../../components/game-components/statistic/icon-statistic";
import { SedieMultiplayerRoundHistoryItem } from "./sedie-multiplayer-round-history-item";
import { useGameContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";

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
        </div>
    );
};
