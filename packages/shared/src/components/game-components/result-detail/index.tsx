import React, { useEffect, useState } from "react";

import Styles from "./result-detail.module.scss";

export const HidingAnimationDurationInSecond = 0.5;

const ResultDetail: React.FC<{ renderSettlementInfo: Function; timeToShowInSecond: number }> = (props) => {
    const [bindHideAnimationClass, setBindHideAnimationClass] = useState(false);

    useEffect(() => {
        const timeOut = setTimeout(() => {
            setBindHideAnimationClass(true);
        }, (props.timeToShowInSecond - HidingAnimationDurationInSecond) * 1000);

        return () => {
            clearTimeout(timeOut);
        };
    }, []);

    return (
        <div className={`${Styles["result-detail-container"]} ${bindHideAnimationClass ? Styles["hide-result-animation"] : ""}`}>
            {props.renderSettlementInfo()}
        </div>
    );
};

export default ResultDetail;
