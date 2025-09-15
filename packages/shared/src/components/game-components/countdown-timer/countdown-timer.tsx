import { useEffect, useState } from "react";

import { useGameContext } from '@shared/react-contexts';
import { messageEventType } from "../../game-base/handlers";
import { RoundState } from "../../game-base/type";
import styles from "./countdown-timer.module.scss";
import useGameStore from '@shared/stores/game-store/game-store';
import { useCommonTranslate } from '@shared/react-hooks';

export type Rotation = "clockwise" | "counterclockwise";

export const CountdownTimer = ({ className = "" }) => {
    const roundState = useGameStore((state) => state.roundState);
    const [progress, setProgress] = useState(0);
    const { gameMessageHandler, durations } = useGameContext();
    const [clientRemainingTime, setClientRemainingTime] = useState(0);
    const [isAnimate, setIsAnimate] = useState(false);
    const [displayText, setDisplayText] = useState("");
    const { t } = useCommonTranslate();

    const { placingBets, lockingBet } = durations;
    useEffect(() => {
        const handlerId = gameMessageHandler?.register(messageEventType.CLIENT_REMAINING_TIME, ({ clientRemainingTime }) => {
            setClientRemainingTime(calculateClientRemainingTime(clientRemainingTime));
            const percentage = calculatePercentage(clientRemainingTime);
            setIsAnimate(progress !== 0);
            percentage >= 0 && percentage <= 100 && setProgress(percentage);
        });

        return () => {
            gameMessageHandler?.removeHandler(handlerId);
        };
    }, [gameMessageHandler, durations, roundState, progress]);

    const calculateClientRemainingTime = (clientRemainingTime: number) => {
        if (clientRemainingTime - lockingBet <= 0) {
            return clientRemainingTime;
        }
        return clientRemainingTime - lockingBet;
    };

    const calculatePercentage = (clientRemainingTime: number) => {
        if (clientRemainingTime - lockingBet <= 0) {
            return ((1 + lockingBet - clientRemainingTime) * 100) / (lockingBet );
        }
        return ((clientRemainingTime - lockingBet - 1) / (placingBets - lockingBet)) * 100;
    };

    useEffect(() => {
        if (clientRemainingTime > 0) {
            switch (roundState) {
                case RoundState.InRound:
                    setDisplayText(t("start_in", { time: clientRemainingTime }));
                    break;
                case RoundState.LockingBet:
                    setDisplayText(t("lock_bet"));
                    break;
                case RoundState.DisplayResult:
                    setDisplayText(t("waiting_for_the_next_round"));
                    break;
                default:
                    setDisplayText(t("waiting_for_the_next_round"));
            }
        }
    }, [roundState, clientRemainingTime]);

    return (
        <div className={`w-full ${styles["countdown-timer-container"]} ${className}`}>
            <div className={`${roundState === RoundState.LockingBet || roundState === RoundState.DisplayResult ? styles["text-lock-bet"] : styles["text"]}`}>{displayText}</div>
            <div className={styles["progress-bar-container-wrapper"]}>
                <div className={`${styles["progress-bar-container"]}`}>
                    <div
                        className={`h-full ${roundState === RoundState.LockingBet || roundState === RoundState.DisplayResult ? styles["progress-bar-lock-bet"] : styles["progress-bar"]} ${
                            isAnimate ? (roundState === RoundState.LockingBet ? styles["transition-lock-bet"] : styles["transition"]) : ""
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
