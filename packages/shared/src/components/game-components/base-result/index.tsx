import React, { useEffect, useState } from "react";

export const HidingAnimationTimeInSecond = 0.5;

const BaseResult: React.FC<{ showResultTimeInSecond: number; children: React.ReactNode }> = ({ children, showResultTimeInSecond }) => {
    const [isHidingResult, setHidingResult] = useState(false);

    useEffect(() => {
        const hidingResultTimeOut = setTimeout(() => {
            setHidingResult(true);
        }, (showResultTimeInSecond - HidingAnimationTimeInSecond) * 1000);

        return () => {
            clearTimeout(hidingResultTimeOut);
        };
    }, []);

    return <div className={isHidingResult ? "hide-result-animation" : ""}>{children}</div>;
};

export default BaseResult;
