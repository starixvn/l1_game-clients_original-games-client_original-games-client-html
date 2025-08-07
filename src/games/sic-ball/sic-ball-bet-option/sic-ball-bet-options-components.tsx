import dynamic from "next/dynamic";
import { RoundState } from "../../../components/game-base/type";
import { BetChoiceImagesData, SicBallBetOptions, SicBallBetOptionsPercentageColor } from "../sic-ball-constants";
import Style from "../sic-ball.module.scss";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useGameContext } from "../../../_shared/react-contexts";
import SmallBall from "../../../components/game-components/small-ball";
import { isShowHighlightPrevResult } from "../../../_shared/react-hooks/use-high-light";
import Image from 'next/image';
import { useTranslator } from "../../../_shared/react-hooks";
import { useState } from "react";

const BetChoice = dynamic(() => import("../../../components/game-components/bet-option/bet-choice"));
const BetPercentage = dynamic(() => import("../../../components/game-components/bet-option/bet-percentage"));
const Odds = dynamic(() => import("../../../components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("../../../components/game-components/bet-option/own-bet"));
const PlayerBetCount = dynamic(() => import("../../../components/game-components/bet-option/player-bet-count"));
const TotalBet = dynamic(() => import("../../../components/game-components/bet-option/total-bet"));
const SicBallWinningAnimation = dynamic(() => import("../sic-ball-winning-animation"));
const RippleButton = dynamic(() => import("../../../components/game-components/bet-option/ripple-button"));

export const getSubOptionsName = (choice: string) => {
    const subOptionsNameMap: Record<string, string> = {
        [SicBallBetOptions.SPECIFIC1]: SicBallBetOptions.SPECIFIC1,
        [SicBallBetOptions.SPECIFIC2]: SicBallBetOptions.SPECIFIC1,
        [SicBallBetOptions.SPECIFIC3]: SicBallBetOptions.SPECIFIC1,
        [SicBallBetOptions.SPECIFIC4]: SicBallBetOptions.SPECIFIC4,
        [SicBallBetOptions.SPECIFIC5]: SicBallBetOptions.SPECIFIC4,
        [SicBallBetOptions.SPECIFIC6]: SicBallBetOptions.SPECIFIC4,
    };

    return subOptionsNameMap[choice] || "";
};

export const getBallNumber = (choice: string): number => {
    const sicBallBetOptions = {
        specific1: 1,
        specific2: 2,
        specific3: 3,
        specific4: 4,
        specific5: 5,
        specific6: 6,
    };

    return sicBallBetOptions[choice] || null;
};

export const SicBallBetInfo = ({ choice }) => {
    const betInfoText = {
        [SicBallBetOptions.BIG]: "[11 - 18]",
        [SicBallBetOptions.SMALL]: "[3 - 10]",
    };

    if (betInfoText.hasOwnProperty(choice)) {
        return <div className={Style["bet-info"]}>{betInfoText[choice]}</div>;
    }

    return null;
};

export const SideBetOdds = ({ sideBetOdds }) => {
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <div className={Style["odds-item"]}>
            <div>{t(`odds_${sideBetOdds}`)}</div>
            <Odds
                turnCounter={useGameStateContext()?.turnCounter}
                choice={sideBetOdds}
                tolgeeNamespace={tolgeeNamespace}
                animationDuration={6}
                isFormatOddsAuto={true}
                className={Style["odds-value"]}
            />
        </div>
    );
};

export const HighlightWinningPrevResult = ({ choice }) => {
    const highlightClassNameMap: Record<string, string> = {
        [SicBallBetOptions.BIG]: `${Style["highlight-prev-result-big"]} fade-in`,
        [SicBallBetOptions.SMALL]: `${Style["highlight-prev-result-small"]} fade-in`,
        [SicBallBetOptions.SPECIFIC1]: `${Style["highlight-prev-result-specific1"]} fade-in`,
        [SicBallBetOptions.SPECIFIC2]: `${Style["highlight-prev-result-specific2"]} fade-in`,
        [SicBallBetOptions.SPECIFIC3]: `${Style["highlight-prev-result-specific3"]} fade-in`,
        [SicBallBetOptions.SPECIFIC4]: `${Style["highlight-prev-result-specific4"]} fade-in`,
        [SicBallBetOptions.SPECIFIC5]: `${Style["highlight-prev-result-specific5"]} fade-in`,
        [SicBallBetOptions.SPECIFIC6]: `${Style["highlight-prev-result-specific6"]} fade-in`,
    };

    return <div className={highlightClassNameMap[choice] || ""}></div>;
};

export const HighlightWinningResult = ({ choice }) => {
    const { roundState, settlementResult, showResultInfo } = useGameStateContext();
    const resourceNameMap: Record<string, string> = {
        [SicBallBetOptions.BIG]: SicBallBetOptions.SMALL,
        [SicBallBetOptions.SMALL]: SicBallBetOptions.SMALL,
        [SicBallBetOptions.SPECIFIC1]: SicBallBetOptions.SPECIFIC1,
        [SicBallBetOptions.SPECIFIC2]: SicBallBetOptions.SPECIFIC1,
        [SicBallBetOptions.SPECIFIC3]: SicBallBetOptions.SPECIFIC1,
        [SicBallBetOptions.SPECIFIC4]: SicBallBetOptions.SPECIFIC1,
        [SicBallBetOptions.SPECIFIC5]: SicBallBetOptions.SPECIFIC1,
        [SicBallBetOptions.SPECIFIC6]: SicBallBetOptions.SPECIFIC1,
    };

    return (
        <SicBallWinningAnimation
            showResultInfo={showResultInfo}
            roundState={roundState}
            settlementResult={settlementResult}
            choice={choice}
            resourceName={resourceNameMap[choice] || ""}
        />
    );
};

export const SicBallMainOption = ({ choice }) => {
    const { roundState, roundHistory, turnCounter } = useGameStateContext();
    const { tolgeeNamespace } = useGameContext();
    const [loadingComplete, setLoadingComplete] = useState(false);

    const isShowDisabledLayer = roundState === RoundState.LockingBet;

    const className = Style[`choice-${choice}`];

    return (
        <div className={`${Style[choice]} text-white relative`}>
            <Image
                className={Style["bg-bet-option"]}
                width={173}
                height={104}
                src={loadingComplete ? BetChoiceImagesData[choice]?.src : BetChoiceImagesData[choice]?.blur}
                onLoad={() => setLoadingComplete(true)}
                alt={choice}
                priority={true}
            />
            <div className={`${Style["choice-info"]} ${className}`}>
                <div className={Style.stake}>
                    <TotalBet choice={choice} className={choice === SicBallBetOptions.BIG ? "justify-end" : ""} tolgeeNamespace={tolgeeNamespace} />
                    <PlayerBetCount choice={choice} className={`flex items-center players gap-1 ${choice === SicBallBetOptions.BIG ? "justify-end" : ""}`} tolgeeNamespace={tolgeeNamespace} />
                </div>
                <BetPercentage
                    choice={choice}
                    className={Style.percent}
                    tolgeeNamespace={tolgeeNamespace}
                    percentageColor={SicBallBetOptionsPercentageColor[choice]}
                />
            </div>
            <div className={`${Style["choice-odds-area"]}`}>
                <BetChoice choice={choice} className={Style[`bet-name-${choice}`]} tolgeeNamespace={tolgeeNamespace} />
                <SicBallBetInfo choice={choice} />
                <Odds
                    choice={choice}
                    tolgeeNamespace={tolgeeNamespace}
                    animationDuration={6}
                    turnCounter={turnCounter}
                    isFormatOddsAuto={true}
                    className={className}
                />
            </div>
            <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} className={Style["own-bet"]} />
            <div className={Style["winning-effect"]}>
                <HighlightWinningResult choice={choice} /></div>

            <RippleButton className={`${Style["btn-ripple"]}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />

            {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}
            {isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory }) &&
                <HighlightWinningPrevResult choice={choice} />}
        </div>
    );
};

export const SicBallSubOptions = ({ choice }) => {
    const { roundState, roundHistory } = useGameStateContext();
    const { tolgeeNamespace } = useGameContext();
    const [loadingComplete, setLoadingComplete] = useState(false);

    const isShowDisabledLayer = roundState === RoundState.LockingBet;
    const backgroundName = getSubOptionsName(choice);

    return (
        <div className={`${Style[choice]} ${Style["bet-choice"]}`}>
            <Image
                className={Style["bg-bet-option"]}
                width={113}
                height={60}
                src={loadingComplete ? BetChoiceImagesData[backgroundName]?.src : BetChoiceImagesData[backgroundName]?.blur}
                onLoad={() => setLoadingComplete(true)}
                alt={choice}
                priority={true}
            />
            <TotalBet choice={choice} className={Style["side-bet-total-bet"]} tolgeeNamespace={tolgeeNamespace} />
            <SmallBall number={getBallNumber(choice)} customClass={Style["specific-icon-number"]} />

            <div className={Style["own-bet-container"]}>
                <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} className={Style["own-bet"]} />
            </div>
            <div className={Style["winning-effect"]}>
                <HighlightWinningResult choice={choice} />
            </div>

            <RippleButton className={`${Style["btn-ripple"]}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />
            {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}
            {
                isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory })
                && <HighlightWinningPrevResult choice={choice} />
            }
        </div>
    );
};
