import React, { memo } from "react";
import Styles from "./card.module.scss";
import { BgCachedImage } from "@shared/components/game-components/cached-image/bg-cached-image";
import { BASE_PATH } from "@shared/constants/base-path";
import { getOperator } from "@shared/helpers/router-helper";
const operatorCardBackMap = {
    "12BET": "-12bet",
    NOVA88: "-nova88",
};
const CardBack: React.FC = () => {
    const operator = getOperator() ?? "";
    const suffix = operatorCardBackMap[operator] ?? "";

    return (
        <BgCachedImage
            pathImage={`${BASE_PATH}/static/images/baccarat/cards/card-back${suffix}.webp`}
            className={`${Styles["card-back"]} ${Styles["card"]}`}
            backgroundSize="100% 100%"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
        >
            <div className={Styles["result"]} data-testid="card-back"></div>
        </BgCachedImage>
    );
};

export default memo(CardBack);
