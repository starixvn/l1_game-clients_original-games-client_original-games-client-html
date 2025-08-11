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
                className = `${Style["highlight-prev-result-blue3"]} fade-in`;
                break;
            case SeDieBetOptions.WHITE4:
                className = `${Style["highlight-prev-result-blue4"]} fade-in`;
                break;
        }

        return isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory }) ? (
            <div className={className} />
        ) : null;
    };

    const renderHighlightWinningResult = (choice: string) => {
        // Map to SeBall resources: odd/even -> even, white3/white4 -> blue3/blue4
        const resourceName =
            choice === SeDieBetOptions.ODD || choice === SeDieBetOptions.EVEN
                ? "even"
                : choice === SeDieBetOptions.WHITE3 || choice === SeDieBetOptions.RED3
                    ? "blue3"
                    : choice === SeDieBetOptions.WHITE4 || choice === SeDieBetOptions.RED4
                        ? "blue4"
                        : choice;
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
        const reverse = choice === SeDieBetOptions.ODD; // mirror like se-ball odd/even
        return (
            <div className={`${Style[choice]} text-white relative`}>
                <div className={`${Style["choice-info"]} ${reverse ? Style["choice-odd"] : ""}`}>
                    <div className={Style.stake}>
                        {renderTotalBet(choice, reverse ? "justify-end" : "")}
                        {renderPlayerBetCount(choice, reverse ? "justify-end" : "")}
                    </div>
                    {renderBetPercentage(choice)}
                </div>
                <div className={`${Style["choice-odds-area"]}`}>
                    {renderBetChoice(choice)}
                    {renderOdds(choice)}
                </div>

                {renderOwnBet(choice)}
                <div className={Style["winning-effect"]}>{renderHighlightWinningResult(choice)}</div>

                <RippleButton className={`${Style["btn-ripple"]}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />
                {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}
                {isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory }) && renderHighlightWinningPrevResult(choice)}
            </div>
        );
    };

    const renderSubOption = (choice: string) => {
        return (
            <div className={`${Style[choice]} ${Style["bet-choice"]}`}>
                <div className={`${Style["dot-wrapper"]} ${choice === SeDieBetOptions.RED2 ? Style["two-lines"] : ""}`}></div>
                {renderOdds(choice)}
                <div className={Style["own-bet-container"]}>{renderOwnBet(choice)}</div>
                <div className={Style["winning-effect"]}>{renderHighlightWinningResult(choice)}</div>

                <RippleButton className={`${Style["btn-ripple"]}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />
                {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}
                {isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory }) && renderHighlightWinningPrevResult(choice)}
            </div>
        );
    };

    return (
        <>
            <div className="flex justify-between">
                <div className={Style["bet-option-row"]}>{renderMainOption(SeDieBetOptions.ODD)}</div>
                <div className={Style["bet-option-row"]}>{renderMainOption(SeDieBetOptions.EVEN)}</div>
            </div>

            <div className={Style["sub-betting-zone"]}>
                {renderSubOption(SeDieBetOptions.WHITE3)}
                {renderSubOption(SeDieBetOptions.WHITE4)}
                {renderSubOption(SeDieBetOptions.RED2)}
                {renderSubOption(SeDieBetOptions.RED3)}
                {renderSubOption(SeDieBetOptions.RED4)}
            </div>
        </>
    );
};

export default SeDieBetOptionsComponent;
