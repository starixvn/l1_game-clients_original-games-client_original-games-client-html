import React, { PropsWithChildren } from "react";
import styles from "./game-container.module.scss";

const GameContainer: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    return <div className={`${styles["game-container"]} pt-[50px] lg:pt-[66px] max-w-[1208px] mx-auto`}>{children}</div>;
};

export default GameContainer;
