import React from "react";

import { useLowPerformanceDevice } from '@shared/merged/_shared/react-hooks';
import Styles from "./percentage-circle.module.scss";

const cleanPercentage = (percentage: number) => {
    const tooLow = !Number.isFinite(+percentage) || percentage < 0;
    const tooHigh = percentage > 100;
    if (tooLow) {
        return 0;
    }
    return tooHigh ? 100 : +percentage;
};

const Circle: React.FC<{ pct: number; color: string }> = ({ pct, color }) => {
    const r = 15;
    const circ = 2 * Math.PI * r;
    const strokePct = ((100 - pct) * circ) / 100;
    const isLowPerformanceDevice = useLowPerformanceDevice();
    return (
        <circle
            className={isLowPerformanceDevice ? "" : Styles["circle"]}
            r={r}
            cx={16}
            cy={16}
            fill="transparent"
            stroke={strokePct !== circ ? color : ""} // remove color as 0% sets full circumference
            strokeWidth={"2px"}
            strokeDasharray={circ}
            strokeDashoffset={pct ? strokePct : 0}
            strokeLinecap="round"
        ></circle>
    );
};

export const PercentageCircle: React.FC<{
    percentage: number;
    color: string;
}> = ({ percentage, color }) => {
    const pct = cleanPercentage(percentage);
    return (
        <div className={Styles["user-percentage"]}>
            <svg width={32} height={32}>
                <g transform={`rotate(-90 ${"16 16"})`}>
                    <circle r={15} cx={16} cy={16} fill="#00000080"></circle>
                    <Circle pct={pct} color={color} />
                </g>
            </svg>
            <span className={Styles["text-percentage"]}>{`${pct.toFixed(0)}`}%</span>
        </div>
    );
};

export default PercentageCircle;
