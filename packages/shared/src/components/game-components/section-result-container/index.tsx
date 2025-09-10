import React from "react";

import { Props } from "./section-result-container";
import Styles from "./section-result-container.module.scss";

const SectionResultContainer: React.FC<Props> = (props) => {
    return <div className={`${Styles[props.gameName.toLocaleLowerCase()]} ${Styles["section-result-container"]}`}>{props.children}</div>;
};

export default SectionResultContainer;
