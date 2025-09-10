import React from "react";
import { Props } from "./icon-column";
import Styles from "./board-column.module.scss";

const IconColumn = (props: Props) => {
    return <div className={`${Styles["board-col"]} ${props.isLastColumn ? Styles["last-column"] : ""}`}>{props.children}</div>;
};

export default IconColumn;
