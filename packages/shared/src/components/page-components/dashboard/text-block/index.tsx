import React from "react";

import Styles from "./text-block.module.scss";

const TextBlock: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    return <div className={Styles["welcome"]}>{children}</div>;
};

export default TextBlock;
