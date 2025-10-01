import React from "react";
import Styles from "./card.module.scss";
import { BgCachedImage } from "@shared/components/game-components/cached-image/bg-cached-image";
import { buildVersion } from "@shared/constants";

const CardBack: React.FC = () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    return (
        <div className={Styles["card"]}>
            <BgCachedImage
                pathImage={`${basePath}/static/images/baccarat/cards/card-back.webp?v=${buildVersion}`}
                className={Styles["card-back"]}
                backgroundSize="100% 100%"
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
            >
                <div className={Styles["result"]} data-testid="card-back">
                </div>
            </BgCachedImage>
        </div>
    );
};

export default CardBack;
