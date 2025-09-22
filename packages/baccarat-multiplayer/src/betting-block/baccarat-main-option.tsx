import dynamic from "next/dynamic";
import styles from "./baccarat-bet-options.module.scss";
import BaccaratHighlightBetOption from "./baccarat-highlight-bet-option";
const Odds = dynamic(() => import("@shared/components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("@shared/components/game-components/bet-option/own-bet"));
const TotalBet = dynamic(() => import("@shared/components/game-components/bet-option/total-bet"));
const RippleButton = dynamic(() => import("@shared/components/game-components/bet-option/ripple-button"));
const BetChoice = dynamic(() => import("@shared/components/game-components/bet-option/bet-choice"));
const ChipEffect = dynamic(() => import("@shared/components/game-components/bet-option/chip-effect"));

export const BaccaratMainOption = ({ tolgeeNamespace, choice }: { tolgeeNamespace: string; choice: string }) => {
    const buttonId = `${tolgeeNamespace}-choice-${choice}`;

    const themeClass = choice === "player" ? styles.playerTheme : styles.bankerTheme;
    const shadowClass = choice === "player" ? styles.playerShadow : styles.bankerShadow;
    const textColorClass = choice === "player" ? "text-[#15B9FF]" : "text-[#FF262A]";
    const positionClass = choice === "player" ? "self-start" : "self-end";

    const getShapeClass = () => {
        if (choice === "player") {
            return styles["playerShape"];
        }
        if (choice === "banker") {
            return styles["bankerShape"];
        }
        return "";
    };

    const shapeClass = getShapeClass();

    return (
        <div className="relative">
            {shadowClass && <div className={shadowClass}></div>}

            <div className={`text-white relative w-[183px] h-[169px] md:w-[220px] md:h-[169px] flex flex-col ${themeClass}`}>
                <div className={`w-32 md:w-[148px] ${positionClass}`}>
                    <TotalBet choice={choice} className={"h-10 flex items-center justify-center"} tolgeeNamespace={tolgeeNamespace} />
                </div>
                <div className={`w-32 md:w-[148px] h-[107px] flex flex-col justify-center ${positionClass}`}>
                    <BetChoice tolgeeNamespace={tolgeeNamespace} choice={choice} className={`${textColorClass} text-xl md:text-2xl font-semibold`} />
                    <Odds choice={choice} tolgeeNamespace={tolgeeNamespace} isFormatOddsAuto={true} className={"text-lg font-light"} />
                </div>
                <div className={`w-32 md:w-[148px] ${positionClass} pb-4 absolute bottom-0`}>
                    <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} className="text-lg leading-none font-medium" />
                </div>
            </div>

            <div className={`${styles["clickableShape"]} ${shapeClass}`}>
                <RippleButton className={`${styles["btnRipple"]}`} id={buttonId} choice={choice} />
            </div>
            <ChipEffect choice={choice} />
            <BaccaratHighlightBetOption choice={choice} />
        </div>
    );
};

export default BaccaratMainOption;