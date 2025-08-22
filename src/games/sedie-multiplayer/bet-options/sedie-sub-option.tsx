import dynamic from "next/dynamic";
import { SeDieBetOptions } from "../sedie-multiplayer-constants";
import styles from "./style.module.scss";
const Odds = dynamic(() => import("../../../components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("../../../components/game-components/bet-option/own-bet"));
const TotalBet = dynamic(() => import("../../../components/game-components/bet-option/total-bet"));
const RippleButton = dynamic(() => import("../../../components/game-components/bet-option/ripple-button"));
const HighlightBetOption = dynamic(() => import("./highlight-bet-option"));
const ChipEffect = dynamic(() => import("../../../components/game-components/bet-option/chip-effect"));

const subChoiceImages = {
    [SeDieBetOptions.WHITE4]: [false, false, false, false],
    [SeDieBetOptions.WHITE3]: [true, false, false, false],
    [SeDieBetOptions.RED2]: [true, true, false, false],
    [SeDieBetOptions.RED3]: [true, true, true, false],
    [SeDieBetOptions.RED4]: [true, true, true, true],
};

export const SedieMultiplayerSubBetOptions = ({ tolgeeNamespace }: { tolgeeNamespace: string }) => {
    return (
        <div className={`flex rounded-2xl mt-2 h-[120px] w-[370px] ${styles["sub-bet-option"]}`}>
            <SedieMultiplayerSubBetOption tolgeeNamespace={tolgeeNamespace} choice={SeDieBetOptions.WHITE4} />
            <SedieMultiplayerSubBetOption tolgeeNamespace={tolgeeNamespace} choice={SeDieBetOptions.WHITE3} />
            <SedieMultiplayerSubBetOption tolgeeNamespace={tolgeeNamespace} choice={SeDieBetOptions.RED2} />
            <SedieMultiplayerSubBetOption tolgeeNamespace={tolgeeNamespace} choice={SeDieBetOptions.RED3} />
            <SedieMultiplayerSubBetOption tolgeeNamespace={tolgeeNamespace} choice={SeDieBetOptions.RED4} />
        </div>
    );
};

const SedieMultiplayerSubBetOption = ({ tolgeeNamespace, choice }: { tolgeeNamespace: string; choice: string }) => {
    const className = `sub-bet-${choice}`;
    const renderImages = (choice: string) => {
        return (
            <div
                className={`flex flex-wrap items-center justify-center p-2 w-[74px] gap-1`}
                style={{ "--dot-size": "20px" } as React.CSSProperties}
            >
                {subChoiceImages[choice].map((isRed, index) => (
                    <div key={index} className={`${isRed ? styles["dot-red"] : styles["dot-white"]}`}></div>
                ))}
            </div>
        );
    };
    return (
        <div className="relative">
            <div className={`flex-1 text-white relative h-[full] w-[74px] ${styles[className]}`}>
                <TotalBet choice={choice} className={"h-6 pt-1 flex items-center justify-center"} tolgeeNamespace={tolgeeNamespace} />
                {renderImages(choice)}
                <Odds choice={choice} tolgeeNamespace={tolgeeNamespace} isFormatOddsAuto={true} />
                <div className="h-5 mb-0.5">
                    <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} />
                </div>
                <RippleButton className={`${styles["btn-ripple"]}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />
            </div>
            <ChipEffect choice={choice} />
            <HighlightBetOption choice={choice} />
        </div>
    );
};
