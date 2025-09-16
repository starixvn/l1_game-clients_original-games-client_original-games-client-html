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

    const themeClass =
        choice === "player" ? styles.playerTheme : choice === "banker" ? styles.bankerTheme : styles.tieTheme;

    const shadowClass =
        choice === "player" ? styles.playerShadow : choice === "banker" ? styles.bankerShadow : "";

    return (
        <div className="relative">
            {shadowClass && <div className={shadowClass}></div>}
            <div className={`text-white relative w-[183px] h-[169px] md:w-[220px] md:h-[169px] flex flex-col justify-around ${themeClass}`}>
                <TotalBet choice={choice} className={"h-6 pt-1 flex items-center justify-center"} tolgeeNamespace={tolgeeNamespace} />
                <div>
                    <BetChoice tolgeeNamespace={tolgeeNamespace} choice={choice} className=" text-xl font-bold" />
                    <Odds choice={choice} tolgeeNamespace={tolgeeNamespace} isFormatOddsAuto={true} className={"text-lg"} />
                </div>
                <div className="h-5">
                    <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} />
                </div>
            </div>

            <div className={`${styles["clickableShape"]} ${choice === "player" ? styles["playerShape"] : choice === "banker" ? styles["bankerShape"] : ""}`}>
                <RippleButton className={`${styles["btnRipple"]}`} id={buttonId} choice={choice} />
            </div>
            <ChipEffect choice={choice} />
            <BaccaratHighlightBetOption choice={choice} />
        </div>
    );
};

export default BaccaratMainOption;