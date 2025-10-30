import React from "react";

import Styles from "./styles.module.scss";

const GameLoading: React.FC = () => {
    const classBorder = "border-radius-7";
    const classSkeletonItem = "skeleton-item";

    return (
        <div className={Styles.container} data-testid="game-loading">
            <div className={Styles.header}>
                <div className={Styles["header-left"]}>
                    <div className={`${Styles[classBorder]} ${Styles[classSkeletonItem]} ${Styles["round-id"]}`} />
                </div>
                <div className={`${Styles[classSkeletonItem]} ${Styles["countdown-timer"]}`} />
                <div className={Styles["header-right"]}>
                    <span className={`${Styles[classSkeletonItem]} ${Styles["pf"]}`} />
                    <span className={`${Styles[classBorder]} ${Styles[classSkeletonItem]} ${Styles["home"]}`} />
                    <span className={`${Styles[classBorder]} ${Styles[classSkeletonItem]} ${Styles["menu"]}`} />
                </div>
            </div>
            <div className={Styles["result-container"]}>
                <div className={`${Styles[classSkeletonItem]} ${Styles["full-size"]}`} />
            </div>

            <div className={Styles["bet-container"]}>
                <div className={`${Styles[classSkeletonItem]} ${Styles["full-size"]}`} />
            </div>

            <div className={Styles["statistic"]}>
                <div className={`${Styles[classSkeletonItem]} ${Styles["border-radius-5"]}`} />
            </div>
            <div className={Styles.scoreboard}>
                <div className={`${Styles[classSkeletonItem]} ${Styles["border-radius-5"]}`} />
            </div>
        </div>
    );
};

export default GameLoading;
