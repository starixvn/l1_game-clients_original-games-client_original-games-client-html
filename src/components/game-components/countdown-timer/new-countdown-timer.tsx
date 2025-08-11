import { useState } from "react";
import styles from "./new-countdown-timer.module.scss";

export const CountdownTimer = ({ className }: { className?: string }) => {
    const [progress, setProgress] = useState(50);

    return (
        <div className={`w-full ${className}`}>
            {/* Progress Bar Container */}
            {/* Time Display */}
            <div className={styles["text"]}>Start at 15s</div>
            <div className={`w-full ${styles["countdown-timer"]}`}>
                <div
                    className={`h-full ${styles["progress-bar"]} ${progress < 100 ? styles["transition"] : ""}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
