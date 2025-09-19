import React from "react";
import Styles from "./card.module.scss";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const CardBack: React.FC = () => {
    return (
        <div className={`${Styles["card-back"]} ${Styles["card"]}`}>
            <div className={Styles["result"]} data-testid="card-back">
                    src={`${basePath}/static/images/baccarat/cards/card-back.svg`}
            </div>
        </div>
    );
};

export default CardBack;
