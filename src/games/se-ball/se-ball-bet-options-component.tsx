import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

import { useGameContext } from "../../_shared/react-contexts";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { isShowHighlightPrevResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { BetChoiceImagesData, DotColorMapper, SeBallBetOptions, SeBallBetOptionsPercentageColor } from "./se-ball-constants";
import Style from "./se-ball.module.scss";

const BetChoice = dynamic(() => import("../../components/game-components/bet-option/bet-choice"));
const RippleButton = dynamic(() => import("../../components/game-components/bet-option/ripple-button"));
const BetPercentage = dynamic(() => import("../../components/game-components/bet-option/bet-percentage"));
const Odds = dynamic(() => import("../../components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("../../components/game-components/bet-option/own-bet"));
const PlayerBetCount = dynamic(() => import("../../components/game-components/bet-option/player-bet-count"));
const TotalBet = dynamic(() => import("../../components/game-components/bet-option/total-bet"));
const SeBallWinningAnimation = dynamic(() => import("./se-ball-winning-animation"));

const SeBallBetOptionsComponent = () => {
    const { roundState, settlementResult, showResultInfo, roundHistory, turnCounter } = useGameStateContext();
    const { tolgeeNamespace } = useGameContext();

    const isShowDisabledLayer = roundState === RoundState.LockingBet;

    const [loadingComplete, setLoadingComplete] = useState({
        [SeBallBetOptions.ODD]: false,
        [SeBallBetOptions.EVEN]: false,
        [SeBallBetOptions.BLUE3]: false,
        [SeBallBetOptions.RED3]: false,
        [SeBallBetOptions.RED2]: false,
        [SeBallBetOptions.RED4]: false,
        [SeBallBetOptions.BLUE4]: false,
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
                percentageColor={SeBallBetOptionsPercentageColor[choice]}
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
                turnCounter={turnCounter}
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
            case SeBallBetOptions.ODD:
                className = `${Style["highlight-prev-result-odd"]} fade-in`;
                break;
            case SeBallBetOptions.EVEN:
                className = `${Style["highlight-prev-result-even"]} fade-in`;
                break;
            case SeBallBetOptions.BLUE3:
                className = `${Style["highlight-prev-result-blue3"]} fade-in`;
                break;
            case SeBallBetOptions.BLUE4:
                className = `${Style["highlight-prev-result-blue4"]} fade-in`;
                break;
            case SeBallBetOptions.RED3:
                className = `${Style["highlight-prev-result-red3"]} fade-in`;
                break;
            case SeBallBetOptions.RED4:
                className = `${Style["highlight-prev-result-red4"]} fade-in`;
                break;
            case SeBallBetOptions.RED2:
                className = `${Style["highlight-prev-result-red2"]} fade-in`;
                break;
            default:
        }
        return <div className={className}></div>;
    };

    const renderHighlightWinningResult = (choice: string) => {
        let resourceName = "";

        switch (choice) {
            case SeBallBetOptions.ODD:
            case SeBallBetOptions.EVEN:
                resourceName = SeBallBetOptions.EVEN;
                break;

            case SeBallBetOptions.BLUE3:
            case SeBallBetOptions.RED3:
                resourceName = SeBallBetOptions.BLUE3;
                break;

            case SeBallBetOptions.BLUE4:
            case SeBallBetOptions.RED4:
                resourceName = SeBallBetOptions.BLUE4;
                break;

            case SeBallBetOptions.RED2:
                resourceName = SeBallBetOptions.RED2;
                break;
        }

        return (
            <SeBallWinningAnimation
                showResultInfo={showResultInfo}
                roundState={roundState}
                settlementResult={settlementResult}
                choice={choice}
                resourceName={resourceName}
            />
        );
    };

    const renderMainOption = (choice: string) => {
        const className = Style[`choice-${choice}`];

        return (
            <div className={`${Style[choice]} text-white relative`}>
                <Image
                    className={Style["bg-bet-option"]}
                    width={178}
                    height={94}
                    src={loadingComplete[choice] ? BetChoiceImagesData[choice]?.src : BetChoiceImagesData[choice]?.blur}
                    onLoad={() => setLoadingComplete((prevState) => ({ ...prevState, [choice]: true }))}
                    alt={choice}
                    priority={true}
                />

                <div className={`${Style["choice-info"]} ${className}`}>
                    <div className={Style.stake}>
                        {renderTotalBet(choice, choice === SeBallBetOptions.ODD ? "justify-end" : "")}
                        {renderPlayerBetCount(choice, choice === SeBallBetOptions.ODD ? "justify-end" : "")}
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

    const renderDot = (choice: string) => {
        const dots = DotColorMapper[choice];

        if (dots) {
            return dots.map((dot, index) => <div key={index} className={`${dot ? Style["dot-red"] : Style["dot-blue"]}`}></div>);
        }

        return null;
    };

    const getSubOptionsName = (choice) => {
        let backgroundName = "";

        switch (choice) {
            case SeBallBetOptions.BLUE3:
            case SeBallBetOptions.RED3:
                backgroundName = SeBallBetOptions.BLUE3;
                break;

            case SeBallBetOptions.BLUE4:
            case SeBallBetOptions.RED4:
                backgroundName = SeBallBetOptions.RED4;

                break;

            case SeBallBetOptions.RED2:
                backgroundName = SeBallBetOptions.RED2;
                break;
        }

        return backgroundName;
    };

    const renderSubOptions = (choice: string) => {
        const backgroundName = getSubOptionsName(choice);
        return (
            <div className={`${Style[choice]} ${Style["bet-choice"]}`}>
                <Image
                    className={Style["bg-bet-option"]}
                    width={choice === SeBallBetOptions.RED2 ? 77 : 136}
                    height={choice === SeBallBetOptions.RED2 ? 149 : 66}
                    src={loadingComplete[choice] ? BetChoiceImagesData[backgroundName]?.src : BetChoiceImagesData[backgroundName]?.blur}
                    onLoad={() => setLoadingComplete((prevState) => ({ ...prevState, [choice]: true }))}
                    alt={choice}
                    priority={true}
                />

                <div className={`${Style["dot-wrapper"]} ${choice === "red2" ? Style["two-lines"] : ""}`}>{renderDot(choice)}</div>
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
                <div className={Style["bet-option-row"]}>{renderMainOption(SeBallBetOptions.ODD)}</div>
                <div className={Style["bet-option-row"]}>{renderMainOption(SeBallBetOptions.EVEN)}</div>
            </div>

            <div className={Style["sub-betting-zone"]}>
                {renderSubOptions(SeBallBetOptions.BLUE3)}
                {renderSubOptions(SeBallBetOptions.BLUE4)}
                {renderSubOptions(SeBallBetOptions.RED2)}
                {renderSubOptions(SeBallBetOptions.RED3)}
                {renderSubOptions(SeBallBetOptions.RED4)}
            </div>
        </>
    );
};

export default SeBallBetOptionsComponent;
