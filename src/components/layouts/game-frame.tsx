import styles from "./game-frame.module.scss";

export const GameFrame = ({
    roundHistory,
    countDownTimer,
    betOptions,
    gameObject,
}: {
    roundHistory: React.JSX.Element;
    countDownTimer: React.JSX.Element;
    betOptions: React.JSX.Element;
    gameObject: React.JSX.Element;
}) => {
    return (
        <div className={styles["game-frame"]}>
            <h3>Game Frame</h3>
            <p>Main game area with interactive elements</p>
            <ul>
                <li>Previous Round</li>
                <li>Game Object</li>
                <li>Bet Options</li>
                <li>Countdown timer</li>
            </ul>
            {roundHistory}
            {gameObject}
            {betOptions}
            {countDownTimer}
        </div>
    );
};
