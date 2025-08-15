import { FC } from "react";

import SmallBall from "../../../components/game-components/small-ball";
import Styles from "../history/history.module.scss";

const SedieMultiplayerBetLogResultCell: FC<{ result?: { balls?: number[] } | Record<string, boolean> | null }> = ({ result }) => {
    const balls = Array.isArray(result?.balls) ? result.balls : [];

    const activeKeys: string[] = !balls.length && result && typeof result === "object"
        ? Object.keys(result).filter((k) => (result as Record<string, boolean>)[k])
        : [];

    if (balls.length === 0 && activeKeys.length === 0) {
        return (
            <div className={Styles["result-container"]}>
                <span aria-label="no result">—</span>
            </div>
        );
    }

    return (
        <div className={Styles["result-container"]}>
            {balls.length > 0
                ? balls.map((ball, index) => <SmallBall number={ball} key={index} />)
                : activeKeys.map((key, index) => <span key={index} className="font-text">{key}</span>)}
        </div>
    );
};

export default SedieMultiplayerBetLogResultCell;


