import React from "react";

import Styles from "./user-bet-stats.module.scss";

const UserBetStats = ({ value }) => {
    return (
        <div className={Styles["statistic-user-bet"]}>
            <span className={`icon-user-group ${Styles["user-group"]}`}></span>
            <span className={Styles["number"]}>{value ?? 0}%</span>
        </div>
    );
};

export default UserBetStats;
