import React, { PropsWithChildren } from "react";
import styles from "./game-container.module.scss";
import { isMobile } from "react-device-detect";

const GameContainer: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    return (
        <div className={`${styles["game-container"]} ${isMobile ? "" : styles["desktop"]} ${isMobile ? "pt-[50px] lg:pt-0" : ""} max-w-[1208px] mx-auto`}>
            {children}
        </div>
    );
};

export default GameContainer;
