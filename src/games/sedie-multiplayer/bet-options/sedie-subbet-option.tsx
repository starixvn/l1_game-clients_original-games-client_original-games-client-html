import dynamic from "next/dynamic";
import styles from "./style.module.scss";
const Odds = dynamic(() => import("../../../components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("../../../components/game-components/bet-option/own-bet"));
const TotalBet = dynamic(() => import("../../../components/game-components/bet-option/total-bet"));
const RippleButton = dynamic(() => import("../../../components/game-components/bet-option/ripple-button"));

export const SedieMultiplayerSubBetOption = ({ tolgeeNamespace, choice }: { tolgeeNamespace: string; choice: string }) => {
    const renderImages = (choice: string) => {
        return (
            <div className={"flex flex-wrap items-center justify-center p-2"}>
                <div className="col">
                    <div className={`${styles["dot-white"]} mb-1 mr-1`}></div>
                    <div className={`${styles["dot-white"]} `}></div>
                </div>
                <div className="col">
                    <div className={`${styles["dot-white"]} mb-1 mr-1 `}></div>
                    <div className={`${styles["dot-red"]} `}></div>
                </div>
            </div>
        );
    };
    return (
        <div className={"text-white relative bg-blue-500 w-[7.4rem] h-[12rem]"} style={{ "--dot-size": "20px" } as React.CSSProperties}>
            <TotalBet choice={choice} className={"h-[2.4rem] flex items-center justify-center"} tolgeeNamespace={tolgeeNamespace} />
            {renderImages(choice)}
            <div>
                <Odds choice={choice} tolgeeNamespace={tolgeeNamespace} isFormatOddsAuto={true} />
            </div>
            <div>
                <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} className={"own-bet"} />
            </div>
            <RippleButton className={`${"btn-ripple"}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />
        </div>
    );
};
