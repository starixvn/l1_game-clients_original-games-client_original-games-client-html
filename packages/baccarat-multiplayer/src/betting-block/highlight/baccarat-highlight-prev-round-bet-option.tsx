import { isShowHighlightPrevResult, useGameStore, useIsDesktop } from "@shared";
import { useShallow } from "zustand/shallow";
import { useHighlightConfig } from "./use-highlight-config";
import { BaccaratHighlightBase } from "./baccarat-highlight-base";

export const BaccaratHighlightPrevRoundBetOption = ({ choice }: { choice: string }) => {
    const isDesktop = useIsDesktop();

    const { roundHistory, roundState } = useGameStore(
        useShallow((state) => ({
            roundHistory: state.roundHistory,
            roundState: state.roundState,
        }))
    );

    const { imagePath, shadowClass } = useHighlightConfig(choice, isDesktop);

    const isShow = isShowHighlightPrevResult({
        betChoice: choice,
        roundState,
        roundHistory,
    });

    if (!isShow) {
        return null;
    }

    return (
        <BaccaratHighlightBase
            choice={choice}
            imagePath={imagePath}
            shadowClass={shadowClass}
            withAnimation={false}
        />
    );
};

export default BaccaratHighlightPrevRoundBetOption;
