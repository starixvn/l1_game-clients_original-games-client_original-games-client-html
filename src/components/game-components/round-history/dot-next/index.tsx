import React from "react";

import Styles from "./../dot/dot.module.scss";
import { Props } from "./types";

export const MiniItemNext = ({ className = "" }: { className?: string }) => {
    return (
        <div>
            <div className={`${Styles["dot-next"]} ${Styles.blink} ${Styles[className]}`}></div>
        </div>
    );
};

export const ScoreboardItemNext = ({ col, row }: Props) => {
    return (
        <div
            className={`${Styles["dot-next"]} ${Styles["blink"]}`}
            style={{
                gridColumnStart: col.toString(),
                gridRowStart: row.toString(),
            }}
            data-testid="scoreboard-dot-next"
        ></div>
    );
};
