import { useEffect, useState } from "react";

import { useGameContext } from "../../../_shared/react-contexts";
import { useSNTranslate } from "../../../_shared/react-hooks/use-translator";
import { messageEventType } from "../../game-base/handlers";
import { RoundState } from "../../game-base/type";
import styles from "./countdown-timer.module.scss";
import { BgCachedImage } from "../cached-image/bg-cached-image";
import useGameStore from "../../../_shared/stores/game-store/game-store";

export type Rotation = "clockwise" | "counterclockwise";

export const CountdownTimer = ({ className = "" }) => {
    const roundState = useGameStore((state) => state.roundState);
    // const { t } = useSNTranslate();
    const [progress, setProgress] = useState(0);
    const { gameMessageHandler, durations } = useGameContext();
    const [clientRemainingTime, setClientRemainingTime] = useState(0);

    useEffect(() => {
        const { placingBets, lockingBet } = durations;
        const handlerId = gameMessageHandler?.register(messageEventType.CLIENT_REMAINING_TIME, ({ clientRemainingTime }) => {
            setClientRemainingTime(clientRemainingTime - lockingBet);
            const progress = ((clientRemainingTime - lockingBet) / (placingBets - lockingBet)) * 100;
            progress >= 0 && progress <= 100 && setProgress(progress);
        });

        return () => {
            gameMessageHandler?.removeHandler(handlerId);
        };
    }, [gameMessageHandler, durations, roundState]);

    return (
        <div className={`w-full ${styles["countdown-timer-container"]} ${className}`}>
            <div className={styles["text"]}>
                {roundState === RoundState.InRound ? `Start at ${clientRemainingTime}s` : "Waiting for the next round"}
            </div>
            <div className={styles["progress-bar-container-wrapper"]}>
                <div className={`${styles["progress-bar-container"]}`}>
                    <div
                        className={`h-full ${styles["progress-bar"]} ${progress < 100 ? styles["transition"] : ""}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
