import { LoadingSpinner } from "@shared/components/game-components/game-loading/loading-spinner";
import { RoundHistory } from "@shared/components/game-components/round-history/chain";
import { IconStatistic } from "@shared/components/game-components/statistic/icon-statistic";
import { useClickSound } from "@shared/react-hooks";
import useGameStore from "@shared/stores/game-store/game-store";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { BaccaratMultiplayerRoundHistoryItem } from "./baccarat-multiplayer-round-history-item";
const BaccaratMultiplayerStatisticPopup = dynamic(() => import("./baccarat-multiplayer-statistic-popup"), {
    loading: () => (
        <div className="relative h-[40px]">
            <LoadingSpinner />
        </div>
    ),
    ssr: false,
});

export const BaccaratMultiplayerRoundHistory = () => {
    const clickSound = useClickSound();

    const { roundHistory, isShowBlink } = useGameStore(
        useShallow((state) => ({ roundHistory: state.roundHistory, isShowBlink: state.isShowBlink }))
    );

    console.log("ROUND HISTORY::: ", roundHistory);
    

    const [isShowStatistic, setIsShowStatistic] = useState(false);

    const handleClickStatistic = () => {
        clickSound();
        setIsShowStatistic(true);
    };

    return (
        <div className="mt-[10px] mb-2 mx-3">
            {isShowStatistic ? (
                <BaccaratMultiplayerStatisticPopup inline onClose={() => setIsShowStatistic(false)} />
            ) : (
                <RoundHistory
                    roundHistory={roundHistory}
                    isShowBlink={isShowBlink}
                    renderItem={BaccaratMultiplayerRoundHistoryItem}
                    numberOfItems={14}
                    sideButton={<IconStatistic onClick={handleClickStatistic} />}
                    sizeNextItem="medium"
                />
            )}
        </div>
    );
};
