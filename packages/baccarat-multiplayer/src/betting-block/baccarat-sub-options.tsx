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
    const textColorClass = choice === "tie" ? "text-[#41EE7B]" : "text-white";
    const fontSizeClass = choice === "tie" ? "text-xl" : "text-base";
    const ownBetPositionClass = choice === "anyPair" ? "bottom-[6px]" : "bottom-[11px]";

    return (
        <div className={`relative ${widthClass} ${heightClass}`}>
            {shadowClass && <div className={shadowClass}></div>}

            <div className={`flex-1 text-white relative w-full h-full ${themeClass}`}>
                <div className="h-[55px] flex flex-col justify-top pt-[10px]">
                    <BetChoice tolgeeNamespace={tolgeeNamespace} choice={choice} className={`${textColorClass} ${fontSizeClass} font-semibold leading-none`} />
                    <Odds choice={choice} tolgeeNamespace={tolgeeNamespace} isFormatOddsAuto={true} className="text-base font-light leading-none pt-1" />
                </div>
                <div className={`h-auto absolute translate-x-[-50%] left-1/2 ${ownBetPositionClass}`}>
                    <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} className="text-lg leading-none font-medium" />
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


