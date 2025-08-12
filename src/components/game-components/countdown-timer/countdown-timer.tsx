import { useEffect, useState } from "react";

import { useGameContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useSNTranslate } from "../../../_shared/react-hooks/use-translator";
import { messageEventType } from "../../game-base/handlers";
import { RoundState } from "../../game-base/type";
import styles from "./countdown-timer.module.scss";
import { BgCachedImage } from "../cached-image/bg-cached-image";

export type Rotation = "clockwise" | "counterclockwise";

export const CountdownTimer = ({ GameStatusProp = GameStatusMap.RoundBaseStatus, className = "" }) => {
    const { roundState } = useGameStateContext();
    const { t } = useSNTranslate();
    const [progress, setProgress] = useState(50);
    const { gameMessageHandler, durations } = useGameContext();
    const [clientRemainingTime, setClientRemainingTime] = useState(0);

    useEffect(() => {
        const { placingBets, lockingBet } = durations;
        const handlerId = gameMessageHandler?.register(messageEventType.CLIENT_REMAINING_TIME, ({ clientRemainingTime }) => {
            setClientRemainingTime(clientRemainingTime);
            setProgress(((clientRemainingTime - lockingBet) / (placingBets - lockingBet)) * 100);
            //     if (clientRemainingTime > placingBets || clientRemainingTime < lockingBet) {
            //     setProgress(-1);
            // } else {
            //     setProgress(((clientRemainingTime - lockingBet) / (placingBets - lockingBet)) * 100);
            // }
        });

        return () => {
            gameMessageHandler?.removeHandler(handlerId);
        };
    }, [gameMessageHandler, durations]);
    return (
        <div className={`w-full ${styles["countdown-timer-container"]} ${className}`}>
            <div className={styles["text"]}>{`Start at ${clientRemainingTime}`}</div>
            {/* {progress >= 0 && progress < 100 && ( */}
            <div className={styles["progress-bar-container-wrapper"]}>
                <div className={`${styles["progress-bar-container"]}`}>
                    <div
                        className={`h-full ${styles["progress-bar"]} ${progress < 100 ? styles["transition"] : ""}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            {/* )} */}
        </div>
    );
    // switch (roundState) {
    //     case RoundState.InRound:
    //         return (
    //             <>
    //                 <SimpleTimerProp clientRemainingTime={clientRemainingTime} />
    //                 <GameStatusProp>
    //                     <div className={styles["start-betting"]}>{t("status_start_bet")}</div>
    //                 </GameStatusProp>
    //             </>
    //         );
    //     case RoundState.LockingBet:
    //         return (
    //             <>
    //                 <SimpleTimerProp clientRemainingTime={clientRemainingTime} />
    //                 <GameStatusProp>
    //                     <div className={styles["no-more-bets"]}>{t("status_stop_bet")}</div>
    //                 </GameStatusProp>
    //             </>
    //         );

    //     case RoundState.DisplayResult:
    //         return (
    //             <>
    //                 <div className={`loader-show-result`}></div>
    //                 <GameStatusProp>
    //                     <div className={styles["open-result"]}>{t("status_result")}</div>
    //                 </GameStatusProp>
    //             </>
    //         );

    //     case RoundState.None:
    //         return <div className={`loader-show-result`}></div>;

    //     default:
    //         return <></>;
    // }
};

// export const SimpleTimer = ({ clientRemainingTime }) => {
//     const { roundState } = useGameStateContext();
//     const [timeLeft, setTimeLeft] = useState(clientRemainingTime);
//     useEffect(() => {
//         if (clientRemainingTime !== timeLeft) {
//             setTimeLeft(clientRemainingTime);
//         }
//     }, [clientRemainingTime, timeLeft]);
//     const bgImage = roundState !== RoundState.InRound ? "blockbet" : "placebet";

//     return timeLeft <= 0 ? (
//         <></>
//     ) : (
//         <div className={styles.timer}>
//             <div className={`${styles["countdown-timer"]} ${roundState !== RoundState.InRound ? styles["lock-bet"] : ""}`}>
//                 <BgCachedImage
//                     pathImage={`/static/images/countdown-timer/countdown-${bgImage}.png`}
//                     className={styles["countdown-timer-background"]}
//                     backgroundSize="3.8rem 3.8rem"
//                     backgroundRepeat="no-repeat"
//                     backgroundPosition="center"
//                 />
//                 <span className={styles["countdown-timer-number"]}>{(timeLeft % 60).toString().padStart(2, "0")}</span>
//             </div>
//         </div>
//     );
// };

export const RoundBaseStatus = ({ children }) => {
    return <div className={`${styles["game-status"]}`}>{children}</div>;
};

export const GameStatusMap = {
    RoundBaseStatus: RoundBaseStatus,
};

export default CountdownTimer;
