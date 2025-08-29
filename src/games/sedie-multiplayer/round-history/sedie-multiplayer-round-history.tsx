import { useState } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import { RoundHistory } from "../../../components/game-components/round-history/chain";
import { IconStatistic } from "../../../components/game-components/statistic/icon-statistic";
import { SedieMultiplayerRoundHistoryItem } from "./sedie-multiplayer-round-history-item";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { LoadingSpinner } from "../../../components/game-components/game-loading/loading-spinner";
const SedieMultiplayerStatisticPopup = dynamic(() => import("./sedie-multiplayer-statistic-popup"), {
    loading: () => (
        <div className="relative h-[40px]">
            <LoadingSpinner />
        </div>
    ),
});

export const SedieMultiplayerRoundHistory = () => {
    const { roundHistory, isShowBlink } = useGameStore(
        useShallow((state) => ({ roundHistory: state.roundHistory, isShowBlink: state.isShowBlink }))
    );
    const [isShowStatistic, setIsShowStatistic] = useState(false);

    return (
        <div className="mt-[10px]">
            {isShowStatistic ? (
                <SedieMultiplayerStatisticPopup inline onClose={() => setIsShowStatistic(false)} />
            ) : (
                <RoundHistory
                    roundHistory={roundHistory}
                    isShowBlink={isShowBlink}
                    renderItem={SedieMultiplayerRoundHistoryItem}
                    numberOfItems={14}
                    sideButton={<IconStatistic onClick={() => setIsShowStatistic(true)} />}
                    sizeNextItem="medium"
                />
            )}
        </div>
    );
};
