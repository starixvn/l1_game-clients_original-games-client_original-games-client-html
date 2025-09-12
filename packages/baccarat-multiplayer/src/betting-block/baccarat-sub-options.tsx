import dynamic from "next/dynamic";
import styles from "./baccarat-bet-options.module.scss";
const Odds = dynamic(() => import("@shared/components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("@shared/components/game-components/bet-option/own-bet"));
const TotalBet = dynamic(() => import("@shared/components/game-components/bet-option/total-bet"));
const RippleButton = dynamic(() => import("@shared/components/game-components/bet-option/ripple-button"));
const ChipEffect = dynamic(() => import("@shared/components/game-components/bet-option/chip-effect"));
import BaccaratHighlightBetOption from "./baccarat-highlight-bet-option";

const SubBet = ({ tolgeeNamespace, choice }: { tolgeeNamespace: string; choice: string }) => (
    <div className={styles["betOptionBox"]}>
        <div className={`flex-1 text-white relative w-[120px]`}>
            <TotalBet choice={choice} className={"h-6 pt-1 flex items-center justify-center"} tolgeeNamespace={tolgeeNamespace} />
            <Odds choice={choice} tolgeeNamespace={tolgeeNamespace} isFormatOddsAuto={true} />
            <div className="h-5 mb-0.5">
                <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} />
            </div>
            <RippleButton className={`${styles["btnRipple"]}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />
        </div>
        <ChipEffect choice={choice} />
        <BaccaratHighlightBetOption choice={choice} />
    </div>
);

export const BaccaratSubOptions = ({ tolgeeNamespace, choices }: { tolgeeNamespace: string; choices: string[] }) => {
    return (
        <div className={`flex rounded-2xl ${styles["subOptionsRow"]}`}>
            {choices.map((c) => (
                <SubBet key={c} tolgeeNamespace={tolgeeNamespace} choice={c} />
            ))}
        </div>
    );
};

export default BaccaratSubOptions;


