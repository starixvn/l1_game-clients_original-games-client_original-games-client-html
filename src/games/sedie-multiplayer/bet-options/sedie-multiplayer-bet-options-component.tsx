import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

import { useGameContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { isShowHighlightPrevResult } from "../../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../../components/game-base/type";
import { SeDieBetOptions, SeDieBetOptionsPercentageColor } from "../sedie-multiplayer-constants";
import Style from "./style.module.scss";
import { BetChoiceImagesData, DotColorMapper } from "../sedie-multiplayer-constants";
import { SedieMultiplayerSubBetOptions } from "./sedie-sub-option";
import { SedieMultiplayerMainOption } from "./sedie-main-option";
import useGameStore from "../../../_shared/stores/game-store/game-store";

// const BetChoice = dynamic(() => import("../../../components/game-components/bet-option/bet-choice"));
// const RippleButton = dynamic(() => import("../../../components/game-components/bet-option/ripple-button"));
// const BetPercentage = dynamic(() => import("../../../components/game-components/bet-option/bet-percentage"));
// const Odds = dynamic(() => import("../../../components/game-components/bet-option/odds"));
// const OwnBet = dynamic(() => import("../../../components/game-components/bet-option/own-bet"));
// const PlayerBetCount = dynamic(() => import("../../../components/game-components/bet-option/player-bet-count"));
// const TotalBet = dynamic(() => import("../../../components/game-components/bet-option/total-bet"));
// const SeDieWinningAnimation = dynamic(() => import("../sedie-multiplayer-winning-animation"));

const SeDieBetOptionsComponent = () => {
    const roundState = useGameStore((state) => state.roundState);
    // const { roundState, settlementResult, showResultInfo, roundHistory } = useGameStateContext();
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

    // const renderTotalBet = (choice: string, className?: string) => {
    //     return <TotalBet choice={choice} className={className} tolgeeNamespace={tolgeeNamespace} />;
    // };

    // const renderBetPercentage = (choice: string) => {
    //     return (
    //         <BetPercentage
    //             choice={choice}
    //             className={Style.percent}
    //             tolgeeNamespace={tolgeeNamespace}
    //             percentageColor={SeDieBetOptionsPercentageColor[choice]}
    //         />
    //     );
    // };

    // const renderPlayerBetCount = (choice: string, className?: string) => {
    //     return (
    //         <PlayerBetCount choice={choice} className={`flex items-center players gap-1 ${className}`} tolgeeNamespace={tolgeeNamespace} />
    //     );
    // };

    // const renderBetChoice = (choice: string) => {
    //     const mapped = mapToSeBallResource(choice);
    //     return <BetChoice choice={choice} className={Style[`bet-name-${mapped}`]} tolgeeNamespace={tolgeeNamespace} />;
    // };

    // const renderOdds = (choice: string) => {
    //     return <Odds choice={choice} tolgeeNamespace={tolgeeNamespace} animationDuration={6} isFormatOddsAuto={true} />;
    // };

    // const renderOwnBet = (choice: string) => {
    //     return <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} className={Style["own-bet"]} />;
    // };

    // const renderHighlightWinningPrevResult = (choice: string) => {
    //     let className = "";
    //     const mapped = mapToSeBallResource(choice);
    //     switch (mapped) {
    //         case "odd":
    //             className = `${Style["highlight-prev-result-odd"]} fade-in`;
    //             break;
    //         case "even":
    //             className = `${Style["highlight-prev-result-even"]} fade-in`;
    //             break;
    //         case "red2":
    //             className = `${Style["highlight-prev-result-red2"]} fade-in`;
    //             break;
    //         case "red3":
    //             className = `${Style["highlight-prev-result-red3"]} fade-in`;
    //             break;
    //         case "red4":
    //             className = `${Style["highlight-prev-result-red4"]} fade-in`;
    //             break;
    //         case "blue3":
    //             className = `${Style["highlight-prev-result-blue3"]} fade-in`;
    //             break;
    //         case "blue4":
    //             className = `${Style["highlight-prev-result-blue4"]} fade-in`;
    //             break;
    //     }

    //     return isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory }) ? <div className={className} /> : null;
    // };

    // const renderHighlightWinningResult = (choice: string) => {
    //     const resourceName = mapToSeBallHighlightResource(choice);
    //     return (
    //         <SeDieWinningAnimation
    //             showResultInfo={showResultInfo}
    //             roundState={roundState}
    //             settlementResult={settlementResult}
    //             choice={choice}
    //             resourceName={resourceName}
    //         />
    //     );
    // };

    // const mapToSeBallResource = (choice: string) => {
    //     if (choice === SeDieBetOptions.WHITE3) return "blue3";
    //     if (choice === SeDieBetOptions.WHITE4) return "blue4";
    //     return choice;
    // };

    // const mapToSeBallHighlightResource = (choice: string) => {
    //     if (choice === SeDieBetOptions.ODD || choice === SeDieBetOptions.EVEN) return "even";
    //     if (choice === SeDieBetOptions.RED3 || choice === SeDieBetOptions.WHITE3) return "blue3";
    //     if (choice === SeDieBetOptions.RED4 || choice === SeDieBetOptions.WHITE4) return "blue4";
    //     return choice;
    // };

    // const renderMainOption = (choice: string) => {
    //     const reverse = choice === SeDieBetOptions.ODD;
    //     const bgKey = mapToSeBallResource(choice);
    //     return (
    //         <div className={`${Style[bgKey]} text-white relative`}>
    //             <Image
    //                 className={Style["bg-bet-option"]}
    //                 width={178}
    //                 height={94}
    //                 src={loadingComplete[choice] ? BetChoiceImagesData[bgKey]?.src : BetChoiceImagesData[bgKey]?.blur}
    //                 onLoad={() => setLoadingComplete((prevState) => ({ ...prevState, [choice]: true }))}
    //                 alt={choice}
    //                 priority={true}
    //             />

    //             <div className={`${Style["choice-info"]} ${reverse ? Style["choice-odd"] : ""}`}>
    //                 <div className={Style.stake}>
    //                     {renderTotalBet(choice, reverse ? "justify-end" : "")}
    //                     {renderPlayerBetCount(choice, reverse ? "justify-end" : "")}
    //                 </div>
    //                 {renderBetPercentage(choice)}
    //             </div>
    //             <div className={`${Style["choice-odds-area"]}`}>
    //                 {renderBetChoice(choice)}
    //                 {renderOdds(choice)}
    //             </div>

    //             {renderOwnBet(choice)}
    //             <div className={Style["winning-effect"]}>{renderHighlightWinningResult(choice)}</div>

    //             <RippleButton className={`${Style["btn-ripple"]}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />
    //             {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}
    //             {isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory }) && renderHighlightWinningPrevResult(choice)}
    //         </div>
    //     );
    // };
    // const renderSubOption = (choice: string) => {
    //     const bgKey = getSubOptionBackgroundName(choice);
    //     return (
    //         <div className={`${Style[choice]} ${Style["bet-choice"]}`}>
    //             <Image
    //                 className={Style["bg-bet-option"]}
    //                 width={choice === SeDieBetOptions.RED2 ? 77 : 136}
    //                 height={choice === SeDieBetOptions.RED2 ? 149 : 66}
    //                 src={loadingComplete[choice] ? BetChoiceImagesData[bgKey]?.src : BetChoiceImagesData[bgKey]?.blur}
    //                 onLoad={() => setLoadingComplete((prevState) => ({ ...prevState, [choice]: true }))}
    //                 alt={choice}
    //                 priority={true}
    //             />

    //             <div className={`${Style["dot-wrapper"]} ${choice === SeDieBetOptions.RED2 ? Style["two-lines"] : ""}`}>
    //                 {renderDot(choice)}
    //             </div>
    //             {renderOdds(choice)}
    //             <div className={Style["own-bet-container"]}>{renderOwnBet(choice)}</div>
    //             <div className={Style["winning-effect"]}>{renderHighlightWinningResult(choice)}</div>

    //             <RippleButton className={`${Style["btn-ripple"]}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />
    //             {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}
    //             {isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory }) && renderHighlightWinningPrevResult(choice)}
    //         </div>
    //     );
    // };

    // const renderDot = (choice: string) => {
    //     const mapped = mapToSeBallResource(choice);
    //     const dots = DotColorMapper[mapped as keyof typeof DotColorMapper];
    //     if (dots) {
    //         return dots.map((dot, index) => <div key={index} className={`${dot ? Style["dot-red"] : Style["dot-blue"]}`}></div>);
    //     }
    //     return null;
    // };

    // const getSubOptionBackgroundName = (choice: string) => {
    //     switch (choice) {
    //         case SeDieBetOptions.WHITE3:
    //         case SeDieBetOptions.RED3:
    //             return "blue3";
    //         case SeDieBetOptions.WHITE4:
    //         case SeDieBetOptions.RED4:
    //             return "red4";
    //         case SeDieBetOptions.RED2:
    //             return "red2";
    //         default:
    //             return choice;
    //     }
    // };
    return (
        <>
            <SedieMultiplayerSubBetOptions tolgeeNamespace={tolgeeNamespace} />
            <div className="flex justify-between my-2">
                <SedieMultiplayerMainOption tolgeeNamespace={tolgeeNamespace} choice={SeDieBetOptions.EVEN} />
                <SedieMultiplayerMainOption tolgeeNamespace={tolgeeNamespace} choice={SeDieBetOptions.ODD} />
                {/* <div className={Style["bet-option-row"]}>{renderMainOption(SeDieBetOptions.ODD)}</div>
                <div className={Style["bet-option-row"]}>{renderMainOption(SeDieBetOptions.EVEN)}</div> */}
            </div>
        </>
    );
};

export default SeDieBetOptionsComponent;
