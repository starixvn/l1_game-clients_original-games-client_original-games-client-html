import dynamic from "next/dynamic";
import styles from "./baccarat-bet-options.module.scss";
const Odds = dynamic(() => import("@shared/components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("@shared/components/game-components/bet-option/own-bet"));
const TotalBet = dynamic(() => import("@shared/components/game-components/bet-option/total-bet"));
const RippleButton = dynamic(() => import("@shared/components/game-components/bet-option/ripple-button"));
const BetChoice = dynamic(() => import("@shared/components/game-components/bet-option/bet-choice"));
const ChipEffect = dynamic(() => import("@shared/components/game-components/bet-option/chip-effect"));
import BaccaratHighlightBetOption from "./baccarat-highlight-bet-option";

export const BaccaratMainOption = ({ tolgeeNamespace, choice }: { tolgeeNamespace: string; choice: string }) => {
    const buttonId = `${tolgeeNamespace}-choice-${choice}`;

    const themeClass =
        choice === "PLAYER" ? styles.playerTheme : choice === "BANKER" ? styles.bankerTheme : styles.tieTheme;

    return (
        <div className="relative">
            <div className={`text-white relative w-[180px] h-[138px] flex flex-col justify-around ${styles["mainOptionBase"]} ${themeClass} md:w-[229px]`}>
                <TotalBet choice={choice} className={"h-6 pt-1 flex items-center justify-center"} tolgeeNamespace={tolgeeNamespace} />
                <div>
                    <BetChoice tolgeeNamespace={tolgeeNamespace} choice={choice} className=" text-xl font-bold" />
                    <Odds choice={choice} tolgeeNamespace={tolgeeNamespace} isFormatOddsAuto={true} className={"text-lg"} />
                </div>
                <div className="h-5">
                    <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} />
                </div>

                <RippleButton className={`${styles["btnRipple"]}`} id={buttonId} choice={choice} />
            </div>
            <ChipEffect choice={choice} />
            <BaccaratHighlightBetOption choice={choice} />
        </div>
    );
};

export default BaccaratMainOption;


