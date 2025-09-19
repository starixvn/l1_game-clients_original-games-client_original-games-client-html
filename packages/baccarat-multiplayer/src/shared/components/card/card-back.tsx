import React from "react";
import Styles from "./card.module.scss";

const CardBack: React.FC = () => {
    return (
        <div className={`${Styles["card-back"]} ${Styles["card"]}`}>
            <div className={Styles["result"]} data-testid="card-back">
            </div>
        </div>
    );
};

export default CardBack;
