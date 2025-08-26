import { useEffect, useState } from "react";

import { useGameContext } from "../../../_shared/react-contexts";
import { messageEventType } from "../../game-base/handlers";
import { RoundState } from "../../game-base/type";
import styles from "./countdown-timer.module.scss";
import useGameStore from "../../../_shared/stores/game-store/game-store";

export type Rotation = "clockwise" | "counterclockwise";

export const CountdownTimer = ({ className = "" }) => {
    const roundState = useGameStore((state) => state.roundState);
    const [progress, setProgress] = useState(0);
    const { gameMessageHandler, durations } = useGameContext();
    const [clientRemainingTime, setClientRemainingTime] = useState(0);
    const [isAnimate, setIsAnimate] = useState(false);

    useEffect(() => {
        const { placingBets, lockingBet } = durations;
        const handlerId = gameMessageHandler?.register(messageEventType.CLIENT_REMAINING_TIME, ({ clientRemainingTime }) => {
            setClientRemainingTime(clientRemainingTime - lockingBet);
            const percentage = ((clientRemainingTime - lockingBet - 1) / (placingBets - lockingBet)) * 100;
            setIsAnimate(progress !== 0);
            percentage >= 0 && percentage <= 100 && setProgress(percentage);
        });

        return () => {
            gameMessageHandler?.removeHandler(handlerId);
        };
    }, [gameMessageHandler, durations, roundState, progress]);

    return (
        <div className={`w-full ${styles["countdown-timer-container"]} ${className}`}>
            <div className={styles["text"]}>
                {roundState === RoundState.InRound ? `Start at ${clientRemainingTime}s` : "Waiting for the next round"}
            </div>
            <div className={styles["progress-bar-container-wrapper"]}>
                <div className={`${styles["progress-bar-container"]}`}>
                    <div
                        className={`h-full ${styles["progress-bar"]} ${isAnimate ? styles["transition"] : ""}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
