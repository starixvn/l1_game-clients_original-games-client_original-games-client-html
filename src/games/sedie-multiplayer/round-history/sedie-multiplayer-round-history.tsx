import { RoundHistory } from "../../../components/game-components/round-history/chain";
import { IconStatistic } from "../../../components/game-components/statistic/icon-statistic";
import { SedieMultiplayerRoundHistoryItem } from "./sedie-multiplayer-round-history-item";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { useShallow } from "zustand/react/shallow";
import { SedieMultiplayerStatisticPopup } from "./sedie-multiplayer-statistic-popup";

export const SedieMultiplayerRoundHistory = () => {
    const { roundHistory, isShowBlink } = useGameStore(
        useShallow((state) => ({ roundHistory: state.roundHistory, isShowBlink: state.isShowBlink }))
    );

    return (
        <div className="my-3">
            <RoundHistory
                roundHistory={roundHistory}
                isShowBlink={isShowBlink}
                renderItem={SedieMultiplayerRoundHistoryItem}
                numberOfItems={14}
                sideButton={<IconStatistic />}
                sizeNextItem="medium"
                statisticPopupContent={<SedieMultiplayerStatisticPopup />}
            />
        </div>
    );
};
