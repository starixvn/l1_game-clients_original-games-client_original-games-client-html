import BetChoice from "@shared/components/game-components/bet-option/bet-choice";
import dynamic from "next/dynamic";
import styles from "./baccarat-bet-options.module.scss";
import BaccaratHighlightBetOption from "./baccarat-highlight-bet-option";
const Odds = dynamic(() => import("@shared/components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("@shared/components/game-components/bet-option/own-bet"));
const TotalBet = dynamic(() => import("@shared/components/game-components/bet-option/total-bet"));
const RippleButton = dynamic(() => import("@shared/components/game-components/bet-option/ripple-button"));
const ChipEffect = dynamic(() => import("@shared/components/game-components/bet-option/chip-effect"));

    const SubBet = ({ tolgeeNamespace, choice }: { tolgeeNamespace: string; choice: string }) => {
    const themeClass = choice === "tie" ? styles.tieTheme : choice === "anyPair" ? styles.anyPairTheme : "";
    const heightClass = choice === "anyPair" ? "h-[73px]" : "h-[77px]";
    const widthClass = "w-[106px] md:w-[140px]"; // Responsive width for desktop
    const shapeClass = choice === "tie" ? styles.tieShape : choice === "anyPair" ? styles.anyPairShape : "";
    const shadowClass = choice === "tie" ? styles.tieShadow : choice === "anyPair" ? styles.anyPairShadow : "";

    return (
        <div className={`relative ${widthClass} ${heightClass}`}>
            {shadowClass && <div className={shadowClass}></div>}
            <div className={`flex-1 text-white relative w-full h-full ${themeClass}`}>
                <TotalBet choice={choice} className={"h-6 pt-1 flex items-center justify-center"} tolgeeNamespace={tolgeeNamespace} />
                <Odds choice={choice} tolgeeNamespace={tolgeeNamespace} isFormatOddsAuto={true} />
                <div className="h-5 mb-0.5">
                    <BetChoice tolgeeNamespace={tolgeeNamespace} choice={choice} className=" text-xs" />
                    <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} />
                </div>
            </div>

            <div className={`${styles["clickableShape"]} ${shapeClass}`}>
                <RippleButton className={`${styles["btnRipple"]}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />
            </div>
            <ChipEffect choice={choice} />
            <BaccaratHighlightBetOption choice={choice} />
        </div>
    );
};

export const BaccaratSubOptions = ({ tolgeeNamespace, choices }: { tolgeeNamespace: string; choices: string[] }) => {
    return (
        <div className={`flex rounded-2xl ${styles["subOptionsColumn"]}`}>
            {choices.map((c) => (
                <SubBet key={c} tolgeeNamespace={tolgeeNamespace} choice={c} />
            ))}
        </div>
    );
};

export default BaccaratSubOptions;


