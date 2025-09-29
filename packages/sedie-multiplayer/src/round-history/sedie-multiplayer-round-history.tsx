import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import { RoundHistory } from '@shared/components/game-components/round-history/chain';
import { IconStatistic } from '@shared/components/game-components/statistic/icon-statistic';
import { SedieMultiplayerRoundHistoryItem } from "./sedie-multiplayer-round-history-item";
import useGameStore from '@shared/stores/game-store/game-store';
import { LoadingSpinner } from '@shared/components/game-components/game-loading/loading-spinner';
import { useClickSound } from '@shared/react-hooks';
import { useStatisticStore } from "@shared";
import LoggerControls from "../features/ui/components/controls/LoggerControls";
const SedieMultiplayerStatisticPopup = dynamic(() => import("./sedie-multiplayer-statistic-popup"), {
    loading: () => (
        <div className="relative h-[40px]">
            <LoadingSpinner />
        </div>
    ),
    ssr: false,
});

export const SedieMultiplayerRoundHistory = () => {
    const clickSound = useClickSound();

    const { roundHistory, isShowBlink } = useGameStore(
        useShallow((state) => ({ roundHistory: state.roundHistory, isShowBlink: state.isShowBlink }))
    );
    const { isShowStatistic, showStatistic, hideStatistic } = useStatisticStore(useShallow((state) => ({
        isShowStatistic: state.isShowStatistic,
        showStatistic: state.showStatistic,
        hideStatistic: state.hideStatistic,
    })));

    const handleClickStatistic = () => {
        clickSound();
        showStatistic();
    };

    return (
        <div className="mt-[10px] mb-2">
            {isShowStatistic ? (
                <SedieMultiplayerStatisticPopup inline onClose={hideStatistic} />
            ) : (
                <RoundHistory
                    roundHistory={roundHistory}
                    isShowBlink={isShowBlink}
                    renderItem={SedieMultiplayerRoundHistoryItem}
                    numberOfItems={14}
                    sideButton={<IconStatistic onClick={handleClickStatistic} />}
                    sizeNextItem="medium"
                />
            )}
            <LoggerControls className="fixed top-4 right-4 z-50" />
        </div>
    );
};
