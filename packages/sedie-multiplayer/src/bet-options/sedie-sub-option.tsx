import dynamic from "next/dynamic";
import { SeDieBetOptions } from "../sedie-multiplayer-constants";
import styles from "./style.module.scss";
import Odds from "@shared/components/game-components/bet-option/odds";
import TotalBet from "@shared/components/game-components/bet-option/total-bet";
import RippleButton from "@shared/components/game-components/bet-option/ripple-button";
const OwnBet = dynamic(() => import("@shared/components/game-components/bet-option/own-bet"), { ssr: false });
const HighlightBetOption = dynamic(() => import("./highlight-bet-option"), { ssr: false });
const PrevHighlightBetOption = dynamic(() => import("./highight-prev-round-bet-option"), { ssr: false });
const ChipEffect = dynamic(() => import("@shared/components/game-components/bet-option/chip-effect"), { ssr: false });

const subChoiceImages = {
    [SeDieBetOptions.WHITE4]: [false, false, false, false],
    [SeDieBetOptions.WHITE3]: [true, false, false, false],
    [SeDieBetOptions.RED2]: [true, true, false, false],
    [SeDieBetOptions.RED3]: [true, true, true, false],
    [SeDieBetOptions.RED4]: [true, true, true, true],
};

export const SedieMultiplayerSubBetOptions = ({ tolgeeNamespace }: { tolgeeNamespace: string }) => {
    return (
        <div className={`flex rounded-2xl mt-2 h-[120px] w-[370px] md:w-[465px] ${styles["sub-bet-option"]}`}>
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
                className={`flex flex-wrap items-center justify-center p-2 w-[74px] md:w-[93px] md:px-5 gap-1`}
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
            <div className={`flex-1 text-white relative h-[120px] w-[74px] md:w-[93px] ${styles[className]}`}>
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
            <PrevHighlightBetOption choice={choice} />
        </div>
    );
};
