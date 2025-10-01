import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "@shared/components/game-base/type";
import { useIsDesktop } from "@shared";
import { useHighlightConfig } from "./use-highlight-config";
import { BaccaratHighlightBase } from "./baccarat-highlight-base";

export const BaccaratHighlightBetOption = ({ choice }: { choice: string }) => {
    const isDesktop = useIsDesktop();
    const { showResultInfo, settlementResult, roundState } = useGameStateContext();

    const { imagePath, shadowClass } = useHighlightConfig(choice, isDesktop);

    return (
        [RoundState.None, RoundState.DisplayResult].includes(roundState) &&
        showResultInfo &&
        settlementResult[choice] && (
            <BaccaratHighlightBase
                choice={choice}
                imagePath={imagePath}
                shadowClass={shadowClass}
                withAnimation={true}
            />
        )
    );
};

export default BaccaratHighlightBetOption;
