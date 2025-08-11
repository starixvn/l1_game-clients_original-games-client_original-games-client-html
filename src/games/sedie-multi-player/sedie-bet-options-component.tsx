import dynamic from "next/dynamic";
import { useState } from "react";

import { useGameContext } from "../../_shared/react-contexts";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { isShowHighlightPrevResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { SeDieBetOptions } from "./sedie-constants";
import Style from "./sedie-multi-player.module.scss";

const BetChoice = dynamic(() => import("../../components/game-components/bet-option/bet-choice"));
const RippleButton = dynamic(() => import("../../components/game-components/bet-option/ripple-button"));
const BetPercentage = dynamic(() => import("../../components/game-components/bet-option/bet-percentage"));
const Odds = dynamic(() => import("../../components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("../../components/game-components/bet-option/own-bet"));
const PlayerBetCount = dynamic(() => import("../../components/game-components/bet-option/player-bet-count"));
const TotalBet = dynamic(() => import("../../components/game-components/bet-option/total-bet"));
const SeDieWinningAnimation = dynamic(() => import("./sedie-winning-animation"));

const SeDieBetOptionsComponent = () => {
    const { roundState, settlementResult, showResultInfo, roundHistory } = useGameStateContext();
    const { tolgeeNamespace } = useGameContext();

    const isShowDisabledLayer = roundState === RoundState.LockingBet;

    const [loadingComplete, setLoadingComplete] = useState({
        [SeDieBetOptions.ODD]: false,
        [SeDieBetOptions.EVEN]: false,
        [SeDieBetOptions.RED2]: false,
        [SeDieBetOptions.RED3]: false,
        [SeDieBetOptions.RED4]: false,
        [SeDieBetOptions.WHITE3]: false,
        [SeDieBetOptions.WHITE4]: false,
    });

    const [hoveredChoice, setHoveredChoice] = useState<string | null>(null);

    const renderTotalBet = (choice: string, className?: string) => {
        return <TotalBet choice={choice} className={className} tolgeeNamespace={tolgeeNamespace} />;
    };

    const renderBetPercentage = (choice: string) => {
        return (
            <BetPercentage
                choice={choice}
                className={Style.percent}
                tolgeeNamespace={tolgeeNamespace}
            />
        );
    };

    const renderPlayerBetCount = (choice: string, className?: string) => {
        return (
            <PlayerBetCount choice={choice} className={`flex items-center players gap-1 ${className}`} tolgeeNamespace={tolgeeNamespace} />
        );
    };

    const renderBetChoice = (choice: string) => {
        return <BetChoice choice={choice} className={Style[`bet-name-${choice}`]} tolgeeNamespace={tolgeeNamespace} />;
    };

    const renderOdds = (choice: string) => {
        return (
            <Odds
                choice={choice}
                tolgeeNamespace={tolgeeNamespace}
                animationDuration={6}
                isFormatOddsAuto={true}
            />
        );
    };

    const renderOwnBet = (choice: string) => {
        return <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} className={Style["own-bet"]} />;
    };

    const renderHighlightWinningPrevResult = (choice: string) => {
        let className = "";
        switch (choice) {
            case SeDieBetOptions.ODD:
                className = `${Style["highlight-prev-result-odd"]} fade-in`;
                break;
            case SeDieBetOptions.EVEN:
                className = `${Style["highlight-prev-result-even"]} fade-in`;
                break;
            case SeDieBetOptions.RED2:
                className = `${Style["highlight-prev-result-red2"]} fade-in`;
                break;
            case SeDieBetOptions.RED3:
                className = `${Style["highlight-prev-result-red3"]} fade-in`;
                break;
            case SeDieBetOptions.RED4:
                className = `${Style["highlight-prev-result-red4"]} fade-in`;
                break;
            case SeDieBetOptions.WHITE3:
                className = `${Style["highlight-prev-result-white3"]} fade-in`;
                break;
            case SeDieBetOptions.WHITE4:
                className = `${Style["highlight-prev-result-white4"]} fade-in`;
                break;
        }

        return isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory }) ? (
            <div className={className} />
        ) : null;
    };

    const renderHighlightWinningResult = (choice: string) => {
        const resourceName = choice; // sedie resources map 1:1 to choice keys
        return (
            <SeDieWinningAnimation
                showResultInfo={showResultInfo}
                roundState={roundState}
                settlementResult={settlementResult}
                choice={choice}
                resourceName={resourceName}
            />
        );
    };

    const renderMainOption = (choice: string) => {
        const isHovered = hoveredChoice === choice;
        const isDisabled = isShowDisabledLayer;

        return (
            <div
                key={choice}
                className={`${Style[`main-option-${choice}`]} ${isHovered ? Style.hovered : ''} ${isDisabled ? Style.disabled : ''}`}
                onMouseEnter={() => setHoveredChoice(choice)}
                onMouseLeave={() => setHoveredChoice(null)}
            >
                <RippleButton
                    choice={choice}
                    className={Style[`ripple-button-${choice}`]}
                    id={`sedie-${choice}`}
                />
                {renderBetChoice(choice)}
                {renderOdds(choice)}
                {renderOwnBet(choice)}
                {renderTotalBet(choice)}
                {renderPlayerBetCount(choice)}
                {renderBetPercentage(choice)}
                {renderHighlightWinningPrevResult(choice)}
                <div className={Style["winning-effect"]}>{renderHighlightWinningResult(choice)}</div>

                {isHovered && !isDisabled && (
                    <div className={Style["hover-overlay"]}>
                        <div className={Style["hover-content"]}>
                            <span className={Style["hover-text"]}>Click to bet on {choice}</span>
                        </div>
                    </div>
                )}

                {isDisabled && (
                    <div className={Style["disabled-overlay"]}>
                        <span className={Style["disabled-text"]}>Betting Closed</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={Style["bet-options-container"]}>
            <div className={Style["main-options"]}>
                {renderMainOption(SeDieBetOptions.ODD)}
                {renderMainOption(SeDieBetOptions.EVEN)}
            </div>
            <div className={Style["sub-options"]}>
                <div className={Style["sub-option"]}>
                    {renderMainOption(SeDieBetOptions.RED2)}
                </div>
                <div className={Style["sub-option"]}>
                    {renderMainOption(SeDieBetOptions.RED3)}
                </div>
                <div className={Style["sub-option"]}>
                    {renderMainOption(SeDieBetOptions.RED4)}
                </div>
                <div className={Style["sub-option"]}>
                    {renderMainOption(SeDieBetOptions.WHITE3)}
                </div>
                <div className={Style["sub-option"]}>
                    {renderMainOption(SeDieBetOptions.WHITE4)}
                </div>
            </div>
        </div>
    );
};

export default SeDieBetOptionsComponent;
